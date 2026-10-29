// A tiny HTTP server with a simulated service time.
// The work below blocks the event loop, so this server is one worker:
// a request that arrives while another is being served waits its turn.
import http from "node:http";
import { exponential, seededRandom } from "../../toolkit/stats.js";
 
const SERVICE_MS = Number(process.env.SERVICE_MS ?? 10); // average work per request
const DIST = process.env.DIST ?? "exp"; // "exp": random around the average; "fixed": always the same
const SLOW_CHANCE = Number(process.env.SLOW_CHANCE ?? 0); // share of requests that also wait
const SLOW_MS = Number(process.env.SLOW_MS ?? 0); // how long those slow requests wait
 
const random = seededRandom(1);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
 
function busyWork(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // spin: this loop is the "work"
  }
}
 
const server = http.createServer(async (req, res) => {
  // A few requests wait for something slow, like a cold disk. They wait
  // without blocking, so other requests keep being served meanwhile.
  if (random() < SLOW_CHANCE) await sleep(SLOW_MS);
  busyWork(DIST === "exp" ? exponential(random, SERVICE_MS) : SERVICE_MS);
  res.end("ok\n");
});
 
// Port 0 asks the operating system for any free port.
server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  if (process.send) process.send({ port }); // started by toolkit/load.js
  else console.log(`listening on http://127.0.0.1:${port}/ (service ${SERVICE_MS} ms, ${DIST})`);
});