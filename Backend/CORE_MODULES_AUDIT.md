# Core Modules Technical Audit

Date: 2025-10-26
Scope: Tenant, Identity, Access-Control

This audit reviews current implementation status, functional coverage, gaps, coupling, and a pragmatic roadmap to reach feature completeness. Code references use repository-relative paths.

## Legend

- [x] Completed
- [ ] Pending / Missing

---

## Tenant Module

- Entry points
  - Public bootstrap routes (mounted before /api): `src/core/server.ts` → `app.use("/tenants", tenantsPublicRoutes)` → `src/features/tenant/routes/public.routes.ts`
  - Tenant-scoped API: `src/core/server.ts` → `app.use("/api/tenant", tenantRouter)` → `src/features/tenant/routes/index.ts`
- Key components
  - Routes: `src/features/tenant/routes/*.routes.ts` (audit, documents, events, feature-flags, lifecycle, members, metrics, numbering, settings, templates, tenant, usage)
  - Controllers (example): `src/features/tenant/controllers/members.controller.ts`
  - Services referenced: `TenantLifecycleService`, `AuditService`, `RBACService`, `ContextService`
  - RLS/RBAC integration: per-route RBAC via `MiddlewareChains` and security stacks; tenant context via security middleware; RLS enforced in DB; direct Prisma filters by tenantId in controllers; bootstrap uses services and grants permissions as needed.

### Current state

- Routing scaffolding for comprehensive tenant domain is in place. [x]
- Public bootstrap flows:
  - POST `/tenants/register` create tenant (id, slug) [x]
  - POST `/tenants/bootstrap` ensure tenant/member and optional role assign [x]
  - POST `/tenants/bootstrap-full` provision defaults + assign ADMIN baseline [x]
- Tenant API core:
  - GET `/api/tenant/me` current tenant profile [x]
  - GET `/api/tenant/:id` admin get by id [x]
  - PATCH `/api/tenant/:id` admin update limited fields [x]
  - POST `/api/tenant/:id/deactivate` admin deactivate [x]
- Members:
  - GET `/api/tenant/members/` list [x]
  - POST `/api/tenant/members/` create/add user as member [x]
  - GET `/api/tenant/members/:id` get member [x]
  - POST `/api/tenant/members/:id/roles` assign role [x]
  - DELETE `/api/tenant/members/:id/roles/:roleId` unassign role [x]
  - POST `/api/tenant/members/:id/activate` activate member [x]
  - POST `/api/tenant/members/:id/deactivate` deactivate member [x]
- RBAC: uses `PERMISSIONS.*` for route protection; ADMIN seeded with baseline in bootstrap-full; generator present for full catalog. [x]
- RLS: enabled in migrations; tenant flows filter by `tenantId` and use session context middleware. [x]

### Functional coverage (selected)

| Method | Path | Purpose | Auth/RBAC |
|---|---|---|---|
| POST | `/tenants/register` | Create tenant by name/slug | Public |
| POST | `/tenants/bootstrap` | Ensure tenant + member; optional role | Public bootstrap |
| POST | `/tenants/bootstrap-full` | Provision tenant defaults; assign ADMIN; baseline perms | Public bootstrap |
| GET | `/api/tenant/me` | Current tenant profile | Auth + `Tenant.read` |
| GET | `/api/tenant/:id` | Get tenant by id | Admin stack |
| PATCH | `/api/tenant/:id` | Update limited fields | Admin stack |
| POST | `/api/tenant/:id/deactivate` | Deactivate tenant | Admin stack |
| GET | `/api/tenant/members` | List members | Auth + `Member.read` |
| POST | `/api/tenant/members` | Add/ensure member | Auth + `Member.create` |
| GET | `/api/tenant/members/:id` | Get member | Auth + `Member.read` |
| POST | `/api/tenant/members/:id/roles` | Assign role | Auth + `MemberRole.assign` |
| DELETE | `/api/tenant/members/:id/roles/:roleId` | Remove role | Auth + `MemberRole.unassign` |
| POST | `/api/tenant/members/:id/activate` | Activate member | Auth + `Member.activate` |
| POST | `/api/tenant/members/:id/deactivate` | Deactivate member | Auth + `Member.deactivate` |

Additional routers exist (feature-flags, settings, metrics, usage, numbering, audit, documents, templates, events, lifecycle) but are not fully enumerated here; they appear scaffolded and ready for handlers.

### Missing components / gaps

