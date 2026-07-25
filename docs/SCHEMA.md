# SCHEMA.md — the source contract

**The implemented interface between both builders.** Read this instead of redeclaring a thermal shape. Change a field here and in `src/types.ts` together, announce it, and append the reason to `docs/DECISIONS.md`. Planned hardening and phase gates live in `docs/ARCHITECTURE.md` and `docs/REQUIREMENTS.md`; do not copy a target shape here before code implements it.

There is no database schema in the foundation. All runtime state is local and current frames are ephemeral. The six committed replay PNGs are static simulated fixtures, not user captures.

---

## Source lifecycle

```ts
export type SourceStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'paused'
  | 'ended'
  | 'error';
```

```
idle ──start──> connecting ──ready──> streaming ──complete──> ended
                                         │  ▲
                                      pause resume
                                         ▼  │
                                       paused

any state ──stop──> idle
device/source failure ──> error
```

Rules:

- `start()` is a fresh run: clear pending work, reset sequence position, register callbacks, then emit `connecting`.
- `pause()` is effective only while `streaming`.
- `resume()` is effective only while `paused`.
- `stop()` clears pending work, resets position, emits `idle`, and releases callbacks.
- `ended` means every frame was emitted once in order. Starting again begins at sequence `0`.
- A source failure enters `error` and cannot keep emitting a stale frame.

---

## Provenance

```ts
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
```

| Invariant | Replay | Live |
|---|---|---|
| `kind` | `simulated-replay` | `live-purethermal` |
| `isLive` | `false` | `true` |
| required label | `Demo replay — not live` | explicit connected-device label |

Phase 0 renders the replay manifest label plus an exact overlay string. `live-purethermal` is reserved for a future calibrated radiometric source and is blocked by the Phase 1A result. It must not be reused for Phase 1D’s non-radiometric `MediaStream`.

Phase 1D’s source-generic viewport renders exact source truth rather than deriving copy from a generic live flag. Replay provenance stays visible whenever replay content is visible.

---

## `ThermalFrame`

```ts
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
```

| Field | Rule |
|---|---|
| `id` | Unique within the source run |
| `sequence` | Zero-based and monotonically increasing |
| `capturedAtMs` | Logical capture time in milliseconds; not React receive time |
| `width`, `height` | Positive integers; Lepton 3.5 target is 160 × 120 |
| `displayUrl` | Renderable display image; never reverse-engineered into radiometry |
| `radiometricValuesC` | Optional row-major Celsius grid; when present, length is `width * height` and every value is finite |
| `minC`, `maxC` | Finite source metadata with `maxC >= minC`; a uniform live frame may have equal values |
| `provenance` | Truth about this frame’s source |

Replay frames intentionally omit `radiometricValuesC`. Their `minC` / `maxC` values are simulated fixture metadata and cannot drive a warning or accuracy claim.

The foundation interface intentionally leaves radiometry optional because the live producer does not exist yet. It is therefore not an analysis input type. Before any future radiometric analysis, introduce the discriminated live/replay variants and validated-radiometric boundary specified in `docs/ARCHITECTURE.md`; deterministic analysis must never accept this loose shape directly.

A display-only UVC `MediaStream` is not a `ThermalFrame`. Phase 1D models the viewport as a replay-frame or live-preview union instead of inventing `minC`, `maxC`, `capturedAtMs`, or `radiometricValuesC`.

---

## `ThermalSource`

```ts
export type ThermalFrameHandler = (frame: ThermalFrame) => void;
export type SourceStatusHandler = (status: SourceStatus) => void;

export interface ThermalSource {
  readonly status: SourceStatus;
  start(
    onFrame: ThermalFrameHandler,
    onStatus: SourceStatusHandler,
  ): void;
  pause(): void;
  resume(): void;
  stop(): void;
}
```

Replay delivery uses this interface. `usePreviewSession` now constructs the replay source and composes replay frames versus a display-only stream; `ScanView` renders the resulting session model. A future `PureThermalSource` may enter only after a new calibrated Phase 1A pass.

Callbacks are push-only. The source does not own React state, classification, speech, history, or persistence.

---

## Phase 1D preview contracts

The display-only UVC path is intentionally separate from `ThermalSource`:

```ts
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

export type ViewportSurface =
  | {
      kind: 'replay-frame';
      frame: ThermalFrame;
    }
  | {
      kind: 'live-preview';
      stream: MediaStream;
      label: string;
      settings: PreviewDisplaySettings;
    };
```

Rules:

