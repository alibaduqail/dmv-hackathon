# STATUS.md — where the build actually is

**Current baseline:** Phase 0, the Phase 1D display-only browser implementation, and optional source-status speech are implemented. Phase 1A closed with a calibrated-radiometry **no-go**. Phase 1D code and dependency-injected source-lifecycle verification are complete, but its hardware exit gate is **blocked** after the intended input did not play by the 16:15 cutoff. The Codex in-app browser reached a pending camera-permission request and could not present the permission surface, so no attached PureThermal label, stream settings, playback, or camera-indicator closure is claimed. Replay is the submission path unless the team explicitly reopens and passes the two-run gate before the 17:30 feature freeze. Radiometric bridge, assessment, and assessment speech remain blocked; source speech announces operational status and provenance only.

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
| Privacy shell | `#history` truthfully states that no live video, replay activity, or incidents are stored |
| Accessibility foundation | Skip link, semantic landmarks, route-specific titles, post-navigation main focus, live status, text + symbol status, visible focus, 44px-or-larger controls, reduced-motion support |
| Browser QA | Scan/history reload, replay controls, route cleanup, 390px layout, accessible names, control sizing, and console errors were manually checked; environment details must be recorded when rerun in Phase 3 |
| Preview contract | Replay frame versus live `MediaStream` surface, opaque device choices, sanitized display settings, fixed error codes, and preview phase/state live in `src/types.ts` |
| Preview runtime | `UvcPreviewSource` owns temporary authorization cleanup, private exact-device identity, generation gating, playback gating, pause/reacquire, disconnect handling, and listener/track cleanup |
| Preview session | `usePreviewSession` keeps Replay selected by default, composes both sources, owns the identity-guarded `<video>` sink, and clears both surfaces on switch/route/unmount |
| Preview interface | Explicit Live selection, authorization disclosure/action, operator chooser, accessible controls/errors/Retry, persistent non-radiometric truth, sanitized active label/settings, and no-assessment copy |
| Preview verification | Plain Node fakes cover replay isolation, discovery cleanup, exact matching, playback gating/failure, ended-track races, errors, late results, pause/resume, restart, the `stop()`/generation boundary, disconnect/devicechange, hidden/pagehide, detached playback-sink cleanup, and zero listener/track retention; React switching/routing remains code/manual evidence |
| Source speech | Native Web Speech support is optional and defaults off; Enable, Mute, and Repeat announce only visible source status and provenance, with dedupe, a 2.5-second minimum interval, lifecycle cancellation, and fail-open TTS errors |
| Phase 1D browser attempt | DOM/source-truth/pending-request-invalidation/mobile-target checks passed; OS/browser camera permission could not be completed in the in-app browser, so the attached-device gate is blocked |
| Documentation | Product, atomic phased requirements, safety boundary, implemented schema, target architecture, schedule, demo, setup, references, and decisions describe Ember |
| Collaboration | Repo-local `ember-collaboration` skill, partner onboarding, lane ownership, handoff template, and verified optional agent-tool guide |
| Phase 1A probe | macOS 26.5.2 arm64 sees GroupGets `PureThermal (fw:v1.3.0)`, vendor/product `0x1e4e/0x0100`, with UVC control/streaming interfaces owned by `UVCAssistant`; exact board revision and capture mode remain unknown |
| Phase 1A decision | No Y16 or calibrated-Celsius proof exists. Acceptance `AC-003` passes by choosing the no-radiometry branch; the other radiometric acceptance rows fail and block Phases 1B/1C/2 |

**Verification actually run:**

```text
npm run verify:replay  →  green
npm run verify:preview →  green
npm run verify:speech  →  green
npm run lint           →  green
npm run build          →  green
```

Production build: 24 modules, 224.60 kB JavaScript / 68.93 kB gzip, 16.01 kB CSS / 4.19 kB gzip.

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
- Demo replay remains selected after load, reload, and returning from `#history`; merely selecting Live preview requests no camera permission.
- Live preview persistently shows **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”** before, during, and after a stream.
- **Authorize cameras** opens and immediately stops a temporary, unattached, video-only discovery stream before publishing PureThermal-labelled choices.
- The operator must choose an input. Start uses the private exact identity, verifies the active track identity, attaches locally, and reaches `streaming` only after `<video>.play()` resolves.
- Pause stops tracks and clears `srcObject`; Resume reacquires. Stop, Restart, errors, switch, route change, hidden visibility, `pagehide`, unmount, and late results share the same cleanup/generation boundary.
- Fixed visible errors include a non-color `!` symbol and explicit Retry. Raw exception messages and device/group identifiers never render.
- Optional source speech defaults off. When enabled it announces the same visible source status and exact provenance; Mute affects audio only, Repeat replays the current source status, and no replay or preview pixels enter speech.

