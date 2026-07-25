# PLAN.md — the phased build and handoff schedule

**Schedule authority.** Mutable phase windows and replanning branches live here. The fixed 17:30 freeze and 19:00 submission may repeat in safety and handoff docs. `docs/REQUIREMENTS.md` owns atomic acceptance, `docs/ARCHITECTURE.md` owns boundaries, `docs/STATUS.md` owns current evidence, and `docs/DEMO.md` owns the live presentation.

Two builders. **L** = integration/build lead. **D** = second developer. One owner controls a path at a time. Claim files and give handoffs through `docs/COLLABORATION.md`.

**Planned hard feature freeze: 17:30. Submission: 19:00.** At 18:03 the user explicitly reopened one bounded post-freeze feature, Phase 1E. That exception does not reopen any other product scope; packaging begins immediately after its verified increment or documented failure.

---

## 1. Phase map

| Phase | Normal-path window | State | Requirement scope | Exit gate |
|---|---|---|---|---|
| 0 — replay foundation | complete by 14:00 | Implemented | `EMB-P0-*` | Replay checks, lint, and build green; shell remains truthfully simulated |
| 1A — hardware/radiometry proof | closed at 15:25 | Complete investigation; pass gate blocked | `EMB-P1A-*` | No Y16/calibration proof; no-go recorded in `docs/HARDWARE-PROBE.md` |
| 1D — display-only UVC preview | 15:25–16:15 | Code complete; hardware gate blocked | `EMB-P1D-*` | Intended device did not play by cutoff; use Replay unless explicitly reopened and passed before freeze |
| 1E — experimental palette cue | reopened 18:03 | Post-freeze implementation in progress; hardware evidence open | `EMB-P1E-*` | Synthetic checks pass; attached behavior claimed only after two actual-browser staged runs |
| 1B — radiometric bridge/source | — | Blocked by 1A | `EMB-P1B-*` | Future only; do not implement at this hackathon |
| 1C — deterministic assessment | — | Blocked by 1A/1B | `EMB-P1C-*` | Future only; no display-pixel substitute |
| 2 — assessment speech | — | Blocked by 1C | `EMB-P2-*` | Future only; no spoken heat guidance |
| 3 — demo/accessibility QA | 16:15–17:00 | In progress; manual matrix open | `EMB-P3-*` | Both builders complete the locked demo and manual accessibility matrix |
| 4 — offline/failure hardening | 17:00–17:30 | In progress | `EMB-P4-*` | Every completed path runs twice; all required checks pass |
| **Feature freeze** | **17:30** | Passed; one explicit exception at 18:03 | — | Phase 1E only; no radiometric, assessment, speech, object-recognition, or unrelated polish work |
| 5 — package | 17:30–18:30 | Planned | `EMB-P5-*` | README, evidence, captioned recording, and form match frozen build |
| Submission buffer | 18:30–19:00 | Reserved | — | Submit; do not build |

### Dependency rule

```text
1A hardware probe
  ├─ calibrated radiometry proven → 1B bridge → 1C assessment → 2 speech
  │                                BLOCKED      BLOCKED         BLOCKED
  └─ calibrated radiometry unavailable → 1D display-only UVC preview
                                               ├─ 1E experimental palette cue
                                               └─ 3 QA → 4 hardening → 5 package
```

No builder skips a gate. Phase 0 remains the independent labelled fallback. Phase 1D proves only browser video transport and cleanup. Phase 1E may inspect its current live display only for a labelled near-white brightness cue; it has no route into radiometric validation or assessment.

### Recorded hardware-cutoff decision

At 15:25, Phase 1A was closed as a calibrated-radiometry no-go:

1. Stop Y16 bridge, calibration, assessment, and assessment-speech implementation.
2. Keep Phases 1B, 1C, and 2 blocked.
3. Do not present synthetic assessment fixtures or colorized display pixels as camera temperature output.
4. Use the remaining implementation window for Phase 1D display-only preview plus the existing replay fallback.
5. Preserve the exact preview and replay truth statements in UI, demo, recording, and submission.

### Recorded post-freeze scope decision

At 18:03 the user explicitly reopened one narrow feature after the 17:30 freeze:

