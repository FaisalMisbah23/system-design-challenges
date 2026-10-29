// Part 3: check Little's law, L = lambda x W, on your own measurements,
// and compare L with the M/M/1 prediction from chapter 2.5.
import { writeFileSync } from "node:fs";
import { runLoad, spawnServer } from "../../../toolkit/load.js";
import { summarize } from "../../../toolkit/stats.js";
import { lineChart } from "../../../toolkit/chart.js";
 
const SERVICE_MS = 10;
const RATES = [50, 70, 80, 90];
const server = await spawnServer(new URL("../server.js", import.meta.url), { SERVICE_MS: String(SERVICE_MS) });
 
console.log("rate/s  lambda/s  W ms   L measured  lambda x W  M/M/1 L");
const points = [];
for (const rate of RATES) {
  const { latencies, throughput, inFlightAvg } = await runLoad({ url: server.url, rate, seconds: 15 });
  const W = summarize(latencies).mean / 1000; // seconds
  const rho = (throughput * SERVICE_MS) / 1000; // how busy the server was
  const mm1 = rho / (1 - rho); // chapter 2.5: L = rho / (1 - rho)
  points.push({ x: rate, measured: inFlightAvg, mm1 });
  console.log(
    `${String(rate).padStart(6)}  ${throughput.toFixed(1).padStart(8)}  ${(W * 1000).toFixed(1).padStart(5)}  ` +
    `${inFlightAvg.toFixed(2).padStart(10)}  ${(throughput * W).toFixed(2).padStart(10)}  ${mm1.toFixed(2).padStart(7)}`
  );
}
server.stop();
 
writeFileSync(new URL("./chart.svg", import.meta.url), lineChart({
  title: "Requests in flight (L): measured and M/M/1",
  xLabel: "requests per second",
  yLabel: "requests in flight",
  points,
  series: [{ key: "measured", color: "#2563eb" }, { key: "mm1", color: "#9ca3af" }],
}));
console.log("\nwrote chart.svg");