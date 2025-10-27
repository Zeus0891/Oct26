# 🛣️ **Shared Routes Action Plan**

_⚠️ Refactored to focus on routing infrastructure only_

## Overview

This action plan defines the implementation of **transversal routing infrastructure** that provides foundational route patterns, middleware orchestration, and reusable HTTP configurations. These shared routes focus exclusively on cross-cutting concerns: base routing patterns, authentication endpoints, system health, and generic operations like search, export, and bulk processing.

## Architecture Principles

### 🎯 **Design Goals**

- **Routing Foundation**: Abstract base classes for consistent route patterns
- **Middleware Chains**: Reusable RBAC, RLS, audit, and validation chains
- **Infrastructure Routes**: System-level endpoints (auth, health, metrics)
- **Generic Patterns**: Search, export, and bulk operations used across domains
- **API Versioning**: Router factory for API evolution and deprecation
- **Integration Layer**: Seamless connection between routes and shared controllers

### 🏗️ **Architecture Boundaries**

**✅ Belongs in Shared Routes:**

- Abstract routing patterns used by ALL modules
- Authentication endpoints (cross-tenant concern)
- System infrastructure (health, metrics)
- Generic operations (search, export, bulk) used across domains

**❌ Moved to Feature Modules:**

- Finance routes → `src/features/finance/routes/`
- Workflow routes → `src/features/workflow/routes/`
- Integration routes → `src/features/integration/routes/`
- Security management routes → `src/security/routes/`

---

## 📁 Refactored Route Structure

### 🧱 **Base Infrastructure** (`/base/`)

_Abstract routing patterns used by ALL feature modules_

| File               | Purpose                       | Route Patterns                                      | Scope                   |
| ------------------ | ----------------------------- | --------------------------------------------------- | ----------------------- |
| `base.routes.ts`   | Abstract base routing class   | `/api/v1/{resource}` foundation                     | Routing foundation      |
| `crud.routes.ts`   | Standard CRUD route templates | `GET, POST, PUT, DELETE /{resource}`                | Generic REST operations |
| `bulk.routes.ts`   | Bulk operation routes         | `POST /bulk/{resource}`, `PUT /bulk/{resource}`     | Multi-entity processing |
| `search.routes.ts` | Search and filtering routes   | `GET /{resource}/search`, `POST /{resource}/query`  | Cross-domain search     |
| `export.routes.ts` | Data export routes            | `GET /{resource}/export`, `POST /{resource}/report` | Universal reporting     |

### � **Authentication Infrastructure** (`/security/`)

_Cross-tenant authentication (not RBAC management)_

| File             | Purpose               | Route Patterns                                                | Scope            |
| ---------------- | --------------------- | ------------------------------------------------------------- | ---------------- |
| `auth.routes.ts` | Authentication routes | `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` | All tenant users |

### 🏥 **System Infrastructure** (`/system/`)

_Cross-service diagnostics and monitoring_

| File               | Purpose              | Route Patterns                               | Scope                  |
| ------------------ | -------------------- | -------------------------------------------- | ---------------------- |
| `health.routes.ts` | System health routes | `GET /health`, `GET /metrics`, `GET /status` | System-wide monitoring |

---

## 🚫 **Routes Moved to Feature Modules**

### 💰 **Finance → `src/features/finance/routes/`**

- `money.routes.ts`, `tax.routes.ts`, `accounting.routes.ts`, `invoice.routes.ts`, `payment.routes.ts`

### 🔄 **Workflow → `src/features/workflow/routes/`**

- `approval.routes.ts`, `status.routes.ts`, `task.routes.ts`, `notification.routes.ts`, `document.routes.ts`

### 🔗 **Integration → `src/features/integration/routes/`**

- `webhook.routes.ts`, `sync.routes.ts`, `api-key.routes.ts`, `external.routes.ts`

### 🔒 **Security Management → `src/security/routes/`**

- `permission.routes.ts`, `role.routes.ts`, `session.routes.ts`, `audit.routes.ts`

---

## 🎯 **Implementation Requirements**

### **1. Base Route Pattern**

