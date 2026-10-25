import { checkNode } from "../../../toolkit/env.js";
 
const result = checkNode();
console.log(`Node ${process.versions.node}: ${result.ok ? "OK" : "too old"} (need ${result.min} or newer)`);
process.exitCode = result.ok ? 0 : 1;