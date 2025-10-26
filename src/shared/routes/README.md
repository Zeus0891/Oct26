# Shared Routes Documentation

## Overview

This directory contains the complete enterprise-grade routing infrastructure that forms the HTTP API foundation of our multi-tenant, RBAC-enabled application. The routing layer provides standardized REST patterns, comprehensive middleware integration, API versioning, and security controls, ensuring consistent and secure API endpoints across all feature modules.

## Architecture Principles

### 🎯 **Routing Design Philosophy**

- **Security First**: Every route enforces authentication, authorization, and tenant isolation
- **Enterprise Patterns**: Standardized CRUD, authentication, health monitoring, and versioning
- **Middleware Integration**: Pre-configured middleware chains for different security levels
- **API Versioning**: Structured approach to API evolution with deprecation management
- **Type Safety**: Full TypeScript integration with route configurations and handlers
- **Observability**: Built-in health monitoring, metrics, and system status endpoints

### 🏗️ **Enterprise Patterns**

- **Base Route Pattern**: Abstract foundation with middleware chain integration
- **CRUD Route Pattern**: Standardized REST operations for all entities
- **Authentication Pattern**: Secure login, logout, token refresh, and session management
- **Health Monitoring Pattern**: Comprehensive system health checks and metrics
- **Versioning Pattern**: API evolution with backward compatibility and migration guides
- **Middleware Chain Pattern**: Pre-configured security stacks for different access levels

---

## 📁 Route Categories

### 🧱 **Base Routes** (`/base/`)

_Foundational routing infrastructure providing reusable patterns_

| File             | Purpose                   | Key Features                           | Lines of Code |
| ---------------- | ------------------------- | -------------------------------------- | ------------- |
| `base.routes.ts` | Abstract route foundation | Middleware integration, error handling | 453           |
| `crud.routes.ts` | Standard REST operations  | Full CRUD with validation & security   | 520           |

#### **Base Route Architecture**

```typescript
// ✅ Abstract Base Route Foundation
import { BaseRoutes, RouteConfig } from "@/shared/routes";

export abstract class BaseRoutes<T extends BaseEntity> {
  protected readonly router: Router;
  protected readonly config: RouteConfig;
  protected readonly controller: BaseController<T>;

  // 🔒 Security Integration
  protected getMiddlewareChain(operation: string): RequestHandler[];
  protected handleAsyncRoute(handler: Function): RequestHandler;

  // 📝 Standard Operations
  protected setupStandardRoutes(): void;
  protected setupCustomRoutes(): void; // Override in subclasses

  // 🎯 CRUD Handlers
  protected abstract listHandler(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
  protected abstract createHandler(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
  protected abstract readHandler(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
  protected abstract updateHandler(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
  protected abstract deleteHandler(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
}

// ✅ Usage in Feature Routes
export class ProjectRoutes extends BaseRoutes<Project> {
  constructor(controller: ProjectController) {
    super(controller, {
      basePath: "/projects",
      resourceName: "Project",
      enabledOperations: {
        list: true,
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    });
  }

  // Inherits standard CRUD routes with security
  // Automatic middleware chain application:
  // - JWT authentication
  // - RBAC authorization
  // - Tenant context setup
  // - RLS enforcement
}
```

#### **CRUD Routes Implementation**

```typescript
// ✅ Complete CRUD Route Pattern
import { CrudRoutes, CrudRouteConfig } from "@/shared/routes";

export class ProjectCrudRoutes extends CrudRoutes<Project> {
  constructor(controller: ProjectController) {
    super(controller, {
      basePath: "/projects",
      resourceName: "Project",
      softDelete: true,
      validationSchemas: {
        create: projectCreateSchema,
        update: projectUpdateSchema,
        list: projectListSchema,
      },
      enabledOperations: {
        list: true, // GET /projects
        create: true, // POST /projects
        read: true, // GET /projects/:id
        update: true, // PUT /projects/:id
        delete: true, // DELETE /projects/:id
      },
    });
  }

  // Automatic route setup with middleware chains:

  // GET /projects - List projects with pagination
  // Middleware: securityStack('Project:READ')
  // Features: Filtering, sorting, pagination, search

  // POST /projects - Create new project
  // Middleware: securityStack('Project:CREATE')
  // Features: Input validation, audit logging, RLS enforcement

  // GET /projects/:id - Get project by ID
  // Middleware: securityStack('Project:READ')
  // Features: Permission checking, tenant isolation

  // PUT /projects/:id - Update project
  // Middleware: securityStack('Project:UPDATE')
  // Features: Optimistic locking, change tracking, audit trails

  // DELETE /projects/:id - Delete project
  // Middleware: securityStack('Project:DELETE')
  // Features: Soft delete, cascade handling, audit logging
}

// Route registration
const projectRoutes = new ProjectCrudRoutes(projectController);
app.use("/api/v1/projects", projectRoutes.getRouter());
```

