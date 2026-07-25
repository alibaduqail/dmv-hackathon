# ARCHITECTURE.md — the file map and the contracts

`SCHEMA.md` says what the data *is*. This says **what file it lives in, what that file exports, and who writes it.**

Read this before your first edit. If you are picking up a task cold, you need exactly three files: `AGENTS.md` (rules), this file (where things go), `docs/DEMO.md` (what counts as done).

---

## 1. Read order for a fresh session

| # | File | What you get |
|---|---|---|
| 1 | `AGENTS.md` | Rules, lane ownership, vocabulary, the 3:00 PM gate |
| 2 | `docs/ARCHITECTURE.md` | This file — tree, contracts, build order |
| 3 | `docs/SCHEMA.md` | Field-level data contract |
| 4 | `docs/DEMO.md` | The three minutes. Acceptance criteria for everything |
| 5 | `mvp.md` | Product + clinical background. Read once, don't re-read |

Skills in `.claude/skills/` load automatically in Claude Code. On Codex, read the matching `SKILL.md` by hand before touching that area:

| Touching | Read first |
|---|---|
| `src/fixtures/**` | `.claude/skills/seed-fixtures/SKILL.md` |
| `api/extract.ts`, `api/prompt.ts` | `.claude/skills/extraction-contract/SKILL.md` |
| `src/features/thermal/**` | `.claude/skills/thermal-panel/SKILL.md` |

---

## 2. The whole system in one diagram

```
src/fixtures/*.ts ──seed──> Supabase (write-only at runtime; UI never reads it)
       │
       └──> src/store.ts  ◄── THE ONLY RUNTIME SOURCE OF TRUTH
                 │
                 │  session 7 transcript
                 ▼
         POST /api/extract ──> Anthropic ──> validate ──> 6-8 events, status='proposed'
                 │                              │
                 │                    fail ─> api/cached-extraction.json
                 ▼
         Review UI: approve / edit / reject
                 │
                 ▼
         confirmed(e)  =  status is 'approved' or 'edited'
                 │
    ┌────────────┼─────────────┬──────────────────┐
    ▼            ▼             ▼                  ▼
 derive.ts   record view   POST /api/generate   thermal panel
 (trends,    (6-week          × 5, parallel      (2 fixture PNGs)
  streak)     chart)          = 4 artifacts        │
                                    ▲              │ SCREENING_FLAG
                                    └──────────────┘ confirmed → template
                                                       append, no regen
```

**One sentence:** fixtures seed a local store, extraction proposes events into it, the clinician confirms them, and every downstream surface reads the confirmed subset of that same store.

---

## 3. File tree

`✅` exists · `⬜` to build · **Owner** per `AGENTS.md` lane table.

