# BackFlow

A minimal but production-style Express.js application demonstrating core backend concepts used in real-time, scalable systems.

## Features

1. **Streamed Response** - Large JSON arrays sent in chunks using Node.js readable streams
2. **Server-Sent Events (SSE)** - Real-time notifications pushed to clients
3. **JWT Invalidation** - Token blacklisting with in-memory storage
4. **Child Process vs Worker Thread** - CPU-intensive task execution comparison
5. **Priority Queue** - MinHeap-based task queue with priority support

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Running

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### 1. Streamed Response

**GET** `/stream`

Sends a large JSON array in chunks with simulated delays.

**Query Parameters:**
- `chunkSize` (default: 100) - Number of items per chunk
- `totalItems` (default: 1000) - Total number of items to stream
- `delay` (default: 100) - Delay in milliseconds between chunks

**Example:**
```bash
curl http://localhost:3000/stream?chunkSize=50&totalItems=500&delay=200
```

### 2. Server-Sent Events (SSE)

**GET** `/notifications`

Pushes notification events every 2 seconds. Client stays connected.

**Example:**
```bash
curl -N http://localhost:3000/notifications
```

**JavaScript Example:**
```javascript
const eventSource = new EventSource('http://localhost:3000/notifications');
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log(notification);
};
```

### 3. JWT Authentication

**POST** `/login`

Authenticates user and returns JWT token.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenId": "uuid-here",
  "expiresIn": "1h"
}
```

**POST** `/logout`

Invalidates the JWT token (adds to blacklist).

**Headers:**
```
Authorization: Bearer <token>
```

**GET** `/protected`

Example protected route requiring authentication.

**Headers:**
```
Authorization: Bearer <token>
```

### 4. Heavy Task Execution

**GET** `/heavy-task-child?n=40`

Executes CPU-intensive Fibonacci calculation using `child_process.fork()`.

**Query Parameters:**
- `n` (default: 40) - Fibonacci number to calculate

**Response:**
```json
{
  "method": "child_process.fork()",
  "input": 40,
  "result": 102334155,
  "duration": "1234ms",
  "processId": 12345
}
```

**GET** `/heavy-task-worker?n=40`

Executes CPU-intensive Fibonacci calculation using `worker_threads`.

**Query Parameters:**
- `n` (default: 40) - Fibonacci number to calculate

**Response:**
```json
{
  "method": "worker_threads",
  "input": 40,
  "result": 102334155,
  "duration": "1234ms",
  "threadId": 1
}
```

### 5. Priority Queue

**POST** `/enqueue`

Adds a task to the priority queue.

**Body:**
```json
{
  "task": "Process payment",
  "priority": 1
}
```

**Note:** Lower priority number = higher priority (MinHeap)

**Response:**
```json
{
  "message": "Task enqueued successfully",
  "task": "Process payment",
  "priority": 1,
  "queueSize": 3
}
```

**GET** `/dequeue`

Removes and returns the highest priority task from the queue.

**Response:**
```json
{
  "message": "Task dequeued",
  "task": "Process payment",
  "priority": 1,
  "timestamp": 1234567890,
  "queueSize": 2
}
```

**GET** `/queue/status`

Returns current queue status.

**Response:**
```json
{
  "size": 2,
  "isEmpty": false,
  "nextTask": {
    "task": "Send email",
    "priority": 2
  }
}
```

## Project Structure

```
BackFlow/
├── server.js                 # Main application entry point
├── routes/
│   ├── stream.js            # Streamed response endpoint
│   ├── notifications.js     # SSE endpoint
│   ├── auth.js              # JWT authentication routes
│   ├── tasks.js             # Child process & worker thread routes
│   └── queue.js             # Priority queue routes
├── utils/
│   ├── errorHandler.js      # Global error handler
│   ├── jwtBlacklist.js      # JWT blacklist manager
│   ├── priorityQueue.js     # MinHeap priority queue
│   └── authMiddleware.js    # JWT authentication middleware
├── workers/
│   ├── fibonacci-worker.js  # Child process worker
│   └── fibonacci-worker-thread.js  # Worker thread
├── package.json
├── .env.example
└── README.md
```

## Testing Examples

### Streamed Response
```bash
curl http://localhost:3000/stream?chunkSize=10&totalItems=100
```

### SSE Notifications
```bash
curl -N http://localhost:3000/notifications
```

### JWT Flow
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Access protected route
curl http://localhost:3000/protected -H "Authorization: Bearer $TOKEN"

# Logout (invalidates token)
curl -X POST http://localhost:3000/logout -H "Authorization: Bearer $TOKEN"
```

### Heavy Tasks
```bash
# Child process
curl "http://localhost:3000/heavy-task-child?n=40"

# Worker thread
curl "http://localhost:3000/heavy-task-worker?n=40"
```

### Priority Queue
```bash
# Enqueue tasks
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{"task":"High priority task","priority":1}'

curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{"task":"Low priority task","priority":10}'

# Dequeue (gets highest priority)
curl http://localhost:3000/dequeue

# Check status
curl http://localhost:3000/queue/status
```

## Architecture Notes

- **Streaming**: Uses Node.js `Readable` streams for efficient memory usage with large datasets
- **SSE**: Implements proper SSE headers and connection management
- **JWT Blacklist**: In-memory `Set` for token invalidation (use Redis in production)
- **Child Process vs Worker Thread**: Demonstrates both approaches for CPU-intensive tasks
- **Priority Queue**: MinHeap implementation for O(log n) insertion and extraction

## Production Considerations

1. **JWT Blacklist**: Replace in-memory storage with Redis for distributed systems
2. **Error Handling**: Add comprehensive logging and monitoring
3. **Rate Limiting**: Implement rate limiting middleware
4. **Database**: Replace in-memory data structures with persistent storage
5. **Security**: Add CORS, helmet, and input validation
6. **Testing**: Add unit and integration tests
7. **Docker**: Containerize the application
8. **CI/CD**: Set up deployment pipelines

## License

MIT
