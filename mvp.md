# Ember — MVP Spec v3

**Supersedes all prior specs.** Track 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.**

**Product target in one line:** Ember would give blind and low-vision people a non-contact way to locate higher-heat areas before reaching toward them.

**Hackathon MVP form:** a handheld Lepton 3.5 thermal camera on a PureThermal USB board, paired with a local web interface. The current build has an accessible labelled replay, an implemented display-only colorized UVC path, and a user-authorized post-freeze experimental near-white palette cue for the current live preview. The cue is labelled **“Experimental palette brightness cue — not temperature or safety detection”** and may add a user-enabled non-speech tone. Attached-device behavior remains unverified until it passes in the actual demo browser. Calibrated heat guidance and assessment speech remain blocked by the Phase 1A hardware result. Atomic acceptance and dependency gates live in `docs/REQUIREMENTS.md`; mutable phase timing lives in `docs/PLAN.md`.

---

## 0. What Ember is

Residual heat is difficult to verify without sight or contact. A burner, pan, mug, space heater, or charging device may look ordinary and provide no useful cue until a hand is already close.

Ember’s product target turns calibrated thermal frames into directional guidance:

```
PureThermal frame
  → deterministic hotspot analysis
  → observable heat assessment
  → text + symbol + color
  → the same guidance spoken aloud
```

The model is deliberately narrow. Ember does not identify objects, diagnose injury, or guarantee touch safety. A future radiometric build may report where higher heat was observed and prompt the person to keep distance or verify another way.

The current hackathon capture path does not supply calibrated radiometry. Its live branch is still non-radiometric. Phase 1E adds one separate display heuristic:

```text
PureThermal UVC MediaStream
  → local video viewport
  → persistent non-radiometric provenance
  → “No current assessment”
  → ephemeral 40 × 30 display sample
  → deterministic near-white coverage + hysteresis
  → visible ! + fixed cue text
  → optional user-enabled non-speech tone

  ✕ no temperature
  ✕ no hotspot or direction
  ✕ no severity, guidance, or safety warning
  ✕ no person/object detection or exclusion
  ✕ no assessment speech
```

### Why thermal

A visible-light camera answers *what does this look like?* Calibrated thermal data can help locate where heat is concentrated. The attached Lepton remains a thermal sensor. If Phase 1D is explicitly reopened and passes, its webcam-compatible path will supply colorized display pixels rather than data Ember can treat as per-pixel temperature. RGB-formatted video is not the same thing as an RGB scene sensor, and neither is radiometry.

### Who it serves

Primary user: a blind or low-vision person checking a nearby surface in a kitchen, workshop, bathroom, or charging area.

The intended future radiometric interaction is deliberately simple:

1. Point the handheld camera toward the area.
2. Start the source.
3. Hear and read source status.
4. Receive one directional warning when deterministic rules find higher heat.
5. Stop or reposition.

No account, setup wizard, object labelling, smart-home integration, or remote monitoring.

Phase 1E’s optional tone makes its experimental display-brightness cue perceivable without sight, but it still does not deliver step 4: it has no calibrated heat, direction, severity, or guidance result. That limitation must be explicit in the pitch.

---

## 1. The claim boundary

Ember observes surface radiation under imperfect conditions. Material emissivity, reflections, distance, angle, recent calibration, exposure time, and individual sensitivity all matter.

**The product must never say an object is safe to touch.**

| Ember may say | Ember must not say |
|---|---|
| “Higher heat observed in the upper-right area.” | “The pan is safe.” |
| “Keep your hand away and verify another way.” | “There is no burn risk.” |
| “No current assessment” | “Everything is clear.” |
| “The source is paused.” | “The camera proved it is cold.” |

Any future thermal classification must be deterministic code over validated radiometric values. An LLM may later turn the resulting structured assessment into natural language, but it cannot select thresholds or alter severity. Colorized replay or UVC pixels are not valid thermal-classification input. Phase 1E’s fixed RGB and coverage values classify display brightness only and may never be presented as heat or safety evidence.

---

## 2. What ships now

