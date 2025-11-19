import { Router } from 'express';
import { metricsController } from '../controllers/metricsController';

const router = Router();

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
router.get('/metrics', metricsController.getMetrics.bind(metricsController));

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
router.get('/metrics/requests', metricsController.getRecentRequests.bind(metricsController));

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
router.get('/metrics/errors', metricsController.getRecentErrors.bind(metricsController));

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
router.post('/metrics/reset', metricsController.resetMetrics.bind(metricsController));

export default router;