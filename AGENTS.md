# AGENTS.md

Source of truth for every coding agent on this repo — Claude Code, Codex, ChatGPT. `CLAUDE.md` points here. Read completely before your first edit.

**Project:** Ember — a handheld thermal companion for blind and low-vision people.
**Track:** 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.** Product spec: `mvp.md`.

**Picking this up cold? Read `docs/STATUS.md` first.** Then read `docs/REQUIREMENTS.md` (atomic acceptance), `docs/ARCHITECTURE.md` (boundaries and placement), `docs/SCHEMA.md` (implemented shapes), and `docs/PLAN.md` (schedule authority).

**Working with a person or another agent?** Use `.agents/skills/ember-collaboration/SKILL.md`, then follow `docs/COLLABORATION.md`. Claude Code discovers the same canonical skill through `.claude/skills/ember-collaboration`. Verified identities and setup notes for optional agent tools live in `docs/AGENT-TOOLS.md`.

---

## The one thing to understand

A future calibrated Ember build may report a thermal condition. Even then, it cannot know every material, reflection, distance, exposure time, or personal sensitivity that determines whether touching something will cause harm. The current build makes no thermal assessment.

> **Never promise that an object is safe to touch.**

Use directional, observable language: *“Higher heat is present in the upper-right area. Keep your hand away and verify another way.”* Never say *“It is safe now.”*

---

## Non-negotiables

1. **Deterministic code classifies heat.** An LLM may explain an existing assessment. It never selects thresholds, creates a classification, or authorizes an action.
2. **Every warning is redundant.** Visible text + a non-color symbol are required. Color may reinforce meaning. Speech is additive and never the only output.
3. **Live media is ephemeral by default.** Do not record, upload, persist, log, or place live streams, tracks, frames, or radiometric arrays in history. A reviewed external recording of a staged non-personal Phase 5 demo does not authorize capture code in Ember.
4. **Replay provenance never disappears.** Every replay surface says exactly **“Demo replay — not live”** while replay content is displayed.
5. **Never mix source truth.** A replay frame cannot carry live provenance. A live source cannot use replay metadata.
6. **Replay does not classify.** Phase 0 replay proves the source seam and accessible controls only. Only a future reopened radiometric phase may consume validated live radiometric values; never infer warnings from the six PNGs.
7. **A colorized UVC preview does not classify.** Display pixels may never produce temperature, hotspot, direction, severity, guidance, warning, or speech. Keep **“Live thermal preview — non-radiometric”** and **“Display-only colorized video. No temperature or safety assessment.”** visible beside any live preview.
8. **Controls work without precision pointing.** Keyboard operable, visible focus, accessible names, and at least 44 × 44 CSS pixels.
9. **Clean up the source lifecycle.** Leaving `#scan`, restarting, stopping, switching, hiding/unloading the page, or unmounting must clear pending replay timers and stop every live media track.

---

## Current baseline and active milestone

Phase 0 is complete and verified:

- `#scan` as the default route.
- `#history` as an honest empty state.
- A six-frame 160 × 120 simulated PNG replay.
- Start, pause, resume, restart, and stop controls.
- Source status in text, not color alone.
- Optional native source speech with Enable, Mute, and Repeat; it accepts status/provenance only.
- Shared `ThermalSource` contracts and `ReplayThermalSource`.
- `npm run verify:replay`, `npm run verify:preview`, `npm run verify:speech`, build, and lint green.

Phase 1A investigation is complete with the calibrated-radiometry gate blocked:

- macOS 26.5.2 arm64 sees GroupGets `PureThermal (fw:v1.3.0)`, vendor/product `0x1e4e/0x0100`.
- macOS attaches UVC control and streaming interfaces through `UVCAssistant`.
- This shell did not enumerate an AVFoundation video device or capture mode.
- No Y16 frame, calibrated Celsius mapping, checksum, or orientation result was obtained.
- The exact board revision remains unknown. See `docs/HARDWARE-PROBE.md`.

Phase 1D’s display-only implementation is complete: explicit Live selection, temporary authorization cleanup, private exact-device matching, playback-gated status, pause/reacquire, lifecycle cleanup, fixed recovery states, and persistent non-radiometric truth are in code. Its attached-device exit gate is **blocked** after the intended input did not play by the 16:15 cutoff. The Codex in-app browser left camera permission pending because it could not present the permission surface; Ember logically invalidated that request and would stop any late stream, but no PureThermal browser label, stream settings, playback, or camera-indicator result is claimed.

The active milestone is Phase 3 accessibility/demo QA on the Replay path. Use Replay for the submitted demo and describe the live adapter as implemented but hardware-unverified. The team may explicitly reopen the Phase 1D hardware gate only before the 17:30 feature freeze and only if the intended input plays and cleans up twice in the actual demo browser; record that new evidence and decision before changing any claim.