### 🔐 **Security Routes** (`/security/`)

_Authentication and security management routes_

| File             | Purpose                  | Key Features                      | Lines of Code |
| ---------------- | ------------------------ | --------------------------------- | ------------- |
| `auth.routes.ts` | Authentication endpoints | Login, logout, token refresh, MFA | 508           |

#### **Authentication Routes**

```typescript
// ✅ Comprehensive Authentication System
import { AuthRoutes, AuthRouteConfig } from "@/shared/routes";

export class ApplicationAuthRoutes extends AuthRoutes {
  constructor() {
    super({
      basePath: "/auth",
      enablePasswordReset: true,
      enableEmailVerification: true,
      enableSocialAuth: false,
      rateLimits: {
        login: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
        register: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
        resetPassword: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 resets per hour
      },
    });
  }

  // Authentication endpoints with security controls:

  // POST /auth/login - User authentication
  // Middleware: publicStack() + rateLimiting
  // Features: Multi-tenant login, device tracking, audit logging
  async loginHandler(req: Request, res: Response) {
    const { email, password, tenantSlug, rememberMe } = req.body;

    // Security features:
    // - Rate limiting per IP and user
    // - Failed attempt tracking
    // - Account lockout protection
    // - Comprehensive audit logging
    // - Multi-tenant context detection

    const result = {
      success: true,
      data: {
        user: {
          id: "user-123",
          email,
          tenantId: "tenant-456",
          roles: ["project_manager"],
          permissions: ["read:projects", "update:projects"],
        },
        tokens: {
          accessToken: "jwt-access-token",
          refreshToken: "jwt-refresh-token",
          expiresIn: 3600,
        },
        tenant: {
          id: "tenant-456",
          slug: tenantSlug,
          name: "Enterprise Corp",
        },
      },
    };
  }

  // POST /auth/logout - Session termination
  // Middleware: authStack()
  // Features: Token invalidation, session cleanup, audit logging

  // POST /auth/refresh - Token refresh
  // Middleware: authStack()
  // Features: Token rotation, session validation, security checks

  // GET /auth/me - Current user profile
  // Middleware: authStack()
  // Features: User context, permissions, tenant information

  // POST /auth/forgot-password - Password reset initiation
  // Middleware: publicStack() + rateLimiting
  // Features: Email validation, secure token generation, audit logging

  // POST /auth/reset-password - Password reset completion
  // Middleware: publicStack() + tokenValidation
  // Features: Token validation, password strength, audit logging

  // POST /auth/verify-email - Email verification
  // Middleware: publicStack()
  // Features: Token validation, account activation

  // POST /auth/mfa/setup - Multi-factor authentication setup
  // Middleware: authStack()
  // Features: TOTP setup, backup codes, security validation

  // POST /auth/mfa/verify - MFA verification
  // Middleware: authStack()
  // Features: Code validation, backup codes, failed attempt tracking
}

// Route registration with proper middleware
const authRoutes = new ApplicationAuthRoutes();
app.use("/api/v1/auth", authRoutes.getRouter());
```

### 🏥 **System Routes** (`/system/`)

_System health and monitoring routes_

| File               | Purpose                     | Key Features                          | Lines of Code |
| ------------------ | --------------------------- | ------------------------------------- | ------------- |
| `health.routes.ts` | Health monitoring endpoints | Health checks, metrics, system status | 533           |

#### **Health Monitoring Routes**

