export function nodeMajor(version) {
  if (typeof version !== "string") {
    throw new TypeError("Node version must be a string");
  }

  const match = /^v?(\d+)(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(version);
  if (!match) {
    throw new Error(`Invalid Node version: ${version}`);
  }

  return Number(match[1]);
}
 
export function checkNode(min = 24, version = process.versions.node) {
  const major = nodeMajor(version);
  return { ok: major >= min, major, min };
}