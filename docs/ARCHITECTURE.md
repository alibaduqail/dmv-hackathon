# ARCHITECTURE.md — where things go and why

Cold start: `docs/STATUS.md`. Shared shapes: `docs/SCHEMA.md`. Schedule: `docs/PLAN.md`. Demo acceptance: `docs/DEMO.md`.

This file owns boundaries, file placement, and landmines. It is not a second schedule.

---

## 1. System shape

### Foundation

```
six simulated PNGs + manifest
              │
              ▼
    ReplayThermalSource
       frame + status callbacks
              │
              ▼
       ScanView local state
              │
       ┌──────┼────────┐
       ▼      ▼        ▼
   viewport  status  controls
```

### After the live bridge

```
Lepton 3.5 + PureThermal USB
              │ Y16
              ▼
      local native bridge
      ├── display image
      └── radiometric Celsius grid
              │
              ▼
      PureThermalSource
              │ same callbacks
              ▼
        deterministic analysis
              │ ThermalAssessment
              ├── visible text + symbol + color
              └── spoken copy
```

React never opens the USB device and never guesses Celsius values from display colors. The source boundary is the architecture.

---

## 2. Product boundaries

| Layer | Owns | Does not own |
|---|---|---|
| Native bridge | USB, Y16, calibration metadata, display conversion | UI, classification, speech |
| `ThermalSource` | Lifecycle, ordered frame delivery, source provenance | React state, analysis, persistence |
| Deterministic analysis | Validation, hotspot extraction, spatial assessment | Generated language, hardware control |
| `ScanView` | Current source status, current frame, controls, accessible output | USB details, threshold logic, history |
| Speech renderer | Utterance of current structured assessment | Severity or guidance decisions |
| `#history` | Honest privacy state | Fabricated or persisted incidents |

Frames are ephemeral. Stop, route change, or source error invalidates “current” output.

---

## 3. File tree

```
AGENTS.md                         source of truth for every coding agent
CLAUDE.md                         Claude Code-specific discipline only
README.md                         GitHub landing and verified quick start
mvp.md                            product and claim boundary

.agents/
  skills/
    ember-collaboration/
      SKILL.md                    shared multi-agent workflow
      agents/openai.yaml          portable skill metadata

.claude/
  skills/
    ember-collaboration           symlink to the canonical .agents skill

docs/
  STATUS.md                       cold-start briefing
  ARCHITECTURE.md                 this file
  SCHEMA.md                       source contracts
  PLAN.md                         the only schedule
  DEMO.md                         acceptance and pitch
  SETUP.md                        local, hardware, and offline setup
  COLLABORATION.md                partner onboarding and lane handoffs
  AGENT-TOOLS.md                  verified optional agent-tool guide
  REFERENCES.md                   primary sources and prior art
  DECISIONS.md                    append-only handoff

public/
  favicon.svg
  replay/
    ember-frame-01.png
    ember-frame-02.png
    ember-frame-03.png
    ember-frame-04.png
    ember-frame-05.png
    ember-frame-06.png

scripts/
  generate-replay-assets.mjs      deterministic fixture generator
  verify-replay.ts                asset + lifecycle verification

src/
  types.ts                        all shared source and future-seam contracts
  App.tsx                         hash route switch and global navigation
  main.tsx                        React entry point
  index.css                       global CSS entry

  fixtures/
    replay.ts                     emberReplayManifest

  lib/
    thermal-source.ts             ReplayThermalSource

  features/
    scan/
      ScanView.tsx                source lifecycle + accessible replay surface
    history/
      HistoryView.tsx             honest empty state

  styles/
    tokens.css                    high-contrast design tokens
```

Git history is the archive for removed work. Do not add a legacy application folder.

---

## 4. Architectural calls

### 4.1 One source interface, two transports

`ReplayThermalSource` and the future `PureThermalSource` implement `ThermalSource`. UI controls call `start`, `pause`, `resume`, and `stop` without transport checks.

If a component branches on `simulated-replay` to manage timers or on `live-purethermal` to open hardware, the seam has failed. Provenance branches may change copy; they may not change lifecycle ownership.

### 4.2 Replay is infrastructure, not a fake live mode

The replay is a first-class source with truthful provenance. It exists for:

- Offline demo fallback.
- UI development before the bridge.
- Deterministic lifecycle verification.

It does not exist for:

- Deriving Celsius from colors.
- Tuning hotspot thresholds.
- Showing generated warnings in the foundation.
- Claiming the camera works.

### 4.3 Local state is enough

Only `ScanView` needs current frame and source status. Keep them local. No Context store, external state library, query layer, local storage, or database.

The source instance must survive ordinary renders and be stopped in effect cleanup. It must not be constructed on every frame callback.

### 4.4 Display and analysis data are separate

`displayUrl` is for people. `radiometricValuesC` is for deterministic code.

```
displayUrl ───────────────> <img>
radiometricValuesC ───────> validator → hotspot analysis
```

Never parse a color palette back into temperature. Replay omits `radiometricValuesC`, so deterministic analysis has nothing to consume.

### 4.5 Hash routing stays

Two routes do not justify a router dependency.

```
#scan      default and scanner surface
#history   empty privacy/history surface
```

Unknown hashes fall back to `#scan`. A reload must preserve either named route. Route cleanup stops the active source.

### 4.6 Provenance is content, not decoration

