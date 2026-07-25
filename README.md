> Ember widens independent access to everyday spaces by giving blind and low-vision people a non-contact way to locate higher heat before reaching toward it.

# Ember

Ember is a hackathon prototype for Track 02, Health Tech & Accessibility. The product concept pairs a FLIR Lepton 3.5 on a PureThermal USB board with redundant on-screen and spoken heat guidance.

The current repository is an accessible application foundation with a clearly labelled simulated thermal replay. Phase 1A hardware investigation is complete, but calibrated radiometry is unavailable through the selected laptop path. The repository does **not** claim live browser playback, temperature accuracy, hotspot classification, directional warning, assessment speech, or that any object is safe to touch.

## What works now

- `#scan` is the default handheld scanner shell.
- Six simulated 160 × 120 PNG frames exercise one transport-neutral `ThermalSource` contract.
- Start, pause, resume, restart, stop, deterministic completion, and cleanup work.
- Replay content always says **“Demo replay — not live”**.
- Status uses visible words and a non-color symbol.
- `#history` truthfully explains that frames and incidents are not stored.
- Replay verification, lint, and production build are green.
- macOS identifies the attached GroupGets `PureThermal (fw:v1.3.0)` USB/UVC interfaces; the privacy-safe no-go evidence is documented.

## Run it

Requirements: Node.js 22.12 or newer and npm. If you use `nvm`, the committed `.nvmrc` selects the minimum supported version.

```sh
git clone https://github.com/alibaduqail/dmv-hackathon.git
cd dmv-hackathon
git fetch origin
git switch --track origin/codex/ember
node --version
npm ci
npm run dev
```

The reported Node version must be 22.12 or newer. Vite prints the local URL; open `#scan` or `#history`.

Before handing off:

```sh
npm run verify:replay
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

The shared integration branch is `codex/ember`. Use short-lived branches for parallel work and let one integration owner push the shared branch.

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

## Hardware result and next milestone

Phase 1A is **complete as an investigation and blocked as a calibrated-radiometry pass gate**. macOS sees PureThermal firmware `v1.3.0` and its UVC interfaces, but Ember obtained no Y16 frame, calibrated conversion, frame orientation, or temperature evidence. Radiometric bridge, hotspot assessment, and assessment speech remain future work.

Phase 1D is the next bounded milestone: prove that the exact intended PureThermal input plays through browser MediaDevices, then add a local display-only preview with complete permission, failure, accessibility, and media-track cleanup. It must persist:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

The preview may demonstrate live local video transport. It does not yet deliver Ember’s directional accessibility feature and its display pixels may never be converted into temperature or warnings. If browser playback is unavailable, the submission remains the labelled replay.
