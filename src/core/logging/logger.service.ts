/**
 * Logger Service
 *
 * Enterprise-grade logging service wrapping Winston with structured logging,
 * correlation IDs, tenant context, and multiple output formats.
 *
 * @module LoggerService
 * @category Core Infrastructure - Logging
 * @description Centralized logging service with correlation and tenant context
 * @version 1.0.0
 */

import winston from "winston";
import {
    env,
    getLoggingConfig,
    isDevelopment,
    isProduction,
} from "../config/env.config";

/**
 * Log levels following RFC 5424
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  HTTP = "http",
  VERBOSE = "verbose",
  DEBUG = "debug",
  SILLY = "silly",
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: string;
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  module?: string;
  action?: string;
  metadata?: Record<string, any>;
  error?: Error;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Logger context for structured logging
 */
export interface LoggerContext {
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  module?: string;
  action?: string;
}

/**
 * Custom Winston formatter for structured logs
 */
const structuredFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: any) => {
    const {
      timestamp,
      level,
      message,
      correlationId,
      tenantId,
      userId,
      requestId,
      module,
      action,
      duration,
      statusCode,
      method,
      url,
      userAgent,
      ip,
      stack,
      ...metadata
    } = info;

    const logEntry: any = {
      timestamp,
      level,
      message,
    };

    // Add context information
    if (correlationId) logEntry.correlationId = correlationId;
    if (tenantId) logEntry.tenantId = tenantId;
    if (userId) logEntry.userId = userId;
    if (requestId) logEntry.requestId = requestId;
    if (module) logEntry.module = module;
    if (action) logEntry.action = action;

    // Add request information
    if (duration !== undefined) logEntry.duration = duration;
    if (statusCode) logEntry.statusCode = statusCode;
    if (method) logEntry.method = method;
    if (url) logEntry.url = url;
    if (userAgent) logEntry.userAgent = userAgent;
    if (ip) logEntry.ip = ip;

    // Add error stack trace
    if (stack) logEntry.stack = stack;

    // Add additional metadata
    if (Object.keys(metadata).length > 0) {
      logEntry.metadata = metadata;
    }

    return JSON.stringify(logEntry);
  })
);

/**
 * Development-friendly formatter
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss.SSS",
  }),
  winston.format.printf((info: any) => {
    const {
      timestamp,
      level,
      message,
      correlationId,
      tenantId,
      userId,
      module,
      action,
      duration,
      stack,
    } = info;

    let logMessage = `${timestamp} [${level}]`;

    if (module) logMessage += ` [${module}]`;
    if (action) logMessage += ` [${action}]`;
    if (correlationId) logMessage += ` [${correlationId}]`;
    if (tenantId) logMessage += ` [tenant:${tenantId}]`;
    if (userId) logMessage += ` [user:${userId}]`;
    if (duration !== undefined) logMessage += ` [${duration}ms]`;

    logMessage += `: ${message}`;

    if (stack) {
      logMessage += `\n${stack}`;
    }

    return logMessage;
  })
);

/**
 * Create Winston logger instance
 */
function createWinsonLogger(): winston.Logger {
  const loggingConfig = getLoggingConfig();

  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      level: loggingConfig.level,
      format: isDevelopment ? developmentFormat : structuredFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  );

  // File transport for production
  if (isProduction || env.LOG_FILE_PATH) {
    const extraTransports: winston.transport[] = [
      new winston.transports.File({
        filename: loggingConfig.filePath,
        level: loggingConfig.level,
        format: structuredFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        tailable: true,
        handleExceptions: true,
        handleRejections: true,
      }),
      // Separate error log file
      new winston.transports.File({
        filename: loggingConfig.filePath.replace(".log", ".error.log"),
        level: "error",
        format: structuredFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      }),
    ];
    transports.push(...extraTransports);
  }

  return winston.createLogger({
    level: loggingConfig.level,
    levels: winston.config.npm.levels,
    transports,
    exitOnError: false,
    silent: false,
  });
}

