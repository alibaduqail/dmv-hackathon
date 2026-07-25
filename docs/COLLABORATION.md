# COLLABORATION.md — two people, many tools, one product truth

This is the partner onboarding and parallel-work playbook. `AGENTS.md` remains the source of truth; `.agents/skills/ember-collaboration/SKILL.md` turns these rules into a reusable agent workflow. Claude Code reaches the same canonical files through `.claude/skills/ember-collaboration`. Optional tool research and setup live in `docs/AGENT-TOOLS.md`.

The goal is not to keep every agent busy. The goal is to reach Ember’s next demo gate without conflicting edits, unreviewed safety language, or work that only one person understands.

---

## 1. Join the project in ten minutes

### Fresh clone

```sh
git clone https://github.com/alibaduqail/dmv-hackathon.git
cd dmv-hackathon
git fetch origin
git switch --track origin/codex/ember
node --version
npm ci
npm run verify:hardening
```

### Existing clone

Preserve local work before switching. Then:

```sh
git fetch origin
git switch codex/ember
git pull --ff-only
node --version
npm ci
npm run verify:hardening
```

Open the local app:

```sh
npm run dev
```

Vite prints the URL. Verify `#scan` and `#history` before starting a feature.

The reported Node version must be 22.12 or newer. Builders who use `nvm` can run `nvm use` to select the committed `.nvmrc`.

### Read in this order

1. `AGENTS.md` — safety, vocabulary, current boundary.
2. `mvp.md` — product, audience, claims, and scope.
3. `docs/STATUS.md` — what is actually built and unproven.
4. `docs/REQUIREMENTS.md` — stable requirement IDs and phase acceptance.
5. `docs/ARCHITECTURE.md` — trust boundaries, lifecycle, protocol, and placement.
6. `docs/SCHEMA.md` — implemented types and invariants.
7. `docs/PLAN.md` — schedule, lanes, and exit gates.
8. `docs/DEMO.md` — the experience the team must demonstrate.
9. `docs/AGENT-TOOLS.md` — optional agent tooling; do not install everything by default.

If code and source-of-truth prose disagree, stop and make the code conform by default. A specification or contract change requires an explicit team decision, the designated documentation owner, and an entry in `docs/DECISIONS.md`; implementation drift cannot rewrite product truth.

---

## 2. Know the baseline

The committed foundation currently proves:

- A Vite, React, TypeScript, and Tailwind application.
- `#scan` as the default route and `#history` as an honest empty state.
- A six-frame, 160 × 120 simulated replay.
- Start, pause, resume, restart, stop, completion, and cleanup.
- Visible replay provenance: **“Demo replay — not live”**.
- Keyboard-sized controls, visible focus, text status, and a non-color status symbol.
- Phase 1A is closed with calibrated radiometry blocked; `docs/HARDWARE-PROBE.md` records the attached USB/UVC evidence and missing Y16/calibration proof.
- The Phase 1D browser preview adapter, session, interface, and fake-MediaDevices verification are implemented; its attached-device gate is blocked after the intended input did not play by the 16:15 cutoff.
- Phase 4 hardening is in progress: use `npm run verify:hardening` and `npm run demo:offline`; do not claim offline behavior until the production browser rehearsal is repeated with external networking physically disconnected.
- No hotspot classification, speech, model endpoint, notifications, or persisted history is implemented.

Describe Phase 1D precisely: the local display-only path is implemented and its source lifecycle is verified with fakes, while the attached-device gate is blocked and Replay is the submission path. React source-switch and route cleanup remain code/manual evidence, not `verify:preview` coverage. The team may explicitly reopen the hardware gate only before the 17:30 freeze by completing two actual-browser playback/cleanup runs and recording the result. Neither path proves temperature accuracy, direction, warning behavior, or touch safety.

---

## 3. Split work by files, not by vague goals

Before work begins, write a claim in the team chat:

```text
CLAIM
Owner: <name>
Outcome: <one demo-visible or infrastructure result>
Branch: <short-lived branch>
Files: <explicit paths or globs>
Off limits: <shared files this lane must not touch>
Acceptance: <commands and manual behavior>
Expected handoff: <time>
```

Recommended lanes:

| Lane | Primary owner | Owned paths | Coordinate before touching |
|---|---|---|---|
| UVC device preflight and preview adapter | Builder A | future `src/lib/uvc-preview-source.ts`, focused preview verifier | shared preview/session contract |
| Preview session and accessible viewport | Builder B | future preview session hook, `src/features/**`, `src/styles/**` | `src/types.ts`, preview adapter API |
| Radiometric hardware/bridge | Blocked future lane | future `native/purethermal-bridge/**` | requires a new calibrated Phase 1A pass |
| Deterministic analysis | Blocked future lane | future validator and assessment module | requires passed radiometric transport; never preview pixels |
| Replay and verification | Builder A | `src/fixtures/**`, `public/replay/**`, `scripts/**` | manifest contracts |
| Documentation and submission | designated writer | `docs/**`, `mvp.md`, root instructions | behavior claims from both builders |

One owner controls a path at a time. A research or review agent should usually return findings, not edit an implementation owner’s files.

### Good parallel split

- Builder A proves authorize/discover cleanup plus exact operator-selected PureThermal input matching and implements page-hide/track lifecycle behind a locked preview adapter.
- Builder B implements the replay-frame/live-`MediaStream` viewport after the adapter contract handoff.
- Builder A writes fake-MediaDevices cleanup checks while Builder B runs keyboard and source-truth QA.
- A design specialist critiques screenshots and returns a checklist without editing thermal contracts.
- A review agent checks the combined diff after both lanes land.

### Bad parallel split

- Two agents both refactor `src/types.ts`.
- Two orchestrators recursively delegate the same feature.
- A design agent changes preview provenance or warning copy while an implementation agent changes the same component.
- An agent snapshots or analyzes UVC pixels to “recover” temperature or direction after the radiometric gate failed.
- An agent “cleans up” unrelated files while another builder has uncommitted work.

---

## 4. Branch and integration workflow

`codex/ember` is the shared integration branch. Do not push feature work directly to `main`.

Create a short-lived branch from the latest integration state:

```sh
git switch codex/ember
git pull --ff-only
git switch -c <initials>/<bounded-lane>
```

Examples:

```text
ad/preview-lifecycle
partner/uvc-preview
codex/accessibility-qa
```

During the lane:

1. Commit one coherent, working increment at a time.
2. Rebase or merge only after checking whether another owner touched the same files.
3. Run the full shared verification gate before handoff.
4. Give the integration owner the commit hash and handoff record.
5. Let one integration owner update and push `codex/ember`.

Never force-push, rewrite shared history, or use destructive cleanup commands on a collaborator’s worktree.

---

## 5. Give agents bounded prompts

Every implementation prompt should include:

```text
Product:
Ember is a handheld thermal companion for blind and low-vision users.

Outcome:
<one concrete result>

Read first:
AGENTS.md and the task-specific docs.

Owned files:
<explicit list>

Off limits:
<explicit list>

Hard rules:
Never promise touch safety. Classification is deterministic. Warnings require
text plus a non-color cue. Frames are ephemeral. Replay stays visibly labelled.

Acceptance:
<focused checks>
npm run verify:replay
npm run verify:preview
npm run lint
npm run build
npm run verify:offline

Handoff:
Return files changed, behavior proven, checks run, and open risks. Do not push
or merge unless explicitly assigned as integration owner.
```

For design-only work, ask for a critique, tokens, wireframe, or patch limited to interface files. For research, require official sources and ask the agent to separate confirmed facts from recommendations. For review, provide a fixed commit or branch boundary.

---

## 6. Use the optional tool stack without creating chaos

The named tools solve different problems. Their verified identities, setup commands, current limitations, and primary sources are in `docs/AGENT-TOOLS.md`.

