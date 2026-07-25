# HARDWARE-PROBE.md — Phase 1A evidence

**Probe time:** 2026-07-25 15:25 EDT  
**Outcome:** investigation complete; calibrated-radiometry gate **blocked**  
**Privacy:** no frame, screenshot, radiometric array, or scene data was captured or committed

This report closes Phase 1A for the current hackathon hardware path. It is a no-go decision, not a successful radiometry result.

The attached assembly is accepted as a Lepton 3.5 by team identification. macOS recognizes its GroupGets PureThermal USB device and binds UVC interfaces, but Ember did not obtain a Y16 frame, a calibrated conversion, or an orientation result. A potential browser colorized preview is therefore a separate display-only candidate for Phase 1D; browser playback is not yet proven. It is not evidence for temperature, hotspot, direction, severity, guidance, or a safety warning.

This result is scoped to this laptop, firmware, and capture path. It does not claim that every Lepton 3.5 or PureThermal configuration lacks radiometric capability.

---

## 1. Host and attached-device evidence

| Field | Observed result |
|---|---|
| Host | macOS 26.5.2, build 25F84, arm64 |
| Sensor module | Lepton 3.5, identified by the team; not attested by the USB descriptor |
| USB product | `PureThermal (fw:v1.3.0)` |
| USB vendor | `GroupGets` |
| USB identity | vendor `0x1e4e` / product `0x0100` |
| USB link | 12,000,000 bits/s |
| Board revision | Unknown; not exposed by the inspected USB metadata |
| Firmware | `v1.3.0`, from the USB product string |
| UVC attachment | macOS `UVCAssistant` owns interface class `14`, subclasses `1` and `2`; the camera bundle is published |
| AVFoundation listing | FFmpeg 8.1.2 printed no video devices in this Codex shell |
| Capture mode | Unknown; no mode was enumerated in this shell |
| Y16 frame | Not obtained |
| Calibrated Celsius mapping | Not available through the selected path |
| Width, height, encoding, byte order | Unproven for a captured stream |
| Timestamp and min/max derivation | Not applicable; no frame was accepted |
| Orientation | Unproven |

The USB serial number was visible locally but is intentionally omitted because it is not needed to reproduce the decision.

---

## 2. Reproduce the privacy-safe probe

These commands inspect metadata only. They do not capture a frame.

```sh
sw_vers
uname -m

ioreg -p IOUSB -r -n 'PureThermal (fw:v1.3.0)' -l -w 0

ioreg -r -c IOUSBHostInterface -l -w 0 \
  | rg -i -C 8 'PureThermal|GroupGets|bInterfaceClass|bInterfaceSubClass|UsbExclusiveOwner|CameraBundleIDPublished'

ffmpeg -hide_banner -f avfoundation -list_devices true -i ""
```

Expected device evidence for this probe:

```text
USB Product Name = PureThermal (fw:v1.3.0)
USB Vendor Name  = GroupGets
idVendor         = 7758 (0x1e4e)
idProduct        = 256  (0x0100)
bInterfaceClass  = 14   (UVC)
bInterfaceSubClass = 1 and 2
UsbExclusiveOwner = UVCAssistant
CameraBundleIDPublished = Yes
```

The FFmpeg command exits non-zero because no input is opened. In this run it also listed no AVFoundation video device. Treat that as “not visible to this shell,” not as proof that a browser cannot obtain a display stream after camera permission.

---

## 3. Requirement and acceptance result

| Item | Result | Evidence or missing field |
|---|---|---|
| `EMB-P1A-FR-001` | Partial | Firmware, USB identity, host, and UVC interface recorded; exact board revision and capture mode are unknown |
| `EMB-P1A-FR-002` | Failed | No 160 × 120 Y16 frame was obtained |
| `EMB-P1A-FR-003` | Failed | No calibrated Celsius-capable mapping was proven |
| `EMB-P1A-FR-004` | Failed | No authoritative conversion applies to an accepted frame |
| `EMB-P1A-DR-001` | Failed | Captured width, height, encoding, byte order, timestamp, and extrema remain unproven |
| `EMB-P1A-DR-002` | Failed as a pass bundle | The explicit missing evidence is recorded here; no aggregate frame values or checksum exist |
| `EMB-P1A-NFR-001` | Passed | No frame payload or scene was captured, logged, or committed |
| `EMB-P1A-NFR-002` | Passed | Calibrated-radiometry work is blocked; no Celsius value is inferred |
| `EMB-P1A-NFR-003` | Passed | The no-go and display-only decision is recorded in `docs/DECISIONS.md` |
| `EMB-P1A-AC-001` | Failed | Board revision, capture dimensions, and encoding are not known |
| `EMB-P1A-AC-002` | Failed | There is no Y16 buffer, 19,200-value proof, min/max, or checksum |
| `EMB-P1A-AC-003` | Passed | The team selected a no-radiometry branch and cut temperature and warning claims |
| `EMB-P1A-AC-004` | Failed | The evidence checklist contains explicit failures and cannot authorize Phase 1B |

**Gate decision:** radiometric Phase 1B, deterministic assessment Phase 1C, and assessment speech Phase 2 are blocked for this hackathon build.

---

## 4. Authorized next probe

Phase 1D may test the UVC device as a browser display source. After explicit Live-preview selection, an **Authorize cameras** action may unlock labels through an unattached temporary stream that is stopped immediately. The operator must then choose the intended label; Start must open that exact session-only `deviceId` and verify the active track matches before presenting a live preview.

If that probe succeeds, the UI must keep these statements visible:

- **“Live thermal preview — non-radiometric”**
- **“Display-only colorized video. No temperature or safety assessment.”**
- **“No current assessment”**

Phase 1D must not:

- call the stream RGB sensor data;
- fabricate `ThermalFrame.minC`, `ThermalFrame.maxC`, or `radiometricValuesC`;
- use canvas extraction, screenshots, recording, upload, or persistence;
- derive temperature, hotspot, direction, severity, guidance, warning, or speech from display pixels;
- silently use a built-in camera or silently switch to replay.

The full Phase 1D gate is in `docs/REQUIREMENTS.md`.
