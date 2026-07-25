# Ember — MVP Spec v2

**Supersedes all prior specs.** Track 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.**

**Product target in one line:** Ember would give blind and low-vision people a non-contact way to locate higher-heat areas before reaching toward them.

**Hackathon MVP form:** a handheld Lepton 3.5 thermal camera on a PureThermal USB board, paired with a local web interface. The current build has an accessible labelled replay; the next bounded phase may add a live, display-only colorized UVC preview. Calibrated heat guidance and speech are blocked by the Phase 1A hardware result. Atomic acceptance and dependency gates live in `docs/REQUIREMENTS.md`; mutable phase timing lives in `docs/PLAN.md`.

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

The current hackathon capture path does not supply calibrated radiometry. Its authorized live branch ends at a display-only colorized preview:

```text
PureThermal UVC MediaStream
  → local video viewport
  → persistent non-radiometric provenance
  → “No current assessment”

  ✕ no temperature
  ✕ no hotspot or direction
  ✕ no warning or assessment speech
```

### Why thermal

A visible-light camera answers *what does this look like?* Calibrated thermal data can help locate where heat is concentrated. The attached Lepton remains a thermal sensor. If Phase 1D passes, its webcam-compatible path will supply colorized display pixels rather than data Ember can treat as per-pixel temperature. RGB-formatted video is not the same thing as an RGB scene sensor, and neither is radiometry.

### Who it serves

Primary user: a blind or low-vision person checking a nearby surface in a kitchen, workshop, bathroom, or charging area.

The intended radiometric interaction is deliberately simple:

1. Point the handheld camera toward the area.
2. Start the source.
3. Hear and read source status.
4. Receive one directional warning when deterministic rules find higher heat.
5. Stop or reposition.

No account, setup wizard, object labelling, smart-home integration, or remote monitoring.

Even if Phase 1D passes, its display-only preview will not deliver steps 4–5 for a blind user. That limitation must be explicit in the pitch.

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

Any future classification must be deterministic code over validated radiometric values. An LLM may later turn the resulting structured assessment into natural language, but it cannot select thresholds or alter severity. Colorized replay or UVC pixels are not valid classification input.

---

## 2. What ships in the foundation

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
- `#history` with an honest empty state.
- Build, lint, and replay verification commands.
- A privacy-safe Phase 1A no-go report for the attached PureThermal UVC device.

### Explicitly deferred

- Browser UVC preview and live `MediaStream`.
- PureThermal native radiometric bridge and calibrated live frames.
- Radiometric hotspot analysis.
- Severity thresholds.
- Text-to-speech.
- LLM explanation.
- Alerts, notifications, or saved incidents.

The replay proves the source boundary and interface lifecycle. It does **not** prove camera connectivity, temperature accuracy, or safety performance.

---

## 3. The next hackathon phase

### Display boundary

The replay and live-preview surfaces are truthfully different:

```text
ReplayThermalSource → ThermalFrame → <img>   → exact replay provenance
UvcPreviewSource    → MediaStream  → <video> → exact non-radiometric provenance
```

The live stream must not be forced into `ThermalFrame`, because doing so would require invented temperature metadata. The session controller owns operator selection, permission, lifecycle, late-result rejection, and cleanup. Demo replay remains selected by default; Live preview requires explicit selection and Start.

The preview must keep these statements adjacent:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

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

Future speech repeats a validated structured assessment. It never outruns or replaces visible text. Phase 1D may use accessible browser status/live regions, but it must not speak heat guidance from display pixels.

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
- Future assessment panel beneath the viewport.

Every interactive target is at least 44 × 44 CSS pixels, keyboard operable, visibly focused, and named for assistive technology.

### `#history`

Foundation copy explains that Ember is not storing scans or incidents yet. It must not fabricate records to make the page look complete.

History becomes real only after a later, explicit privacy decision. Any future live streams, frames, and radiometric arrays remain ephemeral even if structured incident metadata is eventually stored. The committed replay PNGs are simulated fixtures, not user captures.

---

## 5. Demo object and safety

Use a heating pad, reusable hand warmer, or warm mug. Do not bring an exposed heating element or create a burn hazard for the pitch.

The current demo, if Phase 1D passes:

