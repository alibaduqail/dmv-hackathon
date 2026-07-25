---
name: extraction-contract
description: Use before editing api/extract.ts, the extraction system prompt, or anything parsing model output into clinical_events. Covers the strict JSON contract, validation, the cached fallback, and prompt tuning. Trigger on extraction, prompt, JSON parsing, api/extract, or model output.
---

# The extraction contract

The one genuinely live thing in the demo. It runs on stage with judges watching, so it must be both real and impossible to break.

## Contract

`POST /api/extract` → `{ sessionId }` → reads `transcript`, calls Anthropic, validates, inserts rows with `status = 'proposed'`. Returns `{ count, events }`.

Model returns **only** a JSON array:

```json
{
  "event_type": "ATTEMPT",
  "timestamp_sec": 78,
  "target": "/r/ initial",
  "domain": "articulation",
  "trials_correct": 14,
  "trials_total": 20,
  "cue_level": "verbal_cue",
  "evidence": "That's fourteen out of twenty. Big jump from last week.",
  "ai_interpretation": "Client produced /r/ initial in 14 of 20 trials with verbal cueing.",
  "confidence": 0.88
}
```

## Validation — reject, never repair

Every element runs this before touching the DB. Failures are **dropped silently**, not coerced.

1. Strip markdown fences before `JSON.parse`. Models add them regardless of instruction.
2. `JSON.parse` in `try/catch`. On failure, serve the cached response and log — never surface a parse error to the UI.
3. `event_type` must be in the union. Not in it → drop.
4. `cue_level`, `domain` must be in their unions or `null`. Invalid → `null`, keep the element.
5. `evidence` must appear **verbatim** in the transcript. String-match fails → drop. Scroll-sync depends on it and a card that scrolls nowhere looks broken on stage.
6. `trials_correct <= trials_total`, both null or both present.
7. `confidence` clamped 0–1. `timestamp_sec` clamped to transcript duration.
8. Drop unknown keys.
9. Fewer than 5 events surviving → serve the cached response. Four cards is a thin demo.
10. `SCREENING_FLAG` is **never** accepted from the extractor. It only originates from the thermal panel.

## Prompt rules

`api/prompt.ts`. Three load-bearing lines that must not be edited away:

- **"You are documenting what the CLINICIAN did and observed."** Remove it and the model starts evaluating the child directly.
- **"You never make a diagnosis, prognosis, or clinical recommendation."** Non-negotiable. The model proposes evidence; the SLP is the authority.
- **"Extract trial counts when the transcript states them."** If the clinician says "that's fourteen out of twenty," that's an `ATTEMPT` with `trials_correct: 14, trials_total: 20`.

Send the six-session history as context so interpretations can reference it (*"first independent production of /r/ initial since baseline"*). Costs almost nothing and is most of why the demo lands.

Instruct confidence below 0.7 on ambiguity. You **need** one rejectable card at ~0.6 — the review step has to feel necessary, not ceremonial.

## Target output

6–8 events. On stage: approve 4–5, edit 1, reject 1. If extraction stops producing a rejectable card, the prompt drifted — check the ambiguity instruction survived.

## The fallback is not optional

`USE_CACHED_EXTRACTION=1` must produce a complete demo with the network unplugged. `api/cached-extraction.json` holds a known-good response.

**Refresh the cache whenever the prompt changes.** Test the flag at **4:00 PM**. A stale cache that disagrees with the live path is worse than none — you'll find out at 5:20.
