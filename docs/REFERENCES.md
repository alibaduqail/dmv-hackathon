# REFERENCES.md — what to model off, what not to install

Rule for all of these: **read them, steal the shape, don't install them.** Every dependency is a risk you can't debug at 4 PM.

---

## Transcript + synced review

### bbc/react-transcript-editor
`https://github.com/bbc/react-transcript-editor`

The closest prior art to our review screen — a transcript where each word carries timing and edits preserve word-level alignment. Built by BBC News Labs for correcting STT output.

**Steal:** the transcript JSON shape (word → `start`, `end`, `speaker`), and their `timecodeConverter` helpers (`secondsToTimecode`, `timecodeToSeconds`).

**Do not install.** It's Draft.js-based, marked work-in-progress, and pulls a large dependency tree. Our transcript is a fixture with speaker-labelled lines — we need string-match highlighting, not a rich text editor. That's about 30 lines.

Lighter variants if you want a second look: `alexnorton/transcript-editor`, `YusufCelik/annotato` (small React text-annotation hook).

---

## Thermal capture

**Which library depends on hardware. Identify the camera before choosing.**

| Camera | Path |
|---|---|
| Phone-attached (FLIR One, Topdon, InfiRay, Seek) | **Vendor app → export PNG → commit as fixture.** 20 minutes. Do this. |
| FLIR Lepton on PureThermal board | `groupgets/purethermal1-uvc-capture` — UVC, works with `cv2.VideoCapture` |
| FLIR Boson / Tau 2 / Lepton+PureThermal | `LJMUAstroecology/flirpy` — returns radiometric images as numpy arrays in Celsius |
| Seek Compact / CompactPRO | `libseek-thermal` |
| Radiometric ROI reading | `ozel/FLIR_ROI_Viewer` — region-of-interest temperature readout, exactly our nostril ROI |

**Default to the phone path.** Writing a capture driver is a 3-hour detour that produces the same two PNGs you could have exported in 20 minutes. We are not doing live capture on stage under any circumstances.

If you do go radiometric, `flirpy` is the one to read — it's the cleanest API and it hands back Celsius directly, which is what the nostril delta needs.

---

## What NOT to model off

- **OpenEMR / FHIR / any EHR schema.** Correct for a real product, fatal here. FHIR resource modelling will eat your entire morning and no judge will notice.
- **Ambient scribe repos.** Our whole positioning is that we're not one. Reading their architecture pulls you toward producing prose.
- **Anything with an auth layer.** You'll inherit it by accident.
