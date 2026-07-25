import { useStore } from '../../store.tsx';
import { confirmed } from '../../lib/events.ts';
import { accuracyTrend, cueTrend, unresolvedStreak } from '../../lib/derive.ts';
import { CURRENT_TARGET } from '../../fixtures/sessions.ts';

// Phase 1 replaces this with the six-week trend. Second dev owns this file.
// It reads the seam end to end on purpose — if this renders, the contract holds.
export default function RecordView() {
  const { events, sessions } = useStore();
  const accuracy = accuracyTrend(events, sessions, CURRENT_TARGET);
  const cues = cueTrend(events, sessions, CURRENT_TARGET);
  const streak = unresolvedStreak(events, sessions, CURRENT_TARGET);

  return (
    <main className="px-8 py-10">
      <h1 className="font-display text-4xl">Maya Ortiz</h1>
      <p className="mt-1 font-mono text-xs text-grey">
        {CURRENT_TARGET} · {sessions.length} sessions · {events.filter(confirmed).length} confirmed events
      </p>
      <dl className="mt-8 font-mono text-xs text-grey">
        <div>accuracyTrend → {accuracy.length} points</div>
        <div>cueTrend → {cues.length} points</div>
        <div>unresolvedStreak → {streak}</div>
      </dl>
      <p className="mt-8 max-w-md text-sm text-grey">
        Seam is live. Fixtures land in Phase 1 and these numbers fill in.
      </p>
    </main>
  );
}