1. Add **“Experimental palette brightness cue — not temperature or safety detection”** to the current playing live preview only.
2. Use deterministic near-white RGB coverage plus temporal hysteresis; add no model, YOLO, object recognition, or person suppression.
3. Require visible `!` + complete text before an explicitly enabled non-speech tone.
4. Keep Replay outside the sampler and keep all sampled pixels ephemeral, local, unlogged, and unpersisted.
5. Clear cue, sampler, hysteresis, and tone on every inactive lifecycle transition.
6. Preserve Phase 1D’s blocked attached-device gate and keep Phases 1B, 1C, and 2 blocked.

---

## 2. Phase 0 — repository reset and replay foundation

**Outcome:** one accessible, high-contrast source shell with a six-frame 160 × 120 simulated replay and honest empty history.

### Implemented

**L — source seam**

- [x] Replace legacy data shapes with Ember source, provenance, frame, and manifest contracts.
- [x] Add six committed replay PNGs and ordered metadata.
- [x] Implement replay start, pause, resume, stop, completion, and fresh-start behavior.
- [x] Add source-level replay verification.
- [x] Remove obsolete server/database/product dependencies and code.

**D — accessible shell**

- [x] Make `#scan` the default and keep `#history` as an honest empty surface.
- [x] Add Start, Pause, Resume, Restart, and Stop controls.
- [x] Keep exact replay provenance adjacent to every displayed frame.
- [x] Render source status through words and a non-color symbol.
- [x] Keep the assessment panel at “No current assessment”.

### Evidence and remaining verification debt

- [x] `npm run verify:replay`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Browser behavior was manually checked for route reload, controls, route cleanup, narrow layout, accessible names, and target sizing.
- [x] Extend replay verification to cover repeated `start()`/restart, bounded timer ownership, and emitted runtime-frame order.
- [ ] Record browser/operator/commit details when the manual replay matrix is rerun in Phase 3.

The two unchecked items improve reproducibility; they do not authorize live work or weaken replay provenance.

---

## 3. Phase 1A — prove the hardware before designing around it

**Outcome:** the investigation is complete and the calibrated-radiometry pass gate is blocked. No React warning is authorized.

### L — device probe owner

Owned paths: `docs/HARDWARE-PROBE.md`, `docs/SETUP.md`, hardware handoff.

- [x] Record macOS 26.5.2 arm64, GroupGets USB identity, PureThermal firmware `v1.3.0`, UVC interface classes, and the team-identified Lepton 3.5.
- [x] Record exact board revision and cable model as unknown instead of inventing them; USB enumeration proves the connection carries data.
- [x] Attempt metadata-only AVFoundation enumeration; this shell listed no video device or capture mode.
- [x] Record that no 160 × 120 Y16 buffer, calibrated Celsius conversion, frame aggregate, checksum, or orientation result was obtained.
- [x] Keep all frame bytes, screenshots, radiometric arrays, and scene data out of Git and logs.
- [x] Produce the privacy-safe no-go report with exact commands and per-requirement results.

### D — independent evidence reviewer

Owned paths: findings/handoff only until the probe passes.

- [x] Complete the proof-bundle checklist with explicit partial/failed/passed results.
- [x] Record dimensions, pixel count, encoding, byte order, calibration source, timestamp source, and orientation as unproven.
- [x] Reject “UVC,” “Y16,” or colorized pixels as Celsius evidence.
- [x] Select a browser MediaDevices display-only probe rather than a radiometric bridge; do not install a native bridge.
- [ ] Second human builder confirms the attached-device metadata and no-go before submission.

### Joint exit gate

- [x] Requirements `EMB-P1A-AC-001`, `002`, and `004` are explicitly failed; `003` passes by selecting the no-radiometry branch.
- [ ] Second human builder confirms the report; this does not change the blocked result.
- [x] `docs/DECISIONS.md` records device identity, missing calibration/orientation, and the display-only browser approach.
- [x] `docs/STATUS.md` marks the investigation complete and the calibrated gate blocked.

No numeric assessment policy enters code in Phase 1A.

---

## 4. Phase 1D — browser display-only preview

**Outcome:** the intended PureThermal UVC input either plays locally with persistent non-radiometric truth and complete cleanup, or Phase 1D is marked blocked and the team keeps replay only.

