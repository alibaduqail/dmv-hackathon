const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message);
};

const speechModule = await import('../src/lib/speech.ts').catch(() => null);
assert(speechModule, 'Speech module is not implemented.');

const {
  createBrowserSpeechController,
  createSpeechController,
  formatLivePreviewStatus,
  formatReplayStatus,
  MINIMUM_ANNOUNCEMENT_INTERVAL_MS,
  SPEECH_START_TIMEOUT_MS,
} = speechModule;

class FakeClock {
  nowMs = 0;
  private nextId = 1;
  private readonly tasks = new Map<number, { dueAtMs: number; run: () => void }>();

  readonly now = () => this.nowMs;
  pendingCount() {
    return this.tasks.size;
  }

  readonly schedule = (run: () => void, delayMs: number) => {
    const id = this.nextId++;
    this.tasks.set(id, { dueAtMs: this.nowMs + delayMs, run });
    return id;
  };

  readonly clear = (id: unknown) => {
    if (typeof id === 'number') this.tasks.delete(id);
  };

  advance(milliseconds: number): void {
    this.nowMs += milliseconds;
    const due = [...this.tasks.entries()]
      .filter(([, task]) => task.dueAtMs <= this.nowMs)
      .sort(([, left], [, right]) => left.dueAtMs - right.dueAtMs);
    for (const [id, task] of due) {
      this.tasks.delete(id);
      task.run();
    }
  }
}

const verifySourceFormatting = () => {
  const replay = formatReplayStatus(
    'idle',
    'Replay ready',
    'Start the simulated sequence when you are ready.',
  );
  assert(
    replay.text === 'Demo replay — not live. Replay ready. Start the simulated sequence when you are ready.',
    'Replay provenance was not announced as exact source status.',
  );
  assert(replay.kind === 'source-status', 'Replay provenance was mislabelled as an assessment.');

  const preview = formatLivePreviewStatus(
    'ready',
    'Camera choices ready',
    'Choose the intended PureThermal input.',
  );
  assert(
    preview.text.startsWith('Live thermal preview — non-radiometric.'),
    'Live preview speech omitted its non-radiometric source truth.',
  );
  assert(preview.kind === 'source-status', 'Live preview status was mislabelled as an assessment.');
};

const verifyLifecycle = () => {
  const clock = new FakeClock();
  const spoken: string[] = [];
  let cancelCount = 0;
  const controller = createSpeechController({
    speak: (text: string) => spoken.push(text),
    cancel: () => {
      cancelCount += 1;
    },
    now: clock.now,
    schedule: clock.schedule,
    clear: clock.clear,
    minimumIntervalMs: 1_000,
  });
  const replayReady = formatReplayStatus('idle', 'Replay ready', 'Start when ready.');

  controller.present(replayReady);
  assert(spoken.at(0) === undefined, 'Speech played before the user enabled it.');
  assert(!controller.repeat(), 'Repeat succeeded before speech was enabled.');

  controller.setEnabled(true);
  assert(spoken.at(-1) === replayReady.text, 'Enabling speech did not announce current source status.');

  controller.present(replayReady);
  assert(spoken.at(1) === undefined, 'Equivalent source status was announced twice.');

  clock.advance(200);
  const previewReady = formatLivePreviewStatus('ready', 'Camera choices ready', 'Choose an input.');
  controller.present(previewReady);
  const previewError = formatLivePreviewStatus('error', 'Preview unavailable', 'Retry authorization.');
  controller.present(previewError);
  clock.advance(799);
  assert(spoken.length === 1, 'Rate-limited speech played too early.');
  clock.advance(1);
  assert(spoken.at(-1) === previewError.text, 'Replacement did not cancel stale queued speech.');

  controller.setMuted(true);
  const replayRunning = formatReplayStatus('streaming', 'Replay running', 'Simulated frames are advancing.');
  controller.present(replayRunning);
  clock.advance(1_000);
  assert(spoken.at(-1) === previewError.text, 'Muted speech still played.');
  assert(!controller.repeat(), 'Repeat played while muted.');

  controller.setMuted(false);
  assert(controller.repeat(), 'Repeat did not replay the current source status.');
  assert(spoken.at(-1) === replayRunning.text, 'Repeat spoke stale source status.');

  controller.cancel();
  assert(!controller.repeat(), 'Cancelled speech retained repeatable stale state.');
  assert(cancelCount > 0, 'Lifecycle changes never cancelled native speech.');
};

