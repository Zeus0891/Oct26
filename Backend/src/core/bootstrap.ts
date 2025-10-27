/**
 * Application Bootstrap
 *
 * Initializes and starts the ERP Multitenant SaaS backend application with
 * proper dependency injection, configuration validation, and startup sequence.
 *
 * @module Bootstrap
 * @category Core Infrastructure - Bootstrap
 * @description Application initialization and startup orchestration
 * @version 1.0.0
 */

import { Express } from "express";
import { Server } from "node:http";

// Core application components
import createApp, {
  AppContext,
  AppFactoryConfig,
  createAppContext,
} from "./app.factory";

// Configuration and services
import { env, validateEnvironment } from "./config/env.config";
import { initializeLogger } from "./logging/logger.service";
import { initializeMetrics } from "./logging/metrics.service";

/**
 * Initialize database connection with error handling
 * Migrated from legacy server.ts production logic
 */
import {
  checkDatabaseHealth as healthCheckPrisma,
  initializePrisma,
  prisma,
} from "./config/prisma.config";

const initializeDatabase = async (logger: any) => {
  try {
    await initializePrisma();
    logger.info("Database connected successfully");
    return prisma;
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    // Continue without database in production - service degradation mode
    return null;
  }
};

/**
 * Setup graceful shutdown handlers
 * Migrated from legacy server.ts production logic
 */
const setupGracefulShutdown = (
  server: Server | undefined,
  prisma: any,
  logger: any,
  context: BootstrapContext
) => {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    const shutdownTimeout = context.config.shutdownTimeout || 30000;
    const shutdownTimer = setTimeout(() => {
      logger.error("Graceful shutdown timeout exceeded, forcing exit");
      process.exit(1);
    }, shutdownTimeout);

    try {
      // Stop accepting new connections
      if (server) {
        server.close(() => {
          logger.info("HTTP server closed");
        });
      }

      // Close database connection
      if (prisma) {
        await prisma.$disconnect();
        logger.info("Database connection closed");
      }

      // Clear shutdown timer
      clearTimeout(shutdownTimer);

      logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      clearTimeout(shutdownTimer);
      process.exit(1);
    }
  };

  // Register signal handlers
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
  });
};

/**
 * Setup health monitoring
 * Migrated from legacy server.ts production logic
 */
const setupHealthMonitoring = (app: Express, prisma: any, logger: any) => {
  let isShuttingDown = false;

  // Health check endpoint with database status
  app.get("/health", async (req, res) => {
    try {
      if (isShuttingDown) {
        return res.status(503).json({
          status: "shutting-down",
          timestamp: new Date().toISOString(),
        });
      }

      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: "unknown",
      };

      // Check database health if available
      if (prisma) {
        try {
          await prisma.$queryRaw`SELECT 1`;
          health.database = "connected";
        } catch (error) {
          health.database = "disconnected";
          health.status = "degraded";
          logger.warn("Database health check failed:", error);
        }
      } else {
        health.database = "not-configured";
        health.status = "degraded";
      }

      const statusCode = health.status === "ok" ? 200 : 503;
      return res.status(statusCode).json(health);
    } catch (error) {
      logger.error("Health check endpoint error:", error);
      return res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      });
    }
  });

  // Mark as shutting down for health checks
  process.on("SIGTERM", () => {
    isShuttingDown = true;
  });
  process.on("SIGINT", () => {
    isShuttingDown = true;
  });
};

// Metrics are provided by core/logging/metrics.service

/**
 * Bootstrap configuration options
 */
export interface BootstrapConfig {
  app?: AppFactoryConfig;
  skipHealthChecks?: boolean;
  skipDatabaseInit?: boolean;
  shutdownTimeout?: number;
  enableGracefulShutdown?: boolean;
}

/**
 * Bootstrap context containing all initialized services
 */
export interface BootstrapContext {
  app: Express;
  server?: Server;
  appContext: AppContext;
  logger: any;
  metrics: any;
  prisma?: any;
  config: BootstrapConfig;
  startTime: Date;
}

