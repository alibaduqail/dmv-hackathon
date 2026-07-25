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
} = speechModule;

class FakeClock {
  nowMs = 0;
  private nextId = 1;
  private readonly tasks = new Map<number, { dueAtMs: number; run: () => void }>();

  readonly now = () => this.nowMs;
  get pendingCount() {
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
  assert(clock.pendingCount === 0, 'Returning to the current status did not clear the stale timer.');
  clock.advance(900);

  assert(spoken.length === 1, 'A stale status was spoken after returning to the current status.');
};

verifySourceFormatting();
verifyLifecycle();
verifyUnavailableSpeech();
verifyReturningToCurrentStatusClearsQueue();
console.log('Speech verification passed: source truth, dedupe, rate limit, cancellation, mute, repeat, and unavailable TTS.');
