import type { Session } from '../types.ts';

// FROZEN AT 11:00. Read .claude/skills/seed-fixtures/SKILL.md before changing a row.
// Six Saturdays of history. Session 7 is today — transcript populated, zero events,
// because extraction proposes them live on stage.
//
// Sessions 1-6 carry transcript_id null on purpose: we never claim to have stored
// six weeks of audio. Only the confirmed evidence spans survive.

export const sessions: Session[] = [
  { id: 'session-01', index: 1, date: '2026-06-13', status: 'complete', transcript_id: null },
  { id: 'session-02', index: 2, date: '2026-06-20', status: 'complete', transcript_id: null },
  { id: 'session-03', index: 3, date: '2026-06-27', status: 'complete', transcript_id: null },
  { id: 'session-04', index: 4, date: '2026-07-04', status: 'complete', transcript_id: null },
  { id: 'session-05', index: 5, date: '2026-07-11', status: 'complete', transcript_id: null },
  { id: 'session-06', index: 6, date: '2026-07-18', status: 'complete', transcript_id: null },
  { id: 'session-07', index: 7, date: '2026-07-25', status: 'pending', transcript_id: 'transcript-07' },
];

export const CURRENT_SESSION_ID = 'session-07';
export const CURRENT_TARGET = '/r/ initial';

/** The open thread that survives past the headline one closing. */
export const SECONDARY_TARGET = '/r/ blends';

export const CLIENT = { name: 'Maya Ortiz', age: 8 };
export const CLINICIAN = { name: 'Dana Whitfield', initials: 'DW' };
export const CAREGIVER = { name: 'Rosa Ortiz', language: 'es' as const };