**Current state:** contracts, adapter, session, interface, and focused verification are complete. The Codex in-app browser could not present its camera-permission surface, so the exact attached-device label/settings, two playback runs, permission denial, unplug, and camera-indicator closure remain unchecked. The 16:15 cutoff blocked this hardware gate. The user’s later 18:03 Phase 1E exception does not retroactively pass it; actual-browser evidence remains required for any live claim.

Before implementation, **D** served as the sole contract editor for `src/types.ts`, `docs/SCHEMA.md`, and the matching decision entry. That review locked the replay-frame versus live-`MediaStream` viewport union; no stream fabricates thermal metadata.

### Contract and device lock — D, then joint review

- [x] Confirm the two-step flow: explicit authorization unlocks labels and immediately stops its unattached temporary stream; then the operator selects and opens the exact intended input.
- [ ] Record its browser-reported label and actual stream settings; do not assume 160 × 120.
- [x] Define `UvcPreviewSource` lifecycle, generation token, error codes, session-only device choice, exact active-track verification, track ownership, `srcObject` cleanup, page-hide handling, and pause-as-stop/reacquire semantics.
- [x] Keep Demo replay visibly selected on load/reload; require explicit Live preview selection and Start.
- [x] Lock exact adjacent copy: **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”**.

### L — preview adapter and lifecycle verifier

Owned paths: `src/lib/uvc-preview-source.ts`, focused preview contracts after handoff, `scripts/verify-uvc-preview.ts`.

- [x] Request `video` only through injected `MediaDevices`; never request audio or attach the authorize/discover stream.
- [x] Stop the authorize/discover tracks immediately, require operator selection, match the active track to the session-only `deviceId`, and fail explicitly on ambiguity or mismatch.
- [x] Implement Start, Pause/Resume reacquisition, Restart, Stop, disconnect, hidden/pagehide cleanup, and late-result rejection.
- [x] Stop all returned tracks, clear attachments, and remove every listener on each invalidation path.
- [x] Add plain Node fake-device checks for discovery cleanup, exact-device match, already-ended/during-playback track races, late permission resolution, pause/reacquire, disconnect, restart, the reusable `stop()`/generation boundary, hidden/pagehide behavior, detached playback-sink cleanup, and track/listener cleanup. React switching and route cleanup remain code/manual evidence.

### D — session, viewport, and accessible truth

Owned paths: `src/features/scan/**`, `src/styles/**`, `src/App.tsx` only if routing requires it.

- [x] Render replay frames with `<img>` and the live stream with `<video>` through a discriminated viewport surface.
- [x] Provide explicit Live preview selection, disclosure that authorization may briefly activate the default video input, **Authorize cameras**, an operator device chooser, Start, and Retry without ever attaching the temporary discovery stream.
- [x] Show the playing selected-track label, exact non-radiometric copy, status word + symbol, and explicit Retry.
- [x] Never leave a paused/stopped/error preview frame visible.
- [x] Keep every control keyboard-operable, named, visibly focused, and at least 44 × 44 CSS pixels.
- [x] Keep the assessment panel at **“No current assessment”**.
- [x] Phase 1D added no canvas, snapshot, recording, upload, storage, palette analysis, temperature, hotspot, direction, warning, or speech path. Phase 1E is a later separately gated exception.

### Joint exit gate

- [ ] All `EMB-P1D-AC-*` scenarios pass.
- [ ] Intended device plays twice and its camera indicator closes after Stop, route change, and page hide.
- [ ] Permission denial and unplug clear the viewport and offer explicit recovery.
- [x] Preview verifier, replay verifier, lint, and build pass.
- [x] The intended device was not selected and played by 16:15; mark the hardware gate blocked and rehearse Replay only unless the team explicitly reopens and passes it before freeze.

---

## 5. Phase 1E — experimental palette-brightness cue

**Outcome:** a staged live preview can demonstrate a deterministic near-white display cue without being presented as temperature, person, or safety detection.

**Current state:** the user authorized this exception at 18:03. Implementation and synthetic verification are complete and green. Actual attached-device behavior remains unverified until it runs in the normal demo browser.

### L — deterministic cue and verification

Owned paths: `src/lib/palette-cue.ts`, `scripts/verify-palette-cue.ts`, focused package scripts.

