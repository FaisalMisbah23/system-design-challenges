# Part 1: the knee
 
Machine: Ubuntu 24.04.5 LTS laptop, 4 cores, x86_64
Node.js: v24.22.1
Server: one worker, 10 ms average work (random, exponential)
 
| rate/s | busy | p50 ms | p95 ms | p99 ms | mean ms | M/M/1 mean ms |
|---|---|---|---|---|---|---|
| 20 | 20% | 8.9 | 42.1 | 65.7 | 13.1 | 12.5 |
| 40 | 40% | 13.4 | 46.7 | 68.8 | 17.3 | 16.7 |
| 60 | 60% | 14.1 | 53.2 | 69.4 | 19.3 | 25.0 |
| 70 | 70% | 21.4 | 102.4 | 157.6 | 33.6 | 33.3 |
| 80 | 80% | 28.3 | 124.9 | 178.7 | 41.2 | 50.0 |
| 85 | 85% | 34.5 | 124.9 | 190.7 | 44.6 | 66.7 |
| 90 | 90% | 53.6 | 190.1 | 273.9 | 70.4 | 100.0 |
| 95 | 95% | 53.3 | 171.6 | 275.1 | 66.7 | 200.0 |
 
My knee: about 70 requests per second. Below it p99 was about 69.4 ms; one step above it, 157.6 ms.
 
My mean was close to M/M/1 at 20 requests/second (13.1 ms versus 12.5 ms), 40 requests/second (17.3 ms versus 16.7 ms), and 70 requests/second (33.6 ms versus 33.3 ms). At 60 requests/second and above, the measured means varied more from the model, especially at 90 and 95 requests/second. M/M/1 assumes an ideal steady-state single-server queue with Poisson arrivals and service times, while this was a finite run on a real event loop with timer and scheduling overhead. At high utilization, small bursts and measurement noise also have a large effect on the queue, particularly in the tail latencies.
 
![Latency as load grows](chart.svg)
