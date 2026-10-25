import { test } from "node:test";
import assert from "node:assert/strict";
import { checkNode, nodeMajor } from "../../../toolkit/env.js";
 
test("reads the major version from a version string", () => {
  assert.equal(nodeMajor("24.11.0"), 24);
  assert.equal(nodeMajor("v26.0.1"), 26);
});
 
test("throws on a string that is not a version", () => {
  assert.throws(() => nodeMajor("latest"));
});
 
test("rejects a version below the minimum", () => {
  assert.deepEqual(checkNode(24, "22.21.0"), { ok: false, major: 22, min: 24 });
});
 
test("this machine runs Node 24 or newer", () => {
  const result = checkNode();
  assert.ok(result.ok, `Node ${result.major} is too old: install Node ${result.min}`);
});