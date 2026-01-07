import express from 'express';
import dotenv from 'dotenv';
import streamRoutes from './routes/stream.js';
import notificationRoutes from './routes/notifications.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import queueRoutes from './routes/queue.js';
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'BackFlow API',
    endpoints: {
      stream: 'GET /stream',
      notifications: 'GET /notifications',
      login: 'POST /login',
      logout: 'POST /logout',
      heavyTaskChild: 'GET /heavy-task-child?n=40',
      heavyTaskWorker: 'GET /heavy-task-worker?n=40',
      enqueue: 'POST /enqueue',
      dequeue: 'GET /dequeue'
    }
  });
});

app.use('/stream', streamRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', authRoutes);
app.use('/', taskRoutes);
app.use('/', queueRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 BackFlow server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
