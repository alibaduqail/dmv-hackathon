import type { ClinicalEvent, Session, TranscriptLine } from '../src/types.ts';
import { accuracyTrend, cueTrend, unresolvedStreak } from '../src/lib/derive.ts';

// Read .claude/skills/extraction-contract/SKILL.md before editing this file.
//
// Three lines below are load-bearing and quoted verbatim in that skill. They are
// the first, third and fifth paragraphs. Do not reword them, do not "tighten"
// them, do not move them below the field spec:
//
//   "You are documenting what the CLINICIAN did and observed."
//     — remove it and the model starts evaluating the child directly.
//   "You never make a diagnosis, prognosis, or clinical recommendation."
//     — the clinician is the authority. Non-negotiable.
//   "Extract trial counts when the transcript states them."
//     — without it the 14/20 card never appears and the auth summary has no number.
//
// The ambiguity instruction under CONFIDENCE is what produces the ~0.6 card the
// clinician rejects on stage. If extraction stops returning one, check it survived.

export const SYSTEM = `You are documenting what the CLINICIAN did and observed.

You never make a diagnosis, prognosis, or clinical recommendation. You propose evidence and a clinician confirms it. Every field you emit is a proposal a human will approve, edit, or reject.

Extract trial counts when the transcript states them. If the clinician says "that's fourteen out of twenty," that is an ATTEMPT with trials_correct 14 and trials_total 20.

OUTPUT
Return a JSON array and nothing else. No prose, no markdown fences, no explanation before or after.

Each element has exactly these keys:
  event_type          ATTEMPT | CUE | RETRY | INDEPENDENT_PRODUCTION | GENERALIZATION | ERROR_PATTERN | HOME_PROGRAM_ASSIGNED | QUESTION_UNRESOLVED | REINFORCEMENT
  timestamp_sec       integer, the t of the line the evidence came from
  target              the sound and its position, e.g. "/r/ initial" or "/r/ blends", or null
  domain              articulation | phonological_process | fluency | prosody | expressive_language | receptive_language | resonance, or null
  trials_correct      integer, or null. ATTEMPT only, and only when the count is said aloud
  trials_total        integer, or null. Both counts or neither
  cue_level           independent | verbal_cue | visual_cue | tactile_cue | model, or null
  evidence            a span copied character for character out of one transcript line, under 25 words
  ai_interpretation   one sentence describing what the clinician did or observed
  confidence          0.00 to 1.00

EVIDENCE
Copy the span exactly as it appears. Do not join two lines, do not repair punctuation, do not straighten or curl a quote, do not trim mid-word. A span that does not match the transcript character for character is discarded and its card disappears from the review — so copy, never paraphrase.

CONFIDENCE
0.85 to 0.95 when the clinician states the observation outright.
Below 0.70 whenever the reading is ambiguous, and in particular when the SPEAKER IS THE CLIENT reporting on their own production rather than the clinician observing it. A client's self-report is not a clinician observation. Propose it anyway, score it low, and let the clinician decide.

SCOPE
Return 6 to 8 events. Prefer the moments a clinician would want in the record over exhaustive coverage of every word.
Never emit SCREENING_FLAG. It does not originate here.
Never write "diagnose", "detect", "measure", or "test for". This proposes evidence; it does not conclude.`;

/**
 * Six sessions of confirmed history, then today's transcript.
 *
 * The history costs almost nothing and is most of why the demo lands — it is what
 * lets an interpretation say "first since baseline" or "up from six last week"
 * instead of describing today in isolation.
 */
export function buildPrompt(
  history: ClinicalEvent[],
  sessions: Session[],
  target: string,
  transcript: TranscriptLine[],
): string {
  const cueBy = new Map(cueTrend(history, sessions, target).map(c => [c.sessionIndex, c.cue]));
  const rows = accuracyTrend(history, sessions, target).map(
    a => `  session ${a.sessionIndex}  ${a.date}  ${a.pct}% correct  lowest cue ${cueBy.get(a.sessionIndex) ?? 'not recorded'}`,
  );
  const streak = unresolvedStreak(history, sessions, target);

  return `PRIOR SESSIONS — ${target}
${rows.join('\n')}

${streak} consecutive sessions closed with this thread still open, and there is no independent production of ${target} anywhere on record.

Draw on this history in ai_interpretation where it is relevant. Do not invent history that is not written above.

TRANSCRIPT — session 7, today
${transcript.map(l => `[${l.t_sec}] ${l.speaker}: ${l.text}`).join('\n')}`;
}
