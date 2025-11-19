import { Request, Response, NextFunction } from 'express';
import { RateLimitInfo, RateLimitConfig } from '../types';
import { RATE_LIMIT_CONFIG } from '../config/constants';
import logger from '../utils/logger';

/**
 * Rate Limiter using Token Bucket algorithm
 */
export class RateLimiter {
  private clients: Map<string, RateLimitInfo>;
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(config: RateLimitConfig = RATE_LIMIT_CONFIG) {
    this.clients = new Map();
    this.config = config;
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    let client = this.clients.get(clientId);

    if (!client) {
      client = this.initializeClient(now);
      this.clients.set(clientId, client);
    }

    this.refillTokens(client, now);

    if (this.isBurstLimitExceeded(client, now)) {
      logger.debug(`[RATE LIMIT] Client ${clientId} exceeded burst limit`);
      return false;
    }

    if (client.tokens > 0) {
      client.tokens--;
      logger.debug(`[RATE LIMIT] Client ${clientId} allowed. Tokens remaining: ${client.tokens}`);
      return true;
    }

    logger.debug(`[RATE LIMIT] Client ${clientId} blocked. No tokens available`);
    return false;
  }

  private initializeClient(now: number): RateLimitInfo {
    return {
      tokens: this.config.maxRequests,
      lastRefill: now,
      burstTokens: this.config.burstCapacity,
      burstWindowStart: now,
    };
  }

  private refillTokens(client: RateLimitInfo, now: number): void {
    const timePassed = now - client.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed / this.config.windowMs) * this.config.maxRequests
    );

    if (tokensToAdd > 0) {
      client.tokens = Math.min(
        this.config.maxRequests,
        client.tokens + tokensToAdd
      );
      client.lastRefill = now;
      logger.debug(`[RATE LIMIT] Refilled ${tokensToAdd} tokens. Total: ${client.tokens}`);
    }
  }

  private isBurstLimitExceeded(client: RateLimitInfo, now: number): boolean {
    if (now - client.burstWindowStart > this.config.burstWindowMs) {
      client.burstTokens = this.config.burstCapacity;
      client.burstWindowStart = now;
      logger.debug(`[RATE LIMIT] Burst window reset. Burst tokens: ${client.burstTokens}`);
    }

    if (client.burstTokens > 0) {
      client.burstTokens--;
      return false;
    }

    return true;
  }

  getClientInfo(clientId: string): RateLimitInfo | null {
    return this.clients.get(clientId) || null;
  }

  resetClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  clear(): void {
    this.clients.clear();
  }

  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleClients();
    }, 300000);
  }

  private cleanupStaleClients(): void {
    const now = Date.now();
    const staleThreshold = this.config.windowMs * 2;
    let removed = 0;

    for (const [clientId, client] of this.clients.entries()) {
      if (now - client.lastRefill > staleThreshold) {
        this.clients.delete(clientId);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(`[RATE LIMIT CLEANUP] Removed ${removed} stale clients`);
    }
  }

  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

const rateLimiter = new RateLimiter();

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientId = req.ip || req.socket.remoteAddress || 'unknown';

  if (!rateLimiter.isAllowed(clientId)) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000),
    });
    return;
  }

  next();
};

export { rateLimiter };