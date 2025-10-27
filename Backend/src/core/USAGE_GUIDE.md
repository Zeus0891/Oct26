# Core Infrastructure Usage Guide

## Overview

The core infrastructure provides a **clean, minimalist foundation** for the ERP Multitenant SaaS backend. It follows a "zero routes by default" philosophy where the core handles application bootstrapping, middleware, and lifecycle management, while feature modules mount their own routes.

## Architecture Pattern

### Clean Core Philosophy

```
┌─────────────────────────────────────────────┐
│          Feature Modules Layer              │
│  - Tenant Module: /api/tenant/*             │
│  - Identity Module: /api/identity/* (future)│
│  - Access Module: /api/access/* (future)    │
│  Each module exports a Router to mount      │
├─────────────────────────────────────────────┤
│         Core Infrastructure Layer           │
│  - Middleware Chain (RLS, RBAC, Auth, etc.) │
│  - Application Factory (Express setup)      │
│  - Bootstrap (Initialization sequence)      │
│  - Server (Entry point)                     │
│  NO ROUTES by default - clean separation    │
├─────────────────────────────────────────────┤
│         Shared Components Layer             │
│  - Base Services, Controllers, Validators   │
│  - Types, Utils, Constants                  │
└─────────────────────────────────────────────┘
```

## How to Mount Feature Modules

### Current Approach (via `customRoutes`)

The core infrastructure uses the `customRoutes` callback pattern to allow feature modules to mount their routers:

```typescript
// In bootstrap config (src/core/server.ts or custom startup)
const bootstrapConfig: BootstrapConfig = {
  app: {
    middleware: {
      /* ... */
    },
    disableRoutes: true, // Keep core clean
    customRoutes: (app: Express) => {
      // Import and mount feature modules
      import { tenantRouter } from "../features/tenant";

      // Mount tenant module at /api/tenant
      app.use("/api/tenant", tenantRouter);

      // Future modules:
      // app.use("/api/identity", identityRouter);
      // app.use("/api/access", accessRouter);
      // app.use("/api/projects", projectsRouter);
    },
    enableGracefulShutdown: true,
  },
  skipHealthChecks: true, // Core has no default endpoints
  shutdownTimeout: 30000,
};
```

### Key Points

1. **No Default Routes**: Core has `disableRoutes: true` by default
2. **Feature Isolation**: Each module exports a router from `features/*/index.ts`
3. **Clean Mounting**: Use `customRoutes` callback to wire feature routers
4. **Consistent Prefixes**: All API routes under `/api/*` namespace

## Current Core Files Status

### ✅ Production-Ready Files (No Changes Needed)

These files are complete and properly handle their responsibilities:

#### 1. `src/core/config/prisma.config.ts`

- **Purpose**: Database configuration with RLS support
- **Status**: ✅ Complete with connection pooling, health checks, RLS context
- **No changes needed**: Already handles tenant isolation correctly

#### 2. `src/core/config/security.config.ts`

- **Purpose**: Security constants (JWT, passwords, encryption, RBAC)
- **Status**: ✅ Complete
- **No changes needed**: Configuration constants are module-agnostic

#### 3. `src/core/config/env.config.ts`

- **Purpose**: Environment variable validation and management
- **Status**: ✅ Complete with Zod schemas
- **No changes needed**: Generic configuration handling

#### 4. `src/core/logging/logger.service.ts`

- **Purpose**: Structured logging with Winston
- **Status**: ✅ Complete with correlation IDs, tenant context
- **No changes needed**: Generic logging infrastructure

#### 5. `src/core/logging/metrics.service.ts`

- **Purpose**: Prometheus metrics collection
- **Status**: ✅ Complete with counters, gauges, histograms
- **No changes needed**: Generic metrics infrastructure

#### 6. `src/core/middleware.ts`

- **Purpose**: Global middleware chain (CORS, Helmet, RLS, RBAC, Auth)
- **Status**: ✅ Complete with all security layers
- **No changes needed**: Middleware applies to ALL routes automatically

#### 7. `src/core/bootstrap.ts`

- **Purpose**: Application initialization sequence
- **Status**: ✅ Complete with phased startup, health checks
- **No changes needed**: Generic bootstrap logic

#### 8. `src/core/server.ts`

- **Purpose**: Main entry point with CLI argument parsing
- **Status**: ✅ Complete
- **No changes needed**: Generic server startup

### ⚠️ Files That Need Route Mounting

#### 9. `src/core/app.factory.ts`

- **Purpose**: Express application creation
- **Current State**: Supports `customRoutes` callback
- **Action Required**: ✅ **YES - Need to implement `customRoutes` in bootstrap config**

The app factory is ready, but we need to actually USE the `customRoutes` feature to mount the tenant module.

## Required Changes for Tenant Module

### 1. Update Bootstrap Configuration

We need to modify `src/core/server.ts` to mount the tenant router:

```typescript
// src/core/server.ts

import { Express } from "express";
import { tenantRouter } from "../features/tenant";

// Inside startServer() function, update bootstrapConfig:
const bootstrapConfig: BootstrapConfig = {
  app: {
    middleware: {
      enableCors: true,
      enableHelmet: true,
      enableCompression: true,
      enableRateLimit: env.NODE_ENV === "production",
      enableMetrics: true,
      enableRequestLogging: true,
      enableAuth: true,
      enableRbac: true,
      enableRls: true,
    },
    disableRoutes: true, // Keep core clean

    // 🎯 ADD THIS: Mount feature modules
    customRoutes: (app: Express) => {
      // Mount tenant module
      app.use("/api/tenant", tenantRouter);

      // Future modules will be added here:
      // app.use("/api/identity", identityRouter);
      // app.use("/api/access", accessRouter);
    },

    enableGracefulShutdown: true,
  },
  skipHealthChecks: true,
  skipDatabaseInit: !process.argv.includes("--db"),
  shutdownTimeout: 30000,
  enableGracefulShutdown: true,
};
```

### 2. No Other Core Changes Required

That's it! The middleware chain, RLS, RBAC, authentication, audit logging, and all other infrastructure is already in place and will automatically apply to all routes mounted via `customRoutes`.

## Architecture Benefits

### 1. **Clean Separation of Concerns**

- Core: Infrastructure and middleware only
- Features: Business logic and routes
- Shared: Reusable components

### 2. **Automatic Security Layer**

All routes get:

- ✅ Correlation ID tracking
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Tenant context extraction
- ✅ RLS session management
- ✅ RBAC enforcement (when using securityStack/adminStack)
- ✅ Audit logging
- ✅ Error handling

### 3. **Feature Module Independence**

- Each module exports a router from `features/*/index.ts`
- Modules can be added/removed without touching core
- Each module manages its own routes, controllers, services

### 4. **Type Safety**

- TypeScript throughout
- Shared types from `@/shared/types`
- Proper middleware typing

## Testing the Setup

### Start the Server

```bash
npm run dev
# or
npm start
```

### Test Tenant Endpoints

```bash
# Health check (if enabled with --health)
curl http://localhost:3001/health

# Tenant endpoints (requires auth)
curl -H "Authorization: Bearer YOUR_JWT" \
     -H "X-Tenant-ID: tenant-123" \
     http://localhost:3001/api/tenant/settings

# Number sequences
curl -H "Authorization: Bearer YOUR_JWT" \
     -H "X-Tenant-ID: tenant-123" \
     http://localhost:3001/api/tenant/number-sequences

# Templates
curl -H "Authorization: Bearer YOUR_JWT" \
     -H "X-Tenant-ID: tenant-123" \
     http://localhost:3001/api/tenant/templates/terms

# Events
curl -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:3001/api/tenant/events
```

## Middleware Execution Order

Every request flows through this middleware chain:

```
1. correlationIdMiddleware     → Assigns request ID
2. requestLoggingMiddleware    → Logs incoming request
3. metricsMiddleware           → Records metrics
4. helmet()                    → Security headers
5. cors()                      → CORS handling
6. express.json()              → JSON body parsing
7. rateLimitMiddleware         → Rate limiting
8. tenantContextMiddleware     → Extract tenant ID
9. jwtAuthMiddleware           → Verify JWT (protected routes)
10. rlsSessionMiddleware       → Set RLS context
11. RBAC checks                → Per-route permission checks (via securityStack/adminStack)
12. auditLogMiddleware         → Audit trail
13. YOUR ROUTE HANDLER         → Business logic
14. errorHandlerMiddleware     → Error handling
```

## Common Patterns

### Protected Routes (RBAC)

```typescript
import {
  securityStack,
  adminStack,
} from "@/middlewares/security/rbac.middleware";

// Standard RBAC permission check
router.get("/", securityStack("TERMSTEMPLATE_READ"), controller.list);

// Admin-only operation
router.post("/provision", adminStack(), controller.provision);
```

### Tenant Context Access

```typescript
// In controllers, services, or middleware
const tenantId = (req as any).tenantId; // From tenantContextMiddleware
const user = (req as any).user; // From jwtAuthMiddleware
```

### RLS in Services

```typescript
import { BaseService } from "@/shared/services/base/base.service";

class MyService extends BaseService<MyModel> {
  // All queries automatically have RLS applied via BaseService.withTenantRLS
  async list(tenantId: string) {
    return this.withTenantRLS(tenantId, () => this.prisma.myModel.findMany());
  }
}
```

## Future Modules

When adding new feature modules:

1. **Create module structure:**

   ```
   src/features/my-module/
   ├── services/
   ├── controllers/
   ├── routes/
   │   ├── sub-router1.routes.ts
   │   ├── sub-router2.routes.ts
   │   └── index.ts          ← Aggregate router
   └── index.ts              ← Module barrel export
   ```

2. **Export router from `index.ts`:**

   ```typescript
   export { default as myModuleRouter } from "./routes/index";
   ```

3. **Mount in `server.ts` customRoutes:**

   ```typescript
   import { myModuleRouter } from "../features/my-module";

   customRoutes: (app: Express) => {
     app.use("/api/tenant", tenantRouter);
     app.use("/api/my-module", myModuleRouter); // New module
   };
   ```

## Summary

### ✅ Core is Complete

All core infrastructure files are production-ready and require no changes for the tenant module.

### ✅ Tenant Module is Complete

All services, controllers, routes are implemented and ready.

### 🎯 Only One Change Needed

**Update `src/core/server.ts`** to add the `customRoutes` callback that mounts the tenant router at `/api/tenant`.

That's the ONLY change needed to integrate the tenant module with the core infrastructure. The architecture is designed for clean module mounting without touching middleware or infrastructure code.
