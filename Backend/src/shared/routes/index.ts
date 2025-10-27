/**
 * Shared Routes Index
 *
 * Central export point for all shared routing infrastructure.
 * Provides unified access to base routes, middleware chains, authentication,
 * health monitoring, and versioning systems.
 *
 * @module SharedRoutes
 * @category Shared Routes - Main Index
 * @description Unified routing infrastructure exports
 * @version 1.0.0
 */

// Base routing infrastructure
import { BaseRoutes, RouteConfig } from "./base/base.routes";
import CrudRoutes from "./base/crud.routes";

// Middleware chain builder
import {
  MiddlewareChains,
  CrudPermissions,
  BulkPermissions,
  SearchPermissions,
  RateLimits,
  CommonSchemas,
  ValidationSchema,
} from "./middleware-chain.builder";

// Security routes
import { AuthRoutes, AuthRouteConfig } from "./security/auth.routes";

// System routes
import {
  HealthRoutes,
  HealthRouteConfig,
  HealthStatus,
  HealthCheckResult,
  SystemMetrics,
} from "./system/health.routes";

// Versioned routing
import VersionedRoutes, {
  ApiVersion,
  VersionedRouteConfig,
  DeprecationWarning,
} from "./versioned/versioned.routes";

/**
 * Route factory functions for easy setup
 */
class RouteFactory {
  /**
   * Create a basic CRUD route set
   */
  static createCrudRoutes<T>(
    controller: any,
    resourceName: string,
    basePath: string,
    options: {
      softDelete?: boolean;
      enabledOperations?: {
        list?: boolean;
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
      };
    } = {}
  ) {
    const config = {
      basePath,
      resourceName,
      enabledOperations: options.enabledOperations || {},
      softDelete: options.softDelete || false,
    };

    return new CrudRoutes(controller, config);
  }

  /**
   * Create authentication routes
   */
  static createAuthRoutes(
    basePath: string = "/auth",
    options: {
      enablePasswordReset?: boolean;
      enableEmailVerification?: boolean;
      enableSocialAuth?: boolean;
    } = {}
  ) {
    const config = {
      basePath,
      enablePasswordReset: options.enablePasswordReset || true,
      enableEmailVerification: options.enableEmailVerification || true,
      enableSocialAuth: options.enableSocialAuth || false,
    };

    return new AuthRoutes(config);
  }

  /**
   * Create health monitoring routes
   */
  static createHealthRoutes(
    basePath: string = "/health",
    options: {
      enableMetrics?: boolean;
      enableStatus?: boolean;
      enableDatabaseChecks?: boolean;
      enableExternalServiceChecks?: boolean;
      customHealthChecks?: Array<{
        name: string;
        check: () => Promise<{
          status: "healthy" | "unhealthy";
          details?: any;
        }>;
      }>;
    } = {}
  ) {
    const config = {
      basePath,
      enableMetrics: options.enableMetrics || true,
      enableStatus: options.enableStatus || true,
      enableDatabaseChecks: options.enableDatabaseChecks || true,
      enableExternalServiceChecks: options.enableExternalServiceChecks || false,
      customHealthChecks: options.customHealthChecks || [],
    };

    return new HealthRoutes(config);
  }

  /**
   * Create versioned API routing system
   */
  static createVersionedRoutes(
    basePath: string = "/api",
    versions: ApiVersion[],
    defaultVersion: string,
    options: {
      enableHeaderVersioning?: boolean;
      enableQueryVersioning?: boolean;
      customVersionExtractor?: (req: any) => string | null;
    } = {}
  ) {
    const config = {
      basePath,
      defaultVersion,
      versions,
      enableHeaderVersioning: options.enableHeaderVersioning || true,
      enableQueryVersioning: options.enableQueryVersioning || true,
      customVersionExtractor: options.customVersionExtractor,
    };

    return new VersionedRoutes(config);
  }
}

/**
 * Pre-configured route sets for common scenarios
 */
