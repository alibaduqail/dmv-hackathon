/* Deterministic heat assessment. No model, no inference, no hidden state: the same
   inputs always produce the same output, and every threshold is a named constant a
   reviewer can argue with.

   This module never decides that anything is safe. It reports what it observed, or
   it reports that it observed nothing hot. Absence of a warning is not a clearance,
   because a polished metal surface can read far cooler than it is. */

export type HeatLevel = 'none' | 'warm' | 'hot' | 'severe';

/** Celsius floors. Chosen for a demo, not from burn research — see below. */
export const HEAT_THRESHOLDS = {
  warm: 40,
  hot: 50,
  severe: 60,
} as const;

export interface HeatAssessment {
  level: HeatLevel;
  /** Peak apparent temperature in the field of view, Celsius. */
  peakC: number;
  /** Spoken and printed direction, or null when nothing crossed the warm floor. */
  direction: string | null;
  headline: string;
  detail: string;
  /** True whenever the numbers came from a fixture rather than a sensor. */
  synthetic: boolean;
}

const levelFor = (peakC: number): HeatLevel => {
  if (peakC >= HEAT_THRESHOLDS.severe) return 'severe';
  if (peakC >= HEAT_THRESHOLDS.hot) return 'hot';
  if (peakC >= HEAT_THRESHOLDS.warm) return 'warm';
  return 'none';
};

/** Nine cells collapse to a phrase a person can act on while walking. */
export const directionFor = (x: number, y: number): string => {
  const horizontal = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'centre';
  const vertical = y < 0.34 ? 'above' : y > 0.66 ? 'below' : null;
  if (horizontal === 'centre') return vertical ?? 'straight ahead';
  return vertical ? `${vertical} ${horizontal}` : horizontal;
};

const HEADLINE: Record<HeatLevel, string> = {
  none: 'Nothing hot detected in view',
  warm: 'Warm surface detected',
  hot: 'Hot surface — do not touch',
  severe: 'Very hot surface — keep away',
};

/**
 * @param peakC   peak apparent temperature in the frame
 * @param hotspot normalised 0–1 position of the peak region, or null when none
 * @param synthetic true when the caller's numbers are fixture metadata
 */
export const assessHeat = (
  peakC: number,
  hotspot: { x: number; y: number } | null,
  synthetic: boolean,
): HeatAssessment => {
  const level = levelFor(peakC);
  const direction = level === 'none' || !hotspot ? null : directionFor(hotspot.x, hotspot.y);
  const rounded = Math.round(peakC);

  const detail = level === 'none'
    ? 'Nothing in view crossed the warm threshold. That is not the same as safe to touch — reflective surfaces such as polished metal read far cooler than they are.'
    : `Peak ${rounded} °C ${direction}. Ember reports what it observed and never confirms that anything is safe to touch.`;

  return {
    level,
    peakC,
    direction,
    headline: HEADLINE[level],
    detail,
    synthetic,
  };
};

/** One line, spoken. Simulated runs say so first, every time. */
export const speakableAssessment = (assessment: HeatAssessment): string => {
  const prefix = assessment.synthetic ? 'Simulated. ' : '';
  if (assessment.level === 'none') return `${prefix}Nothing hot detected in view.`;
  return `${prefix}${assessment.headline}. ${Math.round(assessment.peakC)} degrees, ${assessment.direction}.`;
};
