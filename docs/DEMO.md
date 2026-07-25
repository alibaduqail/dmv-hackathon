# DEMO.md — the three minutes everything serves

Acceptance criteria for the repo. If a change does not improve a beat below or protect the fallback, it is out of scope.

Use a heating pad, reusable hand warmer, or warm mug. No exposed burner and no invitation for a judge to touch a heated object.

The radiometric assessment sequence is blocked by Phase 1A and must not be used for this hackathon build. Optional speech may announce source status and provenance only; it never speaks heat guidance. Phase 1D’s adapter/UI are implemented, but its attached-device gate is blocked after the intended input did not play by the 16:15 cutoff. Run the foundation/replay sequence for the submission. The display-only sequence below becomes available only if the team explicitly reopens the gate, completes two actual-browser playback/cleanup runs before the 17:30 feature freeze, and records the new evidence and decision. Never narrate implemented-but-unverified hardware behavior as working.

| Time | Beat | Depends on |
|---|---|---|
| 0:00–0:25 | Hold up the ordinary-looking object. “Residual heat has no reliable sound. Finding it by contact means finding it too late.” | object, pitch |
| 0:25–0:45 | Open `#scan`, enable optional source speech, and explain that it repeats only the same visible status/provenance. Demonstrate Mute and Repeat without changing the visual state. | accessible shell, source speech |
| 0:45–1:10 | Explicitly select Live preview, activate **Authorize cameras**, choose the intended PureThermal-labelled input, then Start. Show its active track label and **“Live thermal preview — non-radiometric”**. | Phase 1D only |
| 1:10–1:35 | Point to **“Display-only colorized video. No temperature or safety assessment.”** and **“No current assessment”**. Say that Ember does not convert palette colors into warnings. | source truth |
| 1:35–1:55 | Stop the preview. Show that the image clears and the camera indicator closes. | lifecycle, privacy |
| 1:55–2:25 | Explicitly select/start the replay. Demonstrate pause/resume with **“Demo replay — not live”** visible. | replay |
| 2:25–2:45 | Open `#history`. Show that no video, frames, or incidents are stored. | privacy |
| 2:45–3:00 | If the gate passed: “The live preview proves local display transport; the labelled replay proves the accessible lifecycle. Calibrated directional guidance remains the next hardware milestone.” | Phase 1D only |

Because Phase 1D’s hardware gate is blocked, skip its three beats and spend that time on keyboard controls, source truth, cleanup, and the product concept. Use those beats only if the gate is explicitly reopened and passes before freeze. The close is a limitation statement, not a guarantee of temperature accuracy or touch safety.

---

## Foundation rehearsal

Before the native bridge exists, rehearse beats 0:00–0:45 and then start the six-frame replay.

Say:

> “This is our self-contained interface fixture. It is simulated, not camera data, and it does not produce a safety assessment.”

The viewport must display **“Demo replay — not live”** for the entire sequence. Enable source speech once, demonstrate exact spoken provenance, Mute, Repeat, start, pause, resume, restart, and stop. Do not narrate PNG colors as temperatures or call source speech an assessment.

---

## Live-preview fallback

If browser preview is implemented but unavailable on stage:

1. Say, “The live preview is unavailable, so I’m switching to our labelled local replay.”
2. Start replay.
3. Keep the provenance label on screen.
4. Demonstrate interface lifecycle and accessibility.
5. Describe—not simulate—the future radiometric assessment phase.

Never hide the source switch, reuse a stale live assessment, or call replay a scan.

---

## Submission package — 17:30 to 18:30

Criteria 01–04 are judged on what gets uploaded, unnarrated.

**90-second captioned recording.** Keep source provenance visible. If the recording uses replay, the captions also say it is simulated.

**README, first line is track fit:**

> Ember is designed to widen independent access to everyday spaces by helping blind and low-vision people locate higher heat before reaching toward it.

Then: problem, target user, one architecture diagram, accessible output, privacy boundary, and a plain table of what is live versus simulated.

---

## Future radiometric pitch — not authorized for the current build

