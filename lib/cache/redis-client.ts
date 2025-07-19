"use client";

// Redis client configuration for caching
interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  invalidatePattern(pattern: string): Promise<void>;
}

// Mock Redis client for development (replace with actual Redis in production)
class MockRedisClient implements CacheClient {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  todos: (userId: string, page?: number, filters?: string) =>
    `todos:${userId}:${page || "all"}:${filters || "none"}`,
  todo: (todoId: string) => `todo:${todoId}`,
  notes: (userId: string, page?: number, search?: string) =>
    `notes:${userId}:${page || "all"}:${search || "none"}`,
  note: (noteId: string) => `note:${noteId}`,
  events: (userId: string, startDate?: string, endDate?: string) =>
    `events:${userId}:${startDate || "all"}:${endDate || "all"}`,
  event: (eventId: string) => `event:${eventId}`,
  categories: (userId: string) => `categories:${userId}`,
  stats: (userId: string) => `stats:${userId}`,
};

// Cache TTL configurations (in seconds)
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAILY: 86400, // 24 hours
};

// Initialize cache client
export const cacheClient: CacheClient = new MockRedisClient();

// Cache utility functions
export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await cacheClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  static async set<T>(
    key: string,
    value: T,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<void> {
    try {
      await cacheClient.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await cacheClient.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    try {
      await Promise.all([
        cacheClient.invalidatePattern(`todos:${userId}:*`),
        cacheClient.invalidatePattern(`notes:${userId}:*`),
        cacheClient.invalidatePattern(`events:${userId}:*`),
        cacheClient.del(CacheKeys.categories(userId)),
        cacheClient.del(CacheKeys.stats(userId)),
      ]);
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }

  static async invalidateItemCache(
    itemType: string,
    itemId: string,
    userId: string
  ): Promise<void> {
    try {
      await Promise.all([
        cacheClient.del(CacheKeys[itemType as keyof typeof CacheKeys](itemId)),
        cacheClient.invalidatePattern(`${itemType}s:${userId}:*`),
        cacheClient.del(CacheKeys.stats(userId)),
      ]);
    } catch (error) {
      console.error("Item cache invalidation error:", error);
    }
  }
}
