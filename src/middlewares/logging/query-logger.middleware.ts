import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Database Query Log Entry
 */
interface QueryLogEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  userId?: string;
  tenantId?: string;
  queryType: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "RAW" | "TRANSACTION";
  operation: string;
  table?: string;
  duration: number;
  query: string;
  params?: any[];
  rowCount?: number;
  success: boolean;
  error?: string;
  stackTrace?: string;
  metadata?: {
    model?: string;
    method?: string;
    cacheHit?: boolean;
    indexUsed?: string[];
    executionPlan?: any;
  };
}

/**
 * Query Performance Metrics
 */
interface QueryMetrics {
  totalQueries: number;
  averageResponseTime: number;
  slowQueries: number;
  failedQueries: number;
  queriesPerSecond: number;
  cacheHitRate: number;
  topSlowQueries: QueryLogEntry[];
  queryTypeDistribution: Record<string, number>;
  tableAccessFrequency: Record<string, number>;
}

/**
 * Query Logger Configuration
 */
interface QueryLoggerConfig {
  enabled: boolean;
  logAllQueries: boolean;
  logSlowQueries: boolean;
  slowQueryThreshold: number;
  logFailedQueries: boolean;
  includeParams: boolean;
  includeStackTrace: boolean;
  maxQueryLength: number;
  maxParamLength: number;
  logLevel: "minimal" | "standard" | "detailed" | "debug";
  sensitiveTablePatterns: string[];
  excludeTablePatterns: string[];
  enablePerformanceMetrics: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: QueryLoggerConfig = {
  enabled: true,
  logAllQueries: false,
  logSlowQueries: true,
  slowQueryThreshold: 1000, // 1 second
  logFailedQueries: true,
  includeParams: false,
  includeStackTrace: false,
  maxQueryLength: 5000,
  maxParamLength: 1000,
  logLevel: "standard",
  sensitiveTablePatterns: ["user_passwords", "api_keys", "tokens"],
  excludeTablePatterns: ["_prisma_migrations"],
  enablePerformanceMetrics: true,
};

/**
 * Query Log Store
 */
class QueryLogStore {
  private logs: QueryLogEntry[] = [];
  private maxLogs: number = 10000;
  private metrics: QueryMetrics;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  addQuery(entry: QueryLogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update metrics
    this.updateMetrics(entry);
  }

  private initializeMetrics(): QueryMetrics {
    return {
      totalQueries: 0,
      averageResponseTime: 0,
      slowQueries: 0,
      failedQueries: 0,
      queriesPerSecond: 0,
      cacheHitRate: 0,
      topSlowQueries: [],
      queryTypeDistribution: {},
      tableAccessFrequency: {},
    };
  }

  private updateMetrics(entry: QueryLogEntry): void {
    this.metrics.totalQueries++;

    // Update average response time
    const totalTime =
      this.metrics.averageResponseTime * (this.metrics.totalQueries - 1) +
      entry.duration;
    this.metrics.averageResponseTime = totalTime / this.metrics.totalQueries;

    // Count slow queries
    if (entry.duration > DEFAULT_CONFIG.slowQueryThreshold) {
      this.metrics.slowQueries++;
    }

    // Count failed queries
    if (!entry.success) {
      this.metrics.failedQueries++;
    }

    // Update query type distribution
    this.metrics.queryTypeDistribution[entry.queryType] =
      (this.metrics.queryTypeDistribution[entry.queryType] || 0) + 1;

    // Update table access frequency
    if (entry.table) {
      this.metrics.tableAccessFrequency[entry.table] =
        (this.metrics.tableAccessFrequency[entry.table] || 0) + 1;
    }

    // Update top slow queries
    if (entry.duration > 100) {
      // Only track queries > 100ms
      this.metrics.topSlowQueries.push(entry);
      this.metrics.topSlowQueries.sort((a, b) => b.duration - a.duration);
      this.metrics.topSlowQueries = this.metrics.topSlowQueries.slice(0, 10);
    }
  }

