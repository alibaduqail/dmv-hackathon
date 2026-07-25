# ARCHITECTURE.md — where Ember decisions belong

Cold start: `docs/STATUS.md`. Atomic requirements: `docs/REQUIREMENTS.md`. Implemented shapes: `docs/SCHEMA.md`. Schedule and owners: `docs/PLAN.md`.

This file owns system boundaries, trust decisions, lifecycle ownership, target modules, and protocol shape. It distinguishes **implemented now** from **planned behind a phase gate**. It is not a second product spec or schedule.

---

## 1. Architectural outcome

Ember has one implemented replay path, one implemented display-only browser path with a blocked attached-device gate, and one blocked future radiometric path:

```text
SIMULATED PATH — implemented

committed PNG manifest
        │
        ▼
ReplayThermalSource
        │ generic frame/status callbacks
        ▼
usePreviewSession
        ├── viewport + exact replay provenance
        ├── source status + controls
        └── “No current assessment”

Replay has no edge into deterministic assessment.
```

```text
DISPLAY-ONLY UVC PATH — implemented; attached-device gate blocked

Lepton 3.5 + PureThermal USB
    │ UVC interfaces observed
    │ intended browser stream still requires operator permission evidence
    ▼
browser MediaDevices/getUserMedia
    │ authorize/discover → operator select → open exact input
    ▼
UvcPreviewSource
    ├── SourceStatus + structured errors
    ├── generation-gated MediaStream
    └── track/listener ownership
    │
    ▼
usePreviewSession
    ├── explicit Replay / Live preview choice
    ├── replay frame OR live MediaStream viewport union
    ├── persistent source truth
    └── “No current assessment”

    ✕ no fabricated ThermalFrame
    ✕ no canvas/snapshot/palette analysis
    ✕ no assessment, warning, or assessment speech
```

```text
RADIOMETRIC ASSESSMENT PATH — future; blocked by Phase 1A result

physical scene
    │ imperfect thermal observation
    ▼
Lepton 3.5 + PureThermal USB
    │ Y16 whose calibration must be proven
    ▼
local native bridge
    ├── capture + calibration/Celsius conversion
    ├── normalized display encoding
    └── no classification
    │ versioned loopback WebSocket
    ▼
PureThermalSource
    ├── protocol validation
    ├── run + sequence gating
    └── temporary display-resource ownership
    │ ThermalSource lifecycle
    ▼
thermal session controller
    ├── source selection + lifecycle
    ├── currentness + stale-callback rejection
    ├── viewport/status snapshot
    └── protocol-decoded live frames
              │
              ▼
deterministic assessment engine
    ├── narrow to validated radiometric input
    ├── pure per-frame region extraction
    ├── deterministic persistence reducer
    └── spatial assessment
              │ structured assessment
              ▼
safety presenter
    ├── visible text + symbol + reinforcing color
    └── later speech using the same canonical copy
```

The Phase 1A and Phase 1D browser-attempt evidence is `docs/HARDWARE-PROBE.md`. The deep native-bridge design remains below so a future calibrated hardware proof has a reviewed target, but no current builder may implement or claim it.

React may know the operator-selected surface, truthful provenance, and whether a live `MediaStream` must be attached to `<video>`. It must not inspect display pixels, know USB/calibration mechanics, or pass a preview into assessment.

---

## 2. Architecture principles

1. **Fail closed.** Missing calibration, malformed data, stale input, replay input, and source failure produce no current assessment.
2. **Separate display from evidence.** `displayUrl` is for the viewport. Only validated calibrated radiometric values can enter analysis.
3. **A stream is not a frame.** A browser `MediaStream` uses a distinct preview surface; never invent `minC`, `maxC`, or radiometric values to fit `ThermalFrame`.
4. **One current run.** A session generation and source run ID prevent an old callback, permission result, media track, timer, socket, expiry, or utterance from affecting a new run.
5. **One decision authority.** Deterministic assessment code selects regions, level, direction, and guidance. Presentation code only formats that result.
6. **Replay is infrastructure, not a counterfeit live mode.** It validates lifecycle and UI while providing a self-contained local fallback that remains visibly simulated.
7. **Local and ephemeral by design.** No cloud tier, API, database, service worker frame cache, analytics, incident persistence, snapshot, or recording exists in the MVP.
8. **Deep modules over scattered rules.** Replay source, UVC preview lifecycle, future bridge framing, future assessment, and future speech each hide their mechanics behind a narrow interface.
9. **No numeric safety policy before evidence.** Threshold, area, persistence, and freshness values remain unset until controlled calibrated hardware observations justify them.

---

## 3. Product and trust boundaries

