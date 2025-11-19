import { Request, Response } from 'express';
import { cacheManager } from '../cache/CacheManager';

export class CacheController {
  getCacheStatus(_req: Request, res: Response): void {
    const stats = cacheManager.getStats();
    res.json(stats);
  }

  clearCache(_req: Request, res: Response): void {
    const clearedCount = cacheManager.clear();
    res.json({
      message: 'Cache cleared successfully',
      clearedEntries: clearedCount,
    });
  }
}

export const cacheController = new CacheController();