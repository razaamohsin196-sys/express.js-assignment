export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheNode<T> {
  key: string;
  value: CacheEntry<T>;
  prev: CacheNode<T> | null;
  next: CacheNode<T> | null;
}

export interface CacheStats {
  cacheSize: number;
  hits: number;
  misses: number;
  hitRate: string;
  avgResponseTime: string;
  uptime: string;
}