Apply these role boundaries regardless of tool:

| Role | May do | Must not do alone |
|---|---|---|
| Coordinator/orchestrator | Split independent lanes, track outcomes, consolidate handoffs | Run a second orchestrator over the same files; merge unreviewed work |
| Coding agent | Implement a bounded file-owned task and run checks | Change product scope or shared contracts silently |
| Design specialist | Critique hierarchy, accessibility, states, and craft | Weaken safety copy, hide provenance, or make color/speech essential |
| Research agent | Verify hardware/tool behavior against primary sources | Present assumptions as working integration |
| Review agent | Inspect a fixed diff and rank actionable findings | Rewrite the feature while reviewing it |

Start with the smallest tool set that closes the current gap. Installing four overlapping tools immediately adds prompt conflicts, permissions, and update risk without improving the demo.

Agent configuration belongs in contributor-only folders. Do not add agent SDKs, orchestration runtimes, or design tools to `dependencies` or `devDependencies` unless the application itself has a reviewed need for them.

---

## 7. Review safety and accessibility before accepting work

For every interface or copy change, answer:

- Does any sentence imply “safe,” “all clear,” “no burn risk,” or guaranteed touch safety?
- Did deterministic code—not a model—select the assessment?
- Is every warning understandable through visible words and a non-color symbol?
- Does the flow remain complete with sound muted and color unavailable?
- Is replay provenance visible adjacent to the viewport for the entire replay?
- Are controls keyboard operable, visibly focused, named, and at least 44 × 44 CSS pixels?
- Does leaving the route stop timers or live capture and invalidate current output?
- Are frames absent from logs, storage, analytics, and network calls by default?
- Does the handoff distinguish simulated, live, tested, and planned behavior?

A “no” blocks integration.

---

## 8. Keep documentation synchronized

Documentation is part of the increment, not cleanup for the end.

| Change | Update |
|---|---|
| Requirement or acceptance change | `docs/REQUIREMENTS.md` and `docs/DECISIONS.md` |
| Shared type, invariant, or callback | `docs/SCHEMA.md` and `docs/DECISIONS.md` |
| New file, transport, or layer boundary | `docs/ARCHITECTURE.md` |
| Install step, native prerequisite, or command | `docs/SETUP.md` |
| Completed work, failed proof, or current blocker | `docs/STATUS.md` |
| Demo-visible behavior or cut | `docs/DEMO.md` and possibly `docs/PLAN.md` |
| New agent tool or trust decision | `docs/AGENT-TOOLS.md` |

Use evidence-based language:

- **Built:** exists in the current commit.
- **Verified:** named command or manual check was run.
- **Simulated:** replay or fixture, visibly labelled.
- **Planned:** not present yet.
- **Blocked:** state the missing input and the next proof.

---

## 9. Handoff before switching lanes

Paste this into the team chat or pull request:

```text
HANDOFF
Outcome:
Branch:
Commit:
Files changed:
Behavior now:
Verification run:
Manual checks:
Safety/provenance review:
Known limitations:
Open risks or blockers:
Next exact action:
```

Also append a concise line to `docs/DECISIONS.md` when a contract changes, a demo beat is cut, a hardware assumption is disproved, or a choice would surprise the next builder.

The next person should be able to continue without reconstructing the prior agent’s conversation.

---

## 10. Shared definition of done

A lane is ready to integrate when:

1. It meets the stated acceptance behavior.
2. Focused checks pass.
3. All shared checks pass:

   ```sh
   npm run verify:hardening
   ```

4. The diff contains no secrets, obsolete product language, unowned changes, or accidental generated output.
5. Safety, accessibility, privacy, and replay provenance were reviewed.
6. The owning documents and handoff are current.
7. Another builder can explain what is proven and what remains unproven.

At 17:30, stop product changes. From then to 19:00, use the same ownership and handoff rules for the captioned demo, README, screenshots, and submission.
