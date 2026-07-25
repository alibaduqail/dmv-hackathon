# Ember — MVP Spec v1

**Supersedes all prior specs.** Track 02, Health Tech & Accessibility. **Feature freeze 17:30. Submit 19:00.**

**One line:** Ember gives blind and low-vision people a non-contact way to locate higher-heat areas before reaching toward them.

**MVP form:** a handheld Lepton 3.5 thermal camera on a PureThermal USB board, paired with a local web interface. On-screen guidance ships first; spoken guidance follows.

---

## 0. What Ember is

Residual heat is difficult to verify without sight or contact. A burner, pan, mug, space heater, or charging device may look ordinary and provide no useful cue until a hand is already close.

Ember turns thermal frames into directional guidance:

```
PureThermal frame
  → deterministic hotspot analysis
  → observable heat assessment
  → text + symbol + color
  → the same guidance spoken aloud
```

The model is deliberately narrow. Ember does not identify objects, diagnose injury, or guarantee touch safety. It reports where higher heat was observed and prompts the person to keep distance or verify another way.

### Why thermal

An RGB camera answers *what does this look like?* Thermal data answers *where is heat concentrated?* The Lepton 3.5 provides a 160 × 120 radiometric sensor. That resolution is enough for regions and direction, not fine object recognition.

### Who it serves

Primary user: a blind or low-vision person checking a nearby surface in a kitchen, workshop, bathroom, or charging area.

The first interaction is intentionally simple:

1. Point the handheld camera toward the area.
2. Start the source.
3. Hear and read source status.
4. Receive one directional warning when deterministic rules find higher heat.
5. Stop or reposition.

No account, setup wizard, object labelling, smart-home integration, or remote monitoring.

---

## 1. The claim boundary

Ember observes surface radiation under imperfect conditions. Material emissivity, reflections, distance, angle, recent calibration, exposure time, and individual sensitivity all matter.

**The product must never say an object is safe to touch.**

| Ember may say | Ember must not say |
|---|---|
| “Higher heat observed in the upper-right area.” | “The pan is safe.” |
| “Keep your hand away and verify another way.” | “There is no burn risk.” |
| “No current assessment.” | “Everything is clear.” |
| “The source is paused.” | “The camera proved it is cold.” |

Classification is deterministic code over radiometric values. An LLM may later turn the resulting structured assessment into natural language, but it cannot select thresholds or alter severity.

---

## 2. What ships in the foundation

This repository reset builds the seam before the hardware path.

### Included now

- `#scan` default route.
- High-contrast thermal viewport.
- Six ordered, simulated 160 × 120 PNG frames.
- Visible provenance: **“Demo replay — not live”**
- Start, pause, restart, and stop controls.
- Text source status.
- `ThermalSource` interface independent of transport.
- `ReplayThermalSource` with deterministic timing and cleanup.
- `#history` with an honest empty state.
- Build, lint, and replay verification commands.

### Explicitly deferred

- PureThermal native bridge and live frames.
- Radiometric hotspot analysis.
- Severity thresholds.
- Text-to-speech.
- LLM explanation.
- Alerts, notifications, or saved incidents.

The replay proves the source boundary and interface lifecycle. It does **not** prove camera connectivity, temperature accuracy, or safety performance.

---

## 3. The MVP after the next phases

### Source boundary

Both transports implement the same contract:

```
ReplayThermalSource ─┐
                     ├── ThermalSource callbacks ── Scan UI
PureThermalSource ───┘
```

The React surface never knows whether a frame came from a timer and PNG manifest or a native process. Provenance does.

### Live bridge

The browser is not assumed to expose radiometric Y16 data reliably. A local native bridge will:

1. Open the PureThermal UVC device.
2. Receive 160 × 120 Y16 frames.
3. Preserve calibrated radiometric values when the device provides them.
4. Produce a display image separately from analysis data.
5. Stream both to `PureThermalSource` over a local-only connection.

The bridge remains replaceable. Vendor example software is prior art, not a runtime dependency.

### Assessment

The analysis phase will:

1. Reject malformed or non-radiometric frames.
2. Normalize a valid radiometric grid.
3. Find connected higher-heat regions.
4. Require persistence across frames to reduce flicker.
5. Map the strongest region to plain spatial language.
6. Emit a structured `ThermalAssessment`.

