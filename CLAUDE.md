# CLAUDE.md

**Read `AGENTS.md` first — it is the source of truth.** This file adds Claude Code specifics only.

Cold start: `docs/STATUS.md`. Atomic acceptance: `docs/REQUIREMENTS.md`. Boundaries and landmines: `docs/ARCHITECTURE.md`. Implemented contracts: `docs/SCHEMA.md`. Schedule: `docs/PLAN.md`. Demo: `docs/DEMO.md`.

For collaboration, invoke `.claude/skills/ember-collaboration/SKILL.md`, which links to the canonical `.agents/skills/ember-collaboration` skill, and follow `docs/COLLABORATION.md`. Read `docs/AGENT-TOOLS.md` before enabling a third-party plugin, skill, or orchestrator.

## Session discipline

Two builders, hard 17:30 feature freeze.

- `/clear` between tasks. Do not carry native-bridge context into interface work.
- Take one bounded surface at a time and name the `docs/DEMO.md` beat it improves.
- Claim owned and off-limits files before delegating or starting parallel work.
- Read `docs/REQUIREMENTS.md` and `docs/SCHEMA.md` before changing a thermal shape. Do not redeclare shared types.
- Do not add a dependency or change a public contract without announcing it.
- Append the outcome or surprise to `docs/DECISIONS.md`.
- Use only one orchestrator for a worktree; require specialist agents to return a factual handoff.

## Escalate, do not guess

Stop and ask when:

- The hardware is not confirmed to be Lepton 3.5 on a PureThermal USB board.
- A change would make replay look live or sourced from the connected camera.
- A model is about to classify heat or authorize a safety action.
- UI copy implies that an object is safe to touch.
- A warning is understandable only through color or speech.
- A dependency, native runtime, or persistent data store is being added.
- `mvp.md` contradicts `AGENTS.md`.

## Safety

Ember reports observed thermal conditions; it never guarantees touch safety. Deterministic code owns classification. Language models may explain an already-computed assessment, never create one. Speech repeats visible status and warnings; it is not the only output.

## Commits

Conventional commits, one line, no body, no co-author trailer. Commit after each working increment. `codex/ember` is the integration branch; do not push directly to `main`, rewrite shared history, or let a subagent push unless it is the assigned integration owner.
