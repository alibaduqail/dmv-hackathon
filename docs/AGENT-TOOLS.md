# AGENT-TOOLS.md — collaboration tools for Ember

Research checked against first-party sources on **2026-07-25**. These tools change quickly; follow the linked source before installing or updating.

The repository-owned instructions remain authoritative:

1. `AGENTS.md`
2. `mvp.md`
3. `docs/STATUS.md`
4. `docs/REQUIREMENTS.md`
5. `docs/ARCHITECTURE.md`
6. `docs/SCHEMA.md`
7. `docs/PLAN.md`

An external skill, hook, agent, or orchestrator may help execute those instructions. It may not replace them, weaken Ember’s safety language, classify thermal conditions, retain thermal frames, or create a second product specification.

---

## Decision

No external agent is required to build Ember. The shared repository instructions and verification commands are the required collaboration layer.

Use the named tools in narrow, non-overlapping roles:

| Tool | Type | Ember role | Recommendation |
|---|---|---|---|
| Ponytail | Behavioral coding skill + lifecycle hooks | Keep diffs small and reuse existing code | Optional per-builder install now |
| Impeccable | Design skill, commands, deterministic detector, and hooks | Audit accessibility, responsive behavior, and visual consistency | Optional project install; use the detector and audit flow |
| Emil Design Engineering | Design-engineering skill collection | Focused UI craft and motion review | Optional for the interface owner only |
| Ruflo | Multi-agent meta-harness with MCP, hooks, memory, and daemon options | Large-scale orchestration | Defer the full install until after submission |

Recommended hackathon stack:

1. Keep `AGENTS.md` plus the repo-local Ember collaboration skill as the only source of project policy.
2. Let each builder install Ponytail in their own harness if they want the minimal-change guardrail.
3. Give one interface owner Emil for targeted craft work and use Impeccable as an audit/detector, not as a second product owner.
4. Use Playwright MCP or Accessibility Insights for runtime keyboard and semantics checks.
5. Do not initialize full Ruflo in the active hackathon branch.

The four named projects are not four equivalent “agents.” Ruflo is the only orchestration layer. The other three are scoped guidance or review tools.

---

## Shared installation rules

External tool setup can write hooks, skills, settings, lock files, or instruction files. One builder owns each installation change.

Before installing a project-scoped tool:

```sh
git status --short --untracked-files=all
git fetch origin
git switch codex/ember
git pull --ff-only
git switch -c codex/tool-name-evaluation
```

Stop if the initial status is not clean. Preserve or hand off existing work before changing branches.

After installing:

```sh
git status --short --untracked-files=all
git diff -- .gitignore AGENTS.md CLAUDE.md .agents .claude .codex .impeccable
npm run verify:replay
npm run verify:preview
npm run lint
npm run build
```

`git diff` does not show untracked files. Open and review every `??` path reported by `git status`, including generated hooks, skills, settings, lock files, and ignore rules, before staging anything.

Reject or manually repair an installation if it:

- Replaces `AGENTS.md` or changes `CLAUDE.md` from a pointer to `AGENTS.md`.
- Introduces a second product, architecture, schema, or schedule document.
- Adds a package to Ember’s application runtime without team approval.
- Adds a hook that uploads prompts, files, terminal output, thermal frames, or radiometric values.
- Writes generated memory or agent state into Git without an explicit decision.
- Changes source files while merely installing collaboration tooling.

Never provide replay images, live frames, radiometric arrays, or customer data to an agent memory system. Thermal frames remain ephemeral even when an orchestration tool supports persistent memory.

Install one orchestration layer at a time. Do not run native Codex/Claude collaboration, Ruflo swarms, and another autonomous loop against the same paths concurrently. Agent count does not replace lane ownership.

---

## Ponytail

**Verified identity:** [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), described by its maintainer as a cross-agent ruleset that prefers omission, existing code, standard libraries, native platform features, and the minimum code that works. It explicitly says validation, security, and accessibility are not simplification targets.

**Good Ember use:** routine implementation and review where agents might add abstractions, packages, or duplicate helpers. This aligns with Ember’s “smallest change that proves the beat” rule.

**Not its role:** thermal safety review, accessibility conformance, architecture ownership, or multi-agent scheduling.

### Optional per-builder install

Claude Code, entered as two separate prompts:

```text
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

Codex, entered in a terminal:

```sh
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

The official installation notes say the Claude Code and Codex integrations use two Node.js lifecycle hooks. Node must be on the non-interactive shell path. Codex users should inspect and trust the hooks in `/hooks`, then start a new task. The default mode is `full`; use `/ponytail lite`, `/ponytail full`, `/ponytail ultra`, or `/ponytail off` only when supported by the active harness.

### Collaboration cautions

- Treat “minimum code” as subordinate to Ember’s safety and accessibility requirements. Redundant warnings, cleanup, accessible names, and verification are required even when they add lines.
- Ponytail can inject into subagents. Every subagent must still receive Ember’s lane and file ownership.
- Keep it per-builder unless the team intentionally commits a project-scoped integration. A partner should not need to accept a hook merely to clone and build Ember.

