import {
  analyzePaletteCueFrame,
  DEFAULT_PALETTE_CUE_CONFIG,
  NEAR_WHITE_CHANNEL_MINIMUM,
  NEAR_WHITE_CHANNEL_SPREAD_LIMIT,
  PaletteCueDetector,
} from '../src/lib/palette-cue.ts';

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const pixel = (red: number, green: number, blue: number, alpha = 255): number[] => [
  red,
  green,
  blue,
  alpha,
];

const rgba = (...pixels: number[][]): Uint8ClampedArray =>
  new Uint8ClampedArray(pixels.flat());

const qualifyingPixel = pixel(
  NEAR_WHITE_CHANNEL_MINIMUM,
  NEAR_WHITE_CHANNEL_MINIMUM,
  NEAR_WHITE_CHANNEL_MINIMUM,
);
const otherPixel = pixel(16, 18, 20);

const verifyLockedContract = (): void => {
  assert(NEAR_WHITE_CHANNEL_MINIMUM === 248, 'The locked near-white channel minimum changed.');
  assert(NEAR_WHITE_CHANNEL_SPREAD_LIMIT === 6, 'The locked channel-spread limit changed.');
  assert(DEFAULT_PALETTE_CUE_CONFIG.minimumCoverage === 0.01, 'The locked 1% coverage minimum changed.');
  assert(DEFAULT_PALETTE_CUE_CONFIG.enterAfterFrames === 3, 'The locked three-sample entry rule changed.');
  assert(DEFAULT_PALETTE_CUE_CONFIG.exitAfterFrames === 2, 'The locked two-sample exit rule changed.');
};

const verifyInvalidInput = (): void => {
  for (const input of [new Uint8Array(), new Uint8Array([255, 255, 255])]) {
    const analysis = analyzePaletteCueFrame(input);
    assert(!analysis.inputValid, 'Empty or malformed RGBA input was accepted.');
    assert(analysis.pixelCount === 0, 'Invalid RGBA input reported pixels.');
    assert(analysis.qualifyingPixelCount === 0, 'Invalid RGBA input reported qualifying pixels.');
    assert(Number.isFinite(analysis.coverage) && analysis.coverage === 0, 'Invalid input coverage must be finite zero.');
    assert(!analysis.meetsMinimumCoverage, 'Invalid RGBA input met the minimum area.');
  }
};

const verifyColorAndThresholdBoundaries = (): void => {
  const brightColor = analyzePaletteCueFrame(rgba(pixel(255, 255, 0)), 1);
  assert(brightColor.qualifyingPixelCount === 0, 'A bright colored pixel was treated as near-white.');

  const exactMinimum = analyzePaletteCueFrame(rgba(qualifyingPixel), 1);
  assert(exactMinimum.qualifyingPixelCount === 1, 'The inclusive channel minimum was rejected.');

  const transparentWhite = analyzePaletteCueFrame(rgba(pixel(248, 248, 248, 0)), 1);
  assert(transparentWhite.qualifyingPixelCount === 1, 'Alpha incorrectly changed RGB qualification.');

  const belowMinimum = analyzePaletteCueFrame(
    rgba(pixel(NEAR_WHITE_CHANNEL_MINIMUM - 1, 255, 255)),
    1,
  );
  assert(belowMinimum.qualifyingPixelCount === 0, 'A channel below the fixed minimum was accepted.');

  const exactSpread = analyzePaletteCueFrame(
    rgba(pixel(
      NEAR_WHITE_CHANNEL_MINIMUM,
      NEAR_WHITE_CHANNEL_MINIMUM + NEAR_WHITE_CHANNEL_SPREAD_LIMIT,
      NEAR_WHITE_CHANNEL_MINIMUM,
    )),
    1,
  );
  assert(exactSpread.qualifyingPixelCount === 1, 'The inclusive channel-spread boundary was rejected.');

  const overSpread = analyzePaletteCueFrame(
    rgba(pixel(
      NEAR_WHITE_CHANNEL_MINIMUM,
      NEAR_WHITE_CHANNEL_MINIMUM + NEAR_WHITE_CHANNEL_SPREAD_LIMIT + 1,
      NEAR_WHITE_CHANNEL_MINIMUM,
    )),
    1,
  );
  assert(overSpread.qualifyingPixelCount === 0, 'A pixel beyond the channel-spread limit was accepted.');
};

