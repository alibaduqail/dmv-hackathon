import type {
  LivePreviewSurface,
  PreviewDeviceChoice,
  PreviewDisplaySettings,
  PreviewError,
  PreviewErrorCode,
  PreviewPlaybackSink,
  SourceStatus,
  UvcPreviewObserver,
  UvcPreviewPhase,
  UvcPreviewState,
} from '../types.ts';

type PreviewMediaDevices = Pick<
  MediaDevices,
  'getUserMedia' | 'enumerateDevices' | 'addEventListener' | 'removeEventListener'
>;

type PreviewDocument = Pick<
  Document,
  'visibilityState' | 'addEventListener' | 'removeEventListener'
>;

type PreviewPage = Pick<Window, 'addEventListener' | 'removeEventListener'>;

export interface UvcPreviewDependencies {
  mediaDevices?: PreviewMediaDevices;
  documentTarget: PreviewDocument;
  pageTarget: PreviewPage;
  secureContext: boolean;
  matchesIntendedLabel?: (label: string) => boolean;
}

interface PrivateDeviceChoice {
  deviceId: string;
  label: string;
}

const DEFAULT_STATE: UvcPreviewState = {
  status: 'idle',
  phase: 'authorization-required',
  error: null,
};

const DEFAULT_LABEL_MATCHER = (label: string): boolean => /purethermal/i.test(label);

const stopTracks = (stream: MediaStream | null): void => {
  if (!stream) return;
  for (const track of stream.getTracks()) track.stop();
};

const finitePositive = (value: unknown): number | undefined => (
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
);

const sanitizeSettings = (settings: MediaTrackSettings): PreviewDisplaySettings => {
  const width = finitePositive(settings.width);
  const height = finitePositive(settings.height);
  const frameRate = finitePositive(settings.frameRate);

  return {
    ...(width === undefined ? {} : { width: Math.round(width) }),
    ...(height === undefined ? {} : { height: Math.round(height) }),
    ...(frameRate === undefined ? {} : { frameRate: Math.round(frameRate * 10) / 10 }),
  };
};

const errorCodeFor = (error: unknown): PreviewErrorCode => {
  const name = typeof error === 'object' && error && 'name' in error
    ? String(error.name)
    : '';

  if (name === 'NotAllowedError') return 'permission-denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-matching-device';
  if (name === 'NotReadableError' || name === 'AbortError') return 'device-in-use';
  if (name === 'SecurityError' || name === 'TypeError') return 'unsupported-context';
  return 'preview-unavailable';
};

const retryActionFor = (code: PreviewErrorCode): PreviewError['retryAction'] => (
  code === 'device-in-use' || code === 'playback-failed'
    ? 'start'
    : 'authorize'
);

export class UvcPreviewSource {
  private readonly dependencies: UvcPreviewDependencies;
  private readonly sink: PreviewPlaybackSink;
  private readonly observer: UvcPreviewObserver;
  private readonly deviceChoices = new Map<string, PrivateDeviceChoice>();
  private generation = 0;
  private currentState = DEFAULT_STATE;
  private selectedOptionId: string | null = null;
  private activeStream: MediaStream | null = null;
  private removeLifecycleListeners: (() => void) | null = null;
  private removeTrackListener: (() => void) | null = null;
  private removeDeviceListener: (() => void) | null = null;
  private operation: 'authorize' | 'preview' | null = null;

  constructor(
    dependencies: UvcPreviewDependencies,
    sink: PreviewPlaybackSink,
    observer: UvcPreviewObserver,
  ) {
    this.dependencies = dependencies;
    this.sink = sink;
    this.observer = observer;
  }

  get status(): SourceStatus {
    return this.currentState.status;
  }

  get state(): UvcPreviewState {
    return this.currentState;
  }

