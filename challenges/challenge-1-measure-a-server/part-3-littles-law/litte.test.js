import test from "node:test";
import assert from "node:assert/strict";
import { runLoad, spawnServer } from "../../../toolkit/load.js";
import { summarize } from "../../../toolkit/stats.js";
 
test("L equals lambda times W on a real run", async () => {
  const server = await spawnServer(new URL("../server.js", import.meta.url), { SERVICE_MS: "5" });
  try {
    const { latencies, throughput, inFlightAvg } = await runLoad({ url: server.url, rate: 50, seconds: 3 });
    const W = summarize(latencies).mean / 1000;
    const predicted = throughput * W;
    const gap = Math.abs(inFlightAvg - predicted) / predicted;
    assert.ok(gap < 0.05, `L ${inFlightAvg.toFixed(2)} and lambda x W ${predicted.toFixed(2)} differ by ${(gap * 100).toFixed(1)}%`);
  } finally {
    server.stop();
  }
});