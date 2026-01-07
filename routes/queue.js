import express from 'express';
import { taskQueue } from '../utils/priorityQueue.js';

const router = express.Router();

router.post('/enqueue', (req, res) => {
  const { task, priority } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  if (priority === undefined || priority === null) {
    return res.status(400).json({ error: 'Priority is required (number)' });
  }

  if (typeof priority !== 'number') {
    return res.status(400).json({ error: 'Priority must be a number' });
  }

  const item = taskQueue.enqueue(task, priority);
  
  res.json({
    message: 'Task enqueued successfully',
    task: item.task,
    priority: item.priority,
    queueSize: taskQueue.size()
  });
});

router.get('/dequeue', (req, res) => {
  if (taskQueue.isEmpty()) {
    return res.status(404).json({ error: 'Queue is empty' });
  }

  const item = taskQueue.dequeue();
  
  res.json({
    message: 'Task dequeued',
    task: item.task,
    priority: item.priority,
    timestamp: item.timestamp,
    queueSize: taskQueue.size()
  });
});

router.get('/queue/status', (req, res) => {
  const peek = taskQueue.peek();
  
  res.json({
    size: taskQueue.size(),
    isEmpty: taskQueue.isEmpty(),
    nextTask: peek ? {
      task: peek.task,
      priority: peek.priority
    } : null
  });
});

export default router;