1. Explain the residual-heat accessibility problem and the intended radiometric product.
2. Show the exact PureThermal input selected only after permission.
3. Keep **“Live thermal preview — non-radiometric”** visible while the local stream plays.
4. Point out **“No current assessment”**. Say that Ember deliberately does not infer temperature or direction from palette colors.
5. Stop the preview and show that the camera indicator closes and `#history` remains empty.
6. Switch deliberately to the labelled replay to demonstrate pause/resume/restart without calling it camera data.

If Phase 1D fails, run replay only. The UI must continue to display **“Demo replay — not live”**.

---

## 6. Stack

- Vite + React 19 + TypeScript.
- Tailwind v4 through the Vite plugin.
- Lightweight `location.hash` routing.
- Local React state in `ScanView` for the foundation.
- Static PNG replay manifest.
- Plain Node verification script; no test framework.
- Browser MediaDevices for the planned display-only preview; no camera SDK.
- Future local native bridge for PureThermal Y16, blocked pending a new calibrated proof.

No API, database, authentication, cloud storage, model endpoint, or persistence in the foundation.

---

## 7. Delivery gates

`docs/PLAN.md` is the phase-schedule authority. The hardware decision has already branched:

1. Phase 1A investigation completed; calibrated radiometry did not pass.
2. Radiometric bridge, assessment, and assessment speech are blocked.
3. Phase 1D may add a local display-only UVC preview through separate permission, source-truth, cleanup, and accessibility gates.
4. Replay remains the independent labelled fallback.

Deterministic classification over validated radiometry remains mandatory for **any live warning claim**. The team will not fabricate it to make a preview or replay look complete.

---

## 8. Success criteria

### Foundation

- Reloading `#scan` preserves the route and presents an idle replay.
- Six frames render in manifest order at 160 × 120.
- Start reaches `ended`; pause freezes progress; resume continues; stop returns to idle; restart begins at frame one.
- Leaving the route cancels timers.
- Replay provenance remains visible for the entire replay.
- `#history` truthfully states that nothing is stored.
- `npm run verify:replay`, `npm run lint`, and `npm run build` pass.

### Target final hackathon MVP — only if Phase 1D passes

- The exact intended PureThermal video input is explicitly selected after permission.
- A local colorized stream plays with persistent non-radiometric provenance.
- No stale preview survives pause, stop, restart, failure, switch, route change, or unmount.
- Permission denial, wrong input, and disconnect produce explicit text + symbol recovery.
- The camera indicator closes after stop and route change.
- The assessment panel remains **“No current assessment”**.
- Replay remains a plainly labelled fallback and passes the disconnected-network gate.
- Every claimed path runs twice before freeze.

### Honest fallback

- The accessible replay lifecycle is self-contained and local; offline behavior is claimed only after the Phase 4 disconnected-network rehearsal.
- Exact simulated provenance remains visible.
- No replay assessment or temperature-accuracy claim appears.
- Browser preview is described as planned or blocked until its own gate passes.
- Radiometric bridge, assessment, and assessment speech are described as future work.

---

## 9. Out of scope

Smart plugs, relays, appliance control, third-party alerts, remote monitoring, cloud frame storage, medical diagnosis, injury assessment, fever screening, object recognition, RGB fusion, user accounts, billing, settings, mobile-native packaging, and multi-tenancy.

The future radiometric product would act by warning the person. The current build makes no thermal warning, and neither version acts on the physical environment.

---

## 10. Questions to answer honestly

- **“Can it tell me something is safe?”** No. The current build makes no heat assessment. A future radiometric build may locate and describe higher heat, but it still cannot guarantee touch safety.
- **“Is the replay a camera feed?”** No. It is a simulated six-frame UI and lifecycle fixture, visibly labelled at all times.
- **“Does the AI decide what is hot?”** No. The current build makes no heat assessment. A future assessment must come from deterministic code over validated radiometry; language could only explain that result.
- **“Are frames uploaded?”** No live frame path is implemented or uploaded. The replay PNGs are committed simulated fixtures served locally; any future live media remains local and ephemeral.
- **“Is the live preview RGB?”** It may be delivered in an RGB-formatted video stream, but the Lepton is a thermal sensor. Those colorized display pixels are not calibrated per-pixel temperatures.
- **“Does the live preview locate higher heat for a blind user?”** Not yet. It demonstrates local capture and accessible source state only; the directional feature remains blocked without validated radiometry.
- **“What happens if browser camera playback fails on stage?”** The team switches explicitly to the labelled local replay; it is called offline only after the disconnected-network gate passes.
