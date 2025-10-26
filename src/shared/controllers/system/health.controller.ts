/**
 * Health Controller - System monitoring and status endpoints
 *
 * Provides comprehensive health check endpoints for monitoring system status,
 * dependencies, and performance metrics with multi-tenant support.
 *
 * @module HealthController
 * @category Shared Controllers - Base Infrastructure
 * @description System health monitoring controller
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import {
  ControllerError,
  ValidationError,
  AuthenticatedRequest,
} from "../base/base.controller";
import { RequestContext } from "../../services/base/context.service";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "../../services/audit/audit.service";
import {
  ValidationFactory,
  ValidationResult,
  ValidationContext,
} from "../../validators/validation.types";
import { PrismaClient } from "@prisma/client";

/**
 * Health status enumeration
 */
export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
}

/**
 * Dependency check result
 */
export interface DependencyCheck {
  /** Dependency name */
  name: string;
  /** Health status */
  status: HealthStatus;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Error message if unhealthy */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * System metrics information
 */
export interface SystemMetrics {
  /** CPU usage percentage */
  cpu?: number;
  /** Memory usage information */
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  /** Disk usage information */
  disk?: {
    used: number;
    total: number;
    percentage: number;
  };
  /** Application uptime in seconds */
  uptime: number;
  /** Current timestamp */
  timestamp: Date;
}

/**
 * Health check response DTO
 */
export interface HealthCheckResponseDto {
  /** Overall health status */
  status: HealthStatus;
  /** Service name and version */
  service: {
    name: string;
    version: string;
    environment: string;
  };
  /** System metrics */
  metrics: SystemMetrics;
  /** Dependency checks */
  dependencies: DependencyCheck[];
  /** Health check timestamp */
  timestamp: Date;
  /** Request duration */
  duration: number;
}

/**
 * Readiness check response DTO
 */
export interface ReadinessCheckResponseDto {
  /** Readiness status */
  ready: boolean;
  /** Critical dependencies status */
  dependencies: DependencyCheck[];
  /** Readiness timestamp */
  timestamp: Date;
}

/**
 * Liveness check response DTO
 */
export interface LivenessCheckResponseDto {
  /** Liveness status */
  alive: boolean;
  /** Basic service information */
  service: {
    name: string;
    version: string;
  };
  /** Liveness timestamp */
  timestamp: Date;
}

/**
 * Health Controller
 *
 * Provides comprehensive health monitoring endpoints following Kubernetes
 * health check patterns with detailed dependency monitoring and metrics.
 *
 * @example
 * ```typescript
 * @Controller('/health')
 * export class ApplicationHealthController extends HealthController {
 *   constructor(
 *     prisma: PrismaClient,
 *     auditService: AuditService
 *   ) {
 *     super(prisma, auditService);
 *   }
 * }
 * ```
 */
export class HealthController {
  private readonly startTime: Date;
  private readonly serviceName: string;
  private readonly serviceVersion: string;
  private readonly environment: string;

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly auditService: AuditService
  ) {
    this.startTime = new Date();
    this.serviceName = process.env.SERVICE_NAME || "backend-api";
    this.serviceVersion = process.env.SERVICE_VERSION || "1.0.0";
    this.environment = process.env.NODE_ENV || "development";
  }

