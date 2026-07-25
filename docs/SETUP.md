# SETUP.md

Partner onboarding, branch ownership, agent prompts, and handoffs are documented in `docs/COLLABORATION.md`. Optional Ponytail, Ruflo, Impeccable, Emil Design Engineering, and complementary agent setup is documented separately in `docs/AGENT-TOOLS.md`; none is required to run Ember.

## Web app

Requirements: Node.js 22.12 or newer and npm. `npm run verify:replay` relies on Node’s native TypeScript stripping. This machine currently uses Node `v26.5.0`.

```sh
node --version
npm ci
npm run dev
```

The reported Node version must be 22.12 or newer. If you use `nvm`, run `nvm use` first. Open the local URL Vite prints.

| Route | Purpose |
|---|---|
| `#scan` | Default Replay surface plus explicit display-only Live preview and its separately labelled experimental palette cue |
| `#history` | Honest empty state; no data is persisted |

Reload both routes once. Hash routing must survive a direct reload.

---

## Verification

Run the composed gate before handing off:

```sh
npm run verify:hardening
```

`verify:hardening` runs replay verification, preview verification, palette-cue
verification, lint, a fresh production build, and the offline-build audit.

`verify:replay` checks the six-frame manifest, 160 × 120 dimensions, finite
metadata, order, deterministic completion, pause/resume, restart, and cleanup.
Its injected scheduler also proves one bounded timer while active and zero
pending timers after each of five restart/stop cycles. It does not validate
thermal accuracy, the React route lifecycle, or DOM accessibility.

`verify:preview` uses injected fake browser media objects. It checks that Replay
requests no camera access; authorization stops its unattached temporary stream
before enumeration; public choices hide device/group IDs; Start opens and
verifies only the selected identity; `streaming` waits for playback; already-ended
tracks, tracks ending during playback, and late playback settlement fail closed;
pause/resume, restart, errors, late results, disconnect/devicechange, hidden
visibility, `pagehide`, and detached video refs clean up deterministically. Five
additional cycles prove zero retained tracks, listeners, stream attachments, and
queued media requests after each stop. It exercises the reusable source boundary
and playback sink, not the React router, and it does not prove that this laptop’s
browser can enumerate or play the attached hardware.

`verify:palette` checks invalid RGBA input; the inclusive RGB channel minimum,
channel-spread, and `1%` coverage boundaries; three-sample entry; two-sample
exit; reset; and detector-instance isolation. It proves deterministic synthetic
display-pixel behavior only. It does not execute the 40 × 30 browser canvas,
audio, React lifecycle, or attached camera.

`verify:offline` rebuilds `dist`, resolves every document and stylesheet asset
reference inside the production output, verifies all six replay assets are
present, and rejects application use of common network APIs. It proves a
self-contained application build, not physical network disconnection or browser
behavior.

For manual replay verification:

1. Open `#scan`.
2. Confirm the visible heading says **“Replay ready”** and the detail says **“Start the simulated sequence when you are ready.”**
3. Start and let all six frames finish.
4. Restart, pause after frame two, wait longer than one interval, and confirm the frame does not advance.
5. Resume and confirm the next frame is frame three.
6. Stop and confirm the heading returns to **“Replay ready”** and the displayed frame clears.
7. Start again, navigate to `#history`, wait, then return; no old timer or frame may advance in the background.
8. Confirm **“Demo replay — not live”** stays adjacent to the viewport whenever a replay frame is displayed.

Run the controls by keyboard only. Every control needs a visible focus indicator and accessible name.

---

## Replay assets

```
public/replay/ember-frame-01.png
public/replay/ember-frame-02.png
public/replay/ember-frame-03.png
public/replay/ember-frame-04.png
public/replay/ember-frame-05.png
public/replay/ember-frame-06.png
```

All are simulated, 160 × 120, and ordered by `src/fixtures/replay.ts`.

If the fixtures intentionally change:

```sh
node scripts/generate-replay-assets.mjs
npm run verify:replay
```

Review all six generated PNGs, the manifest order/metadata, and the exact provenance before committing. The generator writes fixtures; the application never runs it.

Do not:

- Rename or reorder an asset without updating the manifest and verifier.
- Treat the PNG palette as radiometric Celsius values.
- Remove or shorten the provenance label.
- Use replay to claim camera connectivity or classification accuracy.

---

## PureThermal hardware — Phase 1A result

Phase 1A is complete with the calibrated-radiometry gate blocked. The full privacy-safe record is `docs/HARDWARE-PROBE.md`.