```
AGENTS.md                          ✅  rules — source of truth
CLAUDE.md                          ✅  Claude Code specifics
mvp.md                             ✅  product spec
README.md                          ⬜  written 5:30–6:30, not before
docs/  ARCHITECTURE.md SCHEMA.md DEMO.md SETUP.md REFERENCES.md DECISIONS.md   ✅
.claude/skills/{seed-fixtures,extraction-contract,thermal-panel}/SKILL.md      ✅

supabase/migrations/001_init.sql   ⬜  lead   tables only. no auth, no RLS, no policies
scripts/verify-fixtures.ts         ⬜  lead   npm run verify:fixtures — asserts the 7 invariants

api/                                       ← lead. ANTHROPIC_API_KEY server-side only
  extract.ts                       ⬜  POST {sessionId} -> proposed events
  generate.ts                      ⬜  POST {sessionId, kind, lang} -> one artifact
  prompt.ts                        ⬜  extraction system prompt (3 load-bearing lines)
  artifact-prompts.ts              ⬜  one voice block per artifact kind
  cached-extraction.json           ⬜  offline fallback — refresh whenever prompt.ts changes
  cached-artifacts.json            ⬜  offline fallback

src/
  types.ts                         ⬜  lead   ALL unions + interfaces. Import, never redeclare
  store.ts                         ⬜  lead   React Context. The runtime source of truth
  App.tsx                          ⬜  lead   hash view switch + StoreProvider
  main.tsx  index.css              ⬜  lead
  styles/tokens.css                ⬜  lead   DO NOT ADD COLORS

  lib/
    events.ts                      ⬜  lead   confirmed() — write once, import everywhere
    derive.ts                      ⬜  lead   4 trend fns. Both banner and record view read here
    thermal.ts                     ⬜  lead   delta + ratio + threshold constant
    supabase.ts                    ⬜  lead   client + fire-and-forget writes

  fixtures/                        ⬜  lead   FROZEN 11:00
    sessions.ts                          7 sessions. 1-6 transcript=null, 7 populated
    events.ts                            32 historical events: 4,5,6,6,5,6 per session
    session-07-transcript.ts             TranscriptLine[] — evidence strings match verbatim
    thermal.ts                           2 ThermalCapture records, hard-coded temps
    thermal/m-sustained.png  s-sustained.png

  features/
    review/                        ⬜  lead        THE PRODUCT. Highest-value surface
      ReviewView.tsx  EventCard.tsx  TranscriptPane.tsx  StreakBanner.tsx
    record/                        ⬜  second dev  demo opens here
      RecordView.tsx  AccuracyTrend.tsx  CueTrend.tsx
    outputs/                       ⬜  second dev
      OutputsView.tsx  ArtifactPane.tsx
    thermal/                       ⬜  second dev  GATED — do not start before the 3:00 GO
      ThermalView.tsx  FramePair.tsx
```

**~30 files.** If your change adds a file not on this list, say so in chat first.

---

## 4. Five architectural calls

Made now so nobody re-litigates them at 5:20.

### 4.1 Supabase is write-only at runtime

`AGENTS.md` non-negotiable #6 says the demo must run **with the network unplugged**. That is impossible if the UI reads from Supabase. So:

- Fixtures seed Supabase once, at setup.
- `api/extract.ts` inserts proposed rows.
- The client writes confirmations through, **fire-and-forget, errors swallowed**.
- **No render path ever awaits Supabase.** No loading spinners on stage.

Supabase stays real and demoable ("here's the table"), and the demo survives conference wifi. If you're behind at 3:00, deleting the write-through costs zero demo beats.

### 4.2 One in-memory store, seeded from fixtures

`src/store.ts` — React Context over `useState`. No Zustand, no Redux, no TanStack Query. Four features read the same event list; prop-drilling it is worse than 30 lines of Context.

### 4.3 Artifacts: one endpoint, five parallel calls, fired early

Four artifacts + Spanish = 5 LLM calls. Beat `1:40–2:15` is **35 seconds** — sequential generation does not fit.

- One endpoint `api/generate.ts`, called 5× **in parallel** (separate calls keep the four voices from bleeding into each other, which is the failure mode `SCHEMA.md` warns about).
- **Fire on review-complete, not on tab-open.** There is ~15s of stage talk between the last approve and the artifacts beat. Spend it generating.
- Render each pane the moment its own call lands.

### 4.4 Thermal → artifacts is a template append, not a regeneration

Thermal is confirmed at beat `2:15`, after artifacts already rendered at `1:40`. Do **not** re-run the LLM on stage.

The SOAP objective line and the `auth_summary` referral line are **deterministic strings built from the confirmed `SCREENING_FLAG` event** and appended on confirm. Instant, unbreakable, and it makes "same record, different evidence" visibly literal.

### 4.5 No router

Four views, no deep-linking requirement. `location.hash` + a `hashchange` listener, ~12 lines in `App.tsx`. Survives a reload, lets you type `#thermal` if something goes wrong on stage, adds no dependency.

```
#record  (default — the demo opens here)   #review   #outputs   #thermal
```

---

## 5. Contracts — copy these signatures exactly

Anything below is a promise between the two of us. Change one, announce it and log it in `docs/DECISIONS.md`.

### `src/types.ts`

