# DECISIONS.md

Append-only, newest at the bottom. The only handoff mechanism — nobody has time for a standup.

Format: `HH:MM — who — what changed — what would surprise the next person`

Log when you: change a shape in `SCHEMA.md`, cut something from the demo, discover something is broken, or make a call the other person would make differently.

---

09:00 — team — Track 02, Health Tech & Accessibility. Locked. Other three tracks dead.
09:10 — team — Product is Tally: documentation system for pediatric SLPs. Niche is teletherapy for speech sound disorders in 3–8 clinician insurance-billing private practices.
09:15 — team — Thermal camera in scope as a second evidence type (VPI screening), gated at 3:00 PM. Pre-captured frames only, no capture code.
09:50 — claude — Docs moved from `tally-docs/` to repo root so Codex/GPT auto-loads `AGENTS.md`. Added `docs/ARCHITECTURE.md`: file tree, exported signatures, build order, landmines.
09:50 — claude — Five architecture calls locked, rationale in ARCHITECTURE §4. Most load-bearing: **Supabase is write-only at runtime** — no render path reads it, which is the only way AGENTS non-negotiable #6 ("runs with the network unplugged") is actually true.
09:50 — claude — Build order revised: `types.ts` + `store.ts` + `derive.ts` signatures ship BEFORE fixtures. mvp.md's schedule left the second dev with nothing to own until 4:00 PM; the seam unblocks them by 10:15.
11:00 — ____ — FIXTURES FROZEN.
15:00 — ____ — Thermal gate: GO / NO-GO → ____
17:30 — ____ — FEATURE FREEZE.
