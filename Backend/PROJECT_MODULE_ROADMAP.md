# Project Module — Audit and Roadmap

## Executive summary

The Projects module provides the execution backbone that connects commercial documents (Estimates/Contracts) with operational delivery (ProjectTasks, RFIs, Submittals, Inspections), enabling controlled collaboration, schedule adherence, quality assurance, and financial tracking. It is multi-tenant by design, protected with PostgreSQL Row-Level Security and RBAC, and follows enterprise standards for reliability, security, compliance, and observability.

- Objectives: deliver secure, scalable, and auditable project execution APIs with strict tenant isolation and role-based permissions.
- Guardrails: no aggregation of global Tasks in this module; ProjectTask is distinct and tenant-scoped. All DB access wrapped via withTenantRLS.
- Release strategy: phase-in core CRUD, then workflows, then reporting; feature flags where prudent.

## Scope and contracts

- Module: Projects (execution core tying Estimates/Contracts to ProjectTasks, RFIs, Submittals, Inspections, Budget, and Reporting)
- API surface: Express routes under `/api/projects/*` using MiddlewareChains (auth, tenant, RBAC, RLS)
- Data layer: Prisma models with tenant scoping and PostgreSQL RLS via `withTenantRLS`
- Success criteria:
  - Endpoints enforce tenant isolation and RBAC
  - CRUD for core resources (Project, ProjectTask, Member) plus key workflows (RFI, Submittal, Inspection)
  - Minimal E2E smoke for list/create/update guarded by permissions

### Non-functional requirements (NFRs)

- Availability: 99.9% monthly for core read/write endpoints; 99.5% for bulk operations
- Latency targets (P95): reads ≤ 150 ms, writes ≤ 250 ms, bulk ≤ 1.5 s (up to 100 items)
- Throughput: baseline 200 RPS sustained, burst to 500 RPS with autoscaling
- Multi-tenancy: strict isolation via RLS; no cross-tenant reads/writes
- Data security: least-privilege RBAC; audit trail for mutations; PII minimization
- Observability: structured logs, metrics, traces, and audit events; correlationId required
- Backups/DR: Point-in-time recovery per platform policy; RPO ≤ 5 min, RTO ≤ 30 min

### SLA/SLO/SLI and error budget

- SLI: availability, latency, error rate (< 0.1% 5xx over 30d)
- SLO: availability ≥ 99.9%, P95 latency thresholds as above
- Error budget: 0.1% monthly unavailability to spend on controlled releases

### Compliance and data governance

- GDPR/CCPA: data subject rights supported via Tenant export/delete processes
- SOC 2 alignment: change management, audit logging, least privilege, backups
- Data classification: Project data “Internal”; attachments may be “Confidential”
- Retention: soft-deletes default; retention windows configured at tenant policy level

### Security and access model

- Authentication: JWT-based; user context propagated; X-Tenant-Id header required
- Authorization: RBAC via PERMISSIONS.*; ADMIN inherits all; route-level checks applied
- Isolation: withTenantRLS enforces RLS policies; session claims set per request
- Input protection: validators per DTO; server-side defaults for timestamps and actors

## Entity audit (schema vs. design)

Legend: Exists = model present in `prisma/schema.prisma`. Tenant = has `tenantId` and `@@unique([tenantId, id])`. RLS = table has RLS enabled by migrations and policies. Deps = primary parent/foreign keys.

