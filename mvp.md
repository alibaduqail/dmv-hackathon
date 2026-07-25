# Tally — MVP Spec v3

**Supersedes all prior specs.** Track 02, Health Tech & Accessibility. **Submit by 7:00 PM.**

**One line:** Tally turns a therapy session into clinician-confirmed data that keeps a child's care authorized.

**Niche:** Pediatric teletherapy for speech sound disorders, in 3–8 clinician private practices that bill insurance.

---

## 0. What Tally is

During a session, a speech therapist is doing two jobs at once — treating the child, and recording data on a paper tally sheet. Correct, incorrect, how much help the kid needed. Afterward they write the clinical note from memory.

Tally extracts the clinical data points from the session, shows them to the clinician as cards to approve, edit, or reject in under a minute, and generates four documents from the confirmed data.

**Why it matters:** insurers authorize therapy in blocks of visits and require documented progress to approve the next block. Thin data means denial. Denial means an eight-year-old stops receiving care. The record is what keeps the kid in therapy.

**The evidence thesis:** a therapy session generates evidence. Some is what the clinician said and heard. Some is physical. Both need a human to confirm them before they count. Tally is the record that holds confirmed evidence of any kind — which is why the thermal camera is part of the product and not a side project.

---

## 1. Non-negotiables

**1. Feature freeze is 5:30 PM, not 7:00.** The last ninety minutes are README, recording, and the submission form. Criterion 05 is live-round only — everything before that is judged on what you upload, unnarrated.

**2. The demo opens on the record, not the upload.** Ambient scribes have no equivalent screen. Cheapest possible separation from "copy" on criterion 02.

**3. Seed six weeks before any UI.** The payload is history that today's session lands into. Fixtures first, frozen at 11:00.

**4. No audio, no ASR.** Pipeline starts at a hand-written transcript fixture.

**5. Thermal frames are pre-captured.** No live hardware on stage, ever. Two PNGs committed as fixtures.

**6. We produce a data structure, not a note.** Scribes output prose. Prose can't be trended for a payer. Every clinician-facing surface should make this visible.

---

## 2. Clinical model

### Cue hierarchy — the detail that proves you talked to an SLP

Clinicians track how much support a child needs, not just accuracy. Less support is progress, even before accuracy moves.

```
independent  <  verbal_cue  <  visual_cue  <  tactile_cue  <  model
   (best)                                                  (most support)
```

### Trials

Every production attempt is scored `correct / total`. Percent accuracy across trials is the number a payer reads.

### The arc — Maya, 8. Target: /r/ initial position.

| # | Date | Record shows |
|---|---|---|
| 1 | Jun 13 | Baseline probe. 4/20 (20%). `tactile_cue` |
| 2 | Jun 20 | 5/20 (25%). `tactile_cue`. /r/ final emerging, 11/20 |
| 3 | Jun 27 | 6/20 (30%). `visual_cue` + `tactile_cue` |
| 4 | Jul 4 | 6/20 (30%). Max cueing. **`QUESTION_UNRESOLVED` — no independent production** |
| 5 | Jul 11 | 7/20 (35%). Unresolved (2) |
| 6 | Jul 18 | 6/20 (30%). Unresolved (3). Home program assigned, 2 of 3 logged |
| **7** | **Jul 25** | **`verbal_cue` → INDEPENDENT_PRODUCTION. 14/20 (70%)** |

`/r/ initial` is the streak. Three sessions of no independent production, closing today.

Clinically realistic: /r/ typically isn't mastered until 7–8, so an 8-year-old in therapy for initial /r/ is textbook, and a plateau at 30% is an ordinary clinical picture.

---

## 3. The thermal module

### What it screens for

Some children have **velopharyngeal insufficiency** — the soft palate doesn't seal during pressure consonants, so air leaks out the nose on /s/, /p/, /b/. It's the core speech issue in cleft palate and it is routinely mistaken for an articulation error, which means years of the wrong therapy.

The gold standard is nasometry. That equipment costs thousands and lives at specialty craniofacial centers. A community SLP can't test for it.

Warm exhaled air out the nostrils is what a thermal camera sees.

### The paired-stimulus test

The whole thing rests on one comparison:

