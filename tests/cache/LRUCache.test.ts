import { LRUCache } from '../../src/cache/LRUCache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 1000); // capacity: 3, ttl: 1000ms
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should update existing keys', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
      expect(cache.size()).toBe(1);
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it('should return false when deleting non-existent keys', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used item when capacity is exceeded', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
      expect(cache.size()).toBe(3);
    });

    it('should update LRU order on access', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      cache.get('key1'); // Access key1, making it most recently used
      
      cache.set('key4', 'value4'); // Should evict key2, not key1

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', async () => {
      const shortTTLCache = new LRUCache<string>(3, 100); // 100ms TTL
      
      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should cleanup expired entries', async () => {
      const shortTTLCache = new LRUCache<string>(3, 100);
      
      shortTTLCache.set('key1', 'value1');
      shortTTLCache.set('key2', 'value2');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const removed = shortTTLCache.cleanupExpired();
      expect(removed).toBe(2);
      expect(shortTTLCache.size()).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const count = cache.clear();
      expect(count).toBe(2);
      expect(cache.size()).toBe(0);
    });

    it('should report correct size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for invalid capacity', () => {
      expect(() => new LRUCache<string>(0, 1000)).toThrow('Cache capacity must be greater than 0');
      expect(() => new LRUCache<string>(-1, 1000)).toThrow('Cache capacity must be greater than 0');
    });

    it('should throw error for invalid TTL', () => {
      expect(() => new LRUCache<string>(3, 0)).toThrow('TTL must be greater than 0');
      expect(() => new LRUCache<string>(3, -1)).toThrow('TTL must be greater than 0');
    });

    it('should handle rapid successive operations', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      expect(cache.size()).toBe(3); // Only last 3 should remain
    });
  });
});