  /**
   * Handle GET requests for comprehensive health check
   *
   * 🔒 Middleware Requirements: None (public monitoring endpoint)
   * 🔍 RLS: Not applicable (system-level endpoint)
   * 📝 Audit: Health checks logged as LOW severity for monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async health(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();

    try {
      // Audit health check request
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `System health check requested`,
        userId: undefined, // Public endpoint
        tenantId: undefined, // System-wide endpoint
        resource: {
          type: "system",
          id: "health_check",
          name: "system_health_check",
        },
        metadata: {
          userAgent: req.get("user-agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
          endpoint: "/health",
        },
      });

      const result = await this.handleHealthCheck();
      const duration = Date.now() - startTime;

      // Set appropriate HTTP status based on health
      const statusCode = this.getHttpStatusFromHealth(result.status);

      // Audit health check results
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity:
          result.status === HealthStatus.HEALTHY
            ? AuditSeverity.LOW
            : AuditSeverity.MEDIUM,
        description: `Health check completed - Status: ${result.status}`,
        userId: undefined,
        tenantId: undefined,
        resource: {
          type: "system",
          id: "health_check_result",
          name: "system_health_check_result",
        },
        metadata: {
          healthStatus: result.status,
          executionTime: duration,
          dependencyCount: result.dependencies.length,
          failedDependencies: result.dependencies.filter(
            (d) => d.status !== HealthStatus.HEALTHY
          ).length,
          uptime: result.metrics.uptime,
          cpuUsage: result.metrics.cpu,
          memoryUsage: result.metrics.memory?.percentage,
        },
      });

      res.status(statusCode).json({
        ...result,
        duration,
      });
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.HIGH,
        description: `Health check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: undefined,
        tenantId: undefined,
        resource: {
          type: "system",
          id: "health_check_error",
          name: "system_health_check_error",
        },
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime,
          userAgent: req.get("user-agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
        },
      });

      next(error);
    }
  }

  /**
   * Handle GET requests for readiness probe
   *
   * 🔒 Middleware Requirements: None (Kubernetes readiness probe)
   * 🔍 RLS: Not applicable (system-level endpoint)
   * 📝 Audit: Readiness checks logged as LOW severity
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async ready(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.handleReadinessCheck();

      // Audit readiness check
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Readiness probe - ${
          result.ready ? "READY" : "NOT READY"
        }`,
        userId: undefined,
        tenantId: undefined,
        resource: {
          type: "system",
          id: "readiness_probe",
          name: "system_readiness_probe",
        },
        metadata: {
          ready: result.ready,
          criticalDependencies:
            result.dependencies?.filter(
              (d) => d.status !== HealthStatus.HEALTHY
            ).length || 0,
        },
      });

      // Return 200 if ready, 503 if not ready
      const statusCode = result.ready ? 200 : 503;

      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET requests for liveness probe
   *
   * 🔒 Middleware Requirements: None (Kubernetes liveness probe)
   * 🔍 RLS: Not applicable (system-level endpoint)
   * 📝 Audit: Liveness checks logged as LOW severity
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async live(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.handleLivenessCheck();

      // Audit liveness check
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.LOW,
        description: `Liveness probe - ${result.alive ? "ALIVE" : "NOT ALIVE"}`,
        userId: undefined,
        tenantId: undefined,
        resource: {
          type: "system",
          id: "liveness_probe",
          name: "system_liveness_probe",
        },
        metadata: {
          alive: result.alive,
          timestamp: result.timestamp,
        },
      });

      // Return 200 if alive, 503 if not alive
      const statusCode = result.alive ? 200 : 503;

      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET requests for detailed metrics
   *
   * 🔒 Middleware Requirements: jwt-auth, rbac-auth (admin access required)
   * 🔍 RLS: Uses authenticated context for access control
   * 📝 Audit: Metrics access logged as MEDIUM severity for monitoring
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async metrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!req.context?.actor || !req.context?.tenant) {
        throw new ControllerError(
          "Authentication and tenant context required",
          401
        );
      }

      // Audit metrics access
      await this.auditService.logEvent({
        type: AuditEventType.READ,
        severity: AuditSeverity.MEDIUM,
        description: `System metrics accessed by user`,
        userId: req.context.actor.userId,
        tenantId: req.context.tenant.tenantId,
        resource: {
          type: "system",
          id: "metrics_access",
          name: "system_metrics_access",
        },
        metadata: {
          correlationId: req.context.correlationId,
          userAgent: req.get("user-agent"),
          ipAddress: req.ip || req.connection.remoteAddress,
        },
      });

      const result = await this.handleMetricsCollection();

      res.status(200).json(result);
    } catch (error) {
      await this.auditService.logEvent({
        type: AuditEventType.SECURITY_VIOLATION,
        severity: AuditSeverity.MEDIUM,
        description: `Failed metrics access: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        userId: req.context?.actor?.userId,
        tenantId: req.context?.tenant?.tenantId,
        resource: {
          type: "system",
          id: "metrics_access_error",
          name: "system_metrics_access_error",
        },
        metadata: {
          correlationId: req.context?.correlationId,
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime,
        },
      });

      next(error);
    }
  }

  /**
   * Handle comprehensive health check
   */
  protected async handleHealthCheck(): Promise<HealthCheckResponseDto> {
    try {
      // Collect system metrics
      const metrics = await this.collectSystemMetrics();

      // Check all dependencies
      const dependencies = await this.checkAllDependencies();

      // Determine overall health status
      const status = this.calculateOverallHealth(dependencies);

      return {
        status,
        service: {
          name: this.serviceName,
          version: this.serviceVersion,
          environment: this.environment,
        },
        metrics,
        dependencies,
        timestamp: new Date(),
        duration: 0, // Will be set by the handler
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        service: {
          name: this.serviceName,
          version: this.serviceVersion,
          environment: this.environment,
        },
        metrics: await this.collectSystemMetrics(),
        dependencies: [],
        timestamp: new Date(),
        duration: 0,
      };
    }
  }