- [x] Lock inclusive near-white constants: RGB channels at least `248`, channel spread at most `6`, and qualifying coverage at least `1%`.
- [x] Enter after three consecutive qualifying samples and exit after two consecutive other samples.
- [x] Reset on invalid/empty RGBA input and expose no thermal, safety, object, or person semantics.
- [x] Add a plain Node verifier for RGBA validity, threshold boundaries, coverage, hysteresis, reset, and detector isolation.

### D — ephemeral sampler, visible cue, and additive tone

Owned paths: `src/features/scan/usePaletteCue.ts`, `src/features/scan/ScanView.tsx`, focused styles only if required.

- [x] Sample only the current playing live `<video>` into one bounded downscaled canvas; never sample Replay.
- [x] Keep the exact experimental label visible and retain both live non-radiometric statements plus **“No current assessment”**.
- [x] Render active state with a visible `!` and complete text that does not use heat, danger, direction, severity, or guidance language.
- [x] Start sound disabled; provide an accessible user control for a bounded non-speech tone.
- [x] Stop the sampler and tone, reset detector state/coverage, and clear the cue on inactive lifecycle transitions.
- [x] Retain no pixel buffers, frames, recordings, identifiers, logs, uploads, or persisted cue history.

### Joint exit gate

- [x] `npm run verify:palette`, `verify:preview`, `verify:replay`, lint, and build pass.
- [x] Code review confirms Replay isolation, one bounded sampler, additive audio, no YOLO/person branch, and lifecycle cleanup.
- [ ] The intended PureThermal input crosses and leaves the cue twice in a staged non-personal actual-browser run; otherwise attached behavior remains explicitly unverified.
- [ ] Demo, README, recording, and submission use the exact experimental label and do not say hot detection, temperature, danger, person exclusion, or safety warning.

---

## 6. Phase 1B — local bridge, live adapter, and session lifecycle

**State:** blocked by the Phase 1A result. Retained as future architecture; do not implement during this hackathon.

**Outcome:** a truthful live frame reaches the generic scan surface, while source selection and failure cannot leave stale state.

Before parallel coding, **D is the sole contract editor** for `src/types.ts`, `docs/SCHEMA.md`, and the matching `docs/DECISIONS.md` entry. L supplies bridge constraints and reviews/signs the diff before either lane implements it.

### Contract lock

- [ ] Source run identity and browser session generation are defined.
- [ ] Replay and decoded live frame variants cannot mix provenance/radiometry; Phase 1C’s assessment validator alone creates the narrower validated type.
- [ ] Structured source error codes and recovery semantics are defined.
- [ ] Live pause/resume behavior is defined.
- [ ] `ember-thermal.v1` handshake, atomic frame bytes, 256 KiB total/16 KiB header ceilings, staged parser, allowed origin, clock semantics, and lifecycle are fixture-testable.
- [ ] Display URL and radiometric buffer ownership are defined.
- [ ] Sequence gaps, duplicate/regression rejection, Resume credit IDs, run/credit/sequence acknowledgements, frame timeout, latest-capture retention, and transport extrema tolerance are defined.
- [ ] Demo replay is the visible non-persisted default; Live requires explicit selection and Start.

### L — native bridge and protocol producer

Owned paths: `native/purethermal-bridge/**`.

- [ ] Wrap only the reproduced Phase 1A capture path.
- [ ] Bind loopback only and accept one approved local client.
- [ ] Implement device/firmware/calibration `hello`.
- [ ] Implement start, pause, resume with a new credit ID, stop, status, error, run/credit/sequence frame-ack, and ping/pong controls.
- [ ] Send each frame atomically with normalized display bytes and row-major Celsius values.
- [ ] Send at most one in-flight frame; while awaiting matching ack, retain/replace only the newest unsent capture.
- [ ] Enforce 256 KiB total/16 KiB header ceilings before send and discard retained/in-flight credit state on pause/stop/error/run change.
- [ ] Stop frame delivery and emit a structured error on disconnect or calibration loss.
- [ ] Document exact launch and recovery commands.

### D — browser source and session consumer

Owned paths: `src/lib/purethermal-source.ts`, `src/lib/purethermal/**`, `src/features/scan/useThermalSession.ts`, focused protocol verifier.