| Boundary | Trust decision |
|---|---|
| Physical scene → sensor | Thermal observation is imperfect. Reflections, emissivity, distance, angle, calibration, and personal sensitivity prevent touch-safety guarantees. |
| PureThermal UVC → browser preview | Phase 1D may trust the browser only to identify a selected device and display a local stream. RGB-formatted colorized pixels are not temperature or analysis evidence. |
| `UvcPreviewSource` | Owns authorize/discover cleanup, exact session-selected input match, permission-result currentness, `MediaStreamTrack` lifecycle, page-hide/disconnect listeners, and structured preview errors. It cannot create a `ThermalFrame` or assessment. |
| Preview session controller | Owns explicit source choice, generation, replay-frame/live-stream viewport union, status/provenance, element detachment, and cleanup. |
| Firmware/Y16 → bridge | **Blocked future boundary.** Untrusted until exact board, firmware, capture mode, calibration mode, encoding, and orientation are reproduced. Y16 shape alone does not prove Celsius. |
| Native bridge | **Blocked future layer.** Would capture, convert, normalize orientation, and encode display data; it is forbidden from classification and product guidance. |
| Loopback transport | **Blocked future layer.** Treat bytes as untrusted even on localhost. Validate origin, version, type, length, sequence, calibration state, and allocation size. |
| `PureThermalSource` | **Blocked future layer.** Would convert structurally valid protocol messages into decoded radiometric frames and own temporary display resources. |
| Assessment engine | **Blocked future layer.** Owns semantic/calibration/freshness narrowing and classification; no preview pixels can enter it. |
| Source speech | **Implemented source-only layer.** Renders visible operational status/provenance through optional browser speech; receives no frame, stream, or assessment data. |
| Safety presenter and assessment speech | **Blocked future layers.** Render an existing validated assessment and cannot change its decision. |
| Replay | Display/lifecycle fixture only. It is rejected from analysis at the provenance and validation gates. |
| Logs, disk, cloud, agent memory | Outside the runtime frame-data boundary. Live streams, frames, screenshots, recordings, and radiometric arrays may not enter them, except for the reviewed external staged Phase 5 media artifact defined below. |

---

## 4. Layer responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| `UvcPreviewSource` | authorize/discover, `getUserMedia`, exact input match, Start/Pause/Resume/Stop, generation, page-hide handling, track and listener cleanup | Pixel extraction, `ThermalFrame`, temperature, policy, warning, speech, persistence |
| Preview session controller | Explicit source choice, viewport union, current status/provenance, media-element detachment, stale-result rejection | Device heuristics, pixel analysis, fabricated metadata |
| `ThermalSource` adapters | Start/pause/resume/stop, frame delivery, status mapping, source resource cleanup | DOM, policy, speech, history |
| `ScanView` | Render replay `<img>` or live `<video>`, exact provenance/status, and named controller actions | Construct sources, select an arbitrary camera, analyze pixels, retain stale state |
| Source speech controller | Native feature detection, source-status dedupe, 2.5-second minimum interval, mute, repeat, cancellation, and fail-open TTS errors | Frames, streams, assessment decisions, heat guidance, or visual completeness |
| Future native bridge | USB/Y16, calibration interpretation, Celsius conversion, orientation, display encoding, WebSocket framing | UI, thresholds, hotspots, speech, persistence |
| Future bridge client | Handshake, message validation, binary decoding, protocol errors | React state, classification, source selection |
| Future radiometric session | Active source, run identity, frame currentness, assessment expiry, analyzer reset | USB details, binary parsing, threshold implementation |
| Future assessment engine | Semantic validity gate, region extraction, persistence, deterministic selection and spatial mapping | Preview pixels, generated language, DOM, speech, hardware action |
| Future safety presenter | Canonical visible/speech-ready copy and symbol from a structured assessment | Classification, thresholds, arbitrary free-form warnings |
| Future speech renderer | Feature detection, mute, dedupe, rate limit, cancel, repeat | Assessment decisions or visual completeness |
| `#history` | Honest privacy/empty state | Frames, fabricated incidents, automatic persistence |

---

## 5. Relevant repository map

This is a focused architecture map, not a complete listing of every toolchain file.

### Implemented foundation

```text
AGENTS.md                         safety, process, and active-scope source
README.md                         verified public landing and quick start
mvp.md                            product claim and scope

.agents/skills/
  ember-collaboration/
    SKILL.md                      canonical contributor workflow

docs/
  STATUS.md                       current evidence and blockers
  HARDWARE-PROBE.md               Phase 1A privacy-safe no-go evidence
  REQUIREMENTS.md                 atomic phased requirements and acceptance
  ARCHITECTURE.md                 this file
  SCHEMA.md                       implemented TypeScript contracts
  PLAN.md                         schedule, owners, and gates
  DEMO.md                         live and fallback demo acceptance
  SETUP.md                        reproducible local/hardware setup
  COLLABORATION.md                partner claims, lanes, and handoffs
  AGENT-TOOLS.md                  optional contributor tooling
  REFERENCES.md                  primary sources and prior art
  DECISIONS.md                   append-only decisions

public/replay/
  ember-frame-01.png … 06.png    committed simulated fixtures

scripts/
  generate-replay-assets.mjs     deterministic fixture generator
  verify-replay.ts               source-level replay checks
  verify-uvc-preview.ts           fake MediaDevices and cleanup cases
  verify-speech.ts                source speech lifecycle and failure checks

src/
  types.ts                        implemented shared contracts
  App.tsx                         hash route switch and navigation
  fixtures/replay.ts             replay manifest
  lib/thermal-source.ts           ReplayThermalSource
  lib/uvc-preview-source.ts       MediaDevices, private identity, generation, tracks
  lib/speech.ts                   optional source-status speech controller
  features/scan/preview-playback-sink.ts
                                    retained video-element attachment and cleanup
  features/scan/usePreviewSession.ts
                                    replay/live choice and lifecycle composition
  features/scan/ScanView.tsx     accessible replay/live rendering and controls
  features/history/HistoryView.tsx
  styles/tokens.css
```

