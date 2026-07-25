# DEMO.md — the three minutes everything serves

Acceptance criteria for the entire repo. If a change doesn't improve a beat below, it's out of scope.

| Time | Beat | Depends on |
|---|---|---|
| 0:00–0:25 | Open on **Maya's record**. "Eight years old. Six weeks on her R sound. Stuck at 30%, needing maximum support. The only reason we know that is her therapist wrote it down by hand every session." | fixtures, record view |
| 0:25–1:05 | Today's session lands. Extraction runs live. Seven proposed cards, soft grey, one at 0.61. | api/extract, review view |
| 1:05–1:40 | **The moment.** Approve, approve, edit one, reject one, approve. Cards turn red. Banner flips to *Resolved — first independent production*. | derive.ts, approve interaction |
| 1:40–2:15 | Four artifacts. Land on `auth_summary`: "This is what gets Maya her next twelve visits approved." | outputs view |
| 2:15–2:40 | Thermal. /m/ warm, /s/ warm — that's the leak. Clinician confirms; it lands in the SOAP note and the referral line. "Same record. Different evidence." | thermal panel *(gated)* |
| 2:40–3:00 | "Tally turns what a therapist observes into the documentation that keeps a kid in care." | — |

**If thermal was cut at 3:00 PM:** 2:15–2:40 becomes the record view showing the six-week trend closing. Closing line unchanged.

## Cut order if behind at 3:00

thermal → record view detail → `next_session_plan` → Spanish toggle.
**Never cut** `auth_summary` or `home_program` — criteria 01 and 04.

## Submission package — 5:30 to 6:30

Criteria 01–04 are judged on what you upload, unnarrated. Only 05 is live.

**90-second captioned screen recording.** Same beats, no voiceover. Record at 5:30 while the build is frozen and you still have energy.

**README, first line is track fit:**
> Tally lowers the cost of care and closes an accessibility gap for pediatric speech therapy: it removes documentation time from every session, and it produces the progress evidence that keeps a child's therapy authorized.

Then: problem, four artifacts as screenshots, the anti-scribe difference, **what's real vs. mocked stated plainly**, interview quotes.

## The 60-second pitch

> Maya is eight. She's been in speech therapy six weeks, working on her R sound.
>
> Her therapist is doing two jobs at once — treating Maya, and making tally marks on paper to prove the therapy is working. Because insurance approves therapy twelve visits at a time, and if the progress data is thin, Maya gets denied.
>
> Tally takes the session and pulls out the clinical data. How many trials. How much help she needed. The moment she said it on her own for the first time in six weeks. The therapist confirms it in under a minute — and we write the clinical note, the home practice plan for her mom in Spanish, and the evidence packet that gets her next twelve visits approved.
>
> And it isn't limited to what was said. With a thermal camera, we can see air escaping a child's nose on sounds where it shouldn't — the sign of a palate problem community clinics can't test for, because the equipment costs thousands of dollars.
>
> Same record. Different evidence.
>
> Tally turns what a therapist observes into the documentation that keeps a kid in care.

Land on the last line and stop. No "thank you."

## Questions to have answers for

- *"Isn't this an ambient scribe?"* — We produce a data structure, not prose. The clinician confirms atoms, not paragraphs. No audio retained. It ingests physical evidence. It looks forward.
- *"Is the thermal validated?"* — No, and we don't claim it. Screening prompt for referral, not measurement. Nasometry remains the standard.
- *"HIPAA?"* — Not solved in a hackathon build. No audio retention, BAA-eligible infra, PHI in one table. Honest beats impressive.
- *"Who pays?"* — Practice owner, 3–8 clinicians. Short cycle, no procurement.

## The number

Get documentation time from interviews in the room today. **Do not invent one.** "We asked three people today and heard 6–10 minutes per session" beats a citation you can't defend.
