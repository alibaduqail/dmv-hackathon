import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Artifact, ClinicalEvent, EventStatus, Session, ThermalCapture, TranscriptLine } from './types.ts';
import { historicalEvents } from './fixtures/events.ts';
import { sessions as fixtureSessions } from './fixtures/sessions.ts';
import { transcript as fixtureTranscript } from './fixtures/session-07-transcript.ts';
import { captures as fixtureCaptures } from './fixtures/thermal.ts';

export interface Store {
  sessions: Session[];
  events: ClinicalEvent[];        // all statuses — filter with confirmed()
  captures: ThermalCapture[];
  transcript: TranscriptLine[];
  artifacts: Artifact[];
  addProposed(events: ClinicalEvent[]): void;
  setStatus(id: string, status: EventStatus, clinicianEdit?: string): void;
  setArtifact(a: Artifact): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ClinicalEvent[]>(historicalEvents);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const value = useMemo<Store>(() => ({
    sessions: fixtureSessions,
    captures: fixtureCaptures,
    transcript: fixtureTranscript,
    events,
    artifacts,

    addProposed: incoming => setEvents(prev => [...prev, ...incoming]),

    setStatus: (id, status, clinicianEdit) => setEvents(prev => prev.map(e =>
      e.id === id
        ? { ...e, status, clinician_edit: clinicianEdit ?? null, reviewed_at: new Date().toISOString() }
        : e,
    )),
    // ponytail: Supabase write-through goes here once the project exists (Phase 2).
    // Fire-and-forget, errors swallowed — no render path may ever await the network.

    setArtifact: a => setArtifacts(prev => [
      ...prev.filter(x => !(x.kind === a.kind && x.lang === a.lang)), a,
    ]),
  }), [events, artifacts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
