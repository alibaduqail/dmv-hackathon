---
name: thermal-panel
description: Use before touching src/features/thermal/ or anything involving thermal captures, nasal air emission screening, or velopharyngeal insufficiency. Covers the gate, the fixture-only rule, the paired-stimulus logic, and the language constraints. Trigger on thermal, camera, VPI, nasal emission, resonance, or screening.
---

# Thermal panel

## The gate — check this first

At **3:00 PM**: is the review UI done end-to-end and the record view underway?

- **No** → thermal is cut. Do not start. Remove the beat from `docs/DEMO.md`.
- **Yes** → build window is **5:00–5:30 only**. Standalone route. Wired to nothing. Hard abort at 5:30.

Not a preference. A checkpoint.

## Absolute rule: no capture code

There is no camera library in this repo. No `opencv`, no `flirpy`, no UVC, no device access, no live preview. Two PNGs committed under `src/fixtures/thermal/` with hard-coded temperature readings taken off the vendor app.

If you are writing anything that opens a device handle, stop — you're building the wrong thing.

## What it screens for

Velopharyngeal insufficiency: the soft palate doesn't seal during pressure consonants, so air escapes through the nose on /s/, /p/, /b/. Core issue in cleft palate, routinely mistaken for an articulation error. Gold standard is nasometry — thousands of dollars, specialty centers only.

Warm exhaled air out the nostrils is what thermal sees.

## The paired-stimulus logic

The signal is the **comparison**, never a single frame:

| Stimulus | Expected nasal delta | Why |
|---|---|---|
| Sustained **/m/** | HIGH | Nasal consonant — airflow should exit the nose |
| Sustained **/sssss/** | LOW | Pressure consonant — palate should seal |

```
delta_c = nasal_roi_peak_c - baseline_c

if (sDelta / mDelta) > THRESHOLD  →  possible nasal air emission  →  SCREENING_FLAG
```

Threshold is a demo constant, not a validated cutoff. Label it as such in the code comment.

Sustained, not repeated: many consumer thermal cameras run at 9 Hz — too slow for rapid syllable repetition, fine for held productions.

## The panel

1. Two frames side by side, native thermal palette, labelled `/m/ sustained` and `/s/ sustained`.
2. Nasal delta printed under each in mono.
3. The comparison, plainly: `/s/ delta is 82% of /m/ delta — expected under 30%.`
4. A proposed `SCREENING_FLAG` card, identical styling to every other proposed card — soft grey, dashed, confidence shown.
5. Clinician confirms → card turns red → appears in the SOAP note objective and the `auth_summary` referral line.

**Step 5 is the entire reason thermal is in the product.** A picture doesn't get anyone a referral. Confirmed documentation does. If you run out of time, cut the panel's polish — never cut the flow into the artifacts.

Do not recolor the thermal frames to match the design system. A false-color thermal image is a clinical artifact; prettifying it undermines the claim.

## Language — enforced

**Screening.** Never "diagnose," "detect," "measure," or "test for."

UI copy, generated text, README, and stage script all say the same thing:

> This doesn't diagnose. It tells a community SLP this child needs a craniofacial referral — when the nearest nasometer is three hours away.

If the frames were staged rather than showing real nasal emission, the UI and the pitch must say **simulated example**. Passing off a staged frame as a real finding is the one thing that loses the room.
