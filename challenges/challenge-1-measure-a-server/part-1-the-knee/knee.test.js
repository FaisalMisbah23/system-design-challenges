import test from "node:test";
import assert from "node:assert/strict";
import { percentile, summarize } from "../../../toolkit/stats.js";
import { runLoad, spawnServer } from "../../../toolkit/load.js";
 
test("percentile uses the nearest rank", () => {
  const ms = [40, 100, 30, 20, 50];
  assert.equal(percentile(ms, 50), 40);
  assert.equal(percentile(ms, 0), 20);
  assert.equal(percentile(ms, 100), 100);
  assert.ok(Number.isNaN(percentile([], 50)));
  assert.throws(() => percentile(ms, 101), RangeError);
});
 
test("summarize reports the mean and the percentiles", () => {
  const s = summarize([10, 20, 30, 40]);
  assert.deepEqual(s, { count: 4, mean: 25, p50: 20, p95: 40, p99: 40, max: 40 });
});
 
test("a quiet server answers in about one service time", async () => {
  const server = await spawnServer(new URL("../server.js", import.meta.url), { SERVICE_MS: "10", DIST: "fixed" });
  try {
    const { latencies } = await runLoad({ url: server.url, rate: 10, seconds: 2 });
    assert.ok(latencies.length >= 10, `only ${latencies.length} answers`);
    const p50 = percentile(latencies, 50);
    assert.ok(p50 >= 10, `p50 was ${p50.toFixed(1)} ms, less than the 10 ms of work`);
    assert.ok(p50 < 100, `p50 was ${p50.toFixed(1)} ms, far more than 10 ms of work`);
  } finally {
    server.stop();
  }
});