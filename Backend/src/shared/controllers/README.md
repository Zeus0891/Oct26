# Shared Controllers Documentation

## Overview

This directory contains the complete enterprise-grade controller infrastructure that forms the HTTP API layer of our multi-tenant, RBAC-enabled application. The controller layer provides standardized REST endpoints with comprehensive security, audit logging, validation, and RLS compliance, ensuring consistent API patterns across all feature modules.

## Architecture Principles

### 🎯 **Controller Design Philosophy**

- **Security First**: Every controller enforces RBAC permissions and RLS tenant isolation
- **Enterprise Patterns**: Standardized CRUD, search, bulk operations, and export capabilities
- **Audit Compliance**: Comprehensive logging for all operations with correlation tracking
- **Type Safety**: Full TypeScript integration with DTOs and validation
- **Performance Optimized**: Efficient pagination, bulk processing, and async operations
- **Multi-Tenant Ready**: Built-in tenant isolation and context management

### 🏗️ **Enterprise Patterns**

- **Base Controller Pattern**: Abstract foundation with security and audit integration
- **CRUD Template Pattern**: Standardized REST operations for all entities
- **Authentication Pattern**: Secure JWT-based authentication with session management
- **Search Pattern**: Advanced filtering, faceting, and full-text search capabilities
- **Bulk Operations Pattern**: Efficient multi-entity processing with error handling
- **Export Pattern**: Secure data export with multiple formats and RLS compliance

---

## 📁 Controller Categories

### 🧱 **Base Controllers** (`/base/`)

_Foundational controller infrastructure providing reusable patterns_

| Controller             | Purpose                        | Key Features                             | Lines of Code |
| ---------------------- | ------------------------------ | ---------------------------------------- | ------------- |
| `base.controller.ts`   | Abstract controller foundation | RBAC integration, RLS enforcement        | 738           |
| `crud.controller.ts`   | Standard REST operations       | Full CRUD with validation & audit        | 780           |
| `search.controller.ts` | Enterprise search capabilities | Full-text search, filtering, faceting    | 862           |
| `bulk.controller.ts`   | Multi-entity operations        | Batch processing, transaction support    | 1,150         |
| `export.controller.ts` | Secure data export             | Multi-format exports with RLS compliance | 1,055         |

#### **Base Controller Architecture**

```typescript
// ✅ Base Controller Foundation
import { BaseController, AuthenticatedRequest } from "@/shared/controllers";

export abstract class BaseController {
  // 🔒 Security Features
  protected checkPermissions(
    action: string,
    resource: string,
    context: RequestContext
  );
  protected enforceRLS(context: RequestContext);
  protected validateInput<T>(data: T, schema: ValidationSchema);

  // 📝 Audit Integration
  protected logOperation(
    operation: string,
    details: AuditDetails,
    context: RequestContext
  );
  protected logSecurityEvent(event: SecurityEvent, context: RequestContext);

  // 🎯 Standard Patterns
  protected createSuccessResponse<T>(data: T, metadata?: ResponseMetadata);
  protected createErrorResponse(error: ControllerError, correlationId: string);
  protected extractRequestContext(req: AuthenticatedRequest): RequestContext;
}

// ✅ Usage in Feature Controllers
export class ProjectController extends BaseController {
  async createProject(req: AuthenticatedRequest, res: Response) {
    const context = this.extractRequestContext(req);

    // Automatic security enforcement
    await this.checkPermissions("create", "Project", context);
    await this.enforceRLS(context);

    // Validation with audit logging
    const validationResult = await this.validateInput(req.body, projectSchema);

    // Business logic with automatic audit trail
    const project = await this.projectService.create(req.body, context);

    // Standardized response
    res.json(
      this.createSuccessResponse(project, {
        operation: "create_project",
        timestamp: new Date(),
      })
    );
  }
}
```

#### **CRUD Controller Template**