  getLogs(
    filter?: Partial<QueryLogEntry>,
    limit: number = 100
  ): QueryLogEntry[] {
    let filteredLogs = this.logs;

    if (filter) {
      filteredLogs = this.logs.filter((log) => {
        return Object.entries(filter).every(([key, value]) => {
          return log[key as keyof QueryLogEntry] === value;
        });
      });
    }

    return filteredLogs.slice(-limit);
  }

  getSlowQueries(threshold?: number): QueryLogEntry[] {
    const slowThreshold = threshold || DEFAULT_CONFIG.slowQueryThreshold;
    return this.logs.filter((log) => log.duration > slowThreshold);
  }

  getFailedQueries(): QueryLogEntry[] {
    return this.logs.filter((log) => !log.success);
  }

  getMetrics(): QueryMetrics {
    // Calculate queries per second (last minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentQueries = this.logs.filter(
      (log) => new Date(log.timestamp).getTime() > oneMinuteAgo
    );
    this.metrics.queriesPerSecond = recentQueries.length / 60;

    return { ...this.metrics };
  }

  clear(): void {
    this.logs = [];
    this.metrics = this.initializeMetrics();
  }
}

// Global query log store
const queryLogStore = new QueryLogStore();

/**
 * Query Logger Middleware
 *
 * Logs Prisma database queries for performance monitoring, debugging, and optimization.
 * Tracks query performance, identifies slow queries, and provides detailed analytics.
 *
 * @param config - Query logging configuration options
 */
export const queryLoggerMiddleware = (
  config: Partial<QueryLoggerConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!finalConfig.enabled) {
      next();
      return;
    }

    // Attach query logger to request context
    req.queryLogger = {
      logQuery: (queryInfo: Partial<QueryLogEntry>) => {
        logDatabaseQuery(queryInfo, req, finalConfig);
      },
      getQueryCount: () => {
        return req.queryCount || 0;
      },
      incrementQueryCount: () => {
        req.queryCount = (req.queryCount || 0) + 1;
      },
    };

    // Initialize query count for this request
    req.queryCount = 0;

    console.log(
      `[QUERY_LOGGER] Query logging enabled for ${req.method} ${req.path}`
    );
    next();
  };
};

/**
 * Log database query
 */
function logDatabaseQuery(
  queryInfo: Partial<QueryLogEntry>,
  req: AuthenticatedRequest,
  config: QueryLoggerConfig
): void {
  const entry: QueryLogEntry = {
    id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId || "unknown",
    userId: req.user?.id,
    tenantId: req.tenant?.id,
    queryType: queryInfo.queryType || "RAW",
    operation: queryInfo.operation || "unknown",
    table: queryInfo.table,
    duration: queryInfo.duration || 0,
    query: truncateString(queryInfo.query || "", config.maxQueryLength),
    params:
      config.includeParams && queryInfo.params
        ? truncateParams(queryInfo.params, config.maxParamLength)
        : undefined,
    rowCount: queryInfo.rowCount,
    success: queryInfo.success !== false,
    error: queryInfo.error,
    stackTrace: config.includeStackTrace ? queryInfo.stackTrace : undefined,
    metadata: queryInfo.metadata,
  };

  // Check if query should be logged
  if (shouldLogQuery(entry, config)) {
    queryLogStore.addQuery(entry);
    logQueryToConsole(entry, config);
  }

  // Increment request query count
  if (req.queryLogger) {
    req.queryLogger.incrementQueryCount();
  }
}

/**
 * Check if query should be logged based on configuration
 */