```ts
export type EventType =
  | 'ATTEMPT' | 'CUE' | 'RETRY' | 'INDEPENDENT_PRODUCTION'
  | 'GENERALIZATION' | 'ERROR_PATTERN' | 'HOME_PROGRAM_ASSIGNED'
  | 'QUESTION_UNRESOLVED' | 'REINFORCEMENT' | 'SCREENING_FLAG';

export type CueLevel = 'independent' | 'verbal_cue' | 'visual_cue' | 'tactile_cue' | 'model';
export type Domain =
  | 'articulation' | 'phonological_process' | 'fluency'
  | 'prosody' | 'expressive_language' | 'receptive_language' | 'resonance';

export type EventStatus  = 'proposed' | 'approved' | 'edited' | 'rejected';
export type EvidenceType = 'transcript' | 'thermal';
export type ArtifactKind = 'soap_note' | 'home_program' | 'next_session_plan' | 'auth_summary';

export interface ClinicalEvent {
  id: string;
  session_id: string;
  event_type: EventType;
  evidence_type: EvidenceType;
  timestamp_sec: number | null;      // null for thermal
  target: string | null;             // '/r/ initial'
  domain: Domain | null;
  trials_correct: number | null;     // ATTEMPT only
  trials_total: number | null;       // ATTEMPT only
  cue_level: CueLevel | null;
  evidence: string;                  // VERBATIM transcript span, <25 words
  thermal_capture_id: string | null; // set iff evidence_type === 'thermal'
  ai_interpretation: string;
  confidence: number;                // 0.00–1.00, shown only on unapproved cards
  status: EventStatus;
  clinician_edit: string | null;     // set only when status === 'edited'
  reviewed_at: string | null;
}

export interface Session {
  id: string; index: number; date: string;      // '2026-07-25'
  status: 'complete' | 'pending';
  transcript_id: string | null;                 // only session 7
}

export interface TranscriptLine {
  t_sec: number; speaker: 'clinician' | 'client'; text: string;
}

export interface ThermalCapture {
  id: string; session_id: string;
  stimulus: '/m/ sustained' | '/s/ sustained';
  image_path: string; nasal_roi_peak_c: number; baseline_c: number;
  captured_at: string;
}

export interface Artifact {
  kind: ArtifactKind; lang: 'en' | 'es'; body: string;
}
```

### `src/lib/events.ts`

```ts
export const confirmed = (e: ClinicalEvent) =>
  e.status === 'approved' || e.status === 'edited';
```

Do not re-filter inline anywhere. One definition, imported.

### `src/lib/derive.ts`

Pure functions. Every one filters through `confirmed()` first.

```ts
// index 0 = least support. Used for ordering and for "lowest cue reached".
export const CUE_ORDER: CueLevel[] =
  ['independent', 'verbal_cue', 'visual_cue', 'tactile_cue', 'model'];

export function accuracyTrend(
  events: ClinicalEvent[], sessions: Session[], target: string
): { sessionIndex: number; date: string; pct: number }[];

export function cueTrend(
  events: ClinicalEvent[], sessions: Session[], target: string
): { sessionIndex: number; date: string; cue: CueLevel }[];

export function unresolvedStreak(
  events: ClinicalEvent[], sessions: Session[], target: string
): number;

export function isResolved(
  events: ClinicalEvent[], sessionId: string, target: string
): boolean;
```

> `unresolvedStreak(…, '/r/ initial') === 3` before review, `isResolved === true` after.
> **That flip is the demo.** If a fixture change breaks it, the fixture is wrong — never patch `derive.ts` to make it pass.

### `src/store.ts`

```ts
export function useStore(): {
  sessions:   Session[];
  events:     ClinicalEvent[];      // all statuses — filter with confirmed()
  captures:   ThermalCapture[];
  transcript: TranscriptLine[];     // session 7
  artifacts:  Artifact[];

  addProposed(events: ClinicalEvent[]): void;
  setStatus(id: string, status: EventStatus, clinicianEdit?: string): void;
  setArtifact(a: Artifact): void;
};
```

