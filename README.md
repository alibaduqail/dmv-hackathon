> Ember is designed to widen independent access to everyday spaces by helping blind and low-vision people locate higher heat before reaching toward it.

# Ember

Ember is a hackathon prototype for Track 02, Health Tech & Accessibility. The product concept pairs a FLIR Lepton 3.5 on a PureThermal USB board with redundant on-screen and spoken heat guidance.

The current repository is an accessible application with a clearly labelled simulated replay and an implemented display-only browser preview path. Phase 1A hardware investigation is complete, but calibrated radiometry is unavailable through the selected laptop path. Phase 1D’s attached-device gate is blocked after the intended input did not play by the 16:15 cutoff. The repository therefore does **not** claim live browser playback, temperature accuracy, hotspot classification, directional warning, assessment speech, or that any object is safe to touch.

## What works now

- `#scan` is the default handheld scanner shell.
- Six simulated 160 × 120 PNG frames exercise one transport-neutral `ThermalSource` contract.
- Start, pause, resume, restart, stop, deterministic completion, and cleanup work.
- Replay content always says **“Demo replay — not live”**.
- Replay remains selected after load/reload; selecting Live preview alone requests no camera access.
- Live setup uses explicit authorization, an operator-selected PureThermal label, private exact-device verification, and playback-gated `streaming`.
- Pause stops live tracks and clears video; Resume reacquires. Stop, Restart, error, switch, route change, hidden/pagehide, unmount, and late results clean up through one generation boundary.
- Live setup persistently says **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”**.
- Status uses visible words and a non-color symbol.
- Optional source speech defaults off and provides Enable, Mute, and Repeat for the same visible status/provenance; it never speaks heat guidance.
- `#history` truthfully explains that video, replay activity, and incidents are not stored.
- Preview, replay, and source-speech verification, lint, and production build are green.
- macOS identifies the attached GroupGets `PureThermal (fw:v1.3.0)` USB/UVC interfaces; the privacy-safe no-go evidence is documented.

## Live versus simulated

Read this table before believing any other sentence in this repository.

| Capability | State in the frozen build | Evidence |
|---|---|---|
| Replay playback — start, pause, resume, restart, stop, completion | **Working, and simulated** | `npm run verify:replay`; six committed PNGs |
| Replay is labelled as not live | **Working** | The verifier asserts the exact string “Demo replay — not live”, and it renders above the viewport and over every frame |
| Source lifecycle releases every timer | **Verified** | Five start/pause/resume/stop cycles under a timer spy asserted at stop; mutation-checked |
| Display-only live browser preview | **Implemented, hardware gate blocked** | `npm run verify:preview` exercises the adapter with plain Node fakes. No attached device has played through a browser |
| Calibrated radiometry, Celsius values | **Not built** | Phase 1A no-go — no Y16 frame, no calibration mapping. See [docs/HARDWARE-PROBE.md](docs/HARDWARE-PROBE.md) |
| Hotspot classification, directional heat warning | **Not built** | Blocked behind radiometry. This is the accessibility feature Ember exists for, and it does not work yet |
| Source-status speech — Enable, Mute, Repeat | **Implemented, browser pass not run** | `npm run verify:speech` with fakes. Announces status and provenance only, never heat guidance |
| Assessment speech | **Not built** | There is no assessment to speak |
| Runs without a network | **Bundle verified, browser reload not run** | Build audit: no remote host, no `XMLHttpRequest`, no `WebSocket`; the only `fetch` is Vite’s same-origin modulepreload polyfill. Serve `dist` from a static local server — `file://` will not load it |
| Keyboard, VoiceOver, 200% zoom, 320–390px | **Built to the requirement, manual matrix not run** | Code checks passed. No operator has completed the VoiceOver or zoom matrix, so no result is claimed |
| Stored frames, video, or incidents | **None, by design** | `#history` is an honest empty state. No database, storage, analytics, or network path exists |

Known and unfixed: pressing Start disables the Start button, so keyboard focus drops to the document body. The same applies to Pause and Resume. An operator must re-tab to reach the next control.

## Frozen build

Feature freeze was 17:30. The frozen commit is `7e0fe3a` on `main`. Every claim above describes that commit, and no product code changed afterwards.

## Run it

Requirements: Node.js 22.12 or newer and npm. If you use `nvm`, the committed `.nvmrc` selects the minimum supported version.

```sh
git clone https://github.com/alibaduqail/dmv-hackathon.git
cd dmv-hackathon
node --version
npm ci
npm run dev
```

The reported Node version must be 22.12 or newer. Vite prints the local URL; open `#scan` or `#history`.

Before handing off:

```sh
npm run verify:replay
npm run verify:preview
npm run verify:speech
npm run lint
npm run build
```

## Safety boundary

The future calibrated Ember product may report an observed thermal condition. It still cannot account for every material, reflection, distance, exposure time, calibration state, or person-specific sensitivity. The current build makes no thermal assessment.

- Never promise that an object is safe to touch.
- Deterministic code—not a language model—must classify thermal conditions.
- Every warning needs visible text plus a non-color cue. Speech and color are additive.
- Live media and radiometric arrays are ephemeral by default; committed replay PNGs are simulated fixtures, not user captures.
- Simulated replay must never look or sound live.

Read [AGENTS.md](AGENTS.md) before changing code or copy.

## Collaborate

Create short-lived branches from `main` and integrate them through reviewed pull requests. Do not push feature work directly to `main`.

- [Partner workflow](docs/COLLABORATION.md)
- [Repo-local collaboration skill](.agents/skills/ember-collaboration/SKILL.md)
- [Optional agent-tool guide](docs/AGENT-TOOLS.md)
- [Current build status](docs/STATUS.md)
- [Phased requirements and acceptance](docs/REQUIREMENTS.md)
- [Architecture and file ownership](docs/ARCHITECTURE.md)
- [Shared contracts](docs/SCHEMA.md)
- [Build schedule](docs/PLAN.md)
- [Demo acceptance](docs/DEMO.md)
- [Local and hardware setup](docs/SETUP.md)
- [Phase 1A hardware evidence](docs/HARDWARE-PROBE.md)

Ponytail, Ruflo, Impeccable, Emil Design Engineering, and any other agent tools are contributor-only. They are not required to run the app and do not belong in Ember’s runtime dependencies.

## Hardware result and blocked gate

Phase 1A is **complete as an investigation and blocked as a calibrated-radiometry pass gate**. macOS sees PureThermal firmware `v1.3.0` and its UVC interfaces, but Ember obtained no Y16 frame, calibrated conversion, frame orientation, or temperature evidence. Radiometric bridge, hotspot assessment, and assessment speech remain future work.

Phase 1D’s contracts, adapter, session, UI, errors, and focused verifier are implemented. Its attached-device gate is blocked, so the submission path is the labelled Replay. The Codex in-app browser left permission pending because it could not present the permission surface; Ember logically invalidated that generation and would stop any stream returned later, but no browser label, settings, playing video, or camera-indicator result was obtained.

The implemented Live surface persists:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

Only after the team explicitly reopens the gate before the 17:30 feature freeze and completes two actual-browser playback/cleanup runs may the preview demonstrate live local video transport. It still does not deliver Ember’s directional accessibility feature, and its display pixels may never be converted into temperature or warnings. Otherwise the submission remains the labelled Replay. Follow [the exact browser validation](docs/SETUP.md#phase-1d-browser-preview-validation).
