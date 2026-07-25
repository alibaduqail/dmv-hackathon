export default function HistoryView() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[92rem] px-4 py-6 outline-none md:px-8 md:py-10">
      <div className="max-w-3xl">
        <section aria-labelledby="history-title" className="border-b-2 border-line pb-5">
          <p className="gutter">Incident history</p>
          <h1 id="history-title" className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
            Nothing is stored yet.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Ember does not save live video, replay activity, or incident records. A later milestone
            can add structured records only after the team defines consent, retention, and deletion.
          </p>
        </section>

        <section aria-labelledby="empty-history-title" className="mt-6 border border-line bg-panel">
          <div className="grid grid-cols-[3.5rem_1fr] items-center gap-x-3 border-b border-divider px-3 py-2">
            <span className="gutter">Log</span>
            <span className="readout text-xs text-muted">000 RECORDS · 000 FRAMES RETAINED</span>
          </div>
          <div className="px-4 py-6 md:px-6 md:py-8">
            <h2 id="empty-history-title" className="text-lg font-bold uppercase tracking-wide">
              No incident records
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              Live preview tracks stop when you leave the scan, and replay frames clear with their
              source. Ember does not record, upload, save, or identify anyone in this milestone.
            </p>
            <a
              href="#scan"
              className="mt-6 inline-flex min-h-12 items-center bg-accent px-5 font-bold uppercase tracking-wider text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Return to scan
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
