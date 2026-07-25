import type { ReplayManifest } from '../types.ts';

const FRAME_INTERVAL_MS = 420;

export const emberReplayManifest: ReplayManifest = {
  id: 'ember-handheld-demo-v1',
  label: 'Simulated handheld sweep across a warm surface',
  width: 160,
  height: 120,
  intervalMs: FRAME_INTERVAL_MS,
  provenance: {
    kind: 'simulated-replay',
    label: 'Demo replay — not live',
    isLive: false,
  },
  frames: [
    { id: 'ember-frame-01', sequence: 0, capturedAtOffsetMs: 0, displayUrl: '/replay/ember-frame-01.png', minC: 21.8, maxC: 34.2 },
    { id: 'ember-frame-02', sequence: 1, capturedAtOffsetMs: FRAME_INTERVAL_MS, displayUrl: '/replay/ember-frame-02.png', minC: 21.9, maxC: 41.7 },
    { id: 'ember-frame-03', sequence: 2, capturedAtOffsetMs: FRAME_INTERVAL_MS * 2, displayUrl: '/replay/ember-frame-03.png', minC: 22.0, maxC: 49.8 },
    { id: 'ember-frame-04', sequence: 3, capturedAtOffsetMs: FRAME_INTERVAL_MS * 3, displayUrl: '/replay/ember-frame-04.png', minC: 22.1, maxC: 57.6 },
    { id: 'ember-frame-05', sequence: 4, capturedAtOffsetMs: FRAME_INTERVAL_MS * 4, displayUrl: '/replay/ember-frame-05.png', minC: 22.0, maxC: 62.4 },
    { id: 'ember-frame-06', sequence: 5, capturedAtOffsetMs: FRAME_INTERVAL_MS * 5, displayUrl: '/replay/ember-frame-06.png', minC: 21.9, maxC: 58.1 },
  ],
};
