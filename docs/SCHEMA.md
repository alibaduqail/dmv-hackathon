# SCHEMA.md — the source contract

**The interface between both builders.** Read this instead of redeclaring a thermal shape. Change a field here and in `src/types.ts` together, announce it, and append the reason to `docs/DECISIONS.md`.

There is no database schema in the foundation. All state is local and frames are ephemeral.

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

The UI renders `provenance.label`; it does not derive copy from `kind`. Replay provenance stays visible whenever replay content is visible.

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
  provenance: Extract<ThermalProvenance, { kind: 'simulated-replay' }>;
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
| `minC`, `maxC` | Finite source metadata with `maxC > minC` |
| `provenance` | Truth about this frame’s source |

Replay frames intentionally omit `radiometricValuesC`. Their `minC` / `maxC` values are simulated fixture metadata and cannot drive a warning or accuracy claim.

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

The UI depends only on this interface. `ReplayThermalSource` exists now; `PureThermalSource` enters through the same boundary next phase.

Callbacks are push-only. The source does not own React state, classification, speech, history, or persistence.

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
  provenance: ThermalProvenance;
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

Foundation `ScanView` keeps the current frame, source status, and source instance in local runtime state. `#history` does not persist or fabricate incidents.

Do not add:

- Frame storage.
- Browser local storage.
- A database.
- Analytics containing frames or temperatures.
- A cached “last current” assessment after stop, route change, or source error.
