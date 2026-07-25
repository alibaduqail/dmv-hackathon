import { UvcPreviewSource } from '../src/lib/uvc-preview-source.ts';
import { emberReplayManifest } from '../src/fixtures/replay.ts';
import { ReplayThermalSource } from '../src/lib/thermal-source.ts';
import type {
  LivePreviewSurface,
  PreviewDeviceChoice,
  PreviewPlaybackSink,
  UvcPreviewObserver,
  UvcPreviewState,
} from '../src/types.ts';

const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message);
};

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

interface Deferred<Value> {
  promise: Promise<Value>;
  resolve(value: Value): void;
  reject(error: unknown): void;
}

const deferred = <Value>(): Deferred<Value> => {
  let resolvePromise!: (value: Value) => void;
  let rejectPromise!: (error: unknown) => void;
  const promise = new Promise<Value>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
};

class FakeEventTarget {
  private readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === 'function') listener({ type } as Event);
      else listener.handleEvent({ type } as Event);
    }
  }

  listenerCount(type?: string): number {
    if (type) return this.listeners.get(type)?.size ?? 0;
    return [...this.listeners.values()].reduce((total, listeners) => total + listeners.size, 0);
  }
}

class FakeTrack extends FakeEventTarget {
  readonly kind = 'video';
  readonly label: string;
  stopped = false;
  stopCount = 0;
  private readonly settings: MediaTrackSettings;

  constructor(label: string, settings: MediaTrackSettings) {
    super();
    this.label = label;
    this.settings = settings;
  }

  getSettings(): MediaTrackSettings {
    return { ...this.settings };
  }

  stop(): void {
    this.stopped = true;
    this.stopCount += 1;
  }
}

class FakeStream {
  readonly track: FakeTrack;

  constructor(track: FakeTrack) {
    this.track = track;
  }

  getTracks(): MediaStreamTrack[] {
    return [this.track as unknown as MediaStreamTrack];
  }

  getVideoTracks(): MediaStreamTrack[] {
    return [this.track as unknown as MediaStreamTrack];
  }
}

const videoDevice = (deviceId: string, label: string, groupId = 'private-group'): MediaDeviceInfo => ({
  deviceId,
  groupId,
  kind: 'videoinput',
  label,
  toJSON: () => ({}),
});

class FakeMediaDevices extends FakeEventTarget {
  readonly calls: MediaStreamConstraints[] = [];
  readonly queued = new Array<() => Promise<MediaStream>>();
  devices: MediaDeviceInfo[] = [];
  beforeEnumerate: (() => void) | null = null;

  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    this.calls.push(constraints);
    const next = this.queued.shift();
    if (!next) return Promise.reject(new Error('No fake stream was queued.'));
    return next();
  }

  async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    this.beforeEnumerate?.();
    return this.devices;
  }

  queueStream(stream: FakeStream): void {
    this.queued.push(() => Promise.resolve(stream as unknown as MediaStream));
  }

  queuePromise(streamPromise: Promise<MediaStream>): void {
    this.queued.push(() => streamPromise);
  }

  queueError(name: string): void {
    this.queued.push(() => Promise.reject({ name }));
  }
}

class FakeDocumentTarget extends FakeEventTarget {
  visibilityState: DocumentVisibilityState = 'visible';
}

class FakePageTarget extends FakeEventTarget {}

class FakePlaybackSink implements PreviewPlaybackSink {
  attached: MediaStream | null = null;
  readonly played: MediaStream[] = [];
  readonly cleared: Array<MediaStream | null> = [];
  readonly queued = new Array<() => Promise<void>>();

  play(stream: MediaStream): Promise<void> {
    this.attached = stream;
    this.played.push(stream);
    const next = this.queued.shift();
    return next ? next() : Promise.resolve();
  }

  clear(stream: MediaStream | null): void {
    this.cleared.push(stream);
    if (stream === null || this.attached === stream) this.attached = null;
  }

  queuePromise(playPromise: Promise<void>): void {
    this.queued.push(() => playPromise);
  }

