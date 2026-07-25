import type { ClinicalEvent } from '../types.ts';

// FROZEN AT 11:00. Read .claude/skills/seed-fixtures/SKILL.md before changing a row.
//
// 32 confirmed events across sessions 1-6: 4,5,6,6,5,6. Session 7 starts empty —
// extraction proposes into it live. Trial totals are 20 everywhere; clinicians run
// consistent probe sets. Cue levels go BACKWARDS at 3->4 and 5->6 on purpose:
// real clinical data is not monotonic and an ascending line reads as fabricated.
//
// The evidence spans survive but the transcripts do not. That is the product, not
// an oversight — we keep confirmed evidence, never the recording.

const DATES = [
  '2026-06-13', '2026-06-20', '2026-06-27',
  '2026-07-04', '2026-07-11', '2026-07-18',
];

type Required = Pick<ClinicalEvent, 'event_type' | 'evidence' | 'ai_interpretation' | 'confidence'>;

let n = 0;
const ev = (session: number, o: Required & Partial<ClinicalEvent>): ClinicalEvent => ({
  id: `evt-${String(++n).padStart(2, '0')}`,
  session_id: `session-0${session}`,
  evidence_type: 'transcript',
  timestamp_sec: null,          // no stored transcript to sync against
  target: '/r/ initial',
  domain: 'articulation',
  trials_correct: null,
  trials_total: null,
  cue_level: null,
  thermal_capture_id: null,
  status: 'approved',
  clinician_edit: null,
  reviewed_at: `${DATES[session - 1]}T17:40:00Z`,
  ...o,
});