Radiometric Phase 1B, deterministic assessment Phase 1C, and assessment speech Phase 2 are blocked for this hackathon build. Do **not** add `PureThermalSource`, a native radiometric bridge, hotspot analysis, temperature copy, palette analysis, warning speech, an LLM endpoint, notifications, persistent history, cloud frame storage, or physical actions. Follow requirement IDs and gates in `docs/REQUIREMENTS.md` and timing in `docs/PLAN.md`.

---

## Lane ownership

One owner per path at a time. Claim the exact files and acceptance checks using `docs/COLLABORATION.md`. Announce cross-lane edits before touching them.

| Path | Default lane |
|---|---|
| `src/types.ts`, `src/lib/**` | Thermal contracts and source |
| `src/fixtures/**`, `public/replay/**`, `scripts/**` | Replay and verification |
| `src/features/**`, `src/App.tsx` | Accessible interface |
| `src/styles/**`, `src/index.css` | Interface design |
| `docs/**`, `AGENTS.md`, `CLAUDE.md`, `mvp.md` | One designated writer |

Git history is the archive for removed product work. Do not copy it into an active legacy folder.

---

## Working agreement

- **Smallest change that proves the beat.** No abstraction before a concrete second source needs the seam.
- **No new dependency without asking.** The foundation needs none.
- **One bounded lane per agent.** Keep bridge, analysis, interface, and review work in separate contexts with disjoint file ownership.
- **No drive-by reorganization.** Remove obsolete files during the pivot; after that, keep paths stable.
- **Verification is not optional.** Run `npm run verify:replay`, `npm run verify:preview`, `npm run verify:speech`, `npm run lint`, and `npm run build` after relevant changes.
- **Commit after each working increment.** Branch from current `main`, push the short-lived branch, and integrate through a reviewed pull request; do not push feature work directly to `main`.
- **Append one line to `docs/DECISIONS.md`** when a contract changes, a demo beat is cut, or hardware behavior surprises you.

### Optional agent tooling

- Agent tooling is contributor infrastructure, not an Ember runtime dependency.
- Choose the minimum specialist that closes a concrete gap. Do not run overlapping orchestrators against the same worktree.
- Give every agent explicit owned files, off-limits files, acceptance checks, and a required handoff.
- A design agent cannot weaken safety copy, hide replay provenance, or make color or speech essential.
- A subagent cannot merge, push, or change a shared contract unless the integration owner explicitly assigns that authority. Hardware claims always require reproduced evidence and a documented check, regardless of who is authorized.
- Read `docs/AGENT-TOOLS.md` before installing or enabling Ponytail, Ruflo, Impeccable, Emil Design Engineering, or another tool.

---

## Design

The interface is a high-contrast safety instrument, not a decorative heat map.

- Status and warnings require **word + symbol**. Color may reinforce them but cannot carry meaning by itself.
- Visible focus must survive every theme color.
- Do not place essential text inside the thermal image.
- Preserve the thermal asset’s palette. Do not recolor replay or live frames for branding.
- Keep source status and replay provenance adjacent to the viewport.
- Use an `aria-live` status region. Future urgent warnings use an assertive region; routine source updates remain polite.
- Never animate in a way that prevents pause or hides provenance.

---

## Vocabulary

Exact terms in code, UI, and commits.

| Term | Means | Do not say |
|---|---|---|
| source | A lifecycle owner for replay frames or a live preview stream | camera, when it may be replay |
| replay | Simulated, ordered PNG frames | live feed, or “scan” when describing replay data |
| live preview | A local, colorized PureThermal UVC `MediaStream` displayed without analysis | RGB sensor, radiometric source, temperature feed |
| radiometric live source | Future calibrated frames arriving from a native PureThermal bridge | current capability, webcam preview |
| frame | One thermal image plus metadata | reading, assessment |
| radiometric values | Per-pixel Celsius data supplied by the live bridge | temperatures inferred from a PNG |
| assessment | Deterministic output derived from validated live radiometric values | AI opinion |
| warning | Redundant text, symbol, color, and later speech | guarantee |
| lower heat observed | A comparative thermal observation | safe to touch |

---

## Safety copy

Allowed:

- “Higher heat observed in the center area.”
- “Keep your hand away and verify another way.”
- “Thermal source paused.”
- “No current assessment”

Forbidden:

- “Safe,” “all clear,” or “safe to touch.”
- “The AI decided this is hot.”
- “No burn risk.”
- A Celsius value when the frame has no radiometric data.
- Any warning generated from replay pixels.
- Any temperature, hotspot, direction, warning, or speech generated from colorized UVC display pixels.

---

## Out of scope

For the current hackathon build: radiometric bridge work, classification, temperature, hotspot analysis, warning/assessment speech, LLM calls, alerts, history persistence, cloud frame storage, screenshots/recording, canvas extraction, palette analysis, and physical actions. Source-status speech is allowed only through the implemented no-frame/no-assessment boundary.

For the hackathon MVP: smart plugs or relays, remote third-party monitoring, cloud frame storage, diagnosis, medical claims, identity, billing, settings, dark mode, multi-tenancy, and autonomous physical actions.

If asked to add one, stop and re-scope it against `docs/DEMO.md` and the 17:30 freeze.
