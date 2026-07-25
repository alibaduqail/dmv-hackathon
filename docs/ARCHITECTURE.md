# ARCHITECTURE.md — where Ember decisions belong

Cold start: `docs/STATUS.md`. Atomic requirements: `docs/REQUIREMENTS.md`. Implemented shapes: `docs/SCHEMA.md`. Schedule and owners: `docs/PLAN.md`.

This file owns system boundaries, trust decisions, lifecycle ownership, target modules, and protocol shape. It distinguishes **implemented now** from **planned behind a phase gate**. It is not a second product spec or schedule.

---

## 1. Architectural outcome

Ember has one source lifecycle and two truthfully different data paths:

```text
SIMULATED PATH — implemented

committed PNG manifest
        │
        ▼
ReplayThermalSource
        │ generic frame/status callbacks
        ▼
current ScanView state
        ├── viewport + exact replay provenance
        ├── source status + controls
        └── “No current assessment”

Replay has no edge into deterministic assessment.
```

```text
LIVE PATH — planned, gated by hardware proof

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

React may know the operator-selected source descriptor and truthful provenance. It must not know USB, calibration, binary framing, or native transport mechanics.

---

## 2. Architecture principles

1. **Fail closed.** Missing calibration, malformed data, stale input, replay input, and source failure produce no current assessment.
2. **Separate display from evidence.** `displayUrl` is for the viewport. Only validated calibrated radiometric values can enter analysis.
3. **One current run.** A session generation and source run ID prevent an old callback, timer, socket, expiry, or utterance from affecting a new run.
4. **One decision authority.** Deterministic assessment code selects regions, level, direction, and guidance. Presentation code only formats that result.
5. **Replay is infrastructure, not a counterfeit live mode.** It validates lifecycle and UI while providing a self-contained local fallback that remains visibly simulated.
6. **Local and ephemeral by design.** No cloud tier, API, database, service worker frame cache, analytics, or incident persistence exists in the MVP.
7. **Deep modules over scattered rules.** Source lifecycle, bridge framing, assessment, and speech each hide their internal mechanics behind a narrow interface.
8. **No numeric safety policy before evidence.** Threshold, area, persistence, and freshness values remain unset until controlled hardware observations justify them.

---

## 3. Product and trust boundaries

| Boundary | Trust decision |
|---|---|
| Physical scene → sensor | Thermal observation is imperfect. Reflections, emissivity, distance, angle, calibration, and personal sensitivity prevent touch-safety guarantees. |
| Firmware/Y16 → bridge | Untrusted until the exact board, firmware, capture mode, calibration mode, encoding, and orientation are reproduced. Y16 shape alone does not prove Celsius. |
| Native bridge | Trusted to capture, convert, normalize orientation, and encode display data. It is forbidden from classification and product guidance. |
| Loopback transport | Treat bytes as untrusted even on localhost. Validate origin, version, type, length, sequence, calibration state, and allocation size. |
| `PureThermalSource` | Converts structurally valid protocol messages into decoded live frames, maps errors, owns temporary display URLs, enforces frame flow control/timeouts, and rejects old runs. |
| Session controller | Owns source choice, lifecycle, currentness, controller generation, assessment expiry, reference cleanup, and analyzer reset. It is the only layer allowed to make a frame current in React. |
| Assessment engine | Owns semantic/calibration/freshness narrowing and classification. It contains no model, DOM, speech, storage, network, or physical-control call. |
| Safety presenter and speech | Render an existing assessment. They cannot change its level, location, policy, or guidance decision. |
| Replay | Display/lifecycle fixture only. It is rejected from analysis at the provenance and validation gates. |
| Logs, disk, cloud, agent memory | Outside the frame-data boundary. Live frames and radiometric arrays may not enter them. |

---

## 4. Layer responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Native bridge | USB/UVC, calibration interpretation, Celsius conversion, orientation, palette/display encoding, WebSocket framing | UI, thresholds, hotspots, speech, persistence |
| Bridge protocol client | Handshake, message validation, binary decoding, protocol errors | React state, classification, source selection |
| `ThermalSource` adapters | Start/pause/resume/stop, frame delivery, status mapping, source resource cleanup | DOM, policy, speech, history |
| Session controller | Active source, generation/run identity, frame/status snapshot, invalidation, assessment expiry, analyzer reset | USB details, binary parsing, threshold implementation |
| Assessment engine | Semantic validity gate, region extraction, persistence, deterministic selection and spatial mapping | Generated language, DOM, speech, hardware action |
| Safety presenter | Canonical visible/speech-ready copy and symbol from a structured assessment | Classification, thresholds, arbitrary free-form warnings |
| `ScanView` | Render controller snapshot and invoke named controller actions | Construct sources, parse manifests/protocols, retain stale state |
| Speech renderer | Feature detection, mute, dedupe, rate limit, cancel, repeat | Assessment decisions or visual completeness |
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

src/
  types.ts                        implemented shared contracts
  App.tsx                         hash route switch and navigation
  fixtures/replay.ts             replay manifest
  lib/thermal-source.ts           ReplayThermalSource
  features/scan/ScanView.tsx     current replay-only composition and view
  features/history/HistoryView.tsx
  styles/tokens.css
```