`setStatus` stamps `reviewed_at` and fires the Supabase write-through itself. Callers do not touch Supabase.

### `src/lib/thermal.ts`

```ts
// Demo constant. NOT a validated clinical cutoff.
export const NASAL_EMISSION_RATIO = 0.30;

export const delta = (c: ThermalCapture) => c.nasal_roi_peak_c - c.baseline_c;
export const ratio = (m: ThermalCapture, s: ThermalCapture) => delta(s) / delta(m);
export const flagged = (m: ThermalCapture, s: ThermalCapture) =>
  ratio(m, s) > NASAL_EMISSION_RATIO;
```

### HTTP

```
POST /api/extract    { sessionId }
  -> 200 { count: number, events: ClinicalEvent[], source: 'live' | 'cached' }
     Never 4xx/5xx to the UI. Any failure serves the cache.

POST /api/generate   { sessionId, kind: ArtifactKind, lang?: 'en' | 'es' }
  -> 200 { kind, lang, body: string, source: 'live' | 'cached' }
     Same rule: never fails to the UI.
```

`source` is rendered nowhere. It exists so you can tell at a glance in devtools whether you're live or cached.

---

## 6. Build order — the seam matters more than the schedule

`mvp.md`'s schedule leaves the second dev with nothing to own until 4:00 PM. Fix: **ship the seam first.**

> **`types.ts` + `store.ts` + `derive.ts` are the seam.** Their *signatures* — even returning stubs — unblock every second-dev surface. Write them before fixtures, not after.

**Phase-by-phase tasks, owners, and gates live in `docs/PLAN.md` — the only schedule.** Two schedules drift and one of them ends up on screen.

The architectural point that drives it: the seam ships in Phase 0, before fixtures. Signatures unblock; implementations can lag.

---

## 7. Landmines

Each of these has cost a team an hour before.

1. **`npm run dev` does not serve `/api`.** Vite's dev server knows nothing about Vercel functions — `POST /api/extract` will 404 and look like a code bug. Run **`vercel dev`**. Sort this out at 11:00, not at 12:25.
2. **`evidence` must match the transcript byte-for-byte.** Scroll-sync is `String.indexOf`. A smart quote, an em dash, or a trailing space in a fixture and the card scrolls nowhere. Same rule validates extraction output — mismatch → **drop the event**.
3. **A stale `cached-extraction.json` is worse than none.** Regenerate it every time `prompt.ts` changes. Test the flag at **16:00**, not 17:25.
4. **A `proposed` event reaching an artifact breaks the whole thesis on stage.** Every downstream read goes through `confirmed()`. No inline status checks.
5. **`SCREENING_FLAG` is never accepted from the extractor.** It originates only in the thermal panel. Validation rejects it from `/api/extract` unconditionally.
6. **Never recolor the thermal PNGs.** Native false-color palette or the clinical claim collapses.
7. **Two `derive` implementations will drift and one of them will be on screen.** The streak banner and the record view import the same functions.
8. **If the thermal frames are staged, the UI says "simulated example."** In the panel, the README, and out loud.
9. **No commits yet at 09:47.** Commit after every working increment. A broken uncommitted repo at 17:15 is how teams lose.

---

## 8. Definition of done, per surface

| Surface | Done when |
|---|---|
| fixtures | `npm run verify:fixtures` asserts all 7 invariants green |
| `api/extract` | Live call returns 6–8 valid events, **one at ≈0.6 you'd want to reject**. Cache flag reproduces it offline |
| `review/` | Approve, edit, reject a full session. Cards go grey→red. Banner flips to *Resolved* |
| `record/` | Six-week accuracy + cue trend render from fixtures, streak visible before review |
| `outputs/` | All four render from confirmed events only, four distinct voices, Spanish toggle works |
| `thermal/` | Frame pair + deltas + comparison line + proposed card → confirm → **lands in SOAP objective and the referral line** |
| whole demo | Runs end-to-end **with wifi off**, twice in a row, without a reload |