class CommonRoutePatterns {
  /**
   * Complete API route setup with authentication, health, and versioning
   */
  static createCompleteApiRoutes(
    options: {
      apiBasePath?: string;
      authBasePath?: string;
      healthBasePath?: string;
      versions?: ApiVersion[];
      defaultVersion?: string;
      enableMetrics?: boolean;
    } = {}
  ) {
    const {
      apiBasePath = "/api",
      authBasePath = "/auth",
      healthBasePath = "/health",
      versions = [
        {
          version: "v1",
          name: "Version 1.0",
          description: "Initial API version",
          status: "stable",
          releaseDate: new Date(),
        },
      ],
      defaultVersion = "v1",
      enableMetrics = true,
    } = options;

    // Create versioned API routes
    const versionedRoutes = RouteFactory.createVersionedRoutes(
      apiBasePath,
      versions,
      defaultVersion
    );

    // Create authentication routes
    const authRoutes = RouteFactory.createAuthRoutes(authBasePath);

    // Create health routes
    const healthRoutes = RouteFactory.createHealthRoutes(healthBasePath, {
      enableMetrics,
    });

    return {
      versionedRoutes,
      authRoutes,
      healthRoutes,
    };
  }

  /**
   * Simple CRUD API pattern
   */
  static createCrudApiPattern(
    controller: any,
    resourceName: string,
    basePath: string,
    options: {
      enableBulkOperations?: boolean;
      enableSearch?: boolean;
      enableExport?: boolean;
      softDelete?: boolean;
    } = {}
  ) {
    const config = {
      basePath,
      resourceName,
      softDelete: options.softDelete || false,
      enabledOperations: {
        list: true,
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    };

    return RouteFactory.createCrudRoutes(
      controller,
      resourceName,
      basePath,
      config
    );
  }

  /**
   * Microservice API pattern with health and auth
   */
  static createMicroservicePattern(
    options: {
      serviceName?: string;
      version?: string;
      enableAuth?: boolean;
      enableHealth?: boolean;
      enableMetrics?: boolean;
    } = {}
  ) {
    const {
      serviceName = "service",
      version = "v1",
      enableAuth = true,
      enableHealth = true,
      enableMetrics = false,
    } = options;

    const routes: any = {};

    if (enableHealth) {
      routes.health = RouteFactory.createHealthRoutes("/health", {
        enableMetrics,
      });
    }

    if (enableAuth) {
      routes.auth = RouteFactory.createAuthRoutes("/auth");
    }

    // API versioning
    routes.api = RouteFactory.createVersionedRoutes(
      "/api",
      [
        {
          version,
          name: `${serviceName} API ${version}`,
          status: "stable",
          releaseDate: new Date(),
        },
      ],
      version
    );

    return routes;
  }
}

/**
 * Route registration helpers
 */
class RouteRegistry {
  private static routes: Map<string, any> = new Map();

  /**
   * Register a route group
   */
  static register(name: string, routes: any): void {
    RouteRegistry.routes.set(name, routes);
  }

  /**
   * Get registered routes
   */
  static get(name: string): any {
    return RouteRegistry.routes.get(name);
  }

  /**
   * Get all registered routes
   */
  static getAll(): Record<string, any> {
    return Object.fromEntries(RouteRegistry.routes);
  }

  /**
   * Clear all registered routes
   */
  static clear(): void {
    RouteRegistry.routes.clear();
  }
}

/**
 * Export all route utilities and infrastructure
 */
export {
  // Base infrastructure
  BaseRoutes,
  RouteConfig,
  CrudRoutes,

  // Middleware chain builder
  MiddlewareChains,
  CrudPermissions,
  BulkPermissions,
  SearchPermissions,
  RateLimits,
  CommonSchemas,
  ValidationSchema,

  // Security routes
  AuthRoutes,
  AuthRouteConfig,

  // System routes
  HealthRoutes,
  HealthRouteConfig,
  HealthStatus,
  HealthCheckResult,
  SystemMetrics,

  // Versioned routing
  VersionedRoutes,
  ApiVersion,
  VersionedRouteConfig,
  DeprecationWarning,

  // Utilities
  RouteFactory,
  CommonRoutePatterns,
  RouteRegistry,
};
