# STATUS.md — where the build actually is

**As of 13:25 EDT, hackathon day.** Phase 0 is built in the working tree. The repository is an Ember-only Vite application with a verified offline replay foundation.

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
| Browser QA | Scan and history reloads, replay controls, route cleanup, 390px layout, accessible names, control sizing, and console errors checked |
| Documentation | Product, safety boundary, contracts, architecture, schedule, demo, setup, references, and decisions pivoted to Ember |
| Collaboration | Repo-local `ember-collaboration` skill, partner onboarding, lane ownership, handoff template, and verified optional agent-tool guide |

**Verification actually run:**

```text
npm run verify:replay  →  green
npm run lint           →  green
npm run build          →  green
```

Production build: 20 modules, 203.78 kB JavaScript / 63.67 kB gzip, 15.65 kB CSS / 4.09 kB gzip.

### What runs now

`npm run dev` opens `#scan`.

- Idle starts with no frame in memory.
- Start clears old state, emits six replay frames, and ends.
- Pause holds the current frame; Resume continues from the next frame.
- Restart begins from frame one.
- Stop cancels pending work, returns idle, and clears the visible frame.
- The viewport and frame alt text both identify the sequence as simulated.
- **“Demo replay — not live”** appears above the viewport and again over every displayed frame.
- The assessment panel always says **“No current assessment.”** PNG pixels do not create warnings.

`#history` renders an empty state and explains the local, ephemeral frame policy.

---

## 2. Next

**Phase 1 · PureThermal bridge + hotspot analysis · 14:00–15:30.**

Start outside React:

1. Identify the exact PureThermal board and firmware.
2. Confirm USB enumeration with a data cable.
3. Prove one 160 × 120 Y16 frame.
4. Confirm how radiometric values and calibration metadata are exposed.
5. Build the smallest local bridge that preserves both a display image and row-major Celsius values.
6. Implement `PureThermalSource` against the existing interface.
7. Only then add deterministic frame validation and hotspot analysis.

The UI must not gain transport-specific code. Replay remains the offline fallback and cannot tune or exercise classification.

**15:00 hardware gate:** if Y16 is not proven, stop debugging the bridge. Finish the replay-only submission honestly instead of converting palette colors into fake temperatures.

---

## 3. Open risks

| # | Risk | Owner / response |
|---|---|---|
| 1 | Exact PureThermal board revision and firmware are not documented | L — identify before installing native tooling |
| 2 | USB enumeration and Y16 capture have not been proven on this laptop | L — blocking gate for live work |
| 3 | `PureThermalSource` and the local bridge do not exist | L — Phase 1 |
| 4 | No frame validator, hotspot implementation, persistence rule, or device-calibrated threshold exists | D — after one real radiometric frame |
| 5 | Speech is not implemented | both — Phase 2; screen must remain complete without it |
| 6 | 200% zoom and VoiceOver remain unproven; browser route reload, controls, source cleanup, and mobile layout are verified | D — Phase 3 |
| 7 | `error` and `live-purethermal` are reserved contracts with no current producer | expected until Phase 1 |
| 8 | Replay min/max values are simulated metadata | never display them as evidence or use them for classification |

---

## 4. Known behavior and boundaries

- `ReplayThermalSource.start()` is also the restart primitive. The UI exposes separate Start and Restart labels around the same fresh-run behavior.
- The source uses one timeout. Stop and unmount call `source.stop()`; the verifier proves stop cleanup at source level.
- Replay timestamps are logical fixture timestamps: `startedAtMs + capturedAtOffsetMs`. Pausing delays delivery but does not rewrite capture offsets.
- `ScanView` state is intentionally local. There is no runtime store.
- No API, model endpoint, database, local storage, analytics, or cloud frame path exists.
- No live frame, assessment, warning, speech, history record, notification, smart plug, or relay is claimed.
- Display images and radiometric values are separate by contract. Replay has only the display side.

---

## 5. Dependencies

Runtime: React 19, React DOM, Tailwind v4.

Build: TypeScript, Vite, React Vite plugin, oxlint, type packages.

No router, state library, chart library, test framework, model SDK, database client, camera SDK, native USB dependency, or agent runtime is installed. Contributor agent tools are optional workstation tooling documented in `docs/AGENT-TOOLS.md`; they do not enter Ember’s application dependency graph.
