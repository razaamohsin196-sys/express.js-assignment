import { Router } from 'express';
import { cacheController } from '../controllers/cacheController';

const router = Router();

router.get('/cache-status', cacheController.getCacheStatus.bind(cacheController));
router.delete('/cache', cacheController.clearCache.bind(cacheController));

export default router;