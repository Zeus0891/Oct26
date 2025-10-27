/**
 * Health Routes
 *
 * System health monitoring and status endpoints.
 * Provides comprehensive health checks, metrics, and system status information
 * for monitoring and observability.
 *
 * @module HealthRoutes
 * @category Shared Routes - System Infrastructure
 * @description Health monitoring and system status routes
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import { MiddlewareChains } from "../middleware-chain.builder";
import { AuthenticatedRequest } from "../../../middlewares/types";

/**
 * Health check configuration
 */
export interface HealthRouteConfig {
  /** Base path for health routes (e.g., '/health') */
  basePath: string;
  /** Enable detailed metrics endpoint */
  enableMetrics?: boolean;
  /** Enable system status endpoint */
  enableStatus?: boolean;
  /** Enable database health checks */
  enableDatabaseChecks?: boolean;
  /** Enable external service health checks */
  enableExternalServiceChecks?: boolean;
  /** Custom health check functions */
  customHealthChecks?: Array<{
    name: string;
    check: () => Promise<{ status: "healthy" | "unhealthy"; details?: any }>;
  }>;
}

/**
 * Health status types
 */
export type HealthStatus = "healthy" | "unhealthy" | "degraded";

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version?: string;
  environment?: string;
  checks?: {
    [key: string]: {
      status: HealthStatus;
      details?: any;
      responseTime?: number;
      error?: string;
    };
  };
}

/**
 * System metrics interface
 */
export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  database?: {
    connections: {
      active: number;
      idle: number;
      max: number;
    };
    queries: {
      total: number;
      slow: number;
      averageTime: number;
    };
  };
}

/**
 * Health routes class
 *
 * Provides comprehensive health monitoring endpoints for system observability.
 */
export class HealthRoutes {
  private readonly router: Router;
  private readonly config: HealthRouteConfig;
  private startTime: number;

  constructor(config: HealthRouteConfig) {
    this.router = Router();
    this.config = config;
    this.startTime = Date.now();
    this.setupRoutes();
  }

  /**
   * Setup health monitoring routes
   */
  private setupRoutes(): void {
    // Basic health check - public endpoint
    this.router.get(
      "/",
      ...MiddlewareChains.system.health(),
      this.handleAsyncRoute(this.basicHealthHandler.bind(this))
    );

    // Detailed health check - public endpoint
    this.router.get(
      "/detailed",
      ...MiddlewareChains.system.health(),
      this.handleAsyncRoute(this.detailedHealthHandler.bind(this))
    );

    // Liveness probe - minimal check for container orchestration
    this.router.get(
      "/live",
      ...MiddlewareChains.system.health(),
      this.handleAsyncRoute(this.livenessHandler.bind(this))
    );

    // Readiness probe - detailed check for container orchestration
    this.router.get(
      "/ready",
      ...MiddlewareChains.system.health(),
      this.handleAsyncRoute(this.readinessHandler.bind(this))
    );

    // System status - authenticated endpoint
    if (this.config.enableStatus) {
      this.router.get(
        "/status",
        ...MiddlewareChains.system.status(),
        this.handleAsyncRoute(this.statusHandler.bind(this))
      );
    }

    // System metrics - admin endpoint
    if (this.config.enableMetrics) {
      this.router.get(
        "/metrics",
        ...MiddlewareChains.system.metrics(),
        this.handleAsyncRoute(this.metricsHandler.bind(this))
      );
    }
  }

  /**
   * Basic health check handler
   */
  private async basicHealthHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uptime = Date.now() - this.startTime;

      const result: HealthCheckResult = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detailed health check handler
   */
  private async detailedHealthHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uptime = Date.now() - this.startTime;
      const checks: { [key: string]: any } = {};

      // Memory check
      const memoryUsage = process.memoryUsage();
      checks.memory = {
        status:
          memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9
            ? "healthy"
            : "degraded",
        details: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      };

      // Database checks
      if (this.config.enableDatabaseChecks) {
        checks.database = await this.checkDatabase();
      }

