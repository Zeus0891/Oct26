# 🔧 **Shared Services Action Plan**

_⚠️ Refactored to focus on foundational services only_

## Overview

This action plan defines the implementation of **foundational shared services** that provide core infrastructure patterns across all feature modules. These services focus exclusively on transversal concerns: base patterns, security (RBAC/Auth), audit logging, context management, and generic operations used by all domains.

## Architecture Principles

### 🎯 **Design Goals**

- **Foundation Services**: Only infrastructure services used by ALL modules
- **Security Core**: Authentication, RBAC, and compliance services
- **Audit Infrastructure**: Transversal logging and context management
- **Base Patterns**: Abstract classes and reusable service patterns
- **Multi-Tenant Support**: RLS integration and tenant context handling
- **Type Safety**: Perfect alignment with shared types and Prisma schema

### 🏗️ **Architecture Boundaries**

**✅ Belongs in Shared Services:**

- Abstract base patterns used by ALL modules
- Security services (Auth, RBAC, Compliance)
- Audit and context management (transversal concerns)
- Generic infrastructure (pagination, validation patterns)

**❌ Moved to Feature Modules:**

- Finance services → `src/features/finance/services/`
- Workflow services → `src/features/workflow/services/`
- Integration services → `src/features/integration/services/`

---

## 📁 Refactored Service Structure

### 🧱 **Base Infrastructure** (`/base/`)

_Abstract patterns used by ALL feature modules_

| File                    | Purpose                          | Key Methods                                                         | Scope                       |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| `base.service.ts`       | Abstract base service class      | `create()`, `update()`, `delete()`, `findById()`                    | Foundation for all services |
| `context.service.ts`    | Context management and injection | `getTenantContext()`, `getActorContext()`, `validateAccess()`       | Tenant/RLS context handling |
| `pagination.service.ts` | Standardized pagination logic    | `paginate()`, `createConnection()`, `buildCursor()`                 | Universal pagination        |
| `validation.service.ts` | Cross-domain validation rules    | `validateEntity()`, `checkBusinessRules()`, `validatePermissions()` | Transversal validation      |

### � **Audit Infrastructure** (`/audit/`)

_Transversal logging and compliance tracking_

| File               | Purpose                   | Key Methods                                         | Scope                   |
| ------------------ | ------------------------- | --------------------------------------------------- | ----------------------- |
| `audit.service.ts` | Centralized audit logging | `logAction()`, `logDataChange()`, `getAuditTrail()` | All module audit trails |

### 🔐 **Security Infrastructure** (`/security/`)

_Authentication, RBAC, and compliance services_

| File                    | Purpose                      | Key Methods                                                       | Scope                       |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------- | --------------------------- |
| `auth.service.ts`       | Authentication management    | `authenticate()`, `generateTokens()`, `validateSession()`         | Cross-tenant authentication |
| `rbac.service.ts`       | Role-based access control    | `checkPermission()`, `assignRole()`, `validateAccess()`           | Core RBAC engine            |
| `permission.service.ts` | Permission evaluation engine | `hasPermission()`, `getEffectivePermissions()`, `validateScope()` | Permission evaluation logic |
| `compliance.service.ts` | Data privacy and compliance  | `processDataRequest()`, `applyRetention()`, `auditAccess()`       | GDPR/compliance enforcement |

---

## � **Services Moved to Feature Modules**

### 💰 **Finance → `src/features/finance/services/`**

- `money.service.ts`, `tax.service.ts`, `accounting.service.ts`, `billing.service.ts`, `currency-rate.service.ts`

### 🔄 **Workflow → `src/features/workflow/services/`**

- `approval-flow.service.ts`, `status.service.ts`, `revision.service.ts`, `task.service.ts`, `notification.service.ts`

### 🔗 **Integration → `src/features/integration/services/`**

- `webhook.service.ts`, `external-sync.service.ts`, `api-client.service.ts`, `integration-health.service.ts`

---

## 🎯 **Implementation Requirements**

### **1. Base Service Pattern**

```typescript
// Abstract base service with common patterns
export abstract class BaseService<T extends BaseEntity> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly auditService: AuditService
  ) {}

  abstract create(
    ctx: RequestContext,
    data: CreateInput<T>
  ): Promise<ApiResponse<T>>;

  abstract update(
    ctx: RequestContext,
    id: EntityId,
    data: UpdateInput<T>
  ): Promise<ApiResponse<T>>;

  abstract delete(
    ctx: RequestContext,
    id: EntityId
  ): Promise<ApiResponse<void>>;

  abstract findById(ctx: RequestContext, id: EntityId): Promise<ApiResponse<T>>;

  protected async withAudit<R>(
    ctx: RequestContext,
    action: AuditAction,
    operation: () => Promise<R>
  ): Promise<R> {
    // Common audit wrapper
  }
}
```

### **2. Context Integration**

```typescript
// All services must accept and use RequestContext
export class ExampleService extends BaseService<Example> {
  async create(
    ctx: RequestContext, // Always first parameter
    data: CreateExampleInput
  ): Promise<ApiResponse<Example>> {
    return await withTenantRLS(ctx.tenantId, async (tx) => {
      // All operations are tenant-scoped
      return await this.withAudit(ctx, "CREATE", async () => {
        // Business logic here
      });
    });
  }
}
```