- [ ] Controllers/services for all sub-routers (feature-flags, settings, metrics, usage, numbering, audit, documents, templates, events, lifecycle) with full CRUD.
- [ ] Pagination, filtering, sorting, and total counts for list endpoints (e.g., members).
- [ ] Consistent use of `withTenantRLS` wrapper across tenant controllers to ensure session GUC is set before Prisma ops.
- [ ] Standardized response DTOs and error codes across all routes.
- [ ] OpenAPI/Swagger docs for tenant endpoints.
- [ ] Idempotent bootstrap semantics and conflict handling for race conditions.

### Dependencies / coupling

- Identity → Member: members are created from Users; email/userId resolution in `members.controller.ts`.
- Access-Control → Roles/Permissions: assignment/update in members endpoints; bootstrap ensures ADMIN role and baseline permission grants.
- Core middleware: auth, tenant-context, rbac auth, RLS session influence runtime behavior.

### Next actions / roadmap

1. Implement controllers for unfilled tenant sub-routers with CRUD, RLS via `withTenantRLS`, and RBAC per route.
2. Add pagination/filtering utilities to shared layer and wire into list endpoints.
3. Add OpenAPI schemas and auto-generated docs for `/api/tenant/*`.
4. Add transactional safety and idempotency keys for bootstrap endpoints.
5. Add auditing on member role changes (emit events via `AuditService`).

---

## Identity Module

- Entry points
  - Mounted before security stacks: `src/core/server.ts` → `app.use("/users", usersRoutes)`
- Key components
  - Routes: `src/features/identity/users.routes.ts`
  - Services: `AuditService`, `AuthService`, `JwtUtils`, `PasswordUtils`
  - RLS/RBAC integration: Identity issues tokens with `roles` and `permissions` claims from DB; routes use `MiddlewareChains` (public vs authenticated).

### Current state

- POST `/users/register` minimal registration (email/password). [x]
- POST `/users/login` with tenantId; resolves roles and permissions via Member → Role → RolePermission; returns token pair. [x]
- POST `/users/refresh` rotates tokens and preserves claims. [x]
- GET `/users/profile` returns current user context from token. [x]
- Logout not implemented (returns 404 in smoke). [ ]

### Functional coverage

| Method | Path | Purpose | Auth/RBAC |
|---|---|---|---|
| POST | `/users/register` | Minimal user creation | Public |
| POST | `/users/login` | Authenticate and issue tokens scoped to tenant | Public |
| POST | `/users/refresh` | Refresh/rotate tokens | Public |
| GET | `/users/profile` | Current user profile (from token) | Authenticated |

### Missing components / gaps

- [ ] POST `/users/logout` and server-side session invalidation/blacklist.
- [ ] Password reset flow (request, token, reset) and email verification.
- [ ] MFA enrollment/verification, devices management, session listing/revocation.
- [ ] Rate-limiting/hardening on auth endpoints (prod defaults present but tune values).
- [ ] Standardized error codes and telemetry for auth failures.
- [ ] Stronger secret/config management and JWKS support for future multi-service.

### Dependencies / coupling

- Identity reads memberships (Member, MemberRole) and permissions (RolePermission → Permission) to build claims.
- Relies on Tenant existence and membership for login acceptance.
- Access-Control seeds/maintains the permission catalog and role grants consumed by Identity.

### Next actions / roadmap

1. Implement `/users/logout` + token blacklist/invalidation (DB or Redis) and session tracking.
2. Add password reset and email verification flows with secure tokens.
3. Add MFA (TOTP/WebAuthn) and devices; expose `/users/sessions` for management.
4. Harden rate limiting and add security telemetry on auth endpoints.
5. Add OpenAPI docs and SDK-friendly responses.

---

## Access-Control Module

- Entry points
  - Mounted under API: `src/core/server.ts` → `app.use("/api/access", accessRouter)` → `src/features/access-control/index.ts`
- Key components
  - Routes: single router file `src/features/access-control/index.ts` with roles, permissions, role-permissions.
  - RBAC catalog: generated files `src/rbac/permissions.ts`, `src/rbac/roles.ts`, and middleware `src/rbac/middleware/rbac.ts` (generator v7).
  - Seeds: `prisma/seed/rbac-v7.sql` includes permissions, roles, and ADMIN grants (schema-driven).
  - RLS/RBAC: per-route `MiddlewareChains.protected(...)` or `admin()`; per-operation `withTenantRLS` enforces tenant-bound RLS.

### Current state

- Roles
  - GET `/api/access/roles` list roles for tenant [x]
  - GET `/api/access/roles/:id` get role by id [x]
  - POST `/api/access/roles` create role [x]
  - PUT `/api/access/roles/:id` update role [x]
  - DELETE `/api/access/roles/:id` soft delete [x]
