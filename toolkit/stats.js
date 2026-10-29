// toolkit/stats.js: small statistics helpers. No packages needed.

// Nearest rank: sort a copy, rank = ceil(p * n / 100) (at least 1), return the value at that rank.
export function percentile(values, p) {
    if (typeof p !== "number" || Number.isNaN(p) || p < 0 || p > 100) {
        throw new RangeError(`p must be a number between 0 and 100 got ${p}`)
    }

    if (values.length === 0) return NaN;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const rank = Math.max(1, Math.ceil((p * n) / 100));
    return sorted[rank - 1];

}

// The numbers a results table needs, from a list of latencies in ms.
export function summarize(latencies) {
    const mean = latencies.reduce((sum, x) => sum + x, 0) / latencies.length;
    return {
        count: latencies.length,
        mean,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        max: percentile(latencies, 100),
    };
}

// Seeded random numbers (the mulberry32 method): the same seed gives the
// same numbers, so two runs send the same pattern of requests.
export function seededRandom(seed) {
    let a = seed >>> 0;
    return function random() {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// A random duration with the given mean, shaped like independent events:
// many short ones and a few long ones (an exponential distribution).
export function exponential(random, mean) {
    return -mean * Math.log(1 - random());
}