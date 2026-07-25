# DEMO.md — the three minutes everything serves

Acceptance criteria for the repo. If a change does not improve a beat below or protect the fallback, it is out of scope.

Use a heating pad, reusable hand warmer, or warm mug. No exposed burner and no invitation for a judge to touch a heated object.

The radiometric assessment sequence is blocked by Phase 1A and must not be used for this hackathon build. At 18:03 the user explicitly reopened post-freeze scope for Phase 1E, **“Experimental palette brightness cue — not temperature or safety detection”**. Its deterministic synthetic verifier may pass while attached-device behavior remains unverified. Use the live sequence below only after the intended input plays and the cue enters/exits twice in the actual demo browser; otherwise run the foundation/replay sequence. Never narrate implemented-but-unverified hardware behavior as working.

| Time | Beat | Depends on |
|---|---|---|
| 0:00–0:25 | Hold up the ordinary-looking object. “Residual heat has no reliable sound. Finding it by contact means finding it too late.” | object, pitch |
| 0:25–0:45 | Open `#scan`. Explain that Ember is the accessible interface foundation for a handheld thermal companion. Source status is visible and announced. | accessible shell |
| 0:45–1:05 | Explicitly select Live preview, activate **Authorize cameras**, choose the intended PureThermal-labelled input, then Start. Show its active track label and **“Live thermal preview — non-radiometric”**. | actual-browser live gate |
| 1:05–1:25 | Point to **“Display-only colorized video. No temperature or safety assessment.”**, **“No current assessment”**, and the exact experimental cue label. Say that near-white is a display color, not a temperature. | source truth |
| 1:25–1:50 | Enable cue sound. In a staged non-personal scene, move a near-white palette area into view. Show the visible `!` + text and additive tone, then move it out until the cue clears. State that people and anything else rendered near white can activate it; there is no YOLO/person filter. | Phase 1E actual-browser gate |
| 1:50–2:10 | Stop the preview. Show that video/cue clear, tone stops, and the camera indicator closes. | lifecycle, privacy |
| 2:10–2:35 | Explicitly select/start the replay. Demonstrate pause/resume with **“Demo replay — not live”** visible; confirm Replay never activates the cue. | replay |
| 2:35–2:50 | Open `#history`. Show that no video, pixels, cue history, frames, or incidents are stored. | privacy |
| 2:50–3:00 | “This experiment proves a local accessible display cue, not heat detection. Calibrated directional guidance remains the next hardware milestone.” | truthful close |

Because Phase 1D’s hardware gate remains blocked, skip every live/cue beat unless the actual demo browser now supplies the required evidence. The code and synthetic palette verifier do not substitute for that run. The close is a limitation statement, not a guarantee of temperature accuracy or touch safety.

---

## Foundation rehearsal

Before the native bridge exists, rehearse beats 0:00–0:45 and then start the six-frame replay.

Say:

> “This is our self-contained interface fixture. It is simulated, not camera data, and it does not produce a safety assessment.”

The viewport must display **“Demo replay — not live”** for the entire sequence. Demonstrate start, pause, resume, restart, and stop. Do not narrate PNG colors as temperatures.

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

**90-second captioned recording.** Keep source provenance visible. If the recording uses replay, the captions also say it is simulated. If it uses Phase 1E, keep people out of the staged camera frame and keep the exact experimental label visible; captions must say **“Near-white display cue; not temperature, hot-surface, person, or safety detection.”**

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

## The 60-second experimental-cue pitch — only after actual-browser evidence passes

> A hot pan and a cold pan can make the same sound. For someone who is blind or has low vision, checking by contact can mean finding the danger too late.
>
> Ember is our concept for a handheld thermal companion that would locate higher heat and express the result through visible, non-color guidance and matching speech.
>
> Today, the attached Lepton and PureThermal board provide a local colorized UVC preview. The source is live, but it is explicitly labelled “Live thermal preview — non-radiometric”. We do not have calibrated per-pixel temperatures through this path.
>
> For this staged prototype, deterministic code looks only for enough near-white display pixels across several samples. It shows a visible exclamation cue and can play an optional tone. The interface calls it “Experimental palette brightness cue — not temperature or safety detection”.
>
> Near white does not mean hot. Camera gain can make a person or any other region near white, and Ember does not identify or exclude them. That is why the interface still says “No current assessment”. It gives no temperature, direction, severity, guidance, or all-clear.
>
> The sampler is local and ephemeral. Stopping the source clears the cue, stops sound, closes every camera track, and stores no video, pixel sample, or incident.
>
> The same interface includes a clearly labelled simulated replay for accessible lifecycle testing. Our next hardware milestone is a capture path with validated radiometry; only then can deterministic guidance be enabled.
>
> Ember’s strongest design decision is making the limitation impossible to miss.

Land on the exact experimental label, live non-radiometric label, and **“No current assessment”**.

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
- **“Does AI decide what is dangerous?”** No. The current build makes no danger decision. Phase 1E uses fixed RGB/coverage/hysteresis rules only for a display-brightness cue. A future assessment must come from deterministic rules over validated radiometry; generated language could only explain it.
- **“Are you storing video?”** No. The implemented preview keeps any stream local, exposes no recording path, and stops all tracks on cleanup. Actual attached-device playback remains unverified. A reviewed submission recording may externally capture only a staged non-personal demo. The replay PNGs are committed simulated fixtures, and `#history` stores nothing.
- **“Is the replay real camera output?”** No. It is a simulated interface fixture labelled on screen at all times.
- **“Is the preview RGB?”** It may be carried as RGB-formatted display video, but the Lepton is a thermal sensor. Those colors are not calibrated temperature values.
- **“Does the preview locate higher heat?”** No. Phase 1E can cue when the colorized display contains enough near-white pixels, but that is not temperature or heat detection. Hotspot, direction, severity, guidance, safety warning, and assessment speech remain disabled.
- **“Does it ignore people?”** No. It has no YOLO model or person detector. People and any other region rendered near white follow the same rule. Keep people out of the staged recording for privacy.
- **“Why no smart plug?”** The current build makes no thermal or safety warning and never controls the physical environment. Its experimental tone reinforces only the labelled display-brightness cue. A future radiometric product would warn the person rather than actuate an appliance.