> A hot pan and a cold pan can make the same sound. For someone who is blind or has low vision, checking by contact can mean finding the danger too late.
>
> Ember is a handheld thermal companion. Point it toward a counter, stove, mug, heater, or charging device. It locates higher heat, tells you where it is on screen, and speaks the same warning aloud.
>
> The important part is what the AI does not do. A deterministic rules engine analyzes the radiometric frame. Language only explains that structured result. Ember never claims something is safe to touch, and it never needs to upload the thermal image.
>
> Today we are using a Lepton 3.5 thermal camera through PureThermal USB. If the hardware drops, the same interface has a clearly labelled local replay—because an accessibility tool needs a fallback people can trust.
>
> A calibrated Ember build would give people a thermal sense before contact.

This copy describes the product target. Do not use it as the current-build pitch unless a future calibrated Phase 1A, Phase 1B, Phase 1C, and Phase 2 all pass.

## The 60-second display-only pitch — only after Phase 1D is explicitly reopened and passes

> A hot pan and a cold pan can make the same sound. For someone who is blind or has low vision, checking by contact can mean finding the danger too late.
>
> Ember is our concept for a handheld thermal companion that would locate higher heat and express the result through visible, non-color guidance and matching speech.
>
> Today, the attached Lepton and PureThermal board are available as a local colorized UVC preview. The source is live, but it is explicitly labelled “Live thermal preview — non-radiometric”. We do not have calibrated per-pixel temperatures through this path.
>
> That is why the interface deliberately says “No current assessment”. We do not infer temperature, direction, or a warning from palette colors. Stopping the source closes every camera track, and no video or incident is stored.
>
> The same interface includes a clearly labelled simulated replay for accessible lifecycle testing. Our next hardware milestone is a capture path with validated radiometry; only then can deterministic guidance be enabled.
>
> Ember’s strongest design decision is knowing what the sensor data can—and cannot—support.

Land on the live non-radiometric label and **“No current assessment”**.

## The 60-second replay-only pitch — when a live gate is blocked

> A hot pan and a cold pan can make the same sound. For someone who is blind or has low vision, checking by contact can mean finding the danger too late.
>
> Ember is our concept for a handheld thermal companion that would locate higher heat and express the result through visible, non-color guidance and matching speech.
>
> What you see today is the accessible application and source-lifecycle foundation. This six-frame sequence is simulated, clearly labelled “Demo replay — not live,” and it never creates a thermal assessment.
>
> The safety boundary is already locked: only deterministic rules over validated live radiometric data may classify heat. Ember will never infer temperature from a colored image or claim an object is safe to touch.
>
> Our Phase 1A probe found the PureThermal USB/UVC interfaces, but not a Y16 frame or calibrated temperature mapping. The radiometric warning path is blocked, and the display-only browser preview is also omitted from this demo unless its separate gate is explicitly reopened and passes before freeze.
>
> We chose a truthful fallback because accessibility starts with knowing what the system can and cannot perceive.

Land on the visible replay provenance and stop.

---

## Questions to answer

- **“Can it guarantee I will not be burned?”** No. The current build makes no heat assessment. A future calibrated build may report observed higher heat and direction, but it still cannot account for every material, reflection, distance, exposure, or person.
- **“Does AI decide what is dangerous?”** No. The current build makes no assessment. A future assessment must come from deterministic rules over validated radiometry; generated language could only explain it.
- **“Are you storing video?”** No. The implemented preview keeps any stream local, exposes no recording path, and stops all tracks on cleanup. Actual attached-device playback remains unverified. A reviewed submission recording may externally capture only a staged non-personal demo. The replay PNGs are committed simulated fixtures, and `#history` stores nothing.
- **“Is the replay real camera output?”** No. It is a simulated interface fixture labelled on screen at all times.
- **“Is the preview RGB?”** It may be carried as RGB-formatted display video, but the Lepton is a thermal sensor. Those colors are not calibrated temperature values.
- **“Does the preview locate higher heat?”** No. It is display-only. Temperature, hotspot, direction, warning, and assessment speech remain disabled. Optional speech reports source status only.
- **“Why no smart plug?”** The current build makes no warning and never controls the physical environment. A future radiometric product would warn the person rather than actuate an appliance.