  /**
   * Handle readiness check
   */
  protected async handleReadinessCheck(): Promise<ReadinessCheckResponseDto> {
    try {
      // Check only critical dependencies for readiness
      const criticalDependencies = await this.checkCriticalDependencies();

      // Service is ready if all critical dependencies are healthy
      const ready = criticalDependencies.every(
        (dep) => dep.status === HealthStatus.HEALTHY
      );

      return {
        ready,
        dependencies: criticalDependencies,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        ready: false,
        dependencies: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Handle liveness check
   */
  protected async handleLivenessCheck(): Promise<LivenessCheckResponseDto> {
    try {
      // Basic liveness check - service is running
      return {
        alive: true,
        service: {
          name: this.serviceName,
          version: this.serviceVersion,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        alive: false,
        service: {
          name: this.serviceName,
          version: this.serviceVersion,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Handle metrics collection
   */
  protected async handleMetricsCollection(): Promise<{
    system: SystemMetrics;
    dependencies: DependencyCheck[];
    application: {
      uptime: number;
      environment: string;
      version: string;
    };
  }> {
    const systemMetrics = await this.collectSystemMetrics();
    const dependencies = await this.checkAllDependencies();

    return {
      system: systemMetrics,
      dependencies,
      application: {
        uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
        environment: this.environment,
        version: this.serviceVersion,
      },
    };
  }

  /**
   * Collect system metrics
   */
  protected async collectSystemMetrics(): Promise<SystemMetrics> {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    // Basic metrics (can be enhanced with more detailed monitoring)
    return {
      uptime,
      timestamp: new Date(),
      // Note: In production, you might want to use libraries like 'systeminformation'
      // for more detailed system metrics
      memory: process.memoryUsage
        ? {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            percentage: Math.round(
              (process.memoryUsage().heapUsed /
                process.memoryUsage().heapTotal) *
                100
            ),
          }
        : undefined,
    };
  }

  /**
   * Check all dependencies
   */
  protected async checkAllDependencies(): Promise<DependencyCheck[]> {
    const checks: Promise<DependencyCheck>[] = [
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ];

    const results = await Promise.allSettled(checks);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        const dependencyNames = ["database", "redis", "external-services"];
        return {
          name: dependencyNames[index],
          status: HealthStatus.UNHEALTHY,
          error: result.reason?.message || "Unknown error",
        };
      }
    });
  }

  /**
   * Check critical dependencies only
   */
  protected async checkCriticalDependencies(): Promise<DependencyCheck[]> {
    // Only check database for readiness (most critical)
    return [await this.checkDatabase()];
  }

  /**
   * Check database connectivity
   */
  protected async checkDatabase(): Promise<DependencyCheck> {
    const startTime = Date.now();

    try {
      // Simple connectivity test
      await this.prisma.$queryRaw`SELECT 1 as test`;

      const responseTime = Date.now() - startTime;

      return {
        name: "database",
        status: HealthStatus.HEALTHY,
        responseTime,
        metadata: {
          type: "postgresql",
          connectionPool: "active",
        },
      };
    } catch (error) {
      return {
        name: "database",
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        error:
          error instanceof Error ? error.message : "Database connection failed",
      };
    }
  }

  /**
   * Check Redis connectivity (if applicable)
   */
  protected async checkRedis(): Promise<DependencyCheck> {
    // Placeholder for Redis check
    // In a real implementation, you would check Redis connectivity here
    return {
      name: "redis",
      status: HealthStatus.UNKNOWN,
      metadata: {
        note: "Redis check not implemented",
      },
    };
  }

  /**
   * Check external services
   */
  protected async checkExternalServices(): Promise<DependencyCheck> {
    // Placeholder for external service checks
    // In a real implementation, you would check external APIs, message queues, etc.
    return {
      name: "external-services",
      status: HealthStatus.HEALTHY,
      metadata: {
        note: "No external services configured",
      },
    };
  }

  /**
   * Calculate overall health from dependency checks
   */
  protected calculateOverallHealth(
    dependencies: DependencyCheck[]
  ): HealthStatus {
    if (dependencies.length === 0) {
      return HealthStatus.UNKNOWN;
    }

    const unhealthyCount = dependencies.filter(
      (dep) => dep.status === HealthStatus.UNHEALTHY
    ).length;
    const degradedCount = dependencies.filter(
      (dep) => dep.status === HealthStatus.DEGRADED
    ).length;

    if (unhealthyCount > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (degradedCount > 0) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  /**
   * Get HTTP status code from health status
   */
  protected getHttpStatusFromHealth(status: HealthStatus): number {
    switch (status) {
      case HealthStatus.HEALTHY:
        return 200;
      case HealthStatus.DEGRADED:
        return 200; // Still operational
      case HealthStatus.UNHEALTHY:
        return 503;
      case HealthStatus.UNKNOWN:
        return 503;
      default:
        return 503;
    }
  }
}