The Phase 1D shared contract is implemented. A live `MediaStream` is not inserted into `ThermalFrame`; the viewport/session state discriminates replay image from live stream.

### Blocked future additions

```text
native/purethermal-bridge/**      calibrated capture and loopback producer
src/lib/purethermal-source.ts     radiometric live ThermalSource
src/lib/purethermal/**            bridge protocol
src/lib/thermal-assessment.ts     deterministic assessment
src/lib/safety-presentation.ts    assessment formatter
src/lib/speech-renderer.ts        assessment speech
scripts/verify-bridge-protocol.ts
scripts/verify-thermal-assessment.ts
scripts/verify-speech-renderer.ts
```

Do not create blocked files without a new calibrated Phase 1A pass and an updated decision. Keep the existing replay implementation stable; a file move is not required to add Phase 1D.

---

## 6. Implemented replay architecture

`ReplayThermalSource` is a deep module behind `ThermalSource`. It uses one `setTimeout`:

- `start()` cancels old work and begins from frame zero.
- A zero-delay task transitions `connecting → streaming` and emits the first frame.
- Each later frame is scheduled after the manifest interval.
- `pause()` cancels the pending timer without advancing the index.
- `resume()` schedules the next un-emitted frame.
- The sixth frame transitions to `ended` without another timer.
- `stop()` cancels work, resets index, emits `idle`, and releases callbacks.

Phase 1D removed the replay-only composition shortcuts:

- `usePreviewSession` constructs both current sources and exposes one discriminated surface.
- `ScanView` renders the session model and source-specific controls/copy.
- Live cleanup clears the surface as well as status; a source error cannot retain a stale video.

The loose replay `ThermalFrame` shape still permits invalid future source/data combinations. It remains isolated from live preview and may be hardened only with a future calibrated radiometric source.

### What replay verification proves

`npm run verify:replay` currently proves asset signatures/dimensions, manifest metadata/order/provenance, full completion, one pause/resume path, and stop cleanup.

It does not prove restart, route/unmount cleanup, DOM provenance, keyboard behavior, accessible names, target sizing, VoiceOver, 200% zoom, live errors, source switching, or stale-frame invalidation. Those require a new automated check or explicitly recorded manual evidence.

---

## 7. Blocked future radiometric source and frame contracts

This section is retained as reviewed future architecture. It is **not authorized by the current Phase 1A result**.

`docs/SCHEMA.md` remains the truth for code that exists today. A future calibrated Phase 1B must revise it and `src/types.ts` together so invalid source/data combinations do not cross the analysis boundary. Phase 1D added a distinct viewport/session surface for `MediaStream`.

### Frame discrimination

Retain `ThermalFrame` as the public source callback name but make its future variants explicit:

```ts
interface BaseThermalFrame {
  id: string;
  sourceRunId: string;
  sequence: number;
  capturedAtMs: number;            // Unix epoch ms from local bridge
  receivedAtMs: number;            // Unix epoch ms from browser
  receivedAtMonotonicMs: number;   // browser performance clock
  width: 160;
  height: 120;
  displayUrl: string;
  minC: number;
  maxC: number;
}

interface ReplayThermalFrame extends BaseThermalFrame {
  provenance: ReplayProvenance;
  radiometricValuesC?: never;
  calibration?: never;
}

interface LiveRadiometricFrame extends BaseThermalFrame {
  creditId: number;
  provenance: LivePureThermalProvenance;
  radiometricValuesC: Float32Array;
  calibration: CalibrationEvidence;
}

type ThermalFrame = ReplayThermalFrame | LiveRadiometricFrame;

type ValidatedRadiometricFrame = LiveRadiometricFrame & {
  calibration: ValidCalibration;
};
```

If changing the Phase 0 public union is too disruptive during the hardware probe, the validator must at minimum narrow the existing loose frame into an equivalent `ValidatedRadiometricFrame`. `PureThermalSource` validates wire structure and bounds; the assessment engine owns semantic, calibration, and currentness narrowing. Classification never accepts the loose or merely decoded shape.

### Source state and errors

The current status callback carries only `SourceStatus`. Phase 1B should replace or supplement it with one structured state:

```ts
interface SourceState {
  status: SourceStatus;
  sourceRunId: string;
  error?: {
    code: SourceErrorCode;
    message: string;
    recoverable: boolean;
  };
}
```

Minimum stable error codes:

- `bridge-unavailable`
- `protocol-mismatch`
- `device-not-found`
- `radiometry-unavailable`
- `unsupported-frame-format`
- `payload-too-large`
- `invalid-frame`
- `clock-invalid`
- `frame-timeout`
- `device-disconnected`
- `transport-closed`

Error messages are user-safe and contain no frame payload or temperature array.

### Ownership

- The bridge sends display bytes, never an arbitrary URL.
- `PureThermalSource` creates and owns each `blob:` URL.
- It revokes replaced URLs on next frame, stop, error, restart, source switch, and unmount.
- A delivered radiometric buffer is immutable while current.
- Analysis may retain derived hotspot/persistence state, never prior grids.
- Replay assets remain static committed fixtures and are not user-derived data.

