# STATUS.md — where the build actually is

**Current baseline:** Phase 0 is committed on the Ember integration branch. The repository is an Ember-only Vite application with a verified replay-source foundation; disconnected-network behavior remains a Phase 4 rehearsal. The next work is separated into hardware proof, live transport, and deterministic assessment gates.

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

**Verification actually run:**

```text
npm run verify:replay  →  green
npm run lint           →  green
npm run build          →  green
```

Production build: 20 modules, 203.78 kB JavaScript / 63.67 kB gzip, 15.20 kB CSS / 4.04 kB gzip.

### What runs now

`npm run dev` starts Vite. Opening the printed URL with an empty or unknown hash renders the default `#scan` surface.

- Idle starts with no frame in memory.
- Start clears old state, emits six replay frames, and ends.
- Pause holds the current frame; Resume continues from the next frame.
- Restart begins from frame one.
- Stop cancels pending work, returns idle, and clears the visible frame.
- The viewport and frame alt text both identify the sequence as simulated.
- **“Demo replay — not live”** appears above the viewport and again over every displayed frame.
- The assessment panel always says **“No current assessment.”** PNG pixels do not create warnings.

`#history` renders an empty state and explains the local, ephemeral frame policy.

### Phase 3 QA record (in progress)

Environment for every row below: macOS 15 (Darwin 25.5.0), repository build `npm run build` at 15:5x. Rows requiring a browser or assistive technology are **not run** — no operator has executed them in this session, and no result may be claimed until they are.

| Requirement | Method | Result |
|---|---|---|
| `EMB-P3-FR-005` thermal image is not a focus target | Code check — the replay `<img>` carries no `tabindex` or handler and its `alt` repeats the frame number, provenance, and “no assessment” | Passed |
| `EMB-P3-FR-004` status without color or speech | Code check — every status renders text plus a non-color symbol; the assessment panel is fixed text | Passed |
| `EMB-P3-AC-002` route change is announced | Fixed this session — hash routing now moves focus to the new route’s `main`; previously focus stayed on the old page | Fixed, needs VoiceOver confirmation |
| Replay restart runs clean | `npm run verify:replay` — restart mid-run replays six ordered frames and detaches the previous run | Passed |
| `EMB-P3-FR-001` keyboard-only demo | Manual browser | **Not run** |
| `EMB-P3-FR-002` focus and 44px targets at 200% zoom | Manual browser | **Not run** |
| `EMB-P3-FR-003` VoiceOver names, state, provenance, status | Manual VoiceOver | **Not run** |
| `EMB-P3-FR-006` 320–390px and 200% zoom reflow | Manual browser | **Not run** |
| `EMB-P3-FR-008` both builders run the demo | Manual rehearsal | **Not run** |
| Live warning and app-speech rows | — | Not applicable; Phases 1C and 2 did not pass |

Known keyboard behavior, unfixed: pressing Start disables Start, so focus moves to the document body. Same for Pause and Resume. A keyboard operator must re-tab to reach the next control.

### Phase 4 QA record (in progress)

| Requirement | Method | Result |
|---|---|---|
| `EMB-P4-NFR-001` resources return to zero | `npm run verify:replay` — five start/pause/resume/stop cycles with a `setTimeout`/`clearTimeout` spy; the pending count is asserted synchronously at stop, and no frame or status arrives afterwards | Passed |
| `EMB-P4-NFR-002` clean-checkout verification | Fresh `git clone` of the repository plus `npm ci`; `verify:replay`, `lint`, and `build` each exited 0 | Passed |
| `EMB-P4-AC-001` no network request is needed | Build audit — the bundle names no remote host (the `react.dev` and `tailwindcss.com` strings are error-message and comment text), contains no `XMLHttpRequest` or `WebSocket`, and its only `fetch` is Vite’s same-origin modulepreload polyfill, which `index.html` never triggers | Passed by inspection |
| `EMB-P4-FR-001` labelled replay twice offline, reload between | Manual browser with the network disconnected | **Not run** |
| `EMB-P4-FR-004` reload `#scan` and `#history` offline | Manual browser with the network disconnected; served locally, `/`, the JavaScript and CSS bundles, a replay PNG, and the favicon all returned 200 | Partial — server evidence only, browser reload **not run** |
| `EMB-P4-FR-002`, `EMB-P4-FR-003`, `EMB-P4-FR-005`, `EMB-P4-AC-002`, `EMB-P4-AC-003` | — | Not applicable; Phase 1B did not pass |
| `EMB-P4-AC-005` offline speech | — | Not applicable; Phase 2 did not pass |
| `EMB-P4-NFR-003` 17:30 freeze | — | Pending |

