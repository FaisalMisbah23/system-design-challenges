// toolkit/load.js: start a server in its own process, and send it requests
// at a target rate (an open-loop load generator).
import http from "node:http";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { exponential, seededRandom } from "./stats.js";
 
// Start a server script as a child process. The script must send { port }
// to its parent once it is listening. Its own process means its busy work
// cannot slow down the load generator.
export function spawnServer(scriptUrl, env = {}) {
  const child = fork(fileURLToPath(scriptUrl), { env: { ...process.env, ...env } });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("message", ({ port }) => {
      resolve({ url: `http://127.0.0.1:${port}/`, stop: () => child.kill() });
    });
  });
}
 
const agent = new http.Agent({ keepAlive: true, maxSockets: Infinity });
 
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { agent }, (res) => {
      res.resume();
      res.on("end", resolve);
    }).on("error", reject);
  });
}
 
// Wait until a moment in time. Timers on Windows tick about every 15 ms,
// too coarse here, so check the clock in a loop that still lets answers in.
async function waitUntil(t) {
  while (performance.now() < t) await new Promise((resolve) => setImmediate(resolve));
}
 
// Send requests at `rate` per second for `seconds`, at random moments, like
// independent users. Each request calls the server `fanout` times in
// parallel and finishes when all calls are back.
export async function runLoad({ url, rate, seconds, fanout = 1, seed = 7 }) {
  const random = seededRandom(seed);
  const latencies = [];
  const pending = [];
  // For Little's law: add up "requests in flight x time" as time passes.
  let inFlight = 0;
  let area = 0;
  let lastChange = performance.now();
  const change = (delta) => {
    const now = performance.now();
    area += inFlight * (now - lastChange);
    lastChange = now;
    inFlight += delta;
  };
 
  const start = performance.now();
  const stop = start + seconds * 1000;
  let planned = start;
  while (true) {
    planned += exponential(random, 1000 / rate);
    if (planned > stop) break;
    await waitUntil(planned);
    const sentAt = performance.now(); // within a fraction of a ms of `planned`
    change(+1);
    const calls = Array.from({ length: fanout }, () => get(url));
    pending.push(Promise.all(calls).then(() => {
      change(-1);
      latencies.push(performance.now() - sentAt);
    }));
  }
  await Promise.all(pending);
  change(0);
  const elapsed = performance.now() - start;
  return {
    latencies,
    throughput: latencies.length / (elapsed / 1000), // lambda: finished per second
    inFlightAvg: area / elapsed, // L: average requests in flight
  };
}