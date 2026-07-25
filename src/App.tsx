import { useEffect, useState } from 'react';
import HistoryView from './features/history/HistoryView.tsx';
import ScanView from './features/scan/ScanView.tsx';

const VIEWS = {
  scan: ScanView,
  history: HistoryView,
} as const;

type ViewName = keyof typeof VIEWS;

const currentView = (): ViewName => {
  const candidate = location.hash.slice(1);
  return candidate === 'scan' || candidate === 'history' ? candidate : 'scan';
};

export default function App() {
  const [view, setView] = useState(currentView);

  useEffect(() => {
    const onHashChange = () => setView(currentView());
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, []);

  const View = VIEWS[view];

  return (
    <div className="min-h-screen bg-canvas text-text">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-focus px-4 py-3 font-semibold text-canvas transition-transform focus:translate-y-0"
      >
        Skip to main content
      </button>

      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a
            href="#scan"
            className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            aria-label="Ember scan home"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full border-2 border-accent text-xl text-accent"
            >
              ◉
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight">Ember</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Thermal companion
              </span>
            </span>
          </a>

          <nav aria-label="Primary navigation" className="flex items-center gap-2">
            {(Object.keys(VIEWS) as ViewName[]).map(name => (
              <a
                key={name}
                href={`#${name}`}
                aria-current={view === name ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-bold capitalize outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  view === name
                    ? 'bg-text text-canvas'
                    : 'text-muted hover:bg-panel-strong hover:text-text'
                }`}
              >
                {name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <View />
    </div>
  );
}