  async authorize(): Promise<void> {
    const generation = this.beginOperation('authorize', 'connecting', 'authorizing');
    this.deviceChoices.clear();
    this.selectedOptionId = null;
    this.observer.onDevices([]);

    if (!this.isSupported()) {
      this.fail(generation, 'unsupported-context');
      return;
    }

    let permissionStream: MediaStream | null = null;
    try {
      permissionStream = await this.dependencies.mediaDevices!.getUserMedia({
        video: true,
        audio: false,
      });

      stopTracks(permissionStream);
      permissionStream = null;

      if (!this.isCurrent(generation)) return;

      const devices = await this.dependencies.mediaDevices!.enumerateDevices();
      if (!this.isCurrent(generation)) return;

      const matchingDevices = devices.filter(device => (
        device.kind === 'videoinput'
        && Boolean(device.deviceId)
        && this.matchesIntendedLabel(device.label)
      ));

      if (matchingDevices.length === 0) {
        this.fail(generation, 'no-matching-device');
        return;
      }

      const labels = matchingDevices.map(device => device.label.trim());
      if (new Set(labels).size !== labels.length) {
        this.fail(generation, 'ambiguous-device');
        return;
      }

      const publicChoices = matchingDevices.map((device, index): PreviewDeviceChoice => {
        const optionId = `purethermal-option-${index + 1}`;
        const label = device.label.trim().slice(0, 160);
        this.deviceChoices.set(optionId, { deviceId: device.deviceId, label });
        return { optionId, label };
      });

      this.finishRequestListeners();
      this.operation = null;
      this.observer.onDevices(publicChoices);
      this.setState('idle', 'ready');
    } catch (error) {
      stopTracks(permissionStream);
      if (this.isCurrent(generation)) this.fail(generation, errorCodeFor(error));
    }
  }

  select(optionId: string): boolean {
    if (!this.deviceChoices.has(optionId)) return false;
    this.selectedOptionId = optionId;
    return true;
  }

  async start(): Promise<void> {
    await this.acquireSelected();
  }

  pause(): void {
    if (this.currentState.status !== 'streaming' && this.currentState.status !== 'connecting') {
      return;
    }

    this.invalidateCurrent();
    this.operation = null;
    this.setState('paused', 'paused');
  }

  async resume(): Promise<void> {
    if (this.currentState.status !== 'paused') return;
    await this.acquireSelected();
  }

  async restart(): Promise<void> {
    await this.acquireSelected();
  }

  stop(): void {
    this.invalidateCurrent();
    this.operation = null;
    const phase: UvcPreviewPhase = this.deviceChoices.size > 0
      ? 'ready'
      : 'authorization-required';
    this.setState('idle', phase);
  }