- Permissions (global catalog)
  - GET `/api/access/permissions` list [x]
  - POST `/api/access/permissions` create (admin) [x]
  - PUT `/api/access/permissions/:id` update (admin) [x]
  - DELETE `/api/access/permissions/:id` soft delete (admin) [x]
- Role-Permissions
  - GET `/api/access/role-permissions` list grants (filter by roleId) [x]
  - POST `/api/access/role-permissions/grant` grant permission to role [x]
  - DELETE `/api/access/role-permissions/:id` revoke (soft delete) [x]
- ADMIN coverage
  - Generator maps `ADMIN` → all permissions (`Object.values(PERMISSIONS)`), reducing drift. [x]
  - Seed grants ADMIN all permissions across catalog. [x]

### Functional coverage

| Method | Path | Purpose | Auth/RBAC |
|---|---|---|---|
| GET | `/api/access/roles` | List roles by tenant | Auth + `Role.read` + RLS |
| GET | `/api/access/roles/:id` | Get role | Auth + `Role.read` + RLS |
| POST | `/api/access/roles` | Create role | Auth + `Role.create` + RLS |
| PUT | `/api/access/roles/:id` | Update role | Auth + `Role.update` + RLS |
| DELETE | `/api/access/roles/:id` | Soft delete role | Auth + `Role.soft_delete` + RLS |
| GET | `/api/access/permissions` | List permission catalog | Auth + `Permission.read` |
| POST | `/api/access/permissions` | Create permission | Admin |
| PUT | `/api/access/permissions/:id` | Update permission | Admin |
| DELETE | `/api/access/permissions/:id` | Soft delete permission | Admin |
| GET | `/api/access/role-permissions` | List role grants | Auth + `RolePermission.read` + RLS |
| POST | `/api/access/role-permissions/grant` | Grant permission to role | Auth + `RolePermission.create` + RLS |
| DELETE | `/api/access/role-permissions/:id` | Revoke role permission | Auth + `RolePermission.soft_delete` + RLS |

### Missing components / gaps

- [ ] Member-scoped permissions (grant/revoke to member directly).
- [ ] Role hierarchy resolution endpoints and effective permissions preview.
- [ ] Deny rules and precedence evaluation (allow/deny) and constraints (resource-scoped).
- [ ] Bulk grant/revoke and import/export of role templates.
- [ ] Pagination/filters for lists; audit events for RBAC changes.
- [ ] Consistency checks with schema (generator) and DB seed synchronization tooling.

### Dependencies / coupling

- Identity consumes grants to issue tokens; Access-Control changes must propagate to sessions.
- Tenant bootstrapping ensures ADMIN role and baseline permissions; optional full seeding via `rbac-v7.sql`.
- Generator ties to `RBAC.schema.v7.yml` for deterministic outputs.

### Next actions / roadmap

1. Add member-level grant/revoke and effective permission calculation endpoints.
2. Implement role hierarchy APIs and explainers (why access granted/denied).
3. Introduce deny/conditional constraints and evaluation engine.
4. Add pagination and search to list endpoints; emit audit logs on all RBAC mutations.
5. Build a seed sync tool to reconcile generator outputs with DB state.

---

## Cross-cutting concerns

- RLS
  - Enforced at DB; helper `src/lib/prisma/withRLS.ts` validates tenant and roles and applies session GUC. [x]
  - Validation updated to accept UUID v7 and include ADMIN as valid role. [x]
- RBAC
  - Middleware stacks: `src/middlewares` + `src/shared/routes/middleware-chain.builder.ts` to protect routes. [x]
  - Generator v7 produces `permissions.ts`, `roles.ts`, `middleware/rbac.ts`, and `prisma/seed/rbac-v7.sql`. [x]
- Observability & audit
  - `AuditService` present; some flows (tenant bootstrap) already call it. [ ] Extend coverage.
- Testing & smoke
  - `scripts/tenant-lifecycle-smoke.sh` for end-to-end bootstrap. [x]
  - `scripts/auth-smoke-test.cjs` validates Identity + Access-Control flows with ADMIN. [x]

## Summary

The Core modules are functionally online with solid scaffolding, RBAC-protected routes, and DB-enforced RLS. Identity covers core auth; Tenant supports bootstrap and members; Access-Control exposes roles, permissions, and grants. The roadmap focuses on rounding out subdomains, strengthening auth features, expanding RBAC capabilities, and standardizing pagination, auditing, and documentation.