  queueFailure(): void {
    this.queued.push(() => Promise.reject({ name: 'NotSupportedError' }));
  }
}

interface Observation {
  state: UvcPreviewState;
  devices: readonly PreviewDeviceChoice[];
  surface: LivePreviewSurface | null;
}

const makeHarness = (secureContext = true) => {
  const mediaDevices = new FakeMediaDevices();
  const documentTarget = new FakeDocumentTarget();
  const pageTarget = new FakePageTarget();
  const sink = new FakePlaybackSink();
  const observation: Observation = {
    state: {
      status: 'idle',
      phase: 'authorization-required',
      error: null,
    },
    devices: [],
    surface: null,
  };
  const observer: UvcPreviewObserver = {
    onState: state => { observation.state = state; },
    onDevices: devices => { observation.devices = devices; },
    onSurface: surface => { observation.surface = surface; },
  };
  const source = new UvcPreviewSource(
    {
      mediaDevices: mediaDevices as unknown as MediaDevices,
      documentTarget: documentTarget as unknown as Document,
      pageTarget: pageTarget as unknown as Window,
      secureContext,
    },
    sink,
    observer,
  );
  return { source, mediaDevices, documentTarget, pageTarget, sink, observation };
};

const SECRET_DEVICE_ID = 'never-expose-this-device-id';
const LIVE_LABEL = 'PureThermal (fw:v1.3.0)';

const authorize = async (harness: ReturnType<typeof makeHarness>) => {
  const permissionTrack = new FakeTrack('Temporary default input', {});
  const permissionStream = new FakeStream(permissionTrack);
  harness.mediaDevices.devices = [
    videoDevice('built-in-camera-id', 'Built-in Camera'),
    videoDevice(SECRET_DEVICE_ID, LIVE_LABEL),
  ];
  harness.mediaDevices.beforeEnumerate = () => {
    assert(permissionTrack.stopped, 'Discovery enumerated devices before stopping its temporary stream.');
  };
  harness.mediaDevices.queueStream(permissionStream);
  await harness.source.authorize();

  assert(permissionTrack.stopCount === 1, 'Discovery stream tracks were not stopped exactly once.');
  assert(harness.sink.played.length === 0, 'Discovery stream was attached to the playback sink.');
  assert(harness.observation.state.phase === 'ready', 'Successful discovery did not enter ready.');
  assert(harness.observation.devices.length === 1, 'Discovery did not isolate the PureThermal-labelled input.');
  const choice = harness.observation.devices[0];
  assert(choice.optionId !== SECRET_DEVICE_ID, 'A public option exposed the raw device identifier.');
  assert(!JSON.stringify(choice).includes(SECRET_DEVICE_ID), 'Serialized public choice exposed a device identifier.');
  assert(!('deviceId' in choice) && !('groupId' in choice), 'Public choice contains private identity fields.');
  assert(harness.source.select(choice.optionId), 'Operator choice was not accepted.');
  return choice;
};

const liveStream = (
  deviceId = SECRET_DEVICE_ID,
  settings: MediaTrackSettings = {
    deviceId,
    groupId: 'private-group',
    width: 160,
    height: 120,
    frameRate: 8.566,
  },
) => new FakeStream(new FakeTrack(LIVE_LABEL, settings));

const assertExactRequest = (constraints: MediaStreamConstraints): void => {
  assert(constraints.audio === false, 'Live preview requested audio.');
  assert(typeof constraints.video === 'object' && constraints.video !== null, 'Live preview did not use exact video constraints.');
  const deviceConstraint = constraints.video.deviceId;
  assert(typeof deviceConstraint === 'object' && deviceConstraint !== null, 'Live preview omitted an exact device constraint.');
  assert(!Array.isArray(deviceConstraint), 'Live preview used a device list instead of an exact identity.');
  assert(
    (deviceConstraint as ConstrainDOMStringParameters).exact === SECRET_DEVICE_ID,
    'Live preview opened a device other than the selected input.',
  );
};