- [ ] Parse in stages: total length → four-byte `DataView` → bounded header → offsets; only then create payload-sized views/copies, Blob/URL, or state.
- [ ] Recompute min/max, enforce the fixed transport-integrity tolerance, and place recomputed extrema on the frame.
- [ ] Implement `PureThermalSource` behind the shared lifecycle.
- [ ] Own and revoke live display `blob:` URLs.
- [ ] Add the monotonic frame-silence watchdog and fake-clock verifier.
- [ ] Add the controller generation guard and current-output invalidation.
- [ ] Keep Demo replay visibly preselected on load/reload; require explicit Live selection and never auto-fallback.
- [ ] Make view status/provenance source-generic while preserving exact replay copy.
- [ ] Ensure Pause clears current assessment and labels any retained image as paused; Resume rejects every old-credit frame/ack.
- [ ] Verify staged size rejection, pause/credit backpressure, extrema mismatch, clock skew, timeout, stop/restart/switch/error/route changes, and resource release.

### Joint exit gate

- [ ] All `EMB-P1B-AC-*` fixtures pass.
- [ ] One live display frame reaches `#scan` without the view parsing the protocol.
- [ ] Live radiometric data is present at the validation boundary but creates no assessment yet.
- [ ] Disconnect clears current output before `error`.
- [ ] Explicit Replay selection displays exact provenance and makes no live connection.
- [ ] Protocol verifier, replay verifier, lint, and build pass.

---

## 7. Phase 1C — deterministic validation and assessment

**Outcome:** one device-validated policy turns only current live radiometry into one structured spatial assessment.

**State:** blocked by Phases 1A and 1B. A colorized preview cannot satisfy this gate.

### Policy lock before warning integration

Both builders use controlled non-personal scenes to decide and record:

- [ ] Threshold basis and active assessment level(s).
- [ ] Connected-neighbor rule and minimum region area.
- [ ] Persistence count and candidate matching rule.
- [ ] Sequence-gap reset and freshness budget.
- [ ] Strongest-region order and complete tie-break.
- [ ] Exact 3 × 3 spatial boundaries.
- [ ] Policy version and assessment current-lifetime budget. Transport min/max integrity is already locked in Phase 1B and is not a heat threshold.

Replay PNGs and their simulated min/max values are forbidden inputs to this decision.

### D — deterministic engine and session currentness

Owned paths: `src/lib/thermal-assessment.ts`, `src/features/scan/useThermalSession.ts`, `scripts/verify-thermal-assessment.ts`.

- [ ] Accept decoded live frames and narrow them inside the assessment validator; only successful validation reaches analysis.
- [ ] Implement pure per-frame candidate extraction.
- [ ] Implement an explicit deterministic persistence reducer and reset.
- [ ] Select one strongest qualifying region with a stable tie-break.
- [ ] Map its centroid to upper/middle/lower × left/center/right.
- [ ] Produce a current structured assessment tied to run, frame, time, provenance, and policy.
- [ ] Derive assessment identity/monotonic expiry from deterministic inputs.
- [ ] Add the generation/run/assessment-keyed one-shot expiry timer to the session controller.
- [ ] Verify fake-clock expiry without a new frame; malformed, replay, stale, transient, duplicate, and old-run input fails closed.

### L — integration and safety presentation

Owned paths: `src/features/scan/ScanView.tsx`, focused scan presentation components, `src/lib/safety-presentation.ts`.

- [ ] Render only controller-produced current assessments; do not bypass the session hook.
- [ ] Render canonical observable summary + conservative guidance + non-color symbol + reinforcing color.
- [ ] Keep “No current assessment” for replay, invalid, expired, or absent data.
- [ ] Ensure no UI helper or free-form message creates a second classification path.

Before L edits the scan presentation, D hands off the exact Phase 1B session-hook commit and its protocol/currentness checks. D retains `useThermalSession.ts` ownership through Phase 1C; L does not edit it.

### Joint exit gate

- [ ] Requirements `EMB-P1C-AC-001` through `005` pass.
- [ ] A controlled warm object produces a stable assessment only after persistence.
- [ ] Moving the object updates the deterministic direction.
- [ ] Invalidating the run removes guidance before it can be stale.
- [ ] Assessment, protocol, replay, lint, and build checks pass.
- [ ] No copy promises touch safety or identifies an object.

---

## 8. Phase 2 — spoken interaction

**Outcome:** speech is an optional renderer of the same canonical structured state visible on screen.

