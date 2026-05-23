import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { resolveInside } from "../src/tools.js";

test("resolveInside accepts paths inside the workspace", () => {
  const root = path.resolve("tmp/workspace");
  assert.equal(resolveInside(root, "src/file.js"), path.join(root, "src/file.js"));
});

test("resolveInside rejects path traversal", () => {
  const root = path.resolve("tmp/workspace");
  assert.throws(() => resolveInside(root, "../secret.txt"), /escapes workspace/);
});
