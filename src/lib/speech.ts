export const MINIMUM_ANNOUNCEMENT_INTERVAL_MS = 2_500;
export const SPEECH_START_TIMEOUT_MS = 3_000;

export interface SpeechPresentation {
  /* `source-status` describes the source itself. `assessment` describes observed
     heat, and the verifier holds the line that the two are never confused. */
  kind: 'source-status' | 'assessment';
  key: string;
  text: string;
}

interface SpeechControllerOptions {
  speak(text: string): void;
  cancel(): void;
  now(): number;
  schedule(run: () => void, delayMs: number): unknown;
  clear(handle: unknown): void;
  minimumIntervalMs?: number;
}

interface BrowserSpeechScope {
  speechSynthesis?: {
    cancel(): void;
    speak(utterance: BrowserSpeechUtterance): void;
  };
  SpeechSynthesisUtterance?: new (text?: string) => BrowserSpeechUtterance;
  performance?: { now(): number };
  setTimeout?: (run: () => void, delayMs: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
}

interface BrowserSpeechUtterance {
  text: string;
  onstart?: (() => void) | null;
  onerror?: (() => void) | null;
}

interface SpeechDelivery {
  type: 'started' | 'failed';
  text: string;
}

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');

export function formatReplayStatus(
  statusKey: string,
  title: string,
  detail: string,
): SpeechPresentation {
  return {
    kind: 'source-status',
    key: `replay:${statusKey}`,
    text: `Demo replay — not live. ${normalize(title)}. ${normalize(detail)}`,
  };
}

export function formatLivePreviewStatus(
  statusKey: string,
  title: string,
  detail: string,
): SpeechPresentation {
  return {
    kind: 'source-status',
    key: `live-preview:${statusKey}`,
    text: `Live thermal preview — non-radiometric. ${normalize(title)}. ${normalize(detail)}`,
  };
}

export function createSpeechController({
  speak,
  cancel: cancelNative,
  now,
  schedule,
  clear,
  minimumIntervalMs = MINIMUM_ANNOUNCEMENT_INTERVAL_MS,
}: SpeechControllerOptions) {
  let enabled = false;
  let muted = false;
  let latest: SpeechPresentation | null = null;
  let lastSpokenKey: string | null = null;
  let lastSpokenAtMs = Number.NEGATIVE_INFINITY;
  let scheduled: unknown = null;

  const stopOutput = () => {
    if (scheduled !== null) clear(scheduled);
    scheduled = null;
    try {
      cancelNative();
    } catch {
      // Browser speech failure never changes the visible experience.
    }
  };

  const speakNow = (presentation: SpeechPresentation) => {
    scheduled = null;
    if (!enabled || muted || latest?.key !== presentation.key) return;
    try {
      speak(presentation.text);
    } catch {
      return;
    }
    lastSpokenKey = presentation.key;
    lastSpokenAtMs = now();
  };

  const present = (presentation: SpeechPresentation) => {
    latest = presentation;
    if (!enabled || muted) return;
    if (presentation.key === lastSpokenKey) {
      if (scheduled !== null) clear(scheduled);
      scheduled = null;
      return;
    }

    stopOutput();
    const delayMs = Math.max(0, minimumIntervalMs - (now() - lastSpokenAtMs));
    if (delayMs === 0) {
      speakNow(presentation);
      return;
    }
    scheduled = schedule(() => speakNow(presentation), delayMs);
  };

  return {
    present,
    setEnabled(nextEnabled: boolean) {
      if (enabled === nextEnabled) return;
      enabled = nextEnabled;
      if (!enabled) {
        stopOutput();
        lastSpokenKey = null;
        return;
      }
      if (latest) present(latest);
    },
    setMuted(nextMuted: boolean) {
      if (muted === nextMuted) return;
      muted = nextMuted;
      if (muted) stopOutput();
    },
    repeat() {
      if (!enabled || muted || !latest) return false;
      stopOutput();
      speakNow(latest);
      return true;
    },
    cancel() {
      stopOutput();
      latest = null;
      lastSpokenKey = null;
    },
  };
}

export function createBrowserSpeechController(
  scope: BrowserSpeechScope | undefined = typeof window === 'undefined'
    ? undefined
    : window as unknown as BrowserSpeechScope,
  onDelivery?: (delivery: SpeechDelivery) => void,
) {
  const synthesis = scope?.speechSynthesis;
  const Utterance = scope?.SpeechSynthesisUtterance;
  if (
    !synthesis
    || !Utterance
    || !scope?.performance
    || !scope.setTimeout
    || !scope.clearTimeout
  ) return null;

  let generation = 0;
  let deliveryTimeout: unknown = null;
  const clearDeliveryTimeout = () => {
    if (deliveryTimeout !== null) scope.clearTimeout!(deliveryTimeout);
    deliveryTimeout = null;
  };
  return createSpeechController({
    speak: text => {
      const currentGeneration = ++generation;
      let failed = false;
      const reportFailure = () => {
        if (failed || currentGeneration !== generation) return;
        failed = true;
        clearDeliveryTimeout();
        onDelivery?.({ type: 'failed', text });
      };
      try {
        const utterance = new Utterance(text);
        utterance.onstart = () => {
          if (failed || currentGeneration !== generation) return;
          clearDeliveryTimeout();
          onDelivery?.({ type: 'started', text });
        };
        utterance.onerror = reportFailure;
        deliveryTimeout = scope.setTimeout!(reportFailure, SPEECH_START_TIMEOUT_MS);
        synthesis.speak(utterance);
      } catch (error) {
        reportFailure();
        throw error;
      }
    },
    cancel: () => {
      generation += 1;
      clearDeliveryTimeout();
      synthesis.cancel();
    },
    now: () => scope.performance!.now(),
    schedule: (run, delayMs) => scope.setTimeout!(run, delayMs),
    clear: handle => scope.clearTimeout!(handle),
  });
}