Thresholds are configuration owned by deterministic code and must be validated with the actual device before the UI uses them. No threshold is invented from the PNG replay.

### Spoken interaction

Speech repeats the structured assessment. It never outruns or replaces visible text. If speech fails, the screen remains complete. If the source fails, speech announces the source failure rather than reusing a stale warning.

---

## 4. Interface

### `#scan` — default

- Product name and short purpose.
- Source badge with text status.
- Thermal viewport preserving the source aspect ratio.
- Persistent provenance beside the viewport.
- Current frame metadata.
- Start, pause, restart, and stop controls.
- Live region for source changes.
- Future assessment panel beneath the viewport.

Every interactive target is at least 44 × 44 CSS pixels, keyboard operable, visibly focused, and named for assistive technology.

### `#history`

Foundation copy explains that Ember is not storing scans or incidents yet. It must not fabricate records to make the page look complete.

History becomes real only after a later, explicit privacy decision. Live frames remain ephemeral even if structured incident metadata is eventually stored.

---

## 5. Demo object and safety

Use a heating pad, reusable hand warmer, or warm mug. Do not bring an exposed heating element or create a burn hazard for the pitch.

The final demo:

1. Show an object whose residual heat is not obvious.
2. Connect the PureThermal source.
3. Point Ember toward it.
4. Display and speak the same directional warning.
5. Reposition to show the warning follows the thermal region.
6. Explain that the decision came from deterministic radiometric analysis.

If the native path fails, switch to replay and say exactly what it is. The UI must continue to display **“Demo replay — not live”**.

---

## 6. Stack

- Vite + React 19 + TypeScript.
- Tailwind v4 through the Vite plugin.
- Lightweight `location.hash` routing.
- Local React state in `ScanView` for the foundation.
- Static PNG replay manifest.
- Plain Node verification script; no test framework.
- Future local native bridge for PureThermal Y16.

No API, database, authentication, cloud storage, model endpoint, or persistence in the foundation.

---

## 7. Schedule — backwards from 19:00

| Phase | Window | Exit gate |
|---|---|---|
| Repository reset + replay foundation | 12:50–14:00 | Replay lifecycle works; build, lint, verifier green |
| PureThermal bridge + hotspot analysis | 14:00–15:30 | Valid live radiometric frame reaches deterministic analysis |
| Spoken interaction | 15:30–16:15 | Screen and speech express the same assessment |
| Demo flow + accessibility QA | 16:15–17:00 | Keyboard and screen-reader pass; full pitch rehearsed |
| Offline hardening | 17:00–17:30 | Live path plus labeled replay fallback each run twice |
| **Hard feature freeze** | **17:30** | No more product code |
| Package | 17:30–18:30 | README, captioned recording, submission form |
| Buffer | 18:30–19:00 | Submit; do not build |

**Cut order:** LLM explanation → history persistence → polished temperature charts → multiple hotspot narration.

**Never cut:** deterministic classification, redundant warning output, replay provenance, or the offline fallback.

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

### Final hackathon MVP

- A live radiometric frame crosses the native bridge.
- Deterministic analysis creates one spatial assessment.
- Visible and spoken outputs match.
- Stale frames never produce a current warning.
- Disconnecting the camera produces an explicit error state.
- Replay remains a fully offline, plainly labelled fallback.
- The three-minute demo runs twice without a reload.

---

## 9. Out of scope

Smart plugs, relays, appliance control, third-party alerts, remote monitoring, cloud frame storage, medical diagnosis, injury assessment, fever screening, object recognition, RGB fusion, user accounts, billing, settings, mobile-native packaging, and multi-tenancy.

The product acts by warning the person. It does not act on the physical environment.

---

## 10. Questions to answer honestly

- **“Can it tell me something is safe?”** No. It can locate and describe higher heat; it cannot guarantee touch safety.
- **“Is the replay a camera feed?”** No. It is a simulated six-frame UI and lifecycle fixture, visibly labelled at all times.
- **“Does the AI decide what is hot?”** No. Deterministic code produces the assessment. Language generation can only explain that object.
- **“Are frames uploaded?”** No. The MVP processes them locally and treats them as ephemeral.
- **“Why not use a normal webcam?”** RGB describes visible appearance. Ember’s core input is radiometric thermal data.
- **“What happens if the hardware fails on stage?”** The team switches to the labelled offline replay without changing the interface.
