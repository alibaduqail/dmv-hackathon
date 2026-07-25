// npm run verify:fixtures — asserts the seven invariants in
// .claude/skills/seed-fixtures/SKILL.md. If one fails, THE FIXTURE IS WRONG.
// Never adjust derive.ts to make an assertion pass.
//
// Runs on node's type stripping — no ts-node, no tsx.

import { historicalEvents } from '../src/fixtures/events.ts';
import { sessions, CURRENT_SESSION_ID, CURRENT_TARGET } from '../src/fixtures/sessions.ts';
import { transcript } from '../src/fixtures/session-07-transcript.ts';
import { confirmed } from '../src/lib/events.ts';
import { unresolvedStreak } from '../src/lib/derive.ts';

const fails: string[] = [];
const check = (n: number, label: string, ok: boolean, detail = '') =>
  ok ? console.log(`  ok   ${n}. ${label}`)
     : fails.push(`${n}. ${label}${detail ? ` — ${detail}` : ''}`);

const history = sessions.filter(s => s.id !== CURRENT_SESSION_ID).sort((a, b) => a.index - b.index);
const evts = (sid: string) => historicalEvents.filter(e => e.session_id === sid);

check(1, `unresolvedStreak('${CURRENT_TARGET}') === 3`,
  unresolvedStreak(historicalEvents, sessions, CURRENT_TARGET) === 3,
  `got ${unresolvedStreak(historicalEvents, sessions, CURRENT_TARGET)}`);

check(2, 'every historical event confirmed with reviewed_at',
  historicalEvents.length > 0 && historicalEvents.every(e => confirmed(e) && e.reviewed_at));

check(3, 'only session 7 carries a transcript',
  history.every(s => s.transcript_id === null)
  && !!sessions.find(s => s.id === CURRENT_SESSION_ID)?.transcript_id);

const text = transcript.map(l => l.text).join('\n');
const orphans = historicalEvents
  .filter(e => e.session_id === CURRENT_SESSION_ID && e.evidence_type === 'transcript')
  .filter(e => !text.includes(e.evidence));
check(4, 'every session-7 evidence span appears verbatim in the transcript',
  orphans.length === 0, orphans.map(e => `"${e.evidence.slice(0, 40)}…"`).join(', '));

const counts = history.map(s => evts(s.id).length);
check(5, 'events per session are 4,5,6,6,5,6',
  counts.join() === '4,5,6,6,5,6', `got ${counts.join() || 'none'}`);

const blends = historicalEvents.filter(e => e.target === '/r/ blends' && e.event_type === 'QUESTION_UNRESOLVED');
check(6, 'exactly one open QUESTION_UNRESOLVED on /r/ blends survives into session 7',
  blends.length === 1
  && !historicalEvents.some(e => e.target === '/r/ blends' && e.event_type === 'INDEPENDENT_PRODUCTION'),
  `got ${blends.length}`);

const totals = [...new Set(historicalEvents.flatMap(e => e.trials_total ? [e.trials_total] : []))];
check(7, 'trial totals are 20 in every session',
  totals.length === 1 && totals[0] === 20, `got ${totals.join() || 'none'}`);

if (fails.length) {
  console.error(`\nFIXTURES INVALID — ${fails.length} of 7 failing:\n` + fails.map(f => `  ✗ ${f}`).join('\n'));
  process.exit(1);
}
console.log('\nall 7 invariants green');
