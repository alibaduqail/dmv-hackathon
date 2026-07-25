import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { PaletteCueDetector } from '../../lib/palette-cue.ts';

const SAMPLE_WIDTH = 40;
const SAMPLE_HEIGHT = 30;
const SAMPLE_INTERVAL_MS = 125;
const CUE_REPEAT_INTERVAL_MS = 2_000;

type AudioContextConstructor = new (
  contextOptions?: AudioContextOptions,
) => AudioContext;

interface AudioContextWindow extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

export interface UsePaletteCueOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
}

export interface PaletteCueState {
  monitoring: boolean;
  detected: boolean;
  coverage: number;
  soundEnabled: boolean;
  soundSupported: boolean;
  enableSound: () => Promise<void>;
  disableSound: () => void;
}

const getAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof window === 'undefined') return null;

  const audioWindow = window as AudioContextWindow;
  return window.AudioContext ?? audioWindow.webkitAudioContext ?? null;
};

const closeAudioContext = (context: AudioContext): void => {
  if (context.state === 'closed') return;
  void context.close().catch(() => undefined);
};

const playCueTone = (
  context: AudioContext,
  frequency: number,
  durationSeconds: number,
): void => {
  if (context.state !== 'running') return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startedAt = context.currentTime;
    const endedAt = startedAt + durationSeconds;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startedAt);
    gain.gain.setValueAtTime(0.0001, startedAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startedAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endedAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
    oscillator.start(startedAt);
    oscillator.stop(endedAt);
  } catch {
    // Audio is additive. The complete visible cue remains available if playback fails.
  }
};

export function usePaletteCue({
  videoRef,
  active,
}: UsePaletteCueOptions): PaletteCueState {
  const [monitoring, setMonitoring] = useState(false);
  const [detected, setDetected] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeRef = useRef(active);

  const releaseAudio = useCallback(() => {
    setSoundEnabled(false);

    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context) closeAudioContext(context);
  }, []);

  const disableSound = useCallback(() => {
    releaseAudio();
  }, [releaseAudio]);

  const enableSound = useCallback(async () => {
    if (!activeRef.current) return;

    const AudioContextClass = getAudioContextConstructor();
    if (!AudioContextClass) return;

    let context = audioContextRef.current;

    try {
      if (!context || context.state === 'closed') {
        context = new AudioContextClass();
        audioContextRef.current = context;
      }

      if (context.state === 'suspended') {
        await context.resume();
      }
    } catch {
      if (audioContextRef.current === context) {
        audioContextRef.current = null;
      }
      if (context) closeAudioContext(context);
      setSoundEnabled(false);
      return;
    }

    if (
      !activeRef.current
      || audioContextRef.current !== context
      || context.state !== 'running'
    ) {
      if (audioContextRef.current === context) {
        audioContextRef.current = null;
      }
      closeAudioContext(context);
      return;
    }

    setSoundEnabled(true);
    playCueTone(context, 620, 0.11);
  }, []);

  useEffect(() => {
    if (!active || !detected || !soundEnabled) return;

    const playActiveCue = () => {
      const context = audioContextRef.current;
      if (context) playCueTone(context, 840, 0.18);
    };

    // This effect runs after React commits the visible cue. Deferring the first
    // tone one task keeps audio additive to, rather than ahead of, that output.
    const firstCueId = window.setTimeout(playActiveCue, 0);
    const repeatCueId = window.setInterval(playActiveCue, CUE_REPEAT_INTERVAL_MS);

    return () => {
      window.clearTimeout(firstCueId);
      window.clearInterval(repeatCueId);
    };
  }, [active, detected, soundEnabled]);

  useEffect(() => {
    activeRef.current = active;

    if (!active) {
      setMonitoring(false);
      setDetected(false);
      setCoverage(0);
      releaseAudio();
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_WIDTH;
    canvas.height = SAMPLE_HEIGHT;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      setMonitoring(false);
      setDetected(false);
      setCoverage(0);
      return () => {
        canvas.width = 0;
        canvas.height = 0;
        releaseAudio();
      };
    }

    const detector = new PaletteCueDetector();

    const clearObservation = () => {
      detector.reset();
      setDetected(false);
      setCoverage(0);
    };

    const sample = () => {
      const video = videoRef.current;
      if (
        !video
        || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
        || video.videoWidth === 0
        || video.videoHeight === 0
      ) {
        clearObservation();
        return;
      }

      try {
        context.drawImage(video, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
        const pixels = context.getImageData(
          0,
          0,
          SAMPLE_WIDTH,
          SAMPLE_HEIGHT,
        ).data;
        const observation = detector.observe(pixels);

        if (!observation.inputValid) {
          clearObservation();
          return;
        }

        setDetected(observation.cueActive);
        setCoverage(observation.coverage);
      } catch {
        // Drawing may fail while a stream changes or when pixel access is unavailable.
        clearObservation();
      }
    };

    setMonitoring(true);
    sample();
    const intervalId = window.setInterval(sample, SAMPLE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      detector.reset();
      context.clearRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      canvas.width = 0;
      canvas.height = 0;
      releaseAudio();
    };
  }, [active, releaseAudio, videoRef]);

  return {
    monitoring,
    detected,
    coverage,
    soundEnabled,
    soundSupported: getAudioContextConstructor() !== null,
    enableSound,
    disableSound,
  };
}
