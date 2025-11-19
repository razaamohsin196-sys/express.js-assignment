import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../monitoring/metricsCollector';

export const monitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const cacheHit = res.getHeader('X-Cache-Hit') === 'true';
    
    metricsCollector.recordRequest({
      timestamp: Date.now(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      cacheHit,
    });
    
    if (res.statusCode >= 400) {
      metricsCollector.recordError({
        timestamp: Date.now(),
        error: res.statusMessage || 'Unknown Error',
        path: req.path,
        statusCode: res.statusCode,
      });
    }
  });
  
  next();
};