`ThermalProvenance.label` renders next to the viewport and remains visible whenever its frame is visible. It cannot be hidden behind a tooltip, color, hover, or screen-reader-only class.

Replay copy is exact: **“Demo replay — not live”**.

### 4.7 Classification stays pure and deterministic

Future analysis accepts a radiometric frame and returns a `ThermalAssessment`. It does not call a model, speak, manipulate DOM, or perform a physical action.

Speech and generated explanations consume the assessment. They cannot rewrite `level`, `hotspots`, or `guidance`.

---

## 5. Contracts

All signatures live in `src/types.ts` and are documented once in `docs/SCHEMA.md`.

Foundation exports:

- `SourceStatus`
- `ThermalProvenance`
- `ThermalFrame`
- `ThermalFrameHandler`
- `SourceStatusHandler`
- `ThermalSource`
- `ReplayFrameMetadata`
- `ReplayManifest`

Future seams already reserved:

- `Hotspot`
- `AssessmentLevel`
- `ThermalAssessment`
- `AgentMessage`
- `SafetyAction`

Do not redeclare any of them inside a feature.

### Replay implementation

`ReplayThermalSource` uses a single `setTimeout`, not `setInterval`.

- `start()` cancels old work and begins at frame zero.
- The zero-delay first task transitions `connecting → streaming` and emits the first frame.
- Each later frame is scheduled after `manifest.intervalMs`.
- `pause()` cancels the pending timer without advancing the index.
- `resume()` schedules the next un-emitted frame.
- The sixth frame transitions to `ended` without another timer.
- `stop()` cancels pending work, resets index, emits `idle`, and releases callbacks.

This is why stop is also the unmount cleanup.

---

## 6. Replay generation and verification

`scripts/generate-replay-assets.mjs` creates the committed PNG fixtures. Generated assets are reviewed and committed; the app does not run the generator.

`npm run verify:replay` proves:

- Six assets exist and are PNGs.
- PNG headers report 160 × 120.
- Manifest order is zero-based and stable.
- Metadata is finite and `maxC > minC`.
- Replay provenance is not live and its label has not drifted.
- Full playback emits six frames and ends.
- Paused playback does not advance.
- Resume completes from the current index.
- Stop leaves no pending frame timer.

It does **not** prove browser accessibility, route cleanup, radiometric accuracy, or live hardware. Those are manual gates in `docs/SETUP.md`.

---

## 7. Native bridge boundary — next phase

The bridge is a local process because standard macOS camera capture is not assumed to expose raw Y16. Before implementation, prove the board and one raw frame using the exact hardware.

Minimum bridge output per frame:

| Field | Source |
|---|---|
| identity + sequence | bridge |
| capture timestamp | bridge |
| `160 × 120` dimensions | device, validated by bridge |
| display image | bridge conversion |
| row-major Celsius grid | radiometric Y16 conversion |
| min / max Celsius | bridge or deterministic validation |
| `live-purethermal` provenance | adapter |

Transport stays local-only. The first implementation may choose the smallest mechanism the verified capture example supports, but `PureThermalSource` must hide it from React.

On disconnect:

1. Stop emitting frames.
2. Invalidate the current frame and assessment.
3. Emit `error`.
4. Keep restart available.

Do not silently switch to replay. The person operating the demo makes that explicit choice.

---

## 8. Landmines

1. **A colored UVC preview is not radiometry.** Prove Y16 before analysis.
2. **macOS camera drivers may omit Y16.** The GroupGets radiometry example bypasses them with `libuvc`; direct browser access is not the plan.
3. **Replay min/max are simulated metadata.** They cannot justify a warning or a camera-accuracy claim.
4. **`setInterval` races with pause and cleanup.** The replay uses one owned timeout.
5. **An old source can still call back after a restart.** `start()` clears prior work before registering the new run.
6. **Source status conveyed only by color fails the product audience.** Always render text and a symbol.
7. **Speech can become stale.** Future speech cancels on frame, assessment, source, and route changes.
8. **Shiny metal can reflect another heat source.** Never promise touch safety from a hotspot.
9. **Thermal images stretch easily.** Preserve the 4:3 source aspect ratio; do not crop away provenance or direction.
10. **Relative imports inside `src/` carry extensions.** Keep `.ts` / `.tsx` so the plain Node verifier can import shared code.
11. **`public` asset URLs begin at `/`.** Files live under `public/replay/`; manifest URLs are `/replay/...`.
12. **Do not add persistence to make `#history` look finished.** Its emptiness is the privacy claim.

---

## 9. Definition of done

| Surface | Done when |
|---|---|
| source contracts | Both transports can satisfy the same lifecycle and frame callbacks |
| replay manifest | Six ordered 160 × 120 PNGs, finite metadata, exact provenance |
| replay source | Complete, pause/resume, stop cleanup, and restart are deterministic |
| `#scan` | Route reloads; viewport, status, controls, and provenance work by keyboard and assistive technology |
| `#history` | Truthfully states that no frames or incidents are stored |
| foundation | `verify:replay`, lint, and build green; no obsolete product language remains |
| live bridge | One validated radiometric frame reaches `PureThermalSource`; disconnect is explicit |
| assessment | Pure deterministic output from valid radiometric data; no model in the decision path |
| speech | Visible and spoken outputs match; stale utterances cancel |
| whole demo | Live path and labelled offline fallback each run twice before 17:30 |
