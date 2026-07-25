# REQUIREMENTS.md — what Ember must prove

**Status:** Phase 0 is implemented. Phase 1A investigation is complete with the calibrated-radiometry gate blocked. Phase 1D’s display-only code and focused verifier are implemented, but its attached-device/browser exit gate is blocked after missing the 16:15 cutoff. Optional source-status speech is implemented; assessment speech remains blocked by Phase 1C. Replay is the submission path unless the team explicitly reopens and passes the preview gate before the 17:30 feature freeze.

This is the atomic, testable requirements source for Ember. It says **what** must be true and how the team accepts it. `mvp.md` owns the product claim and scope, `docs/SCHEMA.md` documents implemented contracts, `docs/ARCHITECTURE.md` owns boundaries and target placement, `docs/PLAN.md` owns timing and lane assignment, and `docs/STATUS.md` owns current evidence.

If a requirement conflicts with Ember’s safety rules, the safety rule wins. Record any approved contract or scope change in `docs/DECISIONS.md`.

---

## 1. Product outcome and actors

Ember’s product target is a handheld thermal companion for blind and low-vision people. A user points a Lepton 3.5 and PureThermal assembly toward a nearby surface, and a future radiometric build reports an observable higher-heat region through redundant visible guidance and matching speech.

The current hackathon path does not have calibrated radiometry. It implements a local, colorized UVC preview adapter for display transport and lifecycle demonstration, but attached-device playback is unproven and the gate is blocked. Even after a future pass, that preview cannot deliver temperature, hotspot, direction, safety guidance, or the core blind-user warning.

Primary actors:

- **User:** operates the scanner without relying on precise pointing, color, or speech.
- **Demo operator:** explicitly selects a live source or the labelled replay and can recover from failure.
- **Builder:** runs local capture, verification, and accessibility checks without uploading thermal data.

The MVP does not identify objects, diagnose injury, estimate burn risk, or decide that anything is safe to touch.

---

## 2. Requirement language and status

- **Must** is required for the named phase gate.
- **Should** is expected unless the team records a reason to cut it.
- **May** is optional and cannot delay a required gate.
- **Implemented** means code exists.
- **Verified** means named automated or manual evidence exists.
- **Planned** means no current capability is claimed.
- **Blocked** means a prerequisite failed; downstream requirements may not be presented as working.

Requirement IDs remain stable:

```text
EMB-X-*       cross-phase invariant
EMB-P0-*      replay foundation
EMB-P1A-*     hardware and radiometry proof
EMB-P1B-*     local bridge and source integration
EMB-P1C-*     deterministic assessment
EMB-P1D-*     display-only UVC preview
EMB-P2-*      spoken interaction
EMB-P3-*      accessibility and demo QA
EMB-P4-*      offline and failure hardening
EMB-P5-*      submission package
```

Phase suffixes identify requirement type: `FR` functional, `DR` data, `IR` integration, `NFR` non-functional, and `AC` acceptance criterion. Cross-phase `X` IDs use domain tags such as `SAF`, `ACC`, `PRI`, and `LIF`.

---

## 3. Cross-phase invariants

These requirements apply to every implementation, test fixture, screenshot, recording, and pitch claim.

| ID | Requirement |
|---|---|
| `EMB-X-SAF-001` | Ember must report only observable thermal conditions and direction. It must never promise “safe,” “all clear,” “no burn risk,” or “safe to touch.” |
| `EMB-X-DET-001` | Deterministic code alone validates thermal data, selects policy, extracts regions, classifies levels, and chooses guidance. A model cannot participate in this decision path. |
| `EMB-X-ACC-001` | Every warning must include visible text and a non-color symbol. Color and speech may reinforce the warning but cannot be essential. |
| `EMB-X-PRV-001` | Every frame and assessment must retain truthful source provenance. Replay content must visibly display exactly **“Demo replay — not live”**. |
| `EMB-X-PRV-002` | Replay pixels and simulated replay min/max metadata must never enter validation, hotspot extraction, classification, threshold tuning, or warning generation. |
| `EMB-X-PRV-003` | Colorized UVC display pixels must never enter temperature conversion, hotspot extraction, direction, severity, guidance, warning, or speech. A live preview must persistently say **“Live thermal preview — non-radiometric”** and **“Display-only colorized video. No temperature or safety assessment.”** |
| `EMB-X-PRI-001` | Live `MediaStream`s, tracks, per-frame display payloads, and radiometric arrays must remain local and ephemeral: no in-app/runtime recording, upload, persistence, browser storage, incident insertion, analytics, or per-frame logging. Privacy-safe aggregate hardware/policy evidence is allowed. A reviewed external recording of a staged non-personal Phase 5 demo is the only media exception; it does not authorize capture code in Ember. |
| `EMB-X-LIF-001` | Stop, error, route change, source switch, restart, hidden visibility, `pagehide`, unmount, frame timeout, and assessment expiry must invalidate all now-stale frames, streams, assessments, pending speech, callbacks, timers, tracks, and display resources owned by that run. |
| `EMB-X-SCP-001` | No diagnosis, object recognition, medical claim, notification, remote monitoring, cloud frame store, relay, smart plug, or autonomous physical action enters the MVP. |
| `EMB-X-VER-001` | Preserve the lightweight verification style. New deterministic logic must have plain Node verification in addition to replay verification, lint, and build. |
| `EMB-X-TRU-001` | Documentation and presentation may claim only behavior supported by a completed phase gate. Planned and simulated behavior must be labelled as such. |

---

## 4. Phase dependency and fallback

```text
P0 replay source + accessible shell ──────────────────────────────────────┐
                                                                         │
P1A hardware/radiometry probe — COMPLETE, CALIBRATED GATE BLOCKED         │
  ├─ radiometry proven ─> P1B bridge ─> P1C assessment ─> P2 speech       │
  │                       BLOCKED         BLOCKED          assessment      │
  │                                                        speech BLOCKED  │
  └─ radiometry unavailable ─> P1D display-only UVC preview ──────────┐   │
                                                                     │   │
P0 labelled replay ───────────────────────────────────────────────────┴──> P3 QA
                                                                              │
                                                                              v
                                                                         P4 ─> P5
```

