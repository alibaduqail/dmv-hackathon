# PLAN.md — the build, in phases

**The only schedule.** `docs/DEMO.md` says what done looks like; `docs/ARCHITECTURE.md` says where code goes; this says what happens next and in what order.

Two people. **L** = build lead, **D** = second dev. Check boxes as you go. Log surprises in `docs/DECISIONS.md`.

**Freeze is 17:30, not 19:00.** The last 90 minutes are README + recording + submission form. Criteria 01–04 are judged on the upload, unnarrated.

---

## Phase status

| # | Phase | Window | Exit gate |
|---|---|---|---|
| 0 | Scaffold & seam | now → 10:15 | D can import `useStore()` and render |
| 1 | Fixtures | 10:15 → 11:00 | `verify:fixtures` green · **FROZEN 11:00** |
| 2 | Extraction | 11:00 → 12:30 | Live call → 6–8 events, one at ≈0.6 |
| — | **merge #1** | 12:30 | |
| 3 | Review UI | 12:30 → 15:00 | Full session reviewed, banner flips |
| — | **THERMAL GATE** | 15:00 | GO / NO-GO logged in `DECISIONS.md` |
| 4 | Artifacts + record detail | 15:00 → 16:00 | Four artifacts, four voices, Spanish |
| — | **merge #2 — last merge of the day** | 16:00 | |
| 5 | Harden | 16:00 → 17:00 | **Full demo runs with wifi off, twice** |
| 6 | Thermal *(only if GO)* | 17:00 → 17:30 | Confirmed flag lands in SOAP + referral line |
| — | **HARD FREEZE** | **17:30** | |
| 7 | Package | 17:30 → 18:30 | README + 90s recording + form submitted |

---

## Phase 0 — Scaffold & seam · now → 10:15

**Why first:** `types.ts`, `store.ts`, and `derive.ts` are the seam between the two lanes. Their *signatures* unblock every second-dev surface. Ship them before fixtures — stubs are fine, the shapes are not negotiable.

**L — done, commit `c2ee4a6`**
- [x] Vite + React 19 + TS + Tailwind v4 (`@tailwindcss/vite`, no config file, no PostCSS)
- [x] Fonts: Instrument Serif, Karla, JetBrains Mono
- [x] `src/styles/tokens.css` — paper, ink, grey, hairline, the one red. **No other colors, ever**
- [x] `src/types.ts` — real and complete
- [x] `src/lib/events.ts` — `confirmed()`
- [x] `src/lib/derive.ts` — **real bodies, not stubs.** Pure functions over arrays; stubs would be code written twice
- [x] `src/lib/thermal.ts` — delta / ratio / threshold
- [x] `src/store.tsx` — Context + provider. Fixtures wired, currently empty arrays
- [x] `src/App.tsx` — hash switch, `<StoreProvider>`, four view files pre-created so nobody edits `App.tsx` later
- [x] `scripts/verify-fixtures.ts` + `npm run verify:fixtures` — **already red, 6 of 7. That is Phase 1's target**
- [x] `api/extract.ts` stub returning 200, so D can prove `vercel dev` now

**D** — blocked on L until 10:15, so do the things nobody else can:
- [ ] Supabase project created, connection string in `.env`
- [ ] `ANTHROPIC_API_KEY` set in Vercel **server-side only**, and locally for `vercel dev`
- [ ] `vercel dev` serves a stub `api/extract.ts` returning 200 — **prove this now, not at 12:25**
- [ ] Text the group chats: *"how long does your note take after each session?"* Replies take hours; you need the number by 15:00 for the README
- [ ] Identify the thermal camera, read `docs/REFERENCES.md`, plan the lunch capture

**Exit:** D pulls, imports `useStore()` and `accuracyTrend()`, renders a component without touching L's files.

---

## Phase 1 — Fixtures · 10:15 → 11:00

Read `.claude/skills/seed-fixtures/SKILL.md` first. Fixtures are not test data — they are the demo's entire payload.