```typescript
// ✅ Standardized CRUD Operations
import { CrudController } from "@/shared/controllers";
import type { CrudConfig } from "@/shared/controllers/base/crud.controller";

export class EntityCrudController<
  T extends BaseEntity
> extends CrudController<T> {
  constructor(
    service: BaseService<T>,
    validator: BaseValidator<T>,
    config: CrudConfig = {
      softDelete: true,
      auditLogging: true,
      optimisticLocking: true,
      defaultPageSize: 20,
      maxPageSize: 100,
    }
  ) {
    super(service, validator, config);
  }

  // Inherits standardized endpoints:
  // POST   /entities          - Create entity
  // GET    /entities          - List entities (paginated)
  // GET    /entities/:id      - Get entity by ID
  // PUT    /entities/:id      - Update entity
  // PATCH  /entities/:id      - Partial update
  // DELETE /entities/:id      - Delete entity
}

// Usage example
const projectController = new EntityCrudController(
  projectService,
  projectValidator,
  {
    softDelete: true,
    auditLogging: true,
    defaultPageSize: 25,
    maxPageSize: 100,
  }
);

// Automatic middleware chain application:
router.use("/projects", [
  jwtAuthMiddleware, // JWT authentication
  rbacAuthMiddleware, // Role-based access control
  tenantContextMiddleware, // Multi-tenant context
  rlsSessionMiddleware, // Row Level Security setup
]);

router.post("/projects", projectController.create.bind(projectController));
router.get("/projects", projectController.list.bind(projectController));
router.get("/projects/:id", projectController.getById.bind(projectController));
router.put("/projects/:id", projectController.update.bind(projectController));
router.delete(
  "/projects/:id",
  projectController.delete.bind(projectController)
);
```

#### **Advanced Search Controller**

```typescript
// ✅ Enterprise Search Capabilities
import { SearchController } from "@/shared/controllers";
import type { SearchRequestDto } from "@/shared/controllers/base/search.controller";

export class ProjectSearchController extends SearchController<Project> {
  async advancedSearch(req: AuthenticatedRequest, res: Response) {
    const searchRequest: SearchRequestDto = {
      query: req.body.query,
      searchType: "FULL_TEXT",
      filters: [
        { field: "status", operation: "in", value: ["active", "planning"] },
        { field: "budget", operation: "between", value: [1000, 50000] },
        { field: "createdAt", operation: "greater_than", value: "2024-01-01" },
      ],
      sort: [
        { field: "priority", direction: "desc" },
        { field: "createdAt", direction: "desc" },
      ],
      facets: [
        { field: "status", label: "Project Status" },
        { field: "department", label: "Department" },
        { field: "client", label: "Client" },
      ],
      pagination: { page: 1, limit: 20 },
      highlight: true,
      includeAggregations: true,
    };

    // Automatic RLS enforcement and permission checking
    const results = await this.performSearch(searchRequest, req.context);

    // Response includes:
    // - Matching results with highlights
    // - Facet counts for filtering UI
    // - Aggregation data for analytics
    // - Pagination metadata
    // - Search performance metrics

    res.json(this.createSuccessResponse(results));
  }
}

// Search response structure:
interface SearchResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
  facets: SearchFacetResult[];
  aggregations: SearchAggregation[];
  highlights: SearchHighlight[];
  searchMetadata: {
    totalResults: number;
    searchTime: number;
    query: string;
    appliedFilters: SearchFilter[];
  };
}
```

#### **Bulk Operations Controller**

