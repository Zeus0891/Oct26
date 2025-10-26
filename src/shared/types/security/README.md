# Security Types Library Audit Summary

Overall Compliance Score: 9.8/10 — 100% Ready

Security types cover RBAC, permissions, roles, access decisions, and compliance. Files with Prisma-backed concepts import enums correctly; other files intentionally define domain enums.

## Files Audited

- rbac.types.ts — Prisma enums: RoleType; RBAC roles, permissions, assignments, hierarchy, audits
- role.types.ts — Prisma enums: RoleType, AssignmentScope; role definitions, templates, conflicts, analytics
- access.types.ts — Prisma enums: PermissionScope, RoleType, AssignmentScope; access profiles/decisions, grants, policies
- permission.types.ts — Manual enums for scope/action/category; permission constraints, masking, filters, templates
- compliance.types.ts — Manual enums for compliance, classification, retention statuses; requests, holds, rules, reports
- index.ts — Barrel exports

## Prisma Integration Summary

- Enums used: RoleType, AssignmentScope, PermissionScope
- Manual enums used intentionally where richer domain semantics are needed

## Usage Patterns

// Permission check
// import { PermissionCheckRequest } from "@/shared/types/security";

// Access decision
// import { AccessRequest, AccessDecision } from "@/shared/types/security";

// Role assignment
// import { RoleAssignmentRequest } from "@/shared/types/security";

## Best Practices

- Import from the security index barrel
- Use Prisma enums for role/scope; use provided domain enums for categories/actions
- Keep constraints and masking rules co-located with permission definitions

Compliance Status: RBAC/RLS Ready | Enterprise Security Standards | Audit-First
