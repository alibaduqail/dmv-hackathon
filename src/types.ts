// Mirrors docs/SCHEMA.md. Import from here — never redeclare a union.

export type EventType =
  | 'ATTEMPT' | 'CUE' | 'RETRY' | 'INDEPENDENT_PRODUCTION'
  | 'GENERALIZATION' | 'ERROR_PATTERN' | 'HOME_PROGRAM_ASSIGNED'
  | 'QUESTION_UNRESOLVED' | 'REINFORCEMENT' | 'SCREENING_FLAG';

export type CueLevel = 'independent' | 'verbal_cue' | 'visual_cue' | 'tactile_cue' | 'model';

export type Domain =
  | 'articulation' | 'phonological_process' | 'fluency'
  | 'prosody' | 'expressive_language' | 'receptive_language' | 'resonance';

export type EventStatus = 'proposed' | 'approved' | 'edited' | 'rejected';
export type EvidenceType = 'transcript' | 'thermal';
export type ArtifactKind = 'soap_note' | 'home_program' | 'next_session_plan' | 'auth_summary';

export interface ClinicalEvent {
  id: string;
  session_id: string;
  event_type: EventType;
  evidence_type: EvidenceType;
  timestamp_sec: number | null;      // null for thermal
  target: string | null;             // '/r/ initial'
  domain: Domain | null;
  trials_correct: number | null;     // ATTEMPT only
  trials_total: number | null;       // ATTEMPT only
  cue_level: CueLevel | null;
  evidence: string;                  // VERBATIM transcript span, <25 words
  thermal_capture_id: string | null; // set iff evidence_type === 'thermal'
  ai_interpretation: string;
  confidence: number;                // 0.00–1.00, shown only on unapproved cards
  status: EventStatus;
  clinician_edit: string | null;     // set only when status === 'edited'
  reviewed_at: string | null;
}

export interface Session {
  id: string;
  index: number;
  date: string;                      // '2026-07-25'
  status: 'complete' | 'pending';
  transcript_id: string | null;      // only session 7
}

export interface TranscriptLine {
  t_sec: number;
  speaker: 'clinician' | 'client';
  text: string;
}

export interface ThermalCapture {
  id: string;
  session_id: string;
  stimulus: '/m/ sustained' | '/s/ sustained';
  image_path: string;
  nasal_roi_peak_c: number;
  baseline_c: number;
  captured_at: string;
}

export interface Artifact {
  kind: ArtifactKind;
  lang: 'en' | 'es';
  body: string;
}
