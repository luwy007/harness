export function chooseNextAction({ transcript }) {
  const last = transcript.at(-1);

  if (!last) {
    return {
      kind: "run_command",
      command: "npm test",
      reason: "verify the current failure before editing"
    };
  }

  if (last.action.kind === "run_command" && last.observation.exitCode === 0) {
    return {
      kind: "finish",
      success: true,
      message: "verification passed",
      reason: "tests are green"
    };
  }

  if (last.action.kind === "run_command" && last.observation.exitCode !== 0) {
    return {
      kind: "read_file",
      path: "src/calculator.js",
      reason: "inspect the likely implementation file"
    };
  }

  if (last.action.kind === "read_file") {
    const fixed = fixCalculatorSource(last.observation.content ?? "");

    if (!fixed.changed) {
      return {
        kind: "finish",
        success: false,
        message: "could not identify a safe calculator fix",
        reason: "source did not match the expected broken pattern"
      };
    }

    return {
      kind: "write_file",
      path: last.action.path,
      content: fixed.content,
      reason: "apply the minimal code change that matches the failing test"
    };
  }

  if (last.action.kind === "write_file" && last.observation.ok) {
    return {
      kind: "run_command",
      command: "npm test",
      reason: "rerun verification after the edit"
    };
  }

  return {
    kind: "finish",
    success: false,
    message: "planner reached an unsupported state",
    reason: "no next action matched the transcript"
  };
}

function fixCalculatorSource(source) {
  const next = source.replace("return a - b;", "return a + b;");
  return {
    changed: next !== source,
    content: next
  };
}
