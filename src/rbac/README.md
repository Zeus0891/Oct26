# RBAC (Roles & Permissions)

Last updated: 2025-10-23

Enterprise role-based access control for multi-tenant APIs. Generated from RBAC.schema.v7.yml and enforced via lightweight Express middleware. Aligns with the production security chain: JWT → Tenant Context → RLS → RBAC → Audit.

Back to Architecture Index → ../../docs/architecture/README.md

## What’s here

- permissions.ts — Canonical Permission strings (auto-generated)
- roles.ts — Role constants, ROLE_PERMISSIONS map, and role hierarchy
- middleware/rbac.ts — Express middleware helpers (requirePermission, role guards)

## Permission model

- Naming: Domain.Action (e.g., `Project.read`, `User.soft_delete`)
- Scope: All permissions are implicitly tenant-scoped (enforced by RLS + tenant context)
- Source of truth: Generated from `RBAC.schema.v7.yml` and kept in sync

Type hints

- `Permission` union type from `permissions.ts`
- `Role` union type and `ROLES` from `roles.ts`

## Role model and hierarchy

- `ROLES` define top-level roles (e.g., ADMIN, PROJECT_MANAGER, WORKER, DRIVER, VIEWER)
- `ROLE_PERMISSIONS: Record<Role, string[]>` maps roles to allowed permissions
- `ROLE_HIERARCHY` provides simple precedence ordering for role-guards (ADMIN ≥ PROJECT_MANAGER ≥ WORKER ≥ DRIVER ≥ VIEWER)

Notes

- Role checks are a convenience; prefer permission checks for least privilege
- In multi-tenant routes, always validate tenant context alongside RBAC

## Middleware API

- `requirePermission(permission: Permission)`
  - Ensures the authenticated user has the specific permission within tenant context
- `requireAdmin()` / `requireProjectManager()` / `requireWorker()` / `requireDriver()` / `requireViewer()`
  - Role-based shortcuts using `ROLE_HIERARCHY`
- Utility checks: `checkPermission`, `checkAnyPermission`, `checkAllPermissions`, `hasHigherOrEqualRole`, `checkTenantAccess`

Example usage

```ts
import { Router } from "express";
import { requirePermission } from "@/rbac/middleware/rbac";
import { PERMISSIONS } from "@/rbac/permissions";

const router = Router();

router.get(
  "/projects/:id",
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (req, res) => {
    // Tenant context and RLS are already enforced earlier in the chain
    const project = await req.context.prisma.project.findUnique({
      where: { id: req.params.id },
    });
    res.json(project);
  }
);

export default router;
```

## Interplay with security chain

- JWT: sets user identity and claims
- Tenant Context: establishes `req.user.tenantId` and `req.tenant.id`
- RLS: enforces row-level data isolation in PostgreSQL
- RBAC (this module): authorizes operations at the route/service level
- Audit: record access decisions and sensitive operations

Always attach RBAC after JWT + Tenant + RLS middleware for consistent context.

## Conventions and best practices

- Prefer permission checks over role checks for granular control
- Use explicit permission constants (from `PERMISSIONS`) in route handlers
- Add resource-level checks when necessary (ownership, project membership, etc.)
- Log denials with correlationId and sanitized context in your error handler

## Extending roles or permissions

- Update `RBAC.schema.v7.yml` and re-generate the TS artifacts (permissions.ts, roles.ts)
- Keep Domain.Action naming consistent and avoid duplicates
- Add new permission checks in feature routers/services as needed

## Testing

- Unit-test permission gates with representative roles/permissions
- Integration-test protected routes with JWTs for different roles
- Verify tenant isolation via RLS test helpers (see `src/lib/prisma/withRLS-examples.md`)

## Cross‑references

- Access Control Feature README: ../../src/features/access-control/README.md
- Core middleware chain and security: ../../src/core/middleware.ts
- Core Prisma and RLS helpers: ../../src/core/config/prisma.config.ts and ../../src/lib/prisma/withRLS.ts
- Canonical model ownership: ../../docs/architecture/ERP_MODULE_STRUCTURE.md

Back to Architecture Index → ../../docs/architecture/README.md
