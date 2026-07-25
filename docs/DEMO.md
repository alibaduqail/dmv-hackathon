# DEMO.md — the three minutes everything serves

Acceptance criteria for the repo. If a change does not improve a beat below or protect the fallback, it is out of scope.

Use a heating pad, reusable hand warmer, or warm mug. No exposed burner and no invitation for a judge to touch a heated object.

| Time | Beat | Depends on |
|---|---|---|
| 0:00–0:25 | Hold up the ordinary-looking object. “Residual heat has no reliable sound. Finding it by contact means finding it too late.” | object, pitch |
| 0:25–0:45 | Open `#scan`. “Ember is a handheld thermal companion for blind and low-vision people.” Source status is visible and announced. | accessible shell |
| 0:45–1:15 | Start the PureThermal source and point it toward the object. The thermal frame appears. | native bridge |
| 1:15–1:50 | Directional assessment appears as text + symbol + color and is spoken once: “Higher heat observed in the upper-right area. Keep your hand away and verify another way.” | deterministic analysis, speech |
| 1:50–2:15 | Reposition the camera. The direction updates without repeating stale speech. “The language model does not decide this. Deterministic radiometric rules do.” | persistence, formatter |
| 2:15–2:35 | Stop the source. Show that frames disappear from current state and nothing was saved in `#history`. | lifecycle, privacy |
| 2:35–3:00 | “RGB can tell you what an object looks like. Ember tells you where higher heat is—without making contact.” Land on the accessible assessment panel. | — |

The closing comparison is product positioning, not a guarantee of temperature accuracy or touch safety.

---

## Foundation rehearsal

Before the native bridge exists, rehearse beats 0:00–0:45 and then start the six-frame replay.

Say:

> “This is our offline interface fixture. It is simulated, not camera data, and it does not produce a safety assessment.”

The viewport must display **“Demo replay — not live”** for the entire sequence. Demonstrate start, pause, resume, restart, and stop. Do not narrate PNG colors as temperatures.

---

## Hardware fallback

If live capture fails on stage:

1. Say, “The device source is unavailable, so I’m switching to our labelled offline replay.”
2. Start replay.
3. Keep the provenance label on screen.
4. Demonstrate interface lifecycle and accessibility.
5. Describe—not simulate—the deterministic assessment phase.

Never hide the source switch, reuse a stale live assessment, or call replay a scan.

---

## Submission package — 17:30 to 18:30

Criteria 01–04 are judged on what gets uploaded, unnarrated.

**90-second captioned recording.** Keep source provenance visible. If the recording uses replay, the captions also say it is simulated.

**README, first line is track fit:**

> Ember widens independent access to everyday spaces by giving blind and low-vision people a non-contact way to locate higher heat before reaching toward it.

Then: problem, target user, one architecture diagram, accessible output, privacy boundary, and a plain table of what is live versus simulated.

---

## The 60-second pitch

> A hot pan and a cold pan can make the same sound. For someone who is blind or has low vision, checking by contact can mean finding the danger too late.
>
> Ember is a handheld thermal companion. Point it toward a counter, stove, mug, heater, or charging device. It locates higher heat, tells you where it is on screen, and speaks the same warning aloud.
>
> The important part is what the AI does not do. A deterministic rules engine analyzes the radiometric frame. Language only explains that structured result. Ember never claims something is safe to touch, and it never needs to upload the thermal image.
>
> Today we are using a Lepton 3.5 thermal camera through PureThermal USB. If the hardware drops, the same interface has a clearly labelled offline replay—because an accessibility tool needs a fallback people can trust.
>
> Ember gives people a thermal sense before contact.

Land on the last line and stop.

---

## Questions to answer

- **“Can it guarantee I will not be burned?”** No. Ember reports higher heat and direction; it cannot account for every material, reflection, distance, exposure, or person.
- **“Does AI decide what is dangerous?”** No. Deterministic code creates the assessment. Generated language may only explain it.
- **“Are you storing video?”** No. Frames are local and ephemeral in the MVP. `#history` is intentionally empty.
- **“Is the replay real camera output?”** No. It is a simulated interface fixture labelled on screen at all times.
- **“Why thermal instead of RGB?”** The task is locating thermal concentration, not identifying visible objects.
- **“Why no smart plug?”** The MVP warns the person; it does not autonomously control the physical environment.
