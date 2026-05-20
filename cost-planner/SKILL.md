---
name: cost-planner
description: Estimate Codex task execution cost before and during work. Use when a user asks about Codex cost planning, token/time estimation, execution budget, quick/standard/thorough modes, cost-aware planning, or when a task is broad, uncertain, likely to run expensive tools, likely to consume substantial context, or should be discussed before execution.
---

# Cost Planner

Use this skill to add a lightweight budget layer to Codex work. Produce useful ranges, confidence, and choices rather than pretending to know exact cost.

## Core Behavior

Before substantial work, estimate:

- Time cost: wall-clock ranges for each step and the total task.
- Token cost: context and generation ranges for each step and the total task.
- Cost drivers: file reads, search breadth, test/build logs, browser QA, dependency installs, CI/deploy waits, large generated artifacts, or repeated repair loops.
- Confidence: `high`, `medium`, or `low`, with the main uncertainty.
- Execution mode: `quick`, `standard`, or `thorough`.

Skip visible budget output for trivial requests that are clearly cheap, such as answering a narrow question, running a tiny local command, or editing a single obvious string. Still keep a small internal budget.

## First Response Pattern

For complex or uncertain tasks, start with a compact budget card:

```text
I can approach this in standard mode.

Estimated cost:
- Time: 4-8 min
- Tokens: 20k-45k
- Confidence: medium

Main cost drivers:
- Reading related implementation and tests
- Running targeted verification
- Possible second repair loop if tests expose more failures

Modes:
- Quick: 1-3 min, 5k-15k tokens, narrow inspection only
- Standard: 4-8 min, 20k-45k tokens, edit plus targeted verification
- Thorough: 10-25 min, 60k-120k tokens, broader search, tests, and QA
```

If the user has not asked to discuss first and the default is obvious, state the selected mode briefly and proceed. Ask for confirmation only when the budget is high, the mode choice changes the outcome materially, or a high-cost action needs approval.

## Estimation Workflow

1. Classify the task.
   - `tiny`: direct answer, simple command, single-line change.
   - `small`: one or two files, obvious local behavior, targeted verification.
   - `medium`: several files, some exploration, likely tests or build.
   - `large`: broad refactor, whole-app QA, PR review, migration, documentation suite, deploy flow.
   - `open-ended`: ambiguous scope, research-heavy, likely multiple iterations.

2. Build a step plan.
   - Keep steps user-meaningful: inspect, read, edit, verify, report.
   - Avoid exposing internal chain-of-thought or hidden reasoning.
   - Include high-cost gates such as full test suites, browser QA, dependency installation, image generation, deployment, and CI waits.

3. Estimate each step.
   - Use ranges, not single-point numbers.
   - Use broader ranges when repository size, tests, dependencies, or target files are unknown.
   - Call out non-model waiting time separately when relevant.

4. Select a mode.
   - `quick`: minimize reads and verification; best for triage or urgent fixes.
   - `standard`: balanced inspection, implementation, and targeted verification; default for most coding tasks.
   - `thorough`: broader search, stronger verification, more edge cases; use for risky or user-facing changes.

5. Update during execution.
   - After initial inspection, revise the estimate if the task is much smaller or larger than expected.
   - Before high-cost tools, say why they are worth it and give a narrower estimate.
   - If nearing a stated budget cap, pause and ask before continuing.

6. Close with actuals when useful.
   - Include wall-clock elapsed time if available.
   - Include approximate token usage if the runtime exposes it; otherwise say `token actuals not available in this environment`.
   - Note the main reason the estimate was accurate or off.

## Heuristics

Use these starting points, then adjust to local evidence:

| Task class | Time | Tokens | Confidence |
| --- | ---: | ---: | --- |
| tiny | <1 min | <3k | high |
| small | 1-4 min | 5k-20k | medium-high |
| medium | 4-12 min | 20k-70k | medium |
| large | 12-45 min | 70k-200k+ | low-medium |
| open-ended | 15 min+ | 80k+ | low |

Common multipliers:

- Unknown repo shape: widen ranges by 1.5x until inspection.
- Large test/build output: add 2k-20k tokens, sometimes more if logs are not truncated.
- Browser QA: add 2-10 min and 5k-25k tokens depending on pages and viewports.
- Full test suite: use historical command timing when available; otherwise estimate 2-20 min.
- Dependency install or network fetch: time confidence is low; token cost is usually low unless logs are long.
- Multi-agent or parallel exploration: wall-clock may drop, token cost usually rises.

## Output Rules

- Be transparent but concise.
- Prefer `about`, `roughly`, and ranges.
- Never claim exact token cost unless actual metering is available.
- Do not block small tasks with ceremony.
- Treat estimates as user-control surfaces, not billing guarantees.
- If the user explicitly asks to discuss feasibility, stay in discussion mode and do not execute code changes until they ask.

## Runtime Integration Notes

When designing or modifying Codex itself, map this skill to three product surfaces:

- Planner: generate a structured budget before execution.
- Tool dispatcher: add high-cost gates before expensive commands or artifact generation.
- UI: show budget cards, mode selection, live revisions, and estimated-vs-actual completion summaries.

For structured output fields and examples, read `references/budget-schema.md` when the task involves implementation, telemetry, UI integration, or schema design.
