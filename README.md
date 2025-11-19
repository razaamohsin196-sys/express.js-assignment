# Express.js User Data API

High-performance Express.js API with advanced caching, rate limiting, and asynchronous processing.

## Quick Start

```bash
# Install dependencies
npm install

npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### 1. Get User by ID
```bash
GET /users/:id

# Example
curl http://localhost:3000/users/1

# Response (200 OK)
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}

# Performance
- First request (cache miss): ~200ms
- Subsequent requests (cache hit): <5ms
```

### 2. Create User
```bash
POST /users
Content-Type: application/json

# Example
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Brown","email":"alice@example.com"}'

# Response (201 Created)
{
  "id": 4,
  "name": "Alice Brown",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Cache Status
```bash
GET /cache-status

# Response
{
  "cacheSize": 3,
  "hits": 150,
  "misses": 25,
  "hitRate": "85.71%",
  "avgResponseTime": "12.50ms",
  "uptime": "3600s"
}
```

### 4. Clear Cache
```bash
DELETE /cache

# Response
{
  "message": "Cache cleared successfully",
  "clearedEntries": 3
}
```

### 5. Get Metrics (Monitoring)
```bash
GET /metrics

# Response
{
  "totalRequests": 150,
  "successfulRequests": 145,
  "failedRequests": 5,
  "averageResponseTime": 45.23,
  "cacheHitRate": 85.5,
  "errorRate": 3.33,
  "uptime": 3600
}
```

### 6. Health Check
```bash
GET /health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

## API Documentation

Interactive Swagger documentation: `http://localhost:3000/api-docs`

## Implementation Details

### 1. Caching Strategy (LRU Cache)

**Implementation:**
- Doubly linked list + HashMap for O(1) operations
- 60-second TTL (Time To Live)
- Automatic expiration with background cleanup (every 30 seconds)
- Capacity-based eviction using LRU algorithm

**How it works:**
1. Check cache first (O(1) lookup)
2. On cache miss: Queue request to prevent duplicates
3. Fetch from "database" (simulated 200ms delay)
4. Cache result with 60-second TTL
5. Background task removes expired entries

**Statistics tracked:**
- Cache hits/misses
- Hit rate percentage
- Average response time
- Current cache size

### 2. Rate Limiting Implementation

**Strategy:** Token Bucket Algorithm

**Configuration:**
- Base limit: 10 requests per minute
- Burst capacity: 5 requests in 10-second window
- Per-IP tracking

**How it works:**
1. Each client gets a token bucket
2. Tokens refill gradually (10 per minute)
3. Burst capacity allows traffic spikes (5 tokens in 10s)
4. Request consumes 1 token
5. Returns 429 when tokens exhausted

### 3. Asynchronous Processing

**Queue System:**
- FIFO (First In, First Out) processing
- Request deduplication by user ID
- Promise-based coordination

**Concurrent Request Handling:**
1. First request for user ID enters queue
2. Subsequent requests for same ID wait
3. Single database call executed
4. All waiting requests receive cached result
5. Prevents duplicate work

**Benefits:**
- Non-blocking operations
- Efficient resource usage
- Handles 100+ concurrent requests

### 4. Monitoring Solution

**Metrics Collected:**
- Total requests
- Success/failure rates
- Average response times
- Cache performance
- Error tracking
- Response time percentiles (p50, p95, p99)

**Access:** `GET /metrics` endpoint

## Testing

### Run All Tests
```bash
npm test

# Results
Test Suites: 2 passed, 2 total
Tests:       34 passed, 34 total
```

### Test Scenarios

#### 1. Cache Performance
```bash
# Clear cache
curl -X DELETE http://localhost:3000/cache

# First request (cache miss) - ~200ms
time curl http://localhost:3000/users/1

# Second request (cache hit) - <5ms
time curl http://localhost:3000/users/1

# Wait 61 seconds for expiration
sleep 61

# Third request (cache miss again) - ~200ms
time curl http://localhost:3000/users/1
```

#### 2. Rate Limiting
```bash
# Send 12 requests rapidly
for i in {1..12}; do
  echo "Request $i:"
  curl -s http://localhost:3000/users/1
  echo ""
done

# Expected: First 5 succeed (burst), then 429 errors
```

#### 3. Concurrent Requests
```bash
# Clear cache
curl -X DELETE http://localhost:3000/cache

# Send 5 simultaneous requests
for i in {1..5}; do
  curl -s http://localhost:3000/users/2 &
done
wait

# Expected: Only 1 database call (check server logs)
```

## Project Structure

```
src/
├── cache/
│   ├── LRUCache.ts           # LRU cache implementation
│   └── CacheManager.ts       # Cache with statistics
├── controllers/              # HTTP request handlers
├── routes/                   # Endpoint definitions
├── services/
│   ├── userService.ts        # Business logic
│   └── queueService.ts       # Queue processing
├── middleware/
│   ├── rateLimiter.ts        # Rate limiting
│   └── errorHandler.ts       # Error handling
├── monitoring/
│   └── metricsCollector.ts   # Performance tracking
├── types/                    # TypeScript types
├── utils/
│   ├── mockData.ts           # Mock database
│   └── logger.ts             # Winston logger
├── config/
│   ├── constants.ts          # Configuration
│   └── swagger.ts            # API documentation
├── app.ts                    # Express setup
└── index.ts                  # Entry point

tests/
├── cache/
│   └── LRUCache.test.ts      # Cache unit tests
└── api/
    └── users.test.ts         # API integration tests
```

```bash
cp .env.example .env
# Edit .env with your values
npm run dev
```