This repository reset builds the seam before the hardware path.

### Included now

- `#scan` default route.
- High-contrast thermal viewport.
- Six ordered, simulated 160 × 120 PNG frames.
- Visible provenance: **“Demo replay — not live”**
- Start, pause, resume, restart, and stop controls.
- Text source status.
- `ThermalSource` interface independent of transport.
- `ReplayThermalSource` with deterministic timing and cleanup.
- Explicit Replay/Live source choice with Replay selected on every route session.
- `UvcPreviewSource` with temporary authorization cleanup, opaque operator choices, private exact-device matching, playback gating, pause/reacquire, structured failure recovery, and complete media lifecycle cleanup.
- A replay-frame/live-`MediaStream` viewport union; a live stream never fabricates thermal metadata.
- Persistent live truth: **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”**.
- Phase 1E’s exact experimental label, deterministic near-white coverage/hysteresis, visible `!` + complete text, and user-enabled additive tone.
- A live-only 40 × 30 ephemeral sampler that resets and releases its timer, canvas, detector, and audio on inactive lifecycle transitions.
- Explicit truth that people and every other near-white display region can activate the same cue; no YOLO or object/person branch.
- `#history` with an honest empty state.
- Build, lint, replay verification, and dependency-injected preview verification commands.
- A privacy-safe Phase 1A no-go report for the attached PureThermal UVC device.
- A privacy-safe Phase 1D browser attempt that records pending permission and no playback claim.

### Explicitly deferred

- Successful attached-device enumeration/playback evidence in the actual demo browser.
- PureThermal native radiometric bridge and calibrated live frames.
- Radiometric hotspot analysis.
- Severity thresholds.
- Assessment text-to-speech. Phase 1E’s fixed tone is non-speech and does not describe heat.
- LLM explanation.
- Alerts, notifications, or saved incidents.

The replay proves its source boundary and interface lifecycle. Preview fakes prove permission/currentness/resource behavior in code, and the palette verifier proves synthetic RGB boundaries and hysteresis. None proves attached-camera playback, temperature accuracy, heat detection, person exclusion, or safety performance.

---

## 3. The display-only implementation

### Display boundary

The replay and live-preview surfaces are truthfully different:

```text
ReplayThermalSource → ThermalFrame → <img>   → exact replay provenance
UvcPreviewSource    → MediaStream  → <video> → exact non-radiometric provenance
```

The live stream is not forced into `ThermalFrame`, because doing so would require invented temperature metadata. `UvcPreviewSource` owns permission, private identity, generation, tracks, and listeners; `usePreviewSession` owns source choice and the identity-guarded `<video>` attachment. Demo replay remains selected by default; Live preview requires explicit selection, authorization, operator choice, and Start.

The preview must keep these statements adjacent:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

### Phase 1E experimental palette cue

At 18:03 the user explicitly reopened scope after the planned 17:30 freeze for
one staged-demo interaction. Only the current playing live `<video>` is sampled;
Replay is never sampled. Every RGB channel must be at least `248`, the channel
spread must be at most `6`, and at least `1%` of the 40 × 30 sample must qualify.
Three consecutive qualifying samples enter the cue; two other samples exit it.

Those constants describe palette pixels, not a temperature. Auto gain and
palette behavior can make a person or any other region near white, and Ember
does not attempt to distinguish them. No YOLO model or person suppression is
included.

The cue always shows **“Experimental palette brightness cue — not temperature
or safety detection”**. Active state adds a visible `!` and fixed text. Sound
starts disabled; an explicit user gesture may enable a bounded non-speech tone.
The visible result remains complete if audio is muted or unavailable.

Pixels are consumed synchronously and never stored, uploaded, logged, returned
from the hook, or added to history. Pause, Stop, Restart, failure, source switch,
page hide, route change, and unmount clear the cue and release the sampler and
audio.

### Future radiometric bridge — blocked

A future hardware revision or capture path may reopen the native bridge. It must first reproduce calibrated Y16 data, exact encoding, orientation, and conversion evidence. Only then may it produce a display image separately from validated analysis data and enter a `PureThermalSource`.

