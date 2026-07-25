---
name: ember-collaboration
description: Coordinate safe multi-agent development on Ember. Use when onboarding a collaborator, assigning work to coding or design agents, choosing optional agent tooling, editing shared thermal contracts, handing off a lane, integrating parallel work, or preparing a commit or pull request.
---

# Ember Collaboration

Coordinate humans and agents around one product truth. Keep each task bounded, independently verifiable, and safe for the next builder to continue.

## Start every task

1. Read `AGENTS.md` completely.
2. Read `docs/STATUS.md`, then `docs/REQUIREMENTS.md` and the task-specific documents it routes to.
3. Inspect the current branch, worktree status, and recent commits.
4. State one outcome, one owner, an explicit file list, and acceptance checks.
5. Claim the lane before editing. Announce any necessary cross-lane file first.

Use `docs/COLLABORATION.md` for the human workflow and handoff template. Use `docs/AGENT-TOOLS.md` before enabling Ponytail, Ruflo, Impeccable, Emil Design Engineering, or another optional tool.

## Protect the product boundary

- Never promise that an object is safe to touch.
- Keep thermal classification deterministic. Do not delegate thresholds, severity, or physical guidance to a language or design model.
- Require visible text plus a non-color symbol for every warning. Treat speech and color as reinforcement.
- Keep thermal frames ephemeral unless an explicit, documented privacy decision changes that rule.
- Keep **“Demo replay — not live”** visible wherever replay content appears.
- Reject design output that makes replay resemble live capture or hides status, provenance, focus, or essential copy.

Stop and escalate when a request conflicts with these rules, `mvp.md`, or the current phase exit gate.

## Assign one bounded lane

Prefer parallel work only when owners have disjoint files.

| Lane | Typical paths | Required context |
|---|---|---|
| Hardware and native bridge | `native/purethermal-bridge/**` | Phase 1A/1B requirements, bridge section in `docs/ARCHITECTURE.md` |
| Browser source and session | `src/types.ts`, future live adapter/protocol/session files | `docs/REQUIREMENTS.md`, `docs/SCHEMA.md`, `docs/ARCHITECTURE.md` |
| Deterministic assessment | future assessment/presentation modules and verifier | Phase 1C policy and acceptance; no replay pixels |
| Interface and design | `src/features/**`, `src/styles/**`, `src/App.tsx` | `docs/DEMO.md`, accessibility rules in `AGENTS.md` |
| Replay and verification | `src/fixtures/**`, `public/replay/**`, `scripts/**` | provenance rules and `docs/SETUP.md` |
| Documentation and pitch | `docs/**`, `mvp.md`, root instructions | current code plus verification evidence |

Do not let two agents edit the same high-conflict file concurrently. Give a subcontracted agent its allowed files and off-limits files in the prompt.

## Choose tools deliberately

- Use one coordinating agent or orchestrator for a worktree. Do not nest multiple orchestrators around the same task.
- Add a specialist only for a concrete gap: interface critique, implementation, research, accessibility audit, or review.
- Treat agent tools as contributor tooling, not Ember runtime dependencies.
- Review generated design and code against repository rules before accepting it.
- Never give an optional tool independent authority to merge, push, change shared contracts, or make safety claims.
- Record tool-specific installation and trust decisions in `docs/AGENT-TOOLS.md`, not in application code.

## Execute the lane

1. Read each target file before editing.
2. Preserve unrelated work in a dirty worktree.
3. Change the smallest coherent surface that reaches the stated exit gate.
4. Update the owning documentation in the same increment:
   - contract change → `docs/SCHEMA.md` and `docs/DECISIONS.md`
   - requirement/acceptance change → `docs/REQUIREMENTS.md` and `docs/DECISIONS.md`
   - file or boundary change → `docs/ARCHITECTURE.md`
   - setup change → `docs/SETUP.md`
   - completed or blocked work → `docs/STATUS.md`
   - demo behavior change → `docs/DEMO.md`
5. Run focused checks, then the shared gate:

```sh
npm run verify:replay
npm run lint
npm run build
```

6. Inspect the final diff for secrets, stale product language, accidental generated files, hidden provenance, and unowned edits.

## Integrate safely

- Use `codex/ember` as the shared integration branch until the team deliberately promotes it.
- Create a short-lived branch for parallel work; merge only after its owner supplies verification evidence.
- Let one integration owner push the shared branch. Other agents hand off commits or patches.
- Use conventional one-line commits that describe one working increment.
- Do not rewrite shared history, force-push, or push directly to `main`.

## Leave a complete handoff

Report:

```text
Outcome:
Branch and commit:
Files changed:
Behavior now:
Verification run:
Manual checks:
Safety/provenance review:
Open risks or blockers:
Next exact action:
```

Make the handoff factual. Distinguish proven behavior, simulated behavior, and planned behavior. Never describe an untested hardware path as working.