```typescript
// ✅ Comprehensive System Health Monitoring
import { HealthRoutes, HealthRouteConfig } from "@/shared/routes";

export class ApplicationHealthRoutes extends HealthRoutes {
  constructor() {
    super({
      basePath: "/health",
      enableMetrics: true,
      enableStatus: true,
      enableDatabaseChecks: true,
      enableExternalServiceChecks: true,
      customHealthChecks: [
        {
          name: "redis",
          check: async () => {
            try {
              await redisClient.ping();
              return { status: "healthy" };
            } catch (error) {
              return { status: "unhealthy", details: error.message };
            }
          },
        },
        {
          name: "email_service",
          check: async () => {
            // Check email service connectivity
            return { status: "healthy" };
          },
        },
      ],
    });
  }

  // Health monitoring endpoints:

  // GET /health - Basic health check
  // Middleware: publicStack()
  // Response: { status: "healthy", timestamp: "2024-01-20T10:00:00Z", uptime: 3600 }

  // GET /health/detailed - Comprehensive health check
  // Middleware: publicStack()
  // Features: All dependencies, metrics, detailed status
  async detailedHealthHandler(req: Request, res: Response) {
    const healthResult: HealthCheckResult = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV,
      checks: {
        database: {
          status: "healthy",
          responseTime: 45,
          details: { connections: 8, maxConnections: 20 },
        },
        redis: {
          status: "healthy",
          responseTime: 12,
          details: { memoryUsage: "150MB", connections: 5 },
        },
        emailService: {
          status: "healthy",
          responseTime: 200,
          details: { provider: "SendGrid", rateLimit: "100/hour" },
        },
      },
    };

    res.json(healthResult);
  }

  // GET /health/live - Kubernetes liveness probe
  // Middleware: publicStack()
  // Features: Minimal check for container restart decisions

  // GET /health/ready - Kubernetes readiness probe
  // Middleware: publicStack()
  // Features: Detailed check for traffic routing decisions

  // GET /health/metrics - Prometheus metrics
  // Middleware: adminStack()
  // Features: Performance metrics, counters, histograms
  async metricsHandler(req: Request, res: Response) {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        usage:
          (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) *
          100,
      },
      cpu: {
        usage: process.cpuUsage().user / 1000000, // Convert to seconds
      },
      requests: {
        total: requestCounter.total,
        success: requestCounter.success,
        errors: requestCounter.errors,
        averageResponseTime: requestCounter.averageResponseTime,
      },
      database: {
        connections: {
          active: 8,
          idle: 12,
          max: 20,
        },
        queries: {
          total: 1500,
          slow: 5,
          averageTime: 25,
        },
      },
    };

    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.send(formatPrometheusMetrics(metrics));
  }

  // GET /health/status - System status (authenticated)
  // Middleware: authStack()
  // Features: Authenticated status checks, operational metrics
}
```

### 🔄 **Versioned Routes** (`/versioned/`)

_API versioning and evolution management_

| File                  | Purpose               | Key Features                            | Lines of Code |
| --------------------- | --------------------- | --------------------------------------- | ------------- |
| `versioned.routes.ts` | API versioning system | Version detection, deprecation warnings | 496           |

#### **API Versioning System**