/**
 * Application startup phases for controlled initialization
 */
enum StartupPhase {
  VALIDATION = "validation",
  LOGGING = "logging",
  METRICS = "metrics",
  DATABASE = "database",
  APPLICATION = "application",
  HEALTH_CHECKS = "health_checks",
  SERVER = "server",
  READY = "ready",
}

/**
 * Bootstrap the application with full initialization sequence
 */
export async function bootstrap(
  config: BootstrapConfig = {}
): Promise<BootstrapContext> {
  const startTime = new Date();
  let logger: any;

  try {
    // Phase 1: Configuration Validation
    console.log(
      `🚀 [${StartupPhase.VALIDATION}] Starting application bootstrap...`
    );

    // Validate environment configuration
    validateEnvironment();
    console.log(
      `✅ [${StartupPhase.VALIDATION}] Configuration validated successfully`
    );

    // Phase 2: Initialize Logging
    console.log(`🔧 [${StartupPhase.LOGGING}] Initializing logging service...`);

    logger = initializeLogger();
    logger.info("Logging service initialized", {
      module: "core",
      action: "bootstrap",
      phase: StartupPhase.LOGGING,
      environment: env.NODE_ENV,
    });

    // Phase 3: Initialize Metrics
    logger.info("Initializing metrics service", {
      phase: StartupPhase.METRICS,
    });

    const metrics = initializeMetrics();
    logger.info("Metrics service initialized", {
      phase: StartupPhase.METRICS,
    });

    // Phase 4: Initialize Database
    let prisma;

    if (config.skipDatabaseInit) {
      logger.info("Database initialization skipped", {
        phase: StartupPhase.DATABASE,
      });
    } else {
      logger.info("Initializing database connection", {
        phase: StartupPhase.DATABASE,
      });

      prisma = await initializeDatabase(logger);
      if (prisma) {
        logger.info("Database connection established", {
          phase: StartupPhase.DATABASE,
          database: "postgresql",
        });
      } else {
        logger.warn(
          "Database initialization failed, continuing in degraded mode",
          {
            phase: StartupPhase.DATABASE,
          }
        );
      }
    }

    // Phase 5: Create Application
    logger.info("Creating Express application", {
      phase: StartupPhase.APPLICATION,
    });

    const app = createApp(config.app);
    const appContext = createAppContext(app, config.app);

    // Setup health monitoring (disabled when skipHealthChecks=true to keep core clean)
    if (!config.skipHealthChecks) {
      setupHealthMonitoring(app, prisma, logger);
    }

    logger.info("Express application created", {
      phase: StartupPhase.APPLICATION,
      port: env.PORT,
      host: env.HOST,
    });

    // Phase 6: Health Checks
    if (config.skipHealthChecks) {
      logger.info("Health checks skipped", {
        phase: StartupPhase.HEALTH_CHECKS,
      });
    } else {
      logger.info("Running startup health checks", {
        phase: StartupPhase.HEALTH_CHECKS,
      });

      await runHealthChecks(logger, prisma);
      logger.info("All health checks passed", {
        phase: StartupPhase.HEALTH_CHECKS,
      });
    }

    // Create bootstrap context
    const bootstrapContext: BootstrapContext = {
      app,
      appContext,
      logger,
      metrics,
      prisma,
      config,
      startTime,
    };

    // Phase 7: Setup Initial Graceful Shutdown (will be updated with server reference later)
    if (config.enableGracefulShutdown !== false) {
      // Note: Final graceful shutdown setup happens in startServer with server reference
      logger.info(
        "Graceful shutdown handlers will be configured on server start",
        {
          timeout: config.shutdownTimeout || 30000,
        }
      );
    }

    const bootTime = Date.now() - startTime.getTime();

    logger.info("Application bootstrap completed successfully", {
      module: "core",
      action: "bootstrap_complete",
      bootTime,
      environment: env.NODE_ENV,
  version: process.env.npm_package_version || "1.0.0",
      phases: Object.values(StartupPhase),
    });

    return bootstrapContext;
  } catch (error) {
    const err = error as Error;
    const errorMessage = `Bootstrap failed`;

    if (logger) {
      logger.error(errorMessage, err);
    } else {
      console.error(errorMessage, err);
    }

    throw new Error(`${errorMessage}: ${err.message}`);
  }
}