### Sequence

- Sequence starts at zero and strictly increases inside one run.
- Gaps are allowed when latest-frame-wins backpressure drops older frames.
- Duplicates and regressions are rejected.
- A gap beyond the policy’s continuity allowance resets persistence.
- Restart creates a new run ID and sequence zero.
- Start and every Resume create a monotonically increasing `creditId` within the run. Live frames and acknowledgements echo it; a pre-pause credit can never update resumed state.
- Both bridge run ID and controller generation must match before state updates.

### Clock domains and currentness

- `capturedAtMs` is Unix epoch milliseconds from the bridge process on the same host.
- `receivedAtMs` is browser `Date.now()` when the complete WebSocket message arrives.
- `receivedAtMonotonicMs` is browser `performance.now()` at the same boundary.
- The `hello` plus `ping`/`pong` handshake estimates bridge/browser wall-clock skew and round-trip time. Phase 1B locks the allowed skew.
- Captured timestamps must not regress within a run. A future timestamp outside allowed skew, a clock rollback, or a capture age outside policy fails closed and resets persistence.
- Warning lifetime, frame-silence timeout, and assessment expiry use the browser monotonic clock, so a wall-clock adjustment cannot extend current guidance.
- Clock and timer functions are injected into verification; deterministic checks never depend on real elapsed wall time.

---

## 8. Blocked future native bridge and protocol

### Hardware probe before language choice

The 2026-07-25 Phase 1A probe did not meet this gate. No bridge language is selected and no native bridge is authorized. `docs/HARDWARE-PROBE.md` records the UVC metadata and missing frame/calibration evidence.

In a future reopened Phase 1A, do not select the bridge language/library until it reproduces:

1. Exact PureThermal board revision.
2. Firmware and USB identity.
3. Sensor enumeration.
4. 160 × 120 Y16 capture.
5. Whether values are calibrated radiometry or raw counts.
6. Active calibration/TLinear mode and Celsius conversion.
7. Image orientation and mirroring.
8. Physical left/right and upper/lower agreement between display and grid.

The bridge normalizes both display pixels and the row-major grid to top-left origin. Directional guidance cannot ship if one is mirrored relative to the other.

Do not commit a captured live frame. The durable proof bundle contains only:

- exact probe commit and command;
- board, firmware, USB/capture mode, host, dimensions, encoding, and byte order;
- authoritative calibration/conversion source and active mode;
- aggregate pixel count, finite count, min/max, and a one-way checksum—never the grid;
- left/right and upper/lower orientation challenge result;
- independent reproduction, or a second-builder checklist review with every field marked pass/fail.

Any missing calibration source, mismatched dimension/count, non-finite aggregate, or failed orientation challenge blocks Phase 1B.

### Default transport

Use a local WebSocket because browsers support bidirectional streaming without an Ember runtime dependency.

```text
endpoint:     ws://127.0.0.1:<locked-port>/v1/thermal
subprotocol:  ember-thermal.v1
override:     VITE_EMBER_BRIDGE_URL
```

Phase 1B locks the port and allowed local application origins. The bridge binds only `127.0.0.1`, never `0.0.0.0`, accepts one client, and rejects unapproved `Origin` values.

### Handshake and controls

Control messages are UTF-8 JSON with a `type`, `protocolVersion`, and `sourceRunId` where applicable:

```text
bridge → client: hello, status, error, pong
client → bridge: start, pause, resume, stop, frame-ack, ping
```

`start`, `resume`, frames, and `frame-ack` carry `creditId`. The acknowledgement also carries `sequence`; the bridge ignores any control whose run or credit is no longer current.

Handshake:

1. WebSocket negotiation must select `ember-thermal.v1`.
2. Bridge sends `hello` with protocol, device, firmware, capture mode, dimensions, orientation, and calibration capability.
3. Client validates it and sends `start` with a newly generated run ID.
4. Bridge echoes that run ID in status, frames, and errors.
5. `start` grants the first `creditId` for one frame. Source reaches `streaming` only after one complete structurally valid frame.

Unknown types, versions, runs, calibration states, or oversized payloads fail closed.

### Atomic frame message

Each frame is one binary WebSocket message:

```text
4-byte unsigned big-endian JSON-header length
UTF-8 JSON header
Float32 little-endian Celsius grid — exactly 19,200 values / 76,800 bytes
PNG display bytes
```

Required JSON header fields:

```text
protocolVersion
sourceRunId
creditId
frameId
sequence
capturedAtMs
width
height
radiometryEncoding       "float32-le-celsius"
radiometryByteLength     76800
displayByteLength
displayMimeType          "image/png"
calibration              reported mode/identity/evidence
orientation              normalized top-left, row-major
reportedMinC
reportedMaxC
```

The bridge enforces the total message ceiling before sending (256 KiB for this fixed MVP) and caps the UTF-8 JSON header at 16 KiB.

Browser parsing is staged after the WebSocket necessarily allocates the received `ArrayBuffer`:

1. Reject total `byteLength` outside the fixed bounds.
2. Create only a four-byte `DataView` to read the header length.
3. Reject a header length above 16 KiB or outside the total message.
4. Decode and validate only the bounded header slice.
5. Verify radiometry/display offsets and lengths exactly cover the remaining message.
6. Only then create the payload-sized Float32 view, display Blob/object URL, or state.

`PureThermalSource` recomputes min/max from the decoded Float32 grid and compares the header’s reported values using one fixed Phase 1B transport-integrity tolerance. It stores the recomputed values on the frame. This tolerance checks serialization integrity; it is not part of `AssessmentPolicy` and cannot classify heat. Do not put frame bytes in URLs, query strings, text errors, or logs.

### Backpressure and frame credit

The browser cannot replace messages already queued inside its WebSocket implementation. Backpressure is explicit:

1. `start` grants the first credit. Every `resume` increments `creditId` and grants one fresh credit.
2. While a frame is in flight, the bridge keeps only the newest device capture and replaces any older unsent capture.
3. After `PureThermalSource` structurally validates the frame and the active session accepts its current run + `creditId`, the client sends `frame-ack` for that run, credit, and sequence.
4. The bridge may then send only its newest retained capture.
5. `pause`, `stop`, error, or run change invalidates the credit and discards retained capture. A late pre-pause frame/ack is rejected even after Resume.

At most one frame is in flight and one newest capture is retained inside the bridge. Sequence gaps are expected evidence of dropped intermediate captures. A missing acknowledgement or valid frame beyond the locked monotonic frame-timeout closes the source, clears current output through the session, and emits `frame-timeout`.

### Public-hosting constraint

The live demo topology is local HTTP plus loopback WebSocket unless the bridge supports local `wss`. A public HTTPS page may block insecure loopback WebSockets. A hosted static deployment can support Replay, but Live always requires the local bridge.

---

## 9. Blocked future radiometric session controller

Phase 1B moves callback wiring and source composition out of `ScanView` into `useThermalSession`.

Conceptual interface:

```ts
type SourceChoice = 'live-purethermal' | 'simulated-replay';

interface ThermalSessionSnapshot {
  sourceChoice: SourceChoice;
  sourceState: SourceState;
  frame: ThermalFrame | null;
  assessment: ThermalAssessment | null;
}

interface ThermalSessionActions {
  selectSource(choice: SourceChoice): void;
  start(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  stop(): void;
}
```

The hook constructs sources through a small composition/factory boundary. `ScanView` receives a snapshot and named actions; it does not import a replay manifest or live bridge client.

On first load and reload, Demo replay is visibly preselected and idle; Start therefore runs Replay. Live opens only after the operator explicitly selects Live and then activates Start. Source choice is not persisted, and a live failure never changes it automatically.

### Generation transaction

Selecting a source or starting a fresh run:

1. Increment controller generation.
2. Call `stop()` on the old source; that source owns socket, listener, buffer, and URL release.
3. Cancel speech.
4. Reset assessment persistence.
5. Cancel the controller-owned assessment-expiry timer and drop frame/assessment references.
6. Clear error copy from the prior run.
7. Construct/select the requested source.
8. Register callbacks that capture the new generation.
9. Ignore any callback whose generation or source run ID is no longer current.

Source selection is always visible. Demo replay is the safe startup default; Live is always an explicit operator choice. Never switch automatically after a live error.

### Lifecycle/currentness matrix

| Event | Frame | Assessment | Persistence | Speech | Source resource |
|---|---|---|---|---|---|
| Start / Restart | Clear until new frame | Clear | Reset | Cancel | Fresh run |
| Pause | May remain visibly marked “paused” | Clear immediately | Reset | Cancel | No buffered backlog |
| Resume | Replace only with fresh frames | None until persistence passes | Fresh | None until current | Reuse documented live connection or fresh delivery |
| Replay `ended` | Last replay frame may remain with provenance | Always none | None | No thermal assessment | Timer complete |
| Stop | Clear | Clear | Reset | Cancel | Close/revoke/release |
| Error/disconnect | Clear before error state | Clear | Reset | Cancel old guidance; error may be announced | Close/revoke/release |
| Source switch | Clear | Clear | Reset | Cancel | Stop old before new |
| Route/unmount | Clear | Clear | Reset | Cancel | Stop/close/revoke |
| Page hidden | Invalidate currentness | Clear | Reset | Cancel | Delivery may pause; resume requires fresh frames |
| Assessment expiry | Keep frame only if the source is still current | Clear by keyed one-shot timer | Reset | Cancel | Source continues only while its frame watchdog is healthy |
| Frame timeout | Clear | Clear | Reset | Cancel old guidance; timeout may be announced | Close/revoke/release |

No non-streaming live state may retain a current assessment.

### Expiry and silent-stream watchdogs

- `PureThermalSource` owns a monotonic frame-timeout watchdog. Start/resume arms it, every structurally accepted frame replaces it, and every lifecycle invalidation cancels it.
- The session controller owns one assessment-expiry timer keyed by controller generation, source run ID, and deterministic assessment ID.
- A new assessment cancels/replaces the prior expiry. Expiry clears only the still-matching assessment, resets persistence, and cancels speech.
- Stop, pause, error, restart, switch, route change, unmount, page hide, or generation mismatch cancels the timer.
- The assessment engine owns no hidden timer; it returns the monotonic validity deadline as data.

---