| Stimulus | Expected | Why |
|---|---|---|
| Sustained **/m/** | Nostrils warm | Nasal consonant — airflow *should* go out the nose |
| Sustained **/sssss/** | Nostrils cold | Pressure consonant — nose should be sealed |

If /s/ blooms warm too, that's the leak. Two frames side by side, and anyone in the room understands it instantly with no clinical background.

### Why sustained and not repeated

Many consumer thermal cameras run at **9 Hz** — an export-control threshold, not a hardware limit. Too slow for rapid syllable repetition, fine for held productions. Check the camera's framerate, but design for sustained either way.

### How it connects — this is the point

A thermal frame on its own is a picture. Pictures don't get anyone a referral. In Tally:

```
thermal frame → clinician confirms → SCREENING_FLAG event
    → SOAP note objective section
    → authorization summary referral recommendation
```

The camera produces the finding. Tally is what makes the finding *count* — billable documentation and payer evidence.

Architecturally it's one field on the event (`evidence_type`) plus one small table. Having two evidence types is what proves the schema is a schema and not a transcript parser.

### Framing — say screening, not measurement

You are not replacing nasometry and a judge with clinical background will call it if you claim otherwise. The honest pitch is stronger:

> "This doesn't diagnose. It tells a community SLP this kid needs a craniofacial referral — when the nearest nasometer is three hours away."

### Gates

- **3:00 PM checkpoint.** If the review UI isn't done and the record view isn't underway, the camera stays in the bag and you never mention it.
- **Build window 5:00–5:30 only.** Standalone panel, its own route, not wired into extraction, nothing it can break.
- **Hard abort 5:30.** No exceptions.
- Capture the frames at lunch, not at 5.

---

## 4. Stack

Vite + React + TS, Tailwind, Supabase (tables only — no auth, no RLS), one Vercel function at `api/extract.ts`, Anthropic API for extraction.

Hardcoded: `CURRENT_CLINICIAN_ID`, `CURRENT_CLIENT_ID`. No login screen.

`ANTHROPIC_API_KEY` server-side only.

---

## 5. The four artifacts

Generated from confirmed events only. Four distinct voices — if they read the same, the best moment collapses.

| Kind | Audience | Voice |
|---|---|---|
| `soap_note` | Chart / billing | Clinical shorthand, S/O/A/P headers. Objective carries trials, cue levels, and any thermal screening result |
| `home_program` | Maya's caregiver | Warm, concrete, no jargon. **English + Spanish toggle** |
| `next_session_plan` | The clinician | Telegraphic. Target, cue level to start at, what to probe |
| `auth_summary` | **The payer** | Trend across 7 sessions, clinical justification for continued care |

**`auth_summary` is the money shot.** No ambient scribe produces it. On stage: *"This is what gets Maya her next twelve visits approved."*

The Spanish toggle is the accessibility half of the track prompt and costs one LLM call.

---

## 6. Schedule — backwards from 7:00 PM

| | | Checkpoint |
|---|---|---|
| 9:20–11:00 | Schema + six sessions of fixtures + transcript | **Fixtures frozen 11:00** |
| 11:00–12:30 | Extraction pipeline, prompt, cached fallback | Live call returns 6–8 valid events |
| 12:30–3:00 | **Review UI** — cards, approve/edit/reject, scroll-sync, streak banner | Review a session end to end |
| 3:00–4:00 | Record view — accuracy trend, cue trend, streak | **3:00 thermal go/no-go** |
| 4:00–5:00 | Four artifacts + **fallback test** | All four render, Spanish included |
| 5:00–5:30 | Thermal panel *(only if 3:00 gate passed)* — else buffer | |
| **5:30** | **HARD FREEZE** | |
| 5:30–6:30 | README, 90-second captioned recording, submission form | |
| 6:30–7:00 | Buffer | |

**Cut order if behind at 3:00:** thermal → record view detail → `next_session_plan` → Spanish toggle.

**Never cut** `auth_summary` or `home_program` — those carry criteria 01 and 04.

**Already cut:** mock EHR integration, cross-vertical demo, settings, auth, tests, live thermal capture.

---

## 7. Demo — 3 minutes

| Time | Beat |
|---|---|
| 0:00–0:25 | Open on **Maya's record**. "Eight years old, six weeks of therapy on her R sound. Stuck at 30%, needing maximum support. The only reason we know that is her therapist wrote it down by hand every session." |
| 0:25–1:05 | Today's session lands. Extraction runs live. Seven proposed cards, soft grey, one at 0.61. |
| 1:05–1:40 | **The moment.** Approve, approve, edit one, reject one, approve. Cards turn red. Streak banner flips to *Resolved — first independent production*. |
| 1:40–2:15 | Four artifacts. Land on `auth_summary`: "This is what gets Maya her next twelve visits approved." |
| 2:15–2:40 | Thermal panel. /m/ warm, /s/ warm — that's the leak. Clinician confirms; it lands in the SOAP note and the referral line. "Same record. Different evidence." |
| 2:40–3:00 | "Tally turns what a therapist observes into the documentation that keeps a kid in care." |

If thermal was cut, 2:15–2:40 becomes the record view showing the six-week trend closing, and the closing line is unchanged.

---

## 8. Anti-scribe positioning — lead with this

A judge with health tech awareness pattern-matches you to an ambient scribe (Abridge, Freed, Heidi, DAX) in ten seconds. Get ahead of it:

1. **We produce a data structure, not a note.** Prose can't be trended for a payer.
2. **The clinician confirms atoms, not paragraphs.** Every data point carries its own evidence span and its own human signature.
3. **No audio retained.** We start at transcript, keep only confirmed events. With minors, that isn't a footnote.
4. **It ingests physical evidence.** A thermal frame goes through the same confirm-and-record loop as a spoken observation. No scribe has a schema for that.
5. **It looks forward.** Scribes document the session that ended. The next-session plan writes the one that hasn't happened.

---

## 9. Questions to have answers for

- *"Isn't this an ambient scribe?"* — The five points above.
- *"Why won't EHR vendors build it?"* — They'll build notes. The schema working across articulation, fluency, OT, and ABA plus eval data on which suggestions clinicians accept is the part that compounds.
- *"Is the thermal screening validated?"* — No, and we don't claim it is. It's a screening prompt for referral, not a measurement. Nasometry remains the standard.
- *"HIPAA?"* — Not solved in a hackathon build, and don't claim it is. No audio retention, BAA-eligible infrastructure, PHI isolated to one table. Honest beats impressive.
- *"Who pays?"* — The practice owner. 3–8 clinicians, short cycle, no procurement.

> **Do not put a sourced-sounding statistic on screen.** Get the documentation-time number from interviews in the room today and quote it as what you heard. A judge who works in health will catch an invented figure and you lose criteria 02 and 04 at once.
