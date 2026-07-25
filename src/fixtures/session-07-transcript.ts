import type { TranscriptLine } from '../types.ts';

// Phase 1 fills this. The arc: verbal_cue -> INDEPENDENT_PRODUCTION, 14/20.
// Every `evidence` string extraction produces must appear here VERBATIM —
// scroll-sync is String.indexOf. Watch smart quotes. FROZEN AT 11:00.
export const transcript: TranscriptLine[] = [];

export const transcriptText = () => transcript.map(l => l.text).join('\n');