const verifyUnavailableSpeech = () => {
  assert(
    createBrowserSpeechController(undefined) === null,
    'Unavailable browser speech did not fail open.',
  );

  const presentation = formatReplayStatus('idle', 'Replay ready', 'Start when ready.');
  const failingController = createSpeechController({
    speak: () => {
      throw new Error('Synthetic speech failure.');
    },
    cancel: () => {
      throw new Error('Synthetic cancellation failure.');
    },
    now: () => 0,
    schedule: () => 1,
    clear: () => undefined,
  });
  failingController.present(presentation);
  failingController.setEnabled(true);
  failingController.cancel();
};

const verifyReturningToCurrentStatusClearsQueue = () => {
  const clock = new FakeClock();
  const spoken: string[] = [];
  const controller = createSpeechController({
    speak: (text: string) => spoken.push(text),
    cancel: () => undefined,
    now: clock.now,
    schedule: clock.schedule,
    clear: clock.clear,
    minimumIntervalMs: 1_000,
  });
  const replayReady = formatReplayStatus('idle', 'Replay ready', 'Start when ready.');

  controller.present(replayReady);
  controller.setEnabled(true);
  clock.advance(100);
  controller.present(formatReplayStatus('streaming', 'Replay running', 'Frames are advancing.'));
  controller.present(replayReady);
  assert(clock.pendingCount() === 0, 'Returning to the current status did not clear the stale timer.');
  clock.advance(900);

  assert(spoken.length === 1, 'A stale status was spoken after returning to the current status.');
};

