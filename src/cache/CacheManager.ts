import { LRUCache } from './LRUCache';
import { CacheStats, User } from '../types';
import { CACHE_CONFIG } from '../config/constants';
import logger from '../utils/logger';

/**
 * Cache Manager with statistics tracking
 */
export class CacheManager {
  private cache: LRUCache<User>;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
    totalResponseTime: number;
    startTime: number;
  };
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(capacity: number = CACHE_CONFIG.CAPACITY, ttl: number = CACHE_CONFIG.TTL_MS) {
    this.cache = new LRUCache<User>(capacity, ttl);
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      totalResponseTime: 0,
      startTime: Date.now(),
    };
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  get(key: string): User | null {
    const value = this.cache.get(key);
    
    if (value !== null) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    
    this.stats.totalRequests++;
    
    return value;
  }

  set(key: string, value: User): void {
    this.cache.set(key, value);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): number {
    const count = this.cache.clear();
    return count;
  }

  size(): number {
    return this.cache.size();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  recordHit(): void {
    this.stats.hits++;
    this.stats.totalRequests++;
  }

  recordMiss(): void {
    this.stats.misses++;
    this.stats.totalRequests++;
  }

  trackResponseTime(duration: number): void {
    this.stats.totalResponseTime += duration;
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 
      ? ((this.stats.hits / totalRequests) * 100).toFixed(2) 
      : '0.00';
    
    const avgResponseTime = this.stats.totalRequests > 0
      ? (this.stats.totalResponseTime / this.stats.totalRequests).toFixed(2)
      : '0.00';
    
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);

    return {
      cacheSize: this.cache.size(),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      avgResponseTime: `${avgResponseTime}ms`,
      uptime: `${uptime}s`,
    };
  }

  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      const removed = this.cleanupExpiredEntries();
      if (removed > 0) {
        logger.debug(`Cache cleanup removed ${removed} expired entries`);
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL_MS);
  }

  private cleanupExpiredEntries(): number {
    return this.cache.cleanupExpired();
  }

  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      totalResponseTime: 0,
      startTime: Date.now(),
    };
  }
}

export const cacheManager = new CacheManager();