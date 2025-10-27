# Projects Feature Module

Enterprise-grade Projects module implementing secure, multi-tenant project execution APIs.

- Multi-tenancy: enforced via PostgreSQL Row-Level Security (RLS) and withTenantRLS.
- RBAC: protected via PERMISSIONS.PROJECT_* and related constants; ADMIN inherits all.
- Validation: Zod schemas per action (create/update/list), inferred types exported.
- Audit: actor/tenant context captured in mutations (createdByActorId/updatedByActorId/deletedByActorId).

## Endpoints (Phase 1)

Base path: /api/projects

- Projects
  - GET /projects — list with filters (status, q, accountId, locationId)
  - POST /projects — create
  - GET /projects/:id — fetch by id
  - PATCH /projects/:id — update
  - DELETE /projects/:id — soft-delete
- ProjectTasks
  - GET /tasks — list with filters (projectId, status)
  - POST /tasks — create
  - GET /tasks/:id — fetch by id
  - PATCH /tasks/:id — update
  - DELETE /tasks/:id — soft-delete
- ProjectMembers
  - GET /members — list with filters (projectId, memberId, role)
  - POST /members — create
  - GET /members/:id — fetch by id
  - PATCH /members/:id — update
  - DELETE /members/:id — soft-delete

## Contracts

- Request/response envelope: { success: boolean; data?: T; error?: { code, message } }
- IDs are UUID v7; timestamps are RFC3339.
- All DB access wrapped with withTenantRLS; queries scoped by tenantId and deletedAt: null.

## Implementation Notes

- Validators live in validators/* and are the source of truth.
- Controllers parse using schema.parse and forward typed DTOs to services.
- Services apply audit fields and are RLS-wrapped; business rules live here.
- Avoid duplicating utils or types—prefer shared/types and shared/utils.
