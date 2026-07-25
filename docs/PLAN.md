# PLAN.md — the build, in phases

**The only schedule.** `docs/DEMO.md` says what done looks like; `docs/ARCHITECTURE.md` says where code goes; this says what happens next and in what order.

Two people. **L** = build lead. **D** = second dev. Check boxes as you go. Log contract changes and surprises in `docs/DECISIONS.md`.

**Freeze is 17:30, not 19:00.** The last ninety minutes are README, captioned recording, and the submission form.

---

## Phase status

| # | Phase | Window | Exit gate |
|---|---|---|---|
| 0 | Repository reset + replay foundation | now → 14:00 | Replay lifecycle works; three verification commands green |
| 1 | PureThermal bridge + hotspot analysis | 14:00 → 15:30 | Live radiometric frame produces a deterministic assessment |
| 2 | Spoken interaction | 15:30 → 16:15 | Speech and screen express the same assessment |
| 3 | Demo flow + accessibility QA | 16:15 → 17:00 | Full demo works by keyboard and with a screen reader |
| 4 | Offline hardening | 17:00 → 17:30 | Live and replay paths each run twice |
| — | **HARD FEATURE FREEZE** | **17:30** | No more product code |
| 5 | Package | 17:30 → 18:30 | README, recording, submission form |
| — | Buffer | 18:30 → 19:00 | Submit; do not build |

---

## Phase 0 — Repository reset + replay foundation · now → 14:00

The source contract ships before the device bridge. One UI, two transports.

**L — source seam**

- [x] Replace legacy data shapes with `SourceStatus`, `ThermalProvenance`, `ThermalFrame`, and `ThermalSource`.
- [x] Add future seams: `Hotspot`, `ThermalAssessment`, `AgentMessage`, `SafetyAction`.
- [x] Add six 160 × 120 simulated PNGs and `emberReplayManifest`.
- [x] Implement `ReplayThermalSource` with start, pause, resume, stop, restart support, deterministic completion, and timer cleanup.
- [x] Add `scripts/verify-replay.ts` and `npm run verify:replay`.
- [x] Remove unused server, database, and obsolete fixture code.

**D — accessible shell**

- [x] Make `#scan` the default route and preserve hash routing on reload.
- [x] Build a high-contrast viewport with source status and persistent **“Demo replay — not live”** provenance.
- [x] Add Start, Pause, Resume, Restart, and Stop controls: keyboard operable, visible focus, accessible names, 44 × 44 minimum.
- [x] Add `#history` with an honest no-persistence empty state.
- [x] Remove obsolete views and language.
- [x] Rewrite the source-of-truth docs for Ember.

**Exit gate**

- [x] `npm run verify:replay`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Replay completes, pause/resume preserves position, restart begins at frame one, stop returns idle.
- [x] Navigating away from `#scan` invokes source cleanup and leaves no timer running.
- [x] Provenance remains visible throughout playback.
- [x] No warning or temperature claim is inferred from PNG pixels.

### Foundation merge

One owner confirms the other lane’s files before committing. Push the verified foundation only to the shared `codex/ember` integration branch; do not push directly to `main`.

---

## Phase 1 — PureThermal bridge + hotspot analysis · 14:00 → 15:30

**Why native:** browser video APIs are not assumed to preserve the Lepton’s radiometric Y16 values. Display pixels and analysis values are separate payloads.

**L — native source**

- [ ] Identify the exact PureThermal board and current firmware before choosing a capture example.
- [ ] Enumerate the UVC device and prove one 160 × 120 Y16 frame outside React.
- [ ] Build a local-only bridge that emits frame identity, sequence, timestamp, display image, radiometric grid, min/max, and live provenance.
- [ ] Implement `PureThermalSource` against the existing callback contract.
- [ ] On disconnect, stop emitting frames and transition to `error`; never retain the last frame as current.

**D — deterministic analysis**

