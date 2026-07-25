// POST /api/extract  {sessionId}  ->  200 {count, events, source}
//
// Read .claude/skills/extraction-contract/SKILL.md before editing.
//
// The one genuinely live thing on stage, so it is written to be unbreakable rather
// than clever: it NEVER returns 4xx or 5xx to the UI. Every failure — no key, bad
// JSON, a refusal, a 500 from upstream, too few events surviving — serves the cache.
//
// Vite's dev server does NOT serve this file. Run `vercel dev`, not `npm run dev`.

import type { ClinicalEvent, CueLevel, Domain, EventType } from '../src/types.ts';
import { historicalEvents } from '../src/fixtures/events.ts';
import { sessions, CURRENT_SESSION_ID, CURRENT_TARGET } from '../src/fixtures/sessions.ts';
import { transcript } from '../src/fixtures/session-07-transcript.ts';
import { SYSTEM, buildPrompt } from './prompt.ts';
import { RAW } from './cached-extraction.ts';

// SCREENING_FLAG IS DELIBERATELY ABSENT — validation rule 10. It originates only in
// the thermal panel and is rejected from the extractor unconditionally. Adding it
// here would let a model-authored screening claim reach a clinical artifact.
// Do not "complete" this list from types.ts.
const TYPES: EventType[] = [
  'ATTEMPT', 'CUE', 'RETRY', 'INDEPENDENT_PRODUCTION', 'GENERALIZATION',
  'ERROR_PATTERN', 'HOME_PROGRAM_ASSIGNED', 'QUESTION_UNRESOLVED', 'REINFORCEMENT',
];
const CUES: CueLevel[] = ['independent', 'verbal_cue', 'visual_cue', 'tactile_cue', 'model'];
const DOMAINS: Domain[] = [
  'articulation', 'phonological_process', 'fluency',
  'prosody', 'expressive_language', 'receptive_language', 'resonance',
];

/** Fewer than this surviving validation is a thin demo — serve the cache instead. */
export const MIN_EVENTS = 5;

const oneOf = <T extends string>(allowed: T[], v: unknown): T | null =>
  typeof v === 'string' && (allowed as string[]).includes(v) ? v as T : null;

const int = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/**
 * REJECT, NEVER REPAIR. Failures are dropped silently — a card that half-survives
 * is worse than one that never appears, because a clinician would have to catch it.
 * Unknown keys cannot leak through: every field is copied out by name.
 */
export function validate(
  raw: unknown, transcriptText: string, duration: number, sessionId: string,
): ClinicalEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: ClinicalEvent[] = [];

  for (const el of raw) {
    if (!el || typeof el !== 'object') continue;
    const o = el as Record<string, unknown>;

    // rules 3 + 10 — unknown type, or SCREENING_FLAG, drops the element
    const event_type = oneOf(TYPES, o.event_type);
    if (!event_type) continue;

    // rule 5 — evidence must appear verbatim. Scroll-sync is String.indexOf, and a
    // card that scrolls nowhere looks broken in front of judges.
    const evidence = typeof o.evidence === 'string' ? o.evidence : '';
    if (!evidence || !transcriptText.includes(evidence)) continue;

    // rule 6 — both counts or neither, and correct cannot exceed total
    const trials_correct = int(o.trials_correct);
    const trials_total = int(o.trials_total);
    if ((trials_correct === null) !== (trials_total === null)) continue;
    if (trials_total !== null && trials_correct !== null
      && (trials_total <= 0 || trials_correct < 0 || trials_correct > trials_total)) continue;

    const t = int(o.timestamp_sec);
    const confidence = typeof o.confidence === 'number' && Number.isFinite(o.confidence)
      ? o.confidence : 0;

    out.push({
      id: `prop-${String(out.length + 1).padStart(2, '0')}`,
      session_id: sessionId,
      event_type,
      evidence_type: 'transcript',
      timestamp_sec: t === null ? null : clamp(t, 0, duration),   // rule 7
      target: typeof o.target === 'string' && o.target ? o.target : null,
      domain: oneOf(DOMAINS, o.domain),        // rule 4 — invalid becomes null, element survives
      trials_correct,
      trials_total,
      cue_level: oneOf(CUES, o.cue_level),     // rule 4
      evidence,
      thermal_capture_id: null,
      ai_interpretation: typeof o.ai_interpretation === 'string' ? o.ai_interpretation : '',
      confidence: clamp(confidence, 0, 1),     // rule 7
      status: 'proposed',
      clinician_edit: null,
      reviewed_at: null,
    });
  }

  return out;
}

/** rule 1 — models wrap output in fences regardless of instruction. */
const stripFences = (s: string) =>
  s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

async function callModel(prompt: string): Promise<unknown> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-5',
      // Thinking is on by default on Opus 5 and max_tokens caps thinking + text
      // together, so this is roomier than the ~1.5k of JSON we actually want back.
      max_tokens: 8000,
      // ponytail: effort is the calibration knob. `low` keeps the on-stage wait short
      // on a well-specified extraction; raise it if interpretations start going vague
      // or the 0.6 card stops appearing. No temperature — Opus 5 rejects it with a 400.
      output_config: { effort: 'low' },
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);

  const body = await r.json() as { content?: { type: string; text?: string }[] };
  // Thinking blocks ride alongside the answer — take the text ones. If the model
  // refused, this is '' and JSON.parse throws, which serves the cache. rule 2.
  const text = (body.content ?? []).filter(b => b.type === 'text').map(b => b.text ?? '').join('');
  return JSON.parse(stripFences(text));
}

// ponytail: local request/response shapes instead of @vercel/node. Two fields used,
// and package.json is frozen without asking.
type Req = { body?: unknown };
type Res = { status(code: number): Res; json(body: unknown): void };

export default async function handler(req: Req, res: Res) {
  const sessionId = (req.body as { sessionId?: string } | undefined)?.sessionId ?? CURRENT_SESSION_ID;
  const text = transcript.map(l => l.text).join('\n');
  const duration = transcript[transcript.length - 1].t_sec;

  const serve = (events: ClinicalEvent[], source: 'live' | 'cached') =>
    res.status(200).json({ count: events.length, events, source });
  const cache = () => serve(validate(RAW, text, duration, sessionId), 'cached');

  if (process.env.USE_CACHED_EXTRACTION === '1' || !process.env.ANTHROPIC_API_KEY) return cache();

  try {
    const prompt = buildPrompt(historicalEvents, sessions, CURRENT_TARGET, transcript);
    const events = validate(await callModel(prompt), text, duration, sessionId);
    // rule 9 — four cards is a thin demo, and a thin demo is worse than a canned one
    return events.length >= MIN_EVENTS ? serve(events, 'live') : cache();
  } catch (err) {
    console.error('[extract] serving cache:', err);
    return cache();
  }
}
