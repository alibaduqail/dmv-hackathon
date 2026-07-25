import type {
  ReplayManifest,
  SourceStatus,
  SourceStatusHandler,
  ThermalFrame,
  ThermalFrameHandler,
  ThermalSource,
} from '../types.ts';

export interface ReplayScheduler {
  now(): number;
  set(callback: () => void, delayMs: number): unknown;
  clear(handle: unknown): void;
}

const DEFAULT_SCHEDULER: ReplayScheduler = {
  now: () => Date.now(),
  set: (callback, delayMs) => setTimeout(callback, delayMs),
  clear: handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

const hasReplayProvenance = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  const provenance = value as Record<string, unknown>;
  return provenance.kind === 'simulated-replay'
    && provenance.isLive === false
    && provenance.label === 'Demo replay — not live';
};

export class ReplayThermalSource implements ThermalSource {
  private readonly manifest: ReplayManifest;
  private readonly scheduler: ReplayScheduler;
  private timer: unknown | null = null;
  private frameIndex = 0;
  private frameHandler: ThermalFrameHandler | null = null;
  private statusHandler: SourceStatusHandler | null = null;
  private startedAtMs = 0;
  private currentStatus: SourceStatus = 'idle';

  constructor(manifest: ReplayManifest, scheduler: ReplayScheduler = DEFAULT_SCHEDULER) {
    if (manifest.frames.length === 0) {
      throw new Error('Replay manifest must contain at least one frame.');
    }
    if (!hasReplayProvenance(manifest.provenance)) {
      throw new Error('Replay manifest cannot use live or ambiguous provenance.');
    }
    this.manifest = manifest;
    this.scheduler = scheduler;
  }

  get status(): SourceStatus {
    return this.currentStatus;
  }

  start(onFrame: ThermalFrameHandler, onStatus: SourceStatusHandler): void {
    this.clearTimer();
    this.frameIndex = 0;
    this.frameHandler = onFrame;
    this.statusHandler = onStatus;
    this.startedAtMs = this.scheduler.now();
    this.setStatus('connecting');

    this.timer = this.scheduler.set(() => {
      this.timer = null;
      this.setStatus('streaming');
      this.emitNext();
    }, 0);
  }

  pause(): void {
    if (this.currentStatus !== 'streaming') return;
    this.clearTimer();
    this.setStatus('paused');
  }

  resume(): void {
    if (this.currentStatus !== 'paused') return;
    this.setStatus('streaming');
    this.scheduleNext();
  }

  stop(): void {
    this.clearTimer();
    this.frameIndex = 0;
    this.setStatus('idle');
    this.frameHandler = null;
    this.statusHandler = null;
  }

  private emitNext(): void {
    if (this.currentStatus !== 'streaming' || !this.frameHandler) return;

    const metadata = this.manifest.frames[this.frameIndex];
    const frame: ThermalFrame = {
      ...metadata,
      capturedAtMs: this.startedAtMs + metadata.capturedAtOffsetMs,
      width: this.manifest.width,
      height: this.manifest.height,
      provenance: this.manifest.provenance,
    };

    this.frameIndex += 1;
    this.frameHandler(frame);

    if (this.isStopped()) return;

    if (this.frameIndex >= this.manifest.frames.length) {
      this.setStatus('ended');
      return;
    }

    if (this.currentStatus !== 'streaming') return;
    this.scheduleNext();
  }

  private scheduleNext(): void {
    this.clearTimer();
    this.timer = this.scheduler.set(() => {
      this.timer = null;
      this.emitNext();
    }, this.manifest.intervalMs);
  }

  private setStatus(status: SourceStatus): void {
    this.currentStatus = status;
    this.statusHandler?.(status);
  }

  private clearTimer(): void {
    if (this.timer === null) return;
    this.scheduler.clear(this.timer);
    this.timer = null;
  }

  private isStopped(): boolean {
    return this.currentStatus === 'idle';
  }
}
