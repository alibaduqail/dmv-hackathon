> Ember widens independent access to everyday spaces by giving blind and low-vision people a non-contact way to locate higher heat before reaching toward it.

# Ember

Ember is a hackathon prototype for Track 02, Health Tech & Accessibility. The intended product pairs a FLIR Lepton 3.5 on a PureThermal USB board with redundant on-screen and spoken guidance.

The current repository is an accessible application foundation with a clearly labelled simulated thermal replay. It does **not** yet claim live camera capture, calibrated temperature accuracy, hotspot classification, or that any object is safe to touch.

## What works now

- `#scan` is the default handheld scanner shell.
- Six simulated 160 × 120 PNG frames exercise one transport-neutral `ThermalSource` contract.
- Start, pause, resume, restart, stop, deterministic completion, and cleanup work.
- Replay content always says **“Demo replay — not live”**.
- Status uses visible words and a non-color symbol.
- `#history` truthfully explains that frames and incidents are not stored.
- Replay verification, lint, and production build are green.

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

Ember can report an observed thermal condition. It cannot account for every material, reflection, distance, exposure time, calibration state, or person-specific sensitivity.

- Never promise that an object is safe to touch.
- Deterministic code—not a language model—must classify thermal conditions.
- Every warning needs visible text plus a non-color cue. Speech and color are additive.
- Thermal frames are ephemeral by default.
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

Ponytail, Ruflo, Impeccable, Emil Design Engineering, and any other agent tools are contributor-only. They are not required to run the app and do not belong in Ember’s runtime dependencies.

## Next proof

The next milestone is deliberately gated: first identify the exact PureThermal hardware and prove calibrated 160 × 120 radiometry outside React; then add the local bridge and source/session lifecycle; only then implement deterministic hotspot analysis. The detailed dependency order is in [the phased requirements](docs/REQUIREMENTS.md).

If Y16 capture cannot be proven, the team will submit the labelled replay honestly instead of deriving fake temperatures from display colors.
