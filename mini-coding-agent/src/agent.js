import { createTools } from "./tools.js";
import { chooseNextAction } from "./heuristic-model.js";

export async function runAgent({ task, workspace, maxSteps = 8, log = () => {} }) {
  const tools = createTools({ workspace });
  const transcript = [];

  log({
    type: "agent",
    message: "starting",
    detail: `task="${task}" workspace=${workspace}`
  });

  for (let step = 1; step <= maxSteps; step += 1) {
    const action = chooseNextAction({ task, transcript });

    log({
      type: "plan",
      message: `step ${step}: ${action.reason}`,
      detail: action.kind
    });

    if (action.kind === "finish") {
      return {
        success: action.success,
        message: action.message,
        transcript
      };
    }

    const observation = await executeAction({ action, tools });
    transcript.push({ action, observation });

    log({
      type: observation.ok ? "tool" : "error",
      message: action.kind,
      detail: summarizeObservation(observation)
    });
  }

  return {
    success: false,
    message: `reached max step limit (${maxSteps})`,
    transcript
  };
}

async function executeAction({ action, tools }) {
  if (action.kind === "list_files") {
    return tools.listFiles(action);
  }

  if (action.kind === "read_file") {
    return tools.readFile(action);
  }

  if (action.kind === "write_file") {
    return tools.writeFile(action);
  }

  if (action.kind === "run_command") {
    return tools.runCommand(action);
  }

  return {
    ok: false,
    error: `unknown action kind: ${action.kind}`
  };
}

function summarizeObservation(observation) {
  if (!observation.ok) {
    return observation.error;
  }

  if (typeof observation.exitCode === "number") {
    return `exit=${observation.exitCode}`;
  }

  if (observation.files) {
    return `${observation.files.length} files`;
  }

  if (observation.bytes) {
    return `${observation.bytes} bytes`;
  }

  return "ok";
}