const assertNoListeners = (harness: ReturnType<typeof makeHarness>, track?: FakeTrack): void => {
  assert(harness.documentTarget.listenerCount() === 0, 'Document lifecycle listener leaked.');
  assert(harness.pageTarget.listenerCount() === 0, 'Page lifecycle listener leaked.');
  assert(harness.mediaDevices.listenerCount() === 0, 'MediaDevices listener leaked.');
  if (track) assert(track.listenerCount() === 0, 'Track ended listener leaked.');
};

const verifyAuthorizationAndExactPlayback = async () => {
  const harness = makeHarness();
  await authorize(harness);

  assert(harness.mediaDevices.calls[0].video === true, 'Authorization did not request generic video.');
  assert(harness.mediaDevices.calls[0].audio === false, 'Authorization requested audio.');

  const stream = liveStream();
  const playback = deferred<void>();
  harness.mediaDevices.queueStream(stream);
  harness.sink.queuePromise(playback.promise);
  const starting = harness.source.start();
  await tick();

  assertExactRequest(harness.mediaDevices.calls[1]);
  assert(harness.observation.state.status === 'connecting', 'Source streamed before video playback resolved.');
  assert(harness.observation.state.phase === 'awaiting-playback', 'Source did not expose its playback gate.');
  assert(harness.observation.surface === null, 'Live surface appeared before playback succeeded.');

  playback.resolve();
  await starting;

  const completedObservation: Observation = { ...harness.observation };
  assert(completedObservation.state.status === 'streaming', 'Successful video playback did not enter streaming.');
  assert(completedObservation.surface?.kind === 'live-preview', 'Playing stream did not produce a live viewport surface.');
  assert(completedObservation.surface.label === LIVE_LABEL, 'UI surface did not use the selected active-track label.');
  assert(completedObservation.surface.settings.width === 160, 'Sanitized width is missing.');
  assert(completedObservation.surface.settings.height === 120, 'Sanitized height is missing.');
  assert(completedObservation.surface.settings.frameRate === 8.6, 'Frame rate was not sanitized.');
  assert(!('deviceId' in completedObservation.surface.settings), 'Display settings exposed a device identifier.');
  assert(!('groupId' in completedObservation.surface.settings), 'Display settings exposed a group identifier.');

  harness.source.stop();
  assert(stream.track.stopped, 'Stop did not release the active track.');
  assert(harness.sink.attached === null, 'Stop did not clear the playback sink.');
  assert(harness.observation.surface === null, 'Stop retained a live viewport surface.');
  assertNoListeners(harness, stream.track);
};

const verifyReplayDoesNotRequestCameraAccess = () => {
  const harness = makeHarness();
  const replay = new ReplayThermalSource(emberReplayManifest);
  replay.start(() => undefined, () => undefined);
  replay.stop();
  assert(harness.mediaDevices.calls.length === 0, 'Replay start requested camera access.');
};

const verifyIdentityMismatchAndPlaybackFailure = async () => {
  const mismatchHarness = makeHarness();
  await authorize(mismatchHarness);
  const mismatch = liveStream('different-active-device');
  mismatchHarness.mediaDevices.queueStream(mismatch);
  await mismatchHarness.source.start();

  assert(mismatch.track.stopped, 'Identity-mismatched stream was retained.');
  assert(mismatchHarness.observation.state.error?.code === 'active-device-mismatch', 'Identity mismatch did not fail explicitly.');
  assert(mismatchHarness.sink.played.length === 0, 'Identity-mismatched stream reached playback.');
  assertNoListeners(mismatchHarness, mismatch.track);

  const playbackHarness = makeHarness();
  await authorize(playbackHarness);
  const stream = liveStream();
  playbackHarness.mediaDevices.queueStream(stream);
  playbackHarness.sink.queueFailure();
  await playbackHarness.source.start();

  assert(stream.track.stopped, 'Playback failure retained an active track.');
  assert(playbackHarness.observation.state.error?.code === 'playback-failed', 'Playback rejection did not fail explicitly.');
  assert(playbackHarness.observation.surface === null, 'Playback failure retained a surface.');
  assertNoListeners(playbackHarness, stream.track);
};

