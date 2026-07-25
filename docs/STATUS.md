# STATUS.md — where the build actually is

**As of 10:15, hackathon day.** Phases 0 and 1 shipped, 47 minutes ahead of the plan.

This is the cold-start briefing. It does not repeat `docs/PLAN.md` (the schedule) or `docs/DECISIONS.md` (the running log) — it says what exists, what's next, and what is known to be wrong or unproven.

---

## 1. Done

| Phase | Result | Commit |
|---|---|---|
| **0 · Scaffold & seam** | Vite + React 19 + TS + Tailwind v4, tokens, types, store, derive, hash routing, verify script, `/api` stub | `c2ee4a6` |
| **1 · Fixtures** | 7 sessions, 32 historical events, session-7 transcript, `001_init.sql`. **FROZEN 10:13** | `1994617` |

**Verification actually run, not assumed:**

```
npm run verify:fixtures   →  10/10 green
npx tsc -b                →  clean
npm run build             →  clean, 208 kB / 65 kB gzip
vite dev                  →  all modules transform, no errors
```

`verify:fixtures` covers the seven invariants from `.claude/skills/seed-fixtures/SKILL.md` plus three that guard the demo itself: the opening accuracy numbers (`20,25,30,30,35,30`), the deliberately non-monotonic cue trend, and **the flip** — streak 3→0 and `isResolved` false→true when the independent production is approved. Check 10 simulates the stage moment directly.

### What runs today

`npm run dev` → `#record` renders Maya's real six-week history off the fixtures. `#review`, `#outputs`, `#thermal` are placeholder files that exist so nobody has to edit `App.tsx` later.

---

## 2. Next

**Phase 2 · Extraction · 11:00 → 12:30.** Read `.claude/skills/extraction-contract/SKILL.md` first. Full task list in `docs/PLAN.md`.

The transcript has four deliberate plants, documented in the header of `src/fixtures/session-07-transcript.ts`. Tune the prompt against them:

| t | What the model should find |
|---|---|
| 452 | `INDEPENDENT_PRODUCTION` — *"a clean R at the front of the word with no cue from me at all"* |
| 742 | `ATTEMPT` 14/20 — *"That's fourteen out of twenty"* |
| **628** | **the card to reject at ≈0.6** — *"I think I got that one right"* is the client's self-report, not a clinician observation |
| 845 | `QUESTION_UNRESOLVED` on `/r/ blends` — the thread that stays open |

`t=628` is the important one. The review step has to feel necessary rather than ceremonial, and a card that's wrong *for a reason a clinician can name out loud* is far better on stage than one that's just low-scored.

Then: Phase 3 review UI (12:30–15:00), **thermal gate at 15:00**, artifacts, and the 16:00–17:00 offline hardening block.

---

## 3. Issues found

### Resolved

| # | Issue | Resolution |
|---|---|---|
| 1 | Docs sat in `tally-docs/`, so `AGENTS.md` was invisible to Codex/GPT, which only auto-loads it from the repo root | Moved everything to root |
| 2 | **`unresolvedStreak` specified two incompatible ways.** `SCHEMA.md` says "consecutive sessions with no `INDEPENDENT_PRODUCTION`" — literally that returns **6**, but `seed-fixtures` requires **3** | Implemented as *consecutive recent sessions carrying an open `QUESTION_UNRESOLVED`*, matching the arc's "Unresolved (2)/(3)" labels. Fixtures place one on `/r/ initial` in sessions 4–6. Rationale in the docstring, guarded by check 1 |
| 3 | **`AGENTS.md` #6 was unachievable as written.** "Runs with the network unplugged" contradicts a stack where Supabase serves every read and artifacts are 5 LLM calls | Supabase is **write-only at runtime**. No render path awaits the network. Also removes stage spinners |
| 4 | `mvp.md`'s schedule left the second dev with nothing to own until 16:00 — their first block depended on `derive.ts`, which landed later | Phase 0 ships the seam (`types` / `store` / `derive`) first |
| 5 | 5 artifact LLM calls will not fit the 35-second `1:40–2:15` demo beat sequentially | Parallel calls, fired on review-complete rather than tab-open. **Not built yet — Phase 3** |
| 6 | Thermal is confirmed at `2:15`, after artifacts already rendered at `1:40` | Referral line is a deterministic template append from the confirmed `SCREENING_FLAG`, never an LLM re-run. **Not built yet — Phase 6** |
| 7 | `verify:fixtures` couldn't run — Node ESM needs explicit import extensions | Relative imports in `src/` carry `.ts` / `.tsx`. `allowImportingTsExtensions` was already on, so this cost no dependency. Keep the convention |
| 8 | Two schedules (`ARCHITECTURE` §6 and `PLAN.md`) would drift, and one would be on screen | `PLAN.md` is the only schedule |
| 9 | `npm create vite` in a non-empty directory offers to wipe it — would have taken the docs | Scaffolded in a temp dir, copied in |

### Open

| # | Risk | Owner |
|---|---|---|
| 1 | **`vercel dev` is unproven.** `npm run dev` does *not* serve `/api` — Vite knows nothing about Vercel functions, so `POST /api/extract` 404s and reads as a code bug. A stub returning 200 is committed specifically so this can be proven now | **D — do this before 11:00** |
| 2 | **No `.env`, no `.vercel` in the repo.** Supabase project and `ANTHROPIC_API_KEY` are not set up. Phase 2 is blocked on the key | **D — blocking** |
| 3 | **The offline path does not exist yet.** No `cached-extraction.json`, no `cached-artifacts.json`. Until both exist and have been tested with wifi off, the demo has a single point of failure on conference network | L, Phase 2 + Phase 5 |
| 4 | Thermal frames not captured. **Capture at lunch, not at 17:00** — the 5-minute version at lunch is the whole difference between the beat existing and not | D |
| 5 | Documentation-time number for the README not gathered. Interview replies take hours; needed by 15:00. **Do not invent a statistic** | D |
| 6 | Supabase not seeded, deliberately — nothing reads it. Say so if a populated table is wanted for a README screenshot (~20 lines) | — |

### Not an issue, but worth knowing

`001_init.sql` uses plain `text` where `SCHEMA.md` names an enum. Validation lives at the API boundary, where untrusted model output actually enters; a `CHECK` here would be a second thing to keep in sync and would surface as a 500 instead of a silently dropped event.

---

## 4. Deviations from spec

Three, all logged in `DECISIONS.md` with reasoning:

1. `src/store.ts` is **`src/store.tsx`** — it contains JSX.
2. `derive.ts` shipped with **real bodies instead of Phase-0 stubs**. They're pure functions over arrays; stubs would have been code written twice.
3. `verify:fixtures` asserts **10 checks, not 7**. The extra three guard the demo's opening numbers and its payoff.

## 5. Dependencies added

`tailwindcss`, `@tailwindcss/vite`, `@supabase/supabase-js`. Nothing else.

No router (hash switch, ~12 lines in `App.tsx`), no state library (React Context), no test framework, no `ts-node`/`tsx` (`verify:fixtures` runs on `node --experimental-strip-types`).