## 10. Blocked future deterministic assessment engine

Expose one deep module:

```ts
interface ThermalAssessmentEngine {
  process(
    frame: LiveRadiometricFrame,
    nowMonotonicMs: number,
  ): AssessmentUpdate;
  reset(): void;
}
```

Internally, keep calculations reproducible:

```text
validate live provenance + calibration + currentness
    ↓
pure per-frame candidate extraction
    ↓
pure reducer(previous state, candidates, policy)
    ↓
strongest persistent region
    ↓
3 × 3 spatial mapping
    ↓
structured assessment or no-assessment
```

Cross-frame persistence does not make classification nondeterministic. The reducer state is explicit: the same initial state, ordered frames, versioned policy, and injected monotonic clock inputs always produce the same result. Assessment ID derives from run ID + frame ID + rule-set ID; its expiry derives from the frame’s monotonic receive time + the policy lifetime. `reset()` is mandatory at every currentness break.

### `AssessmentPolicy`

The engine accepts one immutable, versioned policy:

```text
ruleSetId
threshold basis and value(s)
active assessment levels
connected-neighbor rule
minimum region area
persistence frame count and matching rule
sequence-gap continuity rule
strongest-region ordering and tie-break
spatial boundary rules
freshness budget
assessment current-lifetime budget
```

No default numeric values are architecturally approved. Lock them from controlled Phase 1 evidence and record the exact policy in `docs/DECISIONS.md`.

For the hackathon, activate only levels supported by evidence. Absence of a current assessment plus one `higher-heat-observed` warning is preferable to unvalidated multi-band severity.

### Algorithm seams

- **Validator:** accepts a transport-checked `LiveRadiometricFrame`, rejects wrong source, run, credit, calibration, dimensions, length, finiteness, sequence, clock, and freshness, and returns `ValidatedRadiometricFrame` only on success. Header/grid extrema consistency is already owned by `PureThermalSource`, not the assessment policy.
- **Candidate extraction:** pure connected-component analysis over a policy-derived mask.
- **Region filter:** pure minimum-area and threshold checks.
- **Persistence reducer:** explicit prior candidates/counts; no hidden globals or timers.
- **Selection:** stable sort and complete tie-break.
- **Spatial mapping:** centroid in source pixels with documented inclusive/exclusive thirds.
- **Output:** one primary assessment or no current assessment.

Never parse the rendered thermal palette back into temperatures.

### Target assessment contract

Before Phase 1C UI integration, add currentness fields absent from the reserved foundation seam:

```ts
interface ThermalAssessment {
  id: string;
  sourceRunId: string;
  frameId: string;
  observedAtMs: number;
  validUntilMonotonicMs: number;
  ruleSetId: string;
  provenance: LivePureThermalProvenance;
  level: Exclude<AssessmentLevel, 'no-assessment'>;
  location: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'upper' | 'middle' | 'lower';
  };
  primaryHotspot: Hotspot;
}
```

No current assessment is represented as `null`, not as a `ThermalAssessment` with a missing hotspot. `Hotspot` must include the data needed for deterministic selection and location, such as area and centroid, rather than forcing the view to derive it from DOM coordinates.

---

## 11. Implemented source speech and blocked assessment speech

The current speech path is deliberately narrower:

```text
visible source status + truthful provenance
        │ formatReplayStatus / formatLivePreviewStatus
        ▼
optional native Web Speech
```

It defaults off, uses semantic source-status keys, enforces a 2.5-second minimum interval, keeps only the latest queued status, and cancels on replacement, route/unmount, hidden/pagehide, mute, or disable. Enable, Mute, and Repeat are visible native buttons. While app speech is enabled it owns routine announcements; an utterance error or three-second start timeout disables it and emits a polite fallback without changing visible status. No replay frame, preview stream/pixel, or `ThermalAssessment` reaches this path.

Future assessment and copy still have one separate path:

```text
ThermalAssessment
        │ pure formatAssessment
        ▼
SafetyPresentation
   ├── summary
   ├── guidance
   ├── symbol
   ├── reinforcing visual tone
   └── speech text
        ├── ScanView
        └── SpeechRenderer
```

The canonical pattern is observable and conservative:

> Higher heat observed in the upper-right area. Keep your hand away and verify another way.

`AgentMessage` and free-form `SafetyAction.message` are reserved foundation seams, not the MVP decision path. Do not let them create parallel warning copy. Phase 2 may replace or narrow them around `SafetyPresentation` after a contract decision.

### Future assessment speech renderer

The implemented source-status controller proves the browser Web Speech boundary without accepting assessment data. A future reopened Phase 2 may extend that boundary only after the assessment contract is current and validated; no new runtime dependency is needed.

```ts
interface SpeechRenderer {
  present(message: SafetyPresentation | SourcePresentation): void;
  setMuted(muted: boolean): void;
  repeat(): void;
  cancel(): void;
}
```

It owns feature detection, semantic deduplication, rate limiting, mute, repeat, voice failure, and `speechSynthesis.cancel()`. It cancels on assessment replacement/expiry, no-assessment, pause, stop, error, source switch, route change, page hide, and mute.

Visible presentation commits first. TTS failure cannot remove or delay text + symbol. Test VoiceOver once with Ember speech muted and once with it enabled so live-region and app speech do not duplicate every update.