function shouldLogQuery(
  entry: QueryLogEntry,
  config: QueryLoggerConfig
): boolean {
  // Always log failed queries if enabled
  if (!entry.success && config.logFailedQueries) {
    return true;
  }

  // Log slow queries if enabled
  if (entry.duration > config.slowQueryThreshold && config.logSlowQueries) {
    return true;
  }

  // Log all queries if enabled
  if (config.logAllQueries) {
    return true;
  }

  // Check for sensitive tables
  if (
    entry.table &&
    config.sensitiveTablePatterns.some((pattern) =>
      entry.table!.toLowerCase().includes(pattern.toLowerCase())
    )
  ) {
    return false;
  }

  // Check for excluded tables
  if (
    entry.table &&
    config.excludeTablePatterns.some((pattern) =>
      entry.table!.toLowerCase().includes(pattern.toLowerCase())
    )
  ) {
    return false;
  }

  return false;
}

/**
 * Log query to console based on configuration
 */
function logQueryToConsole(
  entry: QueryLogEntry,
  config: QueryLoggerConfig
): void {
  const user = entry.userId || "system";
  const tenant = entry.tenantId || "no-tenant";
  const status = entry.success ? "SUCCESS" : "FAILED";
  const duration = `${entry.duration}ms`;

  switch (config.logLevel) {
    case "minimal":
      console.log(
        `[QUERY_LOGGER] ${entry.queryType} ${
          entry.table || entry.operation
        } | ${duration} | ${status}`
      );
      break;

    case "standard":
      console.log(
        `[QUERY_LOGGER] ${entry.queryType} ${
          entry.table || entry.operation
        } | ${duration} | ${status} | ${user} | ${tenant}`
      );
      break;

    case "detailed":
      console.log(
        `[QUERY_LOGGER] ${JSON.stringify({
          type: entry.queryType,
          operation: entry.operation,
          table: entry.table,
          duration: entry.duration,
          success: entry.success,
          user,
          tenant,
          rowCount: entry.rowCount,
          correlationId: entry.correlationId,
        })}`
      );
      break;

    case "debug":
      console.log(`[QUERY_LOGGER] ${JSON.stringify(entry, null, 2)}`);
      break;
  }

  // Log slow queries with warning
  if (entry.duration > config.slowQueryThreshold) {
    console.warn(
      `[QUERY_LOGGER] SLOW QUERY: ${entry.operation} took ${entry.duration}ms`
    );
  }

  // Log failed queries with error
  if (!entry.success) {
    console.error(
      `[QUERY_LOGGER] FAILED QUERY: ${entry.operation} - ${entry.error}`
    );
  }
}

/**
 * Truncate string to maximum length
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Truncate query parameters
 */
function truncateParams(params: any[], maxLength: number): any[] {
  if (!params) return [];

  return params.map((param) => {
    if (typeof param === "string" && param.length > maxLength) {
      return truncateString(param, maxLength);
    }
    return param;
  });
}

// =============================================================================
// PRISMA QUERY INTERCEPTION (Integration Helper)
// =============================================================================

/**
 * Prisma Query Logger Extension
 * This would be used with Prisma Client extensions to automatically log queries
 */
export const createPrismaQueryLogger = (req: AuthenticatedRequest) => {
  return {
    name: "query-logger",
    query: {
      $allOperations: async ({ operation, model, args, query }: any) => {
        const startTime = Date.now();
        let success = true;
        let error: string | undefined;
        let result: any;

        try {
          result = await query(args);
        } catch (err) {
          success = false;
          error = err instanceof Error ? err.message : String(err);
          throw err;
        } finally {
          const duration = Date.now() - startTime;

          // Log the query if query logger is available
          if (req.queryLogger) {
            req.queryLogger.logQuery({
              queryType: mapOperationToQueryType(operation),
              operation: `${model}.${operation}`,
              table: model,
              duration,
              query: `${model}.${operation}(${JSON.stringify(args)})`,
              params: args ? [args] : [],
              rowCount: getRowCount(result, operation),
              success,
              error,
              metadata: {
                model,
                method: operation,
                cacheHit: false, // This would be determined by Prisma extensions
              },
            });
          }
        }

        return result;
      },
    },
  };
};

/**
 * Map Prisma operation to SQL query type
 */
