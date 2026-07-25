# CLAUDE.md

**Read `AGENTS.md` first — it is the source of truth.** This file adds Claude Code specifics only.

File map + contracts: `docs/ARCHITECTURE.md`. Spec: `mvp.md`. Demo: `docs/DEMO.md`. Data contract: `docs/SCHEMA.md`. Prior art: `docs/REFERENCES.md`.

## Session discipline

Pro plan, 5-hour session budget, hard 5:30 freeze. Budget is scarcer than time.

- `/clear` between every task. Don't carry schema context into UI work.
- Batch: take a whole feature spec in one turn, not eight follow-ups.
- Don't re-read the repo. `docs/SCHEMA.md` is the data contract — read that instead of grepping `src/`.
- Don't paste stack traces here. Those go to the second model; bring back the fix.

## Project skills

- `.claude/skills/seed-fixtures/` — before touching fixture data
- `.claude/skills/extraction-contract/` — before touching `api/extract.ts` or the prompt
- `.claude/skills/thermal-panel/` — before touching `src/features/thermal/`

## Escalate, don't guess

Stop and ask when:

- A fixture would change after 11:00
- Extraction returns fewer than 5 or more than 10 events for the demo transcript
- A design token doesn't cover a case
- You're about to add a dependency
- `mvp.md` contradicts something here
- It's past 3:00 PM and thermal isn't started — that's a cut, not a question

## Clinical safety

This product never diagnoses, rules on, or recommends care. If a prompt, a generated artifact, or UI copy asserts a clinical conclusion rather than proposing evidence for a clinician to confirm, that's a bug — fix it and flag it.

## Commits

Conventional commits, one line, no body, no co-author trailer. `feat: review card approve state`. Commit after every working increment.