/**
 * Logger Service Class
 */
export class LoggerService {
  private readonly winston: winston.Logger;
  private defaultContext: LoggerContext = {};

  constructor(defaultContext?: LoggerContext) {
    this.winston = createWinsonLogger();
    this.defaultContext = defaultContext || {};
  }

  /**
   * Set default context for all log entries
   */
  setDefaultContext(context: LoggerContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LoggerContext): LoggerService {
    const childLogger = new LoggerService({
      ...this.defaultContext,
      ...context,
    });
    return childLogger;
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: LoggerContext): void {
    this.log(LogLevel.ERROR, message, { error, ...context });
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LoggerContext & Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LoggerContext & Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log an HTTP request
   */
  http(message: string, context?: LoggerContext & Record<string, any>): void {
    this.log(LogLevel.HTTP, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LoggerContext & Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log a verbose message
   */
  verbose(
    message: string,
    context?: LoggerContext & Record<string, any>
  ): void {
    this.log(LogLevel.VERBOSE, message, context);
  }

  /**
   * Log at a specific level with context
   */
  log(
    level: LogLevel,
    message: string,
    context?: LoggerContext & Record<string, any>
  ): void {
    const logContext = {
      ...this.defaultContext,
      ...context,
    };

    this.winston.log(level, message, logContext);
  }

  /**
   * Log performance metrics
   */
  performance(
    message: string,
    duration: number,
    context?: LoggerContext
  ): void {
    this.log(LogLevel.INFO, message, {
      ...context,
      duration,
      type: "performance",
    });
  }

  /**
   * Log security events
   */
  security(
    message: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    context?: LoggerContext
  ): void {
    this.log(LogLevel.WARN, message, {
      ...context,
      type: "security",
      severity,
    });
  }

  /**
   * Log audit events
   */
  audit(
    message: string,
    action: string,
    resource?: string,
    context?: LoggerContext
  ): void {
    this.log(LogLevel.INFO, message, {
      ...context,
      type: "audit",
      action,
      resource,
    });
  }

  /**
   * Log business events
   */
  business(message: string, event: string, context?: LoggerContext): void {
    this.log(LogLevel.INFO, message, {
      ...context,
      type: "business",
      event,
    });
  }

  /**
   * Log API requests
   */
  request(
    message: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LoggerContext
  ): void {
    this.log(LogLevel.HTTP, message, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: "request",
    });
  }

  /**
   * Profile function execution
   */
  profile<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LoggerContext
  ): Promise<T> {
    return this.profileSync(name, fn, context);
  }

  /**
   * Profile synchronous function execution
   */
  async profileSync<T>(
    name: string,
    fn: () => Promise<T> | T,
    context?: LoggerContext
  ): Promise<T> {
    const startTime = Date.now();
    this.debug(`Starting ${name}`, context);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.performance(`Completed ${name}`, duration, context);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(
        `Failed ${name}`,
        error as Error,
        {
          ...context,
          duration,
          type: "performance-error",
        } as any
      );
      throw error;
    }
  }

  /**
   * Get the underlying Winston logger
   */
  getWinstonLogger(): winston.Logger {
    return this.winston;
  }

  /**
   * Flush all log transports
   */
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.winston.on("finish", resolve);
      this.winston.end();
    });
  }
}

/**
 * Global logger instance
 */
export const logger = new LoggerService();

/**
 * Create a logger with specific module context
 */
export function createModuleLogger(module: string): LoggerService {
  return logger.child({ module });
}

/**
 * Create a logger with request context
 */
export function createRequestLogger(
  correlationId: string,
  tenantId?: string,
  userId?: string
): LoggerService {
  return logger.child({
    correlationId,
    tenantId,
    userId,
  });
}

/**
 * Initialize logger service
 */
export function initializeLogger(): LoggerService {
  logger.log(LogLevel.INFO, "Logger service initialized", {
    module: "core",
    action: "initialize",
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    environment: env.NODE_ENV,
  });

  return logger;
} // Export default logger instance
export default logger;