**State:** product assessment speech is blocked by Phase 1C. Do not speak heat guidance from Phase 1D pixels.

Phase 1C is blocked. Do not add a formatter, product speech controls, synthetic assessment fixture, or staged warning during this hackathon. The rows below are retained as future work only.

### L — formatter and speech adapter

- [ ] Define one pure assessment-to-`SafetyPresentation` formatter.
- [ ] Implement browser speech feature detection behind a small adapter.
- [ ] Deduplicate semantically equivalent current assessments.
- [ ] Lock and verify a minimum announcement interval.
- [ ] Cancel speech on replacement, expiry, pause, stop, error, switch, route change, page hide, and mute.
- [ ] Verify through a fake synthesizer; add no model endpoint.

### D — accessible controls and live regions

- [ ] Add speech enable, Mute, and Repeat with visible state and accessible names.
- [ ] Keep complete warning text + symbol when speech is unavailable or muted.
- [ ] Use polite status for routine source changes and assertive output only for a new urgent validated warning.
- [ ] Prevent duplicate VoiceOver and Ember speech announcements.
- [ ] Announce replay provenance/source failure as status, never as an assessment.

### Exit gate

- [ ] Applicable `EMB-P2-AC-*` scenarios pass and blocked live-only rows are labelled not applicable.
- [ ] On the live branch, visible and spoken copy match one structured live assessment.
- [ ] Repetition, staleness, mute, and unavailable TTS behave correctly.
- [ ] Replay may speak provenance but never thermal guidance.

No Phase 2 fallback is authorized for the current build.

---

## 9. Phase 3 — demo flow and accessibility QA

**Outcome:** both builders can run the supported path, and a blind/low-vision interaction does not depend on color, speech, or precision pointing.

No architecture refactor begins in this phase.

### D — manual accessibility matrix

- [ ] Lock and record OS, browser/version, VoiceOver version, viewport, and commit.
- [ ] Run every action from passed gates by keyboard only in a logical focus order.
- [ ] Verify visible focus and 44 × 44 targets.
- [ ] Test VoiceOver labels, state, provenance, and status; test warning and announcement count only if Phase 1C/2 passed.
- [ ] Test with Ember speech muted, then enabled if Phase 2 passed.
- [ ] Test 200% zoom and 320–390px reflow.
- [ ] Verify replay images and any live `<video>` never receive keyboard focus or carry essential meaning.
- [ ] Test with color unavailable and audio muted.
- [ ] If Phase 1D passed, verify exact selected-device label, both non-radiometric statements, **“No current assessment”**, permission/error status, and Stop/Retry without color or audio.

### L — demo operator and evidence

- [ ] Rehearse `docs/DEMO.md` with a heating pad, reusable hand warmer, or warm mug.
- [ ] If Phase 1D passed, rehearse explicit preview failure → labelled replay fallback and confirm the camera indicator closes.
- [ ] If Phase 1C passed, confirm no stale assessment survives expiry, switching, or stop.
- [ ] Capture only evidence permitted by the privacy boundary.
- [ ] Have both builders run the three-minute script independently.

### Exit gate

- [ ] Applicable `EMB-P3-AC-*` scenarios pass; live warning/speech rows are marked blocked/not applicable when their upstream gate failed.
- [ ] Manual evidence identifies environment and limitations.
- [ ] Both builders can explain what is live, simulated, verified, and planned.

---

## 10. Phase 4 — offline and failure hardening

**Outcome:** every completed capability is local, recoverable, resource-bounded, and repeatable at freeze.

### L — production and resource verification

- [x] Lock and run the production-like local command: `npm run demo:offline`.
- [ ] Disconnect the network and run Replay twice with a reload between runs.
- [x] Mark the intended-UVC offline row not applicable because Phase 1D’s attached-device gate did not pass.
- [x] Run five fixture-driven lifecycle cycles; resource spies return to zero after each stop for replay timers and fake preview tracks/listeners/element attachments. The preview result hardens code but does not pass the hardware gate.
- [x] Run every verifier required by completed phases, then lint and build through `npm run verify:hardening`.
- [ ] Hand the exact command output and frozen commit candidate to D.

### D — manual failure and truth audit

