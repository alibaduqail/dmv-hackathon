# Tally Flow

## Research findings, product differentiation, and seven-hour hackathon scope

**Date:** July 25, 2026  
**Hardware:** FLIR Lepton 3.5 with PureThermal 3  
**Track:** Health Tech & Accessibility

---

## Executive decision

There is a credible and differentiated product inside Tally, but it is not simply “AI documentation with a thermal camera.”

The strongest concept is:

> **Tally Flow turns an SLP’s mirror test into contactless, replayable biofeedback that families can use during assigned practice and clinicians can verify remotely.**

The camera creates the visual hook. The defensible product is the complete workflow:

1. An SLP assigns a controlled speech exercise.
2. The thermal camera records a short, sustained attempt.
3. Tally saves the thermal sequence, trace, speech task, cue, and capture quality.
4. The clinician records “observed,” “not observed,” or “indeterminate.”
5. Only the clinician-confirmed observation enters the longitudinal record.

For the hackathon, this should be presented as an **experimental digital thermal mirror**, not as a VPI screening or diagnostic device.

---

## 1. What already exists

Tally’s original AI documentation idea addresses a real market, but most of its individual features are already offered by competitors.

| Category | Examples | Capabilities already available |
|---|---|---|
| Speech-specific AI documentation | [RelyCare](https://relycare.app/en), [SLPFlow](https://slpflow.com/) | Speech-session notes, targets, cueing, transcript-linked evidence, clinician review, and progress history |
| AI-supported home practice | [Nuvo](https://www.nuvotherapy.com/), [LumaSpeech](https://lumaspeech.com/) | SLP-assigned exercises, recordings, audio scoring, progress reports, and clinician dashboards |
| Simple nasal-airflow biofeedback | [See-Scape](https://www.alimed.com/products/see-scape-speech-assessment-tool), HumBEE | Immediate visual indication of nasal airflow using a nasal tip, tube, and moving float |
| Clinical nasality instrumentation | [PENTAX Nasometer](https://www.pentaxmedical.com/us/specialties/ent) | Established nasalance measurement, standardized stimuli, recording, and real-time biofeedback |

The following claims are therefore not unique:

- AI writes an SLP’s note.
- A clinician approves AI-generated information.
- The system tracks cueing and accuracy over time.
- Parents complete assigned speech exercises at home.
- AI scores speech attempts.
- A visual device helps a child notice nasal airflow.
- Confirmed session information generates clinical documents.

The closest direct competitor to Tally’s original core is RelyCare. It already markets speech-specific documentation with targets, cues, attempts, retries, transcript evidence, clinician approval, and longitudinal context.

---

## 2. Tally’s strongest white space

The reviewed market did not reveal a commercial product combining all of the following:

1. Contactless thermal observation during a controlled speech task.
2. Calibration using the same person during the same session.
3. A synchronized thermal sequence, speech attempt, cue, and time trace.
4. A before-cue versus after-cue comparison.
5. Capture-quality checks that permit an “indeterminate” result.
6. Use during SLP-assigned home practice.
7. Clinician confirmation before the observation becomes clinical evidence.
8. Reuse of the confirmed evidence in a longitudinal record and downstream documentation.

This is meaningful product differentiation, but it is not proof of patentability or freedom to operate.

The clearest positioning is:

> **Most speech AI listens to the result. Tally Flow helps the child see the thermal pattern associated with how air was routed during the attempt.**

Another useful formulation is:

> **A mirror shows an SLP nasal airflow for a moment. Tally makes that observation contactless, replayable, comparable, and connected to the clinical record.**

---

## 3. What the Lepton 3.5 can accomplish

The Lepton 3.5 provides:

- 160×120 thermal resolution.
- Radiometric temperature output.
- 8.6 unique frames per second.
- Less than 50 mK thermal sensitivity.
- A 57-degree horizontal field of view.
- An integrated shutter for non-uniformity correction.

The PureThermal 3 exposes the camera through USB and supports radiometric capture using compatible software.

A sustained two-to-three-second speech task yields approximately 17–26 unique thermal frames. This is enough for a slow temperature trace and visual comparison. It is not sufficient for reliable analysis of short consonant bursts or unrestricted running speech.

### Plausible capabilities

- Record temperature change over time in a fixed region near both nostrils.
- Compare a quiet baseline with a sustained speech task.
- Use sustained `/m/` as a positive nasal-route reference.
- Compare multiple sustained `/s/` attempts.
- Show before-cue and after-cue attempts.
- Display repeatability across three trials.
- Save the clip, trace, task, and cue as one evidence object.
- Reject a recording as indeterminate when movement, positioning, or calibration makes it unreliable.
- Provide immediate visual biofeedback during a controlled exercise.

### Scientifically unsupported capabilities

The current camera and evidence do not support claims that Tally:

- Measures airflow volume in milliliters per second.
- Measures oral or nasal air pressure.
- Measures nasal resistance.
- Measures the size of a velopharyngeal opening.
- Diagnoses or screens for VPI.
- Distinguishes a structural problem from a learned speech pattern.
- Assigns clinical severity.
- Uses a validated `/s/`-to-`/m/` cutoff.
- Automatically recommends referral.
- Reliably analyzes brief consonant bursts.
- Replaces nasometry, pressure-flow testing, nasoendoscopy, or an SLP.

The existing 30% threshold should be removed. It is an invented demonstration constant, not a validated clinical rule.

Sources:

- [Official FLIR Lepton 3.5 specifications](https://oem.flir.com/en-150/products/lepton/?model=500-0771-01&segment=oem&vertical=microcam)
- [PureThermal 3 datasheet](https://media.digikey.com/pdf/Data%20Sheets/GroupGets%20PDFs/PURETHERMAL-3_Rev2_Oct2022.pdf)
- [Thermal nasal-airflow pilot study](https://pmc.ncbi.nlm.nih.gov/articles/PMC8489757/)
- [Thermal validation study reporting poor correlation with objective nasal resistance](https://www.theajo.com/article/view/4665/html)

---

## 4. Recommended controlled protocol

The product should use within-session references instead of population thresholds.

1. Record a quiet baseline or short breath hold.
2. Record three sustained `/m/` attempts.
3. Record three sustained `/s/` attempts.
4. Have the SLP provide one cue.
5. Record three additional `/s/` attempts.
6. Overlay the traces and their variability.
7. Let the clinician record:
   - Thermal change observed
   - Not observed
   - Indeterminate

The system should show **relative thermal activity**, not “percentage of nasal airflow.”

Important capture-quality conditions include:

- Consistent camera distance, angle, posture, and room conditions.
- No fan or HVAC draft across the face.
- A short acclimation period in the room.
- No recent exercise or hot/cold drink.
- Broad bilateral nostril regions rather than individual pixels.
- Exclusion of the inhale immediately before or after speech.
- Recalibration each session.
- Rejection of recordings interrupted by movement or a shutter correction.
- No ordinary glass or acrylic in front of the camera because those materials block long-wave infrared energy.

---

## 5. Recommended users and business model

The strongest model is **clinic-owned, family-used**.

### Primary buyer

- Pediatric speech clinic.
- Cleft or craniofacial team.
- Lead SLP with resonance expertise.
- Telepractice provider.

### End users

- The SLP assigns and interprets the exercise.
- The parent helps position the child and start the recording.
- The child performs a short practice task.
- A specialist may review confirmed evidence asynchronously.

### Parent permissions

Parents can:

- Follow an SLP-assigned exercise.
- Position the camera using on-screen guidance.
- Encourage repetitions.
- Record attempts.
- Mark whether a recording appears usable.
- Submit the attempt for review.

Parents should not:

- Diagnose VPI.
- Choose speech targets independently.
- Determine whether the cause is structural or learned.
- Interpret an ambiguous thermal trace.
- Change treatment based on an automated score.
- Receive an automatic pass/fail or referral recommendation.

### Access for families with limited funds

Tally should not claim to replace a speech therapist. A safer and more credible access model is:

1. One appropriate clinician evaluation.
2. A prescribed home-practice protocol.
3. Short guided practice between appointments.
4. Periodic asynchronous clinician review.
5. Fewer, but more productive, professional appointments.

This could reduce travel and the cost of remaining connected to care. It cannot safely eliminate the need for diagnosis, treatment selection, adaptation, or referral decisions.

The bare camera hardware costs approximately $284 before adding an enclosure, mount, computer, support, and software. A clinic loan program is more practical and equitable than requiring every family to purchase a camera.

- [GroupGets thermal hardware pricing](https://groupgets.com/collections/thermal-imaging)
- [ASHA telepractice guidance](https://www.asha.org/practice-portal/professional-issues/telepractice/)
- [ASHA resonance guidance](https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/)

---

## 6. Why the accessibility market is credible

The strongest accessibility story is collaboration between specialist teams, community SLPs, and families.

Research has found that:

- More than 40% of US counties lacked an approved craniofacial team within 100 miles.
- Twenty-nine percent lacked an approved cleft team within that distance.
- Distance, limited instrumentation, and clinician confidence affect referral and treatment decisions.
- Rural community SLPs frequently have less access to specialized cleft and resonance resources.

Tally’s role would be:

> **Tally does not replace the specialist. It lets the specialist’s guidance and a community clinician’s observations travel farther than the specialist can.**

Sources:

- [Travel burden to approved cleft and craniofacial teams](https://pubmed.ncbi.nlm.nih.gov/38546662/)
- [Impact of rurality on SLP treatment and referral decisions](https://pubmed.ncbi.nlm.nih.gov/37488965/)

This is a focused initial market, not the entire speech-therapy market. The broader Tally documentation platform has a larger potential audience, but it also faces substantially more competition.

---

## 7. What creates a defensible moat

The FLIR camera, an LLM, a heatmap, and “human in the loop” can all be copied.

The long-term moat would come from:

1. **The protocol**  
   Standardized tasks, positioning, calibration, quality checks, and indeterminate handling.

2. **The dataset**  
   Synchronized thermal data, speech attempts, cues, capture conditions, and clinician labels.

3. **Clinical validation**  
   Comparison with clinician observation, mirrors, See-Scape, nasometry, pressure-flow studies, or other appropriate reference methods.

4. **Evidence provenance**  
   A record of who captured, proposed, edited, confirmed, and reused each observation.

5. **Clinical distribution**  
   Relationships between specialist teams, community clinics, schools, and families.

6. **Workflow integration**  
   Assignment, capture, review, longitudinal tracking, documentation, consent, privacy, and deletion controls.

The camera is the hackathon hook. The validated protocol, clinician-labeled data, and care network would make it a company.

### Intellectual-property caution

Neighboring patent territory is crowded:

- Oral/nasal airflow measurement for speech therapy already exists.
- Nasality biofeedback already exists.
- Thermal nostril-region measurement and breathing biofeedback already exist.
- A 2026 patent application broadly describes home speech exercises, automated analysis, progress assessment, and remote clinician review.

Relevant example:

- [US20260106006A1 — System and Method for Supporting Speech Language Pathology Practices](https://patents.google.com/patent/US20260106006A1/en)

A potentially narrower invention could involve synchronized thermal-plus-audio capture during a defined speech protocol, session controls, quality gates, clinician labeling, and controlled promotion into the clinical record. This requires patent counsel and is not established by the present search.

---

## 8. Regulatory and clinical boundary

Safe early-stage language:

- “Records thermal change near the nostrils.”
- “Experimental digital thermal mirror.”
- “Supports clinician-guided practice.”
- “Provides visual biofeedback.”
- “Creates standardized clips and traces for clinician review.”
- “Not intended to diagnose or screen for VPI.”

Avoid:

- “Detects nasal leakage.”
- “Screens for VPI.”
- “Measures severity.”
- “Clinical-grade accuracy.”
- “Automatically recommends referral.”
- “Replaces the SLP.”

Regulatory status depends on the intended use, not only on a disclaimer. Patient-facing software that analyzes physiological signals and gives patient-specific diagnostic or treatment directives may be regulated as a medical device.

- [FDA examples of regulated device software functions](https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-device-software-functions-fda-regulates)

---

## 9. Seven-hour feasibility verdict

### Decision

The complete product is not plausible in seven hours.

A compelling prerecorded proof of concept is plausible with two people and strict scope control.

There are approximately six usable development hours before the 5:30 PM feature freeze, followed by 90 minutes for the README, screen recording, and submission.

### Build only

- Real `/m/` and sustained `/s/` examples captured through the vendor application.
- Thermal stills or short prerecorded sequences.
- One simple trace based on actual captured values.
- Three clinician labels: observed, not observed, indeterminate.
- One confirmed thermal evidence event.
- The confirmed event entering Tally’s longitudinal record or an artifact.
- Clear “experimental and non-diagnostic” language.

### Do not build

- Live USB camera integration.
- Automatic face or nostril tracking.
- Parent accounts or a parent-facing application.
- Remote uploading.
- Automatic clinical scoring.
- Machine learning.
- A universal threshold.
- VPI screening or referral logic.
- A specialist portal.
- A hardware enclosure.
- Clinical validation.

### Realistic two-person schedule

| Time | Main development lane | Parallel lane |
|---|---|---|
| 11:30–1:30 | Finish approve/edit/reject review | Capture thermal controls and export assets |
| 1:30–3:00 | Connect confirmed events to cached artifacts | Prepare thermal fixture values and final copy |
| 3:00 | Core-demo go/no-go | Thermal assets must already exist |
| 3:00–4:15 | Finish outputs and integration | Build the standalone thermal screen |
| 4:15–5:00 | Connect one confirmed thermal event | Full offline testing |
| 5:00–5:30 | Rehearse twice and fix blockers only | Screenshots and recording setup |
| 5:30 onward | Feature freeze | README, captioned video, and submission |

Thermal receives no more than 60–75 minutes of implementation time. If the core review and artifact path does not work by 3:00 PM, thermal should be cut.

With one developer, the thermal module should be cut unless the core demo is already complete.

---

## 10. Pre-presentation test

The hackathon cannot establish clinical validity. It can test engineering feasibility, usability, and whether the team communicates the limitations correctly.

Use consenting adults, not children or patients.

### Technical test

For at least three adults:

1. Quiet baseline or breath hold.
2. Nose-only exhale.
3. Mouth-only exhale.
4. Three sustained `/m/` attempts.
5. Three sustained `/s/` attempts.

Record:

- Whether the known nasal control clearly differs from baseline.
- Whether the known oral control primarily appears around the mouth.
- Whether repeated attempts look similar.
- Whether small positioning changes destroy the signal.
- How often the correct output is “indeterminate.”

Do not report sensitivity, specificity, diagnostic accuracy, or patient improvement.

### Usability test

Have at least three people who did not build the product follow the capture instructions.

Measure:

- Setup time.
- Successful positioning.
- Retake rate.
- Number of questions asked.
- Whether they understand that the system does not diagnose.
- Whether a clinician can review an evidence card in under one minute.

### Customer test

Ask several SLPs:

- How do you currently observe and treat phoneme-specific nasal emission?
- Do you use a mirror, See-Scape, nasometer, or another method?
- What disappears when a child practices at home?
- Would a standardized clip and trace change what you can review?
- Would your clinic lend a roughly $300 kit?
- What would make you refuse to use it?
- Would you agree to a small pilot?

A concrete pilot commitment is more valuable than general enthusiasm.

---

## 11. Recommended hackathon demonstration

The thermal segment should last approximately 20 seconds:

> “SLPs already use a mirror to visualize nasal airflow, but that observation disappears. Tally Flow makes the observation contactless and replayable. The sensor proposes an observation, the clinician confirms it, and only then does it enter the record.”

Show:

1. Baseline.
2. Sustained `/m/`.
3. Sustained `/s/`.
4. A simple trace or comparison.
5. “Observed / Not observed / Indeterminate.”
6. Clinician confirmation.
7. The confirmed observation entering the record.

If a healthy teammate intentionally simulates an unusual airflow route, label it clearly as a **sensor-feasibility demonstration**, not a patient finding.

---

## Final recommendation

For the hackathon:

> **Keep Tally’s clinician-confirmed record as the core product and present Tally Flow as its memorable second evidence source.**

For commercialization:

> **Develop Tally Flow as a clinic-owned, family-used system for controlled home biofeedback and specialist review, beginning with phoneme-specific nasal-airflow practice.**

The responsible central thesis remains:

> **AI and sensors may propose evidence. Only clinician-confirmed evidence enters the record.**