const verifyPauseResumeAndDisconnect = async () => {
  const harness = makeHarness();
  await authorize(harness);

  const first = liveStream();
  harness.mediaDevices.queueStream(first);
  await harness.source.start();
  harness.source.pause();
  assert(first.track.stopped, 'Pause did not stop the active track.');
  assert(harness.observation.state.status === 'paused', 'Pause did not enter paused.');
  assert(harness.sink.attached === null && harness.observation.surface === null, 'Pause left a stale preview visible.');

  const second = liveStream();
  harness.mediaDevices.queueStream(second);
  await harness.source.resume();
  const resumedObservation: Observation = { ...harness.observation };
  assert(harness.mediaDevices.calls.length === 3, 'Resume did not reacquire the selected input.');
  assert(resumedObservation.state.status === 'streaming', 'Reacquired preview did not stream.');

  second.track.dispatch('ended');
  assert(second.track.stopped, 'Disconnect did not stop remaining active tracks.');
  assert(harness.observation.state.error?.code === 'device-disconnected', 'Track disconnect did not produce its explicit error.');
  assert(harness.observation.surface === null, 'Disconnect left a stale preview visible.');
  assertNoListeners(harness, second.track);
};

const verifyDeviceChangeDisconnect = async () => {
  const harness = makeHarness();
  await authorize(harness);
  const stream = liveStream();
  harness.mediaDevices.queueStream(stream);
  await harness.source.start();

  harness.mediaDevices.devices = [videoDevice('built-in-camera-id', 'Built-in Camera')];
  harness.mediaDevices.dispatch('devicechange');
  await tick();

  assert(stream.track.stopped, 'Missing selected device after devicechange retained its track.');
  assert(harness.observation.state.error?.code === 'device-disconnected', 'Devicechange disconnect did not fail explicitly.');
  assert(harness.observation.surface === null, 'Devicechange disconnect retained a surface.');
  assertNoListeners(harness, stream.track);
};

const verifyLateResultsAndRestart = async () => {
  const stopHarness = makeHarness();
  await authorize(stopHarness);
  const lateStream = liveStream();
  const lateRequest = deferred<MediaStream>();
  stopHarness.mediaDevices.queuePromise(lateRequest.promise);
  const starting = stopHarness.source.start();
  stopHarness.source.stop();
  lateRequest.resolve(lateStream as unknown as MediaStream);
  await starting;
  assert(lateStream.track.stopped, 'Late Stop/source-switch/route result retained tracks.');
  assert(stopHarness.observation.state.status === 'idle', 'Late result changed stopped state.');
  assert(stopHarness.observation.surface === null, 'Late result repopulated the viewport.');
  assertNoListeners(stopHarness, lateStream.track);

  const restartHarness = makeHarness();
  await authorize(restartHarness);
  const oldStream = liveStream();
  const oldRequest = deferred<MediaStream>();
  restartHarness.mediaDevices.queuePromise(oldRequest.promise);
  const firstStart = restartHarness.source.start();
  const currentStream = liveStream();
  restartHarness.mediaDevices.queueStream(currentStream);
  const restarting = restartHarness.source.restart();
  oldRequest.resolve(oldStream as unknown as MediaStream);
  await Promise.all([firstStart, restarting]);

  assert(oldStream.track.stopped, 'Restart retained a late prior-generation stream.');
  assert(!currentStream.track.stopped, 'Restart stopped the current generation.');
  assert(restartHarness.observation.surface?.stream === currentStream as unknown as MediaStream, 'Restart did not keep the current stream.');
  restartHarness.source.stop();
  assertNoListeners(restartHarness, currentStream.track);
};