**L — done. FROZEN 10:13, 47 minutes early**
- [x] `src/fixtures/sessions.ts` — 7 sessions, cast, `CURRENT_SESSION_ID` / `CURRENT_TARGET`
- [x] `src/fixtures/events.ts` — 32 historical events, 4/5/6/6/5/6, two `edited`
- [x] `src/fixtures/session-07-transcript.ts` — 84 lines, the four plants documented in its header
- [x] `supabase/migrations/001_init.sql` — 6 tables, no auth, no RLS
- [x] `npm run verify:fixtures` → **10/10 green**
- [ ] `src/fixtures/thermal/` PNGs — Phase 6, capture at lunch
- [ ] Supabase seed script — **skipped: nothing in the app reads the DB.** Say if you want the history mirrored for a README screenshot (~20 lines)

**D**
- [ ] `src/features/record/` skeleton against stubbed `derive.ts` — chart shells, session list
- [ ] Capture thermal frames **at lunch, not at 17:00**. Vendor app, sustain 3s each, export PNG, note nostril peak + facial baseline off the app readout

**Exit gate — 11:00, non-negotiable:**
- [x] `npm run verify:fixtures` green
- [x] `unresolvedStreak('/r/ initial') === 3`
- [x] Every session-7 `evidence` string appears **verbatim** in the transcript
- [x] **`FIXTURES FROZEN` logged in `DECISIONS.md`.** A fixture change now needs both of you to agree

---

## Phase 2 — Extraction · 11:00 → 12:30

Read `.claude/skills/extraction-contract/SKILL.md` first. This is the one genuinely live thing on stage.

**L**
- [ ] `api/prompt.ts` — the three load-bearing lines survive verbatim:
  - *"You are documenting what the CLINICIAN did and observed."*
  - *"You never make a diagnosis, prognosis, or clinical recommendation."*
  - *"Extract trial counts when the transcript states them."*
- [ ] Send the six-session history as context — it's why interpretations reference *"first since baseline"*
- [ ] Instruct confidence < 0.7 on ambiguity. **You need one rejectable card at ≈0.6** or the review step feels ceremonial
- [ ] `api/extract.ts` — all 10 validation rules. **Reject, never repair.** Silent drops
- [ ] `SCREENING_FLAG` rejected from the extractor unconditionally
- [ ] < 5 events surviving → serve the cache
- [ ] `api/cached-extraction.json` from a known-good live run
- [ ] **commit + push**

**D**
- [ ] `record/` done — accuracy trend, cue trend, streak visible, reads real fixtures
- [ ] `outputs/` shell — four panes, tab switch, empty states

**Exit:** live call returns 6–8 valid events with one at ≈0.6. `USE_CACHED_EXTRACTION=1` reproduces it offline.

### merge #1 — 12:30

---

## Phase 3 — Review UI · 12:30 → 15:00

The highest-value surface in the product. Everything else is downstream of it.

**L**
- [ ] `EventCard` — proposed: soft grey, hairline dashed, confidence shown
- [ ] Approve → snaps to full ink, grows a **red rule down the left edge**. The only animation in the app
- [ ] Edit → `clinician_edit` required, status `edited`, renders red
- [ ] Reject → recedes, excluded from everything downstream
- [ ] `TranscriptPane` + scroll-sync — `String.indexOf` on the verbatim `evidence` span, `scrollIntoView`, highlight
- [ ] `StreakBanner` — reads `unresolvedStreak` / `isResolved` from `derive.ts`. **No second implementation**
- [ ] On last confirm: fire all 5 `/api/generate` calls in parallel. Hides latency behind stage talk

**D**
- [ ] `api/generate.ts` — one endpoint, `{sessionId, kind, lang}`, never 4xx to the UI
- [ ] `api/artifact-prompts.ts` — four voice blocks. **Read them side by side; if two sound alike, the best beat collapses**
- [ ] `outputs/` renders from `confirmed()` only. Spanish toggle on `home_program`
- [ ] `api/cached-artifacts.json`

**Exit:** review a full session end to end. Cards go grey → red. Banner flips to *Resolved — first independent production*.

### THERMAL GATE — 15:00

Review UI done end-to-end **and** record view underway?

- **GO** → thermal gets 17:00–17:30. Standalone route, wired to nothing.
- **NO-GO** → **cut it.** Delete the branch, strip the beat from `DEMO.md`, never mention it on stage.