`#history` renders an empty state and explains that live video, replay activity, and incidents are not stored.

---

## 2. Next

**Phase 3 · Replay accessibility and demo QA.**

The Phase 1D implementation work is done, but its hardware gate is blocked and Replay is the submission path. Continue Replay accessibility, offline, fallback, and presentation QA. Only if the team explicitly reopens the gate before 17:30 should an operator use the actual demo browser, complete its camera permission prompt, and:

1. Confirm only PureThermal-labelled choices appear and no input is selected automatically.
2. Select the intended label, Start, and record only the active label plus width/height/frame rate shown by Ember.
3. Confirm the playing video keeps both non-radiometric statements and **“No current assessment”** visible.
4. Stop and confirm the video clears and the browser camera indicator closes.
5. Run the same intended input a second time, then repeat cleanup on route change and page hide.
6. Deny permission once and unplug once to verify the visible Retry states with the actual browser.

If all required runs and cleanup checks are not completed before freeze, keep Phase 1D’s hardware gate blocked and use the existing labelled Replay for the submission.

---

## 3. Open risks

| # | Risk | Owner / response |
|---|---|---|
| 1 | Browser visibility and playback of the intended PureThermal UVC input are unproven | Operator — grant permission in the actual demo browser, select the label, and run twice |
| 2 | FFmpeg/AVFoundation listed no video devices in this Codex shell despite macOS UVC attachment | L — do not call the webcam path working until browser evidence identifies the exact input |
| 3 | The in-app browser left `getUserMedia` pending because its permission UI could not be presented | Operator — use the normal demo browser; logical invalidation proved only UI/generation cleanup, not cancellation or playback |
| 4 | Radiometric Phase 1B, deterministic Phase 1C, and assessment speech are blocked | both — preserve them as future architecture, not hackathon behavior |
| 5 | A visual-only feed does not yet deliver the core blind-user directional warning | docs/demo owner — state this limitation plainly in the pitch and submission |
| 6 | Permission denial, camera ambiguity, unplug, and cleanup pass with fakes but not the attached browser/device | Operator — complete the Phase 1D manual matrix before claiming it |
| 7 | 200% zoom and VoiceOver remain unproven; replay route reload, controls, cleanup, and mobile layout were manually checked | D — Phase 3 |
| 8 | `error` and `live-purethermal` are reserved contracts with no current producer | do not reuse `live-purethermal` for a non-radiometric stream |
| 9 | Replay min/max values are simulated metadata | never display them as evidence or use them for classification |
| 10 | Automated replay checks still do not cover restart, route cleanup, or DOM accessibility | record the remaining Phase 3 manual environment and results |

---

## 4. Known behavior and boundaries

- `ReplayThermalSource.start()` is also the restart primitive. The UI exposes separate Start and Restart labels around the same fresh-run behavior.
- The source uses one timeout. Stop and unmount call `source.stop()`; the verifier proves stop cleanup at source level.
- Replay timestamps are logical fixture timestamps: `startedAtMs + capturedAtOffsetMs`. Pausing delays delivery but does not rewrite capture offsets.
- `usePreviewSession` is the focused local composition boundary; no global store exists.
- No API, model endpoint, database, local storage, analytics, or cloud frame path exists.
- A display-only live stream path exists, but no successful attached-device playback, live frame capture, assessment, warning, assessment speech, history record, notification, smart plug, or relay is claimed.
- Display images and radiometric values are separate by contract. Replay has only the display side.
- The attached sensor is thermal. A colorized webcam-compatible stream may contain RGB-formatted display pixels, but it is not a visible-light RGB sensor and its pixels are not temperature data.
- Phase 1D is authorized only to display the local stream and source state. It may not snapshot, record, analyze the palette, infer heat direction, or speak guidance.

---

## 5. Dependencies

Runtime: React 19, React DOM, Tailwind v4.

Build: TypeScript, Vite, React Vite plugin, oxlint, type packages.

No router, state library, chart library, test framework, model SDK, database client, camera SDK, native USB dependency, or agent runtime is installed. Phase 1D uses browser MediaDevices rather than adding a camera SDK. Contributor agent tools are optional workstation tooling documented in `docs/AGENT-TOOLS.md`; they do not enter Ember’s application dependency graph.

See `docs/REQUIREMENTS.md` for stable acceptance IDs and `docs/PLAN.md` for the two-builder phase order.
