# STATUS.md — where the build actually is

**As of 11:30, hackathon day.** Phases 0, 1 and 2 shipped. Phase 2 closed an hour early against a 12:30 window.

This is the cold-start briefing. It does not repeat `docs/PLAN.md` (the schedule) or `docs/DECISIONS.md` (the running log) — it says what exists, what's next, and what is known to be wrong or unproven.

---

## 1. Done

| Phase | Result | Commit |
|---|---|---|
| **0 · Scaffold & seam** | Vite + React 19 + TS + Tailwind v4, tokens, types, store, derive, hash routing, verify script, `/api` stub | `c2ee4a6` |
| **1 · Fixtures** | 7 sessions, 32 historical events, session-7 transcript, `001_init.sql`. **FROZEN 10:13** | `1994617` |
| **2 · Extraction** | `api/prompt.ts`, `api/extract.ts` with all 10 validation rules, offline cache. Plus `record/` trends and the `outputs/` shell | `ce3b26a`, `ec7fb89` |

**Verification actually run, not assumed:**

```
npm run verify:fixtures   →  14/14 green
npx tsc -b                →  clean
npm run build             →  clean, 213 kB / 67 kB gzip
USE_CACHED_EXTRACTION=1   →  source: cached, count: 8
```

`verify:fixtures` covers the seven invariants from `.claude/skills/seed-fixtures/SKILL.md`, three that guard the demo itself (the opening accuracy numbers `20,25,30,30,35,30`, the deliberately non-monotonic cue trend, and **the flip** — streak 3→0 and `isResolved` false→true on approve), and four added in Phase 2 that guard the offline path: every cached evidence span verbatim in the transcript, the cache surviving validation as 6–8 events, exactly one card under 0.7, and `SCREENING_FLAG` rejected from the extractor even when its evidence is valid. The check count is derived now, so adding one can't leave the tail message stale.

### What runs today

`npm run dev` → `#record` renders Maya's six-week history off the fixtures: accuracy `20,25,30,30,35,30` and the cue trend as inline SVG (no chart library), with `unresolvedStreak === 3` visible before any review. `#outputs` is four tabs with honest empty states, reading through `confirmed()`. `#review` and `#thermal` are still placeholders.

`vercel dev` → `POST /api/extract` returns `{count, events, source}`. Untested over HTTP — see Open #1.

---

## 2. Next

**Phase 3 · Review UI · 12:30 → 15:00.** The highest-value surface in the product; everything downstream reads from it. Full task list in `docs/PLAN.md`.

The shape of it:

- `EventCard` — proposed cards render soft grey, hairline dashed, confidence shown. Approve snaps to full ink and grows a **red rule down the left edge**. That is the only animation in the app.
- Edit requires a `clinician_edit`, sets status `edited`, renders red. Reject recedes and is excluded from everything downstream.
- `TranscriptPane` scroll-sync is `String.indexOf` on the verbatim `evidence` span, then `scrollIntoView`. Extraction already guarantees the span matches — validation drops anything that doesn't.
- `StreakBanner` reads `unresolvedStreak` / `isResolved` from `derive.ts`. **No second implementation.**
- On last confirm, fire all 5 `/api/generate` calls in parallel. There is ~15s of stage talk between the last approve and the artifacts beat; spend it generating.

The eight proposed cards the review will receive, in order — approve 5–6, edit 1, reject 1:

| t | Type | Conf |
|---|---|---|
| 65 | `CUE` visual | 0.92 |
| 157 | `CUE` verbal | 0.89 |
| 316 | `ERROR_PATTERN` | 0.81 |
| **452** | **`INDEPENDENT_PRODUCTION`** — the payoff | 0.94 |
| **628** | **`ATTEMPT`** — client self-report, **the one to reject** | **0.58** |
| 742 | `ATTEMPT` 14/20 | 0.93 |
| 845 | `QUESTION_UNRESOLVED` on `/r/ blends` | 0.90 |
| 920 | `HOME_PROGRAM_ASSIGNED` | 0.91 |

`t=628` is the one that matters. It is wrong for a reason a clinician can say out loud — the speaker is the client reporting on her own production, not the clinician observing it. That is what makes the review step read as necessary rather than ceremonial.

