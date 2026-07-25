# PLAN.md — the phased build and handoff schedule

**Schedule authority.** Mutable phase windows and replanning branches live here. The fixed 17:30 freeze and 19:00 submission may repeat in safety and handoff docs. `docs/REQUIREMENTS.md` owns atomic acceptance, `docs/ARCHITECTURE.md` owns boundaries, `docs/STATUS.md` owns current evidence, and `docs/DEMO.md` owns the live presentation.

Two builders. **L** = integration/build lead. **D** = second developer. One owner controls a path at a time. Claim files and give handoffs through `docs/COLLABORATION.md`.

**Hard feature freeze: 17:30. Submission: 19:00.** The final ninety minutes are documentation, captioned recording, and submission—not unfinished product work.

---

## 1. Phase map

| Phase | Normal-path window | State | Requirement scope | Exit gate |
|---|---|---|---|---|
| 0 — replay foundation | complete by 14:00 | Implemented | `EMB-P0-*` | Replay checks, lint, and build green; shell remains truthfully simulated |
| 1A — hardware/radiometry proof | 14:00–14:30 | Next | `EMB-P1A-*` | Exact board/firmware plus calibrated 160 × 120 radiometry reproduced outside React |
| 1B — bridge/source integration | 14:30–15:00 | Gated by 1A | `EMB-P1B-*` | One live frame crosses a versioned loopback source; disconnect and switching are correct |
| 1C — deterministic assessment | 15:00–15:30 | Gated by 1B | `EMB-P1C-*` | Hardware-validated policy yields one stable structured live assessment |
| 2 — spoken interaction | 15:30–16:15 | Gated by 1C for live claims | `EMB-P2-*` | Screen and speech render the same current assessment |
| 3 — demo/accessibility QA | 16:15–17:00 | Planned | `EMB-P3-*` | Both builders complete the locked demo and manual accessibility matrix |
| 4 — offline/failure hardening | 17:00–17:30 | Planned | `EMB-P4-*` | Every completed path runs twice; all required checks pass |
| **Feature freeze** | **17:30** | Hard stop | — | No product code changes |
| 5 — package | 17:30–18:30 | Planned | `EMB-P5-*` | README, evidence, captioned recording, and form match frozen build |
| Submission buffer | 18:30–19:00 | Reserved | — | Submit; do not build |

### Dependency rule

```text
1A calibrated radiometry
  → 1B live transport
    → 1C deterministic assessment
      → 2 live assessment speech
        → 3 live demo acceptance
```

No builder skips a gate. Phase 0 independently supports the replay-only fallback through Phases 3–5.

### 15:00 live cutoff

**14:30 checkpoint:**

- If Phase 1A passes, follow the normal windows above.
- If it has not passed, L may continue the hardware proof until 15:00 while D immediately starts the replay-only lane: extend replay verification, prepare the Phase 3 QA record, and harden truth/evidence docs.
- If Phase 1A passes between 14:30 and 15:00, replan Live to Phase 1B from 15:00–15:30 and Phase 1C from 15:30–16:15. Product speech is cut; only a clearly synthetic formatter check may occur. Phase 3 still begins at 16:15.

If Phase 1A has not proven calibrated radiometry by **15:00**:

1. Stop bridge debugging.
2. Mark Phases 1B and 1C blocked in `docs/STATUS.md`.
3. Do not present synthetic assessment fixtures as camera output.
4. L owns replay verifier/offline rehearsal; D owns accessibility QA and pitch/evidence docs, with disjoint claims recorded in the handoff.
5. Describe the bridge and assessment as the next milestone.

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
- [x] Keep the assessment panel at “No current assessment.”

### Evidence and remaining verification debt

- [x] `npm run verify:replay`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Browser behavior was manually checked for route reload, controls, route cleanup, narrow layout, accessible names, and target sizing.
- [ ] Extend replay verification to cover repeated `start()`/restart and emitted runtime-frame mapping.
- [ ] Record browser/operator/commit details when the manual replay matrix is rerun in Phase 3.

The two unchecked items improve reproducibility; they do not authorize live work or weaken replay provenance.

---

## 3. Phase 1A — prove the hardware before designing around it

**Outcome:** reproducible evidence that the exact device yields calibrated, correctly oriented 160 × 120 radiometry. No React warning is built in this phase.

### L — device probe owner

Owned paths: future `native/purethermal-bridge/**`, `docs/SETUP.md`, hardware handoff.

- [ ] Inspect and record board revision, Lepton module, firmware, USB identity, host OS, and cable.
- [ ] Enumerate the exact capture modes.
- [ ] Reproduce one 160 × 120 Y16 frame outside React.
- [ ] Determine whether values are calibrated Celsius-capable radiometry or raw counts.
- [ ] Record conversion/calibration evidence and active mode.
- [ ] Verify display/grid orientation using left/right and upper/lower placement.
- [ ] Produce the privacy-safe proof bundle: exact commit/command, device/mode/host, calibration source, aggregate pixel/finite counts, min/max, one-way checksum, and orientation results.
- [ ] Keep live frame bytes and radiometric arrays out of Git and logs.

### D — independent evidence reviewer

Owned paths: findings/handoff only until the probe passes.

- [ ] Reproduce the capture or complete the fixed proof-bundle checklist with an explicit pass/fail for every field.
- [ ] Confirm dimensions, pixel count, encoding, byte order, calibration source, timestamp source, and orientation are explicit.
- [ ] Reject “Y16 means Celsius” reasoning without calibration evidence.
- [ ] Draft the smallest bridge-language recommendation based on the reproduced path; do not install it into the web app.

