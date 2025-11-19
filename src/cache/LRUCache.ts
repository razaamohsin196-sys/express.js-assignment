import { CacheEntry, CacheNode } from '../types';

/**
 * LRU Cache implementation with TTL support
 * Uses doubly linked list + HashMap for O(1) operations
 */
export class LRUCache<T> {
  private capacity: number;
  private ttl: number;
  private cache: Map<string, CacheNode<T>>;
  private head: CacheNode<T> | null;
  private tail: CacheNode<T> | null;

  constructor(capacity: number, ttl: number) {
    if (capacity <= 0) {
      throw new Error('Cache capacity must be greater than 0');
    }
    if (ttl <= 0) {
      throw new Error('TTL must be greater than 0');
    }

    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      return null;
    }

    if (this.isExpired(node.value)) {
      this.delete(key);
      return null;
    }

    this.moveToHead(node);

    return node.value.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = this.createCacheEntry(value);
      this.moveToHead(existingNode);
      return;
    }

    const newNode: CacheNode<T> = {
      key,
      value: this.createCacheEntry(value),
      prev: null,
      next: null,
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);

    if (this.cache.size > this.capacity) {
      this.evictLRU();
    }
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);

    if (!node) {
      return false;
    }

    this.removeNode(node);
    this.cache.delete(key);

    return true;
  }

  /**
   * Clear all entries
   */
  clear(): number {
    const count = this.cache.size;
    this.cache.clear();
    this.head = null;
    this.tail = null;
    return count;
  }

  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    if (this.isExpired(node.value)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  keys(): string[] {
    const keys: string[] = [];
    for (const [key, node] of this.cache.entries()) {
      if (!this.isExpired(node.value)) {
        keys.push(key);
      }
    }
    return keys;
  }

  cleanupExpired(): number {
    let removed = 0;
    const keysToRemove: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (this.isExpired(node.value)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      if (this.delete(key)) {
        removed++;
      }
    }

    return removed;
  }

  private createCacheEntry(value: T): CacheEntry<T> {
    const now = Date.now();
    return {
      value,
      timestamp: now,
      expiresAt: now + this.ttl,
    };
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private addToHead(node: CacheNode<T>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private evictLRU(): void {
    if (!this.tail) {
      return;
    }

    const key = this.tail.key;
    this.removeNode(this.tail);
    this.cache.delete(key);
  }
}