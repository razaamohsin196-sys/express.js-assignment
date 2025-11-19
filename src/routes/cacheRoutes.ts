import { Router } from 'express';
import { cacheController } from '../controllers/cacheController';

const router = Router();

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
router.get('/cache-status', cacheController.getCacheStatus.bind(cacheController));

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
router.delete('/cache', cacheController.clearCache.bind(cacheController));

export default router;