- `optionId` is a fresh opaque token such as `purethermal-option-1`. It is not the browser’s `deviceId`.
- The raw `deviceId` exists only in `UvcPreviewSource`’s private in-memory map and exact `getUserMedia` constraint.
- Only case-insensitive `PureThermal` labels become public choices. A built-in or generically labelled camera is never a fallback.
- Duplicate matching labels fail as ambiguous instead of exposing identifiers to distinguish them.
- A live surface is published only after exact active-track identity matches and the current `<video>.play()` promise resolves.
- Track readiness is checked after the `ended` listener is attached and again after playback resolves; an ended track cannot publish a surface.
- `PreviewDisplaySettings` copies only positive finite width, height, and frame rate. It never retains or exposes the browser’s settings object, `deviceId`, or `groupId`.
- A live surface has no replay provenance, timestamp, sequence, temperature metadata, or radiometric values.

### Preview state and errors

```ts
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
```

`PreviewError.code` is one of:

```text
unsupported-context
permission-denied
no-matching-device
ambiguous-device
device-in-use
active-device-mismatch
playback-failed
device-disconnected
authorization-interrupted
preview-unavailable
```

UI copy is fixed by code rather than forwarding raw browser exceptions. Every error selects an explicit retry action: `authorize` or `start`.

### Preview lifecycle

`UvcPreviewSource` implements:

```ts
authorize(): Promise<void>
select(optionId: string): boolean
start(): Promise<void>
pause(): void
resume(): Promise<void>
restart(): Promise<void>
stop(): void
```

The source owns a monotonically increasing generation. Every new operation invalidates the prior generation, clears the playback sink, stops active tracks, removes track/device/page listeners, and publishes no stale surface.

```text
authorization-required
  └─ authorize → authorizing → ready | error

ready + explicit selection
  └─ start → acquiring → awaiting-playback → streaming | error

streaming
  ├─ pause → paused             (tracks stopped, element cleared)
  ├─ restart → acquiring        (fresh exact-device request)
  ├─ stop → ready               (selection remains session-only)
  └─ disconnect → error         (tracks stopped, element cleared)

paused
  └─ resume → acquiring         (fresh exact-device request)
```

The authorize/discover stream is never passed to the playback sink and stops before enumeration. `visibilitychange` to hidden stops an authorization or preview request; `pagehide` stops and clears it. Source switch and route/unmount cleanup call the same reusable `stop()` path. `createPreviewPlaybackSink` retains the element it actually attached, so `srcObject` still clears if React has already nulled the public ref during unmount.

---

## Replay manifest

```ts
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
  provenance: Extract<
    ThermalProvenance,
    { kind: 'simulated-replay' }
  >;
  frames: readonly ReplayFrameMetadata[];
}
```

`src/fixtures/replay.ts` exports `emberReplayManifest`.

Locked fixture invariants:

- Exactly six PNG frames.
- Width `160`, height `120`.
- Positive finite `intervalMs`.
- Sequences `0` through `5`, in array order.
- `capturedAtOffsetMs` starts at zero and follows replay order.
- Every `minC` / `maxC` is finite and `maxC > minC`.
- Every asset exists under `public/replay/` and its PNG header reports 160 × 120.
- Provenance label is exactly **“Demo replay — not live”**.
- `provenance.isLive === false`.

`ReplayThermalSource` converts each metadata entry into a `ThermalFrame`:

```ts
capturedAtMs = startedAtMs + capturedAtOffsetMs;
width = manifest.width;
height = manifest.height;
provenance = manifest.provenance;
```

Pausing affects delivery timing, not the fixture’s logical capture offsets.

---

## Future seams — declared, not produced

The foundation exports these shapes so later phases do not smuggle decisions into UI components.

```ts
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
```

Rules:

- Bounds use source-pixel coordinates, not scaled DOM coordinates.
- `Hotspot` and `ThermalAssessment` require real radiometric values; replay produces neither in the foundation.
- `AssessmentLevel` is selected by deterministic analysis only.
- `summary`, `guidance`, and `message` cannot claim touch safety.
- `SafetyAction` is an output action only. No relay, smart plug, or autonomous physical action may be added to this union.
- Speech renders the same assessment visible on screen; it does not create a second assessment.

---

## State that is not stored

`usePreviewSession` keeps the selected source, current replay/live surface, status, opaque device option, and source instances in local runtime state. The raw browser device identity remains private to `UvcPreviewSource`. All of it disappears when the route session is destroyed. `#history` does not persist or fabricate incidents.

Do not add:

- Frame storage.
- Video snapshots or recording.
- Browser device identifiers.
- Browser local storage.
- A database.
- Analytics containing frames or temperatures.
- A cached “last current” assessment after stop, route change, or source error.
