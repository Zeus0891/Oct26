import { Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "../types";

/**
 * Cache Strategy Types
 */
enum CacheStrategy {
  CACHE_FIRST = "cache_first",
  CACHE_ASIDE = "cache_aside",
  WRITE_THROUGH = "write_through",
  WRITE_BEHIND = "write_behind",
  REFRESH_AHEAD = "refresh_ahead",
}

/**
 * Cache Entry Interface
 */
interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Cache Configuration
 */
interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // seconds
  maxSize: number;
  strategy: CacheStrategy;
  enableCompression: boolean;
  enableEncryption: boolean;
  keyPrefix: string;
  enableMetrics: boolean;
  enableInvalidation: boolean;
  invalidationPatterns: string[];
}

/**
 * Cache Metrics
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  enabled: true,
  defaultTTL: 300, // 5 minutes
  maxSize: 10000,
  strategy: CacheStrategy.CACHE_ASIDE,
  enableCompression: false,
  enableEncryption: false,
  keyPrefix: "app",
  enableMetrics: true,
  enableInvalidation: true,
  invalidationPatterns: ["user:*", "tenant:*"],
};

/**
 * In-Memory Cache Implementation
 */
class InMemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    memoryUsage: 0,
  };

  constructor(private config: CacheConfig) {}

  /**
   * Get value from cache
   */
  async get(key: string): Promise<any | null> {
    this.metrics.totalRequests++;

    const fullKey = this.buildKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(fullKey);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access information
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.metrics.hits++;
    this.updateHitRate();

    console.log(`[CACHE] HIT: ${key}`);
    return this.deserializeValue(entry.value);
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    options?: {
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const fullKey = this.buildKey(key);
    const ttl = options?.ttl || this.config.defaultTTL;

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      key: fullKey,
      value: this.serializeValue(value),
      ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      tags: options?.tags,
      metadata: options?.metadata,
    };

    this.cache.set(fullKey, entry);
    this.metrics.sets++;

    console.log(`[CACHE] SET: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    const deleted = this.cache.delete(fullKey);

    if (deleted) {
      this.metrics.deletes++;
      console.log(`[CACHE] DELETE: ${key}`);
    }

    return deleted;
  }

  /**
   * Clear cache by pattern
   */
  async clear(pattern?: string): Promise<number> {
    let deletedCount = 0;

    if (pattern) {
      const regex = new RegExp(pattern.replace("*", ".*"));
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
    } else {
      deletedCount = this.cache.size;
      this.cache.clear();
    }

    console.log(`[CACHE] CLEAR: ${deletedCount} entries removed`);
    return deletedCount;
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;

    for (const [key, entry] of this.cache) {
      if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    console.log(`[CACHE] INVALIDATED BY TAGS: ${deletedCount} entries removed`);
    return deletedCount;
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(fullKey);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheMetrics & { size: number; keys: string[] } {
    this.updateMemoryUsage();

    return {
      ...this.metrics,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.config.keyPrefix}:${key}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl * 1000;
  }

  /**
   * Serialize value for storage
   */
  private serializeValue(value: any): any {
    if (this.config.enableCompression) {
      // Simple JSON compression (in production, use zlib)
      const jsonString = JSON.stringify(value);
      return this.config.enableEncryption
        ? this.encrypt(jsonString)
        : jsonString;
    }

    return this.config.enableEncryption
      ? this.encrypt(JSON.stringify(value))
      : value;
  }

  /**
   * Deserialize value from storage
   */
  private deserializeValue(value: any): any {
    if (this.config.enableEncryption) {
      const decrypted = this.decrypt(value);
      return this.config.enableCompression
        ? JSON.parse(decrypted)
        : JSON.parse(decrypted);
    }

    if (this.config.enableCompression && typeof value === "string") {
      return JSON.parse(value);
    }

    return value;
  }

  /**
   * Simple encryption (in production, use proper encryption)
   */
  private encrypt(value: string): string {
    return Buffer.from(value).toString("base64");
  }

  /**
   * Simple decryption
   */
  private decrypt(value: string): string {
    return Buffer.from(value, "base64").toString();
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey = "";

    for (const [key, entry] of this.cache) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
      console.log(`[CACHE] EVICTED: ${oldestKey}`);
    }
  }

  /**
   * Update hit rate metric
   */
  private updateHitRate(): void {
    this.metrics.hitRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.hits / this.metrics.totalRequests) * 100
        : 0;
  }

  /**
   * Update memory usage metric (approximation)
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length;
    }
    this.metrics.memoryUsage = totalSize;
  }
}

// Global cache instance
let globalCache: InMemoryCache;

/**
 * Cache Integration Middleware
 *
 * Provides caching capabilities with multiple strategies, TTL management,
 * and cache invalidation patterns for improved application performance.
 *
 * @param config - Cache configuration options
 */
export const cacheMiddleware = (config: Partial<CacheConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize global cache if not exists
  if (!globalCache) {
    globalCache = new InMemoryCache(finalConfig);
  }

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!finalConfig.enabled) {
      next();
      return;
    }

    // Attach cache methods to request
    req.cache = {
      get: async (key: string) => {
        return globalCache.get(key);
      },

      set: async (
        key: string,
        value: any,
        options?: Parameters<typeof globalCache.set>[2]
      ) => {
        return globalCache.set(key, value, options);
      },

      delete: async (key: string) => {
        return globalCache.delete(key);
      },

      clear: async (pattern?: string) => {
        return globalCache.clear(pattern);
      },

      exists: async (key: string) => {
        return globalCache.exists(key);
      },

      invalidateByTags: async (tags: string[]) => {
        return globalCache.invalidateByTags(tags);
      },

      // Convenience methods for common patterns
      getUserCache: (userId: string) => ({
        get: (subKey: string) => globalCache.get(`user:${userId}:${subKey}`),
        set: (subKey: string, value: any, options?: any) =>
          globalCache.set(`user:${userId}:${subKey}`, value, {
            ...options,
            tags: [...(options?.tags || []), `user:${userId}`],
          }),
        clear: () => globalCache.clear(`user:${userId}:*`),
      }),

      getTenantCache: (tenantId: string) => ({
        get: (subKey: string) =>
          globalCache.get(`tenant:${tenantId}:${subKey}`),
        set: (subKey: string, value: any, options?: any) =>
          globalCache.set(`tenant:${tenantId}:${subKey}`, value, {
            ...options,
            tags: [...(options?.tags || []), `tenant:${tenantId}`],
          }),
        clear: () => globalCache.clear(`tenant:${tenantId}:*`),
      }),
    };

    console.log(
      `[CACHE] Cache middleware attached for ${req.method} ${req.path}`
    );
    next();
  };
};

/**
 * Response caching middleware
 */
export const responseCacheMiddleware = (options?: {
  ttl?: number;
  keyGenerator?: (req: AuthenticatedRequest) => string;
  condition?: (req: AuthenticatedRequest) => boolean;
}) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only cache GET requests by default
    if (req.method !== "GET") {
      next();
      return;
    }

    // Check condition if provided
    if (options?.condition && !options.condition(req)) {
      next();
      return;
    }

    // Generate cache key
    const cacheKey = options?.keyGenerator
      ? options.keyGenerator(req)
      : generateResponseCacheKey(req);

    // Try to get cached response
    if (req.cache) {
      const cachedResponse = await req.cache.get(`response:${cacheKey}`);

      if (cachedResponse) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader(
          "Content-Type",
          cachedResponse.contentType || "application/json"
        );
        res.status(cachedResponse.statusCode || 200);
        res.send(cachedResponse.body);
        console.log(`[CACHE] Response cache HIT: ${cacheKey}`);
        return;
      }
    }

    // Cache the response
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (body: any) {
      cacheResponse(req, res, cacheKey, body, options?.ttl);
      res.setHeader("X-Cache", "MISS");
      return originalSend.call(this, body);
    };

    res.json = function (obj: any) {
      cacheResponse(req, res, cacheKey, obj, options?.ttl);
      res.setHeader("X-Cache", "MISS");
      return originalJson.call(this, obj);
    };

    next();
  };
};

/**
 * Generate response cache key
 */
function generateResponseCacheKey(req: AuthenticatedRequest): string {
  const keyParts = [
    req.method,
    req.path,
    JSON.stringify(req.query),
    req.user?.id || "anonymous",
    req.tenant?.id || "no-tenant",
  ];

  return crypto.createHash("md5").update(keyParts.join("|")).digest("hex");
}

/**
 * Cache response data
 */
function cacheResponse(
  req: AuthenticatedRequest,
  res: Response,
  cacheKey: string,
  body: any,
  ttl?: number
): void {
  if (req.cache && res.statusCode === 200) {
    const responseData = {
      body,
      statusCode: res.statusCode,
      contentType: res.getHeader("content-type"),
      timestamp: new Date().toISOString(),
    };

    req.cache.set(`response:${cacheKey}`, responseData, {
      ttl: ttl || 300, // 5 minutes default
      tags: ["response", req.path.split("/")[2]], // Tag by resource type
    });

    console.log(`[CACHE] Response cached: ${cacheKey}`);
  }
}

// =============================================================================
// CACHE INVALIDATION HELPERS
// =============================================================================

/**
 * Invalidate user-related cache
 */
export const invalidateUserCache =
  (userId: string) => (req: AuthenticatedRequest) => {
    if (req.cache) {
      req.cache.invalidateByTags([`user:${userId}`]);
      console.log(`[CACHE] Invalidated user cache: ${userId}`);
    }
  };

/**
 * Invalidate tenant-related cache
 */
export const invalidateTenantCache =
  (tenantId: string) => (req: AuthenticatedRequest) => {
    if (req.cache) {
      req.cache.invalidateByTags([`tenant:${tenantId}`]);
      console.log(`[CACHE] Invalidated tenant cache: ${tenantId}`);
    }
  };

/**
 * Invalidate response cache for specific paths
 */
export const invalidateResponseCache =
  (pathPattern: string) => (req: AuthenticatedRequest) => {
    if (req.cache) {
      req.cache.clear(`response:*${pathPattern}*`);
      console.log(`[CACHE] Invalidated response cache: ${pathPattern}`);
    }
  };

// =============================================================================
// PRE-CONFIGURED CACHE MIDDLEWARES
// =============================================================================

/**
 * Basic cache middleware
 */
export const basicCacheMiddleware = cacheMiddleware({
  defaultTTL: 300, // 5 minutes
  maxSize: 1000,
  enableMetrics: true,
});

/**
 * High-performance cache middleware
 */
export const highPerformanceCacheMiddleware = cacheMiddleware({
  defaultTTL: 600, // 10 minutes
  maxSize: 50000,
  enableCompression: true,
  enableMetrics: true,
});

/**
 * Secure cache middleware with encryption
 */
export const secureCacheMiddleware = cacheMiddleware({
  defaultTTL: 180, // 3 minutes
  maxSize: 5000,
  enableEncryption: true,
  enableMetrics: true,
});

/**
 * Response cache for API endpoints
 */
export const apiResponseCache = responseCacheMiddleware({
  ttl: 300, // 5 minutes
  condition: (req) => req.method === "GET" && !req.path.includes("/auth/"),
});

/**
 * User-specific response cache
 */
export const userResponseCache = responseCacheMiddleware({
  ttl: 60, // 1 minute
  keyGenerator: (req) =>
    `user:${req.user?.id}:${req.path}:${JSON.stringify(req.query)}`,
  condition: (req) => !!req.user,
});

// =============================================================================
// CACHE MANAGEMENT API
// =============================================================================

/**
 * Get cache statistics
 */
export const getCacheStats = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const stats = globalCache.getStats();

  res.json({
    stats,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clear cache
 */
export const clearCache = (req: AuthenticatedRequest, res: Response): void => {
  const { pattern } = req.query;

  globalCache.clear(pattern as string).then((deletedCount) => {
    res.json({
      message: "Cache cleared",
      deletedCount,
      pattern: pattern || "all",
      clearedBy: req.user?.email,
      timestamp: new Date().toISOString(),
    });
  });
};

/**
 * Invalidate cache by tags
 */
export const invalidateCacheByTags = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    res.status(400).json({ message: "Tags must be an array" });
    return;
  }

  globalCache.invalidateByTags(tags).then((deletedCount) => {
    res.json({
      message: "Cache invalidated by tags",
      deletedCount,
      tags,
      invalidatedBy: req.user?.email,
      timestamp: new Date().toISOString(),
    });
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      cache?: {
        get: (key: string) => Promise<any>;
        set: (
          key: string,
          value: any,
          options?: {
            ttl?: number;
            tags?: string[];
            metadata?: Record<string, any>;
          }
        ) => Promise<void>;
        delete: (key: string) => Promise<boolean>;
        clear: (pattern?: string) => Promise<number>;
        exists: (key: string) => Promise<boolean>;
        invalidateByTags: (tags: string[]) => Promise<number>;
        getUserCache: (userId: string) => {
          get: (subKey: string) => Promise<any>;
          set: (subKey: string, value: any, options?: any) => Promise<void>;
          clear: () => Promise<number>;
        };
        getTenantCache: (tenantId: string) => {
          get: (subKey: string) => Promise<any>;
          set: (subKey: string, value: any, options?: any) => Promise<void>;
          clear: () => Promise<number>;
        };
      };
    }
  }
}

export { CacheStrategy };
export default cacheMiddleware;
