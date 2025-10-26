import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Request Log Entry Interface
 */
interface RequestLogEntry {
  timestamp: string;
  correlationId: string;
  method: string;
  path: string;
  query: Record<string, any>;
  headers: Record<string, string>;
  userAgent?: string;
  ip: string;
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  tenantSlug?: string;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  referer?: string;
  origin?: string;
  sessionId?: string;
  apiVersion?: string;
  requestSize?: number;
  errorMessage?: string;
}

/**
 * Request Logger Configuration
 */
interface RequestLoggerConfig {
  logLevel: "minimal" | "standard" | "detailed" | "debug";
  includeHeaders: boolean;
  includeQuery: boolean;
  includeUserAgent: boolean;
  excludeHealthChecks: boolean;
  excludePaths: string[];
  sensitiveHeaders: string[];
  maxLogSize: number;
  logFormat: "json" | "text" | "combined";
  enableResponseLogging: boolean;
  logSlowRequests: boolean;
  slowRequestThreshold: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: RequestLoggerConfig = {
  logLevel: "standard",
  includeHeaders: false,
  includeQuery: true,
  includeUserAgent: true,
  excludeHealthChecks: true,
  excludePaths: ["/favicon.ico", "/robots.txt", "/metrics"],
  sensitiveHeaders: ["authorization", "cookie", "x-api-key", "x-auth-token"],
  maxLogSize: 10000, // 10KB
  logFormat: "json",
  enableResponseLogging: true,
  logSlowRequests: true,
  slowRequestThreshold: 1000, // 1 second
};

/**
 * Request Logger Store
 */
class RequestLogStore {
  private logs: RequestLogEntry[] = [];
  private maxLogs: number = 5000;

  addLog(entry: RequestLogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(
    filter?: Partial<RequestLogEntry>,
    limit: number = 100
  ): RequestLogEntry[] {
    let filteredLogs = this.logs;

    if (filter) {
      filteredLogs = this.logs.filter((log) => {
        return Object.entries(filter).every(([key, value]) => {
          return log[key as keyof RequestLogEntry] === value;
        });
      });
    }

    return filteredLogs.slice(-limit);
  }

  getLogsByTenant(tenantId: string, limit: number = 100): RequestLogEntry[] {
    return this.getLogs({ tenantId }, limit);
  }

  getLogsByUser(userId: string, limit: number = 100): RequestLogEntry[] {
    return this.getLogs({ userId }, limit);
  }

  getSlowRequests(threshold: number = 1000): RequestLogEntry[] {
    return this.logs.filter(
      (log) => log.responseTime && log.responseTime > threshold
    );
  }

  clear(): void {
    this.logs = [];
  }
}

// Global request log store
const requestLogStore = new RequestLogStore();

/**
 * Request Logger Middleware
 *
 * Logs all inbound requests with comprehensive information including method, path,
 * tenant context, user information, and performance metrics for monitoring and analytics.
 *
 * @param config - Request logging configuration options
 */
export const requestLoggerMiddleware = (
  config: Partial<RequestLoggerConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const startTime = Date.now();

    // Skip logging for excluded paths
    if (shouldExcludeRequest(req, finalConfig)) {
      next();
      return;
    }

    // Create initial log entry
    const logEntry: RequestLogEntry = {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId || "unknown",
      method: req.method,
      path: req.path,
      query: finalConfig.includeQuery ? sanitizeQuery(req.query) : {},
      headers: finalConfig.includeHeaders
        ? sanitizeHeaders(req.headers, finalConfig.sensitiveHeaders)
        : {},
      userAgent: finalConfig.includeUserAgent
        ? req.headers["user-agent"]
        : undefined,
      ip: getClientIP(req),
      userId: req.user?.id,
      userEmail: req.user?.email,
      tenantId: req.tenant?.id,
      tenantSlug: req.tenant?.slug,
      referer: req.headers.referer,
      origin: req.headers.origin,
      sessionId: extractSessionId(req),
      apiVersion: req.apiVersion?.resolved,
      requestSize: getRequestSize(req),
    };

    // Log request based on log level
    logRequest(logEntry, finalConfig);

    // Set up response logging
    if (finalConfig.enableResponseLogging) {
      const originalEnd = res.end;

      res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Update log entry with response information
        logEntry.statusCode = res.statusCode;
        logEntry.responseTime = responseTime;
        logEntry.contentLength =
          parseInt(res.getHeader("content-length") as string) || 0;

        // Add error message for failed requests
        if (res.statusCode >= 400) {
          logEntry.errorMessage = res.statusMessage || `HTTP ${res.statusCode}`;
        }

        // Store log entry
        requestLogStore.addLog(logEntry);

        // Log response
        logResponse(logEntry, finalConfig);

        // Log slow requests if enabled
        if (
          finalConfig.logSlowRequests &&
          responseTime > finalConfig.slowRequestThreshold
        ) {
          logSlowRequest(logEntry, finalConfig);
        }

        return originalEnd.call(this, chunk, encoding, cb);
      };
    } else {
      // Store log entry immediately if response logging is disabled
      requestLogStore.addLog(logEntry);
    }