Observed on this laptop:

```text
Host                 macOS 26.5.2 (25F84), arm64
USB product          PureThermal (fw:v1.3.0)
USB vendor           GroupGets
USB vendor/product   0x1e4e / 0x0100
UVC interfaces       class 14, subclasses 1 and 2
macOS owner          UVCAssistant
AVFoundation list    no video devices shown in this Codex shell
Y16/calibration      not obtained
```

No frame or scene was captured. Exact board revision, capture mode, dimensions, encoding, byte order, calibration source, timestamp source, extrema, checksum, and orientation remain unknown. Do not begin `PureThermalSource`, native bridge, temperature, hotspot, direction, or warning work from this result.

Re-run the metadata-only probe:

```sh
sw_vers
uname -m
ioreg -p IOUSB -r -n 'PureThermal (fw:v1.3.0)' -l -w 0
ioreg -r -c IOUSBHostInterface -l -w 0 \
  | rg -i -C 8 'PureThermal|GroupGets|bInterfaceClass|bInterfaceSubClass|UsbExclusiveOwner|CameraBundleIDPublished'
ffmpeg -hide_banner -f avfoundation -list_devices true -i ""
```

The final FFmpeg command exits non-zero because it opens no input. In the recorded run it also listed no video device. That means browser playback is unproven, not impossible.

---

## Phase 1D browser-preview validation

The adapter and UI are implemented, but the attached-device gate is blocked after the 16:15 cutoff. The 18:03 Phase 1E exception did not pass that gate. Complete these steps twice in the exact demo browser and record the result before making any attached-live claim:

1. Confirm the PureThermal device still appears in the metadata probe.
2. Start Vite with `npm run dev`, open the printed localhost origin, and load `#scan`.
3. Confirm **Demo replay** is selected and Start runs without a camera prompt.
4. Select **Live preview**. Confirm selection alone requests nothing and all three truth statements are visible.
5. Read the disclosure, activate **Authorize cameras**, and allow video access for this localhost origin. Ember requests no audio.
6. Wait for authorization to finish. The temporary discovery stream is never displayed and its tracks stop before the chooser appears.
7. Confirm the chooser contains only intended PureThermal-labelled inputs and no option is selected automatically. If the label is missing, generic, or duplicated, do not use a built-in camera; keep the gate blocked.
8. Choose the intended label and Start. Ember privately requests that exact identity and rejects a mismatched active track before attachment.
9. Confirm **Live preview playing** appears only after video starts. Record only the active label and width/height/frame-rate shown beneath the viewport.
10. Confirm **“Live thermal preview — non-radiometric”**, **“Display-only colorized video. No temperature or safety assessment.”**, and **“No current assessment”** remain visible.
11. Pause: the browser camera indicator must close and no stale video may remain. Resume must reacquire the selected input.
12. Stop: the indicator must close, the viewport must clear, and the selected option may remain only for the current route session.
13. Run Start/Stop a second time. Then Start and navigate to `#history`; the indicator must close. Repeat once with the page hidden and once by unplugging the input.
14. Deny permission once and confirm the visible `!` error plus **Retry camera authorization**. A failure must never silently switch to Replay.

The Codex in-app browser reached step 5 but could not present its OS/browser permission surface. Ember logically invalidated that request generation and returned its UI to the authorization-required state; because a browser permission promise cannot be cancelled directly, any stream resolving later would be stopped immediately. That proves neither enumeration nor playback. Do not claim Phase 1D passed unless the team explicitly reopens the gate and completes the two required normal-browser runs before freeze.

Do not open DevTools to print, copy, or persist a `deviceId` or `groupId`. Do not add a screenshot, `ImageCapture`, `MediaRecorder`, upload, or general-purpose frame extraction step. Phase 1E’s reviewed 40 × 30 ephemeral sampler is the sole canvas/palette exception and produces no retained image. Even when the video uses RGB-formatted display pixels, the Lepton is not a visible-light RGB sensor and the stream is not calibrated radiometry.

The Phase 1D UI must persist:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

The GroupGets repositories in `docs/REFERENCES.md` remain prior art, not runtime dependencies. The native radiometric bridge is future work only after a new calibrated hardware proof.

---

## Phase 1E experimental palette-cue validation

At 18:03 the user explicitly reopened this one feature after the planned freeze.
Its exact label is **“Experimental palette brightness cue — not temperature or
safety detection”**. Synthetic verification is necessary but does not prove the
attached PureThermal/browser path.