| Model | Exists | Tenant | RLS | Key dependencies |
| --- | --- | --- | --- | --- |
| Project | Yes | Yes | Yes | Tenant, DocumentGroup, Account, Contact, Member (approvals), Department/OrgUnit/CostCenter, Location, Estimate/Invoice |
| ProjectPhase | Yes | Yes | Yes | Project |
| WBSItem | Yes | Yes | Yes | Project, Phase (optional), self parent |
| ProjectTask | Yes | Yes | Yes | Project, Phase/WBS/EstimateLine/ChangeOrderLine |
| ProjectTaskAssignment | Yes | Yes | Yes | Project, Task, Member |
| ProjectTaskAttachment | Yes | Yes | Yes | ProjectTask, Attachment |
| ProjectTaskChecklistItem | Yes | Yes | Yes | ProjectTask |
| ProjectTaskComment | Yes | Yes | Yes | ProjectTask, Member (author) |
| ProjectTaskDependency | Yes | Yes | Yes | ProjectTask predecessor/successor |
| Schedule | Yes | Yes | Yes | Project |
| ScheduleException | Yes | Yes | Yes | Project |
| RFI | Yes | Yes | Yes | Project |
| RFIReply | Yes | Yes | Yes | RFI |
| Submittal | Yes | Yes | Yes | Project |
| SubmittalItem | Yes | Yes | Yes | Submittal |
| SubmittalApproval | Yes | Yes | Yes | Submittal, Member |
| Inspection | Yes | Yes | Yes | Project |
| InspectionItem | Yes | Yes | Yes | Inspection |
| InspectionApproval | Yes | Yes | Yes | Inspection, Member |
| DailyLog | Yes | Yes | Yes | Project |
| PunchList | Yes | Yes | Yes | Project |
| PunchListItem | Yes | Yes | Yes | PunchList |
| ProjectFinancialSnapshot | Yes | Yes | Yes | Project |
| ProjectBudgetLine | Yes | Yes | Yes | Project (Task optional) |
| ProjectDocument | Yes | Yes | Yes | Project, Attachment, Member (uploader) |
| ProjectExternalAccess | Yes | Yes | Yes | Project |
| ProjectLocation | Yes | Yes | Yes | Project |
| ProjectMember | Yes | Yes | Yes | Project, Member |
| ProjectNote | Yes | Yes | Yes | Project |
| ProjectReport | Yes | Yes | Yes | Project |
| ProjectIssue | Yes | Yes | Yes | Project, Member (assignee) |
| ProjectRisk | Yes | Yes | Yes | Project, Member (owner) |
| ProjectInventoryTransaction | Yes | Yes | Yes | Project |
| Milestone | Yes | Yes | Yes | Project |
| MilestoneDependency | Yes | Yes | Yes | Milestone predecessor/successor |
| MilestoneStakeholder | Yes | Yes | Yes | Milestone, Contact/Member |
| ResourceAllocation | Yes | Yes | Yes | Project, Member/Resource |
| Location | Yes | Yes | Yes | Tenant (global location catalog per tenant) |
| ProjectType | Yes | No (Global) | No (Catalog) | None (reference type) |

Notes
- Prisma models include the “This model contains row level security” doc comment and migrations include `ENABLE ROW LEVEL SECURITY` plus role policies for Project tables. `ProjectType` is a global catalog without tenantId and typically not RLS-scoped.
- All listed entities are present in `prisma/schema.prisma` and linked via foreign keys created in `20251026052546_init` migration.

Domain clarification
- The global Tasks module is an independent domain and not part of Projects. It may optionally reference a Project for location/member context, but Projects do not aggregate global Tasks. All task operations within this module refer to ProjectTask only.

## API standards and contracts

### Versioning and base path

- Base: /api/projects (v1 implicit). Prefer header or query versioning for future versions.

### Request/response envelope

- Success: { "success": true, "data": T, "meta"?: { pagination?, warnings? } }
- Error: { "success": false, "error": CODE, "message"?: string, "details"?: any }
- Correlation: clients should send X-Correlation-Id; server will generate if absent

### Pagination and filtering

- Cursor pagination: query params limit (default 25, max 100) and cursor
- Filters: status, projectId, date ranges (createdAt, updatedAt); all tenant-scoped

### Idempotency and rate limits

- Idempotency-Key header required for POST that can be retried (roadmap Phase 2)
- Rate limit defaults enforced by shared middleware; per-tenant overrides possible

### Error taxonomy (high level)

- Validation: VALIDATION_ERROR (400)
- Auth: UNAUTHORIZED (401), FORBIDDEN (403)
- Not found: NOT_FOUND (404)
- Conflict/State: CONFLICT (409), INVALID_STATE (422)
- Server: INTERNAL (500), DEPENDENCY_FAILURE (502/503)

## Permissions mapping (RBAC)

- RBAC constants exist in `src/rbac/permissions.ts` under the PROJECT_MANAGEMENT section (e.g., `PERMISSIONS.PROJECT_READ`, `PROJECTTASK_CREATE`, `RFI_READ`, `SUBMITTAL_APPROVE`, etc.).
- ADMIN inherits all permissions by generator design; enforce route-level checks using these constants.

RBAC quick matrix (examples):

- PROJECT_READ: Admin, ProjectManager, Viewer
- PROJECT_CREATE/UPDATE: Admin, ProjectManager
- PROJECTTASK_*: Admin, ProjectManager; limited READ for Worker
- PROJECTMEMBER_*: Admin, ProjectManager

## Recommended API surface (first pass)

Base prefix: `/api/projects`

- Projects
  - GET `/projects` (list, filter by status) → Project.read
  - POST `/projects` → Project.create
  - GET `/projects/:id` → Project.read
  - PATCH `/projects/:id` → Project.update
  - DELETE `/projects/:id` (soft) → Project.soft_delete
  - POST `/projects/:id/archive` → Project.archive
  - POST `/projects/:id/duplicate` → Project.duplicate
  - POST `/projects/:id/transfer` → Project.transfer

