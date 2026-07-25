# REFERENCES.md — primary sources and prior art

Rule: **read the source, copy the proven shape, do not make an old repository a runtime dependency.** Hardware examples establish feasibility; they do not prove our board, firmware, or laptop works.

---

## Lepton 3.5

### Teledyne FLIR — Lepton product page

<https://oem.flir.com/en-ca/products/lepton/>

The manufacturer lists Lepton 3.5 as 160 × 120 with a 57° field of view and shutter, and publishes the Lepton engineering datasheet from the same page.

**Use:** native frame dimensions, hardware terminology, integration documentation.

**Do not infer:** that a PNG contains radiometric values, that every board exposes the same UVC format, or that a reading proves touch safety.

### Teledyne FLIR — how emissivity affects thermal imaging

<https://www.flir.com/en-gb/discover/professional-tools/how-does-emissivity-affect-thermal-imaging/>

Surface material and reflected radiation can materially change an apparent temperature. Shiny metal can behave like an infrared mirror.

**Use:** claim boundary and demo-object selection.

**Product consequence:** A future calibrated Ember build may report observed higher heat and direction. The current non-radiometric path makes no assessment, and no version guarantees an object is safe to touch.

---

## PureThermal capture

### GroupGets — PureThermal UVC capture examples

<https://github.com/groupgets/purethermal1-uvc-capture>

The repository shows PureThermal UVC capture paths across operating systems. Its examples distinguish display formats from raw `GRAY16_LE` / Y16 data and note that standard macOS camera drivers do not support Y16 raw capture in that example path. The radiometry example uses a modified `libuvc`.

**Steal:**

- Prove Y16 outside React first.
- Keep display pixels separate from analysis values.
- Treat board firmware, telemetry, and calibration as explicit inputs.
- Put calibrated Y16 capture behind a native bridge only after a new hardware proof. This does not apply to Phase 1D’s browser display-only stream.

**Do not install blindly.** GroupGets says its software is example code, may be outdated, and is not guaranteed to function.

### GroupGets — GetThermal

<https://github.com/groupgets/GetThermal>

The project documents support for radiometric Lepton 3.5 on PureThermal 1/2, but its current README heading says the software no longer works.

**Use:** historical architecture and supported-device evidence only.

**Do not use:** as the stage viewer, bridge, or proof that this laptop can connect.

---

## Accessibility

### W3C — use of color

<https://www.w3.org/WAI/WCAG22/Understanding/use-of-color>

Color cannot be the only visual means of conveying information. Ember uses text + symbol first; color reinforces.

### W3C — 44 × 44 target size

<https://www.w3.org/WAI/WCAG21/Understanding/target-size>

W3C’s enhanced target-size guidance uses at least 44 × 44 CSS pixels. Ember adopts that size for every custom control because the interface may be used one-handed and without precision pointing.

### W3C — keyboard

<https://www.w3.org/WAI/WCAG22/Understanding/keyboard>

Every action available to a pointer must be available by keyboard. A thermal viewport is output, not an interactive image map.

---

## What not to build from

- **Webcam-only tutorials.** They may inform permission, selection, `<video>`, and track-cleanup mechanics for Phase 1D. They are not proof of radiometric Y16 and must never inform temperature or warning logic.
- **Color-palette inversion.** Display RGB cannot be converted back into trustworthy Celsius values.
- **Medical thermography thresholds.** Ember is an everyday heat-awareness companion, not a diagnostic or body-temperature product.
- **Cloud video pipelines.** Live media is local and ephemeral; committed replay PNGs are simulated fixtures.
- **Smart-home automation examples.** No relay or smart plug is in scope.
