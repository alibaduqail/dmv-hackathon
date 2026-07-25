import type { ClinicalEvent } from '../types.ts';

/** The only status filter in the app. Do not re-filter inline anywhere. */
export const confirmed = (e: ClinicalEvent) =>
  e.status === 'approved' || e.status === 'edited';