  private async acquireSelected(): Promise<void> {
    const selected = this.selectedOptionId
      ? this.deviceChoices.get(this.selectedOptionId)
      : undefined;

    if (!selected) {
      const generation = this.beginOperation('preview', 'connecting', 'acquiring');
      this.fail(generation, 'no-matching-device');
      return;
    }

    const generation = this.beginOperation('preview', 'connecting', 'acquiring');

    if (!this.isSupported()) {
      this.fail(generation, 'unsupported-context');
      return;
    }

    let stream: MediaStream | null = null;
    let playbackStarted = false;
    try {
      stream = await this.dependencies.mediaDevices!.getUserMedia({
        video: { deviceId: { exact: selected.deviceId } },
        audio: false,
      });

      if (!this.isCurrent(generation)) {
        stopTracks(stream);
        return;
      }

      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length !== 1) {
        stopTracks(stream);
        this.fail(generation, 'preview-unavailable');
        return;
      }

      const track = videoTracks[0];
      const settings = track.getSettings();
      if (!settings.deviceId || settings.deviceId !== selected.deviceId) {
        stopTracks(stream);
        this.fail(generation, 'active-device-mismatch');
        return;
      }

      this.activeStream = stream;
      this.attachTrackListener(generation, track);
      this.attachDeviceListener(generation, selected.deviceId);
      this.setState('connecting', 'awaiting-playback');

      playbackStarted = true;
      await this.sink.play(stream);

      if (!this.isCurrent(generation) || this.activeStream !== stream) {
        this.sink.clear(stream);
        stopTracks(stream);
        return;
      }

      const surface: LivePreviewSurface = {
        kind: 'live-preview',
        stream,
        label: (track.label || selected.label).trim().slice(0, 160),
        settings: sanitizeSettings(settings),
      };

      this.operation = null;
      this.observer.onSurface(surface);
      this.setState('streaming', 'streaming');
    } catch (error) {
      if (!this.isCurrent(generation)) {
        stopTracks(stream);
        return;
      }

      const code = playbackStarted
        ? 'playback-failed'
        : errorCodeFor(error);
      this.fail(generation, code);
    }
  }

  private beginOperation(
    operation: 'authorize' | 'preview',
    status: SourceStatus,
    phase: UvcPreviewPhase,
  ): number {
    this.invalidateCurrent();
    this.operation = operation;
    this.attachLifecycleListeners();
    this.setState(status, phase);
    return this.generation;
  }

  private invalidateCurrent(): void {
    this.generation += 1;
    const stream = this.activeStream;
    this.activeStream = null;
    this.removeTrackListener?.();
    this.removeTrackListener = null;
    this.removeDeviceListener?.();
    this.removeDeviceListener = null;
    this.finishRequestListeners();
    this.sink.clear(stream);
    stopTracks(stream);
    this.observer.onSurface(null);
  }

  private fail(generation: number, code: PreviewErrorCode): void {
    if (!this.isCurrent(generation)) return;
    this.invalidateCurrent();
    this.operation = null;
    this.setState('error', 'error', { code, retryAction: retryActionFor(code) });
  }

  private attachLifecycleListeners(): void {
    const onVisibilityChange = () => {
      if (this.dependencies.documentTarget.visibilityState !== 'hidden') return;

      const operation = this.operation;
      this.invalidateCurrent();
      this.operation = null;

      if (operation === 'authorize') {
        this.setState('error', 'error', {
          code: 'authorization-interrupted',
          retryAction: 'authorize',
        });
        return;
      }

      this.setState('paused', 'paused');
    };

    const onPageHide = () => {
      this.invalidateCurrent();
      this.operation = null;
      const phase: UvcPreviewPhase = this.deviceChoices.size > 0
        ? 'ready'
        : 'authorization-required';
      this.setState('idle', phase);
    };

    this.dependencies.documentTarget.addEventListener('visibilitychange', onVisibilityChange);
    this.dependencies.pageTarget.addEventListener('pagehide', onPageHide);
    this.removeLifecycleListeners = () => {
      this.dependencies.documentTarget.removeEventListener('visibilitychange', onVisibilityChange);
      this.dependencies.pageTarget.removeEventListener('pagehide', onPageHide);
    };
  }

  private attachTrackListener(generation: number, track: MediaStreamTrack): void {
    const onEnded = () => this.fail(generation, 'device-disconnected');
    track.addEventListener('ended', onEnded);
    this.removeTrackListener = () => track.removeEventListener('ended', onEnded);
  }

  private attachDeviceListener(generation: number, selectedDeviceId: string): void {
    const mediaDevices = this.dependencies.mediaDevices!;
    const onDeviceChange = () => {
      void mediaDevices.enumerateDevices().then(devices => {
        if (!this.isCurrent(generation)) return;
        const stillPresent = devices.some(device => (
          device.kind === 'videoinput' && device.deviceId === selectedDeviceId
        ));
        if (!stillPresent) this.fail(generation, 'device-disconnected');
      }).catch(() => {
        if (this.isCurrent(generation)) this.fail(generation, 'device-disconnected');
      });
    };

    mediaDevices.addEventListener('devicechange', onDeviceChange);
    this.removeDeviceListener = () => mediaDevices.removeEventListener('devicechange', onDeviceChange);
  }

  private finishRequestListeners(): void {
    this.removeLifecycleListeners?.();
    this.removeLifecycleListeners = null;
  }

  private setState(
    status: SourceStatus,
    phase: UvcPreviewPhase,
    error: PreviewError | null = null,
  ): void {
    this.currentState = { status, phase, error };
    this.observer.onState(this.currentState);
  }

  private isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  private isSupported(): boolean {
    const mediaDevices = this.dependencies.mediaDevices;
    return this.dependencies.secureContext
      && Boolean(mediaDevices?.getUserMedia)
      && Boolean(mediaDevices?.enumerateDevices);
  }

  private matchesIntendedLabel(label: string): boolean {
    return (this.dependencies.matchesIntendedLabel ?? DEFAULT_LABEL_MATCHER)(label);
  }
}
