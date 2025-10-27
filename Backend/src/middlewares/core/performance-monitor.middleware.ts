import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Performance Metrics Interface
 */
interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  tenantId?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  dbQueryCount?: number;
  dbQueryTime?: number;
}

/**
 * Performance Thresholds Configuration
 */
interface PerformanceThresholds {
  slow: number; // Slow request threshold in ms
  warning: number; // Warning threshold in ms
  critical: number; // Critical threshold in ms
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  slow: 1000, // 1 second
  warning: 3000, // 3 seconds
  critical: 10000, // 10 seconds
};

/**
 * Performance Monitoring Store
 */
class PerformanceStore {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000;

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getSlowRequests(
    threshold: number = DEFAULT_THRESHOLDS.slow
  ): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.responseTime > threshold);
  }

  getAverageResponseTime(minutes: number = 15): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp).getTime() > cutoff
    );

    if (recentMetrics.length === 0) return 0;

    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return Math.round(total / recentMetrics.length);
  }

  clear(): void {
    this.metrics = [];
  }
}

// Global performance store
const performanceStore = new PerformanceStore();

/**
 * Performance Monitoring Options
 */
interface PerformanceOptions {
  thresholds?: Partial<PerformanceThresholds>;
  enableMemoryTracking?: boolean;
  enableDBTracking?: boolean;
  logSlowRequests?: boolean;
  excludePaths?: string[];
  sampleRate?: number; // 0-1, percentage of requests to monitor
}

/**
 * Performance Monitoring Middleware
 *
 * Comprehensive performance tracking including request timing, memory usage,
 * and database query latency. Provides insights for optimization and monitoring.
 *
 * @param options - Performance monitoring configuration
 */
export const performanceMonitorMiddleware = (
  options: PerformanceOptions = {}
) => {
  const {
    thresholds = DEFAULT_THRESHOLDS,
    enableMemoryTracking = true,
    enableDBTracking = true,
    logSlowRequests = true,
    excludePaths = ["/health", "/metrics", "/favicon.ico"],
    sampleRate = 1.0,
  } = options;

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    // Skip monitoring for excluded paths
    if (excludePaths.includes(req.path)) {
      next();
      return;
    }

    // Apply sampling
    if (sampleRate < 1.0 && Math.random() > sampleRate) {
      next();
      return;
    }

    // Initialize performance tracking
    const startTime = process.hrtime.bigint();
    const startTimestamp = Date.now();
    req.startTime = startTimestamp;

    // Track memory usage if enabled
    let initialMemory: NodeJS.MemoryUsage | undefined;
    if (enableMemoryTracking) {
      initialMemory = process.memoryUsage();
    }

    // Database query tracking (placeholder for integration)
    const dbQueryCount = 0;
    const dbQueryTime = 0;

    // Override res.end to capture performance metrics
    const originalEnd = res.end;
    const originalWrite = res.write;

    res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
      // Calculate response time
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Capture final metrics
      const metrics: PerformanceMetrics = {
        requestId: req.correlationId || "unknown",
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
        timestamp: new Date(startTimestamp).toISOString(),
        userAgent: req.headers["user-agent"],
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        tenantId: req.tenant?.id,
      };

      // Add memory usage if enabled
      if (enableMemoryTracking && initialMemory) {
        const finalMemory = process.memoryUsage();
        metrics.memoryUsage = {
          rss: finalMemory.rss - initialMemory.rss,
          heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
          heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
          external: finalMemory.external - initialMemory.external,
          arrayBuffers: finalMemory.arrayBuffers - initialMemory.arrayBuffers,
        };
      }

      // Add database metrics if enabled
      if (enableDBTracking) {
        metrics.dbQueryCount = dbQueryCount;
        metrics.dbQueryTime = dbQueryTime;
      }

      // Store metrics
      performanceStore.addMetric(metrics);

      // Determine performance level
      const level = getPerformanceLevel(responseTime, finalThresholds);

      // Log performance information
      const logMessage =
        `[PERFORMANCE] ${req.method} ${req.path} | ` +
        `${responseTime.toFixed(2)}ms | ${res.statusCode} | ` +
        `${req.user?.email || "anonymous"} | ${level}`;

      if (level === "CRITICAL" || level === "WARNING") {
        console.warn(logMessage);
      } else if (level === "SLOW" && logSlowRequests) {
        console.log(logMessage);
      } else {
        console.log(logMessage);
      }

      // Add performance headers
      res.setHeader("X-Response-Time", `${responseTime.toFixed(2)}ms`);
      res.setHeader("X-Performance-Level", level);

      // Call original end method
      return originalEnd.call(this, chunk, encoding, cb);
    };

    console.log(
      `[PERFORMANCE] Starting ${req.method} ${req.path} | ${req.correlationId}`
    );
    next();
  };
};

/**
 * Determine performance level based on response time
 */
function getPerformanceLevel(
  responseTime: number,
  thresholds: PerformanceThresholds
): string {
  if (responseTime > thresholds.critical) return "CRITICAL";
  if (responseTime > thresholds.warning) return "WARNING";
  if (responseTime > thresholds.slow) return "SLOW";
  return "GOOD";
}

/**
 * Get performance metrics endpoint handler
 */
export const getPerformanceMetrics = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const limit = parseInt(req.query.limit as string) || 100;
  const metrics = performanceStore.getMetrics(limit);
  const averageResponseTime = performanceStore.getAverageResponseTime();
  const slowRequests = performanceStore.getSlowRequests();

  res.json({
    summary: {
      totalRequests: metrics.length,
      averageResponseTime: `${averageResponseTime}ms`,
      slowRequestCount: slowRequests.length,
      timestamp: new Date().toISOString(),
    },
    metrics: metrics,
    slowRequests: slowRequests.slice(-10), // Last 10 slow requests
  });
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  performanceStore.clear();
  res.json({
    message: "Performance metrics cleared",
    timestamp: new Date().toISOString(),
  });
};

// =============================================================================
// PRE-CONFIGURED PERFORMANCE MONITORS
// =============================================================================

/**
 * Basic performance monitoring
 */
export const basicPerformanceMonitor = performanceMonitorMiddleware({
  enableMemoryTracking: false,
  enableDBTracking: false,
  logSlowRequests: true,
});

/**
 * Detailed performance monitoring
 */
export const detailedPerformanceMonitor = performanceMonitorMiddleware({
  enableMemoryTracking: true,
  enableDBTracking: true,
  logSlowRequests: true,
  thresholds: {
    slow: 500,
    warning: 2000,
    critical: 5000,
  },
});

/**
 * Production performance monitoring (sampled)
 */
export const productionPerformanceMonitor = performanceMonitorMiddleware({
  enableMemoryTracking: true,
  enableDBTracking: true,
  logSlowRequests: true,
  sampleRate: 0.1, // Monitor 10% of requests
  excludePaths: ["/health", "/metrics", "/favicon.ico", "/robots.txt"],
});

export default performanceMonitorMiddleware;
