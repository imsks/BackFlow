import express from 'express';
import { Readable } from 'stream';

const router = express.Router();

// Generate a large array of data
const generateLargeArray = (size = 1000) => {
  return Array.from({ length: size }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 1000,
    timestamp: new Date().toISOString()
  }));
};

router.get('/', (req, res) => {
  const chunkSize = parseInt(req.query.chunkSize) || 100;
  const totalItems = parseInt(req.query.totalItems) || 1000;
  const delay = parseInt(req.query.delay) || 100; // ms between chunks

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');

  const data = generateLargeArray(totalItems);
  let index = 0;
  let isPushing = false;

  // Create a readable stream
  const stream = new Readable({
    objectMode: false,
    read() {
      if (isPushing || index >= data.length) {
        if (index >= data.length) {
          this.push(null); // End stream
        }
        return;
      }

      isPushing = true;
      const chunk = data.slice(index, index + chunkSize);
      index += chunkSize;

      // Simulate delay before pushing next chunk
      setTimeout(() => {
        const chunkData = JSON.stringify(chunk) + '\n';
        this.push(chunkData);
        isPushing = false;
        
        // If we've sent all data, end the stream
        if (index >= data.length) {
          this.push(null);
        }
      }, delay);
    }
  });

  // Pipe stream to response
  stream.pipe(res);

  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream error occurred' });
    }
  });

  req.on('close', () => {
    stream.destroy();
  });
});

export default router;