That bridge is not part of the current hackathon implementation path. Vendor example software remains prior art, not a runtime dependency.

### Future assessment — blocked

A later radiometric analysis phase would:

1. Reject malformed or non-radiometric frames.
2. Normalize a valid radiometric grid.
3. Find connected higher-heat regions.
4. Require persistence across frames to reduce flicker.
5. Map the strongest region to plain spatial language.
6. Emit a structured `ThermalAssessment`.

Thresholds are configuration owned by deterministic code and must be validated with the actual device before the UI uses them. No threshold is invented from the PNG replay or a colorized UVC stream.

### Spoken interaction

Future speech repeats a validated structured assessment. It never outruns or replaces visible text. Phase 1E’s user-enabled sine tone contains no words and communicates only that its plainly labelled display-brightness cue is active; it is not Phase 2 assessment speech.

---

## 4. Interface

### `#scan` — default

- Product name and short purpose.
- Source badge with text status.
- Thermal viewport preserving the displayed source aspect ratio.
- Persistent provenance beside the viewport.
- Current replay frame metadata or browser-reported live display settings; never invented temperature metadata.
- Start, pause, resume, restart, and stop controls.
- Live region for source changes.
- When Live is selected, the exact experimental label, visible cue state, current near-white coverage, and an accessible Enable/Mute cue sound control.
- Future assessment panel beneath the viewport.

Every interactive target is at least 44 × 44 CSS pixels, keyboard operable, visibly focused, and named for assistive technology.

### `#history`

Foundation copy explains that Ember is not storing scans or incidents yet. It must not fabricate records to make the page look complete.

History becomes real only after a later, explicit privacy decision. Any future live streams, frames, and radiometric arrays remain ephemeral even if structured incident metadata is eventually stored. The committed replay PNGs are simulated fixtures, not user captures.

---

## 5. Demo object and safety

Use a heating pad, reusable hand warmer, or warm mug. Do not bring an exposed heating element or create a burn hazard for the pitch.

The current live demo, only after the intended input plays in the actual demo browser:

1. Explain the residual-heat accessibility problem and the intended radiometric product.
2. Show the exact PureThermal input selected only after permission.
3. Keep **“Live thermal preview — non-radiometric”** visible while the local stream plays.
4. Point out **“No current assessment”** and **“Experimental palette brightness cue — not temperature or safety detection”**.
5. Enable cue sound, move a staged non-personal near-white palette region into and out of view, and show the visible `!` + text and optional tone. Say explicitly that people and any other near-white region can also activate it.
6. Stop the preview and show that the cue/video clear, audio stops, the camera indicator closes, and `#history` remains empty.
7. Switch deliberately to the labelled replay to demonstrate pause/resume/restart; Replay must never activate the cue.

If Phase 1D fails, run replay only. The UI must continue to display **“Demo replay — not live”**.

---

## 6. Stack

- Vite + React 19 + TypeScript.
- Tailwind v4 through the Vite plugin.
- Lightweight `location.hash` routing.
- Local React state in `usePreviewSession`; no global store.
- Static PNG replay manifest.
- Plain Node verification script; no test framework.
- Browser MediaDevices for the implemented display-only preview; no camera SDK.
- Browser canvas and Web Audio APIs for the bounded Phase 1E experiment; no model or new dependency.
- Future local native bridge for PureThermal Y16, blocked pending a new calibrated proof.

No API, database, authentication, cloud storage, model endpoint, or persistence in the foundation.

---

## 7. Delivery gates

`docs/PLAN.md` is the phase-schedule authority. The hardware decision has already branched:

1. Phase 1A investigation completed; calibrated radiometry did not pass.
2. Radiometric bridge, assessment, and assessment speech are blocked.
3. Phase 1D code is implemented; its separate attached-device permission/playback/cleanup gate is blocked after the missed 16:15 cutoff.
4. At 18:03 the user explicitly authorized Phase 1E after freeze; its deterministic synthetic gate is separate from its still-open attached-browser evidence.
5. Replay remains the independent labelled fallback and never enters Phase 1E.

