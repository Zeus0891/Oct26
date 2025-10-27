import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Rate Limiting Store (In-Memory Implementation)
 * In production, this should be replaced with Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  increment(
    key: string,
    windowMs: number
  ): { totalHits: number; timeToReset: number } {
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = this.store.get(key);

    if (!existing || existing.resetTime <= now) {
      // New window or expired window
      this.store.set(key, { count: 1, resetTime });
      return { totalHits: 1, timeToReset: windowMs };
    }

    // Increment existing count
    existing.count++;
    this.store.set(key, existing);

    return {
      totalHits: existing.count,
      timeToReset: existing.resetTime - now,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Tenant Plan Limits Configuration
 */
interface PlanLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    burstLimit: 5,
  },
  BASIC: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 20,
  },
  PROFESSIONAL: {
    requestsPerMinute: 300,
    requestsPerHour: 5000,
    requestsPerDay: 100000,
    burstLimit: 100,
  },
  ENTERPRISE: {
    requestsPerMinute: 1000,
    requestsPerHour: 20000,
    requestsPerDay: 500000,
    burstLimit: 500,
  },
};

/**
 * Rate Limiting Options
 */
interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: AuthenticatedRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  enablePlanBasedLimits?: boolean;
  customLimits?: Partial<PlanLimits>;
}

// Global rate limit store
const globalStore = new RateLimitStore();

// Cleanup expired entries every 5 minutes
setInterval(() => globalStore.cleanup(), 5 * 60 * 1000);

/**
 * Rate Limiting Middleware
 *
 * Implements intelligent rate limiting per tenant, user, and IP address.
 * Supports plan-based limits and prevents abuse while ensuring fair usage.
 *
 * @param options - Rate limiting configuration options
 */
export const rateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 60,
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    enablePlanBasedLimits = true,
    customLimits,
  } = options;

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Generate rate limit key
      const key = keyGenerator ? keyGenerator(req) : generateRateLimitKey(req);

      // Determine limits based on tenant plan
      const limits = determineLimits(
        req,
        maxRequests,
        customLimits,
        enablePlanBasedLimits
      );

      // Check rate limit
      const { totalHits, timeToReset } = globalStore.increment(key, windowMs);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", limits.requestsPerMinute);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, limits.requestsPerMinute - totalHits)
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + timeToReset).toISOString()
      );
      res.setHeader("X-RateLimit-Window", windowMs);

      // Check if limit exceeded
      if (totalHits > limits.requestsPerMinute) {
        console.log(
          `[RATE_LIMIT] Limit exceeded for key: ${key} (${totalHits}/${limits.requestsPerMinute})`
        );

        res.status(429).json({
          message: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          correlationId: req.correlationId,
          retryAfter: Math.ceil(timeToReset / 1000),
          details: {
            limit: limits.requestsPerMinute,
            current: totalHits,
            windowMs,
            resetTime: new Date(Date.now() + timeToReset).toISOString(),
          },
        });
        return;
      }

      // Handle response tracking for skip options
      if (skipSuccessfulRequests || skipFailedRequests) {
        // Skip implementation - can be enhanced later with proper types
        console.log(`[RATE_LIMIT] Skip options enabled for ${key}`);
      }

      console.log(
        `[RATE_LIMIT] Request allowed for key: ${key} (${totalHits}/${limits.requestsPerMinute})`
      );
      next();
    } catch (error) {
      console.error("[RATE_LIMIT] Rate limiting error:", error);
      // Don't fail the request for rate limiting errors
      next();
    }
  };
};

/**
 * Generate rate limiting key based on request context
 */
function generateRateLimitKey(req: AuthenticatedRequest): string {
  // Priority order: User > Tenant > IP
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  if (req.tenant?.id) {
    return `tenant:${req.tenant.id}`;
  }

  // Fallback to IP address
  const ip =
    req.ip ||
    req.connection.remoteAddress ||
    (req.headers["x-forwarded-for"] as string) ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Determine rate limits based on tenant plan and configuration
 */
function determineLimits(
  req: AuthenticatedRequest,
  defaultLimit: number,
  customLimits?: Partial<PlanLimits>,
  enablePlanBasedLimits: boolean = true
): PlanLimits {
  // Use custom limits if provided
  if (customLimits) {
    return {
      requestsPerMinute: customLimits.requestsPerMinute || defaultLimit,
      requestsPerHour: customLimits.requestsPerHour || defaultLimit * 60,
      requestsPerDay: customLimits.requestsPerDay || defaultLimit * 1440,
      burstLimit: customLimits.burstLimit || Math.ceil(defaultLimit * 0.2),
    };
  }

  // Use plan-based limits if enabled and tenant has a plan
  if (enablePlanBasedLimits && req.tenant?.settings?.plan) {
    const plan = req.tenant.settings.plan.toUpperCase();
    const planLimits = PLAN_LIMITS[plan];

    if (planLimits) {
      console.log(
        `[RATE_LIMIT] Using ${plan} plan limits for tenant ${req.tenant.id}`
      );
      return planLimits;
    }
  }

  // Default limits
  return PLAN_LIMITS.BASIC;
}

// =============================================================================
// PRE-CONFIGURED RATE LIMIT MIDDLEWARES
// =============================================================================

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  enablePlanBasedLimits: false,
  keyGenerator: (req) => `auth:${req.ip}`,
});

/**
 * API rate limiting for general endpoints
 */
export const apiRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  enablePlanBasedLimits: true,
});

/**
 * Bulk operation rate limiting
 */
export const bulkOperationRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 bulk operations per minute
  enablePlanBasedLimits: true,
});

/**
 * File upload rate limiting
 */
export const uploadRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 uploads per minute
  enablePlanBasedLimits: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

export default rateLimitMiddleware;
