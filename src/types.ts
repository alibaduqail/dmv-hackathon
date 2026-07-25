// Shared contracts for every thermal source and consumer. Import; do not redeclare.

export type SourceStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'paused'
  | 'ended'
  | 'error';

export type ThermalProvenance =
  | {
      kind: 'simulated-replay';
      label: 'Demo replay — not live';
      isLive: false;
    }
  | {
      kind: 'live-purethermal';
      label: string;
      isLive: true;
    };

export interface ThermalFrame {
  id: string;
  sequence: number;
  capturedAtMs: number;
  width: number;
  height: number;
  displayUrl: string;
  radiometricValuesC?: Float32Array;
  minC: number;
  maxC: number;
  provenance: ThermalProvenance;
}

export type ThermalFrameHandler = (frame: ThermalFrame) => void;
export type SourceStatusHandler = (status: SourceStatus) => void;

export interface ThermalSource {
  readonly status: SourceStatus;
  start(onFrame: ThermalFrameHandler, onStatus: SourceStatusHandler): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

export interface ReplayFrameMetadata {
  id: string;
  sequence: number;
  capturedAtOffsetMs: number;
  displayUrl: string;
  minC: number;
  maxC: number;
}

export interface ReplayManifest {
  id: string;
  label: string;
  width: number;
  height: number;
  intervalMs: number;
  provenance: Extract<ThermalProvenance, { kind: 'simulated-replay' }>;
  frames: readonly ReplayFrameMetadata[];
}

export type ScanSourceKind = 'replay' | 'live-preview';

export interface PreviewDeviceChoice {
  optionId: string;
  label: string;
}

export interface PreviewDisplaySettings {
  width?: number;
  height?: number;
  frameRate?: number;
}

export interface ReplayViewportSurface {
  kind: 'replay-frame';
  frame: ThermalFrame;
}

export interface LivePreviewSurface {
  kind: 'live-preview';
  stream: MediaStream;
  label: string;
  settings: PreviewDisplaySettings;
}

export type ViewportSurface = ReplayViewportSurface | LivePreviewSurface;

export type PreviewErrorCode =
  | 'unsupported-context'
  | 'permission-denied'
  | 'no-matching-device'
  | 'ambiguous-device'
  | 'device-in-use'
  | 'active-device-mismatch'
  | 'playback-failed'
  | 'device-disconnected'
  | 'authorization-interrupted'
  | 'preview-unavailable';

export type PreviewRetryAction = 'authorize' | 'start';

export interface PreviewError {
  code: PreviewErrorCode;
  retryAction: PreviewRetryAction;
}

export type UvcPreviewPhase =
  | 'authorization-required'
  | 'authorizing'
  | 'ready'
  | 'acquiring'
  | 'awaiting-playback'
  | 'streaming'
  | 'paused'
  | 'error';

export interface UvcPreviewState {
  status: SourceStatus;
  phase: UvcPreviewPhase;
  error: PreviewError | null;
}

export interface PreviewPlaybackSink {
  play(stream: MediaStream): Promise<void>;
  clear(stream: MediaStream | null): void;
}

export interface UvcPreviewObserver {
  onState(state: UvcPreviewState): void;
  onDevices(devices: readonly PreviewDeviceChoice[]): void;
  onSurface(surface: LivePreviewSurface | null): void;
}

// Future seams. The foundation defines the boundary but does not produce these.
export interface Hotspot {
  id: string;
  frameId: string;
  bounds: { x: number; y: number; width: number; height: number };
  peakC: number;
}

export type AssessmentLevel =
  | 'no-assessment'
  | 'lower-heat-observed'
  | 'elevated-heat-observed'
  | 'higher-heat-observed';

export interface ThermalAssessment {
  frameId: string;
  level: AssessmentLevel;
  summary: string;
  guidance: string;
  hotspots: Hotspot[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'ember';
  text: string;
  createdAtMs: number;
}

export interface SafetyAction {
  id: string;
  type: 'visual-warning' | 'speak';
  message: string;
  createdAtMs: number;
}