export const historicalEvents: ClinicalEvent[] = [
  // ── Session 1 · Jun 13 · baseline probe · 4/20 (20%) · tactile_cue ──────────
  ev(1, {
    event_type: 'ATTEMPT', trials_correct: 4, trials_total: 20, cue_level: 'tactile_cue',
    evidence: "Let's see where we're starting. Twenty tries on the R at the front of the word.",
    ai_interpretation: 'Baseline probe of /r/ initial; 4 of 20 trials correct with tactile cueing.',
    confidence: 0.91,
  }),
  ev(1, {
    event_type: 'CUE', cue_level: 'tactile_cue',
    evidence: 'Put two fingers on the sides of your tongue and pull them back like this.',
    ai_interpretation: 'Clinician provided tactile cueing for tongue retraction on /r/.',
    confidence: 0.86,
  }),
  ev(1, {
    event_type: 'ERROR_PATTERN',
    evidence: 'That one came out as "wabbit" again. I hear a W where the R should be.',
    ai_interpretation: 'Consistent /w/ substitution for /r/ in initial position (derhotacization).',
    confidence: 0.88,
  }),
  ev(1, {
    event_type: 'REINFORCEMENT',
    evidence: 'You sat through twenty of those without giving up. That is the hard part.',
    ai_interpretation: 'Clinician reinforced sustained effort across the baseline probe.',
    confidence: 0.72,
  }),

  // ── Session 2 · Jun 20 · 5/20 (25%) · tactile_cue · /r/ final emerging ──────
  ev(2, {
    event_type: 'ATTEMPT', trials_correct: 5, trials_total: 20, cue_level: 'tactile_cue',
    evidence: 'Five out of twenty today on the front-of-word R.',
    ai_interpretation: 'Client produced /r/ initial in 5 of 20 trials with tactile cueing.',
    confidence: 0.93,
  }),
  ev(2, {
    event_type: 'ATTEMPT', target: '/r/ final', trials_correct: 11, trials_total: 20,
    cue_level: 'verbal_cue',
    evidence: 'The R at the end of "car" is much easier for you. Eleven out of twenty.',
    ai_interpretation: 'Client produced /r/ final in 11 of 20 trials with verbal cueing.',
    confidence: 0.89,
  }),
  ev(2, {
    event_type: 'GENERALIZATION', target: '/r/ final',
    evidence: 'You did that one in a whole sentence without me reminding you.',
    ai_interpretation: 'Client carried /r/ final into connected speech without prompting.',
    confidence: 0.64,
    status: 'edited',
    clinician_edit: 'Carryover to sentence level for /r/ final only. Initial position still requires tactile support.',
  }),
  ev(2, {
    event_type: 'CUE', cue_level: 'tactile_cue',
    evidence: 'Fingers on the sides again. Feel the tongue pull back and up.',
    ai_interpretation: 'Tactile cueing repeated for tongue retraction on /r/ initial.',
    confidence: 0.84,
  }),
  ev(2, {
    event_type: 'RETRY',
    evidence: 'Close. Try that one more time and hold the R a little longer.',
    ai_interpretation: 'Clinician elicited a repeat trial with extended duration on /r/.',
    confidence: 0.79,
  }),

  // ── Session 3 · Jun 27 · 6/20 (30%) · visual_cue ────────────────────────────
  ev(3, {
    event_type: 'ATTEMPT', trials_correct: 6, trials_total: 20, cue_level: 'visual_cue',
    evidence: 'Six out of twenty. We faded the fingers today and used the mirror instead.',
    ai_interpretation: 'Client produced /r/ initial in 6 of 20 trials with visual cueing only.',
    confidence: 0.90,
  }),
  ev(3, {
    event_type: 'CUE', cue_level: 'visual_cue',
    evidence: 'Watch my mouth in the corner of your screen and match the shape.',
    ai_interpretation: 'Clinician faded to visual cueing using a mouth-shape model.',
    confidence: 0.87,
  }),
  ev(3, {
    event_type: 'CUE', cue_level: 'tactile_cue',
    evidence: 'Go back to the fingers for this next set, then we will drop them again.',
    ai_interpretation: 'Clinician briefly returned to tactile cueing before fading again.',
    confidence: 0.81,
  }),
  ev(3, {
    event_type: 'RETRY',
    evidence: 'One more on "rain" and then we switch.',
    ai_interpretation: 'Clinician elicited an additional trial on /r/ initial before changing stimuli.',
    confidence: 0.68,
  }),
  ev(3, {
    event_type: 'ERROR_PATTERN',
    evidence: 'When the word gets longer the R slips back to a W.',
    ai_interpretation: '/w/ substitution reappears as word length increases.',
    confidence: 0.83,
  }),
  ev(3, {
    event_type: 'HOME_PROGRAM_ASSIGNED',
    evidence: 'Ten cards a night, three nights this week. Mom can check them off.',
    ai_interpretation: 'Home program assigned: 10 trials per night, 3 nights per week.',
    confidence: 0.92,
  }),

  // ── Session 4 · Jul 4 · 6/20 (30%) · tactile_cue · streak opens ─────────────
  ev(4, {
    event_type: 'ATTEMPT', trials_correct: 6, trials_total: 20, cue_level: 'tactile_cue',
    evidence: 'Six again. We needed the fingers back for most of these.',
    ai_interpretation: 'Client produced /r/ initial in 6 of 20 trials; tactile cueing required throughout.',
    confidence: 0.89,
  }),
  ev(4, {
    event_type: 'CUE', cue_level: 'tactile_cue',
    evidence: 'Fingers on the sides. Hold it there while you say it.',
    ai_interpretation: 'Tactile cueing provided for the majority of trials.',
    confidence: 0.85,
  }),
  ev(4, {
    event_type: 'CUE', cue_level: 'model',
    evidence: 'Listen to me say it first, then you copy exactly what I did.',
    ai_interpretation: 'Clinician provided a full model prior to elicitation.',
    confidence: 0.86,
  }),
  ev(4, {
    event_type: 'QUESTION_UNRESOLVED',
    evidence: 'We still have not heard a clean R at the front without me helping.',
    ai_interpretation: 'No independent production of /r/ initial observed this session.',
    confidence: 0.94,
  }),
  ev(4, {
    event_type: 'ERROR_PATTERN',
    evidence: 'The tongue is going forward instead of back. That is the W creeping in.',
    ai_interpretation: 'Anterior tongue placement drives the /w/ substitution pattern.',
    confidence: 0.58,
    status: 'edited',
    clinician_edit: 'Lip rounding without tongue retraction. Placement, not a phonological process.',
  }),
  ev(4, {
    event_type: 'REINFORCEMENT',
    evidence: 'Plateaus are normal. This is the part where it feels slow and then it moves.',
    ai_interpretation: 'Clinician addressed motivation during a period of flat accuracy.',
    confidence: 0.70,
  }),

  // ── Session 5 · Jul 11 · 7/20 (35%) · visual_cue · unresolved (2) ───────────
  ev(5, {
    event_type: 'ATTEMPT', trials_correct: 7, trials_total: 20, cue_level: 'visual_cue',
    evidence: 'Seven out of twenty, and we did those with just the mirror.',
    ai_interpretation: 'Client produced /r/ initial in 7 of 20 trials with visual cueing.',
    confidence: 0.91,
  }),
  ev(5, {
    event_type: 'CUE', cue_level: 'visual_cue',
    evidence: 'Use the mirror. Watch what your own mouth does on the R.',
    ai_interpretation: 'Visual cueing via self-monitoring in a mirror.',
    confidence: 0.88,
  }),
  ev(5, {
    event_type: 'QUESTION_UNRESOLVED',
    evidence: 'Still nothing at the front of a word without a cue from me first.',
    ai_interpretation: 'No independent production of /r/ initial observed this session.',
    confidence: 0.93,
  }),
  ev(5, {
    event_type: 'RETRY',
    evidence: 'That was almost it. Same word, one more time.',
    ai_interpretation: 'Clinician elicited a repeat trial following a near-accurate production.',
    confidence: 0.75,
  }),
  ev(5, {
    event_type: 'REINFORCEMENT',
    evidence: 'Seven is your best yet. You heard the difference on that last one yourself.',
    ai_interpretation: 'Clinician reinforced emerging self-monitoring of /r/ accuracy.',
    confidence: 0.77,
  }),

  // ── Session 6 · Jul 18 · 6/20 (30%) · visual_cue · unresolved (3) ───────────
  ev(6, {
    event_type: 'ATTEMPT', trials_correct: 6, trials_total: 20, cue_level: 'visual_cue',
    evidence: 'Six today. A little down from last week but the cueing stayed light.',
    ai_interpretation: 'Client produced /r/ initial in 6 of 20 trials with visual cueing.',
    confidence: 0.90,
  }),
  ev(6, {
    event_type: 'CUE', cue_level: 'visual_cue',
    evidence: 'Mirror again. You know what to look for now.',
    ai_interpretation: 'Visual cueing maintained; tactile support not required.',
    confidence: 0.84,
  }),
  ev(6, {
    event_type: 'QUESTION_UNRESOLVED',
    evidence: 'Three weeks now without an independent R at the front of a word.',
    ai_interpretation: 'No independent production of /r/ initial observed this session.',
    confidence: 0.94,
  }),
  ev(6, {
    event_type: 'HOME_PROGRAM_ASSIGNED',
    evidence: 'Same cards, three nights. Mom logged two out of three last week.',
    ai_interpretation: 'Home program continued at 3 nights per week; 2 of 3 sessions logged by caregiver.',
    confidence: 0.87,
  }),
  ev(6, {
    event_type: 'QUESTION_UNRESOLVED', target: '/r/ blends',
    evidence: 'We have not touched the R blends yet. "Tree" and "green" are still unknown.',
    ai_interpretation: 'Accuracy for /r/ blends has not been probed; status unknown.',
    confidence: 0.62,
  }),
  ev(6, {
    event_type: 'ERROR_PATTERN',
    evidence: 'The R holds in a single word and falls apart in a sentence.',
    ai_interpretation: 'Accuracy degrades from word level to sentence level.',
    confidence: 0.80,
  }),
];