    next();
  };
};

/**
 * Check if request should be excluded from logging
 */
function shouldExcludeRequest(
  req: Request,
  config: RequestLoggerConfig
): boolean {
  // Health checks
  if (
    config.excludeHealthChecks &&
    (req.path === "/health" || req.path === "/healthz")
  ) {
    return true;
  }

  // Excluded paths
  if (config.excludePaths.includes(req.path)) {
    return true;
  }

  // Static assets
  if (
    req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitize query parameters
 */
function sanitizeQuery(query: any): Record<string, any> {
  const sensitiveParams = ["password", "token", "key", "secret", "api_key"];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (sensitiveParams.some((param) => key.toLowerCase().includes(param))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize request headers
 */
function sanitizeHeaders(
  headers: any,
  sensitiveHeaders: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (
      sensitiveHeaders.some((header) =>
        key.toLowerCase().includes(header.toLowerCase())
      )
    ) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value as string;
    }
  }

  return sanitized;
}

/**
 * Get client IP address
 */
function getClientIP(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"] as string;

  return (
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    (forwardedFor && forwardedFor.split(",")[0]?.trim()) ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

/**
 * Extract session ID from request
 */
function extractSessionId(req: Request): string | undefined {
  const sessionHeader = req.headers["x-session-id"] as string;
  if (sessionHeader) return sessionHeader;

  const cookies = req.headers.cookie;
  if (cookies) {
    const sessionMatch = cookies.match(/sessionid=([^;]+)/);
    if (sessionMatch) return sessionMatch[1];
  }

  return undefined;
}

/**
 * Calculate request size
 */
function getRequestSize(req: Request): number {
  const contentLength = req.headers["content-length"];
  return contentLength ? parseInt(contentLength) : 0;
}

/**
 * Log request based on configuration
 */
function logRequest(entry: RequestLogEntry, config: RequestLoggerConfig): void {
  switch (config.logFormat) {
    case "text":
      logTextFormat(entry, "REQUEST");
      break;
    case "combined":
      logCombinedFormat(entry);
      break;
    case "json":
    default:
      logJsonFormat(entry, "REQUEST");
      break;
  }
}

/**
 * Log response based on configuration
 */
function logResponse(
  entry: RequestLogEntry,
  config: RequestLoggerConfig
): void {
  switch (config.logFormat) {
    case "text":
      logTextFormat(entry, "RESPONSE");
      break;
    case "combined":
      // Combined format logs only once
      break;
    case "json":
    default:
      logJsonFormat(entry, "RESPONSE");
      break;
  }
}

/**
 * Log slow request
 */
function logSlowRequest(
  entry: RequestLogEntry,
  config: RequestLoggerConfig
): void {
  console.warn(
    `[REQUEST_LOGGER] SLOW REQUEST: ${entry.method} ${entry.path} | ${
      entry.responseTime
    }ms | ${entry.userEmail || "anonymous"} | ${
      entry.tenantSlug || "no-tenant"
    }`
  );
}

/**
 * Log in JSON format
 */
function logJsonFormat(
  entry: RequestLogEntry,
  phase: "REQUEST" | "RESPONSE"
): void {
  const logData = {
    phase,
    ...entry,
  };

  if (phase === "REQUEST") {
    console.log(`[REQUEST_LOGGER] ${JSON.stringify(logData)}`);
  } else {
    console.log(`[REQUEST_LOGGER] ${JSON.stringify(logData)}`);
  }
}

/**
 * Log in text format
 */
function logTextFormat(
  entry: RequestLogEntry,
  phase: "REQUEST" | "RESPONSE"
): void {
  const user = entry.userEmail || "anonymous";
  const tenant = entry.tenantSlug || "no-tenant";
  const responseInfo = entry.statusCode
    ? ` | ${entry.statusCode} | ${entry.responseTime}ms`
    : "";

  console.log(
    `[REQUEST_LOGGER] ${phase}: ${entry.method} ${entry.path} | ${user} | ${tenant}${responseInfo}`
  );
}

/**
 * Log in combined format (Apache-like)
 */
function logCombinedFormat(entry: RequestLogEntry): void {
  const user = entry.userEmail || "-";
  const tenant = entry.tenantSlug || "-";
  const timestamp = entry.timestamp;
  const request = `${entry.method} ${entry.path} HTTP/1.1`;
  const status = entry.statusCode || "-";
  const size = entry.contentLength || "-";
  const referer = entry.referer || "-";
  const userAgent = entry.userAgent || "-";
  const responseTime = entry.responseTime || "-";

  console.log(
    `${entry.ip} - ${user} [${timestamp}] "${request}" ${status} ${size} "${referer}" "${userAgent}" ${responseTime}ms tenant:${tenant}`
  );
}

// =============================================================================
// PRE-CONFIGURED REQUEST LOGGERS
// =============================================================================

/**
 * Minimal request logging (production-friendly)
 */
export const minimalRequestLogger = requestLoggerMiddleware({
  logLevel: "minimal",
  includeHeaders: false,
  includeQuery: false,
  logFormat: "text",
  excludeHealthChecks: true,
});

/**
 * Standard request logging (balanced)
 */
export const standardRequestLogger = requestLoggerMiddleware({
  logLevel: "standard",
  includeHeaders: false,
  includeQuery: true,
  logFormat: "json",
  enableResponseLogging: true,
});

/**
 * Detailed request logging (debugging)
 */
export const detailedRequestLogger = requestLoggerMiddleware({
  logLevel: "detailed",
  includeHeaders: true,
  includeQuery: true,
  logFormat: "json",
  enableResponseLogging: true,
  logSlowRequests: true,
  slowRequestThreshold: 500,
});

/**
 * Apache-style combined logging
 */
export const combinedRequestLogger = requestLoggerMiddleware({
  logFormat: "combined",
  enableResponseLogging: true,
  excludeHealthChecks: true,
});

/**
 * Debug request logging (maximum information)
 */
export const debugRequestLogger = requestLoggerMiddleware({
  logLevel: "debug",
  includeHeaders: true,
  includeQuery: true,
  includeUserAgent: true,
  logFormat: "json",
  enableResponseLogging: true,
  logSlowRequests: true,
  slowRequestThreshold: 100,
  excludeHealthChecks: false,
});

// =============================================================================
// REQUEST LOG API ENDPOINTS
// =============================================================================

/**
 * Get request logs with filtering
 */
export const getRequestLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { method, path, userId, tenantId, statusCode, limit = 100 } = req.query;

  const filter: Partial<RequestLogEntry> = {};
  if (method) filter.method = method as string;
  if (path) filter.path = path as string;
  if (userId) filter.userId = userId as string;
  if (tenantId) filter.tenantId = tenantId as string;
  if (statusCode) filter.statusCode = parseInt(statusCode as string);

  const logs = requestLogStore.getLogs(filter, parseInt(limit as string));

  res.json({
    logs,
    total: logs.length,
    filter,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get slow requests
 */
export const getSlowRequests = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const threshold = parseInt(req.query.threshold as string) || 1000;
  const slowRequests = requestLogStore.getSlowRequests(threshold);

  res.json({
    slowRequests,
    threshold: `${threshold}ms`,
    count: slowRequests.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get request statistics
 */
export const getRequestStats = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const logs = requestLogStore.getLogs({}, 1000); // Last 1000 requests

  const stats = {
    total: logs.length,
    methods: getMethodStats(logs),
    statusCodes: getStatusCodeStats(logs),
    tenants: getTenantStats(logs),
    averageResponseTime: getAverageResponseTime(logs),
    slowRequestCount: logs.filter(
      (l) => l.responseTime && l.responseTime > 1000
    ).length,
    errorRate:
      logs.filter((l) => l.statusCode && l.statusCode >= 400).length /
      logs.length,
    timestamp: new Date().toISOString(),
  };

  res.json(stats);
};

/**
 * Clear request logs (admin only)
 */
export const clearRequestLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.roles?.includes("SYSTEM_ADMIN")) {
    res.status(403).json({ message: "System admin access required" });
    return;
  }

  requestLogStore.clear();

  res.json({
    message: "Request logs cleared",
    clearedBy: req.user.email,
    timestamp: new Date().toISOString(),
  });
};

// =============================================================================
// STATISTICS HELPERS
// =============================================================================

function getMethodStats(logs: RequestLogEntry[]): Record<string, number> {
  const stats: Record<string, number> = {};
  logs.forEach((log) => {
    stats[log.method] = (stats[log.method] || 0) + 1;
  });
  return stats;
}

function getStatusCodeStats(logs: RequestLogEntry[]): Record<string, number> {
  const stats: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.statusCode) {
      const range = `${Math.floor(log.statusCode / 100)}xx`;
      stats[range] = (stats[range] || 0) + 1;
    }
  });
  return stats;
}

function getTenantStats(logs: RequestLogEntry[]): Record<string, number> {
  const stats: Record<string, number> = {};
  logs.forEach((log) => {
    const tenant = log.tenantSlug || "no-tenant";
    stats[tenant] = (stats[tenant] || 0) + 1;
  });
  return stats;
}

function getAverageResponseTime(logs: RequestLogEntry[]): number {
  const responseTimes = logs
    .filter((l) => l.responseTime)
    .map((l) => l.responseTime!);
  return responseTimes.length > 0
    ? Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      )
    : 0;
}

export default requestLoggerMiddleware;