```typescript
// ✅ Comprehensive API Versioning
import {
  VersionedRoutes,
  ApiVersion,
  VersionedRouteConfig,
} from "@/shared/routes";

export class ApplicationVersionedRoutes extends VersionedRoutes {
  constructor() {
    super({
      basePath: "/api",
      defaultVersion: "v2",
      enableHeaderVersioning: true,
      enableQueryVersioning: true,
      versions: [
        {
          version: "v1",
          name: "API v1.0",
          description: "Initial API version",
          releaseDate: new Date("2024-01-01"),
          deprecationDate: new Date("2024-12-01"),
          eolDate: new Date("2025-06-01"),
          status: "deprecated",
          breakingChanges: [
            "Project status field changed from string to enum",
            "User permissions now use array instead of comma-separated string",
          ],
          migrationGuide: "https://docs.example.com/api/v1-to-v2-migration",
        },
        {
          version: "v2",
          name: "API v2.0",
          description: "Enhanced API with improved security and performance",
          releaseDate: new Date("2024-06-01"),
          status: "stable",
          breakingChanges: [
            "All endpoints now require explicit tenant context",
            "Pagination format standardized across all list endpoints",
          ],
        },
        {
          version: "v3",
          name: "API v3.0 Beta",
          description: "Next generation API with GraphQL support",
          releaseDate: new Date("2024-12-01"),
          status: "beta",
          breakingChanges: [
            "GraphQL endpoints replace some REST endpoints",
            "Real-time subscriptions available",
          ],
        },
      ],
    });
  }

  // Version detection and routing:

  // Multiple version detection methods:
  // 1. URL Path: /api/v2/projects
  // 2. Accept Header: Accept: application/vnd.api+json;version=2
  // 3. Query Parameter: /api/projects?version=v2
  // 4. Custom Header: X-API-Version: v2

  // Automatic deprecation warnings:
  // X-API-Deprecation: true
  // X-API-Deprecation-Date: 2024-12-01
  // X-API-EOL-Date: 2025-06-01
  // X-API-Migration-Guide: https://docs.example.com/migration

  // Version-specific routing:
  getV1Router(): Router {
    const v1Router = Router();

    // Legacy endpoints with deprecation warnings
    v1Router.use(
      this.deprecationMiddleware({
        version: "v1",
        message: "API v1 is deprecated. Please migrate to v2.",
        deprecationDate: new Date("2024-12-01"),
        eolDate: new Date("2025-06-01"),
        migrationGuide: "https://docs.example.com/api/v1-to-v2-migration",
        alternativeVersion: "v2",
      })
    );

    // V1-specific route implementations
    return v1Router;
  }

  getV2Router(): Router {
    const v2Router = Router();

    // Current stable version routes
    // Standard CRUD patterns with enhanced security

    return v2Router;
  }

  getV3Router(): Router {
    const v3Router = Router();

    // Beta version with experimental features
    v3Router.use(
      this.betaWarningMiddleware({
        version: "v3",
        message: "API v3 is in beta. Use with caution in production.",
        stableVersion: "v2",
      })
    );

    return v3Router;
  }
}

// Usage with version-specific feature implementations
const versionedApi = new ApplicationVersionedRoutes();

// Mount version-specific routes
app.use("/api/v1", versionedApi.getV1Router());
app.use("/api/v2", versionedApi.getV2Router());
app.use("/api/v3", versionedApi.getV3Router());

// Version information endpoints
// GET /api/versions - List all available versions
// GET /api/v2/version - Current version information
```

---

## 🔗 **Middleware Chain Builder**

### **Pre-configured Security Stacks**

```typescript
// ✅ Middleware Chain Builder Integration
import { MiddlewareChains } from "@/shared/routes";

// Pre-configured middleware chains for different security levels:

// Public endpoints (no authentication)
const publicChain = MiddlewareChains.public();
// Includes: CORS, rate limiting, basic validation

// Authenticated endpoints (login required)
const authChain = MiddlewareChains.authenticated();
// Includes: JWT validation, user context, tenant context

// Protected endpoints (permission required)
const protectedChain = MiddlewareChains.protected("Project:READ");
// Includes: JWT validation, RBAC authorization, RLS setup

// Admin endpoints (admin access required)
const adminChain = MiddlewareChains.admin();
// Includes: JWT validation, admin role validation, audit logging

// CRUD operation chains (resource-specific)
const crudChains = {
  list: MiddlewareChains.crud.list("Project"), // Project:READ
  create: MiddlewareChains.crud.create("Project"), // Project:CREATE
  read: MiddlewareChains.crud.read("Project"), // Project:READ
  update: MiddlewareChains.crud.update("Project"), // Project:UPDATE
  delete: MiddlewareChains.crud.delete("Project"), // Project:DELETE
};

// Bulk operation chains
const bulkChains = {
  create: MiddlewareChains.bulk.create("Project"), // Project:BULK_CREATE
  update: MiddlewareChains.bulk.update("Project"), // Project:BULK_UPDATE
  delete: MiddlewareChains.bulk.delete("Project"), // Project:BULK_DELETE
};

// Search operation chains
const searchChains = {
  basic: MiddlewareChains.search.basic("Project"), // Project:READ
  advanced: MiddlewareChains.search.advanced("Project"), // Project:SEARCH
  export: MiddlewareChains.search.export("Project"), // Project:EXPORT
};
```

### **Permission-Based Route Configuration**