      // External service checks
      if (this.config.enableExternalServiceChecks) {
        checks.externalServices = await this.checkExternalServices();
      }

      // Custom health checks
      if (this.config.customHealthChecks) {
        for (const customCheck of this.config.customHealthChecks) {
          const checkStartTime = Date.now();
          try {
            const result = await customCheck.check();
            checks[customCheck.name] = {
              ...result,
              responseTime: Date.now() - checkStartTime,
            };
          } catch (error: any) {
            checks[customCheck.name] = {
              status: "unhealthy",
              error: error.message,
              responseTime: Date.now() - checkStartTime,
            };
          }
        }
      }

      // Determine overall status
      const statuses = Object.values(checks).map((check: any) => check.status);
      let overallStatus: HealthStatus = "healthy";
      if (statuses.some((status) => status === "unhealthy")) {
        overallStatus = "unhealthy";
      } else if (statuses.some((status) => status === "degraded")) {
        overallStatus = "degraded";
      }

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        checks,
      };

      // Set appropriate HTTP status based on health
      const statusCode =
        overallStatus === "healthy"
          ? 200
          : overallStatus === "degraded"
            ? 200
            : 503;

      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liveness probe handler
   */
  private async livenessHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Simple alive check - just respond with 200
      res.json({
        status: "alive",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Readiness probe handler
   */
  private async readinessHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const checks: { [key: string]: any } = {};
      let ready = true;

      // Check database connectivity if enabled
      if (this.config.enableDatabaseChecks) {
        const dbCheck = await this.checkDatabase();
        checks.database = dbCheck;
        if (dbCheck.status !== "healthy") {
          ready = false;
        }
      }

      // Check external services if enabled
      if (this.config.enableExternalServiceChecks) {
        const servicesCheck = await this.checkExternalServices();
        checks.externalServices = servicesCheck;
        if (servicesCheck.status !== "healthy") {
          ready = false;
        }
      }

      const result = {
        status: ready ? "ready" : "not-ready",
        timestamp: new Date().toISOString(),
        checks,
      };

      res.status(ready ? 200 : 503).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * System status handler (authenticated)
   */
  private async statusHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uptime = Date.now() - this.startTime;
      const memoryUsage = process.memoryUsage();

      const result = {
        status: "operational",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * System metrics handler (admin only)
   */
  private async metricsHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const uptime = Date.now() - this.startTime;
      const memoryUsage = process.memoryUsage();

      const metrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          free: Math.round(
            (memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024
          ),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          usage: Math.round(
            (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
          ),
        },
        cpu: {
          usage: 0, // Would need actual CPU monitoring library
        },
        requests: {
          total: 0,
          success: 0,
          errors: 0,
          averageResponseTime: 0,
        },
      };

      // Add database metrics if enabled
      if (this.config.enableDatabaseChecks) {
        metrics.database = {
          connections: {
            active: 0,
            idle: 0,
            max: 10,
          },
          queries: {
            total: 0,
            slow: 0,
            averageTime: 0,
          },
        };
      }

      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<{
    status: HealthStatus;
    details?: any;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      // Mock database check - in real implementation, this would ping the database
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate DB call

      return {
        status: "healthy",
        details: {
          connected: true,
          latency: Date.now() - startTime,
        },
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: "unhealthy",
        details: {
          connected: false,
          error: error.message,
        },
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check external services connectivity
   */
  private async checkExternalServices(): Promise<{
    status: HealthStatus;
    details?: any;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      // Mock external service checks
      const services = [
        { name: "redis", status: "healthy" },
        { name: "email-service", status: "healthy" },
        { name: "file-storage", status: "healthy" },
      ];

      return {
        status: "healthy",
        details: { services },
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: "unhealthy",
        details: {
          error: error.message,
        },
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Async route handler wrapper
   */
  private handleAsyncRoute(
    handler: (req: any, res: Response, next: NextFunction) => Promise<void>
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }

  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the base path
   */
  public getBasePath(): string {
    return this.config.basePath;
  }
}

/**
 * Export the health routes class
 */
export default HealthRoutes;
