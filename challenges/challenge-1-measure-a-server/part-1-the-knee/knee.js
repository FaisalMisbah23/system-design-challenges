// Part 1: raise the request rate step by step and watch p50 and p99.
import { writeFileSync } from "node:fs";
import { runLoad, spawnServer } from "../../../toolkit/load.js";
import { summarize } from "../../../toolkit/stats.js";
import { lineChart } from "../../../toolkit/chart.js";
 
const SERVICE_MS = 10; // average work per request, so capacity is about 100 per second
const SECONDS = Number(process.env.STEP_SECONDS ?? 10); // how long each step runs
const RATES = [20, 40, 60, 70, 80, 85, 90, 95]; // requests per second
 
const server = await spawnServer(new URL("../server.js", import.meta.url), { SERVICE_MS: String(SERVICE_MS) });
const capacity = 1000 / SERVICE_MS;
console.log(`service time ${SERVICE_MS} ms, so capacity is about ${capacity} requests per second\n`);
console.log("rate/s  busy  p50 ms  p95 ms  p99 ms  mean ms  M/M/1 mean");
 
const points = [];
for (const rate of RATES) {
  const { latencies } = await runLoad({ url: server.url, rate, seconds: SECONDS });
  const s = summarize(latencies);
  const busy = Math.round((rate / capacity) * 100);
  const mm1 = 1000 / (capacity - rate); // chapter 2.5: W = 1 / (mu - lambda), in ms
  points.push({ x: rate, p50: s.p50, p99: s.p99 });
  console.log(
    `${String(rate).padStart(6)}  ${String(busy).padStart(3)}%  ${s.p50.toFixed(1).padStart(6)}  ` +
    `${s.p95.toFixed(1).padStart(6)}  ${s.p99.toFixed(1).padStart(6)}  ${s.mean.toFixed(1).padStart(7)}  ` +
    `${mm1.toFixed(1).padStart(10)}`
  );
}
server.stop();
 
writeFileSync(new URL("./chart.svg", import.meta.url), lineChart({
  title: `Latency as load grows (service time ${SERVICE_MS} ms)`,
  xLabel: "requests per second",
  yLabel: "milliseconds",
  points,
  series: [{ key: "p50", color: "#2563eb" }, { key: "p99", color: "#dc2626" }],
}));
console.log("\nwrote chart.svg");