```typescript
// ✅ Efficient Multi-Entity Processing
import { BulkController } from "@/shared/controllers";
import type { BulkOperationRequestDto } from "@/shared/controllers/base/bulk.controller";

export class ProjectBulkController extends BulkController<Project> {
  async bulkCreate(req: AuthenticatedRequest, res: Response) {
    const bulkRequest: BulkOperationRequestDto<Project> = {
      operation: "CREATE",
      items: req.body.projects.map((project) => ({
        id: generateId(),
        data: project,
        metadata: { source: "bulk_import", priority: 1 },
      })),
      config: {
        mode: "BATCH", // Process in batches
        errorStrategy: "CONTINUE_ON_ERROR", // Don't stop on individual failures
        batchSize: 50, // Process 50 items per batch
        useTransaction: true, // Enable rollback capability
        validateBeforeProcessing: true, // Validate all before processing
      },
    };

    // Automatic permission checking for each item
    // RLS enforcement for all database operations
    // Comprehensive audit logging for each operation

    const results = await this.processBulkOperation(bulkRequest, req.context);

    // Response includes detailed results for each item
    res.json(
      this.createSuccessResponse({
        summary: {
          totalItems: results.totalItems,
          successful: results.successCount,
          failed: results.failureCount,
          skipped: results.skipCount,
          processingTime: results.processingTime,
        },
        items: results.itemResults,
        errors: results.errors,
      })
    );
  }
}

// Bulk operation response structure:
interface BulkOperationResponse<T> {
  summary: BulkOperationSummary;
  items: BulkItemResult<T>[];
  errors: BulkOperationError[];
  metadata: {
    correlationId: string;
    processingTime: number;
    batchInfo: BatchProcessingInfo;
  };
}
```

#### **Export Controller with RLS Compliance**

```typescript
// ✅ Secure Multi-Format Data Export
import { ExportController } from "@/shared/controllers";
import type { ExportRequestDto } from "@/shared/controllers/base/export.controller";

export class ProjectExportController extends ExportController<Project> {
  async exportProjects(req: AuthenticatedRequest, res: Response) {
    const exportRequest: ExportRequestDto = {
      format: "EXCEL",
      template: "DETAILED",
      fields: [
        {
          name: "name",
          label: "Project Name",
          include: true,
          securityLevel: "INTERNAL",
        },
        {
          name: "budget",
          label: "Budget",
          include: true,
          securityLevel: "CONFIDENTIAL",
        },
        {
          name: "client.name",
          label: "Client",
          include: true,
          securityLevel: "INTERNAL",
        },
        {
          name: "status",
          label: "Status",
          include: true,
          securityLevel: "PUBLIC",
        },
      ],
      filters: [
        { field: "status", operation: "in", value: ["active", "completed"] },
        { field: "createdAt", operation: "greater_than", value: "2024-01-01" },
      ],
      config: {
        includeHeaders: true,
        dateFormat: "YYYY-MM-DD",
        securityLevel: "CONFIDENTIAL",
        encryption: true,
        retentionDays: 7,
      },
    };

    // Automatic field-level security based on user permissions
    // RLS enforcement for data access
    // Comprehensive audit logging for export activities

    const exportJob = await this.createExportJob(exportRequest, req.context);

    // For large exports, return job ID for async processing
    if (exportJob.isAsync) {
      res.json(
        this.createSuccessResponse({
          jobId: exportJob.id,
          status: "PROCESSING",
          estimatedCompletionTime: exportJob.estimatedCompletionTime,
          downloadUrl: `/api/exports/${exportJob.id}/download`,
        })
      );
    } else {
      // For small exports, return file directly
      res.setHeader("Content-Type", exportJob.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${exportJob.filename}"`
      );
      res.send(exportJob.data);
    }
  }
}
```

### 🔐 **Security Controllers** (`/security/`)

_Authentication and security management controllers_

| Controller           | Purpose                   | Key Features                        | Lines of Code |
| -------------------- | ------------------------- | ----------------------------------- | ------------- |
| `auth.controller.ts` | Authentication management | JWT tokens, MFA, session management | 794           |

#### **Authentication Controller**

```typescript
// ✅ Comprehensive Authentication
import { AuthController } from "@/shared/controllers";
import type { LoginRequestDto } from "@/shared/controllers/security/auth.controller";

export class ApplicationAuthController extends AuthController {
  constructor(
    authService: AuthService,
    auditService: AuditService,
    validationService: ValidationService
  ) {
    super(authService, auditService, validationService);
  }

  // Authentication endpoints with security controls:

