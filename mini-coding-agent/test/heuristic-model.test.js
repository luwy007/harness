import test from "node:test";
import assert from "node:assert/strict";
import { chooseNextAction } from "../src/heuristic-model.js";

test("starts by running tests", () => {
  const action = chooseNextAction({ task: "fix tests", transcript: [] });
  assert.equal(action.kind, "run_command");
  assert.equal(action.command, "npm test");
});

test("after a failing test run, reads the calculator source", () => {
  const action = chooseNextAction({
    task: "fix tests",
    transcript: [
      {
        action: { kind: "run_command", command: "npm test" },
        observation: { ok: true, exitCode: 1 }
      }
    ]
  });

  assert.equal(action.kind, "read_file");
  assert.equal(action.path, "src/calculator.js");
});
