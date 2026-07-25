# STATUS.md — where the build actually is

**Current baseline:** Phase 0 and the Phase 1D display-only browser implementation are committed on the Ember integration branch. Phase 1A closed with a calibrated-radiometry **no-go**, and Phase 1D’s attached-device gate remains **blocked**. Phase 3 manual accessibility evidence is still open. Phase 4 hardening has started: deterministic five-cycle resource checks, a production-like localhost command, a built-asset/network-API audit, and two production Replay rehearsals with route reloads are green. The laptop’s external network was not disconnected during those rehearsals, so the strict offline gate is still open and no offline claim is authorized yet. Replay remains the submission path. Radiometric bridge, assessment, and assessment speech remain blocked.

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
| Browser QA | Scan/history reload, replay controls, route cleanup, 390px layout, accessible names, control sizing, and console errors were manually checked; environment and assistive-technology details must still be recorded in Phase 3 |
| Preview contract | Replay frame versus live `MediaStream` surface, opaque device choices, sanitized display settings, fixed error codes, and preview phase/state live in `src/types.ts` |
| Preview runtime | `UvcPreviewSource` owns temporary authorization cleanup, private exact-device identity, generation gating, playback gating, pause/reacquire, disconnect handling, and listener/track cleanup |
| Preview session | `usePreviewSession` keeps Replay selected by default, composes both sources, owns the identity-guarded `<video>` sink, and clears both surfaces on switch/route/unmount |
| Preview interface | Explicit Live selection, authorization disclosure/action, operator chooser, accessible controls/errors/Retry, persistent non-radiometric truth, sanitized active label/settings, and no-assessment copy |
| Preview verification | Plain Node fakes cover replay isolation, discovery cleanup, exact matching, playback gating/failure, ended-track and late-playback races, errors, late results, pause/resume, restart, the `stop()`/generation boundary, disconnect/devicechange, hidden/pagehide, detached playback-sink cleanup, and five zero-resource cycles; React switching/routing and attached hardware remain manual evidence |
| Phase 1D browser attempt | DOM/source-truth/pending-request-invalidation/mobile-target checks passed; OS/browser camera permission could not be completed in the in-app browser, so the attached-device gate is blocked |
| Documentation | Product, atomic phased requirements, safety boundary, implemented schema, target architecture, schedule, demo, setup, references, and decisions describe Ember |
| Collaboration | Repo-local `ember-collaboration` skill, partner onboarding, lane ownership, handoff template, and verified optional agent-tool guide |
| Phase 1A probe | macOS 26.5.2 arm64 sees GroupGets `PureThermal (fw:v1.3.0)`, vendor/product `0x1e4e/0x0100`, with UVC control/streaming interfaces owned by `UVCAssistant`; exact board revision and capture mode remain unknown |
| Phase 1A decision | No Y16 or calibrated-Celsius proof exists. Acceptance `AC-003` passes by choosing the no-radiometry branch; the other radiometric acceptance rows fail and block Phases 1B/1C/2 |
| Phase 4 resource hardening | An injected replay scheduler proves one bounded timer while active and zero timers after each of five restart/stop cycles; preview fakes prove one bounded set of applicable listeners/attachment while active and zero tracks/listeners/attachments after each of five stop cycles |
| Phase 4 local-build audit | The production output contains three local document assets, one local stylesheet, all six replay frames, and no application use of `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or `sendBeacon` |
| Phase 4 production rehearsal | `#scan` completed the six-frame Replay twice from the production server, including reload between runs; `#history` and `#scan` survived reload and all rendered asset references were local. External networking remained connected, so this is not the disconnected-network acceptance run |

**Verification actually run:**

```text
npm run verify:replay  →  green
npm run verify:preview →  green
npm run lint           →  green
npm run build          →  green
npm run verify:offline →  green
npm run verify:hardening → green
```

Production build: 23 modules, 221.46 kB JavaScript / 68.06 kB gzip, 16.01 kB CSS / 4.19 kB gzip.

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

`#history` renders an empty state and explains that live video, replay activity, and incidents are not stored.

---

## 2. Next

**Finish Phase 3 evidence and close the remaining Phase 4 human gates.**

The Phase 1D implementation work is done, but its hardware gate is blocked and Replay is the submission path. Before freeze:

1. Record the Phase 3 browser, viewport, keyboard, zoom, color/audio, and VoiceOver matrix.
2. Run `npm run verify:hardening` from the candidate checkout.
3. Run `npm run demo:offline`, physically disconnect external networking, complete Replay twice with a `#scan` reload between runs, and reload `#history`.
4. Record the exact commit and a second-builder review, then freeze product code at 17:30.

If the disconnected-network run is not completed, keep Phase 4 open and describe the build only as application-self-contained—not offline-verified. If Phase 3’s matrix is incomplete, list the missing manual results rather than inferring them from automation.

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
| 10 | Replay restart and source-level cleanup are automated, but route/DOM accessibility remains browser evidence | record the remaining Phase 3 manual environment and results |
| 11 | Production Replay and routes passed while external networking remained connected | operator — repeat the exact production rehearsal after physically disconnecting external networking |
| 12 | The hardening suite has not yet been reproduced from a clean checkout and frozen commit | integration owner — run the clean-checkout gate, record the commit, and stop product changes at 17:30 |

---

## 4. Known behavior and boundaries

- `ReplayThermalSource.start()` is also the restart primitive. The UI exposes separate Start and Restart labels around the same fresh-run behavior.
- The source uses one timeout. Stop and unmount call `source.stop()`; the verifier proves stop cleanup at source level.
- The default replay scheduler delegates to browser timers; the verifier injects a deterministic scheduler and proves five restart/stop cycles return to zero pending timers.
- Replay timestamps are logical fixture timestamps: `startedAtMs + capturedAtOffsetMs`. Pausing delays delivery but does not rewrite capture offsets.
- `usePreviewSession` is the focused local composition boundary; no global store exists.
- No API, model endpoint, database, local storage, analytics, or cloud frame path exists.
- `verify:offline` statically proves local production asset references and absence of application network APIs; only a physical network-disconnection rehearsal can close the offline behavior gate.
- A display-only live stream path exists, but no successful attached-device playback, live frame capture, assessment, warning, speech, history record, notification, smart plug, or relay is claimed.
- Display images and radiometric values are separate by contract. Replay has only the display side.
- The attached sensor is thermal. A colorized webcam-compatible stream may contain RGB-formatted display pixels, but it is not a visible-light RGB sensor and its pixels are not temperature data.
- Phase 1D is authorized only to display the local stream and source state. It may not snapshot, record, analyze the palette, infer heat direction, or speak guidance.

---

## 5. Dependencies

Runtime: React 19, React DOM, Tailwind v4.

Build: TypeScript, Vite, React Vite plugin, oxlint, type packages.

No router, state library, chart library, test framework, model SDK, database client, camera SDK, native USB dependency, or agent runtime is installed. Phase 1D uses browser MediaDevices rather than adding a camera SDK. Contributor agent tools are optional workstation tooling documented in `docs/AGENT-TOOLS.md`; they do not enter Ember’s application dependency graph.

See `docs/REQUIREMENTS.md` for stable acceptance IDs and `docs/PLAN.md` for the two-builder phase order.