const verifyBrowserAdapterAndDefaultInterval = () => {
  class FakeUtterance {
    readonly text: string;
    onstart: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(text = '') {
      this.text = text;
    }
  }

  const clock = new FakeClock();
  const spoken: string[] = [];
  const deliveries: string[] = [];
  let cancelCount = 0;
  const controller = createBrowserSpeechController({
    speechSynthesis: {
      speak: utterance => {
        spoken.push(utterance.text);
        utterance.onstart?.();
      },
      cancel: () => {
        cancelCount += 1;
      },
    },
    SpeechSynthesisUtterance: FakeUtterance,
    performance: { now: clock.now },
    setTimeout: clock.schedule,
    clearTimeout: clock.clear,
  }, delivery => deliveries.push(delivery.type));
  assert(controller, 'Available browser speech did not create a controller.');
  assert(
    MINIMUM_ANNOUNCEMENT_INTERVAL_MS === 2_500,
    'The production announcement interval changed unexpectedly.',
  );
  assert(SPEECH_START_TIMEOUT_MS === 3_000, 'The browser speech start timeout changed unexpectedly.');

  const replayReady = formatReplayStatus('idle', 'Replay ready', 'Start when ready.');
  controller.present(replayReady);
  controller.setEnabled(true);
  assert(spoken.at(-1) === replayReady.text, 'The browser adapter did not speak current status.');
  assert(deliveries.at(-1) === 'started', 'The browser adapter did not report speech start.');

  clock.advance(1);
  const replayRunning = formatReplayStatus('streaming', 'Replay running', 'Frames are advancing.');
  controller.present(replayRunning);
  clock.advance(2_498);
  assert(spoken.length === 1, 'The production interval allowed speech before 2.5 seconds.');
  clock.advance(1);
  assert(spoken.at(-1) === replayRunning.text, 'The production interval did not release at 2.5 seconds.');

  clock.advance(100);
  const replayComplete = formatReplayStatus('complete', 'Replay complete', 'Restart when ready.');
  controller.present(replayComplete);
  assert(clock.pendingCount() === 1, 'The pending cancellation check did not queue speech.');
  controller.setMuted(true);
  assert(clock.pendingCount() === 0, 'Mute did not clear pending speech.');

  controller.setMuted(false);
  controller.present(replayComplete);
  assert(clock.pendingCount() === 1, 'Unmuting did not allow current speech to queue.');
  controller.setEnabled(false);
  assert(clock.pendingCount() === 0, 'Disable did not clear pending speech.');

  controller.setEnabled(true);
  assert(clock.pendingCount() === 1, 'Re-enabling did not restore current source status.');
  controller.cancel();
  assert(clock.pendingCount() === 0, 'Public cancel did not clear pending speech.');
  assert(cancelCount > 0, 'The browser adapter never cancelled native speech.');

  const failures: string[] = [];
  const failingController = createBrowserSpeechController({
    speechSynthesis: {
      speak: utterance => utterance.onerror?.(),
      cancel: () => undefined,
    },
    SpeechSynthesisUtterance: FakeUtterance,
    performance: { now: clock.now },
    setTimeout: clock.schedule,
    clearTimeout: clock.clear,
  }, delivery => failures.push(delivery.type));
  assert(failingController, 'The browser failure adapter did not create a controller.');
  failingController.present(replayReady);
  failingController.setEnabled(true);
  assert(failures.at(-1) === 'failed', 'Browser utterance failure was not reported.');

  const silentClock = new FakeClock();
  const silentFailures: string[] = [];
  const silentController = createBrowserSpeechController({
    speechSynthesis: {
      speak: () => undefined,
      cancel: () => undefined,
    },
    SpeechSynthesisUtterance: FakeUtterance,
    performance: { now: silentClock.now },
    setTimeout: silentClock.schedule,
    clearTimeout: silentClock.clear,
  }, delivery => silentFailures.push(delivery.type));
  assert(silentController, 'The silent browser adapter did not create a controller.');
  silentController.present(replayReady);
  silentController.setEnabled(true);
  silentClock.advance(2_999);
  assert(silentFailures.length === 0, 'Silent speech failed before the start timeout.');
  silentClock.advance(1);
  assert(silentFailures.at(-1) === 'failed', 'Silent speech did not fail at the start timeout.');

  class ThrowingUtterance extends FakeUtterance {
    constructor() {
      super();
      throw new Error('Synthetic utterance construction failure.');
    }
  }

  const constructorFailures: string[] = [];
  const constructorFailureController = createBrowserSpeechController({
    speechSynthesis: {
      speak: () => undefined,
      cancel: () => undefined,
    },
    SpeechSynthesisUtterance: ThrowingUtterance,
    performance: { now: silentClock.now },
    setTimeout: silentClock.schedule,
    clearTimeout: silentClock.clear,
  }, delivery => constructorFailures.push(delivery.type));
  assert(constructorFailureController, 'The constructor-failure adapter did not create a controller.');
  constructorFailureController.present(replayReady);
  constructorFailureController.setEnabled(true);
  assert(
    constructorFailures.at(-1) === 'failed',
    'Utterance construction failure was not reported.',
  );

  const staleClock = new FakeClock();
  const staleUtterances: Array<{
    onstart?: (() => void) | null;
    onerror?: (() => void) | null;
  }> = [];
  const staleDeliveries: string[] = [];
  const staleDeliveryCount = () => staleDeliveries.length;
  const staleController = createBrowserSpeechController({
    speechSynthesis: {
      speak: utterance => staleUtterances.push(utterance),
      cancel: () => undefined,
    },
    SpeechSynthesisUtterance: FakeUtterance,
    performance: { now: staleClock.now },
    setTimeout: staleClock.schedule,
    clearTimeout: staleClock.clear,
  }, delivery => staleDeliveries.push(delivery.type));
  assert(staleController, 'The stale-callback browser adapter did not create a controller.');
  staleController.present(replayReady);
  staleController.setEnabled(true);
  staleController.present(replayRunning);
  staleUtterances[0]?.onstart?.();
  staleUtterances[0]?.onerror?.();
  assert(staleDeliveryCount() === 0, 'A replaced utterance reported stale delivery.');
  staleClock.advance(2_500);
  staleUtterances[1]?.onstart?.();
  assert(staleDeliveries.at(-1) === 'started', 'The current utterance did not report delivery.');
  staleController.cancel();
  staleUtterances[1]?.onerror?.();
  assert(staleDeliveryCount() === 1, 'A cancelled utterance reported stale failure.');
};

verifySourceFormatting();
verifyLifecycle();
verifyUnavailableSpeech();
verifyReturningToCurrentStatusClearsQueue();
verifyBrowserAdapterAndDefaultInterval();
console.log('Speech verification passed: source truth, browser start/error/timeout, 2.5s interval, dedupe, stale cancellation, mute, repeat, and unavailable TTS.');
