# Part 2: percentiles lie

Each call is slow (200 ms) with chance 0.02; other calls are almost free.

| calls/page | mean ms | p50 ms | p95 ms | p99 ms | slow pages | slow pages (predicted) |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 4.0 | 0.6 | 1.5 | 200.6 | 2% | 2% |
| 2 | 9.9 | 0.6 | 2.1 | 201.4 | 5% | 4% |
| 5 | 13.3 | 0.8 | 200.5 | 201.4 | 6% | 10% |
| 10 | 33.7 | 1.2 | 201.6 | 201.9 | 16% | 18% |
| 20 | 63.1 | 2.0 | 202.1 | 202.7 | 31% | 33% |

A team watching only the mean would conclude that pages are usually fast, although the average gets worse as more calls are added. The p95 shows instead that fan-out makes a substantial share of pages slow: by 5 calls per page, about 6% of pages take around 200 ms, and by 20 calls per page, about 31% do.

![Fan-out](chart.svg)