- A downstream live phase starts only after its predecessor passes.
- Because calibrated radiometry was not proven by the Phase 1 hardware cutoff, stop the radiometric bridge, assessment, and assessment-speech path.
- Phase 1D may render a local colorized UVC stream only through its separate no-analysis acceptance gate.
- A replay-only submission remains valid, but it must not display or speak a fabricated thermal assessment.
- Phase 2 assessment speech is future-only while Phase 1C is blocked. Optional source-status speech may announce visible operational status and provenance, but it receives no replay pixels, preview pixels, or assessment object.
- Phase 4 hardens only the capabilities that actually passed.
- Phase 5 describes failed gates as future work, not partial success.

---

## 5. Phase 0 — truthful replay foundation

**State:** implemented. Automated checks cover source-level replay behavior; browser and accessibility behaviors remain manual evidence.

### Requirements

| ID | Type | Requirement | Evidence |
|---|---|---|---|
| `EMB-P0-FR-001` | Functional | `#scan` is the default for an empty or unknown hash; `#scan` and `#history` survive reload. | Code + manual browser check |
| `EMB-P0-FR-002` | Functional | Render six ordered simulated PNG frames at 160 × 120. | Asset verifier + code/manual browser evidence |
| `EMB-P0-FR-003` | Functional | Replay supports start, pause, resume, stop, restart, deterministic completion, and cleanup. | Source checks plus manual restart/route checks |
| `EMB-P0-FR-004` | Functional | Keep exact replay provenance adjacent to the viewport and over every displayed replay frame. | Code + manual browser check |
| `EMB-P0-FR-005` | Functional | Expose Start, Pause, Resume, Restart, and Stop with state-appropriate availability. | Code + manual browser check |
| `EMB-P0-FR-006` | Functional | Report source lifecycle through visible words and a non-color symbol. | Code + manual browser check |
| `EMB-P0-FR-007` | Functional | Replay always produces “No current assessment”. | Code review |
| `EMB-P0-FR-008` | Functional | `#history` truthfully reports that no frames or incidents are stored. | Code + manual browser check |
| `EMB-P0-DR-001` | Data | Manifest/frame metadata is finite, ordered, uniquely identified, correctly dimensioned, and truthfully provenanced. | `verify:replay` |
| `EMB-P0-IR-001` | Integration | Replay implements `ThermalSource` and emits frames/status through its callbacks. Phase 0 originally composed Replay directly in `ScanView`; Phase 1D moved that composition into `usePreviewSession`. | Typecheck/build + code review |
| `EMB-P0-NFR-001` | Accessibility | Controls are keyboard operable, named, visibly focused, and at least 44 × 44 CSS pixels. | Manual browser check |
| `EMB-P0-NFR-002` | Reliability | No pending replay work survives stop or route cleanup. | Source-level automated check + manual route check |
| `EMB-P0-NFR-003` | Verification | Replay verification, lint, and production build pass. | Named commands |

### Acceptance scenarios

- `EMB-P0-AC-001` — **Given** an empty or unknown hash, **when** the app loads, **then** the scan surface renders without a router dependency.
- `EMB-P0-AC-002` — **Given** idle replay, **when** Start is activated, **then** frames 0–5 arrive once in order and status ends at `ended`.
- `EMB-P0-AC-003` — **Given** streaming replay, **when** Pause is activated, **then** no frame advances until Resume, after which the next un-emitted frame arrives.
- `EMB-P0-AC-004` — **Given** an active replay, **when** Stop, Restart, or route navigation occurs, **then** the prior run emits no later frame.
- `EMB-P0-AC-005` — **Given** any displayed replay frame, **then** exact replay provenance remains visible and no assessment is produced.
- `EMB-P0-AC-006` — **Given** `#history`, **then** no fabricated record, frame, temperature, or persistence claim appears.

---

## 6. Phase 1A — hardware and calibrated-radiometry proof

**Purpose:** remove hardware uncertainty before the app or policy depends on it. This work happens outside React and does not create a product warning.

