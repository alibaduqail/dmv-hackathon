import type { ClinicalEvent, CueLevel, Session } from '../types.ts';
import { confirmed } from './events.ts';

/** index 0 = least support. Lower index is progress. */
export const CUE_ORDER: CueLevel[] = [
  'independent', 'verbal_cue', 'visual_cue', 'tactile_cue', 'model',
];

const byIndex = (s: Session[]) => [...s].sort((a, b) => a.index - b.index);

const forSession = (events: ClinicalEvent[], sessionId: string, target: string) =>
  events.filter(e => confirmed(e) && e.session_id === sessionId && e.target === target);

export function accuracyTrend(
  events: ClinicalEvent[], sessions: Session[], target: string,
): { sessionIndex: number; date: string; pct: number }[] {
  return byIndex(sessions).flatMap(s => {
    const attempts = forSession(events, s.id, target)
      .filter(e => e.event_type === 'ATTEMPT' && e.trials_total);
    if (!attempts.length) return [];
    const correct = attempts.reduce((n, e) => n + (e.trials_correct ?? 0), 0);
    const total = attempts.reduce((n, e) => n + (e.trials_total ?? 0), 0);
    return [{ sessionIndex: s.index, date: s.date, pct: Math.round((correct / total) * 100) }];
  });
}

/** Lowest cue level (least support) reached in each session. */
export function cueTrend(
  events: ClinicalEvent[], sessions: Session[], target: string,
): { sessionIndex: number; date: string; cue: CueLevel }[] {
  return byIndex(sessions).flatMap(s => {
    const ranks = forSession(events, s.id, target)
      .flatMap(e => (e.cue_level ? [CUE_ORDER.indexOf(e.cue_level)] : []));
    if (!ranks.length) return [];
    return [{ sessionIndex: s.index, date: s.date, cue: CUE_ORDER[Math.min(...ranks)] }];
  });
}

/**
 * Consecutive most-recent sessions carrying an open QUESTION_UNRESOLVED for the target.
 *
 * SCHEMA.md words this as "sessions with no INDEPENDENT_PRODUCTION", but read
 * literally that counts sessions 1-6 and returns 6, which contradicts the
 * seed-fixtures invariant of 3. The clinician logs QUESTION_UNRESOLVED when a
 * thread stays open, so that event is the signal. Sessions with no confirmed
 * events for the target (session 7 pre-review) are skipped, not counted.
 */
export function unresolvedStreak(
  events: ClinicalEvent[], sessions: Session[], target: string,
): number {
  let streak = 0;
  for (const s of byIndex(sessions).reverse()) {
    const own = forSession(events, s.id, target);
    if (!own.length) continue;
    if (!own.some(e => e.event_type === 'QUESTION_UNRESOLVED')) break;
    streak++;
  }
  return streak;
}

export function isResolved(
  events: ClinicalEvent[], sessionId: string, target: string,
): boolean {
  return forSession(events, sessionId, target)
    .some(e => e.event_type === 'INDEPENDENT_PRODUCTION');
}