### Planned additions by phase

```text
native/
  purethermal-bridge/
    README.md                     exact board/firmware/probe/launch evidence
    <probe and bridge files>      language selected only after Phase 1A

src/lib/
  purethermal-source.ts           public live ThermalSource adapter
  purethermal/
    bridge-protocol.ts            control and binary frame validation
  thermal-assessment.ts           deep deterministic assessment module
  safety-presentation.ts          canonical assessment formatter
  speech-renderer.ts              Phase 2 browser speech adapter

src/features/scan/
  useThermalSession.ts            composition, lifecycle, source selection

scripts/
  verify-bridge-protocol.ts       protocol fixtures and failure cases
  verify-thermal-assessment.ts    generated numeric grids; no replay PNGs
  verify-speech-renderer.ts       fake synthesizer and cancellation checks
```

Do not create these files before their phase authorizes them. Keep the existing replay implementation stable; a file move is not required to add the live sibling.

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

Current limitations are explicit:

- `ScanView` directly constructs the replay source and reads the replay manifest.
- Status and control copy is replay-specific.
- The current loose `ThermalFrame` shape can represent invalid future source/data combinations.
- Status changes alone do not clear a frame; the future error path therefore needs a controller.

These are valid Phase 0 shortcuts, not the Phase 1 target. Phase 1B introduces composition and currentness before wiring Live into the view.

### What replay verification proves

`npm run verify:replay` currently proves asset signatures/dimensions, manifest metadata/order/provenance, full completion, one pause/resume path, and stop cleanup.

It does not prove restart, route/unmount cleanup, DOM provenance, keyboard behavior, accessible names, target sizing, VoiceOver, 200% zoom, live errors, source switching, or stale-frame invalidation. Those require a new automated check or explicitly recorded manual evidence.

---

## 7. Target source and frame contracts

`docs/SCHEMA.md` remains the truth for code that exists today. Before Phase 1B integration, revise it and `src/types.ts` together so invalid source/data combinations do not cross the analysis boundary.

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

## 8. Native bridge and protocol

### Hardware probe before language choice

Do not select the bridge language/library until Phase 1A reproduces:

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

## 9. Thermal session controller

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

## 10. Deterministic assessment engine

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

## 11. Safety presentation and speech

Assessment and copy have one path:

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

### Speech renderer

Default Phase 2 adapter: browser Web Speech API, subject to offline rehearsal. No new runtime dependency is needed.

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
| WebSocket/listeners + frame-timeout watchdog | `PureThermalSource` | pause where applicable, stop, error, restart, switch, unmount |
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

### Live demo

```text
PureThermal USB
      ↕
native bridge on 127.0.0.1
      ↕ versioned WebSocket
browser served locally
```

There is no cloud service, database, authentication system, model endpoint, or frame store.

Use two explicit local processes for the hackathon rather than adding a supervisor:

1. Start the verified native bridge.
2. Start the local production-like web build.
3. Open `#scan`.
4. Select Live deliberately.

The exact bridge command enters `docs/SETUP.md` only after Phase 1A selects and reproduces the capture path.

---

## 14. Verification architecture

Keep verification dependency-free and proportionate:

| Check | Owns |
|---|---|
| current `verify:replay` | Manifest/assets, order/provenance, completion, one pause/resume path, stop cleanup |
| planned replay-verifier extension | Emitted runtime-frame mapping and repeated start/restart |
| future bridge protocol verifier | Handshake, frame length/encoding, origin/version/error fixtures, credit/ack backpressure, timeout, sequence/run rejection, size ceiling, and resource-release spies |
| future assessment verifier | Validator, clocks, connected regions, persistence/reset, expiry callback, boundaries, tie-break, replay/stale rejection, deterministic output |
| future speech verifier | Pure formatter, dedupe, cancellation, mute, unavailable synthesizer through a fake adapter |
| lint + build | Static integration and production compilation |
| manual QA record | Hash reload, keyboard/focus/target size, VoiceOver, live regions, 200% zoom, narrow reflow, device unplug, offline run |

Synthetic numeric assessment fixtures must be generated in code and clearly labelled. They are not the six replay PNGs and never appear as a live demo result.

---

## 15. Phase-oriented implementation order

### Phase 0 — implemented

- Keep replay source, manifest, accessible shell, truthful history, and checks stable.
- Correct documentation/code drift without implying future features exist.

### Phase 1A — hardware proof

- Add native probe/readme only after exact hardware inspection.
- Update setup, status, and decision evidence.
- Make no React warning or threshold change.

### Phase 1B — transport and session

- Lock valid WebSocket subprotocol, credit/ack flow control, decoded-frame/currentness contracts, structured errors, clocks/timeouts, and pause semantics.
- Add bridge protocol client, `PureThermalSource`, and `useThermalSession`.
- Add explicit Live / Demo replay choice and generic source copy.
- Clear stale frame/assessment on every invalidation.

### Phase 1C — deterministic assessment

- Lock a hardware-derived policy.
- Add the deep assessment engine and Node verifier.
- Add the keyed session-owned assessment-expiry timer with fake-clock verification.
- Add canonical safety presentation and visible assessment UI.
- Do not classify replay.

### Phase 2 — speech

- Add the speech renderer and controls.
- Verify copy parity, cancellation, dedupe, mute, and failure.
- Add no model endpoint.

### Phase 3 — demo/accessibility QA

- Avoid architecture refactors.
- Run and record the locked manual matrix.
- Fix only gate-blocking usability/accessibility defects.

### Phase 4 — hardening

- Exercise bridge absence, device unplug, calibration failure, malformed/stale/out-of-order frames, hidden tab, TTS failure, source switching, and repeated offline runs.

### Phase 5 — packaging

- Document only passed gates.
- Include this architecture diagram and exact local prerequisites.
- Make no post-freeze product change.

---

## 16. Landmines

1. A colored UVC preview is not radiometry.
2. Raw Y16 counts are not necessarily calibrated Celsius.
3. Mirrored display and radiometric orientation create incorrect directional guidance.
4. Replay min/max values are simulated and cannot tune policy.
5. A loose optional-radiometry frame type permits source-truth mistakes.
6. A status-only error callback can leave a stale frame visible.
7. `setInterval` or an unbounded socket queue creates stale delivery.
8. Restarted runs can reuse frame IDs; run identity is mandatory.
9. Pure per-frame analysis alone cannot provide persistence; use a pure reducer with explicit reset state.
10. Free-form presentation messages can diverge from deterministic assessment.
11. Browser speech can be unavailable or duplicate screen-reader announcements.
12. A public HTTPS page may not be able to open an insecure local WebSocket.
13. `public` assets use root URLs; never turn a bridge frame into a remote URL.
14. Do not add persistence to make `#history` look finished.
15. Do not install a runtime dependency to solve a contributor-tool or orchestration problem.

---

## 17. Architecture definition of done

| Surface | Done when |
|---|---|
| Replay foundation | Source-level checks pass; browser evidence is scoped accurately; replay never assesses |
| Hardware gate | Exact device/calibration/orientation is reproduced without persisting a live frame |
| Bridge | One validated live frame crosses a versioned loopback protocol; disconnect is explicit and private |
| Source integration | Live and replay share lifecycle through the session controller; switching is deliberate; stale callbacks fail |
| Assessment | Only validated live radiometry reaches a deterministic, resettable engine with a locked policy |
| Presentation | One structured result creates matching visible and speech-ready copy without a touch-safety claim |
| Accessibility | Text + symbol remains complete without color/speech; manual matrix is recorded |
| Whole demo | Every claimed path runs twice offline; replay remains an honest independent fallback |

Phase exit details and requirement IDs live in `docs/REQUIREMENTS.md` and `docs/PLAN.md`.
