# AGENTS.md

Source of truth for every coding agent on this repo — Claude Code, Codex, ChatGPT. `CLAUDE.md` points here. Read completely before your first edit.

**Project:** Ember — a handheld thermal companion for blind and low-vision people.
**Track:** 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.** Product spec: `mvp.md`.

**Picking this up cold? Read `docs/STATUS.md` first.** Then read `docs/ARCHITECTURE.md` (file tree, contracts, landmines), `docs/SCHEMA.md` (shared shapes), and `docs/PLAN.md` (the only schedule).

**Working with a person or another agent?** Use `.agents/skills/ember-collaboration/SKILL.md`, then follow `docs/COLLABORATION.md`. Claude Code discovers the same canonical skill through `.claude/skills/ember-collaboration`. Verified identities and setup notes for optional agent tools live in `docs/AGENT-TOOLS.md`.

---

## The one thing to understand

Ember can report a thermal condition. It cannot know every material, reflection, distance, exposure time, or personal sensitivity that determines whether touching something will cause harm.

> **Never promise that an object is safe to touch.**

Use directional, observable language: *“Higher heat is present in the upper-right area. Keep your hand away and verify another way.”* Never say *“It is safe now.”*

---

## Non-negotiables

1. **Deterministic code classifies heat.** An LLM may explain an existing assessment. It never selects thresholds, creates a classification, or authorizes an action.
2. **Every warning is redundant.** Visible text + a non-color symbol are required. Color may reinforce meaning. Speech is additive and never the only output.
3. **Thermal frames are ephemeral by default.** Do not upload, persist, log, or place live frames in history unless the product scope explicitly changes.
4. **Replay provenance never disappears.** Every replay surface says exactly **“Demo replay — not live”** while replay content is displayed.
5. **Never mix source truth.** A replay frame cannot carry live provenance. A live source cannot use replay metadata.
6. **Replay does not classify.** Phase 0 replay proves the source seam and accessible controls only. Phase 1 analysis may consume validated live radiometric values; never infer warnings from the six PNGs.
7. **Controls work without precision pointing.** Keyboard operable, visible focus, accessible names, and at least 44 × 44 CSS pixels.
8. **Clean up the source lifecycle.** Leaving `#scan`, restarting, stopping, or unmounting must clear pending replay timers.

---

## Current baseline and active milestone

Phase 0 is complete and verified:

- `#scan` as the default route.
- `#history` as an honest empty state.
- A six-frame 160 × 120 simulated PNG replay.
- Start, pause, restart, and stop controls.
- Source status in text, not color alone.
- Shared `ThermalSource` contracts and `ReplayThermalSource`.
- `npm run verify:replay`, build, and lint green.

Phase 1 is the active implementation milestone. It authorizes only:

- Identifying the exact PureThermal board and firmware.
- Proving one 160 × 120 Y16 frame outside React.
- Adding the smallest local bridge and `PureThermalSource` behind the existing transport seam.
- Validating radiometric frames and implementing pure, deterministic hotspot analysis after a real frame is proven.

Replay pixels still cannot be classified. Do **not** add speech, an LLM endpoint, notifications, persistent history, cloud frame storage, or physical actions in Phase 1. Follow the hardware gate and exit criteria in `docs/PLAN.md`.

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
- **Verification is not optional.** Run `npm run verify:replay`, `npm run lint`, and `npm run build` after relevant changes.
- **Commit after each working increment.** Use `codex/ember` as the shared integration branch; do not push directly to `main`.
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

- Status and warnings use **word + symbol + color**, in that order.
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
| source | An implementation that emits thermal frames | camera, when it may be replay |
| replay | Simulated, ordered PNG frames | live feed, scan |
| live source | Frames arriving from the native PureThermal bridge | direct browser camera |
| frame | One thermal image plus metadata | reading, assessment |
| radiometric values | Per-pixel Celsius data supplied by the live bridge | temperatures inferred from a PNG |
| assessment | Deterministic output derived from radiometric values | AI opinion |
| warning | Redundant text, symbol, color, and later speech | guarantee |
| lower heat observed | A comparative thermal observation | safe to touch |

---

## Safety copy

Allowed:

- “Higher heat observed in the center area.”
- “Keep your hand away and verify another way.”
- “Thermal source paused.”
- “No current assessment.”

Forbidden:

- “Safe,” “all clear,” or “safe to touch.”
- “The AI decided this is hot.”
- “No burn risk.”
- A Celsius value when the frame has no radiometric data.
- Any warning generated from replay pixels.

---

## Out of scope

For active Phase 1: speech, LLM calls, alerts, history persistence, cloud frame storage, and physical actions. The native bridge and pure deterministic hotspot analysis are in scope only behind the hardware and validation gates above.

For the hackathon MVP: smart plugs or relays, remote third-party monitoring, cloud frame storage, diagnosis, medical claims, identity, billing, settings, dark mode, multi-tenancy, and autonomous physical actions.

If asked to add one, stop and re-scope it against `docs/DEMO.md` and the 17:30 freeze.
