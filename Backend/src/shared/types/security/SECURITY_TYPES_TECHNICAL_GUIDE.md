# Security Types Technical Architecture Guide

Enterprise Development Documentation for `/src/shared/types/security/`

---

## Executive Summary

This guide documents RBAC, roles, permissions, access decisions, and compliance types. It standardizes authorization semantics, policy constraints, masking, and audit trails across the platform.

Key Points:

- Prisma-aligned enums where available: RoleType, AssignmentScope, PermissionScope
- Domain enums for permissions/compliance to capture richer semantics
- Access flows with grant tracing, constraints, and audit correlation

---

## Architecture Overview

Structure

```
src/shared/types/security/
├── rbac.types.ts        # Roles, permissions, assignments, hierarchy
├── role.types.ts        # Role definitions, templates, conflicts, analytics
├── permission.types.ts  # Permission catalog, constraints, masking
├── access.types.ts      # Access requests/decisions, grants, policies
├── compliance.types.ts  # Data privacy, holds, retention, reports
└── index.ts             # Barrel exports
```

Prisma Alignment

- rbac.types.ts: RoleType
- role.types.ts: RoleType, AssignmentScope
- access.types.ts: PermissionScope, RoleType, AssignmentScope
- permission/compliance: intentional domain enums

---

## Usage Guide by File

### rbac.types.ts — RBAC Core

- Core: RBACRole, PermissionBase, RolePermissionBase, MemberRoleBase, RoleWithPermissions, MemberRoleAssignments, PermissionCheckRequest/Result, RBACHierarchyNode, RBACConfiguration
- Patterns:
  - Hierarchical roles with inheritance and system/assignable flags
  - Permission checks with granting role/permission tracing
  - Tenant RBAC configuration and auto-assignment rules

### role.types.ts — Roles & Templates

- Core: RoleBase, RoleDefinition, RoleCapability, RoleAssignmentConstraints, RoleHierarchyNode, RoleTemplate (+Configuration), RoleAssignment* types, RoleConflict* types, RoleUsageAnalytics
- Patterns:
  - Role templates with default permissions/capabilities
  - Assignment constraints, prerequisites, exclusivity, approvals
  - Conflict detection and resolution suggestions

### permission.types.ts — Permission Catalog

- Core: PermissionDefinition, PermissionConstraints (field/data/time/IP/device), FieldMaskingRule, PermissionEvaluationContext/Result, PermissionTemplate, PermissionAuditEntry
- Patterns:
  - Field-level masking, data filters, time/IP/device constraints
  - Evaluation context/results with applied constraints
  - Templates for consistent permission sets

### access.types.ts — Access & Policies

- Core: AccessProfile, MemberRoleAssignment, EffectivePermission, AccessCapability, AccessConstraint, AccessRequest/Context, AccessDecision, PermissionGrant (+conditions), AccessPolicy (+conditions), AccessAuditEvent, MemberAccessSummary
- Patterns:
  - Grant origin tracing with scope/context
  - Constraint-aware access decisions with confidence scoring
  - Policy-first authorization and audit correlation

### compliance.types.ts — Privacy & Compliance

- Core: DataAccessRequestBase, DataErasureRequestBase, LegalHoldBase, AuditRuleBase (+Condition/Threshold), ComplianceEvent, DataSubject (+ConsentRecord), RetentionPeriod, ComplianceReport (+Summary)
- Patterns:
  - Subject rights, erasure workflow, legal holds
  - Audit rules and alert thresholds with severity levels
  - Compliance reporting and scoring

---

## Implementation Patterns

Permission Check Pattern

```ts
const req: PermissionCheckRequest = {
  memberId,
  tenantId,
  permission: "PROJECT_EDIT",
  resource: "Project",
  resourceId: pid,
};
```

Access Decision Pattern

```ts
const access: AccessRequest = {
  memberId,
  tenantId,
  resource: "Document",
  action: "READ",
  context: { projectId: pid, ipAddress },
};
```

Role Assignment Pattern

```ts
const assign: RoleAssignmentRequest = {
  memberId,
  roleId,
  scope: "PROJECT",
  contextId: pid,
} as any;
```

Compliance Event Pattern

```ts
const evt: ComplianceEvent = {
  id: "c1",
  tenantId,
  eventType: "DATA_ACCESS",
  timestamp: new Date(),
  description: "Viewed payroll",
};
```

---

## Database Integration

- Role/Permission/RolePermission/MemberRole
- DataAccessRequest, DataErasureRequest, LegalHold, AuditRule
- Audit trails for permission use and access decisions

---

## Security & Compliance

- Field masking and data filters to enforce least-privilege
- Assignment constraints and approval for sensitive roles
- Comprehensive audit events and compliance reports

---

## Testing Strategies

- RBAC graph tests: inheritance and conflicts
- Permission evaluation with constraints and masking
- Access decision edge cases and policy precedence
- Compliance workflows: requests, holds, reports

---

## Development Guidelines

- Import from `@/shared/types/security`
- Use Prisma enums where available; use provided domain enums otherwise
- Keep constraints and audit metadata close to definitions

Compliance: RBAC/RLS Ready | Enterprise Security Aligned | Auditable by Design