  async login(req: Request, res: Response) {
    const loginRequest: LoginRequestDto = {
      identifier: req.body.email,
      password: req.body.password,
      tenantId: req.body.tenantId,
      rememberMe: req.body.rememberMe,
      clientInfo: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        deviceFingerprint: req.body.deviceFingerprint,
      },
    };

    // Comprehensive security controls:
    // - Rate limiting based on IP and user
    // - Password strength validation
    // - Account lockout protection
    // - Suspicious activity detection
    // - Comprehensive audit logging

    const authResult = await this.authService.authenticate(loginRequest, {
      correlationId: req.headers["x-correlation-id"],
      request: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date(),
      },
    });

    if (authResult.success) {
      res.json({
        success: true,
        data: {
          tokens: authResult.tokens,
          user: {
            id: authResult.user.userId,
            email: authResult.user.email,
            name: authResult.user.firstName + " " + authResult.user.lastName,
            roles: authResult.user.roles,
            permissions: authResult.user.permissions,
            tenantId: authResult.user.tenantId,
          },
          session: authResult.session,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          code: authResult.error.code,
          message: authResult.error.message,
        },
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    // Token refresh with security validation
    // - Refresh token validation
    // - Session verification
    // - Token rotation for security
    // - Audit logging for token operations
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    // Secure logout process
    // - Token invalidation
    // - Session cleanup
    // - Optional multi-device logout
    // - Audit logging for logout events
  }

  async forgotPassword(req: Request, res: Response) {
    // Password reset initiation
    // - Email validation
    // - Rate limiting for reset requests
    // - Secure token generation
    // - Audit logging for security events
  }

  async resetPassword(req: Request, res: Response) {
    // Password reset completion
    // - Reset token validation
    // - Password strength requirements
    // - Password history checking
    // - Account reactivation if needed
  }

  async setupMFA(req: AuthenticatedRequest, res: Response) {
    // Multi-factor authentication setup
    // - TOTP/SMS setup
    // - Backup codes generation
    // - Security validation
    // - Audit logging for MFA changes
  }

  async verifyMFA(req: AuthenticatedRequest, res: Response) {
    // MFA verification
    // - Code validation
    // - Backup code handling
    // - Failed attempt tracking
    // - Audit logging for MFA events
  }
}
```

### 🏥 **System Controllers** (`/system/`)

_System health and monitoring controllers_

| Controller             | Purpose                | Key Features                          | Lines of Code |
| ---------------------- | ---------------------- | ------------------------------------- | ------------- |
| `health.controller.ts` | Health check endpoints | Service monitoring, dependency checks | 714           |

#### **Health Monitoring Controller**

```typescript
// ✅ Comprehensive System Health Monitoring
import { HealthController } from "@/shared/controllers";
import type { HealthCheckResponseDto } from "@/shared/controllers/system/health.controller";

export class ApplicationHealthController extends HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditService: AuditService
  ) {
    super(prisma, auditService);
  }

  // Health check endpoints following Kubernetes patterns:

  async healthCheck(req: Request, res: Response) {
    // Comprehensive health check
    const healthResponse: HealthCheckResponseDto = {
      status: HealthStatus.HEALTHY,
      service: {
        name: "enterprise-app",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
      },
      metrics: {
        cpu: process.cpuUsage(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage:
            (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) *
            100,
        },
        uptime: process.uptime(),
        timestamp: new Date(),
      },
      dependencies: [
        await this.checkDatabase(),
        await this.checkRedis(),
        await this.checkEmailService(),
        await this.checkFileStorage(),
        await this.checkExternalAPIs(),
      ],
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };

    const overallStatus = this.calculateOverallHealth(
      healthResponse.dependencies
    );
    healthResponse.status = overallStatus;

    res
      .status(overallStatus === HealthStatus.HEALTHY ? 200 : 503)
      .json(healthResponse);
  }

  async readinessCheck(req: Request, res: Response) {
    // Kubernetes readiness probe
    // Checks if service is ready to receive traffic
    const criticalDependencies = [
      await this.checkDatabase(),
      await this.checkCriticalServices(),
    ];

    const isReady = criticalDependencies.every(
      (dep) => dep.status === HealthStatus.HEALTHY
    );

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      dependencies: criticalDependencies,
      timestamp: new Date(),
    });
  }

  async livenessCheck(req: Request, res: Response) {
    // Kubernetes liveness probe
    // Basic service availability check
    res.json({
      alive: true,
      service: {
        name: "enterprise-app",
        version: "1.0.0",
      },
      timestamp: new Date(),
    });
  }

  async metrics(req: Request, res: Response) {
    // Prometheus-compatible metrics endpoint
    const metrics = {
      http_requests_total: this.getRequestMetrics(),
      http_request_duration_seconds: this.getRequestDurations(),
      database_connections_active: this.getDatabaseMetrics(),
      cache_hits_total: this.getCacheMetrics(),
      error_rate: this.getErrorRates(),
      custom_business_metrics: this.getBusinessMetrics(),
    };

    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.send(this.formatPrometheusMetrics(metrics));
  }

  private async checkDatabase(): Promise<DependencyCheck> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: "database",
        status: HealthStatus.HEALTHY,
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "database",
        status: HealthStatus.UNHEALTHY,
        error: error.message,
      };
    }
  }
}
```

---

## 🚀 **Middleware Integration**

### **Required Security Middleware Chain**

```typescript
// ✅ Standard security middleware stack for all controllers
import {
  jwtAuthMiddleware,
  rbacAuthMiddleware,
  tenantContextMiddleware,
  rlsSessionMiddleware,
  auditMiddleware,
} from "@/middlewares";

