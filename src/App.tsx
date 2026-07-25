import { useEffect, useState } from 'react';
import HistoryView from './features/history/HistoryView.tsx';
import ScanView from './features/scan/ScanView.tsx';

const VIEWS = {
  scan: ScanView,
  history: HistoryView,
} as const;

type ViewName = keyof typeof VIEWS;

const VIEW_TITLES: Record<ViewName, string> = {
  scan: 'Scan · Ember',
  history: 'History · Ember',
};

const currentView = (): ViewName => {
  const candidate = location.hash.slice(1);
  return candidate === 'scan' || candidate === 'history' ? candidate : 'scan';
};

export default function App() {
  const [view, setView] = useState(currentView);
  const [navigationCount, setNavigationCount] = useState(0);

  useEffect(() => {
    const onHashChange = () => {
      setView(currentView());
      setNavigationCount(count => count + 1);
    };
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = VIEW_TITLES[view];
    if (navigationCount > 0) document.getElementById('main')?.focus();
  }, [navigationCount, view]);

  const View = VIEWS[view];

  return (
    <div className="min-h-screen bg-canvas text-text">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="fixed left-4 top-4 z-50 -translate-y-24 bg-focus px-4 py-3 font-bold uppercase tracking-wider text-canvas transition-transform focus:translate-y-0"
      >
        Skip to main content
      </button>

      <header className="border-b-2 border-line bg-panel">
        <div className="mx-auto flex max-w-[92rem] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
          <a
            href="#scan"
            className="flex min-h-11 items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label="Ember scan home"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center border-2 border-accent text-lg text-accent"
            >
              ◉
            </span>
            <span>
              <span className="block text-lg font-bold uppercase tracking-[0.2em]">Ember</span>
              <span className="gutter block">Thermal companion</span>
            </span>
          </a>

          {/* Tabs share one rule instead of floating as separate pills. */}
          <nav aria-label="Primary navigation" className="flex items-center gap-px bg-line">
            {(Object.keys(VIEWS) as ViewName[]).map(name => (
              <a
                key={name}
                href={`#${name}`}
                aria-current={view === name ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center px-5 text-xs font-bold uppercase tracking-[0.18em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
                  view === name
                    ? 'bg-accent text-canvas'
                    : 'bg-panel text-muted hover:bg-panel-strong hover:text-text'
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
