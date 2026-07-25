import { useStore } from '../../store.tsx';
import { confirmed } from '../../lib/events.ts';
import { accuracyTrend, cueTrend, unresolvedStreak } from '../../lib/derive.ts';
import { CURRENT_TARGET, CLIENT } from '../../fixtures/sessions.ts';
import AccuracyTrend from './AccuracyTrend.tsx';
import CueTrend from './CueTrend.tsx';

// The demo opens here. Six-week accuracy + cue trend from fixtures, streak
// visible before any review happens. Everything below reads through useStore()
// and derive.ts — no second implementation of a trend or a streak.
export default function RecordView() {
  const { events, sessions } = useStore();
  const accuracy = accuracyTrend(events, sessions, CURRENT_TARGET);
  const cues = cueTrend(events, sessions, CURRENT_TARGET);
  const streak = unresolvedStreak(events, sessions, CURRENT_TARGET);

  const accuracyBySession = new Map(accuracy.map(p => [p.sessionIndex, p]));
  const cueBySession = new Map(cues.map(p => [p.sessionIndex, p]));

  return (
    <main className="px-8 py-10">
      <h1 className="font-display text-4xl text-ink">{CLIENT.name}</h1>
      <p className="mt-1 font-mono text-xs text-grey">
        age {CLIENT.age} &middot; {CURRENT_TARGET} &middot; {sessions.length} sessions &middot;{' '}
        {events.filter(confirmed).length} confirmed events
      </p>

      <div className="mt-6 max-w-xl border border-hairline p-4">
        <p className="font-mono text-3xl text-ink">{streak}</p>
        <p className="mt-1 font-body text-sm text-grey">
          consecutive sessions unresolved &middot; {CURRENT_TARGET} &middot; no confirmed independent
          production yet
        </p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <AccuracyTrend points={accuracy} target={CURRENT_TARGET} />
        <CueTrend points={cues} target={CURRENT_TARGET} />
      </div>

      <table className="mt-10 w-full max-w-2xl border-collapse font-mono text-xs">
        <thead>
          <tr className="border-b border-hairline text-left text-grey">
            <th className="py-2 pr-4 font-normal">session</th>
            <th className="py-2 pr-4 font-normal">date</th>
            <th className="py-2 pr-4 font-normal">status</th>
            <th className="py-2 pr-4 font-normal">accuracy</th>
            <th className="py-2 font-normal">cue level</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id} className="border-b border-hairline text-ink">
              <td className="py-2 pr-4">{s.index}</td>
              <td className="py-2 pr-4">{s.date}</td>
              <td className="py-2 pr-4 text-grey">{s.status}</td>
              <td className="py-2 pr-4">
                {accuracyBySession.has(s.index) ? `${accuracyBySession.get(s.index)!.pct}%` : '—'}
              </td>
              <td className="py-2">{cueBySession.get(s.index)?.cue ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
