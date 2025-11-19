import { Request, Response } from 'express';
import { metricsCollector } from '../monitoring/metricsCollector';

export class MetricsController {
  getMetrics(req: Request, res: Response): void {
    const timeWindow = req.query.window ? parseInt(req.query.window as string) : undefined;
    const summary = metricsCollector.getSummary(timeWindow);
    res.json(summary);
  }

  getRecentRequests(req: Request, res: Response): void {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const requests = metricsCollector.getRecentRequests(limit);
    res.json({
      count: requests.length,
      requests,
    });
  }

  getRecentErrors(req: Request, res: Response): void {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const errors = metricsCollector.getRecentErrors(limit);
    res.json({
      count: errors.length,
      errors,
    });
  }

  resetMetrics(_req: Request, res: Response): void {
    metricsCollector.reset();
    res.json({
      message: 'Metrics reset successfully',
    });
  }
}

export const metricsController = new MetricsController();