import { useState } from 'react';
import { useStore } from '../../store.tsx';
import { confirmed } from '../../lib/events.ts';
import type { ArtifactKind } from '../../types.ts';

const TABS: { kind: ArtifactKind; label: string }[] = [
  { kind: 'soap_note', label: 'SOAP note' },
  { kind: 'home_program', label: 'Home program' },
  { kind: 'next_session_plan', label: 'Next session plan' },
  { kind: 'auth_summary', label: 'Authorization summary' },
];

const EMPTY_COPY = 'Not generated yet — this pane fills in once the session is reviewed and confirmed.';

// Phase 2 shell: four panes + tab switch + empty states. Generation is Phase 3.
export default function OutputsView() {
  const { events, artifacts } = useStore();
  const [tab, setTab] = useState<ArtifactKind>('soap_note');

  const confirmedCount = events.filter(confirmed).length;
  const artifact = artifacts.find(a => a.kind === tab && a.lang === 'en');

  return (
    <main className="px-8 py-10">
      <h1 className="font-display text-4xl">Artifacts</h1>
      <p className="mt-1 font-mono text-xs text-grey">{confirmedCount} confirmed events</p>

      <nav className="mt-8 flex gap-5 border-b border-hairline pb-3 font-mono text-xs lowercase text-grey">
        {TABS.map(t => (
          <button key={t.kind} onClick={() => setTab(t.kind)} className={tab === t.kind ? 'text-ink' : ''}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 max-w-2xl">
        {artifact
          ? <p className="whitespace-pre-wrap text-sm text-ink">{artifact.body}</p>
          : <p className="text-sm text-grey">{EMPTY_COPY}</p>}
      </div>
    </main>
  );
}