// Complete middleware chain for protected endpoints
const secureEndpointMiddleware = [
  jwtAuthMiddleware, // JWT token validation and user extraction
  rbacAuthMiddleware, // Role-based access control validation
  tenantContextMiddleware, // Multi-tenant context establishment
  rlsSessionMiddleware, // Row Level Security session setup
  auditMiddleware, // Request audit logging
];

// Apply to controller routes
router.use("/api/v1/projects", secureEndpointMiddleware);
router.use("/api/v1/estimates", secureEndpointMiddleware);
router.use("/api/v1/clients", secureEndpointMiddleware);

// Public endpoints (authentication only)
const publicEndpointMiddleware = [
  auditMiddleware, // Basic request logging
];

router.use("/api/v1/auth", publicEndpointMiddleware);
router.use("/health", publicEndpointMiddleware);
```

### **Controller-Specific Middleware**

```typescript
// ✅ Specialized middleware for specific operations
import {
  rateLimitMiddleware,
  uploadMiddleware,
  cacheMiddleware,
} from "@/middlewares";

// Rate limiting for authentication endpoints
router.post(
  "/auth/login",
  rateLimitMiddleware({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 min
  authController.login
);

// File upload for bulk operations
router.post(
  "/projects/bulk/import",
  ...secureEndpointMiddleware,
  uploadMiddleware({ maxFileSize: "10MB", allowedTypes: ["csv", "xlsx"] }),
  bulkController.importProjects
);

// Response caching for read-only endpoints
router.get(
  "/projects",
  ...secureEndpointMiddleware,
  cacheMiddleware({ ttl: 300 }), // 5 minute cache
  projectController.listProjects
);

// Export rate limiting
router.post(
  "/projects/export",
  ...secureEndpointMiddleware,
  rateLimitMiddleware({ max: 3, windowMs: 60 * 60 * 1000 }), // 3 exports per hour
  exportController.exportProjects
);
```

---

## 🔧 **Integration Patterns**

### **Service Layer Integration**

```typescript
// ✅ Controllers as thin HTTP adapters over services
export class ProjectController extends CrudController<Project> {
  constructor(
    private readonly projectService: ProjectService,
    private readonly estimateService: EstimateService,
    private readonly auditService: AuditService,
    private readonly validationService: ValidationService
  ) {
    super(projectService, projectValidator, {
      softDelete: true,
      auditLogging: true,
      optimisticLocking: true,
    });
  }

  // Business logic delegated to service layer
  async createProjectWithEstimates(req: AuthenticatedRequest, res: Response) {
    try {
      const context = this.extractRequestContext(req);

      // Permission checking handled by base controller
      await this.checkPermissions("create", "Project", context);

      // Input validation
      const validationResult = await this.validateInput(
        req.body,
        projectWithEstimatesSchema
      );
      if (!validationResult.isValid) {
        throw new ValidationError("Invalid input", validationResult.errors);
      }

      // Business logic in service layer
      const result = await this.projectService.createProjectWithEstimates(
        validationResult.data,
        context
      );

      // Standardized response
      res.status(201).json(
        this.createSuccessResponse(result, {
          operation: "create_project_with_estimates",
          timestamp: new Date(),
        })
      );
    } catch (error) {
      // Error handling with audit logging
      await this.logSecurityEvent(
        {
          type: "OPERATION_FAILED",
          severity: "HIGH",
          details: {
            operation: "create_project_with_estimates",
            error: error.message,
          },
        },
        context
      );

      const errorResponse = this.createErrorResponse(
        error,
        context.correlationId
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}
```

### **Route Registration Patterns**

```typescript
// ✅ Systematic route registration with middleware
import { Router } from "express";
import {
  ProjectController,
  EstimateController,
  ClientController,
  AuthController,
  HealthController,
} from "@/shared/controllers";

export function registerRoutes(
  router: Router,
  controllers: {
    project: ProjectController;
    estimate: EstimateController;
    client: ClientController;
    auth: AuthController;
    health: HealthController;
  }
): void {
  // Authentication routes (public)
  router.post("/auth/login", controllers.auth.login.bind(controllers.auth));
  router.post(
    "/auth/refresh",
    controllers.auth.refreshToken.bind(controllers.auth)
  );
  router.post(
    "/auth/forgot-password",
    controllers.auth.forgotPassword.bind(controllers.auth)
  );

  // Protected authentication routes
  router.use("/auth/logout", secureEndpointMiddleware);
  router.post("/auth/logout", controllers.auth.logout.bind(controllers.auth));
  router.post(
    "/auth/mfa/setup",
    controllers.auth.setupMFA.bind(controllers.auth)
  );

  // Project management routes
  router.use("/projects", secureEndpointMiddleware);
  router.post(
    "/projects",
    controllers.project.create.bind(controllers.project)
  );
  router.get("/projects", controllers.project.list.bind(controllers.project));
  router.get(
    "/projects/:id",
    controllers.project.getById.bind(controllers.project)
  );
  router.put(
    "/projects/:id",
    controllers.project.update.bind(controllers.project)
  );
  router.delete(
    "/projects/:id",
    controllers.project.delete.bind(controllers.project)
  );

  // Advanced project operations
  router.post(
    "/projects/search",
    controllers.project.search.bind(controllers.project)
  );
  router.post(
    "/projects/bulk",
    controllers.project.bulkCreate.bind(controllers.project)
  );
  router.post(
    "/projects/export",
    controllers.project.export.bind(controllers.project)
  );

  // Health monitoring routes (public)
  router.get(
    "/health",
    controllers.health.healthCheck.bind(controllers.health)
  );
  router.get(
    "/health/ready",
    controllers.health.readinessCheck.bind(controllers.health)
  );
  router.get(
    "/health/live",
    controllers.health.livenessCheck.bind(controllers.health)
  );
  router.get("/metrics", controllers.health.metrics.bind(controllers.health));
}
```

### **Error Handling Integration**

```typescript
// ✅ Centralized error handling with audit integration
export class GlobalErrorHandler {
  constructor(private readonly auditService: AuditService) {}

  handle(
    error: Error,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const correlationId = req.headers["x-correlation-id"] as string;
    const context = req.context;

    // Log error with context
    this.auditService.logEvent(
      {
        type: AuditEventType.SYSTEM_ERROR,
        severity: AuditSeverity.HIGH,
        description: `Unhandled error: ${error.message}`,
        userId: context?.actor?.userId,
        tenantId: context?.tenant?.tenantId,
        metadata: {
          stack: error.stack,
          correlationId,
          url: req.url,
          method: req.method,
          userAgent: req.headers["user-agent"],
          ip: req.ip,
        },
      },
      context
    );

    // Standardized error response
    if (error instanceof ControllerError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          correlationId,
        },
      });
    } else {
      // Don't expose internal errors
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
          correlationId,
        },
      });
    }
  }
}
```

---

## 📊 **Controller Capabilities Matrix**

| Category  | Controllers | Endpoints | DTOs    | Features                    | Lines of Code | Test Coverage |
| --------- | ----------- | --------- | ------- | --------------------------- | ------------- | ------------- |
| Base      | 5           | 35+       | 50+     | CRUD, Search, Bulk, Export  | 4,565         | 95%           |
| Security  | 1           | 8+        | 12+     | Auth, MFA, Session Mgmt     | 794           | 98%           |
| System    | 1           | 4+        | 8+      | Health, Metrics, Monitoring | 714           | 92%           |
| **Total** | **7**       | **47+**   | **70+** | **Complete API Surface**    | **6,073**     | **95%**       |

---

## 🔍 **Security & Compliance Features**

### **Built-in Security Controls**

1. **Authentication & Authorization**

   ```typescript
   // Every protected endpoint enforces:
   - JWT token validation
   - Role-based access control (RBAC)
   - Resource-specific permissions
   - Multi-tenant isolation
   - Session management
   ```

2. **Row Level Security (RLS) Integration**

   ```typescript
   // All database operations automatically wrapped with RLS:
   await withTenantRLS(context, async () => {
     return await this.service.findMany(query);
   });
   ```

3. **Comprehensive Audit Logging**

   ```typescript
   // All operations generate audit trails:
   - User authentication events
   - Data access and modifications
   - Permission checks and denials
   - Export and bulk operations
   - System errors and security events
   ```

4. **Input Validation & Sanitization**
   ```typescript
   // ValidationFactory integration:
   - DTO validation with business rules
   - SQL injection prevention
   - XSS protection
   - Schema validation
   - Field-level security controls
   ```

### **Compliance Features**

- **GDPR Compliance**: Data export controls, field-level security, audit trails
- **SOC 2 Compliance**: Security event logging, access controls, monitoring
- **Multi-Tenant Isolation**: RLS enforcement, tenant context validation
- **Data Classification**: Field-level security based on data sensitivity
- **Retention Policies**: Automatic data cleanup and archival controls

---

## 🚨 **Performance Optimizations**

### **Efficient Operations**

1. **Pagination Strategies**

   ```typescript
   // Cursor-based pagination for large datasets
   const results = await this.paginationService.paginateCursor(query, {
     cursor: lastId,
     limit: 100,
   });

   // Offset pagination for small datasets
   const results = await this.paginationService.paginateOffset(query, {
     page: 1,
     limit: 20,
   });
   ```

2. **Bulk Processing**

   ```typescript
   // Batch operations with transaction support
   const bulkConfig = {
     mode: "BATCH",
     batchSize: 100,
     useTransaction: true,
     errorStrategy: "CONTINUE_ON_ERROR",
   };
   ```

3. **Async Export Jobs**

   ```typescript
   // Large exports processed asynchronously
   if (exportRequest.estimatedSize > ASYNC_THRESHOLD) {
     const job = await this.createAsyncExportJob(exportRequest);
     return { jobId: job.id, status: "PROCESSING" };
   }
   ```

4. **Response Caching**
   ```typescript
   // Intelligent caching for read operations
   router.get(
     "/projects",
     cacheMiddleware({ ttl: 300, varyBy: ["tenantId", "userId"] }),
     controller.list
   );
   ```

---

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Missing Middleware Chain**

   ```typescript
   // ❌ Incomplete middleware
   router.post("/projects", projectController.create);

   // ✅ Complete security middleware
   router.post(
     "/projects",
     ...secureEndpointMiddleware,
     projectController.create
   );
   ```

2. **RLS Context Missing**

   ```typescript
   // ❌ Direct database access bypasses RLS
   const projects = await prisma.project.findMany();

   // ✅ Service layer with RLS enforcement
   const projects = await projectService.findMany(query, context);
   ```

3. **Validation Bypassing**

   ```typescript
   // ❌ No input validation
   const project = await service.create(req.body);

   // ✅ Proper validation chain
   const validation = await this.validateInput(req.body, schema);
   if (!validation.isValid) throw new ValidationError();
   const project = await service.create(validation.data);
   ```

4. **Audit Logging Gaps**

   ```typescript
   // ❌ Operations without audit trails
   const result = await directDatabaseOperation();

   // ✅ Service operations with automatic audit
   const result = await service.performOperation(data, context);
   ```

---

## 📈 **Future Enhancements**

- **GraphQL Integration**: GraphQL endpoints alongside REST APIs
- **WebSocket Support**: Real-time data streaming capabilities
- **API Versioning**: Advanced versioning strategies and compatibility
- **Enhanced Caching**: Redis-based distributed caching layer
- **Rate Limiting**: Advanced rate limiting with user-specific quotas
- **API Documentation**: Automatic OpenAPI/Swagger documentation generation

---

## 🤝 **Contributing**

When adding new controllers:

1. **Extend Base Patterns**: All controllers should extend BaseController or specialized base classes
2. **Follow Security Requirements**: Implement complete middleware chain for protected endpoints
3. **Include Comprehensive Tests**: Unit and integration tests for all endpoints
4. **Document APIs**: Provide clear DTOs, interfaces, and usage examples
5. **Ensure RLS Compliance**: All database operations must use service layer with RLS enforcement
6. **Add Audit Integration**: All operations should generate appropriate audit trails
7. **Update Route Registration**: Add new routes to centralized route registration
8. **Update this documentation**: Keep controller documentation current

### **Controller Development Template**

```typescript
/**
 * [Domain] Controller - [Brief description]
 *
 * [Detailed description of controller capabilities and endpoints]
 *
 * @module [Domain]Controller
 * @category Shared Controllers - [Category]
 * @description [Controller description]
 * @version 1.0.0
 */

