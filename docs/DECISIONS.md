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
09:55 — claude — Added `docs/PLAN.md`: 8 phases with owners, checkboxes, exit gates. Moved the schedule out of ARCHITECTURE §6 so there is exactly one. Phase 5 (16:00–17:00) is offline hardening — it is the phase teams skip and then lose at 17:20.
10:10 — claude — Phase 0 shipped (`c2ee4a6`). Scaffold, types, store, derive, hash routing, verify script, api stub. `npm run build` and `tsc -b` green.
10:10 — claude — **`unresolvedStreak` doc conflict, resolved in code.** SCHEMA.md says "consecutive sessions with no INDEPENDENT_PRODUCTION" — read literally that counts sessions 1–6 and returns 6, contradicting the seed-fixtures invariant of 3. Implemented as "consecutive recent sessions carrying an open QUESTION_UNRESOLVED for the target", which matches the fixture arc's "Unresolved (2)/(3)" labels. Sessions with zero confirmed events for the target are skipped, so session 7 pre-review doesn't count. Rationale is in the docstring. **Fixtures must place a QUESTION_UNRESOLVED on /r/ initial in sessions 4, 5 and 6 or the banner never flips.**
10:10 — claude — `store.ts` is `store.tsx` (contains JSX). Relative imports inside `src/` now carry their extension (`'./events.ts'`) — that is what lets `verify:fixtures` run on bare node with no ts-node/tsx dependency. Keep the convention.
10:10 — claude — `derive.ts` written with real bodies rather than Phase-0 stubs; Phase 1 is pure data entry. `verify:fixtures` is already red 6/7 and is Phase 1's exit gate.
10:10 — claude — Tailwind v4 via `@tailwindcss/vite`. No `tailwind.config.js`, no PostCSS. Tokens are `@theme` vars in `src/styles/tokens.css` — use `bg-paper text-ink border-hairline text-red font-mono`.
10:10 — claude — Deps added: `tailwindcss`, `@tailwindcss/vite`, `@supabase/supabase-js`. Nothing else. No router — hash switch in `App.tsx`.
11:00 — ____ — FIXTURES FROZEN.
15:00 — ____ — Thermal gate: GO / NO-GO → ____
17:30 — ____ — FEATURE FREEZE.