---

## 12. Privacy, security, and resource lifecycle

### Data allowed to persist in Git

- Simulated replay PNGs and manifest.
- Generated numeric verification fixtures that are clearly synthetic.
- Source code, protocol schemas, aggregate hardware metadata, commands, finite-count/min/max/checksum summaries, and pass/fail evidence that contains no grid.
- Derived policy values after validation, with rationale and controlled aggregate observations rather than per-frame payloads.

### Data forbidden from persistence by default

- Live display frames.
- Live radiometric arrays.
- Per-frame payloads or radiometric values in logs, analytics, crash reports, URLs, or agent memory.
- Screenshots/recordings containing a live thermal frame, except the reviewed staged-media exception below.
- Incident history or speech transcripts.

### Narrow submission-media exception

Prefer a frame-free live connection/status screenshot. If the submission requires thermal footage, use a staged non-personal scene, document consent/purpose, keep only the selected media artifact, and never record a person. This does not authorize runtime frame storage.

### Resource owners

| Resource | Owner | Release events |
|---|---|---|
| Replay timer/callbacks | `ReplayThermalSource` | stop, restart, unmount |
| Preview `MediaStreamTrack`s and device/page listeners | `UvcPreviewSource` | authorize/discover completion, pause, stop, error, restart, switch, route change, hidden visibility, `pagehide`, unmount, late permission result |
| Preview `video.srcObject` | `createPreviewPlaybackSink` | pause, stop, error, restart, switch, route change, hidden visibility, `pagehide`, unmount; retained element reference survives React ref detachment |
| Preview permission promise/currentness | `UvcPreviewSource` generation | every new action invalidates earlier results; late returned tracks stop immediately |
| Future WebSocket/listeners + frame-timeout watchdog | `PureThermalSource` | pause where applicable, stop, error, restart, switch, unmount |
| Newest retained native capture/in-flight credit | native bridge | ack replacement, pause, stop, error, run change, disconnect |
| Display `blob:` URL | `PureThermalSource` | replacement and every invalidation event |
| Radiometric buffer | `PureThermalSource`; session borrows current read-only reference | replacement and every invalidation event |
| Persistence reducer state | assessment engine | pause, gap, stop, error, restart, switch, route, hide |
| Assessment-expiry timer | session controller | replacement, expiry, pause, stop, error, restart, switch, route, hide |
| Speech queue/current utterance | speech renderer | assessment/currentness and lifecycle changes |

---

## 13. Runtime and deployment topology

### Foundation/replay

```text
browser ← local Vite or production static assets
```

### Phase 1D display-only demo

```text
PureThermal USB
      ↓ colorized UVC
browser MediaDevices
      ↓ MediaStream
local <video> viewport

      ✕ no assessment path
```

There is no cloud service, database, authentication system, model endpoint, or frame store.

Use one local web process:

1. Start the local production-like web build.
2. Open `#scan`.
3. Select Live preview deliberately.
4. Grant camera permission.
5. Confirm the browser-reported selected input before status becomes streaming.

The exact browser preflight is in `docs/SETUP.md`. There is no native bridge command for the current build.

### Future radiometric demo — blocked

```text
PureThermal USB
      ↕
native bridge on 127.0.0.1
      ↕ versioned WebSocket
browser served locally
```

This topology may return only after a new calibrated Phase 1A pass.

---

## 14. Verification architecture

Keep verification dependency-free and proportionate:

| Check | Owns |
|---|---|
| current `verify:replay` | Manifest/assets, order/provenance, completion, one pause/resume path, stop cleanup |
| planned replay-verifier extension | Emitted runtime-frame mapping and repeated start/restart |
| current `verify:preview` | Replay camera isolation, fake MediaDevices, authorize/discover cleanup, opaque/exact-device selection, playback gate, already-ended and during-playback track races, late permission resolution, pause/reacquire, restart, disconnect/devicechange, the reusable `stop()`/generation boundary, hidden/pagehide handling, detached playback-sink cleanup, error mapping, and track/listener cleanup; it does not execute the React source-switch or router |
| future bridge protocol verifier | Handshake, frame length/encoding, origin/version/error fixtures, credit/ack backpressure, timeout, sequence/run rejection, size ceiling, and resource-release spies |
| future assessment verifier | Validator, clocks, connected regions, persistence/reset, expiry callback, boundaries, tie-break, replay/stale rejection, deterministic output |
| current `verify:speech` | Source provenance/status formatting, dedupe, minimum interval, stale replacement, cancellation, mute, repeat, and unavailable/throwing synthesizer |
| future assessment-speech verifier | Canonical assessment formatter parity and assessment-currentness cancellation |
| lint + build | Static integration and production compilation |
| manual QA record | Hash reload, keyboard/focus/target size, VoiceOver, live regions, 200% zoom, narrow reflow, exact selected device, permission denial, camera indicator/track cleanup, device unplug, offline run |

Synthetic numeric assessment fixtures must be generated in code and clearly labelled. They are not the six replay PNGs and never appear as a live demo result.

---

## 15. Phase-oriented implementation order

### Phase 0 — implemented

- Keep replay source, manifest, accessible shell, truthful history, and checks stable.
- Correct documentation/code drift without implying future features exist.

