export const NEAR_WHITE_CHANNEL_MINIMUM = 248;
export const NEAR_WHITE_CHANNEL_SPREAD_LIMIT = 6;

export interface PaletteCueConfig {
  minimumCoverage: number;
  enterAfterFrames: number;
  exitAfterFrames: number;
}

export const DEFAULT_PALETTE_CUE_CONFIG: Readonly<PaletteCueConfig> = Object.freeze({
  minimumCoverage: 0.01,
  enterAfterFrames: 3,
  exitAfterFrames: 2,
});

export interface PaletteCueFrameAnalysis {
  inputValid: boolean;
  pixelCount: number;
  qualifyingPixelCount: number;
  coverage: number;
  meetsMinimumCoverage: boolean;
}

export type PaletteCueTransition = 'entered' | 'exited' | null;

export interface PaletteCueObservation extends PaletteCueFrameAnalysis {
  cueActive: boolean;
  transition: PaletteCueTransition;
  consecutiveQualifyingFrames: number;
  consecutiveOtherFrames: number;
}

type RgbaBytes = Uint8Array | Uint8ClampedArray;

const assertMinimumCoverage = (minimumCoverage: number): void => {
  if (!Number.isFinite(minimumCoverage) || minimumCoverage <= 0 || minimumCoverage > 1) {
    throw new RangeError('minimumCoverage must be finite and greater than 0 through 1.');
  }
};

const assertFrameCount = (value: number, name: string): void => {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
};

const invalidAnalysis = (): PaletteCueFrameAnalysis => ({
  inputValid: false,
  pixelCount: 0,
  qualifyingPixelCount: 0,
  coverage: 0,
  meetsMinimumCoverage: false,
});

export const analyzePaletteCueFrame = (
  rgba: RgbaBytes,
  minimumCoverage = DEFAULT_PALETTE_CUE_CONFIG.minimumCoverage,
): PaletteCueFrameAnalysis => {
  assertMinimumCoverage(minimumCoverage);

  if (rgba.length === 0 || rgba.length % 4 !== 0) {
    return invalidAnalysis();
  }

  const pixelCount = rgba.length / 4;
  let qualifyingPixelCount = 0;

  for (let index = 0; index < rgba.length; index += 4) {
    const red = rgba[index];
    const green = rgba[index + 1];
    const blue = rgba[index + 2];
    const channelMinimum = Math.min(red, green, blue);
    const channelMaximum = Math.max(red, green, blue);

    if (
      channelMinimum >= NEAR_WHITE_CHANNEL_MINIMUM
      && channelMaximum - channelMinimum <= NEAR_WHITE_CHANNEL_SPREAD_LIMIT
    ) {
      qualifyingPixelCount += 1;
    }
  }

  const coverage = qualifyingPixelCount / pixelCount;

  return {
    inputValid: true,
    pixelCount,
    qualifyingPixelCount,
    coverage,
    meetsMinimumCoverage: coverage >= minimumCoverage,
  };
};

export class PaletteCueDetector {
  readonly config: Readonly<PaletteCueConfig>;

  private currentCueActive = false;
  private qualifyingRun = 0;
  private otherRun = 0;

  constructor(config: Partial<PaletteCueConfig> = {}) {
    const resolvedConfig: PaletteCueConfig = {
      ...DEFAULT_PALETTE_CUE_CONFIG,
      ...config,
    };

    assertMinimumCoverage(resolvedConfig.minimumCoverage);
    assertFrameCount(resolvedConfig.enterAfterFrames, 'enterAfterFrames');
    assertFrameCount(resolvedConfig.exitAfterFrames, 'exitAfterFrames');
    this.config = Object.freeze(resolvedConfig);
  }

  get cueActive(): boolean {
    return this.currentCueActive;
  }

  observe(rgba: RgbaBytes): PaletteCueObservation {
    const analysis = analyzePaletteCueFrame(rgba, this.config.minimumCoverage);
    let transition: PaletteCueTransition = null;

    if (!analysis.inputValid) {
      const wasActive = this.currentCueActive;
      this.reset();
      transition = wasActive ? 'exited' : null;
    } else if (analysis.meetsMinimumCoverage) {
      this.qualifyingRun = Math.min(this.qualifyingRun + 1, this.config.enterAfterFrames);
      this.otherRun = 0;

      if (!this.currentCueActive && this.qualifyingRun >= this.config.enterAfterFrames) {
        this.currentCueActive = true;
        transition = 'entered';
      }
    } else {
      this.otherRun = Math.min(this.otherRun + 1, this.config.exitAfterFrames);
      this.qualifyingRun = 0;

      if (this.currentCueActive && this.otherRun >= this.config.exitAfterFrames) {
        this.currentCueActive = false;
        transition = 'exited';
      }
    }

    return {
      ...analysis,
      cueActive: this.currentCueActive,
      transition,
      consecutiveQualifyingFrames: this.qualifyingRun,
      consecutiveOtherFrames: this.otherRun,
    };
  }

  reset(): void {
    this.currentCueActive = false;
    this.qualifyingRun = 0;
    this.otherRun = 0;
  }
}
