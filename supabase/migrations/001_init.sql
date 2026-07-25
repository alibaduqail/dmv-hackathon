-- Tally. Tables only: no auth, no RLS, no policies, no triggers.
--
-- Columns are plain text where SCHEMA.md names an enum. Validation lives at the
-- API boundary (see .claude/skills/extraction-contract/SKILL.md) because that is
-- the only place untrusted model output enters — a CHECK constraint here would be
-- a second place to keep in sync and would surface as a 500 instead of a dropped
-- event. Nothing in the app READS these tables; they are the write-through mirror.

create table clinicians (
  id      text primary key,
  name    text not null,
  initials text not null
);

create table clients (
  id                 text primary key,
  name               text not null,
  age                int  not null,
  caregiver_name     text,
  caregiver_language text default 'en'
);

create table sessions (
  id            text primary key,
  client_id     text references clients(id),
  clinician_id  text references clinicians(id),
  index         int  not null,
  date          date not null,
  status        text not null,          -- complete | pending
  transcript_id text
);

create table thermal_captures (
  id               text primary key,
  session_id       text references sessions(id),
  stimulus         text not null,       -- '/m/ sustained' | '/s/ sustained'
  image_path       text not null,       -- committed PNG under src/fixtures/thermal/
  nasal_roi_peak_c numeric not null,
  baseline_c       numeric not null,
  captured_at      timestamptz not null
  -- delta_c is DERIVED, never stored: nasal_roi_peak_c - baseline_c
);

create table clinical_events (
  id                 text primary key,
  session_id         text references sessions(id),
  event_type         text not null,
  evidence_type      text not null default 'transcript',
  timestamp_sec      int,
  target             text,
  domain             text,
  trials_correct     int,
  trials_total       int,
  cue_level          text,
  evidence           text not null,
  thermal_capture_id text references thermal_captures(id),
  ai_interpretation  text not null,
  confidence         numeric not null,
  status             text not null default 'proposed',
  clinician_edit     text,
  reviewed_at        timestamptz
);

create table artifacts (
  id         text primary key,
  session_id text references sessions(id),
  kind       text not null,             -- soap_note | home_program | next_session_plan | auth_summary
  lang       text not null default 'en',
  body       text not null,
  created_at timestamptz default now()
);
