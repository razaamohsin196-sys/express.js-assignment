import createApp from './app';
import { PORT } from './config/constants';
import { cacheManager } from './cache/CacheManager';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

const startServer = () => {
  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info('='.repeat(50));
    logger.info('Express.js User Data API Server');
    logger.info('='.repeat(50));
    logger.info(`Server running on: http://localhost:${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`Cache status: http://localhost:${PORT}/cache-status`);
    logger.info(`Users endpoint: http://localhost:${PORT}/users/:id`);
    logger.info(`Metrics: http://localhost:${PORT}/metrics`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info('='.repeat(50));
    logger.info('Press Ctrl+C to stop the server');
    logger.info('='.repeat(50));
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      
      cacheManager.stopCleanupTask();
      rateLimiter.stopCleanupTask();
      
      logger.info('Cleanup completed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();