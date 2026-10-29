# Challenge 1: Measure a server

## 101 glossary

- **Latency:** How long one request takes from being sent until its response arrives.
- **Percentile:** A cutoff in sorted measurements; p95 is the value that 95% of requests meet or beat.
- **Open loop:** A load generator that sends requests according to a schedule without waiting for earlier requests to finish.
- **Utilisation:** The fraction of a worker's capacity currently demanded, usually written as a percentage.
- **Little's law:** The queueing relationship `L = lambda x W`: average work in the system equals arrival rate times average time in the system.

## Parts

- [Part 1: the knee](./part-1-the-knee/) — run `node challenges/challenge-1-measure-a-server/part-1-the-knee/knee.js`.
- [Part 2: percentiles lie](./part-2-percentiles-lie/) — run `node challenges/challenge-1-measure-a-server/part-2-percentiles-lie/tail.js`.
- [Part 3: Little's law](./part-3-littles-law/) — run `node challenges/challenge-1-measure-a-server/part-3-littles-law/little.js`.