**State:** investigation complete; pass gate blocked. Privacy-safe evidence is in `docs/HARDWARE-PROBE.md`.

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P1A-FR-001` | Functional | Record the exact PureThermal board revision, firmware, USB identity, host OS, and capture mode before selecting an example or library. |
| `EMB-P1A-FR-002` | Functional | Prove one 160 × 120 Y16 frame outside React. |
| `EMB-P1A-FR-003` | Functional | Separately prove whether the Y16 values are calibrated radiometric values convertible to Celsius. Shape and bit depth alone are insufficient. |
| `EMB-P1A-FR-004` | Functional | Record the calibration/conversion method and its authoritative source without committing a live raw frame. |
| `EMB-P1A-DR-001` | Data | The probe must establish width, height, pixel count, numeric encoding, byte order, capture timestamp source, and min/max derivation. |
| `EMB-P1A-DR-002` | Data | Produce a privacy-safe proof bundle containing exact probe commit/command; device/firmware/mode/host; calibration source; aggregate pixel/finite counts, min/max, and one-way checksum; orientation challenge result; and second-builder pass/fail review. |
| `EMB-P1A-NFR-001` | Privacy | Probe output may log device metadata and aggregate counts only; it must not write raw frames, radiometric arrays, or identifiable scenes to the repository or telemetry. |
| `EMB-P1A-NFR-002` | Truthfulness | If calibration cannot be proven, block radiometric Phase 1B, deterministic Phase 1C, and assessment speech. A separately gated Phase 1D display preview may continue, but it cannot infer Celsius from palette colors or raw counts. |
| `EMB-P1A-NFR-003` | Decision | Record the probe result and either the selected calibrated bridge approach after a pass or an explicit no-bridge fallback after a failure in `docs/DECISIONS.md`. |

### Acceptance scenarios

- `EMB-P1A-AC-001` — **Given** the exact attached device, **when** the capture probe runs, **then** its evidence identifies board, firmware, USB mode, host, dimensions, and encoding.
- `EMB-P1A-AC-002` — **Given** a captured Y16 buffer, **when** the documented calibration path is applied, **then** the probe reports exactly 19,200 finite convertible values, aggregate min/max, and a checksum traceable to the exact command and authoritative calibration source—or the gate fails.
- `EMB-P1A-AC-003` — **Given** unproven calibration at the cutoff, **when** the team chooses the fallback, **then** no bridge, validator, UI copy, or presentation claims live temperature assessment.
- `EMB-P1A-AC-004` — **Given** the proof bundle, **when** the second builder reproduces it or completes the required evidence checklist, **then** dimensions, encoding, calibration, finiteness, and both orientation challenges each have an explicit pass; any missing or failed field blocks Phase 1B.

### Recorded result — 2026-07-25

| Acceptance | Result | Reason |
|---|---|---|
| `AC-001` | Failed | macOS identified GroupGets PureThermal firmware `v1.3.0` and UVC interfaces, but exact board revision, capture mode, dimensions, and encoding were not exposed |
| `AC-002` | Failed | No 160 × 120 Y16 buffer or authoritative calibrated-Celsius conversion was obtained |
| `AC-003` | Passed | The team selected the no-radiometry branch and removed temperature, assessment, warning, and assessment-speech claims |
| `AC-004` | Failed | Calibration, frame aggregate, checksum, and orientation evidence are absent, so the radiometric Phase 1B gate remains blocked |

### Exit gate

Phase 1A work is closed, but Phase 1B is not authorized. Calibrated 160 × 120 radiometry was not reproduced and the complete pass bundle does not exist. The team follows the labelled replay plus Phase 1D display-only branch.

---

## 7. Phase 1D — non-radiometric live preview

**Purpose:** prove that the attached UVC device can supply a local, display-only browser preview while keeping source truth, permission, accessibility, privacy, and cleanup explicit.

**State:** implementation complete; attached-device exit gate blocked after the 16:15 cutoff. The USB/UVC interfaces are present. The in-app browser reached a pending permission request, but its permission surface could not be presented. Ember logically invalidated that generation and would stop any late stream, but no exact browser label, playing stream, settings, or camera-indicator closure is claimed.

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P1D-IR-001` | Integration | Use `navigator.mediaDevices` with `audio: false` through a distinct `UvcPreviewSource` or equivalent preview adapter. Do not call it `PureThermalSource` and do not fabricate a `ThermalFrame`. |
| `EMB-P1D-IR-002` | Integration | Model the viewport as a discriminated replay-frame or live-`MediaStream` surface. A `MediaStream` cannot acquire fake `minC`, `maxC`, `radiometricValuesC`, or replay metadata to fit the Phase 0 frame contract. |
| `EMB-P1D-FR-001` | Functional | Demo replay remains visibly selected after load/reload. Camera access begins only after the operator explicitly selects Live preview and activates an **Authorize cameras** action; Replay Start never requests camera access. |
| `EMB-P1D-FR-002` | Functional | Before authorization, explain that the browser may briefly activate its default video input solely to unlock labels. Authorize with a temporary `audio: false, video: true` stream, never attach it to the viewport, and stop all of its tracks immediately. Then enumerate inputs, require the operator to choose the intended PureThermal-labelled input, and keep its `deviceId` in memory for this session only. |
| `EMB-P1D-FR-003` | Functional | Start opens only the operator-selected session `deviceId`, verifies the active track’s `getSettings().deviceId` matches before attachment, and enters `streaming` only after the current-generation stream plays. Display the selected track label plus **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”** beside the viewport. |
| `EMB-P1D-FR-004` | Functional | Pause stops every current track, clears `video.srcObject`, and enters `paused`; Resume explicitly reacquires the session-selected input. A paused stale image cannot remain in the viewport. |
| `EMB-P1D-FR-005` | Functional | Stop, Restart, source switch, route change, `visibilitychange` to hidden, `pagehide`, unmount, permission failure, playback failure, and device disconnect stop all tracks, clear the element, remove listeners, and reject late permission/stream results with a generation token. |
| `EMB-P1D-FR-006` | Functional | Permission denied, no matching device, device in use, unsupported context, playback failure, and disconnect produce visible text plus a non-color status symbol and an explicit Retry action. Failure never silently starts Replay. |
| `EMB-P1D-DR-001` | Data | Only the browser-reported selected track label and sanitized display settings may appear. Width, height, and frame rate may be shown only after the selected stream reports them; never display or log `deviceId`/`groupId`, Celsius, calibration, thermal extrema, or radiometric arrays. |
| `EMB-P1D-NFR-001` | Privacy | Keep device choice session-only. Do not use local storage, analytics, screenshots, canvas extraction, `ImageCapture`, `MediaRecorder`, upload, frame logging, or persistence. |
| `EMB-P1D-NFR-002` | Safety | The preview has no edge into frame validation, palette interpretation, hotspot extraction, assessment, guidance, warnings, or assessment speech. Source-status speech consumes status/provenance only. The assessment value is always absent. |
| `EMB-P1D-NFR-003` | Accessibility | Source selection, controls, status, provenance, error, and Retry are keyboard operable, visibly focused, named, and at least 44 × 44 CSS pixels; meaning remains complete without color or audio. |
| `EMB-P1D-NFR-004` | Verification | A dependency-injected plain Node check covers authorize/discover cleanup, exact selected-device matching, already-ended and during-playback track races, late `getUserMedia` resolution, pause/reacquire, disconnect, restart, the reusable `stop()`/generation boundary, hidden/pagehide cleanup, detached playback-sink cleanup, and track cleanup. React source-switch and route cleanup require code review plus manual browser evidence; manual hardware evidence verifies the selected label and camera indicator closes. |

### Acceptance scenarios

