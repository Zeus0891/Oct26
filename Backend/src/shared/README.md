# 🏗️ SHARED MODULE

## 📋 **OVERVIEW**

The `shared` module provides common types, validators, utilities, and controllers used across all feature modules in the backend. It serves as the foundation layer that ensures consistency, reusability, and enterprise-grade functionality throughout the application.

## 🏛️ **ARCHITECTURE**

```
shared/
├── 📄 README.md              # This documentation
├── 📤 index.ts               # Central export point
├── 🎛️  controllers/          # Controllers (base, CRUD, bulk, export, search, security, system)
├── 🧭 routes/                 # Route builders and patterns (base, security, system, versioned)
├── 📋 types/                 # Shared type definitions
├── 🔧 utils/                 # Utility functions
└── ✅ validators/            # Zod validation schemas
```

## 📋 **TYPES HIERARCHY**

### 🔧 **Core Types** (`types/core/`)

- **Base Entity**: Fundamental entity patterns (audit, soft delete, versioning)
- **IDs**: UUID v7 and identifier types
- **RBAC**: Role-Based Access Control shared types
- **RLS**: Row Level Security types
- **API**: REST API request/response patterns
- **Context**: Application context types
- **Events**: Event sourcing and pub/sub types
- **Money**: Financial and monetary types
- **Time**: Temporal types and utilities

### 📊 **Catalog Types** (`types/catalogs/`)

- **Country**: ISO country codes and data
- **Currency**: ISO currency codes and exchange data
- **UOM**: Units of Measure for measurements

### 🔒 **Security Types** (`types/security/`)

- **JWT**: JSON Web Token types
- **Compliance**: Audit and regulatory compliance types

## ✅ **VALIDATORS**

Enterprise-grade Zod validation schemas:

- **`common.validators.ts`** - ✅ **ENTERPRISE-READY**
  - 75+ validators including UUIDs, security, network, business, international
  - SQL injection, XSS, and path traversal prevention
  - IBAN, SWIFT, credit card validation with Luhn algorithm
  - ISO country/currency codes, timezones, locales
- **`auth.validators.ts`** - Authentication validation
- **`catalogs.validators.ts`** - Catalog data validation
- **`context.validators.ts`** - Application context validation
- **`money.validators.ts`** - Financial validation
- **`pagination.validators.ts`** - Query pagination validation

## 🔧 **UTILITIES**

Production-ready utility functions:

- **`audit.ts`** - Audit trail and compliance logging
- **`context.ts`** - Request/tenant context management
- **`crypto.ts`** - Cryptographic functions (encryption, hashing, keys)
- **`date.ts`** - Date manipulation and formatting
- **`jwt.utils.ts`** - JWT creation, validation, claims extraction
- **`money.ts`** - Currency conversion, arithmetic, rounding
- **`pagination.ts`** - Page calculation, offset/limit helpers
- **`time.ts`** - Time calculations, duration parsing
- **`validation.ts`** - Validation helpers and error formatting

## 🎛️ **CONTROLLERS**

- **Base** (`controllers/base/base.controller.ts`): Core helpers for standardized API responses, error handling, metadata, and tenant context.
- **CRUD** (`controllers/base/crud.controller.ts`): Create/Read/Update/Delete with pagination, soft delete, optimistic locking, audit hooks.
- **Bulk** (`controllers/base/bulk.controller.ts`): High-throughput bulk operations (CREATE/UPDATE/DELETE/UPSERT/PATCH) with validation strategies and progress reporting.
- **Export** (`controllers/base/export.controller.ts`): CSV/EXCEL/PDF/JSON/XML exports, async job orchestration, download endpoints.
- **Search** (`controllers/base/search.controller.ts`): Full-text/exact/fuzzy/wildcard/faceted/semantic search shapes with facets and aggregations.
- **Security/Auth** (`controllers/security/auth.controller.ts`): Login, refresh, logout, session retrieval; MFA-ready hooks.
- **System/Health** (`controllers/system/health.controller.ts`): Health, readiness, liveness, status, and metrics with dependency checks.

Example: extending CRUD controller

```typescript
import { CrudController } from "@/shared/controllers/base/crud.controller";
import type { BaseEntity } from "@/shared/types";

class ProjectController extends CrudController<BaseEntity> {
  // Extend/override methods as needed
}
```

Common response builder

```typescript
// Inside controller methods
return this.buildApiResponse(entity, req, Date.now());
```

## 🧭 **ROUTES**

- **Base routes** (`routes/base/base.routes.ts`): Route scaffolding, per-operation middleware chains, helpers to add public/admin/bulk/search routes.
- **CRUD routes** (`routes/base/crud.routes.ts`): Standard CRUD endpoints with bulk, search, export, restore, count.
- **Security routes** (`routes/security/auth.routes.ts`): Auth endpoints (login/logout/refresh/me); optional password reset, email verification, social auth.
- **System routes** (`routes/system/health.routes.ts`): Health, readiness, liveness, status, metrics.
- **Versioned routes** (`routes/versioned/versioned.routes.ts`): API version detection, deprecation/sunset headers, version information endpoints.
- **Factories & patterns** (`routes/index.ts`): Route factory and common patterns to compose complete API stacks.

Examples

```typescript
import { RouteFactory } from "@/shared/routes";
const routes = RouteFactory.createCrudRoutes(
  ProjectController,
  "project",
  "/api/projects",
  { softDelete: true }
);
app.use("/api/projects", routes.getRouter());
```