- Phases, WBS
  - CRUD `/phases`, `/wbs-items` → ProjectPhase.*, WBSItem.*

- Tasks and Assignments
  - CRUD `/tasks` → ProjectTask.* (Project domain only; not the global Tasks module)
  - POST `/tasks/:id/assign` | `/unassign` | `/transfer` → ProjectTask.assign/unassign/transfer
  - CRUD `/task-assignments` → ProjectTaskAssignment.*
  - CRUD `/task-dependencies` → ProjectTaskDependency.*; validate cycles and tenant/project match
  - CRUD `/task-attachments`, `/task-comments`, `/task-checklist-items` → respective permissions

- RFIs and Submittals
  - CRUD `/rfis` → RFI.*; POST `/rfis/:id/send` → RFI.send
  - CRUD `/rfi-replies` → RFIReply.*
  - CRUD `/submittals` → Submittal.*; approvals under `/submittal-approvals`
  - CRUD `/submittal-items` → SubmittalItem.*; `/submittal-approvals` → SubmittalApproval.*

- Inspections and Quality
  - CRUD `/inspections`, `/inspection-items`, `/inspection-approvals` → respective permissions
  - CRUD `/punch-lists`, `/punch-list-items`

- Scheduling
  - CRUD `/schedule` → Schedule.*
  - CRUD `/schedule-exceptions` → ScheduleException.*

- Membership, Locations and Docs
  - CRUD `/members` → ProjectMember.*
  - CRUD `/locations` → ProjectLocation.*
  - CRUD `/documents` → ProjectDocument.*
  - CRUD `/external-access` → ProjectExternalAccess.*
  - CRUD `/notes` → ProjectNote.*

- Budget, Financials, Inventory
  - CRUD `/budget-lines` → ProjectBudgetLine.*
  - GET/POST `/financial-snapshots` → ProjectFinancialSnapshot.*
  - CRUD `/inventory-transactions` → ProjectInventoryTransaction.*

- Reports and Issues/Risks
  - CRUD `/reports` → ProjectReport.*; GET `/reports/:id/export` → ProjectReport.export
  - CRUD `/issues` → ProjectIssue.*
  - CRUD `/risks` → ProjectRisk.*

### Representative DTOs (minimal, subject to refinement)

- CreateProjectRequest: { name: string; documentGroupId: string; externalNumber: string; ... }
- CreateProjectTaskRequest: { name: string; projectId: string; phaseId?: string; ... }
- CreateProjectMemberRequest: { projectId: string; memberId: string; role: string }

Resource scoping
- All routes require `X-Tenant-Id` and run inside `withTenantRLS(req)`; primary filters include `tenantId` and `projectId` as applicable.
- Use `MiddlewareChains.authenticated`, `withTenantContext`, and RBAC guard through the Permissions middleware (already generated).

## Implementation roadmap (phased)

Phase 1 — Foundations (Routes + minimal CRUD)
- Wire module router under `/api/projects` in `src/core/server.ts`.
- Create `src/projects/routes/*.ts` for: projects, tasks, members, documents.
- Implement minimal controllers/services with Prisma for list/get/create/update using `withTenantRLS`.
- Add validation schemas in `src/projects/validators/*` for core DTOs.
- Add indexes as needed (already present in migrations for most models).

Phase 2 — RBAC integration and RLS hardening
- Protect routes using `PERMISSIONS.*` constants and the generated RBAC middleware.
- Ensure ADMIN role bypass works as intended; verify with existing auth smoke by adding `/api/projects/projects` list to the script.
- Enforce project/tenant consistency on create/update (reject cross-tenant/project references).

Phase 3 — Work structure and scheduling
- Implement WBSItem and ProjectPhase CRUD with sort order management.
- Add ProjectTask dependencies with validation (no cycles; predecessor/successor in same project).
- Implement assignment flows with allocation and availability checks.
- Expose schedule and schedule exceptions endpoints; add basic critical-path computation placeholder.

Phase 4 — Collaboration workflows
- Implement RFIs + Replies, Submittals + Approvals with state machines and audit notes.
- Implement Inspections, Punch Lists, and QA approvals.
- Wire ProjectDocument uploads via existing `Attachment` and `FileObject` relations.

Phase 5 — Reporting, financial snapshots, and E2E
- Add ProjectReport endpoints and export.
- Implement `ProjectFinancialSnapshot` generation routine (batch job or on-demand).
- Add smoke tests for core flows (Project create → Task create → Assign → RFI create → list) using ADMIN and a project manager role.

## Observability and audit