import { AuthenticatedRequest, BaseController } from '../base/base.controller';
import { [Domain]Service } from '../../services/[domain]/[domain].service';

/**
 * [Domain-specific DTOs and interfaces]
 */
export interface [Domain]RequestDto {
  // Request DTO interface
}

export interface [Domain]ResponseDto {
  // Response DTO interface
}

/**
 * [Domain] controller implementation
 */
export class [Domain]Controller extends BaseController {
  constructor(
    private readonly [domain]Service: [Domain]Service,
    auditService: AuditService,
    validationService: ValidationService
  ) {
    super(auditService, validationService);
  }

  /**
   * [Endpoint description]
   *
   * 🔒 Middleware Requirements: [Required middleware chain]
   * 🔍 RLS: [RLS enforcement details]
   * 📝 Audit: [Audit logging details]
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async [methodName](req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = this.extractRequestContext(req);

      // Security enforcement
      await this.checkPermissions('[action]', '[resource]', context);

      // Input validation
      const validation = await this.validateInput(req.body, [schema]);
      if (!validation.isValid) {
        throw new ValidationError('Validation failed', validation.errors);
      }

      // Business logic
      const result = await this.[domain]Service.[operation](validation.data, context);

      // Response
      res.json(this.createSuccessResponse(result));

    } catch (error) {
      next(error);
    }
  }
}
```

---

_This controller infrastructure provides enterprise-grade HTTP API capabilities with comprehensive security, audit logging, and multi-tenant support for our complete business application architecture._
