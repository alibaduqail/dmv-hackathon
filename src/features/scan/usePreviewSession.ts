import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emberReplayManifest } from '../../fixtures/replay.ts';
import { ReplayThermalSource } from '../../lib/thermal-source.ts';
import { UvcPreviewSource } from '../../lib/uvc-preview-source.ts';
import type {
  PreviewDeviceChoice,
  PreviewPlaybackSink,
  ScanSourceKind,
  SourceStatus,
  UvcPreviewObserver,
  UvcPreviewState,
  ViewportSurface,
} from '../../types.ts';

const INITIAL_PREVIEW_STATE: UvcPreviewState = {
  status: 'idle',
  phase: 'authorization-required',
  error: null,
};

export function usePreviewSession() {
  const [sourceKind, setSourceKind] = useState<ScanSourceKind>('replay');
  const [replayStatus, setReplayStatus] = useState<SourceStatus>('idle');
  const [previewState, setPreviewState] = useState<UvcPreviewState>(INITIAL_PREVIEW_STATE);
  const [devices, setDevices] = useState<readonly PreviewDeviceChoice[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [surface, setSurface] = useState<ViewportSurface | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);

  const replaySource = useMemo(
    () => new ReplayThermalSource(emberReplayManifest),
    [],
  );

  const sink = useMemo<PreviewPlaybackSink>(() => ({
    async play(stream) {
      const video = videoRef.current;
      if (!video) throw { name: 'NotSupportedError' };
      if (video.srcObject !== stream) video.srcObject = stream;
      await video.play();
    },
    clear(stream) {
      const video = videoRef.current;
      if (!video || (stream !== null && video.srcObject !== stream)) return;
      video.pause();
      video.srcObject = null;
    },
  }), []);

  const observer = useMemo<UvcPreviewObserver>(() => ({
    onState(state) {
      if (mountedRef.current) setPreviewState(state);
    },
    onDevices(nextDevices) {
      if (mountedRef.current) setDevices(nextDevices);
    },
    onSurface(nextSurface) {
      if (mountedRef.current) setSurface(nextSurface);
    },
  }), []);

  const previewSource = useMemo(() => new UvcPreviewSource(
    {
      mediaDevices: navigator.mediaDevices,
      documentTarget: document,
      pageTarget: window,
      secureContext: window.isSecureContext,
    },
    sink,
    observer,
  ), [observer, sink]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      replaySource.stop();
      previewSource.stop();
    };
  }, [previewSource, replaySource]);

  const selectSource = useCallback((nextSource: ScanSourceKind) => {
    if (nextSource === sourceKind) return;
    replaySource.stop();
    previewSource.stop();
    setReplayStatus('idle');
    setSurface(null);
    setSourceKind(nextSource);
  }, [previewSource, replaySource, sourceKind]);

  const start = useCallback(() => {
    setSurface(null);
    if (sourceKind === 'replay') {
      replaySource.start(
        frame => setSurface({ kind: 'replay-frame', frame }),
        setReplayStatus,
      );
      return;
    }
    void previewSource.start();
  }, [previewSource, replaySource, sourceKind]);

  const pause = useCallback(() => {
    if (sourceKind === 'replay') replaySource.pause();
    else previewSource.pause();
  }, [previewSource, replaySource, sourceKind]);

  const resume = useCallback(() => {
    if (sourceKind === 'replay') replaySource.resume();
    else void previewSource.resume();
  }, [previewSource, replaySource, sourceKind]);

  const restart = useCallback(() => {
    setSurface(null);
    if (sourceKind === 'replay') {
      replaySource.start(
        frame => setSurface({ kind: 'replay-frame', frame }),
        setReplayStatus,
      );
      return;
    }
    void previewSource.restart();
  }, [previewSource, replaySource, sourceKind]);

  const stop = useCallback(() => {
    if (sourceKind === 'replay') {
      replaySource.stop();
      setSurface(null);
      return;
    }
    previewSource.stop();
  }, [previewSource, replaySource, sourceKind]);

  const authorize = useCallback(() => {
    setSelectedOptionId('');
    void previewSource.authorize();
  }, [previewSource]);

  const selectDevice = useCallback((optionId: string) => {
    if (!previewSource.select(optionId)) return;
    setSelectedOptionId(optionId);
  }, [previewSource]);

  const retry = useCallback(() => {
    if (previewState.error?.retryAction === 'start') {
      void previewSource.start();
      return;
    }
    setSelectedOptionId('');
    void previewSource.authorize();
  }, [previewSource, previewState.error]);

  return {
    authorize,
    devices,
    pause,
    previewState,
    replayManifest: emberReplayManifest,
    restart,
    resume,
    retry,
    selectDevice,
    selectedOptionId,
    selectSource,
    sourceKind,
    start,
    status: sourceKind === 'replay' ? replayStatus : previewState.status,
    stop,
    surface,
    videoRef,
  };
}
