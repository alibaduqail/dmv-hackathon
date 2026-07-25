import type { SourceStatus, UvcPreviewPhase } from '../../types.ts';
import { usePreviewSession } from './usePreviewSession.ts';

interface StatusCopy {
  symbol: string;
  title: string;
  detail: string;
  tone: string;
}

const REPLAY_STATUS: Record<SourceStatus, StatusCopy> = {
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
    detail: 'The current simulated frame remains visible until you resume or stop.',
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

const LIVE_STATUS: Record<UvcPreviewPhase, StatusCopy> = {
  'authorization-required': {
    symbol: '○',
    title: 'Camera authorization required',
    detail: 'Authorize camera names, then choose the intended PureThermal input.',
    tone: 'text-muted',
  },
  authorizing: {
    symbol: '…',
    title: 'Authorizing cameras',
    detail: 'A temporary video stream is being opened and stopped to reveal device names.',
    tone: 'text-caution',
  },
  ready: {
    symbol: '✓',
    title: 'Camera choices ready',
    detail: 'Choose the intended PureThermal input, then start the display-only preview.',
    tone: 'text-accent',
  },
  acquiring: {
    symbol: '…',
    title: 'Opening selected preview',
    detail: 'Ember is requesting only the operator-selected video input.',
    tone: 'text-caution',
  },
  'awaiting-playback': {
    symbol: '…',
    title: 'Verifying playback',
    detail: 'The exact selected input matched. Waiting for the local video element to play.',
    tone: 'text-caution',
  },
  streaming: {
    symbol: '▶',
    title: 'Live preview playing',
    detail: 'Local display video is active. No temperature or safety assessment is produced.',
    tone: 'text-accent',
  },
  paused: {
    symbol: 'Ⅱ',
    title: 'Live preview paused',
    detail: 'All video tracks are stopped and the viewport is clear. Resume to reacquire.',
    tone: 'text-caution',
  },
  error: {
    symbol: '!',
    title: 'Live preview unavailable',
    detail: 'Review the error below and use its explicit Retry action.',
    tone: 'text-danger',
  },
};

const PREVIEW_ERRORS = {
  'unsupported-context': {
    title: 'Camera access is unsupported here',
    detail: 'Open Ember on localhost or another secure browser context, then retry authorization.',
  },
  'permission-denied': {
    title: 'Camera permission was denied',
    detail: 'Allow camera access for this local site, then retry authorization.',
  },
  'no-matching-device': {
    title: 'PureThermal input not found',
    detail: 'Reconnect the PureThermal device and retry. Ember will not substitute a built-in camera.',
  },
  'ambiguous-device': {
    title: 'PureThermal inputs are ambiguous',
    detail: 'More than one input has the same label. Disconnect extras, then retry authorization.',
  },
  'device-in-use': {
    title: 'Selected input is in use',
    detail: 'Close another app using the PureThermal input, then retry the preview.',
  },
  'active-device-mismatch': {
    title: 'Active input did not match',
    detail: 'The browser opened a different input than the operator selected. Reauthorize cameras.',
  },
  'playback-failed': {
    title: 'Local video did not play',
    detail: 'The selected stream was stopped and cleared. Retry the preview.',
  },
  'device-disconnected': {
    title: 'PureThermal input disconnected',
    detail: 'The preview and all remaining tracks were cleared. Reconnect, then retry authorization.',
  },
  'authorization-interrupted': {
    title: 'Authorization was interrupted',
    detail: 'The page was hidden, so the temporary stream was stopped. Retry authorization.',
  },
  'preview-unavailable': {
    title: 'Preview could not be opened',
    detail: 'No video was retained. Check the connection and retry authorization.',
  },
} as const;

const CONTROL_CLASS = 'min-h-12 rounded-md border border-line bg-panel-strong px-4 font-bold outline-none hover:border-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:text-muted disabled:opacity-55';

export default function ScanView() {
  const session = usePreviewSession();
  const isReplay = session.sourceKind === 'replay';
  const replayFrame = session.surface?.kind === 'replay-frame' ? session.surface.frame : null;
  const liveSurface = session.surface?.kind === 'live-preview' ? session.surface : null;
  const frameNumber = replayFrame ? replayFrame.sequence + 1 : 0;
  const frameCount = session.replayManifest.frames.length;
  const statusCopy = isReplay
    ? REPLAY_STATUS[session.status]
    : LIVE_STATUS[session.previewState.phase];
  const error = session.previewState.error
    ? PREVIEW_ERRORS[session.previewState.error.code]
    : null;
  const selectedDevice = session.devices.find(
    device => device.optionId === session.selectedOptionId,
  );
  const liveSettings = liveSurface
    ? [
        liveSurface.settings.width && liveSurface.settings.height
          ? `${liveSurface.settings.width} × ${liveSurface.settings.height}`
          : null,
        liveSurface.settings.frameRate
          ? `${liveSurface.settings.frameRate} fps`
          : null,
      ].filter(Boolean).join(' · ')
    : '';

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-8 outline-none md:px-8 md:py-12">
      <section aria-labelledby="scan-title">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">
          Handheld thermal companion
        </p>
        <h1 id="scan-title" className="mt-3 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Point toward heat you cannot see.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Ember can display a clearly labelled simulation or a local, non-radiometric PureThermal
          video preview. Neither display path produces temperature, direction, or a safety
          assessment.
        </p>
      </section>

      <fieldset className="mt-8 rounded-2xl border border-line bg-panel p-4 md:p-5">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.16em] text-muted">
          Choose source
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 outline-none focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-focus ${
            isReplay ? 'border-accent bg-panel-strong' : 'border-line'
          }`}>
            <input
              type="radio"
              name="source"
              value="replay"
              checked={isReplay}
              onChange={() => session.selectSource('replay')}
              className="size-11 shrink-0 accent-accent"
            />
            <span>
              <span className="block font-bold">Demo replay</span>
              <span className="mt-1 block text-sm text-muted">Simulated frames · no camera access</span>
            </span>
          </label>
          <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 outline-none focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-focus ${
            !isReplay ? 'border-accent bg-panel-strong' : 'border-line'
          }`}>
            <input
              type="radio"
              name="source"
              value="live-preview"
              checked={!isReplay}
              onChange={() => session.selectSource('live-preview')}
              className="size-11 shrink-0 accent-accent"
            />
            <span>
              <span className="block font-bold">Live preview</span>
              <span className="mt-1 block text-sm text-muted">Local display video · no analysis</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.75fr)]">
        <section aria-label={isReplay ? 'Demo replay viewport' : 'Live preview viewport'}>
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <p className={`inline-flex min-h-11 items-center gap-3 font-bold ${
                isReplay ? 'text-caution' : 'text-accent'
              }`}>
                <span aria-hidden="true" className="text-xl">{isReplay ? '◆' : '◉'}</span>
                {isReplay ? 'Demo replay — not live' : 'Live thermal preview — non-radiometric'}
              </p>
              <p className="font-mono text-sm text-muted">
                {isReplay
                  ? (replayFrame
                      ? `Frame ${frameNumber} of ${frameCount}`
                      : `${frameCount} frames · 160 × 120`)
                  : (liveSurface ? 'Local video playing' : 'No live video attached')}
              </p>
            </div>

            <figure className="relative grid aspect-[4/3] place-items-center bg-black">
              {isReplay ? (
                replayFrame ? (
                  <img
                    key={replayFrame.id}
                    src={replayFrame.displayUrl}
                    width={replayFrame.width}
                    height={replayFrame.height}
                    alt={`Simulated thermal replay frame ${frameNumber} of ${frameCount}. A bright region moves across a dark field. No assessment is produced from this image.`}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                  />
                ) : (
                  <div className="max-w-sm px-8 text-center">
                    <span aria-hidden="true" className="text-6xl text-line">◎</span>
                    <p className="mt-5 text-xl font-bold">No replay frame in memory</p>
                    <p className="mt-2 leading-7 text-muted">
                      Start the demo replay to exercise the simulated source lifecycle.
                    </p>
                  </div>
                )
              ) : (
                <>
                  <video
                    ref={session.videoRef}
                    muted
                    playsInline
                    aria-label="Live colorized thermal video preview. No temperature or safety assessment."
                    className={`h-full w-full object-contain ${liveSurface ? 'visible' : 'invisible'}`}
                  />
                  {!liveSurface && (
                    <div className="absolute inset-0 grid place-items-center px-8 text-center">
                      <div className="max-w-sm">
                        <span aria-hidden="true" className="text-6xl text-line">◉</span>
                        <p className="mt-5 text-xl font-bold">No live video attached</p>
                        <p className="mt-2 leading-7 text-muted">
                          Authorize camera names, choose the intended PureThermal input, then Start.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isReplay && replayFrame && (
                <span className="absolute bottom-3 left-3 rounded-md border border-caution bg-canvas/95 px-3 py-2 text-xs font-bold uppercase tracking-wider text-caution">
                  Demo replay — not live
                </span>
              )}
              {!isReplay && liveSurface && (
                <span className="absolute bottom-3 left-3 rounded-md border border-accent bg-canvas/95 px-3 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                  Live preview · non-radiometric
                </span>
              )}
            </figure>

            {isReplay ? (
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
            ) : (
              <div className="border-t border-line px-4 py-4 md:px-5">
                <p className="font-bold">Display-only colorized video. No temperature or safety assessment.</p>
                <dl className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-text">Active input</dt>
                    <dd className="mt-1">{liveSurface?.label ?? 'None playing'}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-text">Display settings</dt>
                    <dd className="mt-1">{liveSettings || 'Available after playback begins'}</dd>
                  </div>
                </dl>
              </div>
            )}
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
            <h2 id="controls-title" className="text-xl font-bold">
              {isReplay ? 'Replay controls' : 'Live preview controls'}
            </h2>

            {!isReplay && (
              <div className="mt-5 rounded-xl border border-line bg-panel-strong p-4">
                <p className="leading-6 text-muted">
                  Authorizing cameras may briefly activate the browser’s default video input only
                  to reveal device names. That temporary stream is never displayed and is stopped
                  before choices appear.
                </p>
                <button
                  type="button"
                  onClick={session.authorize}
                  disabled={session.status === 'connecting' || session.status === 'streaming'}
                  className="mt-4 min-h-12 w-full rounded-md bg-accent px-4 font-bold text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:bg-line disabled:text-muted"
                >
                  Authorize cameras
                </button>

                {session.devices.length > 0 && (
                  <div className="mt-4">
                    <label htmlFor="preview-device" className="block font-bold">
                      PureThermal input
                    </label>
                    <select
                      id="preview-device"
                      value={session.selectedOptionId}
                      onChange={event => session.selectDevice(event.target.value)}
                      disabled={session.status === 'connecting' || session.status === 'streaming'}
                      className="mt-2 min-h-12 w-full rounded-md border border-line bg-canvas px-3 text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:text-muted"
                    >
                      <option value="">Choose the intended input</option>
                      {session.devices.map(device => (
                        <option key={device.optionId} value={device.optionId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-muted">
                      {selectedDevice
                        ? `Chosen input: ${selectedDevice.label}`
                        : 'No input is selected automatically.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={session.start}
                disabled={
                  session.status === 'connecting'
                  || session.status === 'streaming'
                  || session.status === 'paused'
                  || (!isReplay && !session.selectedOptionId)
                }
                className="min-h-12 rounded-md bg-accent px-4 font-bold text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:bg-line disabled:text-muted"
              >
                Start
              </button>
              <button
                type="button"
                onClick={session.pause}
                disabled={session.status !== 'streaming'}
                className={CONTROL_CLASS}
              >
                Pause
              </button>
              <button
                type="button"
                onClick={session.resume}
                disabled={session.status !== 'paused'}
                className={CONTROL_CLASS}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={session.restart}
                disabled={
                  session.status === 'connecting'
                  || (!isReplay && !session.selectedOptionId)
                }
                className={CONTROL_CLASS}
              >
                Restart
              </button>
              <button
                type="button"
                onClick={session.stop}
                disabled={session.status === 'idle'}
                className="col-span-2 min-h-12 rounded-md border border-danger px-4 font-bold text-danger outline-none hover:bg-danger hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:border-line disabled:text-muted disabled:opacity-55"
              >
                {isReplay ? 'Stop and clear frame' : 'Stop and clear video'}
              </button>
            </div>

            {!isReplay && error && (
              <div role="alert" className="mt-5 rounded-xl border border-danger p-4">
                <div className="flex gap-3">
                  <span aria-hidden="true" className="text-2xl font-bold text-danger">!</span>
                  <div>
                    <h3 className="font-bold">{error.title}</h3>
                    <p className="mt-1 leading-6 text-muted">{error.detail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={session.retry}
                  className="mt-4 min-h-12 w-full rounded-md border border-danger px-4 font-bold text-danger outline-none hover:bg-danger hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                >
                  {session.previewState.error?.retryAction === 'start'
                    ? 'Retry preview'
                    : 'Retry camera authorization'}
                </button>
              </div>
            )}
          </section>

          <section aria-labelledby="assessment-title" className="rounded-2xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="text-3xl font-bold text-muted">—</span>
              <div>
                <h2 id="assessment-title" className="text-xl font-bold">No current assessment</h2>
                <p className="mt-2 leading-6 text-muted">
                  Replay pixels are never assessed. Live preview pixels are display-only and never
                  create temperature, direction, guidance, warnings, or speech.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