### Joint exit gate

- [ ] Requirements `EMB-P1A-AC-001` through `004` pass.
- [ ] Second builder reproduces or reviews the proof.
- [ ] `docs/DECISIONS.md` records device identity, calibration result, orientation, and selected bridge approach.
- [ ] `docs/STATUS.md` marks the gate passed or blocked.

No numeric assessment policy enters code in Phase 1A.

---

## 4. Phase 1B — local bridge, live adapter, and session lifecycle

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

## 5. Phase 1C — deterministic validation and assessment

**Outcome:** one device-validated policy turns only current live radiometry into one structured spatial assessment.

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

## 6. Phase 2 — spoken interaction

**Outcome:** speech is an optional renderer of the same canonical structured state visible on screen.

If Phase 1C is blocked, do not add product speech controls or stage a warning. L may verify the pure formatter against an explicitly synthetic structured object; record the result as **formatter verified / product speech blocked**. D continues the replay accessibility lane.

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

The formatter-only fallback is not a Phase 2 product pass and no submission surface may present it as camera behavior.

---

## 7. Phase 3 — demo flow and accessibility QA

**Outcome:** both builders can run the supported path, and a blind/low-vision interaction does not depend on color, speech, or precision pointing.

No architecture refactor begins in this phase.

### D — manual accessibility matrix

- [ ] Lock and record OS, browser/version, VoiceOver version, viewport, and commit.
- [ ] Run every action from passed gates by keyboard only in a logical focus order.
- [ ] Verify visible focus and 44 × 44 targets.
- [ ] Test VoiceOver labels, state, provenance, and status; test warning and announcement count only if Phase 1C/2 passed.
- [ ] Test with Ember speech muted, then enabled if Phase 2 passed.
- [ ] Test 200% zoom and 320–390px reflow.
- [ ] Verify thermal images never receive keyboard focus or carry essential meaning.
- [ ] Test with color unavailable and audio muted.

### L — demo operator and evidence

- [ ] Rehearse `docs/DEMO.md` with a heating pad, reusable hand warmer, or warm mug.
- [ ] If Phase 1B passed, rehearse the explicit live failure → labelled replay fallback.
- [ ] If Phase 1C passed, confirm no stale assessment survives expiry, switching, or stop.
- [ ] Capture only evidence permitted by the privacy boundary.
- [ ] Have both builders run the three-minute script independently.

### Exit gate

- [ ] Applicable `EMB-P3-AC-*` scenarios pass; live warning/speech rows are marked blocked/not applicable when their upstream gate failed.
- [ ] Manual evidence identifies environment and limitations.
- [ ] Both builders can explain what is live, simulated, verified, and planned.

---

## 8. Phase 4 — offline and failure hardening

**Outcome:** every completed capability is local, recoverable, resource-bounded, and repeatable at freeze.

### L — production and resource verification

- [ ] Lock and run the production-like local command.
- [ ] Disconnect the network and run Replay twice with a reload between runs.
- [ ] If Phase 1B passed, run Live twice using only the local bridge.
- [ ] Run five fixture-driven lifecycle/source-switch cycles; resource spies return to zero after each stop for timers, sockets/listeners, object URLs, borrowed grids, retained captures/credits, expiry timers, and speech.
- [ ] Run every verifier required by completed phases, then lint and build.
- [ ] Hand the exact command output and frozen commit candidate to D.

### D — manual failure and truth audit

- [ ] Reload `#scan` and `#history` with the network disconnected.
- [ ] If Phase 1B passed, test bridge absent, device unplug, calibration unavailable, malformed/oversized/stale/out-of-order frames, silent frame timeout, and hidden page.
- [ ] If Phase 1B passed, deliberately switch failed Live → Replay and verify old frame, assessment, speech, and provenance are gone first.
- [ ] If Phase 2 passed, verify the selected voice works without network or record app speech unavailable while visible output remains complete.
- [ ] Update `docs/STATUS.md` with each gate marked passed, blocked, or not applicable and review the frozen candidate.

### Joint freeze gate

- [ ] Applicable `EMB-P4-AC-*` scenarios pass.
- [ ] Both builders sign the handoff and freeze at 17:30 even if a polish item remains.

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
- Fail-closed stale/error behavior.
- Honest replay-only fallback if live work is blocked.

---

## 9. Phase 5 — package the frozen truth

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

## 10. Integration cadence

At each phase boundary:

1. Each owner gives the handoff in `docs/COLLABORATION.md`.
2. The other builder reviews safety, provenance, source/data truth, cleanup, and claim accuracy.
3. The integration owner runs focused checks, replay verification, lint, and build.
4. Update `docs/STATUS.md`.
5. Append a decision for contract changes, failed gates, threshold/policy choices, or surprising hardware behavior.
6. Commit the working increment to the shared integration history; one integration owner pushes.

Do not merge an unreviewed shared-contract change or let two lanes edit the same path.

---

## 11. Standing rules

- Never claim that an object is safe to touch.
- Deterministic code owns classification; generated language cannot change it.
- Text + symbol are required; color and speech reinforce them.
- Live frames and radiometric arrays are ephemeral and local.
- Replay is visibly and audibly simulated and never enters analysis.
- No smart plug, relay, notification, cloud frame store, or autonomous action.
- No runtime dependency without explicit approval.
- No live capability claim crosses an incomplete phase gate.
