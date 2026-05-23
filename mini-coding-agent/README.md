# Mini Coding Agent

A tiny, runnable coding-agent demo.

The demo intentionally keeps the "model" deterministic so the agent loop is easy
to inspect:

1. Run a verification command.
2. Read the relevant source file.
3. Apply a scoped code edit.
4. Run verification again.
5. Report the final result.

`npm run demo` copies the broken example into `.agent-runs/` before the agent
starts, so each run is clean and repeatable.

Later, `src/heuristic-model.js` can be replaced with an LLM-backed planner while
keeping the same tool boundary.

## Run

```bash
npm run demo
```

Expected result: the agent fixes the broken calculator example and finishes with
passing tests.

## Project Shape

```text
src/
  agent.js             # Agent loop
  heuristic-model.js   # Replaceable planner
  index.js             # CLI entry
  tools.js             # Sandboxed filesystem and command tools
examples/calculator/   # Small broken project for the demo
.agent-runs/           # Generated demo workspaces, ignored by git
test/                  # Unit tests for the agent tools/model
```

## Design

The important boundary is between the planner and tools. The planner only emits
actions; tools enforce path confinement, command allowlists, output limits, and
timeouts.
