import { useEffect, useMemo, useState } from 'react';
import { emberReplayManifest } from '../../fixtures/replay.ts';
import { ReplayThermalSource } from '../../lib/thermal-source.ts';
import type { SourceStatus, ThermalFrame } from '../../types.ts';

const STATUS: Record<SourceStatus, { symbol: string; title: string; detail: string; tone: string }> = {
  idle: {
    symbol: '○',
    title: 'Replay ready',
    detail: 'Start the simulated sequence when you are ready.',
    tone: 'text-muted',
  },
  connecting: {
    symbol: '…',
    title: 'Preparing replay',
    detail: 'Loading the first simulated frame.',
    tone: 'text-caution',
  },
  streaming: {
    symbol: '▶',
    title: 'Replay running',
    detail: 'Simulated frames are advancing in order.',
    tone: 'text-accent',
  },
  paused: {
    symbol: 'Ⅱ',
    title: 'Replay paused',
    detail: 'The current frame will remain visible until you resume or stop.',
    tone: 'text-caution',
  },
  ended: {
    symbol: '✓',
    title: 'Replay complete',
    detail: 'Restart to run the same deterministic sequence again.',
    tone: 'text-accent',
  },
  error: {
    symbol: '!',
    title: 'Replay unavailable',
    detail: 'Stop the source, then restart the replay.',
    tone: 'text-danger',
  },
};

export default function ScanView() {
  const source = useMemo(() => new ReplayThermalSource(emberReplayManifest), []);
  const [status, setStatus] = useState<SourceStatus>('idle');
  const [frame, setFrame] = useState<ThermalFrame | null>(null);
  const statusCopy = STATUS[status];

  useEffect(() => () => source.stop(), [source]);

  const start = () => {
    setFrame(null);
    source.start(setFrame, setStatus);
  };

  const stop = () => {
    source.stop();
    setFrame(null);
  };

  const frameNumber = frame ? frame.sequence + 1 : 0;
  const frameCount = emberReplayManifest.frames.length;

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-8 outline-none md:px-8 md:py-12">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.75fr)]">
        <section aria-labelledby="scan-title">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">
            Handheld thermal companion
          </p>
          <h1 id="scan-title" className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Point toward heat you cannot see.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            This foundation proves Ember’s accessible controls and thermal-source seam. It does not
            classify replay pixels, provide spoken guidance, or promise that a surface is safe to
            touch.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <p className="inline-flex min-h-11 items-center gap-3 font-bold text-caution">
                <span aria-hidden="true" className="text-xl">◆</span>
                {emberReplayManifest.provenance.label}
              </p>
              <p className="font-mono text-sm text-muted">
                {frame ? `Frame ${frameNumber} of ${frameCount}` : `${frameCount} frames · 160 × 120`}
              </p>
            </div>

            <figure className="relative grid aspect-[4/3] place-items-center bg-black">
              {frame ? (
                <img
                  key={frame.id}
                  src={frame.displayUrl}
                  width={frame.width}
                  height={frame.height}
                  alt={`Simulated thermal replay frame ${frameNumber} of ${frameCount}. A bright region moves across a dark field. No assessment is produced from this image.`}
                  className="h-full w-full object-contain [image-rendering:pixelated]"
                />
              ) : (
                <div className="max-w-sm px-8 text-center">
                  <span aria-hidden="true" className="text-6xl text-line">◎</span>
                  <p className="mt-5 text-xl font-bold">No frame in memory</p>
                  <p className="mt-2 leading-7 text-muted">
                    Start the demo replay to exercise the source lifecycle.
                  </p>
                </div>
              )}

              {frame && (
                <span className="absolute bottom-3 left-3 rounded-md border border-caution bg-canvas/95 px-3 py-2 text-xs font-bold uppercase tracking-wider text-caution">
                  Demo replay — not live
                </span>
              )}
            </figure>

            <div className="border-t border-line px-4 py-4 md:px-5">
              <label htmlFor="replay-progress" className="flex justify-between gap-4 text-sm font-bold">
                <span>Replay progress</span>
                <span className="font-mono text-muted">{frameNumber} / {frameCount}</span>
              </label>
              <progress
                id="replay-progress"
                value={frameNumber}
                max={frameCount}
                className="mt-3 h-2 w-full overflow-hidden rounded-full accent-accent"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section aria-labelledby="source-status-title" className="rounded-2xl border border-line bg-panel p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Source status</p>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-4 flex items-start gap-4"
            >
              <span aria-hidden="true" className={`text-3xl font-bold ${statusCopy.tone}`}>
                {statusCopy.symbol}
              </span>
              <div>
                <h2 id="source-status-title" className="text-xl font-bold">{statusCopy.title}</h2>
                <p className="mt-1 leading-6 text-muted">{statusCopy.detail}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="controls-title" className="rounded-2xl border border-line bg-panel p-5 md:p-6">
            <h2 id="controls-title" className="text-xl font-bold">Replay controls</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={start}
                disabled={status === 'connecting' || status === 'streaming' || status === 'paused'}
                className="min-h-12 rounded-md bg-accent px-4 font-bold text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:bg-line disabled:text-muted"
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => source.pause()}
                disabled={status !== 'streaming'}
                className="min-h-12 rounded-md border border-line bg-panel-strong px-4 font-bold outline-none hover:border-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:text-muted disabled:opacity-55"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => source.resume()}
                disabled={status !== 'paused'}
                className="min-h-12 rounded-md border border-line bg-panel-strong px-4 font-bold outline-none hover:border-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:text-muted disabled:opacity-55"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={start}
                disabled={status === 'connecting'}
                className="min-h-12 rounded-md border border-line bg-panel-strong px-4 font-bold outline-none hover:border-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:text-muted disabled:opacity-55"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={stop}
                disabled={status === 'idle'}
                className="col-span-2 min-h-12 rounded-md border border-danger px-4 font-bold text-danger outline-none hover:bg-danger hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:border-line disabled:text-muted disabled:opacity-55"
              >
                Stop and clear frame
              </button>
            </div>
          </section>

          <section aria-labelledby="assessment-title" className="rounded-2xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="text-3xl font-bold text-muted">—</span>
              <div>
                <h2 id="assessment-title" className="text-xl font-bold">No current assessment</h2>
                <p className="mt-2 leading-6 text-muted">
                  PNG colors are for replaying the interface only. A future deterministic pipeline
                  will assess radiometric values from the PureThermal bridge.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