- [ ] Reload `#scan` and `#history` with the network physically disconnected.
- [x] Mark Phase 1D’s attached-device failure matrix not applicable to Phase 4 because its hardware gate did not pass; retain fake-source verification as code evidence only.
- [x] Mark Phase 2 speech offline verification not applicable because Phase 2 did not pass.
- [x] Update `docs/STATUS.md` with each Phase 4 gate marked passed, in progress, blocked, or not applicable.
- [ ] Have D review the frozen candidate and evidence.

### Joint freeze gate

- [ ] Applicable `EMB-P4-AC-*` scenarios pass.
- [ ] Both builders sign the handoff and freeze at 17:30 even if a polish item remains.

### Evidence recorded at 17:01

- `npm run verify:hardening` passed the replay, preview, lint, production-build, and local-build dependency checks.
- Detached commit `ed19552` passed `npm ci --offline` followed by the complete hardening suite.
- Replay timers and fake preview resources returned to zero after each of five cycles.
- The production server completed Replay twice with a reload between runs; `#scan` and `#history` both survived reload and rendered only local asset references.
- External networking remained connected during the browser rehearsal. `EMB-P4-FR-001`, `FR-004`, and `AC-001` therefore remain open until a human repeats it after physically disconnecting networking.
- Phase 1D, Phase 1B, and Phase 2 conditional rows are not applicable; they are not simulated as passes.

### Cut order

1. LLM explanation—already out of the decision path.
2. Persistent history.
3. Temperature chart polish.
4. Multiple-hotspot narration.
5. Additional severity bands without evidence.

### Never weaken

- Deterministic classification for any live warning claim.
- Visible text + non-color symbol.
- Exact replay provenance.
- Exact live non-radiometric provenance and no-assessment copy.
- Fail-closed stale/error behavior.
- Honest replay-only fallback if live work is blocked.

---

## 11. Phase 5 — package the frozen truth

**Outcome:** a judge can reproduce the supported build and distinguish every live, simulated, verified, planned, and blocked capability.

### L · 17:30–18:00 — README and evidence

- [ ] Keep the locked track-fit sentence first.
- [ ] Add the final live-versus-simulated truth table.
- [ ] Describe problem, target user, architecture, accessibility, safety, privacy, and limitations.
- [ ] Include only screenshots supported by passed gates.
- [ ] Prefer frame-free live status evidence; document any staged-scene media exception.
- [ ] Verify all links and clean-checkout commands against the frozen commit.
- [ ] Hand README/evidence paths and frozen commit identity to D; make no product-code edit.

### D · 18:00–18:30 — recording and form

- [ ] Record a 90-second captioned demo.
- [ ] Keep replay provenance visible and call it simulated in captions.
- [ ] Do not claim blocked live/speech/accessibility behavior.
- [ ] Complete the event form.
- [ ] Have L review the final captions and claim matrix before upload.

### Both · 18:30–19:00 — submission buffer

- [ ] Upload, review, and submit.
- [ ] Record successful submission evidence and confirm all `EMB-P5-AC-*` scenarios.
- [ ] Make no product change.

---

## 12. Integration cadence

At each phase boundary:

1. Each owner gives the handoff in `docs/COLLABORATION.md`.
2. The other builder reviews safety, provenance, source/data truth, cleanup, and claim accuracy.
3. The integration owner runs focused checks, replay verification, lint, and build.
4. Update `docs/STATUS.md`.
5. Append a decision for contract changes, failed gates, threshold/policy choices, or surprising hardware behavior.
6. Commit the working increment to the shared integration history; one integration owner pushes.

Do not merge an unreviewed shared-contract change or let two lanes edit the same path.

---

## 13. Standing rules

- Never claim that an object is safe to touch.
- Deterministic code owns classification; generated language cannot change it.
- Text + symbol are required; color and speech reinforce them.
- Phase 1E is a non-semantic display-brightness cue, not classification: no temperature, direction, severity, guidance, person exclusion, or all-clear.
- Live streams, tracks, frames, and radiometric arrays are ephemeral and local. A reviewed external staged Phase 5 recording does not authorize in-app capture.
- Replay is visibly and audibly simulated and never enters analysis.
- No smart plug, relay, notification, cloud frame store, or autonomous action.
- No runtime dependency without explicit approval.
- No live capability claim crosses an incomplete phase gate.
