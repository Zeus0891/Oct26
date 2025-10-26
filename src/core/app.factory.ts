/**
 * Application Factory
 *
 * Creates and configures the Express application instance with all middleware,
 * routes, and error handling for the ERP Multitenant SaaS backend.
 *
 * @module AppFactory
 * @category Core Infrastructure - Application
 * @description Express application factory with middleware chain and route configuration
 * @version 1.0.0
 */

import express, { Express } from "express";
import { Server } from "node:http";

// Core middleware and configuration
import configureMiddleware, {
  MiddlewareConfig,
  cleanupMiddleware,
  configureEnvironmentMiddleware,
  configureProductionErrorHandling,
} from "./middleware";

// Configuration and services
import { env } from "./config/env.config";
import { logger } from "./logging/logger.service";
import { metrics } from "./logging/metrics.service";

// Module-level start timestamp (reserved for future uptime calculations)
// const APP_STARTED_AT = Date.now();

/**
 * Application factory configuration
 */
export interface AppFactoryConfig {
  middleware?: Partial<MiddlewareConfig>;
  disableRoutes?: boolean;
  customRoutes?: (app: Express) => void;
  enableGracefulShutdown?: boolean;
}

/**
 * Application context for dependency injection
 */
export interface AppContext {
  app: Express;
  server?: Server;
  config: AppFactoryConfig;
  startTime: Date;
  isShuttingDown: boolean;
}

/**
 * Create and configure Express application
 */
export function createApp(config: AppFactoryConfig = {}): Express {
  const startTime = Date.now();

  logger.info("Creating Express application", {
    module: "core",
    action: "create_app",
    environment: env.NODE_ENV,
  version: process.env.npm_package_version || "1.0.0",
  });

  // Create Express app instance
  const app = express();

  // Disable default Express headers for security
  app.disable("x-powered-by");
  app.disable("etag");

  // Set application metadata
  app.set("env", env.NODE_ENV);
  app.set("port", env.PORT);
  app.set("host", env.HOST);
  app.set("title", process.env.APP_NAME || "ERP Multitenant SaaS");
  app.set("version", process.env.npm_package_version || "1.0.0");

  // Configure global middleware
  try {
    configureMiddleware(app, config.middleware);
    configureEnvironmentMiddleware(app);

    logger.debug("Global middleware configured successfully");
  } catch (error) {
    logger.error("Failed to configure middleware", error as Error);
    throw error;
  }

  // Configure application routes (disabled by default to keep core clean)
  if (config.disableRoutes !== true) {
    try {
      // Intentionally no default routes; features will mount their own routers later
      // If you need core endpoints (health/metrics), wire them explicitly via customRoutes
      logger.debug("No default routes registered (clean core mode)");
    } catch (error) {
      logger.error("Failed while evaluating routes", error as Error);
      throw error;
    }
  }

  // Configure custom routes if provided
  if (config.customRoutes) {
    try {
      config.customRoutes(app);
      logger.debug("Custom routes configured successfully");
    } catch (error) {
      logger.error("Failed to configure custom routes", error as Error);
      throw error;
    }
  }

  // Configure error handling (must be last)
  configureErrorHandling(app);

  const creationTime = Date.now() - startTime;

  logger.info("Express application created successfully", {
    module: "core",
    action: "app_created",
    creationTime,
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    middleware: {
      enabled: Object.keys(config.middleware || {}).length > 0,
      customRoutes: !!config.customRoutes,
    },
  });

  return app;
}

/**
 * Configure application routes (migrated from legacy app.ts)
 */
function configureRoutes(app: Express): void {
  // Intentionally empty in clean-core mode
  logger.debug("configureRoutes called — no routes are registered by default");
}

/**
 * Configure error handling (migrated from legacy app.ts and enhanced)
 */
function configureErrorHandling(app: Express): void {
  // Configure production error handling
  configureProductionErrorHandling(app);

  logger.debug("Error handling configured");
}

/**
 * Create application context
 */
export function createAppContext(
  app: Express,
  config: AppFactoryConfig = {}
): AppContext {
  return {
    app,
    config,
    startTime: new Date(),
    isShuttingDown: false,
  };
}

/**
 * Shutdown application gracefully
 */
export async function shutdownApp(context: AppContext): Promise<void> {
  if (context.isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  context.isShuttingDown = true;

  logger.info("Starting graceful shutdown", {
    module: "core",
    action: "shutdown_start",
    uptime: Date.now() - context.startTime.getTime(),
  });

  try {
    // Close server if exists
    if (context.server) {
      await new Promise<void>((resolve, reject) => {
        context.server!.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      logger.debug("HTTP server closed");
    }

    // Cleanup middleware resources
    cleanupMiddleware();

    // Cleanup metrics
    metrics.shutdown();

    logger.info("Graceful shutdown completed", {
      module: "core",
      action: "shutdown_complete",
    });
  } catch (error) {
    logger.error("Error during shutdown", error as Error);
    throw error;
  }
}

/**
 * Get application health status
 */
export function getAppHealth(app: Express): any {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: env.NODE_ENV,
  version: process.env.npm_package_version || "1.0.0",
    port: app.get("port"),
    host: app.get("host"),
  };
}

export default createApp;
