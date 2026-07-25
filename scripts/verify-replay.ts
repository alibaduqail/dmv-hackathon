import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { emberReplayManifest } from '../src/fixtures/replay.ts';
import { ReplayThermalSource } from '../src/lib/thermal-source.ts';
import type { ReplayScheduler } from '../src/lib/thermal-source.ts';
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

class FakeReplayScheduler implements ReplayScheduler {
  private readonly tasks = new Map<number, () => void>();
  private nextHandle = 1;
  private nowMs = 1_000;

  get activeCount(): number {
    return this.tasks.size;
  }

  now(): number {
    return this.nowMs;
  }

  set(callback: () => void): number {
    const handle = this.nextHandle;
    this.nextHandle += 1;
    this.tasks.set(handle, callback);
    return handle;
  }

  clear(handle: unknown): void {
    if (typeof handle === 'number') this.tasks.delete(handle);
  }

  runNext(): void {
    const next = this.tasks.entries().next().value as [number, () => void] | undefined;
    if (!next) throw new Error('Fake replay scheduler has no pending task to run.');
    const [handle, callback] = next;
    this.tasks.delete(handle);
    this.nowMs += 5;
    callback();
  }
}

const verifyFiveResourceCycles = () => {
  const scheduler = new FakeReplayScheduler();
  const source = new ReplayThermalSource(testManifest, scheduler);

  for (let cycle = 1; cycle <= 5; cycle += 1) {
    const frames: ThermalFrame[] = [];
    source.start(frame => frames.push(frame), () => undefined);
    assert(scheduler.activeCount === 1, `Replay cycle ${cycle} did not retain exactly one bounded timer.`);
    scheduler.runNext();
    assert(frames.length === 1, `Replay cycle ${cycle} did not emit its first frame.`);
    assert(scheduler.activeCount === 1, `Replay cycle ${cycle} did not retain one next-frame timer.`);

    source.start(frame => frames.push(frame), () => undefined);
    assert(scheduler.activeCount === 1, `Replay cycle ${cycle} restart retained more than one timer.`);
    scheduler.runNext();
    assert(frames.length === 2, `Replay cycle ${cycle} restart did not emit a fresh first frame.`);
    assert(scheduler.activeCount === 1, `Replay cycle ${cycle} restart did not retain one bounded timer.`);

    source.stop();
    assert(source.status === 'idle', `Replay cycle ${cycle} did not return to idle.`);
    assert(scheduler.activeCount === 0, `Replay cycle ${cycle} retained a timer after stop.`);
  }
};

await verifyAssets();
verifyProvenanceGuard();
await verifyCompletion();
await verifyPauseResume();
await verifyStopCleanup();
verifyFiveResourceCycles();

console.log('Replay verified: assets, order, completion, pause/resume, cleanup, and five zero-timer cycles.');
