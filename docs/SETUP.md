# SETUP.md

Partner onboarding, branch ownership, agent prompts, and handoffs are documented in `docs/COLLABORATION.md`. Optional Ponytail, Ruflo, Impeccable, Emil Design Engineering, and complementary agent setup is documented separately in `docs/AGENT-TOOLS.md`; none is required to run Ember.

## Web app

Requirements: Node.js 22.12 or newer and npm. `npm run verify:replay` relies on Node’s native TypeScript stripping. This machine currently uses Node `v26.5.0`.

```sh
node --version
npm ci
npm run dev
```

The reported Node version must be 22.12 or newer. If you use `nvm`, run `nvm use` first. Open the local URL Vite prints.

| Route | Purpose |
|---|---|
| `#scan` | Default scan surface and simulated replay |
| `#history` | Honest empty state; no data is persisted |

Reload both routes once. Hash routing must survive a direct reload.

---

## Verification

Run all three before handing off:

```sh
npm run verify:replay
npm run lint
npm run build
```

`verify:replay` checks the six-frame manifest, 160 × 120 dimensions, finite metadata, order, deterministic completion, pause/resume, and cleanup. It does not validate thermal accuracy.

For manual replay verification:

1. Open `#scan`.
2. Confirm the visible heading says **“Replay ready”** and the detail says **“Start the simulated sequence when you are ready.”**
3. Start and let all six frames finish.
4. Restart, pause after frame two, wait longer than one interval, and confirm the frame does not advance.
5. Resume and confirm the next frame is frame three.
6. Stop and confirm the heading returns to **“Replay ready”** and the displayed frame clears.
7. Start again, navigate to `#history`, wait, then return; no old timer or frame may advance in the background.
8. Confirm **“Demo replay — not live”** stays adjacent to the viewport whenever a replay frame is displayed.

Run the controls by keyboard only. Every control needs a visible focus indicator and accessible name.

---

## Replay assets

```
public/replay/ember-frame-01.png
public/replay/ember-frame-02.png
public/replay/ember-frame-03.png
public/replay/ember-frame-04.png
public/replay/ember-frame-05.png
public/replay/ember-frame-06.png
```

All are simulated, 160 × 120, and ordered by `src/fixtures/replay.ts`.

If the fixtures intentionally change:

```sh
node scripts/generate-replay-assets.mjs
npm run verify:replay
```

Review all six generated PNGs, the manifest order/metadata, and the exact provenance before committing. The generator writes fixtures; the application never runs it.

Do not:

- Rename or reorder an asset without updating the manifest and verifier.
- Treat the PNG palette as radiometric Celsius values.
- Remove or shorten the provenance label.
- Use replay to claim camera connectivity or classification accuracy.

---

## PureThermal hardware — next phase, not foundation setup

Before writing bridge code:

1. Identify the exact PureThermal board revision and firmware.
2. Seat the Lepton 3.5 with power disconnected.
3. Use a USB data cable, not a charge-only cable.
4. Confirm the device enumerates:

   ```sh
   system_profiler SPUSBDataType
   ```

5. Prove one 160 × 120 Y16 frame outside React.
6. Separately prove whether its values are calibrated radiometry convertible to Celsius; Y16 shape alone is insufficient.
7. Verify display and radiometric orientation with left/right and upper/lower placement.
8. Record calibration mode, conversion, encoding, byte order, and timestamp source without saving a live frame.
9. Only then select the bridge implementation and begin `PureThermalSource`.

Direct browser UVC radiometry is not assumed. The live path needs a local native bridge that preserves Y16 analysis data and creates a separate display image.

The GroupGets repositories in `docs/REFERENCES.md` are examples and feasibility evidence, not guaranteed working software. `GetThermal` currently labels itself non-working. Do not make it the demo dependency.

---

## Offline rehearsal

Before 17:30:

1. Disconnect the network.
2. Run the complete replay twice.
3. Reload `#scan` between runs.
4. Confirm no API, font, image, or route requires the network.
5. If the live bridge exists, unplug the camera mid-stream and confirm the UI enters `error` without retaining a current assessment.

The Phase 4 offline-fallback candidate is the committed replay, not a cached live frame. Claim disconnected-network verification only after this rehearsal passes.

---

## Contributor agent tooling

Do not add coding-agent or design-agent packages to Ember’s `package.json`. They are optional workstation tools and must not affect `npm ci`, the offline demo, or the production bundle.

Before enabling one:

1. Read its verified entry in `docs/AGENT-TOOLS.md`.
2. Pin down its job, owned files, off-limits files, and required checks.
3. Use a short-lived branch from `codex/ember`.
4. Inspect requested permissions and generated configuration before accepting them.
5. Review every resulting diff; never let a tool make a safety claim or push by default.

Use `.agents/skills/ember-collaboration/SKILL.md` to create the task brief and final handoff. Claude Code discovers the same skill through `.claude/skills/ember-collaboration`.
