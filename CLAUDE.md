# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a Claude Code harness-agent repository — a collection of custom **skills** (slash commands) that extend Claude Code's behavior. Skills are loaded by the Claude Code harness at runtime and invoked via the `Skill` tool.

## Architecture

Each skill lives in its own subdirectory and must contain a `SKILL.md` file at the root of that directory. The harness reads `SKILL.md` to decide when to auto-invoke the skill and how to run it.

```
<skill-name>/
  SKILL.md                  # Required: skill metadata + behavior spec (frontmatter + markdown)
  agents/<provider>.yaml    # Optional: agent interface config (display name, default prompt, policy)
  references/<topic>.md     # Optional: supplementary reference docs loaded on demand
```

### SKILL.md Frontmatter

```yaml
---
name: <skill-name>          # Matches the directory name; used as the slash-command handle
description: <...>          # One-line trigger description used by the harness for auto-invocation
---
```

The body is the behavioral spec — plain markdown that Claude reads to know how to execute the skill. Keep it precise and implementation-agnostic.

### `agents/<provider>.yaml` Format

```yaml
interface:
  display_name: "..."
  short_description: "..."
  default_prompt: "..."     # Injected when the skill is invoked without explicit args

policy:
  allow_implicit_invocation: true   # Whether the harness may auto-trigger without user typing the slash command
```

### `references/` Pattern

Heavy reference material (schemas, lookup tables, large examples) goes in `references/` and is referenced from `SKILL.md` with a "load this when…" instruction. This keeps the main spec concise and only pulls in detail when the task needs it.

## Current Skills

| Skill | Trigger | Purpose |
|---|---|---|
| `cost-planner` | Cost/budget/token estimation questions; broad or expensive tasks | Adds a lightweight budget layer: time ranges, token ranges, confidence, and execution modes (`quick` / `standard` / `thorough`) |

## Adding a New Skill

1. Create `<skill-name>/SKILL.md` with the frontmatter `name` and `description` fields.
2. Write the behavioral spec in the body — focus on what Claude should *do*, not how it works internally.
3. If the skill has heavy reference material, add `references/<topic>.md` and reference it from `SKILL.md`.
4. If the skill needs an agent interface config, add `agents/<provider>.yaml`.
