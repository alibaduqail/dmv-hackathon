import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { emberReplayManifest } from '../src/fixtures/replay.ts';
import { ReplayThermalSource } from '../src/lib/thermal-source.ts';
import type { ReplayManifest, SourceStatus, ThermalFrame } from '../src/types.ts';

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const wait = (milliseconds: number) =>
  new Promise<void>(resolvePromise => setTimeout(resolvePromise, milliseconds));

const waitFor = async (predicate: () => boolean, timeoutMs = 750) => {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) throw new Error('Timed out waiting for replay state.');
    await wait(2);
  }
};

const testManifest: ReplayManifest = { ...emberReplayManifest, intervalMs: 5 };

const verifyAssets = async () => {
  const { frames, width, height } = emberReplayManifest;
  assert(frames.length === 6, 'Replay must contain exactly six frames.');
  assert(width === 160 && height === 120, 'Replay dimensions must be 160×120.');
  assert(Number.isFinite(emberReplayManifest.intervalMs) && emberReplayManifest.intervalMs > 0, 'Replay interval must be positive and finite.');
  assert(emberReplayManifest.provenance.kind === 'simulated-replay', 'Replay provenance kind drifted.');
  assert(emberReplayManifest.provenance.label === 'Demo replay — not live', 'Replay label drifted.');
  assert(!emberReplayManifest.provenance.isLive, 'Replay cannot use live provenance.');
  assert(new Set(frames.map(frame => frame.id)).size === frames.length, 'Replay frame ids must be unique.');

  for (const [index, frame] of frames.entries()) {
    assert(frame.sequence === index, `Frame ${index + 1} is out of order.`);
    assert(Number.isFinite(frame.capturedAtOffsetMs), `Frame ${index + 1} timestamp is not finite.`);
    assert(
      frame.capturedAtOffsetMs === index * emberReplayManifest.intervalMs,
      `Frame ${index + 1} timestamp does not match replay order.`,
    );
    assert(Number.isFinite(frame.minC) && Number.isFinite(frame.maxC), `Frame ${index + 1} metadata is not finite.`);
    assert(frame.maxC > frame.minC, `Frame ${index + 1} maximum must exceed its minimum.`);

    const path = resolve(process.cwd(), `public${frame.displayUrl}`);
    const png = await readFile(path);
    assert(
      png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      `Frame ${index + 1} is not a PNG.`,
    );
    assert(png.readUInt32BE(16) === width && png.readUInt32BE(20) === height, `Frame ${index + 1} has the wrong dimensions.`);
  }
};

const verifyProvenanceGuard = () => {
  const invalidManifest = {
    ...emberReplayManifest,
    provenance: { kind: 'live-purethermal', label: 'Connected camera', isLive: true },
  } as unknown as ReplayManifest;
  let rejected = false;
  try {
    new ReplayThermalSource(invalidManifest);
  } catch {
    rejected = true;
  }
  assert(rejected, 'Replay source accepted live provenance.');
};

const verifyCompletion = async () => {
  const frames: ThermalFrame[] = [];
  const statuses: SourceStatus[] = [];
  const source = new ReplayThermalSource(testManifest);
  source.start(frame => frames.push(frame), status => statuses.push(status));
  await waitFor(() => source.status === 'ended');

  assert(frames.length === 6, 'Replay did not emit all frames.');
  assert(frames.every((frame, index) => frame.sequence === index), 'Replay completion order is unstable.');
  assert(statuses[0] === 'connecting' && statuses.includes('streaming') && statuses.at(-1) === 'ended', 'Replay lifecycle statuses are incomplete.');
};

const verifyPauseResume = async () => {
  const frames: ThermalFrame[] = [];
  const source = new ReplayThermalSource(testManifest);
  source.start(frame => {
    frames.push(frame);
    if (frames.length === 1) source.pause();
  }, () => undefined);

  await waitFor(() => source.status === 'paused');
  await wait(25);
  assert(frames.length === 1, 'Paused replay continued emitting frames.');
  source.resume();
  await waitFor(() => source.status === 'ended');
  assert(frames.length === 6, 'Resumed replay did not complete.');
};

const verifyStopCleanup = async () => {
  const frames: ThermalFrame[] = [];
  const source = new ReplayThermalSource(testManifest);
  source.start(frame => {
    frames.push(frame);
    source.stop();
  }, () => undefined);

  await waitFor(() => source.status === 'idle' && frames.length === 1);
  await wait(25);
  assert(frames.length === 1, 'Stopped replay left a pending frame timer.');
};

const verifyRestart = async () => {
  const firstRun: ThermalFrame[] = [];
  const source = new ReplayThermalSource(testManifest);
  source.start(frame => firstRun.push(frame), () => undefined);
  await waitFor(() => firstRun.length === 2);

  const secondRun: ThermalFrame[] = [];
  const framesBeforeRestart = firstRun.length;
  source.start(frame => secondRun.push(frame), () => undefined);
  await waitFor(() => source.status === 'ended');
  await wait(25);

  assert(secondRun.length === 6, 'Restart did not replay every frame.');
  assert(secondRun.every((frame, index) => frame.sequence === index), 'Restart did not begin at frame one in order.');
  assert(firstRun.length === framesBeforeRestart, 'Restart left the previous run emitting frames.');
};

// EMB-P4-NFR-001: five lifecycle cycles must leave no pending timer and no live callback.
// The replay source owns no socket, listener, or object URL, so the timer spy is the whole surface.
const verifyLifecycleResources = async () => {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const pending = new Set<unknown>();

  globalThis.setTimeout = ((handler: (...args: unknown[]) => void, delayMs?: number, ...args: unknown[]) => {
    const id: unknown = realSetTimeout((...fired: unknown[]) => {
      pending.delete(id);
      handler(...fired);
    }, delayMs, ...args);
    pending.add(id);
    return id;
  }) as unknown as typeof setTimeout;

  globalThis.clearTimeout = ((id: unknown) => {
    pending.delete(id);
    realClearTimeout(id as Parameters<typeof clearTimeout>[0]);
  }) as unknown as typeof clearTimeout;

  try {
    for (let cycle = 1; cycle <= 5; cycle += 1) {
      const frames: ThermalFrame[] = [];
      const statuses: SourceStatus[] = [];
      const source = new ReplayThermalSource(testManifest);

      source.start(frame => frames.push(frame), status => statuses.push(status));
      await waitFor(() => frames.length === 2);
      source.pause();
      assert(source.status === 'paused', `Cycle ${cycle} did not pause.`);
      source.resume();
      await waitFor(() => frames.length >= 3);
      source.stop();
      // Assert before awaiting: a leaked timer would fire, self-clear, and hide the leak.
      assert(pending.size === 0, `Cycle ${cycle} left ${pending.size} timers pending after stop.`);
      assert(source.status === 'idle', `Cycle ${cycle} did not return to idle after stop.`);
      await wait(25);

      const framesAtStop = frames.length;
      const statusesAtStop = statuses.length;
      await wait(20);
      assert(frames.length === framesAtStop, `Cycle ${cycle} emitted a frame after stop.`);
      assert(statuses.length === statusesAtStop, `Cycle ${cycle} emitted a status after stop.`);
    }
  } finally {
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }
};

await verifyAssets();
verifyProvenanceGuard();
await verifyCompletion();
await verifyPauseResume();
await verifyStopCleanup();
await verifyRestart();
await verifyLifecycleResources();

console.log('Replay verified: assets, order, completion, pause/resume, cleanup, restart, and five-cycle resource release.');
