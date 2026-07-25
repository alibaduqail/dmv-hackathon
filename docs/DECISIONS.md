# DECISIONS.md

Append-only, newest at the bottom. The only handoff mechanism.

Format: `HH:MM — who — what changed — what would surprise the next person`

Log when you change a shape in `SCHEMA.md`, cut a demo beat, discover hardware behavior, change a safety threshold, or make a call the other builder would make differently.

---

12:45 — team — Pivoted the repository from Tally to Ember; Git history is the only archive, so no active legacy folder or compatibility layer remains.
12:46 — team — Product locked: handheld thermal companion for blind and low-vision people, Track 02 Health Tech & Accessibility; feature freeze 17:30 and submission 19:00.
12:47 — team — Safety boundary locked: never promise an object is safe to touch; report observed higher heat, direction, and a conservative next step.
12:48 — team — Classification belongs to deterministic code; language generation may explain a structured assessment but cannot choose thresholds, severity, or actions.
12:49 — team — Every warning requires visible text plus a non-color symbol; color reinforces meaning and speech is additive.
12:50 — team — Frames are ephemeral by default; foundation `#history` is an honest empty state with no persistence.
12:51 — team — Foundation source seam locked: `ThermalSource` callbacks isolate React from replay and the future PureThermal bridge.
12:52 — team — Replay locked to six simulated 160 × 120 PNGs and the exact persistent label “Demo replay — not live”; replay cannot be used to claim radiometric accuracy.
12:53 — team — Foundation routes locked to `#scan` default and `#history`; `ScanView` owns local state, with no API or database.
12:54 — team — Live PureThermal Y16 requires a local native bridge and remains the next phase; direct browser radiometry is not assumed.
12:55 — team — No smart plug, relay, notification, autonomous physical action, or cloud frame storage in the hackathon MVP.
13:03 — team — Replay foundation verified: six assets, ordered completion, pause/resume, stop cleanup, lint, and production build are green; no live capture or assessment is claimed.
13:10 — team — Browser QA passed for scan/history reloads, all replay controls, route cleanup, 390px layout, accessible names, 44px controls, and console errors; 200% zoom and VoiceOver remain for Phase 3.
13:14 — review — Hardened source truth and routing before commit: replay provenance is a discriminated type plus runtime guard, unknown hashes use an explicit route allowlist, and the skip control focuses the current route’s main content without changing its hash.