Run the focused check:

```sh
npm run verify:palette
```

Then use the normal demo browser—not the Codex in-app browser if it cannot show
the operating-system permission surface:

1. Complete Phase 1D authorization, exact PureThermal selection, and Start. If
   the intended label is absent or video does not play, stop and keep the
   attached-device gate blocked.
2. Confirm all four truths are visible: **“Live thermal preview —
   non-radiometric”**, **“Display-only colorized video. No temperature or safety
   assessment.”**, **“No current assessment”**, and the exact Phase 1E label.
3. Keep **Enable cue sound** untouched. Use a staged non-personal scene and move
   a display region that the colorized preview renders near white into view.
   Do not call the object hot and do not infer a physical temperature.
4. Confirm the cue does not enter until three consecutive qualifying samples,
   then shows a visible `!`, **“Near-white palette area detected”**, and the
   fixed explanation. It must remain silent because sound was not enabled.
5. Move the near-white palette region out of view. Confirm the cue clears after
   two consecutive other samples. The UI may show current near-white coverage;
   that percentage is display pixels, not temperature or danger probability.
6. Activate **Enable cue sound** by keyboard. A short enable acknowledgement is
   expected. Cross and leave the cue again; active sound is an 840 Hz,
   180 ms non-speech tone and repeats no more often than once every two seconds.
   Mute it and confirm the visible cue remains complete.
7. Pause, Resume, Restart, Stop, hide/show the page, navigate to `#history`, and
   return. Each inactive transition must clear the cue/coverage, stop sound,
   destroy the sampler lifetime, and require a new explicit sound enable.
8. Select Replay and complete it. The palette panel is absent and no replay
   frame may activate a cue or tone.
9. Repeat the live entry/exit/Stop sequence once. Record browser/OS, commit,
   selected public label, pass/fail, and camera-indicator cleanup only. Do not
   record or log pixels, canvas data, device IDs, or a person.

There is no YOLO or person detector. Do not point the staged recording at a
person. That protects privacy; it does not prove filtering. A person and any
other region rendered near white can activate the same cue.

Phase 1E attached behavior remains unverified until this exact normal-browser
sequence passes twice. Passing it still does not produce a temperature,
hotspot, direction, severity, guidance, safety warning, or all-clear and does
not unblock Phases 1B, 1C, or 2.

---

## Offline rehearsal

Use the exact production-like candidate:

```sh
npm ci
npm run verify:hardening
npm run demo:offline
```

Open `http://127.0.0.1:4173/#scan`. `demo:offline` always rebuilds before Vite
serves the candidate on loopback port 4173; `--strictPort` fails instead of
silently changing the URL. Keep this process running for the full rehearsal.
Ember has no service worker, so closing the local process stops the app. Assets
use root-relative paths, so do not open `dist/index.html` through `file://` or
mount it below an arbitrary URL prefix.

Before 17:30:

1. After the production page loads, physically disconnect external networking.
2. Start Replay and let all six frames complete.
3. Reload `#scan`, then run the complete Replay a second time.
4. Open and reload `#history`; return to and reload `#scan`.
5. Confirm no API, font, image, or route requests an external origin.
6. Reconnect networking only after recording browser, operator, commit, and result.
7. If Phase 1D had passed, run the exact intended UVC preview twice and its unplug/failure cases. For the current build this row is not applicable because the attached-device gate is blocked.

The Phase 4 offline-fallback candidate is the committed replay, not a cached or paused preview frame. Claim disconnected-network verification only after this rehearsal passes.

Partial evidence recorded on 2026-07-25: the production server completed Replay
twice with a reload, both hash routes survived reload, and the rendered document
referenced local assets only. External networking remained connected to avoid
disrupting the hackathon laptop, so the strict offline acceptance row remains
open.

---

## Contributor agent tooling

Do not add coding-agent or design-agent packages to Ember’s `package.json`. They are optional workstation tools and must not affect `npm ci`, the offline demo, or the production bundle.

Before enabling one:

1. Read its verified entry in `docs/AGENT-TOOLS.md`.
2. Pin down its job, owned files, off-limits files, and required checks.
3. Use a short-lived branch from `codex/ember`.
4. Inspect requested permissions and generated configuration before accepting them.
5. Review every resulting diff; never let a tool make a safety claim or push by default.

Use `.agents/skills/ember-collaboration/SKILL.md` to create the task brief and final handoff. Claude Code discovers the same skill through `.claude/skills/ember-collaboration`.