```typescript
// Abstract base route class with common patterns
export abstract class BaseRoutes<T extends BaseEntity> {
  protected readonly router = express.Router();
  protected readonly basePath: string;

  constructor(
    protected readonly controller: BaseController<T>,
    protected readonly permissions: RoutePermissions,
    basePath: string
  ) {
    this.basePath = basePath;
    this.setupRoutes();
  }

  protected setupRoutes(): void {
    // Standard CRUD routes
    this.router.get(
      "/",
      ...this.getMiddlewareChain("LIST"),
      this.controller.list.bind(this.controller)
    );

    this.router.post(
      "/",
      ...this.getMiddlewareChain("CREATE"),
      this.controller.create.bind(this.controller)
    );

    this.router.get(
      "/:id",
      ...this.getMiddlewareChain("READ"),
      this.controller.findById.bind(this.controller)
    );

    this.router.put(
      "/:id",
      ...this.getMiddlewareChain("UPDATE"),
      this.controller.update.bind(this.controller)
    );

    this.router.delete(
      "/:id",
      ...this.getMiddlewareChain("DELETE"),
      this.controller.delete.bind(this.controller)
    );

    // Additional routes can be added by subclasses
    this.setupAdditionalRoutes();
  }

  protected abstract setupAdditionalRoutes(): void;

  protected getMiddlewareChain(action: string): RequestHandler[] {
    return [
      rateLimitMiddleware(this.getRateLimit(action)),
      authMiddleware,
      tenantMiddleware,
      rbacMiddleware(this.permissions[action]),
      validationMiddleware(this.getValidationSchema(action)),
      auditMiddleware(action, this.basePath),
    ];
  }

  protected abstract getValidationSchema(action: string): ValidationSchema;
  protected abstract getRateLimit(action: string): RateLimitConfig;

  getRouter(): express.Router {
    return this.router;
  }
}
```

### **2. Middleware Chain Configuration**

```typescript
// Configurable middleware chains for different route types
export class MiddlewareChainBuilder {
  private middlewares: RequestHandler[] = [];

  static create(): MiddlewareChainBuilder {
    return new MiddlewareChainBuilder();
  }

  // Core middleware
  auth(required = true): this {
    this.middlewares.push(authMiddleware({ required }));
    return this;
  }

  tenant(): this {
    this.middlewares.push(tenantMiddleware);
    return this;
  }

  rbac(permission: string, resource?: string): this {
    this.middlewares.push(rbacMiddleware({ permission, resource }));
    return this;
  }

  rateLimit(config: RateLimitConfig): this {
    this.middlewares.push(rateLimitMiddleware(config));
    return this;
  }

  validation(schema: ValidationSchema): this {
    this.middlewares.push(validationMiddleware(schema));
    return this;
  }

  audit(action: string, resource: string): this {
    this.middlewares.push(auditMiddleware(action, resource));
    return this;
  }

  // Specialized middleware
  fileUpload(options: FileUploadOptions): this {
    this.middlewares.push(fileUploadMiddleware(options));
    return this;
  }

  async(): this {
    this.middlewares.push(asyncMiddleware);
    return this;
  }

  cors(options?: CorsOptions): this {
    this.middlewares.push(corsMiddleware(options));
    return this;
  }

  build(): RequestHandler[] {
    return [...this.middlewares];
  }
}

// Usage examples
const publicRouteChain = MiddlewareChainBuilder.create()
  .rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
  .cors()
  .build();

const protectedRouteChain = MiddlewareChainBuilder.create()
  .auth()
  .tenant()
  .rbac("READ", "Resource")
  .validation(ReadResourceSchema)
  .audit("READ", "Resource")
  .build();
```

### **3. Permission-Based Routing**

```typescript
// Route definitions with RBAC integration
export class ProtectedRoutes extends BaseRoutes<ProtectedEntity> {
  protected setupAdditionalRoutes(): void {
    // Bulk operations with special permissions
    this.router.post(
      "/bulk",
      ...MiddlewareChainBuilder.create()
        .auth()
        .tenant()
        .rbac("BULK_CREATE", "ProtectedEntity")
        .validation(BulkCreateSchema)
        .async()
        .audit("BULK_CREATE", "ProtectedEntity")
        .build(),
      this.controller.bulkCreate.bind(this.controller)
    );

    // Admin-only routes
    this.router.get(
      "/admin/stats",
      ...MiddlewareChainBuilder.create()
        .auth()
        .tenant()
        .rbac("ADMIN_READ", "ProtectedEntity")
        .build(),
      this.controller.getAdminStats.bind(this.controller)
    );

    // Public routes (no auth required)
    this.router.get(
      "/public/info",
      ...MiddlewareChainBuilder.create()
        .rateLimit({ windowMs: 60 * 1000, max: 10 })
        .build(),
      this.controller.getPublicInfo.bind(this.controller)
    );
  }

  protected getValidationSchema(action: string): ValidationSchema {
    const schemas = {
      CREATE: CreateProtectedEntitySchema,
      UPDATE: UpdateProtectedEntitySchema,
      LIST: ListProtectedEntitySchema,
      READ: ReadProtectedEntitySchema,
      DELETE: DeleteProtectedEntitySchema,
    };

    return schemas[action] || EmptySchema;
  }

  protected getRateLimit(action: string): RateLimitConfig {
    const limits = {
      CREATE: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 creates per 15 minutes
      UPDATE: { windowMs: 15 * 60 * 1000, max: 20 }, // 20 updates per 15 minutes
      LIST: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 lists per 15 minutes
      READ: { windowMs: 15 * 60 * 1000, max: 200 }, // 200 reads per 15 minutes
      DELETE: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 deletes per 15 minutes
    };

    return limits[action] || { windowMs: 15 * 60 * 1000, max: 50 };
  }
}
```