const verifyDefaultPolicy = (): void => {
  const detector = new PaletteCueDetector();
  const boundaryFrame = rgba(
    pixel(248, 248, 248),
    ...Array.from({ length: 99 }, () => otherPixel),
  );
  const otherFrame = rgba(...Array.from({ length: 100 }, () => otherPixel));

  assert(!detector.observe(boundaryFrame).cueActive, 'Default cue entered after one sample.');
  assert(!detector.observe(boundaryFrame).cueActive, 'Default cue entered after two samples.');
  const entered = detector.observe(boundaryFrame);
  assert(
    entered.coverage === 0.01 && entered.cueActive && entered.transition === 'entered',
    'Default cue did not enter at the locked 1% / three-sample boundary.',
  );

  assert(detector.observe(otherFrame).cueActive, 'Default cue exited after one other sample.');
  const exited = detector.observe(otherFrame);
  assert(
    !exited.cueActive && exited.transition === 'exited',
    'Default cue did not exit at the locked two-sample boundary.',
  );
};

const verifyMinimumArea = (): void => {
  const below = analyzePaletteCueFrame(
    rgba(qualifyingPixel, otherPixel, otherPixel, otherPixel),
    0.5,
  );
  assert(below.coverage === 0.25, 'Coverage did not match the qualifying pixel ratio.');
  assert(!below.meetsMinimumCoverage, 'Coverage below the minimum area was accepted.');

  const boundary = analyzePaletteCueFrame(
    rgba(qualifyingPixel, qualifyingPixel, otherPixel, otherPixel),
    0.5,
  );
  assert(boundary.coverage === 0.5, 'Boundary coverage was not computed exactly.');
  assert(boundary.meetsMinimumCoverage, 'The inclusive minimum-area boundary was rejected.');
};

const verifyEntryAndExitPersistence = (): void => {
  const detector = new PaletteCueDetector({
    minimumCoverage: 0.5,
    enterAfterFrames: 3,
    exitAfterFrames: 2,
  });
  const matching = rgba(qualifyingPixel, otherPixel);
  const other = rgba(otherPixel, otherPixel);

  assert(!detector.observe(matching).cueActive, 'Cue entered after one qualifying frame.');
  assert(!detector.observe(matching).cueActive, 'Cue entered before its persistence boundary.');
  const entered = detector.observe(matching);
  assert(entered.cueActive && entered.transition === 'entered', 'Cue did not enter at its persistence boundary.');

  const firstOther = detector.observe(other);
  assert(firstOther.cueActive && firstOther.transition === null, 'Cue exited after only one other frame.');
  const exited = detector.observe(other);
  assert(!exited.cueActive && exited.transition === 'exited', 'Cue did not exit at its persistence boundary.');
};

const verifyResetAndIsolation = (): void => {
  const config = { minimumCoverage: 1, enterAfterFrames: 1, exitAfterFrames: 1 };
  const first = new PaletteCueDetector(config);
  const second = new PaletteCueDetector(config);
  const matching = rgba(qualifyingPixel);
  const other = rgba(otherPixel);

  assert(first.observe(matching).cueActive, 'First detector did not enter.');
  assert(!second.cueActive, 'Detector instances leaked state.');
  assert(!second.observe(other).cueActive, 'An independent detector inherited active state.');

  first.reset();
  assert(!first.cueActive, 'Reset did not clear active state.');
  const afterReset = first.observe(other);
  assert(
    !afterReset.cueActive
      && afterReset.consecutiveQualifyingFrames === 0
      && afterReset.consecutiveOtherFrames === 1,
    'Reset retained prior persistence state.',
  );

  first.observe(matching);
  const invalidated = first.observe(new Uint8Array());
  assert(!invalidated.cueActive && invalidated.transition === 'exited', 'Invalid input did not clear active state.');
  assert(
    invalidated.consecutiveQualifyingFrames === 0
      && invalidated.consecutiveOtherFrames === 0,
    'Invalid input retained persistence state.',
  );
};

verifyLockedContract();
verifyInvalidInput();
verifyColorAndThresholdBoundaries();
verifyMinimumArea();
verifyEntryAndExitPersistence();
verifyDefaultPolicy();
verifyResetAndIsolation();

console.log('Palette cue verified: RGBA validation, fixed near-white boundaries, coverage, hysteresis, reset, and isolation.');
