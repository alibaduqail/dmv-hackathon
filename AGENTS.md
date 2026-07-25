# AGENTS.md

Source of truth for every coding agent on this repo — Claude Code, Codex, ChatGPT. `CLAUDE.md` points here. Read completely before your first edit.

**Project:** Ember — a handheld thermal companion for blind and low-vision people.
**Track:** 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.** Product spec: `mvp.md`.

**Picking this up cold? Read `docs/STATUS.md` first.** Then read `docs/ARCHITECTURE.md` (file tree, contracts, landmines), `docs/SCHEMA.md` (shared shapes), and `docs/PLAN.md` (the only schedule).

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
6. **The foundation does not classify.** This milestone proves the source seam and accessible controls only. Do not infer warnings from the six PNGs.
7. **Controls work without precision pointing.** Keyboard operable, visible focus, accessible names, and at least 44 × 44 CSS pixels.
8. **Clean up the source lifecycle.** Leaving `#scan`, restarting, stopping, or unmounting must clear pending replay timers.

---

## Current milestone

Deliver:

- `#scan` as the default route.
- `#history` as an honest empty state.
- A six-frame 160 × 120 simulated PNG replay.
- Start, pause, restart, and stop controls.
- Source status in text, not color alone.
- Shared `ThermalSource` contracts and `ReplayThermalSource`.
- `npm run verify:replay`, build, and lint green.

Do **not** add live PureThermal capture, hotspot analysis, thresholds, speech, an LLM endpoint, notifications, or persistence in this milestone. The native PureThermal bridge is the next phase.

---

## Lane ownership

One owner per path at a time. Announce cross-lane edits before touching them.

| Path | Owner |
|---|---|
| `src/types.ts`, `src/lib/thermal-source.ts` | Build lead |
| `src/fixtures/replay.ts`, `public/replay/**`, `scripts/verify-replay.ts` | Build lead |
| `src/features/**`, `src/App.tsx` | Second dev |
| `src/styles/**`, `src/index.css` | Second dev |
| `docs/**`, `AGENTS.md`, `CLAUDE.md`, `mvp.md` | One designated writer |

Git history is the archive for removed product work. Do not copy it into an active legacy folder.

---

## Working agreement

- **Smallest change that proves the beat.** No abstraction before a concrete second source needs the seam.
- **No new dependency without asking.** The foundation needs none.
- **One task per session.** Keep bridge, analysis, and interface work in separate contexts.
- **No drive-by reorganization.** Remove obsolete files during the pivot; after that, keep paths stable.
- **Verification is not optional.** Run `npm run verify:replay`, `npm run lint`, and `npm run build` after relevant changes.
- **Commit after each working increment.** Do not push during the foundation milestone.
- **Append one line to `docs/DECISIONS.md`** when a contract changes, a demo beat is cut, or hardware behavior surprises you.

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
- Any warning generated from replay pixels during the foundation milestone.

---

## Out of scope

For this milestone: PureThermal drivers, native bridge, hotspot classification, speech, LLM calls, alerts, history persistence.

For the hackathon MVP: smart plugs or relays, remote third-party monitoring, cloud frame storage, diagnosis, medical claims, identity, billing, settings, dark mode, multi-tenancy, and autonomous physical actions.

If asked to add one, stop and re-scope it against `docs/DEMO.md` and the 17:30 freeze.
