import type { ClinicalEvent } from '../types.ts';

// Phase 1 fills this. 32 historical events across sessions 1-6: 4,5,6,6,5,6.
// All approved (two edited), reviewed_at non-null. Session 7 starts empty —
// extraction proposes into it. FROZEN AT 11:00.
export const historicalEvents: ClinicalEvent[] = [];