### **3. Permission Integration**

```typescript
// Services must check permissions before operations
export class SecuredService extends BaseService<SecuredEntity> {
  async update(
    ctx: RequestContext,
    id: EntityId,
    data: UpdateInput
  ): Promise<ApiResponse<SecuredEntity>> {
    // Check permissions first
    const hasPermission = await this.rbacService.checkPermission(
      ctx.actor,
      "UPDATE",
      "SecuredEntity",
      id
    );

    if (!hasPermission) {
      throw new InsufficientPermissionsError();
    }

    // Proceed with operation
    return await this.performUpdate(ctx, id, data);
  }
}
```

### **4. Error Handling**

```typescript
// Standardized error responses
export class ServiceErrorHandler {
  static handleError(error: unknown): ApiResponse<never> {
    if (error instanceof BusinessRuleViolation) {
      return {
        success: false,
        error: {
          code: "BUSINESS_RULE_VIOLATION",
          message: error.message,
          details: error.violations,
        },
      };
    }
    // Handle other error types...
  }
}
```

---

## 🔧 **Integration Points**

### **With Shared Types**

- All services consume shared type definitions
- Perfect alignment with Prisma schema enums
- Standardized response formats using `ApiResponse<T>`
- Type-safe entity operations with `BaseEntity` extensions

### **With RBAC System**

- All services integrate with `rbac.service.ts` for permission checks
- Role-based operation filtering and access control
- Assignment scope validation for multi-level permissions
- Integration with auto-generated RBAC definitions

### **With RLS System**

- All database operations wrapped in `withTenantRLS()`
- Tenant context injection and validation
- Multi-tenant data isolation at service layer
- RLS context propagation through service calls

### **With Audit System**

- Automatic audit trail generation for all mutations
- Actor attribution and change tracking
- Compliance event logging and retention
- Integration with `TenantAuditLog` table

---

## 📊 **Service Dependencies**

| Service               | Depends On                       | Provides To              | Integration Points                 |
| --------------------- | -------------------------------- | ------------------------ | ---------------------------------- |
| **BaseService**       | Shared Types, Prisma Client, RLS | All Feature Services     | Foundation pattern for all domains |
| **ContextService**    | RLS Utils, Tenant Types          | All Services             | Tenant context validation          |
| **PaginationService** | Query Utils, Connection Types    | All List Operations      | Universal pagination patterns      |
| **ValidationService** | Business Rules, Shared Types     | All Services             | Cross-domain validation            |
| **AuditService**      | Audit Types, Context Service     | All Services             | Transversal audit logging          |
| **AuthService**       | JWT, Session Management          | All Authentication       | Cross-tenant auth foundation       |
| **RBACService**       | Permission Types, Context        | All Protected Operations | Core permission engine             |
| **PermissionService** | RBAC Service, Role Types         | All Authorization        | Permission evaluation logic        |
| **ComplianceService** | Audit Service, Privacy Types     | All Data Operations      | GDPR/compliance enforcement        |

---

## 🚀 **Implementation Roadmap**

**Week 1**: Foundation Layer

- Implement `BaseService` with RLS and audit integration
- Create `ContextService` for tenant and actor context management
- Set up `AuditService` with comprehensive change tracking

**Week 2**: Security Core

- Implement `AuthService` with JWT and session management
- Create `RBACService` with permission validation engine
- Add `PermissionService` for complex permission evaluation

**Week 3**: Infrastructure Services

- Implement `ValidationService` with cross-domain rules
- Create `PaginationService` with cursor-based pagination
- Add `ComplianceService` for GDPR and data retention

**Week 4**: Integration & Testing

- Complete integration with shared types and controllers
- Comprehensive testing of all service interactions
- Performance optimization and caching strategies

---

## 🎯 **Success Criteria**

- ✅ All services implement the `BaseService` pattern
- ✅ Perfect integration with shared types system
- ✅ Complete RBAC integration with permission checks
- ✅ Multi-tenant isolation through RLS integration
- ✅ Comprehensive audit trails for all operations
- ✅ Standardized error handling and responses
- ✅ Zero compilation errors and type safety
- ✅ Enterprise-grade performance and scalability

---

## 🔍 **Testing Requirements**

### **Unit Tests**

- Service method isolation testing
- Permission validation testing
- Error handling verification
- Type safety validation

### **Integration Tests**

- RBAC integration testing
- Multi-tenant isolation verification
- Audit trail validation
- External system connectivity

### **Performance Tests**

- Service operation benchmarks
- Multi-tenant scalability testing
- Cache effectiveness validation
- Database query optimization

---

## 🎯 **Benefits of This Refactored Approach**

> **🏗️ Architectural Benefits:**
>
> ✅ **Proper Boundaries**: Only 9 foundational services in shared layer  
> ✅ **Clear Separation**: Domain services moved to respective feature modules  
> ✅ **Foundation Focus**: Shared services provide patterns, not business logic  
> ✅ **Security Core**: Centralized Auth, RBAC, and compliance infrastructure  
> ✅ **Audit Infrastructure**: Transversal logging and context management  
> ✅ **Reusable Patterns**: All feature services extend from shared foundation

This **refactored service architecture** maintains enterprise-grade functionality while respecting proper architectural boundaries and providing a solid foundation for all feature modules.