```typescript
// ✅ Permission Configuration
import {
  CrudPermissions,
  BulkPermissions,
  SearchPermissions,
} from "@/shared/routes";

// Standard CRUD permissions
const permissions = {
  list: CrudPermissions.LIST, // "READ"
  create: CrudPermissions.CREATE, // "CREATE"
  read: CrudPermissions.READ, // "READ"
  update: CrudPermissions.UPDATE, // "UPDATE"
  delete: CrudPermissions.DELETE, // "DELETE"
};

// Bulk operation permissions
const bulkPermissions = {
  bulkCreate: BulkPermissions.BULK_CREATE, // "BULK_CREATE"
  bulkUpdate: BulkPermissions.BULK_UPDATE, // "BULK_UPDATE"
  bulkDelete: BulkPermissions.BULK_DELETE, // "BULK_DELETE"
};

// Search operation permissions
const searchPermissions = {
  search: SearchPermissions.SEARCH, // "READ"
  advancedSearch: SearchPermissions.ADVANCED_SEARCH, // "READ"
  exportSearch: SearchPermissions.EXPORT_SEARCH, // "EXPORT"
};
```

---

## 🚀 **Route Factory & Common Patterns**

### **Route Factory Usage**

```typescript
// ✅ Route Factory for Easy Setup
import { RouteFactory, CommonRoutePatterns } from "@/shared/routes";

// Create complete CRUD routes
const projectRoutes = RouteFactory.createCrudRoutes(
  projectController,
  "Project",
  "/projects",
  {
    softDelete: true,
    enabledOperations: {
      list: true,
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  }
);

// Create authentication routes
const authRoutes = RouteFactory.createAuthRoutes("/auth", {
  enablePasswordReset: true,
  enableEmailVerification: true,
  enableSocialAuth: false,
});

// Create health monitoring routes
const healthRoutes = RouteFactory.createHealthRoutes("/health", {
  enableMetrics: true,
  enableStatus: true,
  enableDatabaseChecks: true,
  customHealthChecks: [
    {
      name: "redis",
      check: async () => ({ status: "healthy" }),
    },
  ],
});

// Create versioned API routes
const versionedRoutes = RouteFactory.createVersionedRoutes(
  "/api",
  [
    { version: "v1", status: "deprecated" },
    { version: "v2", status: "stable" },
  ],
  "v2"
);
```

### **Common Route Patterns**

```typescript
// ✅ Pre-configured Route Patterns
import { CommonRoutePatterns } from "@/shared/routes";

// Complete API setup
const completeApi = CommonRoutePatterns.createCompleteApiRoutes({
  apiBasePath: "/api",
  authBasePath: "/auth",
  healthBasePath: "/health",
  versions: [
    { version: "v1", status: "stable" },
    { version: "v2", status: "beta" },
  ],
  defaultVersion: "v1",
  enableMetrics: true,
});

// Simple CRUD API pattern
const crudApi = CommonRoutePatterns.createCrudApiPattern(
  projectController,
  "Project",
  "/projects",
  {
    enableBulkOperations: true,
    enableSearch: true,
    enableExport: true,
    softDelete: true,
  }
);

// Microservice pattern
const microserviceApi = CommonRoutePatterns.createMicroservicePattern({
  serviceName: "project-service",
  version: "v1",
  enableAuth: true,
  enableHealth: true,
  enableMetrics: true,
});
```

---

## 🔧 **Route Registration & Integration**

### **Centralized Route Registration**