- `EMB-P1D-AC-001` — **Given** Demo replay is selected, **when** the app loads or Start runs, **then** it requests no camera permission and exact replay provenance remains visible.
- `EMB-P1D-AC-002` — **Given** Live preview is explicitly selected, **when** the operator authorizes camera discovery, **then** the temporary stream is never attached and stops immediately; the operator selects the intended labelled input; Start opens that exact session-only `deviceId`; the active track identity matches; and only then do the label, both non-radiometric statements, playing preview, and `streaming` status appear.
- `EMB-P1D-AC-003` — **Given** an authorization or preview request resolves after Stop, Restart, source switch, route change, hidden visibility, or `pagehide`, **then** every returned track is stopped and the late result cannot update current status or the viewport.
- `EMB-P1D-AC-004` — **Given** a playing preview, **when** Pause, Stop, disconnect, hidden visibility, `pagehide`, or unmount occurs, **then** no stale image remains, all tracks stop, `srcObject` clears, and a visible non-color status explains the state when the page remains active.
- `EMB-P1D-AC-005` — **Given** permission denial, no uniquely selected matching device, active-track identity mismatch, device-in-use, unsupported context, or playback failure, **then** no stream is retained or attached, the assessment remains absent, and Retry is explicit.
- `EMB-P1D-AC-006` — **Given** any live preview, **then** code and presentation contain no snapshot/recording/palette-analysis path and no temperature, hotspot, direction, severity, guidance, warning, or speech derived from display pixels.

### Exit gate

The actual intended UVC device plays locally twice; source truth remains visible; failure and all lifecycle invalidations release tracks; the focused verifier, replay verifier, lint, and build pass; and the submission describes the preview as display-only.

Current evidence: `verify:preview`, `verify:replay`, lint, and build pass. Browser DOM checks passed default Replay, explicit Live selection without permission, persistent truth, logical invalidation of a pending authorization, route reset, 390px reflow, and 44px targets. The hardware gate is blocked. It may be explicitly reopened only before the 17:30 feature freeze and only after two actual-browser playback/cleanup runs plus the remaining manual hardware checks are recorded.

---

## 8. Phase 1B — local bridge and transport-neutral live source

**Purpose:** carry one truthful live frame from the native device boundary into the existing source lifecycle without exposing transport mechanics to the view.

