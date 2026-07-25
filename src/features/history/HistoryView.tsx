export default function HistoryView() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-10 outline-none md:px-8 md:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Incident history</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Nothing is stored yet.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Ember does not save live video, replay activity, or incident records. A later milestone
          can add structured records only after the team defines consent, retention, and deletion.
        </p>

        <section
          aria-labelledby="empty-history-title"
          className="mt-10 rounded-2xl border border-divider bg-panel p-6 md:p-8"
        >
          <div
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full border-2 border-divider text-xl text-muted"
          >
            ○
          </div>
          <h2 id="empty-history-title" className="mt-5 text-2xl font-bold">
            No incident records
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-muted">
            Live preview tracks stop when you leave the scan, and replay frames clear with their
            source. Ember does not record, upload, save, or identify anyone in this milestone.
          </p>
          <a
            href="#scan"
            className="mt-7 inline-flex min-h-11 items-center rounded-md bg-text px-5 font-bold text-canvas outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            Return to scan
          </a>
        </section>
      </div>
    </main>
  );
}