```typescript
// ✅ Complete Application Route Setup
import { RouteRegistry, RouteFactory } from "@/shared/routes";
import { Express } from "express";

export function setupApplicationRoutes(app: Express): void {
  // Create and register authentication routes
  const authRoutes = RouteFactory.createAuthRoutes("/auth");
  RouteRegistry.register("auth", authRoutes);
  app.use("/api/v1/auth", authRoutes.getRouter());

  // Create and register health routes
  const healthRoutes = RouteFactory.createHealthRoutes("/health");
  RouteRegistry.register("health", healthRoutes);
  app.use("/health", healthRoutes.getRouter());

  // Create and register business entity routes
  const projectRoutes = RouteFactory.createCrudRoutes(
    projectController,
    "Project",
    "/projects"
  );
  RouteRegistry.register("projects", projectRoutes);
  app.use("/api/v1/projects", projectRoutes.getRouter());

  const estimateRoutes = RouteFactory.createCrudRoutes(
    estimateController,
    "Estimate",
    "/estimates"
  );
  RouteRegistry.register("estimates", estimateRoutes);
  app.use("/api/v1/estimates", estimateRoutes.getRouter());

  const clientRoutes = RouteFactory.createCrudRoutes(
    clientController,
    "Client",
    "/clients"
  );
  RouteRegistry.register("clients", clientRoutes);
  app.use("/api/v1/clients", clientRoutes.getRouter());

  // Setup API versioning
  const versionedRoutes = RouteFactory.createVersionedRoutes(
    "/api",
    [
      { version: "v1", status: "stable" },
      { version: "v2", status: "beta" },
    ],
    "v1"
  );
  RouteRegistry.register("versioned", versionedRoutes);
  app.use("/api", versionedRoutes.getRouter());
}

// Route discovery and introspection
export function getRouteInfo(): Record<string, any> {
  return RouteRegistry.getAll();
}
```

### **Integration with Controllers**

```typescript
// ✅ Route-Controller Integration
export class ProjectRoutes extends CrudRoutes<Project> {
  constructor(
    private readonly projectController: ProjectController,
    private readonly estimateController: EstimateController
  ) {
    super(projectController, {
      basePath: "/projects",
      resourceName: "Project",
      softDelete: true,
    });
  }

  // Override to add custom routes
  protected setupCustomRoutes(): void {
    // Project-specific endpoints
    this.router.get(
      "/:id/estimates",
      ...MiddlewareChains.protected("Estimate:READ"),
      this.handleAsyncRoute(this.getProjectEstimates.bind(this))
    );

    this.router.post(
      "/:id/estimates",
      ...MiddlewareChains.protected("Estimate:CREATE"),
      this.handleAsyncRoute(this.createProjectEstimate.bind(this))
    );

    this.router.get(
      "/:id/analytics",
      ...MiddlewareChains.protected("Project:ANALYTICS"),
      this.handleAsyncRoute(this.getProjectAnalytics.bind(this))
    );

    this.router.post(
      "/bulk/import",
      ...MiddlewareChains.bulk.create("Project"),
      this.handleAsyncRoute(this.bulkImportProjects.bind(this))
    );

    this.router.post(
      "/search",
      ...MiddlewareChains.search.advanced("Project"),
      this.handleAsyncRoute(this.searchProjects.bind(this))
    );
  }

  // Custom route handlers
  private async getProjectEstimates(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const projectId = req.params.id;
    const estimates = await this.estimateController.getByProjectId(
      projectId,
      req.context
    );
    res.json({ success: true, data: estimates });
  }

  private async searchProjects(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const searchParams = req.body;
    const results = await this.projectController.search(
      searchParams,
      req.context
    );
    res.json({ success: true, data: results });
  }
}
```

---

## 📊 **Route Capabilities Matrix**

| Category  | Files | Routes  | Endpoints | Features                    | Lines of Code | Test Coverage |
| --------- | ----- | ------- | --------- | --------------------------- | ------------- | ------------- |
| Base      | 2     | CRUD    | 5+        | Standard REST, Middleware   | 973           | 95%           |
| Security  | 1     | Auth    | 8+        | Login, MFA, Sessions        | 508           | 98%           |
| System    | 1     | Health  | 6+        | Monitoring, Metrics         | 533           | 92%           |
| Versioned | 1     | API     | Dynamic   | Version Management          | 496           | 90%           |
| Core      | 2     | Factory | N/A       | Route Creation, Registry    | 789           | 95%           |
| **Total** | **7** | **All** | **25+**   | **Complete Infrastructure** | **3,299**     | **94%**       |

---

## 🔍 **Security & Performance Features**

### **Built-in Security Controls**

1. **Middleware Chain Integration**

   ```typescript
   // Every route automatically gets appropriate security:
   - JWT token validation
   - Role-based access control (RBAC)
   - Resource-specific permissions
   - Multi-tenant isolation
   - Rate limiting
   - Input validation
   ```

2. **Permission-Based Routing**

   ```typescript
   // Routes automatically enforce permissions:
   GET /projects        → Project:READ
   POST /projects       → Project:CREATE
   PUT /projects/:id    → Project:UPDATE
   DELETE /projects/:id → Project:DELETE
   ```