Deterministic classification over validated radiometry remains mandatory for **any live thermal or safety-warning claim**. Phase 1E is presented only as a display-brightness cue. The team will not turn it into a heat claim to make the preview look complete.

---

## 8. Success criteria

### Foundation

- Reloading `#scan` preserves the route and presents an idle replay.
- Six frames render in manifest order at 160 × 120.
- Start reaches `ended`; pause freezes progress; resume continues; stop returns to idle; restart begins at frame one.
- Leaving the route cancels timers.
- Replay provenance remains visible for the entire replay.
- `#history` truthfully states that nothing is stored.
- `npm run verify:replay`, `npm run verify:preview`, `npm run lint`, and `npm run build` pass.

### Target final hackathon MVP — only if Phase 1D is explicitly reopened and passes

- The exact intended PureThermal video input is explicitly selected after permission.
- A local colorized stream plays with persistent non-radiometric provenance.
- No stale preview survives pause, stop, restart, failure, switch, route change, or unmount.
- Permission denial, wrong input, and disconnect produce explicit text + symbol recovery.
- The camera indicator closes after stop and route change.
- The assessment panel remains **“No current assessment”**.
- Replay remains a plainly labelled fallback and passes the disconnected-network gate.
- The experimental cue remains separately labelled, visible without audio, live-only, ephemeral, and clear on every inactive lifecycle.
- Any video says explicitly that near-white pixels—including a person if present—can activate it and that it is not hot detection.
- Every claimed path runs twice before recording; the Phase 1E exception was explicitly authorized after the planned freeze.

### Honest fallback

- The accessible replay lifecycle is self-contained and local; offline behavior is claimed only after the Phase 4 disconnected-network rehearsal.
- Exact simulated provenance remains visible.
- No replay assessment or temperature-accuracy claim appears.
- Browser preview and Phase 1E are described as implemented with blocked actual-hardware evidence unless their actual-browser gates pass and are recorded.
- Radiometric bridge, assessment, and assessment speech are described as future work.

---

## 9. Out of scope

Smart plugs, relays, appliance control, third-party alerts, remote monitoring, cloud frame storage, medical diagnosis, injury assessment, fever screening, object/person recognition or suppression, YOLO, RGB fusion, user accounts, billing, settings, mobile-native packaging, and multi-tenancy.

The future radiometric product would act by warning the person. The current build makes no thermal warning; its experimental cue reports only a near-white display condition. Neither version acts on the physical environment.

---

## 10. Questions to answer honestly

- **“Can it tell me something is safe?”** No. The current build makes no heat assessment. Its palette cue cannot establish temperature or danger. A future radiometric build may locate and describe higher heat, but it still cannot guarantee touch safety.
- **“Is the replay a camera feed?”** No. It is a simulated six-frame UI and lifecycle fixture, visibly labelled at all times.
- **“Does the AI decide what is hot?”** No. There is no hot decision in the current build. Phase 1E uses fixed deterministic RGB rules only to report near-white display coverage. A future heat assessment must come from deterministic code over validated radiometry; language could only explain that result.
- **“Are frames uploaded?”** No. The implemented preview path keeps a `MediaStream` local and ephemeral and includes no upload, recording, snapshot, logging, or persistence path. Actual attached-device playback remains unproven. The replay PNGs are committed simulated fixtures served locally.
- **“Is the live preview RGB?”** It may be delivered in an RGB-formatted video stream, but the Lepton is a thermal sensor. Those colorized display pixels are not calibrated per-pixel temperatures.
- **“Does the live preview locate higher heat for a blind user?”** No. Its optional sound makes an experimental near-white palette cue perceivable without sight, but it does not measure heat or provide direction. Attached-device capture also remains unverified until the actual-browser gate passes.
- **“Does it ignore people?”** No. There is no person detector. A person and any other region rendered near white can activate the same cue. The staged demo should keep people out of frame for privacy, not because Ember filters them.
- **“What happens if browser camera playback fails on stage?”** The team switches explicitly to the labelled local replay; it is called offline only after the disconnected-network gate passes.