const verifyHiddenAndPageHideCleanup = async () => {
  const hiddenHarness = makeHarness();
  await authorize(hiddenHarness);
  const stream = liveStream();
  hiddenHarness.mediaDevices.queueStream(stream);
  await hiddenHarness.source.start();
  hiddenHarness.documentTarget.visibilityState = 'hidden';
  hiddenHarness.documentTarget.dispatch('visibilitychange');

  assert(stream.track.stopped, 'Hidden page retained an active preview track.');
  assert(hiddenHarness.observation.state.status === 'paused', 'Hidden preview did not become paused.');
  assert(hiddenHarness.observation.surface === null, 'Hidden page retained a preview surface.');
  assertNoListeners(hiddenHarness, stream.track);

  const pageHarness = makeHarness();
  await authorize(pageHarness);
  const pendingStream = liveStream();
  const pendingRequest = deferred<MediaStream>();
  pageHarness.mediaDevices.queuePromise(pendingRequest.promise);
  const starting = pageHarness.source.start();
  pageHarness.pageTarget.dispatch('pagehide');
  pendingRequest.resolve(pendingStream as unknown as MediaStream);
  await starting;

  assert(pendingStream.track.stopped, 'Pagehide retained a late preview stream.');
  assert(pageHarness.observation.state.status === 'idle', 'Pagehide did not return to idle.');
  assert(pageHarness.observation.surface === null, 'Pagehide retained a viewport surface.');
  assertNoListeners(pageHarness, pendingStream.track);

  const authorizationHarness = makeHarness();
  authorizationHarness.mediaDevices.devices = [videoDevice(SECRET_DEVICE_ID, LIVE_LABEL)];
  const temporaryStream = liveStream();
  const permissionRequest = deferred<MediaStream>();
  authorizationHarness.mediaDevices.queuePromise(permissionRequest.promise);
  const authorizing = authorizationHarness.source.authorize();
  authorizationHarness.documentTarget.visibilityState = 'hidden';
  authorizationHarness.documentTarget.dispatch('visibilitychange');
  permissionRequest.resolve(temporaryStream as unknown as MediaStream);
  await authorizing;

  assert(temporaryStream.track.stopped, 'Hidden authorization retained its late temporary stream.');
  assert(
    authorizationHarness.observation.state.error?.code === 'authorization-interrupted',
    'Hidden authorization did not explain its interruption.',
  );
  assertNoListeners(authorizationHarness, temporaryStream.track);
};

const verifyErrorsAndUnsupportedContext = async () => {
  const deniedHarness = makeHarness();
  deniedHarness.mediaDevices.queueError('NotAllowedError');
  await deniedHarness.source.authorize();
  assert(deniedHarness.observation.state.error?.code === 'permission-denied', 'Permission denial was not mapped.');
  assert(deniedHarness.observation.state.error?.retryAction === 'authorize', 'Permission denial did not offer authorization retry.');
  assertNoListeners(deniedHarness);

  const busyHarness = makeHarness();
  await authorize(busyHarness);
  busyHarness.mediaDevices.queueError('NotReadableError');
  await busyHarness.source.start();
  assert(busyHarness.observation.state.error?.code === 'device-in-use', 'Busy device was not mapped.');
  assert(busyHarness.observation.state.error?.retryAction === 'start', 'Busy device did not offer preview retry.');
  assertNoListeners(busyHarness);

  const unsupportedHarness = makeHarness(false);
  await unsupportedHarness.source.authorize();
  assert(unsupportedHarness.mediaDevices.calls.length === 0, 'Unsupported context requested camera permission.');
  assert(unsupportedHarness.observation.state.error?.code === 'unsupported-context', 'Unsupported context did not fail explicitly.');
  assertNoListeners(unsupportedHarness);
};

verifyReplayDoesNotRequestCameraAccess();
await verifyAuthorizationAndExactPlayback();
await verifyIdentityMismatchAndPlaybackFailure();
await verifyPauseResumeAndDisconnect();
await verifyDeviceChangeDisconnect();
await verifyLateResultsAndRestart();
await verifyHiddenAndPageHideCleanup();
await verifyErrorsAndUnsupportedContext();

console.log('UVC preview verified: authorization, exact-device playback gate, lifecycle cleanup, late-result rejection, and errors.');