### Phase 1A — investigation complete; calibrated gate blocked

- `docs/HARDWARE-PROBE.md` records USB/UVC presence and every missing radiometric field.
- No Y16, calibration, orientation, temperature, warning, or threshold is claimed.
- Phase 1B, Phase 1C, and assessment speech remain blocked.

### Phase 1D — implementation complete; hardware exit gate blocked

- The replay-frame/live-`MediaStream` union, `UvcPreviewSource`, explicit authorize/select flow, playback sink, exact-device verification, generation gate, page/track cleanup, fixed errors, and focused verifier are implemented.
- Exact non-radiometric provenance and **“No current assessment”** persist throughout the Live-preview surface.
- The in-app browser reached a pending camera-permission request, but its permission surface could not be presented. Ember logically invalidated that generation and would stop any late stream; no intended-device label, stream settings, playback, or camera-indicator closure was captured.
- Replay is the submission path. The team may explicitly reopen the gate only before the 17:30 feature freeze and only by running the actual intended input through two complete playback/cleanup cycles in the operator’s demo browser and recording the new evidence.
- Add no snapshot, recording, canvas, palette analysis, temperature, direction, warning, or assessment speech from preview pixels.

### Phase 1B — future transport and session, blocked

- Lock valid WebSocket subprotocol, credit/ack flow control, decoded-frame/currentness contracts, structured errors, clocks/timeouts, and pause semantics.
- Add bridge protocol client, `PureThermalSource`, and `useThermalSession`.
- Add explicit Live / Demo replay choice and generic source copy.
- Clear stale frame/assessment on every invalidation.

### Phase 1C — future deterministic assessment, blocked

- Lock a hardware-derived policy.
- Add the deep assessment engine and Node verifier.
- Add the keyed session-owned assessment-expiry timer with fake-clock verification.
- Add canonical safety presentation and visible assessment UI.
- Do not classify replay.

### Phase 2 — source speech implemented; assessment speech blocked

- Source-status renderer and controls are implemented without an assessment input.
- Source truth, cancellation, dedupe, mute, repeat, and failure are verified.
- Add canonical assessment formatting only after Phase 1C passes.
- Add no model endpoint.

### Phase 3 — demo/accessibility QA

- Avoid architecture refactors.
- Run and record the locked manual matrix.
- Fix only gate-blocking usability/accessibility defects.

### Phase 4 — hardening

- Exercise applicable completed paths. For Phase 1D: permission denial, wrong/missing device, unplug, late results, hidden tab, source switching, track cleanup, and repeated offline runs.

### Phase 5 — packaging

- Document only passed gates.
- Include this architecture diagram and exact local prerequisites.
- Make no post-freeze product change.

---

## 16. Landmines

1. A colored UVC preview is not radiometry.
2. RGB-formatted display video does not make the Lepton a visible-light RGB sensor.
3. Never fabricate `ThermalFrame` temperature fields for a `MediaStream`.
4. A late `getUserMedia` promise can revive a stopped session unless generation-gated and immediately cleaned up.
5. A paused `<video>` can leave a stale frame visible; Phase 1D pause stops tracks and clears `srcObject`.
6. Raw Y16 counts are not necessarily calibrated Celsius.
7. Mirrored display and radiometric orientation create incorrect directional guidance.
8. Replay min/max values are simulated and cannot tune policy.
9. A loose optional-radiometry frame type permits source-truth mistakes.
10. A status-only error callback can leave a stale frame visible.
11. `setInterval` or an unbounded socket queue creates stale delivery.
12. Restarted runs can reuse frame IDs; run identity is mandatory.
13. Pure per-frame analysis alone cannot provide persistence; use a pure reducer with explicit reset state.
14. Free-form presentation messages can diverge from deterministic assessment.
15. Browser speech can be unavailable or duplicate screen-reader announcements.
16. A public HTTPS page may not be able to open an insecure local WebSocket.
17. `public` assets use root URLs; never turn a bridge frame into a remote URL.
18. Do not add persistence to make `#history` look finished.
19. Do not install a runtime dependency to solve a contributor-tool or orchestration problem.

---

## 17. Architecture definition of done

| Surface | Done when |
|---|---|
| Replay foundation | Source-level checks pass; browser evidence is scoped accurately; replay never assesses |
| Phase 1A decision | USB/UVC observations and every missing radiometric field are explicit; downstream radiometric gates are blocked |
| Phase 1D preview | Exact selected UVC input plays locally; provenance persists; stop/error/switch/route cleanup releases every track; no analysis path exists |
| Future bridge | Only after a new Phase 1A pass: one validated live frame crosses a versioned loopback protocol |
| Future source integration | Only after a new Phase 1A pass: radiometric live and replay lifecycle share a controller without stale callbacks |
| Future assessment | Only validated live radiometry reaches a deterministic, resettable engine with a locked policy |
| Future presentation | One validated structured result creates matching visible and speech-ready copy without a touch-safety claim |
| Accessibility | Text + symbol remains complete without color/speech; manual matrix is recorded |
| Whole demo | Every claimed path runs twice offline; replay remains an honest independent fallback |

Phase exit details and requirement IDs live in `docs/REQUIREMENTS.md` and `docs/PLAN.md`.
