/**
 * Swagger API Path Definitions
 * This file contains all API endpoint documentation separate from route logic
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve user data by ID with caching support. First request fetches from database (200ms delay), subsequent requests return cached data instantly.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user and add to cache. The new user is automatically cached for subsequent requests.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /cache-status:
 *   get:
 *     summary: Get cache statistics
 *     description: Retrieve current cache statistics including size, hits, misses, hit rate, average response time, and uptime.
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheStats'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /cache:
 *   delete:
 *     summary: Clear entire cache
 *     description: Manually clear all cached entries. This is useful for testing or when you need to force fresh data retrieval.
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheOperationResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get performance metrics summary
 *     description: Retrieve comprehensive performance metrics including request counts, response times, cache hit rates, error rates, and percentile statistics.
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: window
 *         schema:
 *           type: integer
 *         description: Time window in milliseconds (optional, default is all time)
 *         example: 60000
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsSummary'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /metrics/requests:
 *   get:
 *     summary: Get recent request metrics
 *     description: Retrieve detailed metrics for recent requests including timestamps, methods, paths, status codes, response times, and cache hit information.
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of recent requests to return
 *         example: 50
 *     responses:
 *       200:
 *         description: Recent requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: integer
 *                     example: 1700000000000
 *                   method:
 *                     type: string
 *                     example: GET
 *                   path:
 *                     type: string
 *                     example: /users/1
 *                   statusCode:
 *                     type: integer
 *                     example: 200
 *                   responseTime:
 *                     type: number
 *                     example: 45.5
 *                   cacheHit:
 *                     type: boolean
 *                     example: true
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /metrics/errors:
 *   get:
 *     summary: Get recent error metrics
 *     description: Retrieve detailed information about recent errors including timestamps, error messages, paths, and status codes.
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of recent errors to return
 *         example: 50
 *     responses:
 *       200:
 *         description: Recent errors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: integer
 *                     example: 1700000000000
 *                   error:
 *                     type: string
 *                     example: Not Found
 *                   path:
 *                     type: string
 *                     example: /users/999
 *                   statusCode:
 *                     type: integer
 *                     example: 404
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /metrics/reset:
 *   post:
 *     summary: Reset all metrics
 *     description: Clear all collected metrics data. This is useful for testing or starting fresh metric collection.
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Metrics reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Metrics reset successfully
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and get basic server information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 */