**State:** blocked by the recorded Phase 1A result. These stable requirements are retained for a future reopened calibrated path and are not hackathon implementation scope.

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P1B-IR-001` | Integration | Add the smallest local native bridge that owns USB capture, calibration interpretation, display conversion, and frame delivery. |
| `EMB-P1B-IR-002` | Integration | The browser connection must use a versioned loopback protocol. The default architecture is a browser-native WebSocket; a different transport requires a recorded hardware-driven reason. |
| `EMB-P1B-IR-003` | Integration | Implement `PureThermalSource` behind `ThermalSource`; React views must not open USB or parse bridge protocol messages. |
| `EMB-P1B-IR-004` | Integration | Add an explicit operator-controlled Live / Demo replay choice. Never silently fall back or relabel one source as the other. |
| `EMB-P1B-IR-005` | Integration | Use one-frame credit/ack flow control: Start and each Resume issue a new `creditId`; the bridge sends at most one in-flight frame and retains only its newest unsent capture until the client acknowledges the accepted run/credit/sequence. |
| `EMB-P1B-FR-001` | Functional | A fresh start creates a new run, performs the `ember-thermal.v1` handshake, enters `connecting`, and reaches `streaming` only after a structurally valid decoded live frame. |
| `EMB-P1B-FR-002` | Functional | Pause stops forwarding, discards retained continuation, clears current assessment, and invalidates frame credit. The device may remain open only if documented; Resume increments `creditId`, and any late pre-pause frame/ack is rejected. |
| `EMB-P1B-FR-003` | Functional | Stop closes the connection, releases callbacks and display resources, clears current output, and returns `idle`. |
| `EMB-P1B-FR-004` | Functional | Disconnect, wrong protocol, invalid device mode, and malformed messages clear current output before entering an explicit error state with a deliberate recovery action. |
| `EMB-P1B-FR-005` | Functional | Restart and source switching ignore all callbacks from earlier runs. |
| `EMB-P1B-FR-006` | Functional | Demo replay is visibly preselected after first load/reload. Start opens Live only after the operator selects Live; source choice is not persisted and failure never auto-switches it. |
| `EMB-P1B-FR-007` | Functional | Start/Resume and every accepted frame arm a monotonic frame-silence watchdog. Expiry clears current output, closes the source, and emits recoverable `frame-timeout`. |
| `EMB-P1B-DR-001` | Data | A decoded live frame contains protocol version, source run ID, credit ID, frame ID, monotonic sequence, Unix-epoch capture time, browser receive epoch/monotonic time, 160 × 120 dimensions, separate display payload, exactly 19,200 radiometric values, source-recomputed min/max, calibration evidence, and live provenance. |
| `EMB-P1B-DR-002` | Data | Bridge errors contain a stable code, user-safe summary, retryability, and run ID; they contain no frame or temperature payload. |
| `EMB-P1B-DR-003` | Data | Handshake ping/pong records same-host clock skew/round-trip bounds. Regressing capture time, excessive future skew, or clock rollback fails closed; runtime expiry uses browser monotonic time. |
| `EMB-P1B-NFR-001` | Security | Bind loopback only and reject unintended remote clients and unapproved browser origins. Do not expose a LAN listener for the hackathon MVP. |
| `EMB-P1B-NFR-002` | Performance | Implement latest-frame-wins at the bridge through run/credit/sequence acknowledgements. At most one frame is in flight and one newest capture is retained; intermediate captures are replaced before send. |
| `EMB-P1B-NFR-003` | Reliability | A controller-owned generation token must reject late callbacks after stop, restart, route change, error, or source switch. |
| `EMB-P1B-NFR-004` | Privacy | Do not log frame payloads or radiometric arrays. Revoke replaced display URLs and release replaced arrays. |
| `EMB-P1B-NFR-005` | Dependency | Browser code uses the native `WebSocket` API by default; a new runtime package requires explicit approval. |
| `EMB-P1B-NFR-006` | Resource safety | The bridge enforces 256 KiB total and 16 KiB JSON-header ceilings before send. After WebSocket allocation, the browser checks total length, reads only the four-byte header length, validates/decodes the bounded header, then validates payload offsets before any payload-sized view/copy, Blob/URL creation, or state update. |
| `EMB-P1B-NFR-007` | Integrity | `PureThermalSource` recomputes grid min/max and checks reported extrema with one fixed Phase 1B transport tolerance. The recomputed values enter the frame; this integrity tolerance is not an assessment threshold. |

### Acceptance scenarios

- `EMB-P1B-AC-001` — **Given** a valid bridge handshake and frame, **when** Live starts, **then** the viewport receives its display payload while the analysis boundary receives exactly 19,200 finite Celsius values with live provenance.
- `EMB-P1B-AC-002` — **Given** an active live run, **when** the device disconnects, **then** the frame and any assessment clear before `error`, late messages are ignored, and an explicit restart remains available.
- `EMB-P1B-AC-003` — **Given** rapid Stop → Start or Live → Replay switching, **when** old callbacks arrive, **then** they cannot change status, provenance, frame, or assessment for the new run.
- `EMB-P1B-AC-004` — **Given** Replay is deliberately selected, **then** exact replay provenance is visible and no live connection or classifier is invoked.
- `EMB-P1B-AC-005` — **Given** a client outside loopback or an unapproved origin, **when** it attempts to connect, **then** the bridge rejects it without exposing frame data.
- `EMB-P1B-AC-006` — **Given** streaming Live, **when** Pause then Resume is activated, **then** Resume uses a new credit ID; a late pre-pause frame/ack cannot update state, and only a fresh current-credit frame may arrive.
- `EMB-P1B-AC-007` — **Given** a wrong subprotocol, total payload over 256 KiB, header over 16 KiB, inconsistent staged lengths, or unsupported encoding, **when** it arrives, **then** parsing never creates a payload-sized view/copy, object URL, frame state, or acknowledgement and the source fails explicitly.
- `EMB-P1B-AC-008` — **Given** capture outruns the browser, **when** one frame is in flight, **then** the bridge replaces unsent captures and sends only the newest after matching run/credit/sequence `frame-ack`; verifier-observed bounds remain one in flight plus one retained.
- `EMB-P1B-AC-009` — **Given** Start/Resume or a previously accepted frame, **when** no next valid frame arrives by the locked monotonic timeout, **then** frame/assessment clear before recoverable `frame-timeout` and no late message revives the run.
- `EMB-P1B-AC-010` — **Given** five start/stop/restart/source-switch protocol cycles with resource spies, **then** each stopped cycle has zero active sockets, listeners, watchdogs, object URLs, borrowed buffers, retained captures, or credits.
- `EMB-P1B-AC-011` — **Given** first load or reload, **then** Demo replay is visibly selected; Start cannot open the bridge until Live is explicitly selected, and a live error cannot silently start Replay.
- `EMB-P1B-AC-012` — **Given** handshake skew outside the locked bound, capture-time regression, or wall-clock rollback, **then** the frame fails closed while monotonic watchdog/expiry behavior remains deterministic.

### Exit gate

One live frame reaches the scan surface through `PureThermalSource`; all `EMB-P1B-AC-*` protocol fixtures pass; disconnect/restart/default selection are reproducible; and no view imports bridge mechanics.

---

## 9. Phase 1C — validated deterministic assessment

**Purpose:** derive current directional guidance only from validated, calibrated, live radiometric input.

**State:** blocked by Phases 1A and 1B. Phase 1D display pixels cannot satisfy or bypass this gate.

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P1C-DR-001` | Data | Introduce a decoded live-frame subtype and an assessment-owned narrower validated-radiometric type, or an equivalent runtime boundary. Replay-with-radiometry and live-without-valid-calibration must be unrepresentable after validation. |
| `EMB-P1C-FR-001` | Functional | Reject wrong run/credit, wrong dimensions, wrong radiometric length, non-finite values, stale timestamps, duplicate/out-of-order sequences, ambiguous provenance, or unproven calibration. Transport-reported extrema consistency is already checked by `PureThermalSource`. |
| `EMB-P1C-FR-002` | Functional | Extract candidate regions through a pure per-frame function using a versioned, device-validated `AssessmentPolicy`. |
| `EMB-P1C-FR-003` | Functional | Advance persistence through a pure deterministic reducer whose state is explicit and resettable. Transient frames cannot warn. |
| `EMB-P1C-FR-004` | Functional | Select the strongest qualifying region deterministically with a documented tie-break order. |
| `EMB-P1C-FR-005` | Functional | Map the selected centroid into exact source-coordinate regions: upper/middle/lower × left/center/right. |
| `EMB-P1C-FR-006` | Functional | Produce one structured assessment associated with source run, frame ID, capture time, provenance, policy version, and monotonic expiry. Derive its ID deterministically; represent no current assessment as `null`. |
| `EMB-P1C-FR-007` | Functional | Render the assessment as observable summary, conservative guidance, non-color symbol, and reinforcing color. |
| `EMB-P1C-FR-008` | Functional | A controller-owned one-shot timer keyed by generation/run/assessment clears the matching assessment on monotonic expiry even when no new frame arrives. Pause, stop, disconnect, error, route change, restart, source switch, and page hide cancel it and clear state. |
| `EMB-P1C-FR-009` | Functional | A replay, unvalidated frame, or absent current frame produces “No current assessment,” never a guessed result. |
| `EMB-P1C-NFR-001` | Determinism | Identical decoded input sequences, policy, initial reducer state, and injected clock values produce byte-equivalent semantic and operational assessment fields, including derived ID and expiry. |
| `EMB-P1C-NFR-002` | Fail closed | Malformed, uncalibrated, stale, or replay input yields no assessment and cannot reuse a prior result. |
| `EMB-P1C-NFR-003` | Policy | Do not invent threshold, minimum area, persistence count, freshness, or connectivity values from replay. Lock them only after controlled hardware observations and record the decision. |
| `EMB-P1C-NFR-004` | Performance | Capture-to-assessment freshness, processing, clock-skew, and current-lifetime budgets must be measured on the demo laptop before acceptance; input outside the locked budgets is rejected. |
| `EMB-P1C-NFR-005` | Verification | Plain Node checks with fake clocks cover validation/narrowing, connectivity, spatial boundaries, persistence, reset, tie-breaking, deterministic identity/expiry, expiry without another frame, replay rejection, and stale-frame rejection. |

### Deterministic policy decisions required before implementation

The Phase 1A/1C owner must fill these values from controlled device evidence:

| Decision | Required definition |
|---|---|
| Policy identity | Stable version/name included in assessment evidence |
| Threshold basis | Absolute calibrated Celsius, validated delta, or another documented deterministic basis |
| Levels | Exact conditions for each `AssessmentLevel` |
| Connectivity | Four-neighbor or eight-neighbor connected components |
| Minimum region | Minimum qualifying pixel area |
| Persistence | Consecutive qualifying frames and match rule |
| Strongest region | Ordering and full deterministic tie-break |
| Spatial bounds | Exact inclusive/exclusive thirds boundaries |
| Freshness | Maximum capture age on the demo laptop |
| Current lifetime | Monotonic duration before an accepted assessment expires without a new frame |
| Reset | Events that clear persistence and current assessment |

Until all rows are locked, the analyzer may be developed against synthetic numeric fixtures but may not drive a demo warning.

### Acceptance scenarios

- `EMB-P1C-AC-001` — **Given** malformed, stale, uncalibrated, or replay data, **when** validation runs, **then** no hotspot or assessment is produced and current output is cleared.
- `EMB-P1C-AC-002` — **Given** the same radiometric sequence, policy, initial state, and injected clock values, **when** analysis runs repeatedly, **then** identity, expiry, region bounds, selected direction, level, summary, and guidance are byte-equivalent.
- `EMB-P1C-AC-003` — **Given** a qualifying region for fewer than the configured persistence frames, **when** frames arrive, **then** no current warning appears; at the configured count, one stable assessment appears.
- `EMB-P1C-AC-004` — **Given** a controlled warm object moving among documented regions, **when** validated live frames arrive, **then** visible direction follows the strongest persistent region without object-identification or touch-safety claims.
- `EMB-P1C-AC-005` — **Given** an accepted assessment and then no new frame, **when** its monotonic deadline expires, **then** the keyed controller timer removes it, resets persistence, and cancels speech; an old timer cannot clear a newer assessment.

### Exit gate

A controlled non-personal warm object produces a stable structured live assessment; malformed and replay inputs fail closed; all deterministic verification passes.

---

## 10. Phase 2 — matching visible and spoken output

**Purpose:** add speech as a renderer of the same structured assessment, never as a decision system.

**State:** source-status speech is implemented and verified. Product assessment speech remains blocked by Phase 1C, and no formatter or synthetic assessment exists.

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P2-FR-001` | Functional | A pure formatter derives canonical visible and spoken copy from one current structured assessment. |
| `EMB-P2-FR-002` | Functional | Speech cannot select or alter level, hotspot, direction, policy, or guidance. |
| `EMB-P2-FR-003` | Functional | Deduplicate equivalent assessments and apply a documented minimum announcement interval. |
| `EMB-P2-FR-004` | Functional | Cancel queued/current speech when assessment, freshness, source, route, or run changes. |
| `EMB-P2-FR-005` | Functional | Announce source errors and replay provenance as source status, not as thermal assessments. |
| `EMB-P2-FR-006` | Functional | Provide speech enable, Mute, and Repeat controls with visible state and accessible names. |
| `EMB-P2-FR-007` | Functional | Muting affects audio only; complete visible text and symbol output remain. |
| `EMB-P2-NFR-001` | Accessibility | Routine status uses a polite live region. Only a new urgent validated warning may use an assertive region; avoid duplicate screen-reader and TTS announcements. |
| `EMB-P2-NFR-002` | Resilience | Missing voices, denied speech, or TTS errors cannot block, alter, or erase the visual experience. |
| `EMB-P2-NFR-003` | Privacy | No utterance, assessment, or voice preference is persisted or sent to a model endpoint. |

Implemented source-only subset:

- `EMB-P2-FR-005` through `007` apply to current source status and provenance.
- Source-status dedupe, a 2.5-second minimum interval, replacement cancellation, Mute, Repeat, unavailable/throwing TTS, and exact replay provenance are covered by `npm run verify:speech`.
- The visual status region remains polite so a silent TTS failure cannot remove assistive output. Ember speech defaults off, and visible status plus its non-color symbol remain present.
- `EMB-P2-FR-001` through the assessment portions of `004` remain blocked and receive no substitute data.

### Acceptance scenarios

- `EMB-P2-AC-001` — **Given** one current validated live assessment from a future passed Phase 1C, **when** formatting runs, **then** visible and speech-ready canonical guidance match.
- `EMB-P2-AC-002` — **Given** repeated equivalent assessments, **when** frames continue, **then** duplicate utterances are suppressed.
- `EMB-P2-AC-003` — **Given** a direction change while old speech is queued, **then** stale speech is cancelled and only current guidance may play.
- `EMB-P2-AC-004` — **Given** Mute or unavailable TTS, **then** visible text, symbol, and understandable source state remain complete.
- `EMB-P2-AC-005` — **Given** Replay, **then** speech may announce “Demo replay — not live” but must not announce a thermal assessment.

### Exit gate

The source-status subset passes its focused verifier and does not constitute an assessment-speech phase pass. Only a future passed Phase 1C may authorize canonical heat guidance. Until then, assessment-specific acceptance rows remain blocked/not applicable.

---

## 11. Phase 3 — accessibility and demo QA

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P3-FR-001` | Accessibility | Complete every action belonging to passed capability gates with keyboard alone in a logical order; implemented source-speech actions apply now, while assessment-speech actions remain conditional. |
| `EMB-P3-FR-002` | Accessibility | Controls retain visible focus and 44 × 44 minimum targets at desktop, narrow width, and 200% zoom. |
| `EMB-P3-FR-003` | Accessibility | With Ember speech muted, VoiceOver announces names, state, provenance, and status once in a logical order. Test Ember source speech in a separate pass; current-warning checks apply only if Phase 1C passed. |
| `EMB-P3-FR-004` | Accessibility | Status always remains understandable with color unavailable and speech muted; warning parity applies only if Phase 1C passed. |
| `EMB-P3-FR-005` | Accessibility | Thermal images are not keyboard focus targets and never carry essential meaning alone. |
| `EMB-P3-FR-006` | Accessibility | A 320–390px layout and 200% zoom reflow without clipping essential controls or requiring horizontal scrolling. |
| `EMB-P3-FR-007` | Demo | Use only a heating pad, reusable hand warmer, or warm mug; never invite contact with a heated object. |
| `EMB-P3-FR-008` | Demo | Both builders can independently execute the three-minute live or truthful fallback flow from `docs/DEMO.md`. |
| `EMB-P3-DR-001` | Evidence | Record browser, OS, assistive-technology version, viewport, zoom, result, and limitation for each manual check. |
| `EMB-P3-DR-002` | Evidence | If Phase 1D passed, record the exact browser-reported selected input, stream settings, persistent non-radiometric copy, and camera-indicator/track cleanup result without storing a frame or device ID. |

