import express from 'express';
import { fork } from 'child_process';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fibonacci calculation (CPU-intensive)
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Child Process endpoint
router.get('/heavy-task-child', (req, res) => {
  const n = parseInt(req.query.n) || 40;
  
  if (n > 45) {
    return res.status(400).json({ 
      error: 'n too large (max 45). Use worker thread for larger values.' 
    });
  }

  const startTime = Date.now();
  
  // Fork a child process
  const child = fork(join(__dirname, '../workers/fibonacci-worker.js'));
  
  child.send({ n });
  
  child.on('message', (result) => {
    const duration = Date.now() - startTime;
    res.json({
      method: 'child_process.fork()',
      input: n,
      result: result.value,
      duration: `${duration}ms`,
      processId: child.pid
    });
    child.kill();
  });
  
  child.on('error', (err) => {
    console.error('Child process error:', err);
    res.status(500).json({ error: 'Child process failed' });
    child.kill();
  });
  
  // Timeout protection
  setTimeout(() => {
    if (!res.headersSent) {
      child.kill();
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 30000);
});

// Worker Thread endpoint
router.get('/heavy-task-worker', (req, res) => {
  const n = parseInt(req.query.n) || 40;
  
  if (n > 50) {
    return res.status(400).json({ 
      error: 'n too large (max 50)' 
    });
  }

  const startTime = Date.now();
  
  // Create a worker thread
  const worker = new Worker(join(__dirname, '../workers/fibonacci-worker-thread.js'), {
    workerData: { n }
  });
  
  worker.on('message', (result) => {
    const duration = Date.now() - startTime;
    res.json({
      method: 'worker_threads',
      input: n,
      result: result.value,
      duration: `${duration}ms`,
      threadId: worker.threadId
    });
    worker.terminate();
  });
  
  worker.on('error', (err) => {
    console.error('Worker thread error:', err);
    res.status(500).json({ error: 'Worker thread failed' });
    worker.terminate();
  });
  
  // Timeout protection
  setTimeout(() => {
    if (!res.headersSent) {
      worker.terminate();
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 30000);
});

export default router;
