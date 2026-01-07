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

// NON-STREAMING VERSION FOR COMPARISON
// This shows what happens without streaming
router.get('/no-stream', (req, res) => {
  const totalItems = parseInt(req.query.totalItems) || 1000;
  
  console.log(`[NO-STREAM] Generating ${totalItems} items...`);
  const startTime = Date.now();
  
  // Generate ALL data in memory first
  const data = generateLargeArray(totalItems);
  const generateTime = Date.now() - startTime;
  console.log(`[NO-STREAM] Generated in ${generateTime}ms`);
  
  // Stringify entire array (huge memory allocation)
  const stringifyStart = Date.now();
  const jsonString = JSON.stringify(data);
  const stringifyTime = Date.now() - stringifyStart;
  console.log(`[NO-STREAM] Stringified in ${stringifyTime}ms`);
  
  // Send everything at once
  const totalTime = Date.now() - startTime;
  console.log(`[NO-STREAM] Total time before sending: ${totalTime}ms`);
  console.log(`[NO-STREAM] Memory: ~${(jsonString.length / 1024).toFixed(2)} KB`);
  
  res.json({
    message: 'Non-streaming response',
    totalItems: data.length,
    timeToGenerate: `${generateTime}ms`,
    timeToStringify: `${stringifyTime}ms`,
    totalTimeBeforeSend: `${totalTime}ms`,
    data: data
  });
});

export default router;