### Acceptance scenarios

- `EMB-P3-AC-001` — **Given** keyboard-only operation, **when** the complete demo runs, **then** every action is reachable, named, visibly focused, and correctly enabled.
- `EMB-P3-AC-002` — **Given** VoiceOver with Ember speech muted, **when** source state changes, **then** each meaningful status/provenance update is announced once. In a separate app-speech pass, equivalent source statuses are deduplicated without frame-by-frame noise; future assessment speech remains conditional on Phase 1C/2.
- `EMB-P3-AC-003` — **Given** 200% zoom and a 320–390px viewport, **then** essential copy and controls reflow without loss.
- `EMB-P3-AC-004` — **Given** color is unavailable and speech is muted, **then** provenance and source state remain understandable; if Phase 1C passed, direction, level wording, and guidance also remain understandable.
- `EMB-P3-AC-005` — **Given** either builder follows the demo script, **then** the chosen live or replay path completes without undocumented intervention.
- `EMB-P3-AC-006` — **Given** Phase 1D passed, **when** color and audio are unavailable, **then** selected-device identity, live non-radiometric provenance, no-assessment state, Stop, and Retry remain understandable and operable.

### Exit gate

The common replay/status manual QA record is complete for the locked browser/VoiceOver matrix and both builders can run the truthful fallback. Phase 1D preview rows apply only if its gate passed. Live warning and assessment-speech rows remain blocked/not applicable, and the record labels every conditional row.

---

## 12. Phase 4 — offline and failure hardening

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P4-FR-001` | Offline | With network disconnected, run the production build’s labelled replay twice with a reload between runs. |
| `EMB-P4-FR-006` | Offline | If Phase 1D passed, run the display-only UVC preview twice without network and verify no remote resource is required. |
| `EMB-P4-FR-002` | Offline | If Phase 1B passed, run the live source path twice using only loopback bridge resources; require assessment behavior only if Phase 1C also passed. |
| `EMB-P4-FR-007` | Failure | If Phase 1D passed, deny permission and unplug the selected UVC device mid-preview; clear the video, stop remaining tracks, ignore late results, and recover explicitly. |
| `EMB-P4-FR-003` | Failure | If Phase 1B passed, unplug the device mid-stream; enter `error`, clear current output, ignore late data, and recover explicitly. |
| `EMB-P4-FR-004` | Routing | Reload `#scan` and `#history` offline. |
| `EMB-P4-FR-005` | Fallback | If Phase 1B passed, deliberately switch from failed Live to labelled Replay without retaining live frame, provenance, assessment, or speech. |
| `EMB-P4-NFR-001` | Resources | Across five applicable lifecycle cycles, resource-spy counts return to zero after stop for replay timers, preview tracks/listeners/element attachments, and any future sockets, object URLs, radiometric buffers, retained captures, credits, assessment expiry, or speech; active streaming retains only documented bounded resources. |
| `EMB-P4-NFR-002` | Verification | Replay, live-frame/analysis checks that exist, lint, and build all pass from a clean checkout. |
| `EMB-P4-NFR-003` | Schedule | Freeze product code at 17:30; unresolved polish becomes a documented limitation. |

### Acceptance scenarios

- `EMB-P4-AC-001` — **Given** the network is disconnected, **when** the production build loads and Replay runs twice, **then** no asset, API, font, or route request needs the network.
- `EMB-P4-AC-006` — **Given** Phase 1D passed and the network is disconnected, **when** the intended UVC input runs twice, **then** permission, selected-device display, preview, stop, and Retry require no remote resource.
- `EMB-P4-AC-002` — **Given** Phase 1B passed and Live is streaming, **when** USB disconnects, **then** no stale warning remains and explicit Restart or Replay selection is available.
- `EMB-P4-AC-003` — **Given** Phase 1B passed and five Live / Replay switch cycles run, **then** provenance always matches the active source, no callback crosses runs, and stopped resource-spy counts return to zero.
- `EMB-P4-AC-004` — **Given** all checks required by completed phases, **when** run at freeze, **then** they pass from a clean checkout.
- `EMB-P4-AC-005` — **Given** implemented source speech, **when** the production-like build runs without network, **then** a browser speech voice works locally or app speech is explicitly marked unavailable while the complete visual path remains; future assessment speech remains conditional.
- `EMB-P4-AC-007` — **Given** Phase 1D passed and five Replay / Live preview switch cycles run, **then** source truth always matches, no late permission result crosses generations, and every stopped preview has zero tracks/listeners and no `srcObject`.

### Exit gate

Replay runs twice offline. Each passed live/speech capability also passes its conditional offline/failure rows; blocked rows are marked not applicable rather than simulated. Resource checks and verification are green, and product code is frozen.

---

## 13. Phase 5 — truthful submission package

### Requirements

| ID | Type | Requirement |
|---|---|---|
| `EMB-P5-FR-001` | Documentation | README opens with the locked track-fit sentence and accurately reports current capability. |
| `EMB-P5-FR-002` | Documentation | Include problem, target user, accessibility behavior, architecture, privacy/safety boundaries, and a live-versus-simulated truth table. |
| `EMB-P5-FR-003` | Evidence | Include only screenshots supported by completed gates; replay provenance remains visible. |
| `EMB-P5-FR-004` | Media | Produce a 90-second captioned recording. Captions identify replay as simulated whenever it appears. |
| `EMB-P5-FR-005` | Submission | Complete the event form by 19:00 and reserve 18:30–19:00 for submission only. |
| `EMB-P5-NFR-001` | Truthfulness | Do not claim live preview, radiometry, assessment, speech, offline behavior, or accessibility results unless its gate passed. Any Phase 1D footage must visibly say it is non-radiometric and has no temperature or safety assessment. |
| `EMB-P5-NFR-002` | Privacy | Prefer frame-free live status evidence. If a staged non-personal thermal scene is recorded, document consent, purpose, and the narrow media exception; never record a person. |
| `EMB-P5-NFR-003` | Freeze | Package documentation and media must describe the frozen commit; no product-code change occurs after 17:30. |

