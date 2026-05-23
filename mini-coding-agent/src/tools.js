import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_OUTPUT = 12_000;
const ALLOWED_COMMANDS = new Set(["npm test", "node --test"]);

export function createTools({ workspace }) {
  const root = path.resolve(workspace);

  return {
    async listFiles() {
      try {
        const files = await walk(root, root);
        return { ok: true, files };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    },

    async readFile({ path: relativePath }) {
      try {
        const filePath = resolveInside(root, relativePath);
        const content = await fs.readFile(filePath, "utf8");
        return { ok: true, content, bytes: Buffer.byteLength(content) };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    },

    async writeFile({ path: relativePath, content }) {
      try {
        const filePath = resolveInside(root, relativePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, "utf8");
        return { ok: true, bytes: Buffer.byteLength(content) };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    },

    async runCommand({ command, timeoutMs = DEFAULT_TIMEOUT_MS }) {
      if (!ALLOWED_COMMANDS.has(command)) {
        return { ok: false, error: `command is not allowed: ${command}` };
      }

      return runShellCommand({
        command,
        cwd: root,
        timeoutMs,
        maxOutput: DEFAULT_MAX_OUTPUT
      });
    }
  };
}

export function resolveInside(root, relativePath) {
  const resolved = path.resolve(root, relativePath);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (resolved !== root && !resolved.startsWith(rootWithSeparator)) {
    throw new Error(`path escapes workspace: ${relativePath}`);
  }

  return resolved;
}

async function walk(root, current) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(root, fullPath));
    } else if (entry.isFile()) {
      files.push(path.relative(root, fullPath));
    }
  }

  return files.sort();
}

function runShellCommand({ command, cwd, timeoutMs, maxOutput }) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout = appendLimited(stdout, chunk.toString(), maxOutput);
    });

    child.stderr.on("data", (chunk) => {
      stderr = appendLimited(stderr, chunk.toString(), maxOutput);
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        ok: !timedOut,
        exitCode,
        stdout,
        stderr,
        error: timedOut ? `command timed out after ${timeoutMs}ms` : undefined
      });
    });
  });
}

function appendLimited(current, next, limit) {
  const combined = current + next;
  if (combined.length <= limit) {
    return combined;
  }

  return combined.slice(combined.length - limit);
}