function mapOperationToQueryType(
  operation: string
): QueryLogEntry["queryType"] {
  switch (operation.toLowerCase()) {
    case "findunique":
    case "findfirst":
    case "findmany":
    case "count":
    case "aggregate":
      return "SELECT";
    case "create":
    case "createmany":
      return "INSERT";
    case "update":
    case "updatemany":
    case "upsert":
      return "UPDATE";
    case "delete":
    case "deletemany":
      return "DELETE";
    case "executeraw":
    case "queryraw":
      return "RAW";
    default:
      return "RAW";
  }
}

/**
 * Extract row count from query result
 */
function getRowCount(result: any, operation: string): number {
  if (!result) return 0;

  if (Array.isArray(result)) {
    return result.length;
  }

  if (typeof result === "object") {
    if ("count" in result) return result.count;
    if (operation.includes("many") && "count" in result) return result.count;
    return 1;
  }

  return 0;
}

// =============================================================================
// PRE-CONFIGURED QUERY LOGGERS
// =============================================================================

/**
 * Production query logger (minimal logging)
 */
export const productionQueryLogger = queryLoggerMiddleware({
  logAllQueries: false,
  logSlowQueries: true,
  slowQueryThreshold: 2000, // 2 seconds
  logFailedQueries: true,
  includeParams: false,
  logLevel: "minimal",
});

/**
 * Development query logger (detailed logging)
 */
export const developmentQueryLogger = queryLoggerMiddleware({
  logAllQueries: true,
  logSlowQueries: true,
  slowQueryThreshold: 500, // 500ms
  logFailedQueries: true,
  includeParams: true,
  includeStackTrace: true,
  logLevel: "detailed",
});

/**
 * Performance monitoring query logger
 */
export const performanceQueryLogger = queryLoggerMiddleware({
  logAllQueries: false,
  logSlowQueries: true,
  slowQueryThreshold: 1000, // 1 second
  logFailedQueries: true,
  includeParams: false,
  logLevel: "standard",
  enablePerformanceMetrics: true,
});

/**
 * Debug query logger (maximum information)
 */
export const debugQueryLogger = queryLoggerMiddleware({
  logAllQueries: true,
  logSlowQueries: true,
  slowQueryThreshold: 100, // 100ms
  logFailedQueries: true,
  includeParams: true,
  includeStackTrace: true,
  logLevel: "debug",
  maxQueryLength: 10000,
});

// =============================================================================
// QUERY LOG API ENDPOINTS
// =============================================================================

/**
 * Get query logs
 */
export const getQueryLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { queryType, table, success, limit = 100 } = req.query;

  const filter: Partial<QueryLogEntry> = {};
  if (queryType) filter.queryType = queryType as any;
  if (table) filter.table = table as string;
  if (success !== undefined) filter.success = success === "true";

  const logs = queryLogStore.getLogs(filter, parseInt(limit as string));

  res.json({
    logs,
    total: logs.length,
    filter,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get slow queries
 */
export const getSlowQueries = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const threshold =
    parseInt(req.query.threshold as string) ||
    DEFAULT_CONFIG.slowQueryThreshold;
  const slowQueries = queryLogStore.getSlowQueries(threshold);

  res.json({
    slowQueries,
    threshold: `${threshold}ms`,
    count: slowQueries.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get query performance metrics
 */
export const getQueryMetrics = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const metrics = queryLogStore.getMetrics();

  res.json({
    metrics,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clear query logs
 */
export const clearQueryLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.roles?.includes("SYSTEM_ADMIN")) {
    res.status(403).json({ message: "System admin access required" });
    return;
  }

  queryLogStore.clear();

  res.json({
    message: "Query logs cleared",
    clearedBy: req.user.email,
    timestamp: new Date().toISOString(),
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      queryLogger?: {
        logQuery: (queryInfo: Partial<QueryLogEntry>) => void;
        getQueryCount: () => number;
        incrementQueryCount: () => void;
      };
      queryCount?: number;
    }
  }
}

export default queryLoggerMiddleware;