```typescript
import { CommonRoutePatterns } from "@/shared/routes";
const api = CommonRoutePatterns.createCompleteApiRoutes({
  apiBasePath: "/api",
  healthBasePath: "/health",
  versions: [
    { version: "v1", status: "deprecated" },
    { version: "v2", status: "stable" },
  ],
  defaultVersion: "v2",
  enableMetrics: true,
});
app.use(api.basePath, api.router);
```

## 🧰 **SERVICES**

- **AuditService** (`services/audit/audit.service.ts`): Event logging (auth, data, system, security), trails, summaries, suspicious activity detection.
- **BaseService** (`services/base/base.service.ts`): RLS/tenant helpers, audit wrappers, error handling, input validation; shared CRUD abstractions.
- **Security**:
  - `AuthService` (`services/security/auth.service.ts`): Authentication, sessions, tokens, MFA hooks.
  - `RBACService` (`services/security/rbac.service.ts`): Role/permission checks, assignment, hierarchy, bulk operations.
  - `PermissionService` (`services/security/permission.service.ts`): Effective permissions, scopes, condition evaluation, validation.
  - `ComplianceService` (`services/security/compliance.service.ts`): GDPR/SOC2/retention, data subject requests, reports, access auditing.
- **ServiceFactory** (`services/index.ts`): Unified factory to instantiate services consistently.

```typescript
import { ServiceFactory } from "@/shared/services";
const { auditService, rbacService, validationService } = new ServiceFactory(
  prisma
).createAllServices();
```

## 📦 **USAGE**

### Import Examples

```typescript
// Import from central index
import {
  UuidV7,
  BaseAuditMetadata,
  EmailSchema,
  MoneyUtils,
  PaginationUtils,
} from "@/shared";

// Import specific categories
import {
  UuidValidators,
  SecurityValidators,
  NetworkValidators,
} from "@/shared/validators/common.validators";

// Import utilities
import { TimeUtils } from "@/shared/utils/time";
import { CryptoUtils } from "@/shared/utils/crypto";
```

### Type Usage

```typescript
import type { UuidV7, BaseEntity } from "@/shared/types";

interface MyEntity extends BaseEntity {
  readonly id: UuidV7;
  name: string;
  // Inherits: createdAt, updatedAt, version, etc.
}
```

### Validation Usage

```typescript
import { EmailSchema, UuidV7Schema } from "@/shared/validators";

const CreateUserSchema = z.object({
  id: UuidV7Schema,
  email: EmailSchema,
  // More fields...
});
```

## 🛡️ **SECURITY FEATURES**

- **SQL Injection Prevention**: SqlSafeStringSchema
- **XSS Protection**: XssSafeStringSchema
- **Path Traversal Protection**: PathSafeStringSchema
- **Strong Password Requirements**: Enterprise-grade password validation
- **JWT Security**: Secure token handling and validation
- **Cryptographic Functions**: Encryption, hashing, key generation

## 🌍 **INTERNATIONAL SUPPORT**

- **ISO Standards**: Country codes (ISO 3166), Currency codes (ISO 4217)
- **Localization**: Language codes, locale formats, timezone support
- **Financial**: IBAN, SWIFT/BIC codes with validation
- **Network**: International phone numbers (E.164), domain validation

## 📊 **ENTERPRISE FEATURES**

- **Audit Trail**: Complete audit logging with correlation IDs
- **Multi-tenancy**: Tenant-aware contexts and RLS
- **Compliance**: GDPR, SOX, HIPAA compliance types
- **Performance**: Optimized validation with caching
- **Monitoring**: Health checks and metrics integration
- **Scalability**: Pagination, rate limiting, resource constraints

## 🚀 **DEVELOPMENT GUIDELINES**

### Adding New Shared Types

1. **Create in appropriate subfolder** (`core/`, `catalogs/`, `security/`)
2. **Follow naming conventions** (`*.types.ts`, `*.validators.ts`, `*.utils.ts`)
3. **Export from index.ts** in the subfolder
4. **Update main exports** in parent index.ts files
5. **Add documentation** with JSDoc comments
6. **Include validation schemas** where applicable

### Best Practices

- **Use TypeScript strict mode** for all shared code
- **Provide comprehensive JSDoc** documentation
- **Include input validation** for all public functions
- **Follow enterprise security** patterns
- **Maintain backward compatibility** when updating
- **Write comprehensive tests** (unit + integration)

## 📈 **METRICS & MONITORING**

The shared module includes built-in support for:

- **Performance metrics** - Function execution times
- **Error tracking** - Structured error logging
- **Usage analytics** - Function call frequencies
- **Security events** - Validation failures, suspicious activity
- **Compliance auditing** - Regulatory requirement tracking

## 🔄 **VERSION COMPATIBILITY**

- **Node.js**: 18+ LTS
- **TypeScript**: 5.0+
- **Zod**: 3.20+
- **Prisma**: 5.0+

## 📞 **SUPPORT**

For questions about shared module usage:

1. **Check documentation** in individual files
2. **Review type definitions** for interfaces
3. **Examine test files** for usage examples
4. **Consult team guidelines** for enterprise patterns

---

**The shared module is the foundation of our enterprise-grade backend architecture, providing consistent, secure, and scalable building blocks for all feature modules.** 🏗️