Then: **thermal gate at 15:00**, artifacts 15:00–16:00, and the 16:00–17:00 offline hardening block.

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
| 10 | **`api/` was in no tsconfig at all.** `tsconfig.app.json` includes `src`, `tsconfig.node.json` included only `vite.config.ts` — so `npx tsc -b` was silently skipping every file that runs on stage | `tsconfig.node.json` now includes `api`. Caught during Phase 2 |

### Open

| # | Risk | Owner |
|---|---|---|
| 1 | **`vercel dev` is still unproven, and worse than at 10:15: the `vercel` CLI is not installed on this laptop.** `POST /api/extract` has never been served over HTTP. `npm run dev` does *not* serve `/api` — Vite knows nothing about Vercel functions, so it 404s and reads as a code bug | **D — blocking, do before 12:30** |
| 2 | **No `.env`, no `.vercel`, no `ANTHROPIC_API_KEY`.** Phase 2 shipped around this by falling back to the cache, but the **live** extraction path has never executed once.  `PLAN.md`'s Phase 2 exit gate is half-met | **D — blocking** |
| 3 | **`api/cached-extraction.ts` is hand-built, not from a live run.** Eight events tuned to the four documented transcript plants; every span asserted verbatim by check 11. **Refresh from a known-good live run the moment the key lands, and again if `prompt.ts` changes** — a stale cache that disagrees with live is worse than none | L, when key lands |
| 4 | `cached-artifacts.json` does not exist. Half the offline path is still missing | L, Phase 3 |
| 5 | Thermal frames not captured. **Capture at lunch, not at 17:00** — the 5-minute version at lunch is the whole difference between the beat existing and not | D |
| 6 | Documentation-time number for the README not gathered. Interview replies take hours; needed by 15:00. **Do not invent a statistic** | D |
| 7 | Supabase not seeded, deliberately — nothing reads it. Say so if a populated table is wanted for a README screenshot (~20 lines) | — |
| 8 | **Two background agents sharing one working tree raced.** `ec7fb89` is a two-lane commit: the record-view files were staged by one agent when the extraction lane ran `git commit`, so they landed under the extraction message. Content is correct and both `DECISIONS.md` lines survived; it was not rebased apart. Phase 3 should give the lanes separate branches or run them one at a time | both |

### Not an issue, but worth knowing

`001_init.sql` uses plain `text` where `SCHEMA.md` names an enum. Validation lives at the API boundary, where untrusted model output actually enters; a `CHECK` here would be a second thing to keep in sync and would surface as a 500 instead of a silently dropped event.

`api/extract.ts` never returns 4xx or 5xx to the UI. No key, bad JSON, a refusal, an upstream 500, or fewer than 5 events surviving all serve the cache. The contract's `source` field (`'live'` / `'cached'`) is rendered nowhere — it exists so you can tell in devtools which path you're on.

---

## 4. Deviations from spec

Six, all logged in `DECISIONS.md` with reasoning:

1. `src/store.ts` is **`src/store.tsx`** — it contains JSX.
2. `derive.ts` shipped with **real bodies instead of Phase-0 stubs**. They're pure functions over arrays; stubs would have been code written twice.
3. `verify:fixtures` asserts **14 checks, not 7**. Three guard the demo's opening numbers and its payoff; four guard the offline extraction path.
4. The offline cache is **`api/cached-extraction.ts`**, not the `cached-extraction.json` named in `ARCHITECTURE.md` §3. A module needs no `resolveJsonModule`, no `with { type: 'json' }`, and no bet on how Vercel's bundler treats a JSON import — and `tsc` checks it. It holds **raw model output** and runs through the same `validate()` as the live path, so a cache that drifts out of contract fails `verify:fixtures` instead of failing on stage.
5. **No `@anthropic-ai/sdk`.** `api/extract.ts` calls `/v1/messages` with raw `fetch`, ~15 lines, because `AGENTS.md` freezes `package.json` without asking. Swap it if the dependency is wanted.
6. `tsconfig.node.json` now includes `api/` — see Resolved #10.

## 5. Dependencies added

`tailwindcss`, `@tailwindcss/vite`, `@supabase/supabase-js`. **Nothing added in Phase 2.**

No router (hash switch, ~12 lines in `App.tsx`), no state library (React Context), no test framework, no chart library (inline SVG), no Anthropic SDK (raw `fetch`), no `ts-node`/`tsx` (`verify:fixtures` runs on `node --experimental-strip-types`).
