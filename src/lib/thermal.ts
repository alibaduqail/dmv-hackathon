import type { ThermalCapture } from '../types.ts';

/**
 * Demo constant, NOT a validated clinical cutoff.
 * /m/ is nasal so its delta should be high; /s/ is a pressure consonant so the
 * palate should seal and its delta should stay low. The signal is the ratio,
 * never either frame alone.
 */
export const NASAL_EMISSION_RATIO = 0.30;

export const delta = (c: ThermalCapture) => c.nasal_roi_peak_c - c.baseline_c;
export const ratio = (m: ThermalCapture, s: ThermalCapture) => delta(s) / delta(m);
export const flagged = (m: ThermalCapture, s: ThermalCapture) =>
  ratio(m, s) > NASAL_EMISSION_RATIO;
