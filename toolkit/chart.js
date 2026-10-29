// toolkit/chart.js: draw a small line chart as SVG text, one line per series.
// points: [{ x: 20, p50: 8.4, p99: 58.4 }, ...]; series: [{ key: "p50", color: "#2563eb" }]
export function lineChart({ title, xLabel, yLabel, points, series }) {
  const W = 560, H = 340, L = 60, R = 24, T = 44, B = 50;
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMax = Math.max(...points.flatMap((p) => series.map((s) => p[s.key])));
  const X = (x) => L + ((x - xMin) / (xMax - xMin || 1)) * (W - L - R);
  const Y = (y) => H - B - (y / (yMax || 1)) * (H - T - B);
  const lines = series.map((s) => {
    const d = points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p[s.key]).toFixed(1)}`).join(" ");
    const last = points.at(-1);
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5"/>\n` +
      `<text x="${X(last.x) - 4}" y="${Y(last[s.key]) - 8}" text-anchor="end" fill="${s.color}">${s.key}</text>`;
  });
  const ticks = xs.map((x) => `<text x="${X(x)}" y="${H - B + 18}" text-anchor="middle">${x}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="sans-serif" font-size="13">
<rect width="${W}" height="${H}" fill="white"/>
<text x="${L}" y="26" font-size="15" font-weight="bold">${title}</text>
<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="#999"/>
<line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="#999"/>
<text x="${L - 8}" y="${T + 4}" text-anchor="end">${Math.round(yMax)}</text>
<text x="${L - 8}" y="${H - B}" text-anchor="end">0</text>
<text x="${(L + W - R) / 2}" y="${H - 10}" text-anchor="middle">${xLabel}</text>
<text x="16" y="${(T + H - B) / 2}" transform="rotate(-90 16 ${(T + H - B) / 2})" text-anchor="middle">${yLabel}</text>
${ticks.join("\n")}
${lines.join("\n")}
</svg>
`;
}