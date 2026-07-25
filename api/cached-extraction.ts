// THE OFFLINE PATH. AGENTS.md non-negotiable #6: USE_CACHED_EXTRACTION=1 must run
// the full demo with the network unplugged. This file is the entire reason that works.
//
// It holds RAW MODEL OUTPUT, not finished events — extract.ts runs it through the
// same validate() the live path uses. One code path, so a cache that drifts out of
// contract fails `npm run verify:fixtures` instead of failing on stage.
//
// ponytail: a .ts module, not the cached-extraction.json named in ARCHITECTURE.md.
// A JSON import needs `with { type: 'json' }` plus resolveJsonModule and has to
// survive Vercel's bundler; a module needs neither and tsc checks it. Logged in
// DECISIONS.md. To refresh after a live run: replace the array below wholesale.
//
// REFRESH THIS WHENEVER prompt.ts CHANGES. A stale cache that disagrees with live
// is worse than no cache — you find out at 17:20.
//
// PROVENANCE: hand-built against the four plants documented in the header of
// src/fixtures/session-07-transcript.ts, because ANTHROPIC_API_KEY was not yet
// available. Every evidence span is asserted verbatim by verify:fixtures check 11.
// Overwrite with a known-good live run as soon as the key lands.

export const RAW: unknown[] = [
  {
    event_type: 'CUE',
    timestamp_sec: 65,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: 'visual_cue',
    evidence: "That was a W. Look in the mirror and pull the sides of your tongue back and up.",
    ai_interpretation: 'Clinician identified a W substitution and gave a visual cue with placement instruction, the support level carried over from session 6.',
    confidence: 0.92,
  },
  {
    event_type: 'CUE',
    timestamp_sec: 157,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: 'verbal_cue',
    evidence: "Nice. Two in a row with only a verbal reminder.",
    ai_interpretation: 'Clinician removed the mirror and observed two consecutive correct productions on verbal cue alone, a lower support level than any prior session.',
    confidence: 0.89,
  },
  {
    event_type: 'ERROR_PATTERN',
    timestamp_sec: 316,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: null,
    evidence: "Sentences are harder. That's normal. Back to single words for a minute.",
    ai_interpretation: 'Clinician observed the target breaking down at sentence level and returned to single words.',
    confidence: 0.81,
  },
  {
    event_type: 'INDEPENDENT_PRODUCTION',
    timestamp_sec: 452,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: 'independent',
    evidence: "That was a clean R at the front of the word with no cue from me at all.",
    ai_interpretation: 'Clinician observed an unprompted correct production of /r/ initial with no mirror and no verbal cue, the first on record since baseline.',
    confidence: 0.94,
  },
  {
    // THE REJECT. The speaker is the CLIENT, so this is a self-report and not a
    // clinician observation. It is wrong for a reason a clinician can say out loud,
    // which is what makes the review step read as necessary rather than ceremonial.
    // Do not raise this confidence and do not delete this card.
    event_type: 'ATTEMPT',
    timestamp_sec: 628,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: 'independent',
    evidence: "I think I got that one right. It felt scratchy.",
    ai_interpretation: 'A correct independent production during the probe set, reported at the time it happened.',
    confidence: 0.58,
  },
  {
    event_type: 'ATTEMPT',
    timestamp_sec: 742,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: 14,
    trials_total: 20,
    cue_level: 'verbal_cue',
    evidence: "That's fourteen out of twenty. Last week you were at six.",
    ai_interpretation: 'Clinician scored 14 of 20 trials correct on the probe set, up from 6 of 20 in session 6.',
    confidence: 0.93,
  },
  {
    event_type: 'QUESTION_UNRESOLVED',
    timestamp_sec: 845,
    target: '/r/ blends',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: null,
    evidence: "Blends are still an open question. We'll probe them properly next week.",
    ai_interpretation: 'Clinician probed /r/ blends, judged the evidence inconclusive, and left the thread open for next session.',
    confidence: 0.90,
  },
  {
    event_type: 'HOME_PROGRAM_ASSIGNED',
    timestamp_sec: 920,
    target: '/r/ initial',
    domain: 'articulation',
    trials_correct: null,
    trials_total: null,
    cue_level: null,
    evidence: "For home this week, same ten cards, but add three blend words at the end.",
    ai_interpretation: 'Clinician assigned the existing ten-card set plus three blend words, three nights, with the mirror.',
    confidence: 0.91,
  },
];
