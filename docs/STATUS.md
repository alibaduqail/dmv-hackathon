# STATUS.md — where the build actually is

**Current baseline:** Phase 0 is committed on the Ember integration branch. Phase 1A investigation is complete with a calibrated-radiometry **no-go**: macOS recognizes the attached GroupGets PureThermal UVC interfaces, but Ember has no Y16 frame, calibration mapping, capture orientation, or temperature evidence. Phase 1D display-only browser preview is next; radiometric bridge, assessment, and assessment speech are blocked.

This is the cold-start briefing. It does not repeat `docs/PLAN.md` (the schedule) or `docs/DECISIONS.md` (the running log). It says what exists, what is next, and what remains unproven.

---

## 1. Done

| Area | Result |
|---|---|
| Repository pivot | Obsolete API, database, fixtures, feature views, dependencies, and product language removed; Git history is the archive |
| Source contract | `SourceStatus`, provenance, frame, manifest, callbacks, and `ThermalSource` live in `src/types.ts` |
| Replay fixture | Six committed simulated PNGs, 160 × 120, with ordered finite metadata and exact non-live provenance |
| Replay runtime | `ReplayThermalSource` supports start, pause, resume, stop, restart-by-start, deterministic completion, and timer cleanup |
| Scan shell | `#scan` is default; high-contrast viewport, text status, source symbol, progress, and five controls |
| Privacy shell | `#history` truthfully states that no frames or incidents are stored |
| Accessibility foundation | Skip link, semantic landmarks, live status, text + symbol status, visible focus, 44px-or-larger controls, reduced-motion support |
| Browser QA | Scan/history reload, replay controls, route cleanup, 390px layout, accessible names, control sizing, and console errors were manually checked; environment details must be recorded when rerun in Phase 3 |
| Documentation | Product, atomic phased requirements, safety boundary, implemented schema, target architecture, schedule, demo, setup, references, and decisions describe Ember |
| Collaboration | Repo-local `ember-collaboration` skill, partner onboarding, lane ownership, handoff template, and verified optional agent-tool guide |
| Phase 1A probe | macOS 26.5.2 arm64 sees GroupGets `PureThermal (fw:v1.3.0)`, vendor/product `0x1e4e/0x0100`, with UVC control/streaming interfaces owned by `UVCAssistant`; exact board revision and capture mode remain unknown |
| Phase 1A decision | No Y16 or calibrated-Celsius proof exists. Acceptance `AC-003` passes by choosing the no-radiometry branch; the other radiometric acceptance rows fail and block Phases 1B/1C/2 |

**Verification actually run:**

```text
npm run verify:replay  →  green
npm run lint           →  green
npm run build          →  green
```

Production build: 20 modules, 203.83 kB JavaScript / 63.70 kB gzip, 15.20 kB CSS / 4.04 kB gzip.

### What runs now

`npm run dev` starts Vite. Opening the printed URL with an empty or unknown hash renders the default `#scan` surface.

- Idle starts with no frame in memory.
- Start clears old state, emits six replay frames, and ends.
- Pause holds the current frame; Resume continues from the next frame.
- Restart begins from frame one.
- Stop cancels pending work, returns idle, and clears the visible frame.
- The viewport and frame alt text both identify the sequence as simulated.
- **“Demo replay — not live”** appears above the viewport and again over every displayed frame.
- The assessment panel always says **“No current assessment”**. PNG pixels do not create warnings.

`#history` renders an empty state and explains the local, ephemeral frame policy.

---

## 2. Next

**Phase 1D · non-radiometric live preview.**

The first task is still a device gate: explicitly authorize camera discovery, stop the unattached temporary stream, have the operator select the intended PureThermal-labelled input, open that session-only `deviceId`, verify the active track matches, and record only its label plus sanitized display settings. The Phase 1A shell probe did not enumerate an AVFoundation video device, so browser playback is planned—not yet claimed.

If the intended input plays:

1. Add a distinct `UvcPreviewSource` around `navigator.mediaDevices`; do not reuse `PureThermalSource`.
2. Model the viewport as either a replay frame or live `MediaStream`; do not fabricate temperature fields.
3. Keep Demo replay selected by default. Live preview requires explicit selection and Start.
4. Keep **“Live thermal preview — non-radiometric”** and **“Display-only colorized video. No temperature or safety assessment.”** adjacent to the video.
5. Stop every media track and clear the viewport on discovery completion, Pause, Stop, Restart, switch, error, route change, hidden/pagehide, and unmount.
6. Keep the assessment panel at **“No current assessment”**.
7. Verify permission denial, wrong camera, unplug, late permission results, keyboard operation, track cleanup, replay verification, lint, and build.

If the intended device cannot play by the Phase 1D cutoff, mark it blocked and run the existing labelled replay only.

---

## 3. Open risks

| # | Risk | Owner / response |
|---|---|---|
| 1 | Browser visibility and playback of the intended PureThermal UVC input are unproven | L — run the explicit-permission Phase 1D preflight before coding the adapter |
| 2 | FFmpeg/AVFoundation listed no video devices in this Codex shell despite macOS UVC attachment | L — do not call the webcam path working until browser evidence identifies the exact input |
| 3 | A display-only `MediaStream` does not fit the discrete `ThermalFrame` contract | D — lock a discriminated viewport/session contract; never fabricate `minC`/`maxC` |
| 4 | Radiometric Phase 1B, deterministic Phase 1C, and assessment speech are blocked | both — preserve them as future architecture, not hackathon behavior |
| 5 | A visual-only feed does not yet deliver the core blind-user directional warning | docs/demo owner — state this limitation plainly in the pitch and submission |
| 6 | Permission denial, camera ambiguity, unplug, late results, and media-track cleanup are unimplemented | L/D — required Phase 1D failure and lifecycle gates |
| 7 | 200% zoom and VoiceOver remain unproven; replay route reload, controls, cleanup, and mobile layout were manually checked | D — Phase 3 |
| 8 | `error` and `live-purethermal` are reserved contracts with no current producer | do not reuse `live-purethermal` for a non-radiometric stream |
| 9 | Replay min/max values are simulated metadata | never display them as evidence or use them for classification |
| 10 | Current `ScanView` composes Replay directly and status copy is replay-specific | expected Phase 0 shortcut; Phase 1D adds explicit source/viewport composition |
| 11 | Automated replay checks do not cover restart, route cleanup, or DOM accessibility | extend source checks; record the Phase 3 manual environment and results |

---

## 4. Known behavior and boundaries

- `ReplayThermalSource.start()` is also the restart primitive. The UI exposes separate Start and Restart labels around the same fresh-run behavior.
- The source uses one timeout. Stop and unmount call `source.stop()`; the verifier proves stop cleanup at source level.
- Replay timestamps are logical fixture timestamps: `startedAtMs + capturedAtOffsetMs`. Pausing delays delivery but does not rewrite capture offsets.
- `ScanView` state is intentionally local in Phase 0. A focused session hook—not a global store—is planned when the second source exists.
- No API, model endpoint, database, local storage, analytics, or cloud frame path exists.
- No live frame, assessment, warning, speech, history record, notification, smart plug, or relay is claimed.
- Display images and radiometric values are separate by contract. Replay has only the display side.
- The attached sensor is thermal. A colorized webcam-compatible stream may contain RGB-formatted display pixels, but it is not a visible-light RGB sensor and its pixels are not temperature data.
- Phase 1D is authorized only to display the local stream and source state. It may not snapshot, record, analyze the palette, infer heat direction, or speak guidance.

---

## 5. Dependencies

Runtime: React 19, React DOM, Tailwind v4.

Build: TypeScript, Vite, React Vite plugin, oxlint, type packages.

No router, state library, chart library, test framework, model SDK, database client, camera SDK, native USB dependency, or agent runtime is installed. Phase 1D uses browser MediaDevices rather than adding a camera SDK. Contributor agent tools are optional workstation tooling documented in `docs/AGENT-TOOLS.md`; they do not enter Ember’s application dependency graph.

See `docs/REQUIREMENTS.md` for stable acceptance IDs and `docs/PLAN.md` for the two-builder phase order.