### **4. API Versioning**

```typescript
// API versioning and deprecation management
export class VersionedRoutes {
  private readonly versions = new Map<string, express.Router>();

  constructor(private readonly baseRoutes: BaseRoutes<any>) {
    this.setupVersions();
  }

  private setupVersions(): void {
    // Version 1.0 - Current
    const v1Router = express.Router();
    v1Router.use("/entities", this.baseRoutes.getRouter());
    this.versions.set("v1", v1Router);

    // Version 2.0 - Future
    const v2Router = express.Router();
    v2Router.use("/entities", this.createV2Routes());
    this.versions.set("v2", v2Router);

    // Legacy version - Deprecated
    const legacyRouter = express.Router();
    legacyRouter.use(deprecationMiddleware("v0.9", "v1"));
    legacyRouter.use("/entities", this.createLegacyRoutes());
    this.versions.set("legacy", legacyRouter);
  }

  getVersionRouter(version: string): express.Router {
    const router = this.versions.get(version);
    if (!router) {
      throw new UnsupportedApiVersionError(version);
    }
    return router;
  }

  getAllRouters(): Record<string, express.Router> {
    return Object.fromEntries(this.versions);
  }

  private createV2Routes(): express.Router {
    // Future API version with breaking changes
    const router = express.Router();
    // V2 route implementations
    return router;
  }

  private createLegacyRoutes(): express.Router {
    // Legacy API support with deprecation warnings
    const router = express.Router();
    // Legacy route implementations
    return router;
  }
}
```

---

## 🔧 **Integration Points**

### **With Shared Controllers**

- Routes delegate to controller methods for business logic
- Standardized controller method signatures across all routes
- Consistent error handling and response formatting
- Proper HTTP status code mapping from controller responses

### **With Shared Middleware**

- Authentication and authorization middleware integration
- Multi-tenant context injection through middleware
- Request validation using shared validator middleware
- Audit logging middleware for all protected operations

### **With RBAC System**

- Permission-based route protection using RBAC middleware
- Role-based access control for sensitive operations
- Assignment scope validation for resource-specific permissions
- Dynamic permission evaluation based on request context

### **With API Documentation**

- Auto-generated OpenAPI specifications from route definitions
- Swagger UI integration for interactive API documentation
- Route metadata extraction for documentation generation
- Example request/response generation from route schemas

---

## 📊 **Route Dependencies**

| Route            | Depends On                            | Provides To         | Integration Points                 |
| ---------------- | ------------------------------------- | ------------------- | ---------------------------------- |
| **BaseRoutes**   | Shared Controllers, Middleware Chains | All Feature Routes  | Foundation pattern for all modules |
| **CrudRoutes**   | BaseRoutes, RBAC Middleware           | All REST operations | Standard CRUD endpoints            |
| **BulkRoutes**   | BaseRoutes, Transaction Middleware    | Large operations    | Multi-entity processing            |
| **SearchRoutes** | BaseRoutes, Query Validation          | All filtering needs | Cross-domain search patterns       |
| **ExportRoutes** | BaseRoutes, File Streaming            | Reporting systems   | CSV/Excel/PDF endpoints            |
| **AuthRoutes**   | JWT Middleware, Rate Limiting         | All authentication  | Cross-tenant auth endpoints        |
| **HealthRoutes** | System Metrics, No Auth               | Monitoring/DevOps   | Infrastructure diagnostics         |

---

## 🚀 **Implementation Roadmap**

**Week 1**: Foundation Infrastructure

