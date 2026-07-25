import { useEffect, useState } from 'react';
import { StoreProvider } from './store.tsx';
import RecordView from './features/record/RecordView.tsx';
import ReviewView from './features/review/ReviewView.tsx';
import OutputsView from './features/outputs/OutputsView.tsx';
import ThermalView from './features/thermal/ThermalView.tsx';

// ponytail: hash routing instead of react-router. Four views, no deep links.
// Survives a reload and you can type #thermal if something goes sideways on stage.
const VIEWS = {
  record: RecordView,
  review: ReviewView,
  outputs: OutputsView,
  thermal: ThermalView,
} as const;

type ViewName = keyof typeof VIEWS;

const current = (): ViewName => {
  const h = location.hash.slice(1) as ViewName;
  return h in VIEWS ? h : 'record';   // the demo opens on the record
};

export default function App() {
  const [view, setView] = useState(current);

  useEffect(() => {
    const onHash = () => setView(current());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const View = VIEWS[view];

  return (
    <StoreProvider>
      <nav className="flex gap-5 border-b border-hairline px-8 py-3 font-mono text-xs lowercase text-grey">
        {(Object.keys(VIEWS) as ViewName[]).map(name => (
          <a key={name} href={`#${name}`} className={view === name ? 'text-ink' : ''}>
            {name}
          </a>
        ))}
      </nav>
      <View />
    </StoreProvider>
  );
}
