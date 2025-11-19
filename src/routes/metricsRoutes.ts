import { Router } from 'express';
import { metricsController } from '../controllers/metricsController';

const router = Router();

router.get('/metrics', metricsController.getMetrics.bind(metricsController));
router.get('/metrics/requests', metricsController.getRecentRequests.bind(metricsController));
router.get('/metrics/errors', metricsController.getRecentErrors.bind(metricsController));
router.post('/metrics/reset', metricsController.resetMetrics.bind(metricsController));

export default router;