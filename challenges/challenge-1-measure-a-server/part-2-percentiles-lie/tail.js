// Part 2: 2 calls in 100 are slow. Compare the mean with the percentiles,
// then make each page call the server several times and watch the tail grow.
import { writeFileSync } from "node:fs";
import { runLoad, spawnServer } from "../../../toolkit/load.js";
import { summarize } from "../../../toolkit/stats.js";
import { lineChart } from "../../../toolkit/chart.js";
 
const SLOW_CHANCE = 0.02; // 2 calls in 100 wait for something slow
const SLOW_MS = 200;
const FANOUTS = [1, 2, 5, 10, 20]; // calls per page
 
const server = await spawnServer(new URL("../server.js", import.meta.url), {
  SERVICE_MS: "0", SLOW_CHANCE: String(SLOW_CHANCE), SLOW_MS: String(SLOW_MS),
});
console.log(`each call is slow (${SLOW_MS} ms) with chance ${SLOW_CHANCE}; other calls are almost free\n`);
console.log("calls/page  mean ms  p50 ms  p95 ms  p99 ms  slow pages (predicted)");
 
const points = [];
for (const fanout of FANOUTS) {
  const { latencies } = await runLoad({ url: server.url, rate: 40, seconds: 10, fanout });
  const s = summarize(latencies);
  const slowShare = latencies.filter((ms) => ms >= SLOW_MS).length / latencies.length;
  const predicted = 1 - (1 - SLOW_CHANCE) ** fanout; // chapter 2.4
  points.push({ x: fanout, p50: s.p50, p95: s.p95 });
  const f = (n) => n.toFixed(1).padStart(6);
  console.log(
    `${String(fanout).padStart(10)}  ${f(s.mean).padStart(7)}  ${f(s.p50)}  ${f(s.p95)}  ${f(s.p99)}  ` +
    `${(slowShare * 100).toFixed(0).padStart(6)}% (${(predicted * 100).toFixed(0)}%)`
  );
}
server.stop();
 
writeFileSync(new URL("./chart.svg", import.meta.url), lineChart({
  title: "Fan-out: more calls per page, slower pages",
  xLabel: "calls per page",
  yLabel: "milliseconds",
  points,
  series: [{ key: "p50", color: "#2563eb" }, { key: "p95", color: "#dc2626" }],
}));
console.log("\nwrote chart.svg");