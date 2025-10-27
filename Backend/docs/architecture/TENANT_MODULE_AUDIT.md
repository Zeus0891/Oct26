# Tenant Module Audit

This document inventories the tenant module's routes, controllers, and protection layers, and highlights current gaps and next steps.

## Scope and mounting

- Public bootstrap routes (pre-auth):
  - Base: `/tenants`
  - File: `src/features/tenant/routes/public.routes.ts`
  - Mounted in `src/core/server.ts` via pre-auth hook
- Protected tenant routes:
  - Base: `/api/tenant`
  - Aggregator: `src/features/tenant/routes/index.ts`
  - Mounted in `src/core/server.ts` under `/api/tenant`
  - Per-route stacks: `securityStack(permission)` or `adminStack()` from `src/middlewares/index.ts` (JWT + tenant context + RBAC)

## Endpoints by area

- Tenant profile (admin/global)
  - Base: `/api/tenant`
  - File: `routes/tenant.routes.ts`
  - Endpoints:
    - GET `/me` — Get current tenant (securityStack TENANT_READ)
    - GET `/:id` — Get tenant by ID (adminStack)
    - PATCH `/:id` — Update tenant (adminStack)
    - POST `/:id/deactivate` — Deactivate tenant (adminStack)

- Lifecycle (admin-only)
  - Base: `/api/tenant/lifecycle`
  - File: `routes/lifecycle.routes.ts`
  - Endpoints:
    - POST `/provision` — Provision tenant with defaults (adminStack)
    - POST `/:id/deactivate` — Safe deactivation (adminStack)

- Feature flags
  - Base: `/api/tenant/feature-flags`
  - File: `routes/feature-flags.routes.ts`
  - Endpoints: GET `/`, POST `/`, GET `/:id`, PATCH `/:id`, POST `/:id/activate`, POST `/:id/deactivate` (securityStack with respective permissions)

- Settings
  - Base: `/api/tenant/settings`
  - File: `routes/settings.routes.ts`
  - Endpoints: GET `/`, PUT `/`, POST `/activate`, POST `/deactivate` (securityStack)

- Number sequences
  - Base: `/api/tenant/number-sequences`
  - File: `routes/numbering.routes.ts`
  - Endpoints: CRUD (`/`, `/:id`), POST `/:id/next`, POST `/:id/generate`, POST `/:id/reset` (admin for reset; others securityStack)

- Templates
  - Base: `/api/tenant/templates`
  - File: `routes/templates.routes.ts`
  - Endpoints:
    - Terms: GET `/terms/`, POST `/terms/`, GET `/terms/:id`, PATCH `/terms/:id`, DELETE `/terms/:id`, POST `/terms/:id/restore`
    - Contracts: same set under `/contracts`

- Documents (Document Groups)
  - Base: `/api/tenant/document-groups`
  - File: `routes/documents.routes.ts`
  - Endpoints: GET `/`, GET `/:id`, DELETE `/:id`, POST `/:id/restore`

- Audit
  - Base: `/api/tenant/audit`
  - File: `routes/audit.routes.ts`
  - Endpoints: GET `/`, GET `/export`

- Metrics
  - Base: `/api/tenant/metrics`
  - File: `routes/metrics.routes.ts`
  - Endpoints: GET `/`, GET `/export`

- Usage
  - Base: `/api/tenant/usage`
  - File: `routes/usage.routes.ts`
  - Endpoints: GET `/`, GET `/export`

- Public bootstrap
  - Base: `/tenants`
  - File: `routes/public.routes.ts`
  - Endpoints:
    - POST `/register` — Create tenant by slug/name
    - POST `/bootstrap` — Ensure tenant, ensure member for user, optionally ensure role and assign member role
    - POST `/bootstrap-full` — If tenant is new, provision defaults (settings, encryption, sequences) + ensure membership + ensure ADMIN role and baseline permissions

## Protection and context

- Per-route stacks:
  - `securityStack(permission)`: JWT auth + tenant context + RBAC for `permission`
  - `adminStack()`: JWT auth + tenant context + admin check
- RequestContext pattern is used within controllers/services to enforce RLS/tenant scoping and emit audit events.
- Tenant context is established via `tenantContextMiddleware` (X-Tenant-ID header supported; basic switch checks).

## Gaps and recommendations

- Role/permission seeding:
  - Addressed: public bootstrap seeds baseline permissions for `ADMIN`; consider expanding to full ADMIN scope or tailoring per tier.
- Full provisioning:
  - Addressed: `/tenants/bootstrap-full` provisions tenant defaults when newly created and completes membership + admin role.
- Membership management:
  - No dedicated admin endpoints in this module for inviting users, assigning roles, or managing primaries/defaults. Propose `/api/tenant/members` subrouter.
  - Addressed: `/api/tenant/members` routes added for list/create/read, role assign/unassign, and activate/deactivate.
- Deletion:
  - Only deactivation is present. Define archival/hard-delete workflow with safety checks.
- Tests:
  - Add integration tests for `/tenants/register` and `/tenants/bootstrap`, and smoke tests for `/api/tenant/me` with proper RBAC.

## Next steps

1) Seed baseline permissions when owner role is created (in bootstrap or lifecycle service).
2) Optionally add `/tenants/bootstrap-full` to run provisioning + membership in one step.
3) Mount member/role admin routes for complete lifecycle.
4) Add minimal integration tests and wire to CI once a test runner is standardized.
