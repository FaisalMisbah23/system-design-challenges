import test from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../../../toolkit/stats.js";
 
test("the mean is a time no request took", () => {
  const ms = [...Array(98).fill(1), 200, 200]; // 2 slow calls in 100
  const s = summarize(ms);
  assert.equal(s.p50, 1);
  assert.equal(s.p99, 200);
  assert.equal(s.mean, 4.98);
  assert.ok(!ms.includes(s.mean));
});
 
test("one slow call in 100 can hide below p99", () => {
  const ms = [...Array(99).fill(1), 200];
  assert.equal(summarize(ms).p99, 1); // the 99th of 100 sorted values is still fast
  assert.equal(summarize(ms).max, 200);
});
 
test("fan-out makes slow pages common", () => {
  const slowPage = (calls, chance) => 1 - (1 - chance) ** calls;
  assert.ok(Math.abs(slowPage(1, 0.01) - 0.01) < 1e-9);
  assert.ok(Math.abs(slowPage(100, 0.01) - 0.634) < 0.001);
  assert.ok(Math.abs(slowPage(20, 0.02) - 0.332) < 0.001);
});