Log the answer in `DECISIONS.md`. This is a checkpoint, not a preference — do not renegotiate it at 16:30.

**Cut order if behind:** thermal → record view detail → `next_session_plan` → Spanish toggle.
**Never cut** `auth_summary` or `home_program` — they carry criteria 01 and 04.

---

## Phase 4 — Artifacts + record detail · 15:00 → 16:00

**L**
- [ ] Review polish, the approve interaction, empty and error states
- [ ] Verify **no `proposed` event reaches any artifact.** One leak breaks the product thesis on stage

**D**
- [ ] All four artifacts render from confirmed events, four distinct voices
- [ ] `auth_summary` reads as a seven-session trend with justification for continued care — **the money shot**
- [ ] Spanish toggle works
- [ ] Record view detail — the six-week trend closing

### merge #2 — 16:00 · last merge of the day

---

## Phase 5 — Harden · 16:00 → 17:00

The phase teams skip and then lose at 17:20. Do not skip it.

- [ ] **Turn the wifi off.** `USE_CACHED_EXTRACTION=1` + cached artifacts → run the entire demo. Both flags
- [ ] Refresh `cached-extraction.json` if `prompt.ts` changed since Phase 2. A stale cache that disagrees with live is worse than none
- [ ] Full end-to-end run **twice, no reload between**
- [ ] Screenshot all four artifacts for the README while everything is working
- [ ] Every remaining commit pushed

**Exit:** demo runs offline, twice, without a reload. If it doesn't, this phase gets Phase 6's window and thermal is cut.

---

## Phase 6 — Thermal · 17:00 → 17:30 · only if 15:00 was GO

Read `.claude/skills/thermal-panel/SKILL.md` first. **No capture code. Two committed PNGs.** Hard abort 17:30.

**D**
- [ ] `#thermal` standalone route, wired to nothing that can break the main flow
- [ ] Frame pair side by side, **native thermal palette — do not recolor**, labelled `/m/ sustained` / `/s/ sustained`
- [ ] Nasal delta under each, mono
- [ ] The comparison in plain words: `/s/ delta is 82% of /m/ delta — expected under 30%`
- [ ] Proposed `SCREENING_FLAG` card, **identical styling to every other proposed card**
- [ ] Confirm → template-append into the SOAP objective and the `auth_summary` referral line. **Deterministic string, no LLM call on stage**
- [ ] Copy says **screening**. Never diagnose, detect, measure, or test for
- [ ] If the frames are staged, the UI says **simulated example** — and you say it out loud

**If you run out of time, cut the panel's polish. Never cut the flow into the artifacts** — that loop is the entire reason thermal is in the product.

### HARD FREEZE — 17:30

---

## Phase 7 — Package · 17:30 → 18:30

Criteria 01–04 are scored on this, unnarrated. A perfect build that isn't packaged scores nothing.

- [ ] **README**, first line is track fit:
  > Tally lowers the cost of care and closes an accessibility gap for pediatric speech therapy: it removes documentation time from every session, and it produces the progress evidence that keeps a child's therapy authorized.
- [ ] Then: problem · four artifact screenshots · the anti-scribe difference · **what's real vs. mocked, stated plainly** · interview quotes
- [ ] **90-second captioned screen recording, no voiceover.** Same beats as `DEMO.md`
- [ ] Submission form
- [ ] 18:30–19:00 buffer. Do not spend it building

**The number:** quote what you heard in interviews today. *"We asked three people and heard 6–10 minutes per session"* beats a citation you can't defend. **Do not invent a statistic** — a judge who works in health will catch it and you lose criteria 02 and 04 at once.

---

## Standing rules

- **Commit after every working increment.** A broken uncommitted repo at 17:15 is how teams lose
- **Merges at 12:30 and 16:00 only.** Never after 16:00
- **One task per session, `/clear` between.** Session budget is scarcer than time
- **No new dependency without asking.** No abstractions before the third repetition
- **Escalate, don't guess:** a fixture would change after 11:00 · extraction returns <5 or >10 events · a design token doesn't cover a case · `mvp.md` contradicts `AGENTS.md`
