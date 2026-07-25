# AGENTS.md

Source of truth for every coding agent on this repo — Claude Code, Codex, ChatGPT. `CLAUDE.md` points here. Read completely before your first edit.

**Project:** Tally — turns a therapy session into clinician-confirmed data that keeps a child's care authorized.
**Track:** 02, Health Tech & Accessibility. **Submit 7:00 PM.** Product spec: `mvp.md`.

**Then read `docs/ARCHITECTURE.md`** — the file tree, the exported signatures every lane depends on, the build order, and the landmines. This file says how we work; that one says where things go.

---

## The one thing to understand

**Feature freeze is 5:30 PM.** The last ninety minutes are the submission package. Judging criteria 01–04 are scored on what gets uploaded, unnarrated — only criterion 05 is live. A perfect build that isn't packaged scores nothing.

The only measure of a change is whether it improves a beat in `docs/DEMO.md`. If you can't name the beat, stop and ask.

---

## Non-negotiables

1. **Seed fixtures before UI.** Six weeks of history is the demo's payload. Frozen at 11:00.
2. **No audio, no ASR.** Pipeline starts at a hand-written transcript fixture. Do not suggest Whisper.
3. **Thermal frames are pre-captured PNGs.** No camera code, no live capture, no device drivers. Ever.
4. **We produce a data structure, not a note.** If output reads like prose an ambient scribe would emit, it's wrong.
5. **Extraction output is validated, never trusted.** Parse, enum-check, drop on failure.
6. **`USE_CACHED_EXTRACTION=1` must run the full demo with the network unplugged.** Tested at 4:00, not 5:25.
7. **The clinician is the authority.** Nothing in this product diagnoses, rules, or recommends care. It proposes evidence for a human to confirm.

---

## Lane ownership

One owner per path. Need to change something outside your lane, say so in chat first.

| Path | Owner |
|---|---|
| `src/fixtures/**` | Build lead — **frozen 11:00** |
| `api/**`, `src/lib/extract*` | Build lead |
| `src/features/review/**` | Build lead — the product, highest-value surface |
| `src/features/outputs/**` | Second dev |
| `src/features/record/**` | Second dev |
| `src/features/thermal/**` | Second dev — gated, see below |
| `src/styles/tokens.css` | Build lead — do not add colors |

Two people on the repo: separate branches, merge at 12:30 and 4:00 only. Never merge after 5:00.

---

## The 3:00 PM gate

Thermal is the only optional feature. At 3:00 PM, check: is the review UI done end-to-end and the record view underway?

- **Yes** → thermal gets 5:00–5:30, standalone route, wired to nothing.
- **No** → thermal is cut. Delete the branch, remove it from the demo script, never mention it.

Do not negotiate this at 4:30. It is a checkpoint, not a preference.

---

## Working agreement

- **Smallest change that works.** No abstractions before the third repetition. No wrapper components. No new dependency without asking.
- **One task per session.** `/clear` between tasks — session budget is the scarce resource, not time.
- **Don't reorganize.** No renames, no restructures, no drive-by cleanups.
- **No tests.** Manual verification against `docs/DEMO.md` is the test.
- **Commit after every working increment.** A broken uncommitted repo at 5:15 is how teams lose.
- **Read `docs/REFERENCES.md` before building anything that looks solved.** Steal the shape; don't install the library.

## When you finish a task

Append one line to `docs/DECISIONS.md`. It's the only handoff mechanism — nobody has time for a standup.

---

## Design

Concept is **marginalia** — the interface is a page a clinician marks up. The rule that carries the product:

> **Red means a human touched it.**

AI proposals render soft grey, low-contrast, hairline-dashed. On approve, the card snaps to full ink and grows a red rule down its left edge. Downstream artifacts only render red-marked content. That's the thesis made visible without a word of explanation.

Tokens in `src/styles/tokens.css`. **Use only what's there.** No gradients, no shadows, no border-radius above 2px, no icon library. The approve interaction is the only animation.

Type: Instrument Serif (display), Karla (body), JetBrains Mono (timestamps, trial counts, confidence, temperatures).

Thermal frames render at their native palette. Do not recolor them to match the design system — a false-color thermal image is a clinical artifact, and prettifying it undermines the claim.

---

## Vocabulary

Exact terms in code, UI copy, and commits.

| Term | Means | Don't say |
|---|---|---|
| client | the child receiving therapy | patient, student, user |
| clinician | the SLP | teacher, therapist, provider |
| caregiver | parent or guardian | parent, family |
| trial | one scored production attempt | attempt, rep |
| cue level | how much support was needed | prompt, hint, help |
| target | the sound and position, e.g. `/r/ initial` | goal, skill |
| learning event → **clinical event** | one extracted moment | insight, item, finding |
| proposed / approved / edited / rejected | the four event states | pending, confirmed |
| evidence | the transcript span or thermal frame | quote, excerpt, image |
| artifact | a generated output document | summary, report |
| screening | what the thermal module does | test, measurement, diagnosis |

**Never write "diagnose," "detect," or "measure" about the thermal module.** It screens and prompts a referral.

---

## Out of scope

Auth. Billing. Audio capture. ASR. Live thermal capture. Camera drivers. Real-time streaming. EHR/FHIR integration. Mobile app. Settings. Dark mode. Landing page. Multi-tenancy. Tests. CI.

If asked to build something on this list, refuse and point here.
