/* Continuous sonification. A blind operator sweeping a room needs feedback that
   updates while they move; a spoken sentence finishes after the camera has already
   pointed somewhere else. Pitch and pulse rate both rise with temperature, so the
   signal survives hearing loss at either end of the range.

   Web Audio only. No dependency, no audio file, nothing to load. */

import type { HeatLevel } from './assessment.ts';

// ponytail: one oscillator plus one gain, re-tuned in place. A pool of voices buys
// nothing until more than one thing is being sonified at once.
const TONE = {
  none: null,
  warm: { hz: 380, pulsesPerSecond: 1.6 },
  hot: { hz: 620, pulsesPerSecond: 3.2 },
  severe: { hz: 940, pulsesPerSecond: 6 },
} as const satisfies Record<HeatLevel, { hz: number; pulsesPerSecond: number } | null>;

export interface WarningTone {
  setLevel(level: HeatLevel): void;
  stop(): void;
}

export const createWarningTone = (): WarningTone | null => {
  const AudioCtor = globalThis.AudioContext;
  if (!AudioCtor) return null;

  let context: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  let pulse: ReturnType<typeof setInterval> | null = null;

  const clearPulse = () => {
    if (pulse === null) return;
    clearInterval(pulse);
    pulse = null;
  };

  const stop = () => {
    clearPulse();
    oscillator?.stop();
    oscillator?.disconnect();
    gain?.disconnect();
    void context?.close();
    oscillator = null;
    gain = null;
    context = null;
  };

  const setLevel = (level: HeatLevel) => {
    const tone = TONE[level];
    if (!tone) {
      stop();
      return;
    }

    if (!context) {
      context = new AudioCtor();
      oscillator = context.createOscillator();
      gain = context.createGain();
      oscillator.type = 'triangle';
      gain.gain.value = 0;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
    }

    const activeContext = context;
    const activeGain = gain;
    if (!activeContext || !activeGain || !oscillator) return;

    oscillator.frequency.setValueAtTime(tone.hz, activeContext.currentTime);

    clearPulse();
    const beat = () => {
      const now = activeContext.currentTime;
      // Envelope rather than a hard gate: a clicking square wave is fatiguing to
      // wear for minutes at a time, and this runs continuously while scanning.
      activeGain.gain.cancelScheduledValues(now);
      activeGain.gain.setValueAtTime(0.0001, now);
      activeGain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      activeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    };
    beat();
    pulse = setInterval(beat, 1000 / tone.pulsesPerSecond);
  };

  return { setLevel, stop };
};
