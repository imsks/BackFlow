import { parentPort, workerData } from 'worker_threads';

// Fibonacci calculation in worker thread
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const { n } = workerData;
const startTime = Date.now();

const result = fibonacci(n);
const duration = Date.now() - startTime;

parentPort.postMessage({
  value: result,
  duration: `${duration}ms`,
  threadId: 'worker-thread'
});
