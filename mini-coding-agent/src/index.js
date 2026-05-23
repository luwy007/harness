#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runAgent } from "./agent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    workspace: ".agent-runs/calculator",
    template: "examples/calculator",
    task: "fix the failing tests",
    maxSteps: 8
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--workspace") {
      args.workspace = argv[++i];
    } else if (arg === "--template") {
      args.template = argv[++i];
    } else if (arg === "--task") {
      args.task = argv[++i];
    } else if (arg === "--max-steps") {
      args.maxSteps = Number(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`mini-coding-agent

Usage:
  node src/index.js --template examples/calculator --workspace .agent-runs/calculator --task "fix the failing tests"

Options:
  --template    Optional project template copied before the run
  --workspace   Project directory relative to mini-coding-agent
  --task        Coding task for the agent
  --max-steps   Maximum loop iterations, default 8
`);
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const workspace = path.resolve(projectRoot, args.workspace);

if (args.template) {
  await prepareWorkspaceFromTemplate({
    template: path.resolve(projectRoot, args.template),
    workspace
  });
}

const result = await runAgent({
  task: args.task,
  workspace,
  maxSteps: args.maxSteps,
  log: (event) => {
    const detail = event.detail ? ` ${event.detail}` : "";
    console.log(`[${event.type}] ${event.message}${detail}`);
  }
});

if (!result.success) {
  console.error(`\nAgent stopped: ${result.message}`);
  process.exit(1);
}

console.log(`\nAgent finished: ${result.message}`);

async function prepareWorkspaceFromTemplate({ template, workspace }) {
  assertInsideProject(template, "template");
  assertInsideProject(workspace, "workspace");

  const relativeWorkspace = path.relative(projectRoot, workspace);
  if (!relativeWorkspace.startsWith(".agent-runs")) {
    throw new Error("template runs must write to .agent-runs/");
  }

  await fs.rm(workspace, { recursive: true, force: true });
  await fs.mkdir(path.dirname(workspace), { recursive: true });
  await fs.cp(template, workspace, {
    recursive: true,
    filter: (source) => !source.includes(`${path.sep}node_modules${path.sep}`)
  });
}

function assertInsideProject(target, label) {
  const relative = path.relative(projectRoot, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside mini-coding-agent`);
  }
}
