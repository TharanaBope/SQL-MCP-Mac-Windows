import { CacheEntry } from '../types/index.js';

export class SchemaCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private ttlMinutes: number;
  private enabled: boolean;

  constructor(ttlMinutes: number = 60, enabled: boolean = true) {
    this.ttlMinutes = ttlMinutes;
    this.enabled = enabled;
  }

  set<T>(key: string, data: T): void {
    if (!this.enabled) return;

    const now = Date.now();
    const expiresAt = now + this.ttlMinutes * 60 * 1000;

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  get<T>(key: string): T | null {
    if (!this.enabled) return null;

    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    if (!this.enabled) return false;

    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      // Remove entries matching pattern
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  getCacheStats(): {
    size: number;
    enabled: boolean;
    ttlMinutes: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      enabled: this.enabled,
      ttlMinutes: this.ttlMinutes,
      keys: Array.from(this.cache.keys()),
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Enable/disable caching
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  // Update TTL
  setTTL(minutes: number): void {
    this.ttlMinutes = minutes;
  }
}

// Singleton cache instance
let cacheInstance: SchemaCache | null = null;

export function getCache(ttlMinutes: number = 60, enabled: boolean = true): SchemaCache {
  if (!cacheInstance) {
    cacheInstance = new SchemaCache(ttlMinutes, enabled);
  }
  return cacheInstance;
}

// Helper function to generate cache keys
export function generateCacheKey(operation: string, ...params: string[]): string {
  return `${operation}:${params.join(':')}`;
}