- Logging: structured JSON logs with correlationId, tenantId, userId, route, latency
- Metrics: request count/duration (by route), error rate, DB query time, RLS overhead
- Tracing: distributed trace with DB spans; tag tenantId and role
- Audit events: create/update/delete with actor, before/after hashes, correlationId

## Performance profile and tuning

- Targets: see NFRs; DB indexes validated in migrations; add partial indexes for common filters
- Caching: read-through caching for reference lists (e.g., ProjectType) outside RLS tables
- Bulk operations: chunked transactions; soft limits documented; backpressure handling

## Operational readiness

- Runbooks: incident triage, RLS policy verification, RBAC drift check
- DR: verify PITR restore runbook quarterly; audit restore tests
- Feature flags: enable new endpoints behind flags when affecting state machines

## Risks and mitigations

- RLS misconfiguration → add RLS integrity checks and CI validation scripts
- Cross-tenant reference attempts → validators + DB constraints + RLS
- Workflow state complexity (approvals) → explicit FSMs, invariant tests
- Performance under burst → autoscaling + rate limits + graceful degradation

## Request/response patterns (example)

- All endpoints accept/return JSON. Use `id` as UUID v7. Timestamps are RFC3339.
- Contract basics per entity:
  - Create: validate required foreign keys exist in same tenant; default status enums; set `createdByActorId`/`updatedByActorId` if available.
  - Update: patch semantics; bump `updatedAt`.
  - List: filter by `status`, `projectId`, date ranges; paginate with `limit`/`cursor`.

  Standard success example:

  { "success": true, "data": { "id": "...", "name": "..." }, "meta": { "warnings": [] } }

  Standard error example:

  { "success": false, "error": "VALIDATION_ERROR", "message": "name is required" }

## Edge cases to handle

- Cross-tenant reference attempts (reject with 403/422).
- Project soft-deleted state: block new child creates; list excludes by default.
- Task dependency cycles or cross-project links (reject).
- Assignment overlaps exceeding 100% allocation (warn/block based on policy).
- RFI/Submittal state transitions require appropriate permissions and valid predecessors.

## Wiring checklist

- Mount router: update `src/core/server.ts` to include `/api/projects`.
- Create routes/controllers/services scaffolding for: projects, tasks, members, documents.
- Add validators and types for create/update payloads.
- Apply `withTenantRLS` in all handlers; enforce `X-Tenant-Id` header.
- Add RBAC guards using `PERMISSIONS` constants.
- Extend existing smoke test to hit `/api/projects/projects` list.

Quality gates (current status)

- Build: PASS (typecheck) / Runtime: dev server boots
- Lint/format: Pending full run
- Tests: Pending smoke extension for /api/projects

## References

- Schema: `prisma/schema.prisma` (see models around Project at ~11486, tasks at ~12060, WBS at ~17118)
- RBAC: `src/rbac/permissions.ts` (PROJECT_MANAGEMENT section)
- RLS helpers: `src/lib/prisma/withRLS.ts`
- Design: `src/projects/README`, tables in `src/projects/TABLES_AND_ENUMS.md`

## Progress checklist ✅

Last updated: 2025-10-26

- [x] Router mounted at `/api/projects` in `src/core/server.ts`
- [x] Projects CRUD scaffold (routes/controllers/services/validators) with RLS + RBAC
- [x] ProjectTasks CRUD scaffold (routes/controllers/services/validators) with RLS + RBAC
- [x] ProjectMembers CRUD scaffold (routes/controllers/services/validators) with RLS + RBAC
- [ ] ProjectDocuments scaffold (routes/controllers/services/validators)
- [x] Services wrap Prisma calls in `withTenantRLS`
- [x] Routes use `MiddlewareChains.protected` and `PERMISSIONS.*`
- [x] Typecheck passes for Projects module
- [x] DTO types for create/update payloads (shared/types/workflow/projects.types.ts)
- [ ] Extend smoke tests to hit `/api/projects/projects` list
- [ ] Enforce explicit cross-tenant/project reference validation on create/update (beyond RLS)
- [ ] Implement additional project endpoints (archive/duplicate/transfer)
- [ ] Implement Phases and WBS endpoints

## Ownership and timeline

- Module owner: Platform/Apps — Projects Domain
- Tech leads: Core Infrastructure (RLS/RBAC), App Platform (Express/Prisma)
- Milestones:
  - M1 (Foundations): complete — core CRUD scaffolds, RLS & RBAC wiring
  - M2 (RLS/RBAC hardening + smoke): in progress — smoke tests for projects list
  - M3 (Work structure): backlog — Phases, WBS, dependencies, assignments
  - M4 (Collaboration): backlog — RFIs, Submittals, Inspections
  - M5 (Reporting/Financials): backlog — reports, snapshots