The spy was mutation-checked: deleting `clearTimer()` from `ReplayThermalSource.stop()` fails the run with `Cycle 1 left 1 timers pending after stop.` The behavioral assertions alone did not catch that leak, because `emitNext` already refuses to emit while idle.

Demo constraint: `dist/index.html` references `/assets/...` absolutely, so the production build must be served by a static local server. Opening the file directly with `file://` will not load the bundle.

---

## 2. Next

**Phase 1A · hardware and calibrated-radiometry proof.**

Start outside React:

1. Identify the exact PureThermal board and firmware.
2. Confirm USB enumeration with a data cable.
3. Prove one 160 × 120 Y16 frame.
4. Separately prove whether its values are calibrated radiometry convertible to Celsius.
5. Verify display/grid orientation and record encoding, byte order, timestamp, and calibration mode.
6. Only after that gate, build the smallest local bridge and source/session lifecycle.
7. Only after the transport gate, lock hardware-derived policy and add deterministic assessment.

The UI must not gain transport-specific code. Replay remains the self-contained local fallback and cannot tune or exercise classification.

**15:00 hardware gate:** if calibrated radiometry is not proven, stop debugging the bridge. Finish the replay-only submission honestly instead of converting palette colors or raw counts into fake temperatures.

---

## 3. Open risks

| # | Risk | Owner / response |
|---|---|---|
| 1 | Exact PureThermal board revision and firmware are not documented | L — identify before installing native tooling |
| 2 | USB enumeration and Y16 capture have not been proven on this laptop | L — blocking gate for live work |
| 3 | Bridge protocol, `PureThermalSource`, and source/session controller do not exist | L/D — Phase 1B after hardware gate |
| 4 | No validated-radiometric type, frame validator, hotspot implementation, persistence rule, or device-calibrated policy exists | D — Phase 1C after transport gate |
| 5 | Speech is not implemented | both — Phase 2; screen must remain complete without it |
| 6 | 200% zoom and VoiceOver remain unproven; browser route reload, controls, source cleanup, and mobile layout are verified | D — Phase 3 |
| 7 | `error` and `live-purethermal` are reserved contracts with no current producer | expected until Phase 1 |
| 8 | Replay min/max values are simulated metadata | never display them as evidence or use them for classification |
| 9 | Current `ScanView` composes Replay directly and status copy is replay-specific | expected Phase 0 shortcut; Phase 1B adds source selection/session ownership before Live |
| 10 | Current assessment seam lacks run identity, direction, provenance, and expiry | revise `src/types.ts` and `docs/SCHEMA.md` together before Phase 1C |
| 11 | Automated replay checks now cover restart; route cleanup and DOM accessibility remain manual | no DOM test runner is installed; record the Phase 3 manual environment and results |

---

## 4. Known behavior and boundaries

- `ReplayThermalSource.start()` is also the restart primitive. The UI exposes separate Start and Restart labels around the same fresh-run behavior.
- The source uses one timeout. Stop and unmount call `source.stop()`; the verifier proves stop cleanup at source level.
- Replay timestamps are logical fixture timestamps: `startedAtMs + capturedAtOffsetMs`. Pausing delays delivery but does not rewrite capture offsets.
- `ScanView` state is intentionally local in Phase 0. A focused session hook—not a global store—is planned when the second source exists.
- No API, model endpoint, database, local storage, analytics, or cloud frame path exists.
- No live frame, assessment, warning, speech, history record, notification, smart plug, or relay is claimed.
- Display images and radiometric values are separate by contract. Replay has only the display side.

---

## 5. Dependencies

Runtime: React 19, React DOM, Tailwind v4.

Build: TypeScript, Vite, React Vite plugin, oxlint, type packages.

No router, state library, chart library, test framework, model SDK, database client, camera SDK, native USB dependency, or agent runtime is installed. Contributor agent tools are optional workstation tooling documented in `docs/AGENT-TOOLS.md`; they do not enter Ember’s application dependency graph.

See `docs/REQUIREMENTS.md` for stable acceptance IDs and `docs/PLAN.md` for the two-builder phase order.