### Acceptance scenarios

- `EMB-P5-AC-001` — **Given** the frozen build, **when** README and media are compared with it, **then** every claimed capability is directly reproducible.
- `EMB-P5-AC-002` — **Given** replay footage, **then** exact replay provenance is visible and captions call it simulated.
- `EMB-P5-AC-003` — **Given** a failed live gate, **then** every submission surface presents the blocked capability as future work.
- `EMB-P5-AC-004` — **Given** the package, **then** README links, captions, screenshots, and stated commands work from the frozen commit.

### Exit gate

All `EMB-P5-AC-*` scenarios pass, the package names the frozen commit, submission evidence is recorded, and every blocked capability is described as planned rather than working.

---

## 14. Edge and failure cases

Every applicable implementation phase must handle these explicitly:

| Case | Required result |
|---|---|
| Browser cannot list the intended PureThermal input | Block Phase 1D; do not use a built-in or ambiguous camera |
| Camera permission denied or secure context unavailable | Clear preview state, stop returned tracks, show text + symbol error and explicit Retry |
| `getUserMedia` resolves after invalidation | Stop every returned track immediately; generation guard prevents UI update |
| Pause with a live `MediaStream` | Stop tracks and clear `video.srcObject`; Resume explicitly reacquires the selected input |
| UVC stream uses RGB-formatted display pixels | Render only; do not call it an RGB sensor or infer radiometry |
| Wrong dimensions or pixel count | Reject the frame; clear current assessment; surface a recoverable source error where appropriate |
| Missing, non-finite, or uncalibrated radiometry | Fail closed with no assessment |
| Duplicate, old, or out-of-order sequence | Ignore it; never rewind current state |
| Capture timestamp exceeds freshness budget | Clear/withhold assessment; do not call stale guidance current |
| Capture time regresses, clock skew is excessive, or wall clock rolls back | Fail closed; reset persistence; keep expiry/watchdogs on injected monotonic time |
| Bridge protocol/version mismatch | Reject connection and provide a deliberate recovery action |
| Oversized or internally inconsistent binary frame | Reject before derived copies/URL/state; do not acknowledge it |
| Browser processing is slower than capture | One frame stays in flight; bridge retains/replaces only its newest unsent capture |
| Stream becomes silent after a valid warning | Source watchdog enters `frame-timeout`; controller clears assessment before error copy |
| Device disconnects mid-frame | Release partial data, clear output, enter `error`, ignore late callbacks |
| Rapid start/restart/stop/source switch | Only the newest generation may update UI or speech |
| Pause with a visible replay frame | Label paused; keep exact replay provenance; never imply the retained image is live |
| Route leaves `#scan` | Stop the source and clear timers, connections, buffers, display URLs, assessment, and speech |
| Two equal candidate regions | Apply the locked deterministic tie-break |
| Region crosses a directional boundary | Apply exact documented inclusive/exclusive coordinate rules |
| TTS unavailable or denied | Keep complete visible text + symbol behavior |
| Network unavailable | Replay and any proven local live path continue without remote resources |
| Calibrated hardware gate fails | Radiometric path stays blocked; Phase 1D may show only a separately gated display preview |
| Submission recording persists pixels | Use a staged non-personal scene under the explicit Phase 5 exception or avoid frame capture |

---

## 15. Integration contracts and trust gates

The active Phase 1D path crosses these gates:

1. **USB/UVC → browser MediaDevices:** macOS UVC presence is not enough; explicit permission and browser-reported label must identify the intended input.
2. **MediaDevices → `UvcPreviewSource`:** the adapter accepts a current-generation `MediaStream`, owns tracks/listeners, and exposes status/errors without extracting pixels.
3. **Preview source → session/viewport:** the controller accepts only the current generation, attaches the stream to `<video>`, and keeps exact non-radiometric truth visible.
4. **Preview → assessment:** no edge exists. Temperature, hotspot, direction, guidance, warning, and assessment speech are unreachable; optional speech receives operational status/provenance only.
5. **Replay → viewport:** replay follows `ThermalSource`, retains exact simulated provenance, and has no assessment edge.

The blocked future radiometric path remains ordered:

1. **Device → native bridge:** untrusted raw capture becomes calibrated device data only after a new Phase 1A pass.
2. **Bridge → browser client:** each protocol message is locally sourced, bounded, versioned, flow-controlled, and structurally validated.
3. **Decoded live frame → validated radiometric frame:** assessment-owned validation narrows calibrated current data.
4. **Validated sequence → assessment → renderers:** deterministic policy produces one result; renderers cannot change classification.

Detailed placement and lifecycle ownership live in `docs/ARCHITECTURE.md`. Implemented shapes live in `docs/SCHEMA.md`.

---

## 16. Open decisions

These are decisions, not permission to invent values. The named phase must resolve each before its exit gate.

| Decision | Due | Owner/evidence |
|---|---|---|
| Exact browser-reported PureThermal input label and stream settings | Phase 1D preflight | Browser evidence; do not persist device ID |
| WebSocket port/origin allowlist, frame timeout, clock skew, and extrema-integrity tolerance | Future reopened Phase 1B | Protocol fixtures + demo-laptop measurement |
| Assessment policy values and tie-break | Future reopened Phase 1C | Controlled calibrated device evidence + deterministic fixtures |
| Capture-to-assessment freshness/latency budget | Future reopened Phase 1C | Demo-laptop measurement |
| Assessment-speech formatter, dedupe identity, and copy parity | Future reopened Phase 2 | Assessment formatter checks + browser evidence |
| Browser/VoiceOver versions and WCAG target | Before Phase 3 | QA matrix |
| Production-like offline launch command | Before Phase 4 | Clean-checkout rehearsal |
| Live media privacy exception, if needed | Before Phase 5 | Written staged-scene decision |

No open decision may weaken a cross-phase invariant.
