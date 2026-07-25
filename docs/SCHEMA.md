# SCHEMA.md — the data contract

**The interface between everyone on this repo.** Read this instead of reading each other's code. Change a shape here, announce it in chat and log it in `DECISIONS.md` — a silent schema change is the one thing that costs two hours.

SQL lives in `supabase/migrations/001_init.sql`. This is the version with the rules SQL can't express.

---

## Entities

```
clients ──< sessions >── clinicians
              │
              ├──< clinical_events ──< assignments
              ├──< thermal_captures ──┘ (via evidence link)
              └──< artifacts
```

One client (Maya Ortiz, 8). One clinician (Dana Whitfield, `DW`). One caregiver (Rosa Ortiz, Spanish). Seven sessions. That is the entire universe.

---

## `clinical_events` — the core object

Everything is derived from this.

| Field | Type | Rule |
|---|---|---|
| `session_id` | uuid | |
| `event_type` | enum | Unknown values **dropped, not coerced** |
| `evidence_type` | enum | `transcript` \| `thermal` |
| `timestamp_sec` | int \| null | Offset into session. Drives scroll-sync. Null for thermal |
| `target` | text \| null | `/r/ initial`, `/s/ blends` |
| `domain` | enum \| null | See below |
| `trials_correct` | int \| null | Only on `ATTEMPT` |
| `trials_total` | int \| null | Only on `ATTEMPT` |
| `cue_level` | enum \| null | See below |
| `evidence` | text | **Verbatim** transcript span under 25 words, or the thermal capture caption |
| `thermal_capture_id` | uuid \| null | Set iff `evidence_type = 'thermal'` |
| `ai_interpretation` | text | One sentence a clinician can confirm at a glance |
| `confidence` | 0.00–1.00 | Rendered only on unapproved cards |
| `status` | enum | `proposed` \| `approved` \| `edited` \| `rejected` |
| `clinician_edit` | text \| null | Set only when `status = 'edited'` |
| `reviewed_at` | timestamptz \| null | |

### State machine

```
proposed ──approve──> approved
         ──edit─────> edited      (clinician_edit required)
         ──reject───> rejected
```

Terminal. No un-approve — if the demo needs a reset, re-seed.

### The rule that matters

**Only `approved` and `edited` events feed downstream.** Artifacts, the record view, and assignments all filter on this. A `proposed` event leaking into a caregiver document breaks the entire product thesis on stage.

```ts
// src/lib/events.ts — write once, import everywhere. Do not re-filter inline.
export const confirmed = (e: ClinicalEvent) =>
  e.status === 'approved' || e.status === 'edited';
```

---

## `thermal_captures`

| Field | Type | Notes |
|---|---|---|
| `session_id` | uuid | |
| `stimulus` | text | `/m/ sustained` \| `/s/ sustained` |
| `image_path` | text | Committed PNG under `src/fixtures/thermal/` |
| `nasal_roi_peak_c` | numeric | Peak temp in the nostril region of interest |
| `baseline_c` | numeric | Facial baseline, same frame |
| `captured_at` | timestamptz | |

**Derived, never stored:** `delta_c = nasal_roi_peak_c - baseline_c`.

The screening signal is the **comparison between the pair**, not either frame alone:

```
/m/ delta  → expected HIGH  (nasal consonant, airflow should exit the nose)
/s/ delta  → expected LOW   (pressure consonant, palate should seal)

/s/ delta approaching /m/ delta  →  possible nasal air emission  →  SCREENING_FLAG
```

Captures are **pre-recorded fixtures**. There is no capture code in this repo and there will not be. See `.claude/skills/thermal-panel/`.

A `SCREENING_FLAG` event is `proposed` like any other. The clinician confirms it, and only then does it reach the SOAP note's objective section and the `auth_summary` referral line. **That loop is the whole reason thermal is in the product** — the camera produces a finding, Tally makes it count.

---

## Vocabularies

Mirror as TS unions in `src/types.ts`. Validate at the API boundary.

```ts
type EventType =
  | 'ATTEMPT' | 'CUE' | 'RETRY' | 'INDEPENDENT_PRODUCTION'
  | 'GENERALIZATION' | 'ERROR_PATTERN' | 'HOME_PROGRAM_ASSIGNED'
  | 'QUESTION_UNRESOLVED' | 'REINFORCEMENT' | 'SCREENING_FLAG';

type CueLevel =
  | 'independent' | 'verbal_cue' | 'visual_cue' | 'tactile_cue' | 'model';

type Domain =
  | 'articulation' | 'phonological_process' | 'fluency'
  | 'prosody' | 'expressive_language' | 'receptive_language'
  | 'resonance';   // thermal screening lands here
```

`SCREENING_FLAG` is the only event type that can carry `evidence_type = 'thermal'`.

---

## Derived state — compute, never store

All four in `src/lib/derive.ts`. Both the review banner and the record view read from there; two implementations will drift and one will be on screen.

| Function | Definition |
|---|---|
| `accuracyTrend(target)` | percent accuracy per session, ordered |
| `cueTrend(target)` | lowest cue level reached per session |
| `unresolvedStreak(target)` | consecutive sessions with no `INDEPENDENT_PRODUCTION` |
| `isResolved(target)` | confirmed `INDEPENDENT_PRODUCTION` exists this session |

**`unresolvedStreak('/r/ initial') === 3` before review, `isResolved === true` after.** That flip is the demo. If a fixture change breaks it, the fixture is wrong — do not adjust `derive.ts` to make it pass.

---

## `artifacts`

From confirmed events only. Four kinds, four distinct voices — if they read the same, the best moment collapses.

| `kind` | Audience | Voice |
|---|---|---|
| `soap_note` | Chart / billing | S/O/A/P headers. Objective carries trials, cue levels, thermal screening if confirmed |
| `home_program` | Rosa (Spanish) | Warm, concrete, zero jargon. Spanish primary, English toggle |
| `next_session_plan` | The clinician | Telegraphic. Target, starting cue level, what to probe |
| `auth_summary` | **The payer** | Seven-session trend, justification for continued care, referral line if flagged |

---

## Fixtures

`src/fixtures/` is **frozen at 11:00**. Six sessions of history, one transcript, two thermal PNGs. See `.claude/skills/seed-fixtures/SKILL.md` before changing a row.
