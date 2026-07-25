---
name: seed-fixtures
description: Use before creating, editing, or regenerating anything in src/fixtures/ or the Supabase seed. Covers the six-week clinical arc, the invariants the demo depends on, and how to verify a change didn't break the payoff. Trigger on fixtures, seed data, session history, Maya's record, trial counts, cue levels, or the /r/ streak.
---

# Seeding the six-week record

Fixtures are not test data. They are the demo's entire payload. A demo with one session proves nothing — the product claims it compounds, so the record must already exist when today's session lands.

## Cast

Client **Maya Ortiz**, 8. Clinician **Dana Whitfield** (`DW`). Caregiver **Rosa Ortiz**, prefers Spanish. Target: **/r/ initial position**. Six Saturdays Jun 13 → Jul 18 2026. Session 7 is Jul 25 — the demo — `status = 'pending'`, transcript populated, zero events.

## The arc

| # | Date | Trials | Cue level | Notes |
|---|---|---|---|---|
| 1 | Jun 13 | 4/20 (20%) | `tactile_cue` | Baseline probe |
| 2 | Jun 20 | 5/20 (25%) | `tactile_cue` | /r/ final emerging, 11/20 |
| 3 | Jun 27 | 6/20 (30%) | `visual_cue` | |
| 4 | Jul 4 | 6/20 (30%) | `tactile_cue` | **`QUESTION_UNRESOLVED` — no independent production** |
| 5 | Jul 11 | 7/20 (35%) | `visual_cue` | Unresolved (2) |
| 6 | Jul 18 | 6/20 (30%) | `visual_cue` | Unresolved (3). Home program, 2 of 3 logged |
| 7 | Jul 25 | **14/20 (70%)** | **`verbal_cue` → `independent`** | The flip |

Note sessions 3→4 and 5→6 go *backwards* on cue level. Real clinical data is not monotonic. A perfectly ascending line looks fabricated and a clinician will say so.

## Invariants — verify after any change

1. `unresolvedStreak('/r/ initial') === 3` before session 7 is reviewed.
2. Every historical event is `approved` (or `edited` for two of them, so the record shows humans do edit) with non-null `reviewed_at`.
3. Sessions 1–6 have `transcript = null`. Only session 7 carries one. We never claim to have stored six weeks of audio.
4. Every `evidence` string on session 7 appears **verbatim** in `session-07-transcript.ts`. Scroll-sync matches by string.
5. Events per session: 4, 5, 6, 6, 5, 6. Enough to look real, few enough that the record view stays readable.
6. Exactly one open `QUESTION_UNRESOLVED` on a *different* target (`/r/ blends`) survives into session 7 — the record has to keep tracking open threads after the headline one closes, or it reads as a scripted toy.
7. Trial totals are 20 in every session. Clinicians run consistent probe sets; varying totals looks careless.

## Writing convention

Historical `ai_interpretation` strings were written by a model and confirmed by a clinician. They should read that way — plain, specific, slightly clinical.

Good: `Client produced /r/ in initial position with tactile cueing; 6 of 20 trials correct.`
Bad: `Maya showed great progress today! 🎉`

Confidence values 0.58–0.94, varied. Uniform confidences look generated.

**Never write a diagnosis, prognosis, or care recommendation into a fixture.** Events describe what happened. The clinician draws conclusions.

## Verify

```bash
npm run verify:fixtures
```

Asserts all seven. If it fails, the fixture is wrong — do not adjust `derive.ts` to make the assertion pass.
