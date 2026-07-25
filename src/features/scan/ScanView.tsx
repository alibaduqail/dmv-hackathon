import { useEffect, useMemo, useRef, useState } from 'react';
import { syntheticHotspots } from '../../fixtures/replay.ts';
import { assessHeat, speakableAssessment, type HeatLevel } from '../../lib/assessment.ts';
import {
  createBrowserSpeechController,
  formatLivePreviewStatus,
  formatReplayStatus,
} from '../../lib/speech.ts';
import { createWarningTone } from '../../lib/warning-tone.ts';
import type { SourceStatus, UvcPreviewPhase } from '../../types.ts';
import { usePreviewSession } from './usePreviewSession.ts';

const LEVEL_STYLE: Record<HeatLevel, { tone: string; border: string; symbol: string }> = {
  none: { tone: 'text-muted', border: 'border-line', symbol: '—' },
  warm: { tone: 'text-caution', border: 'border-caution', symbol: '△' },
  hot: { tone: 'text-accent', border: 'border-accent', symbol: '▲' },
  severe: { tone: 'text-danger', border: 'border-danger', symbol: '⣿' },
};

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

const CONTROL_CLASS = 'min-h-12 bg-panel-strong px-4 text-sm font-bold uppercase tracking-wider outline-none hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:bg-panel disabled:text-muted disabled:opacity-55';

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
  const statusTitle = error?.title ?? statusCopy.title;
  const statusDetail = error?.detail ?? statusCopy.detail;
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
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [speechFailureText, setSpeechFailureText] = useState<string | null>(null);
  const speechController = useMemo(
    () => createBrowserSpeechController(undefined, delivery => {
      if (delivery.type === 'started') {
        setSpeechFailureText(null);
        return;
      }
      setSpeechFailureText(delivery.text);
      setSpeechEnabled(false);
    }),
    [],
  );
  const speechSuspended = useRef(false);
  const speechAvailable = speechController !== null;

  useEffect(() => {
    speechController?.setMuted(speechMuted);
    speechController?.setEnabled(speechEnabled);
  }, [speechController, speechEnabled, speechMuted]);

  useEffect(() => {
    const statusKey = isReplay
      ? session.status
      : `${session.previewState.phase}:${session.previewState.error?.code ?? 'none'}`;
    const presentation = isReplay
      ? formatReplayStatus(statusKey, statusTitle, statusDetail)
      : formatLivePreviewStatus(statusKey, statusTitle, statusDetail);
    const cancelSpeech = () => speechController?.cancel();
    const presentIfCurrent = () => {
      if (speechSuspended.current || document.visibilityState === 'hidden') {
        cancelSpeech();
      } else {
        speechController?.present(presentation);
      }
    };
    const onVisibilityChange = () => {
      speechSuspended.current = document.visibilityState === 'hidden';
      presentIfCurrent();
    };
    const onPageHide = () => {
      speechSuspended.current = true;
      cancelSpeech();
    };
    const onPageShow = () => {
      speechSuspended.current = document.visibilityState === 'hidden';
      presentIfCurrent();
    };
    presentIfCurrent();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      cancelSpeech();
    };
  }, [
    isReplay,
    session.previewState.error?.code,
    session.previewState.phase,
    session.status,
    speechController,
    statusDetail,
    statusTitle,
  ]);



  const isStreaming = session.status === 'streaming';

  /* Assessment exists only for the replay fixture, and only because its temperatures
     are authored. A live preview frame is colorized display video, so it never
     produces one — converting those pixels into degrees is the exact thing the
     hardware gate forbade. */
  const assessment = isReplay && replayFrame
    ? assessHeat(replayFrame.maxC, syntheticHotspots[replayFrame.sequence] ?? null, true)
    : null;
  const level = assessment?.level ?? 'none';
  const levelStyle = LEVEL_STYLE[level];

  const warningTone = useMemo(() => createWarningTone(), []);
  useEffect(() => () => warningTone?.stop(), [warningTone]);

  useEffect(() => {
    if (!warningTone) return;
    if (!assessment || !isStreaming || document.visibilityState === 'hidden') {
      warningTone.stop();
      return;
    }
    warningTone.setLevel(assessment.level);
  }, [assessment, isStreaming, warningTone]);

  /* Speech fires on a level change, never per frame: a sentence restarted six times
     a second is noise, not guidance. */
  const spokenLevel = useRef<HeatLevel | null>(null);
  useEffect(() => {
    if (!assessment || !speechEnabled || speechMuted) {
      spokenLevel.current = null;
      return;
    }
    if (spokenLevel.current === assessment.level) return;
    spokenLevel.current = assessment.level;
    speechController?.present({
      kind: 'assessment',
      key: `assessment:${assessment.level}`,
      text: speakableAssessment(assessment),
    });
  }, [assessment, speechController, speechEnabled, speechMuted]);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[104rem] px-3 py-4 outline-none md:px-6 md:py-6">
      {/* The instrument carries the identity visually, so the page heading is spoken
          rather than printed. It stays first in the reading order. */}
      <h1 id="scan-title" className="sr-only">Point toward heat you cannot see.</h1>

      {/* Source switch and provenance sit on one line above the instrument, the way a
          mode selector sits on the body of a camera rather than in a panel beside it. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset>
          <legend className="sr-only">Choose source</legend>
          <div className="flex gap-px bg-line">
            <label className={`flex min-h-12 cursor-pointer items-center gap-2.5 px-4 outline-none focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-focus ${
              isReplay ? 'bg-sim text-canvas' : 'bg-panel text-muted hover:bg-panel-strong'
            }`}>
              <input
                type="radio"
                name="source"
                value="replay"
                checked={isReplay}
                onChange={() => session.selectSource('replay')}
                className="size-4 shrink-0 accent-canvas"
              />
              <span className="readout text-xs font-bold">DEMO REPLAY</span>
            </label>
            <label className={`flex min-h-12 cursor-pointer items-center gap-2.5 px-4 outline-none focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-focus ${
              !isReplay ? 'bg-accent text-canvas' : 'bg-panel text-muted hover:bg-panel-strong'
            }`}>
              <input
                type="radio"
                name="source"
                value="live-preview"
                checked={!isReplay}
                onChange={() => session.selectSource('live-preview')}
                className="size-4 shrink-0 accent-canvas"
              />
              <span className="readout text-xs font-bold">LIVE PREVIEW</span>
            </label>
          </div>
        </fieldset>

        <p className={`readout inline-flex min-h-12 items-center gap-2 border-2 px-3 text-xs font-bold uppercase ${
          isReplay ? 'sim-hatch border-sim text-sim' : 'border-accent text-accent'
        }`}>
          <span aria-hidden="true">{isReplay ? '◆' : '◉'}</span>
          {isReplay ? 'Demo replay — not live' : 'Live thermal preview — non-radiometric'}
        </p>
      </div>

      {/* The instrument. The frame is the product, so it takes the page rather than
          sitting in a card beside four panels of equal weight. */}
      <section
        aria-label={isReplay ? 'Demo replay viewport' : 'Live preview viewport'}
        className={`mt-3 border-2 ${isReplay ? 'border-sim' : 'border-accent'}`}
      >
        <div className="flex bg-black">
          {/* The sensor's own palette, standing in for the scale a radiometric build
              would label. It carries no numbers because Ember measures nothing. */}
          <div className="relative w-4 shrink-0 md:w-6">
            <div className="ironbow absolute inset-0" aria-hidden="true" />
          </div>

          <figure className={`relative grid aspect-[4/3] max-h-[64vh] flex-1 place-items-center overflow-hidden ${
            isStreaming ? 'sweep' : ''
          }`}>
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
                  <p className="readout text-5xl text-line">◎</p>
                  <p className="mt-4 font-bold">No replay frame in memory</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
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
                      <p className="readout text-5xl text-line">◉</p>
                      <p className="mt-4 font-bold">No live video attached</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        Authorize camera names, choose the intended PureThermal input, then Start.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Viewfinder brackets, not a border: they mark the field of view. */}
            <span aria-hidden="true" className={`pointer-events-none absolute left-3 top-3 size-6 border-l-2 border-t-2 ${isReplay ? 'border-sim' : 'border-accent'}`} />
            <span aria-hidden="true" className={`pointer-events-none absolute right-3 top-3 size-6 border-r-2 border-t-2 ${isReplay ? 'border-sim' : 'border-accent'}`} />
            <span aria-hidden="true" className={`pointer-events-none absolute bottom-3 left-3 size-6 border-b-2 border-l-2 ${isReplay ? 'border-sim' : 'border-accent'}`} />
            <span aria-hidden="true" className={`pointer-events-none absolute bottom-3 right-3 size-6 border-b-2 border-r-2 ${isReplay ? 'border-sim' : 'border-accent'}`} />

            {/* HUD. Solid backing, never a translucent wash, so overlaid text keeps its contrast. */}
            <span className={`readout absolute left-3 top-3 border bg-canvas px-2 py-1 text-[0.6875rem] font-bold uppercase ${
              isReplay ? 'border-sim text-sim' : 'border-accent text-accent'
            }`}>
              {isReplay ? 'Demo replay — not live' : 'Live · non-radiometric'}
            </span>
            <span className="readout absolute right-3 top-3 border border-line bg-canvas px-2 py-1 text-[0.6875rem] text-muted">
              {isReplay
                ? `SEQ ${String(frameNumber).padStart(3, '0')}/${String(frameCount).padStart(3, '0')} · 160×120`
                : (liveSettings || 'AWAITING PLAYBACK')}
            </span>
            <span className="readout absolute bottom-3 left-1/2 -translate-x-1/2 border border-line bg-canvas px-2 py-1 text-[0.6875rem] uppercase text-muted">
              No temperature · no assessment
            </span>
          </figure>
        </div>

        {/* Progress reads as a strip under the image, the width of the instrument. */}
        {isReplay && (
          <div className="border-t-2 border-line bg-canvas">
            <div className="h-1.5 bg-panel" aria-hidden="true">
              <div
                className="ironbow h-full transition-[width] duration-200"
                style={{ width: `${(frameNumber / frameCount) * 100}%` }}
              />
            </div>
            <label htmlFor="replay-progress" className="sr-only">Replay progress</label>
            <progress id="replay-progress" value={frameNumber} max={frameCount} className="sr-only" />
          </div>
        )}

        {/* Status is a full-width bar on the instrument, the loudest text on the page. */}
        <div
          role="status"
          aria-live={speechEnabled && !speechMuted ? 'off' : 'polite'}
          aria-atomic="true"
          className="flex items-start gap-4 border-t-2 border-line bg-panel-strong px-4 py-4"
        >
          <span aria-hidden="true" className={`text-4xl font-bold leading-none ${statusCopy.tone}`}>
            {statusCopy.symbol}
          </span>
          <div className="min-w-0">
            <h2 id="source-status-title" className="text-lg font-bold uppercase tracking-wide md:text-xl">
              {statusTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">{statusDetail}</p>
          </div>
        </div>
      </section>

      {/* Control dock: one row of hard-edged keys across the instrument, like the
          button strip on a handheld camera. */}
      <section aria-labelledby="controls-title" className="mt-3">
        <h2 id="controls-title" className="sr-only">
          {isReplay ? 'Replay controls' : 'Live preview controls'}
        </h2>
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-5">
          <button
            type="button"
            onClick={session.start}
            disabled={
              session.status === 'connecting'
              || session.status === 'streaming'
              || session.status === 'paused'
              || (!isReplay && !session.selectedOptionId)
            }
            className="col-span-2 min-h-14 bg-accent px-4 font-bold uppercase tracking-[0.18em] text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:bg-inert disabled:text-muted md:col-span-1"
          >
            Start
          </button>
          <button type="button" onClick={session.pause} disabled={session.status !== 'streaming'} className={CONTROL_CLASS}>
            Pause
          </button>
          <button type="button" onClick={session.resume} disabled={session.status !== 'paused'} className={CONTROL_CLASS}>
            Resume
          </button>
          <button
            type="button"
            onClick={session.restart}
            disabled={session.status === 'connecting' || (!isReplay && !session.selectedOptionId)}
            className={CONTROL_CLASS}
          >
            Restart
          </button>
          <button
            type="button"
            onClick={session.stop}
            disabled={session.status === 'idle'}
            className="col-span-2 min-h-14 bg-panel px-4 text-sm font-bold uppercase tracking-wider text-danger outline-none hover:bg-danger hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:text-muted disabled:opacity-55 md:col-span-1"
          >
            {isReplay ? 'Stop and clear frame' : 'Stop and clear video'}
          </button>
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <section aria-labelledby="setup-title" className="border border-line bg-panel px-4 py-4">
          <h2 id="setup-title" className="gutter">{isReplay ? 'Replay source' : 'Camera setup'}</h2>
          {isReplay ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              Six committed 160 × 120 frames play in a fixed order. They are simulated fixtures, not
              a recording of anything real, and their pixels never become temperature.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">
                Authorizing cameras may briefly activate the browser’s default video input only
                to reveal device names. That temporary stream is never displayed and is stopped
                before choices appear.
              </p>
              <button
                type="button"
                onClick={session.authorize}
                disabled={session.status === 'connecting' || session.status === 'streaming'}
                className="mt-3 min-h-12 w-full bg-accent px-4 text-sm font-bold uppercase tracking-wider text-canvas outline-none hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:bg-inert disabled:text-muted"
              >
                Authorize cameras
              </button>

              {session.devices.length > 0 && (
                <div className="mt-3">
                  <label htmlFor="preview-device" className="gutter">PureThermal input</label>
                  <select
                    id="preview-device"
                    value={session.selectedOptionId}
                    onChange={event => session.selectDevice(event.target.value)}
                    disabled={session.status === 'connecting' || session.status === 'streaming'}
                    className="mt-1.5 min-h-12 w-full border border-line bg-canvas px-3 text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:text-muted"
                  >
                    <option value="">Choose the intended input</option>
                    {session.devices.map(device => (
                      <option key={device.optionId} value={device.optionId}>{device.label}</option>
                    ))}
                  </select>
                  <p className="readout mt-2 text-xs text-muted">
                    {selectedDevice ? `CHOSEN: ${selectedDevice.label}` : 'NO INPUT SELECTED AUTOMATICALLY'}
                  </p>
                </div>
              )}

              <dl className="readout mt-3 grid gap-1 border-t border-divider pt-3 text-xs text-muted">
                <div className="flex gap-2">
                  <dt className="text-muted">INPUT</dt>
                  <dd className="truncate text-text">{liveSurface?.label ?? 'NONE PLAYING'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">MODE</dt>
                  <dd className="text-text">{liveSettings || 'AFTER PLAYBACK BEGINS'}</dd>
                </div>
              </dl>

              {error && (
                <div className="mt-3 border-2 border-danger p-3">
                  <div className="flex gap-3">
                    <span aria-hidden="true" className="text-2xl font-bold leading-none text-danger">!</span>
                    <div>
                      <h3 className="font-bold uppercase tracking-wide">{error.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{error.detail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={session.retry}
                    className="mt-3 min-h-12 w-full border border-danger px-4 text-sm font-bold uppercase tracking-wider text-danger outline-none hover:bg-danger hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {session.previewState.error?.retryAction === 'start'
                      ? 'Retry preview'
                      : 'Retry camera authorization'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <details className="border border-line bg-panel px-4 py-4">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <h2 id="speech-title" className="gutter">Source speech</h2>
            <span className="readout text-xs font-bold text-muted">
              {speechAvailable ? (speechEnabled ? (speechMuted ? 'MUTED' : 'ON') : 'OFF') : 'UNAVAILABLE'}
            </span>
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted">
            {speechFailureText
              ? 'Browser speech failed. Visible source status remains complete.'
              : speechAvailable
              ? speechEnabled
                ? speechMuted
                  ? 'Speech is enabled and muted.'
                  : 'Speech is enabled for source status and provenance.'
                : 'Speech is off.'
              : 'Browser speech is unavailable. Visible source status remains complete.'}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-px bg-line">
            <button
              type="button"
              aria-pressed={speechEnabled}
              disabled={!speechAvailable}
              onClick={() => {
                const nextEnabled = !speechEnabled;
                if (nextEnabled) setSpeechFailureText(null);
                setSpeechEnabled(nextEnabled);
              }}
              className={CONTROL_CLASS}
            >
              {speechEnabled ? 'Disable speech' : 'Enable speech'}
            </button>
            <button
              type="button"
              aria-pressed={speechMuted}
              disabled={!speechEnabled}
              onClick={() => setSpeechMuted(!speechMuted)}
              className={CONTROL_CLASS}
            >
              {speechMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              type="button"
              disabled={!speechEnabled || speechMuted}
              onClick={() => speechController?.repeat()}
              className={`col-span-2 ${CONTROL_CLASS}`}
            >
              Repeat source status
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            Speech never creates temperature, direction, guidance, or a safety assessment.
          </p>
          {speechFailureText && (
            <p role="status" aria-live="polite" className="sr-only">
              Browser speech failed. {speechFailureText}
            </p>
          )}
        </details>

        <section aria-labelledby="assessment-title" className={`border-2 bg-panel px-4 py-4 ${levelStyle.border}`}>
          <p className="gutter">Assessment</p>
          {assessment ? (
            <div role="status" aria-live="polite" aria-atomic="true">
              <p className="readout mt-2 inline-block sim-hatch border border-sim px-2 py-1 text-[0.6875rem] font-bold uppercase text-sim">
                Simulated temperatures — fixture values, not a measurement
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span aria-hidden="true" className={`text-4xl font-bold leading-none ${levelStyle.tone}`}>
                  {levelStyle.symbol}
                </span>
                <div>
                  <h2 id="assessment-title" className={`text-lg font-bold uppercase tracking-wide ${levelStyle.tone}`}>
                    {assessment.headline}
                  </h2>
                  <p className="readout mt-1 text-2xl font-bold">
                    {Math.round(assessment.peakC)} °C
                    {assessment.direction && <span className="text-muted"> · {assessment.direction}</span>}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{assessment.detail}</p>
            </div>
          ) : (
            <>
              <h2 id="assessment-title" className="mt-3 text-lg font-bold uppercase tracking-wide">
                No current assessment
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Live preview pixels are display-only and never create temperature, direction,
                guidance, warnings, or speech. Only the replay fixture carries authored
                temperatures, and it says so whenever it reports one.
              </p>
            </>
          )}
        </section>
      </div>

    </main>
  );
}
