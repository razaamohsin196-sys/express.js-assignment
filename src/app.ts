import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { rateLimitMiddleware } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { monitoringMiddleware } from './middleware/monitoringMiddleware';
import { swaggerSpec } from './config/swagger';
import userRoutes from './routes/userRoutes';
import cacheRoutes from './routes/cacheRoutes';
import metricsRoutes from './routes/metricsRoutes';
import logger from './utils/logger';

const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(monitoringMiddleware);

  app.use((req, res, next) => {
    const start = Date.now();
    const method = req.method;
    const path = req.path;
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${method} ${path}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    });
    next();
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'User Data API Documentation',
  }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api-docs')) {
      return next();
    }
    rateLimitMiddleware(req, res, next);
  });

  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use('/users', userRoutes);
  app.use('/', cacheRoutes);
  app.use('/', metricsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;