### Maintenance signal

The project’s [release history](https://github.com/DietrichGebert/ponytail/releases) listed `v4.8.4` as its latest release on 2026-06-29, following several releases in the same week. Treat it as active and fast-moving; pin or re-review behavior before a future production use.

---

## Ruflo

**Verified identity and spelling:** [ruvnet/ruflo](https://github.com/ruvnet/ruflo), the project formerly called Claude Flow. The repository calls Ruflo an agent meta-harness for Claude Code and Codex. It can add agents, swarm coordination, MCP tools, hooks, persistent memory, workers, and a daemon.

**Good Ember use later:** coordinating several independent bridge, analysis, interface, and QA lanes after contracts and ownership are stable.

**Why the full install is deferred:** Ember already has a two-person lane plan and an active collaborative harness. Ruflo’s full initializer touches `.claude/`, `.claude-flow/`, `CLAUDE.md`, helpers, settings, MCP configuration, hooks, and daemon behavior. That is too much configuration churn near feature freeze and risks competing with the repository source of truth.

### Lowest-risk evaluation

Ruflo documents a Claude Code plugin path that adds commands, skills, and agent definitions without registering the MCP server or hooks:

```text
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
```

Evaluate even this lite path in an isolated branch or disposable clone. It does not provide the full memory/swarm loop advertised elsewhere in the documentation.

### Full paths — document only, do not run on the active branch

Interactive initializer:

```sh
npx ruflo@latest init wizard
```

Codex initializer:

```sh
npx -y ruflo@latest init --codex
```

The current Codex release notes require Node.js 20 or newer and configure a Ruflo MCP server with a startup timeout. Inspect every generated file and confirm `AGENTS.md` and `CLAUDE.md` remain intact before considering a merge.

### Collaboration and operational risks

- Ruflo overlaps the current harness’s agent spawning, planning, and delegation. Pick one orchestrator for a task.
- Persistent memory is a poor default for a product whose thermal data is ephemeral. Never route runtime frame data through Ruflo memory, RAG, logs, or agent prompts.
- Hooks and background workers expand the debugging surface and may keep running after the initiating task. Confirm shutdown before changing branches or handing the machine to a partner.
- Full initialization may create a large generated diff. Do not mix it with an Ember feature commit.
- The project has a broad plugin surface. Install only the smallest named plugin needed; do not install the entire catalog speculatively.

### Maintenance signal

Ruflo is actively maintained but has high release churn. Its [release history](https://github.com/ruvnet/ruflo/releases) listed `v3.32.9` on 2026-07-20. Recent first-party release notes include fixes for MCP startup, hook parsing, worktree daemon fan-out, package lockstep, and SQLite memory integrity. That is evidence of responsive maintenance and of a large operational surface. Re-evaluate it after the demo, not during the freeze window.

---

## Impeccable

**Verified identity:** [pbakaus/impeccable](https://github.com/pbakaus/impeccable), a design guidance system for multiple coding harnesses. The project currently describes one skill, 23 commands, live browser iteration, and 60 deterministic detector rules.

**Good Ember use:** deterministic checks for issues such as small touch targets and skipped heading levels, plus focused `/impeccable audit`, `critique`, and `polish` passes.

**Not its role:** deciding thermal thresholds, authorizing safety language, or replacing manual keyboard and screen-reader testing.

### Optional project install

Run only in a dedicated tooling commit:

```sh
npx impeccable install --providers=claude,codex --scope=project
```

The installer may write provider skills and native hook manifests. Reload the harness afterward. Codex users must inspect and approve the project hook through `/hooks`.

Useful deterministic command with no LLM or API key:

```sh
npx impeccable detect src/
```

Use the installed skill for a targeted audit after the interface owner finishes a beat:

```text
/impeccable audit the scan and history routes
```

Codex exposes the same capability as the `impeccable` skill rather than a Claude-style slash command.

### Configuration and source-of-truth risk

The official `/impeccable init` flow writes `PRODUCT.md` and offers `DESIGN.md`. Ember already has `mvp.md`, `AGENTS.md`, and detailed design rules. Do **not** run `init` without deciding how those generated files will avoid becoming competing specifications.

If the team adopts the detector, shared configuration lives in `.impeccable/config.json`; per-developer choices live in the gitignored `.impeccable/config.local.json`. Record justified detector exceptions narrowly. Never disable a touch-target, focus, labeling, provenance, or non-color warning finding just to make an audit green.

### Overlap with Emil

Use Impeccable for broad audit and deterministic detection. Use Emil for a narrow craft or motion question. Do not ask both tools to redesign the same surface simultaneously; they carry independent visual opinions and can produce churn.

### Maintenance signal

The [official releases](https://github.com/pbakaus/impeccable/releases) listed Skill `4.0.2` and CLI `3.3.1` in July 2026, with hook-related fixes published on 2026-07-22. It is active and changing quickly. Review generated hooks again after every update.

---

## Emil Design Engineering

**Verified identity:** the official repository is [emilkowalski/skills](https://github.com/emilkowalski/skills), and the requested skill is named **`emil-design-eng`**. “Emil Design” is informal shorthand, not the package or repository name.

The maintainer describes it as a design-engineering skill centered on UI polish, component choices, animation decisions, and details such as motion purpose, easing, responsiveness, performance, reduced motion, and touch-device hover behavior.

**Good Ember use:** review a completed control, state transition, or layout detail when a focused craft pass is worth the time.

**Not its role:** primary accessibility auditing or product redesign. The main skill is heavily motion-oriented, while Ember’s most important output is immediate, stable, redundant safety information.

### Optional project install

The official repository uses [Vercel’s open `skills` installer](https://github.com/vercel-labs/skills). Install only the requested skill for Claude Code and Codex:

```sh
npx skills@latest add emilkowalski/skills \
  --skill emil-design-eng \
  -a claude-code \
  -a codex \
  -y
```

Project scope is the installer default. It targets `.claude/skills/` for Claude Code and `.agents/skills/` for Codex, possibly through a shared canonical copy or symlink. One builder should install and commit the resulting paths; the partner should pull rather than run a second competing install.

### Ember-specific constraints

- Do not animate replay provenance, source status, warnings, or focus indication out of view.
- Never delay a warning or control response for polish.
- Honor `prefers-reduced-motion`; for Ember, default to no positional motion on routine controls and status changes.
- Do not add Motion/Framer Motion or another runtime dependency just because an example uses it. Native CSS is sufficient unless the team separately approves a dependency.
- Keep at least 44 × 44 CSS pixel controls even if a visual suggestion prefers a smaller target.
- Preserve the replay palette and do not recolor thermal assets for branding.

### Maintenance signal

The repository’s [commit history](https://github.com/emilkowalski/skills/commits/main/) showed maintainer activity through 2026-07-23. It has no conventional release series on the repository page, so installation from `main` is a moving target. Review skill diffs before updating.

---

## Complementary options

These fill gaps that the four named tools do not cover. They are optional, and the team should add only the one needed for the next beat.

### 1. Vercel React Best Practices

[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) is Vercel’s official skill collection. Its `vercel-react-best-practices` skill focuses on React performance, waterfalls, bundle size, rendering, and re-renders rather than visual taste.

Optional focused install:

```sh
npx skills@latest add vercel-labs/agent-skills \
  --skill vercel-react-best-practices \
  -a claude-code \
  -a codex \
  -y
```

Use only when the replay or future live stream shows a measurable React performance problem. Do not pre-optimize the six-frame foundation.

### 2. Microsoft Playwright MCP

[microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) lets an agent operate a browser from structured accessibility snapshots and element references. That makes it useful for repeatable keyboard flows, accessible-name inspection, route changes, and pause/resume checks.

Claude Code setup from the official Playwright documentation:

```sh
claude mcp add playwright npx @playwright/mcp@latest
```

Other MCP clients can use:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

An accessibility-tree snapshot is not an accessibility-conformance result. Pair it with keyboard use, visual focus inspection, and a deterministic audit. Keep the MCP setup per-developer unless the team deliberately chooses a shared project config.

### 3. Accessibility Insights and axe-core

[Accessibility Insights for Web FastPass](https://accessibilityinsights.io/docs/web/getstarted/fastpass/) combines axe-core automated checks with an assisted tab-stop review. It is a good no-code-change check before every UI handoff. The official documentation also states that most accessibility problems require manual testing.

[Deque’s axe-core](https://github.com/dequelabs/axe-core) is the underlying open-source accessibility engine and can later be integrated into automated browser tests. Ember currently has no test framework and forbids unapproved dependencies, so use Accessibility Insights manually now and propose axe integration as a separate post-foundation change.

Neither tool can verify that a spoken warning is understandable, that heat language avoids a safety guarantee, or that the experience works well for a blind user. Those require human review and, ideally, testing with target users.

---

## Recommended lane workflow

| Beat | Primary owner/tool | Independent check |
|---|---|---|
| Contract or source change | Build lead; Ponytail optional | Existing verifier, lint, build |
| React interface change | Second dev; Ponytail optional | Vercel React skill only if performance is in scope |
| Visual/accessibility pass | Second dev; Emil for one focused question | Impeccable detector/audit |
| Runtime interaction QA | Partner not owning the UI diff | Playwright MCP plus keyboard-only run |
| Accessibility handoff | Human tester | Accessibility Insights FastPass and screen-reader spot check |
| Multi-agent coordination | Current Codex/Claude harness and `AGENTS.md` lanes | Ruflo deferred |

For every agent task, include:

```text
Read AGENTS.md and docs/STATUS.md first.
Own only: <exact paths>.
Do not persist or upload thermal frames.
Do not classify replay pixels.
Do not say “safe to touch.”
Run: npm run verify:replay, npm run verify:preview, npm run lint, npm run build.
Report changed files, verification, and unresolved risks.
```

When two tools disagree, Ember’s safety rules, product scope, lane ownership, and verification results win.
