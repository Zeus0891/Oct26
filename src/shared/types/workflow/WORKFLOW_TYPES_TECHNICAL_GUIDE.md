# Workflow Types Technical Architecture Guide

Enterprise Development Documentation for `/src/shared/types/workflow/`

---

## Executive Summary

This guide documents status lifecycles, approval flows, task management, and revision control. These types enable RBAC-aware workflows with full auditability and alignment to Prisma enums.

Highlights:

- 4 Core Domains: Approvals, Status, Tasks, Revisions
- Extensive Prisma enum alignment for lifecycle integrity
- Delegation, escalation, notifications, and analytics patterns

---

## Architecture Overview

Structure

```
src/shared/types/workflow/
├── approval-flow.types.ts  # RBAC-integrated approvals, decisions
├── status.types.ts         # Status lifecycles and transitions
├── task.types.ts           # Tasks, assignments, dependencies
├── revision.types.ts       # Versioning and change audits
└── index.ts                # Barrel exports
```

Prisma Alignment

- Approvals: ApprovalDecisionStatus/Type, ApprovalRequestStatus/Priority/Source, ApprovalRuleScope/Status/Type, ApprovalStatus, ApprovalEntityType
- Status: EstimateStatus, BidStatus, ProjectStatus, ApprovalStatus, SubmittalStatus, WorkItemStatus, TaskPriority, TaskType
- Tasks: WorkItemStatus, TaskPriority, TaskType, ImpactLevel, RetentionPolicy
- Revisions: EstimateChildStatus, ProjectChildStatus, RetentionPolicy

---

## Usage Guide by File

### approval-flow.types.ts — Approval Workflows

- Core: ApprovalTrackingBase, ApprovalRuleDefinition (+Condition/Step/Approver), ApprovalRequestInfo, ApprovalDecisionInfo, ApprovalWorkflowInstance (+State/StepInstance), Events, Delegation, Escalation, Metrics, Bulk ops, Notifications
- Patterns:
  - Multi-step approval with min approvals/unanimity, delegation, timeouts
  - Escalation triggers and actions, routing by roles/members/groups
  - Metrics for bottlenecks and approver performance

### status.types.ts — Status Lifecycles

- Core: StatusTrackingBase, StatusTransition, StatusLifecycle, entity-specific status info types, audit events, validation, bulk ops, metrics
- Patterns:
  - Role/permission-required transitions with validation rules
  - Optimistic locking via version fields
  - Time-in-status analytics and transition frequencies

### task.types.ts — Task Management

- Core: TaskInfo, Assignment/Checklist/Dependency, TaskWithDetails, CRUD requests, Progress, Worklog, Filter/Sort, Metrics, Templates, Notifications
- Patterns:
  - RBAC-aware assignments and approvals
  - Critical path via dependencies, overdue/blocked flags
  - Notification triggers and digest scheduling

### revision.types.ts — Version Control

- Core: RevisionTrackingBase, Metadata, EstimateRevisionInfo, ProjectRevisionInfo, GenericRevision, Comparison, Create/Restore, Permissions, AuditEvent, Branches, MergeRequest, Metrics
- Patterns:
  - Snapshot data and change diffs with type-safe fields
  - Branching and conditional auto-merge when no conflicts
  - Retention and data classification tagging

---

## Implementation Patterns

Approval Orchestration

```ts
const req: ApprovalRequestInfo = {
  id: "ar-1",
  tenantId,
  entityId: eid,
  entityType: "INVOICE" as any,
  status: "PENDING" as any,
  priority: "HIGH" as any,
  source: "SYSTEM" as any,
  requestedByMemberId: mid,
  requestedAt: new Date(),
  title: "Invoice Approval",
};
```

Status Transition

```ts
const transition: StatusTransition = {
  fromStatus: "DRAFT",
  toStatus: "SUBMITTED",
  requiredPermission: "ESTIMATE_SUBMIT",
  allowedRoles: ["PM"],
  requiresApproval: true,
};
```

Task Assignment

```ts
const assign: AssignTaskRequest = {
  taskId,
  memberId,
  assignmentRole: "OWNER",
  allocatedHours: 8,
  assignedByActorId: aid,
};
```

Revision Compare

```ts
const diff: RevisionComparison = {
  sourceRevision: "v1",
  targetRevision: "v2",
  changes: [],
  changesSummary: { addedFields: 1, modifiedFields: 2, removedFields: 0 },
};
```

---

## Database Integration

- ApprovalRule, ApprovalRequest, ApprovalDecision
- Estimate, Bid, Project, Submittal, Task (+ related assignment/checklist/dependency tables)
- EstimateRevision and project artifacts with versioning

---

## Security & Compliance

- Approvals and status transitions bound to RBAC permissions
- RetentionPolicy on tasks and revisions
- Full audit events for status changes, approvals, and revisions

---

## Monitoring & Analytics

- Approval bottlenecks, response times, completion rates
- Status distribution and time-in-state metrics
- Task throughput, overdue/blocked rates, top performers
- Revision frequency, contributors, and size metrics

---

## Testing Strategies

- Approval multi-step flows with delegation and escalation
- Status transition guards and bulk operations
- Task dependency and critical path scenarios
- Revision diff correctness and restore safety

---

## Development Guidelines

- Import from `@/shared/types/workflow`
- Use Prisma enums for status/approval/priority/type fields
- Keep audit-friendly metadata on transitions, decisions, and revisions

Compliance: 100% Schema Aligned | Enterprise Workflow Ready | Audit-first