- Implement `BaseRoutes` with RBAC and RLS middleware orchestration
- Create `CrudRoutes` with standardized REST patterns
- Set up `MiddlewareChainBuilder` for consistent chains

**Week 2**: Core Operations

- Implement `AuthRoutes` with JWT and session management
- Create `SearchRoutes` with advanced filtering and pagination
- Add `HealthRoutes` for system monitoring

**Week 3**: Advanced Patterns

- Implement `BulkRoutes` for large operations
- Create `ExportRoutes` with streaming capabilities
- Add comprehensive testing and performance optimization

**Week 4**: Integration & Versioning

- Implement `VersionedRoutes` factory for API evolution
- Complete integration with all shared components
- Finalize documentation and developer guides

---

## 🎯 **API Standards**

### **URL Conventions**

```typescript
// Standardized URL patterns
const urlPatterns = {
  // Resource collections
  list: "GET /api/v1/{resources}",
  create: "POST /api/v1/{resources}",

  // Individual resources
  read: "GET /api/v1/{resources}/{id}",
  update: "PUT /api/v1/{resources}/{id}",
  delete: "DELETE /api/v1/{resources}/{id}",

  // Nested resources
  nestedList: "GET /api/v1/{resources}/{id}/{nested}",
  nestedCreate: "POST /api/v1/{resources}/{id}/{nested}",

  // Actions
  action: "POST /api/v1/{resources}/{id}/{action}",

  // Bulk operations
  bulkCreate: "POST /api/v1/{resources}/bulk",
  bulkUpdate: "PUT /api/v1/{resources}/bulk",
  bulkDelete: "DELETE /api/v1/{resources}/bulk",

  // Search and export
  search: "GET /api/v1/{resources}/search",
  export: "GET /api/v1/{resources}/export",
};
```

### **HTTP Status Codes**

```typescript
// Standardized status code usage
const statusCodes = {
  // Success responses
  200: "OK - Successful GET, PUT",
  201: "Created - Successful POST",
  202: "Accepted - Async operation started",
  204: "No Content - Successful DELETE",

  // Client error responses
  400: "Bad Request - Invalid input",
  401: "Unauthorized - Authentication required",
  403: "Forbidden - Insufficient permissions",
  404: "Not Found - Resource does not exist",
  409: "Conflict - Resource conflict",
  422: "Unprocessable Entity - Validation failed",
  429: "Too Many Requests - Rate limit exceeded",

  // Server error responses
  500: "Internal Server Error - Server fault",
  502: "Bad Gateway - External service error",
  503: "Service Unavailable - Service down",
  504: "Gateway Timeout - External service timeout",
};
```

### **Response Format**

```typescript
// Standardized response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMetadata;
}

interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationInfo;
  warnings?: string[];
}
```

---

## 🔍 **Testing Requirements**

### **Unit Tests**

- Route handler testing with mocked controllers
- Middleware chain testing with various configurations
- Permission validation testing for protected routes
- Rate limiting testing with simulated requests

### **Integration Tests**

- End-to-end API testing with real HTTP requests
- Authentication flow testing with valid/invalid credentials
- Multi-tenant isolation testing with different tenant contexts
- RBAC integration testing with various permission scenarios

### **Load Tests**

- Performance testing under concurrent load
- Rate limiting effectiveness testing
- Memory usage monitoring for route handlers
- Response time benchmarking for different route types

---

## 📚 **Route Documentation**

### **API Documentation**

- Complete OpenAPI 3.0 specifications for all routes
- Interactive Swagger UI for API exploration
- Request/response examples for all endpoints
- Authentication and authorization documentation

### **Developer Guide**

- Route creation guidelines and best practices
- Middleware configuration examples
- Permission setup documentation
- Performance optimization guidelines

---

## 🎯 **Benefits of This Refactored Approach**

> **🏗️ Architectural Benefits:**
>
> ✅ **Proper Boundaries**: Only 7 transversal routes in shared layer  
> ✅ **Infrastructure Focus**: Routes provide patterns, not business endpoints  
> ✅ **Foundation Layer**: All feature routes extend from shared infrastructure  
> ✅ **Consistent Middleware**: Uniform RBAC, RLS, audit chains across modules  
> ✅ **Scalable Patterns**: Generic operations (search, export, bulk) reused everywhere  
> ✅ **Clean Separation**: Domain routes moved to respective feature modules

This **refactored routing architecture** maintains enterprise-grade API infrastructure while respecting proper architectural boundaries and providing reusable routing patterns for all feature modules.