/**
 * Start the HTTP server
 */
export async function startServer(
  context: BootstrapContext,
  port?: number,
  host?: string
): Promise<Server> {
  const serverPort = port || env.PORT;
  const serverHost = host || env.HOST;

  context.logger.info("Starting HTTP server", {
    module: "core",
    action: "start_server",
    port: serverPort,
    host: serverHost,
  });

  return new Promise((resolve, reject) => {
    const server = context.app.listen(serverPort, serverHost, () => {
      context.logger.info("HTTP server started successfully", {
        module: "core",
        action: "server_started",
        port: serverPort,
        host: serverHost,
        environment: env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });

      // Update context with server reference
      context.server = server;
      context.appContext.server = server;

      // Setup graceful shutdown with server reference
      if (context.config.enableGracefulShutdown !== false) {
        setupGracefulShutdown(server, context.prisma, context.logger, context);
      }

      resolve(server);
    });

    // Enhanced error handling with production logic
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        context.logger.error(`Port ${serverPort} is already in use`, {
          port: serverPort,
          host: serverHost,
          error: error.message,
        });
        reject(new Error(`Port ${serverPort} is already in use`));
      } else if (error.code === "EACCES") {
        context.logger.error(`Permission denied for port ${serverPort}`, {
          port: serverPort,
          host: serverHost,
          error: error.message,
        });
        reject(new Error(`Permission denied for port ${serverPort}`));
      } else {
        const err = error instanceof Error ? error : new Error(String(error));
        context.logger.error("Server startup error", {
          error: (err as any).message,
          port: serverPort,
          host: serverHost,
        });
        reject(err);
      }
    });

    // Set server timeouts (production configuration)
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 5000; // 5 seconds
    server.headersTimeout = 6000; // 6 seconds (must be > keepAliveTimeout)
  });
}

/**
 * Run startup health checks
 */
async function runHealthChecks(logger: any, prisma?: any): Promise<void> {
  const dbCheck: Promise<void>[] = prisma
    ? [
        healthCheckPrisma()
          .then(() => logger.debug("Database health check passed"))
          .catch((error) => {
            logger.error("Database health check failed", error);
            throw new Error("Database health check failed");
          }),
      ]
    : [];

  const memoryCheck: Promise<void> = Promise.resolve().then(() => {
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 1024 * 1024 * 1024; // 1GB

    if (memoryUsage.heapUsed > memoryThreshold) {
      logger.warn("High memory usage detected", {
        heapUsed: memoryUsage.heapUsed,
        threshold: memoryThreshold,
      });
    }

    logger.debug("Memory health check passed", memoryUsage);
  });

  const processCheck: Promise<void> = Promise.resolve().then(() => {
    const uptime = process.uptime();
    logger.debug("Process health check passed", { uptime });
  });

  await Promise.all([memoryCheck, processCheck, ...dbCheck]);
}

/**
 * Get bootstrap health status
 */
export function getBootstrapHealth(context: BootstrapContext): any {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - context.startTime.getTime(),
    environment: env.NODE_ENV,
  version: process.env.npm_package_version || "1.0.0",
    components: {
      app: !!context.app,
      server: !!context.server,
      logger: !!context.logger,
      metrics: !!context.metrics,
      database: !!context.prisma,
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
}

/**
 * Bootstrap and start application in one step
 */
export async function bootstrapAndStart(
  config: BootstrapConfig = {},
  port?: number,
  host?: string
): Promise<BootstrapContext> {
  const context = await bootstrap(config);
  await startServer(context, port, host);
  return context;
}

export default bootstrap;