- [ ] Reject frames with wrong dimensions, missing radiometric values, non-finite values, or stale timestamps.
- [ ] Implement hotspot extraction and persistence across frames.
- [ ] Map hotspot centroid to coarse spatial language: left / center / right and upper / middle / lower.
- [ ] Render assessment as word + symbol + color. No classification is model-generated.
- [ ] Keep the exact threshold configuration in deterministic code and log any device-driven change in `DECISIONS.md`.

**Exit gate**

- [ ] A live frame reaches the existing `#scan` surface without transport-specific UI code.
- [ ] One controlled warm object produces a stable structured assessment.
- [ ] Disconnect and reconnect are explicit, recoverable states.
- [ ] No copy promises touch safety.

**If Y16 is not proven by 15:00:** stop bridge debugging. Keep the labelled replay for the submission and describe the live adapter as next work. Do not convert display PNG colors into fake temperatures.

---

## Phase 2 — Spoken interaction · 15:30 → 16:15

Speech is a renderer of structured state, not a second decision system.

**L**

- [ ] Define a pure assessment-to-utterance formatter.
- [ ] Deduplicate repeated assessments and rate-limit announcements.
- [ ] Cancel stale speech when the assessment, route, or source changes.
- [ ] Announce source errors and replay provenance.

**D**

- [ ] Add speak, mute, and repeat controls with accessible names and visible state.
- [ ] Keep complete warning text on screen when speech is unavailable.
- [ ] Use a polite live region for source status and an assertive region only for urgent warnings.
- [ ] Verify keyboard and VoiceOver operation.

**Exit:** one structured assessment produces matching visible and spoken language; muting affects speech only.

---

## Phase 3 — Demo flow + accessibility QA · 16:15 → 17:00

- [ ] Rehearse `docs/DEMO.md` with a heating pad, reusable hand warmer, or warm mug.
- [ ] Run every control by keyboard only.
- [ ] Run the full flow with VoiceOver; confirm labels, order, live regions, and no duplicate announcements.
- [ ] Verify status is understandable without color and without speech.
- [ ] Check 200% zoom and narrow viewport reflow.
- [ ] Confirm focus never enters the thermal image.
- [ ] Capture screenshots while the build is known good.

**Exit:** two people can independently run the three-minute demo without explanation from the builder.

---

## Phase 4 — Offline hardening · 17:00 → 17:30

- [ ] Unplug the network and run the labelled replay twice.
- [ ] Run the live hardware path twice if Phase 1 passed.
- [ ] Unplug the camera mid-stream and verify the UI enters `error`, stops stale output, and can recover.
- [ ] Reload `#scan` and `#history`.
- [ ] Run `npm run verify:replay`, `npm run lint`, and `npm run build`.
- [ ] Freeze at 17:30 even if a polish item remains.

**Cut order:** LLM explanation → persistent history → temperature chart polish → multi-hotspot narration.

**Never cut:** deterministic classification, redundant warning output, replay provenance, or the offline fallback.

---

## Phase 5 — Package · 17:30 → 18:30

- [ ] README first line states track fit:
  > Ember widens independent access to everyday spaces by giving blind and low-vision people a non-contact way to locate higher heat before reaching toward it.
- [ ] Show the product, accessibility behavior, architecture, and what is live versus simulated.
- [ ] Include one screenshot of the live path if proven and one clearly labelled replay screenshot.
- [ ] Record a 90-second captioned demo.
- [ ] Complete and submit the form.
- [ ] Use 18:30–19:00 only as submission buffer.

---

## Standing rules

- Never claim an object is safe to touch.
- Deterministic code owns classification; generated language cannot change it.
- Text + symbol are required; color and speech reinforce them.
- Frames are ephemeral unless an explicit later privacy decision changes that.
- No smart plug, relay, cloud frame store, or autonomous physical action.
- No new dependency without asking.
- Commit after every working increment; append the handoff to `docs/DECISIONS.md`.
