import express from 'express';

const router = express.Router();

let notificationId = 1;

const generateNotification = () => {
  const types = ['info', 'warning', 'success', 'error'];
  const messages = [
    'New user registered',
    'System update available',
    'Payment received',
    'Database backup completed',
    'High CPU usage detected',
    'New order placed'
  ];

  return {
    id: notificationId++,
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toISOString()
  };
};

router.get('/', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ message: 'Connected to notification stream' })}\n\n`);

  // Send notifications every 2 seconds
  const interval = setInterval(() => {
    const notification = generateNotification();
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  }, 2000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected from notification stream');
    res.end();
  });

  // Handle errors
  req.on('error', (err) => {
    console.error('SSE error:', err);
    clearInterval(interval);
    res.end();
  });
});

export default router;