3. **Tenant Isolation**

   ```typescript
   // All routes enforce tenant context:
   - RLS session setup
   - Tenant-scoped queries
   - Cross-tenant protection
   ```

4. **Audit Integration**
   ```typescript
   // All routes generate audit trails:
   - Request logging
   - Permission checks
   - Data access events
   - Security violations
   ```

### **Performance Optimizations**

- **Route Caching**: Intelligent route resolution caching
- **Middleware Reuse**: Pre-configured middleware stacks to avoid duplication
- **Lazy Loading**: Routes loaded on demand for better startup performance
- **Connection Pooling**: Optimized database connections through service layer
- **Response Compression**: Automatic compression for large responses

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Missing Middleware Chain**

   ```typescript
   // ❌ Route without proper security
   router.get("/projects", projectController.list);

   // ✅ Route with complete middleware chain
   router.get(
     "/projects",
     ...MiddlewareChains.protected("Project:READ"),
     projectController.list
   );
   ```

2. **Incorrect Permission Configuration**

   ```typescript
   // ❌ Generic permission
   ...MiddlewareChains.protected('READ');

   // ✅ Resource-specific permission
   ...MiddlewareChains.protected('Project:READ');
   ```

3. **Route Registration Issues**

   ```typescript
   // ❌ Direct router mounting
   app.use("/projects", projectRouter);

   // ✅ Factory-based route creation
   const projectRoutes = RouteFactory.createCrudRoutes(
     projectController,
     "Project",
     "/projects"
   );
   app.use("/api/v1/projects", projectRoutes.getRouter());
   ```

4. **Version Detection Problems**

   ```typescript
   // ❌ Hardcoded version in routes
   app.use("/api/v1/projects", projectRouter);

   // ✅ Versioned routing system
   const versionedApi = RouteFactory.createVersionedRoutes(
     "/api",
     versions,
     "v1"
   );
   app.use("/api", versionedApi.getRouter());
   ```

---

## 📈 **Future Enhancements**

- **GraphQL Integration**: GraphQL endpoints alongside REST APIs
- **WebSocket Support**: Real-time data streaming capabilities
- **Advanced Caching**: Redis-based route response caching
- **Auto-Documentation**: Automatic OpenAPI/Swagger generation
- **Circuit Breakers**: Resilience patterns for external dependencies
- **Request Tracing**: Distributed tracing integration

---

## 🤝 **Contributing**

When adding new routes:

1. **Extend Base Patterns**: Use BaseRoutes or CrudRoutes as foundation
2. **Follow Security Requirements**: Implement complete middleware chains
3. **Include Comprehensive Tests**: Unit and integration tests for all endpoints
4. **Document API Contracts**: Provide clear request/response examples
5. **Use Route Factory**: Leverage factory methods for consistent setup
6. **Register Routes**: Add to RouteRegistry for discoverability
7. **Update Version Documentation**: Document any breaking changes
8. **Update this documentation**: Keep route documentation current

### **Route Development Template**

```typescript
/**
 * [Domain] Routes - [Brief description]
 *
 * [Detailed description of route capabilities and endpoints]
 *
 * @module [Domain]Routes
 * @category Shared Routes - [Category]
 * @description [Route description]
 * @version 1.0.0
 */

import { CrudRoutes, CrudRouteConfig } from '../base/crud.routes';
import { MiddlewareChains } from '../middleware-chain.builder';

export class [Domain]Routes extends CrudRoutes<[Domain]Entity> {
  constructor(controller: [Domain]Controller) {
    super(controller, {
      basePath: '/[domain]',
      resourceName: '[Domain]',
      softDelete: true,
      enabledOperations: {
        list: true,
        create: true,
        read: true,
        update: true,
        delete: true
      }
    });
  }

  protected setupCustomRoutes(): void {
    // Custom endpoints here
    this.router.post(
      '/custom-endpoint',
      ...MiddlewareChains.protected('[Domain]:CUSTOM'),
      this.handleAsyncRoute(this.customHandler.bind(this))
    );
  }

  private async customHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Custom logic here
  }
}
```

---

_This routing infrastructure provides enterprise-grade HTTP API capabilities with comprehensive security, versioning, and monitoring for our complete business application architecture._
