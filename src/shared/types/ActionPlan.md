Here's the **complete and expanded summary table** showing exactly which **Prisma tables** and **enums** each transversal type file in `shared/types/` must align with.

This table ensures complete alignment with the actual RBAC system implementation verified through codebase audit and documentation review.

---

# 🧩 **Shared Types — Table & Enum Dependency Summary**

## **RBAC System Context**

Based on comprehensive audit of the actual implementation:

- ✅ **Database Functions**: Use `rls.*` naming convention (`rls.tenant_id()`, `rls.is_admin()`)
- ✅ **Role Hierarchy**: User → Member → MemberRole → Role → RolePermission → Permission
- ✅ **Multi-Tenant Isolation**: All tenant-scoped tables enforce RLS with `tenantId` filtering
- ✅ **Role Types**: `SYSTEM` (platform-seeded), `CUSTOM` (tenant-created), `INHERITED` (role hierarchy)
- ✅ **Assignment Scopes**: `GLOBAL`, `TENANT`, `PROJECT`, `DEPARTMENT`, `TEAM`, `RESOURCE`

| **File**                      | **Depends on Prisma Tables**                                          | **Depends on Prisma Enums**                                                     | **Purpose / Context**                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🧱 base/tenant.types.ts**   | `Tenant`, `TenantSettings`, `TenantFeatureFlag`, `TenantSubscription` | `TenantRegion`, `TenantStatus`, `TenantTier`, `TenantDeploymentType`            | Multi-tenant context definition, used across all modules and RLS isolation boundary.                                                                                         |
| **🧱 base/actor.types.ts**    | `Actor`, `User`, `ServiceAccount`, `IntegrationConnection`            | `ActorType`, `ActorStatus`                                                      | Base representation of any acting entity for audit trails and RLS context.                                                                                                   |
| **🧱 base/audit.types.ts**    | `TenantAuditLog`, `SystemLog`, `OutboxMessage`                        | `AuditAction`, `DataClassification`, `RetentionPolicy`                          | Common audit trail structure for RBAC operations, compliance, and RLS activity tracing.                                                                                      |
| **🧱 base/rls.types.ts**      | `Tenant`, `Member`, `User`, `MemberRole` _(context providers)_        | `AssignmentScope` _(for scoped access)_                                         | Defines `RLSContext` for `withRLS.ts` Prisma transaction scoping. References these tables at runtime for session initialization but does not persist or query them directly. |
| **💰 base/currency.types.ts** | `CurrencyRate`, `TenantPriceList`, `TenantPriceOverride`              | `CurrencyCode`                                                                  | Standard financial unit and currency precision representation.                                                                                                               |
| **💰 base/tax.types.ts**      | `EstimateTax`, `InvoiceTax`, `TaxRate`, `TaxJurisdiction`             | `EstimateTaxType`, `TaxRateType`, `TaxCalculationMethod`, `TaxJurisdictionType` | Defines standardized tax breakdown structure for totals and billing logic.                                                                                                   |
| **🧾 base/approval.types.ts** | `ApprovalRule`, `ApprovalRequest`, `ApprovalDecision`                 | `ApprovalDecisionStatus`, `ApprovalRuleType`, `ApprovalEntityType`              | Approval workflows with RBAC-aware role-based approval routing and permissions.                                                                                              |
| **📄 base/document.types.ts** | `Attachment`, `AttachmentLink`, `FileObject`, `DocumentGroup`         | `AttachmentType`, `AttachmentStatus`, `FileCategory`                            | Defines shared attachment metadata with tenant isolation and permission-based access.                                                                                        |
| **🧠 base/metadata.types.ts** | `EstimateRevision`, `ProjectReport`, `VersionedEntity` _(conceptual)_ | _(None)_                                                                        | Defines tagging, revisioning, and metadata used in entities with historical versions.                                                                                        |

---

| **File**                            | **Depends on Prisma Tables**                                        | **Depends on Prisma Enums**                                          | **Purpose / Context**                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔐 security/access.types.ts**     | `Role`, `Permission`, `RolePermission`, `Member`, `MemberRole`      | `PermissionScope`, `RoleType`, `AssignmentScope`                     | RBAC semantic layer aligned with actual database functions (`rls.*`) and role hierarchy.                                                                                                                                                      |
| **🔐 security/permission.types.ts** | `Permission`, `RolePermission`                                      | `PermissionCategory`, `PermissionScope`, `PermissionAction`          | Permission catalog metadata; integrates with auto-generated RBAC schema and business rules.                                                                                                                                                   |
| **🔐 security/role.types.ts**       | `Role`, `RolePermission`, `MemberRole`                              | `RoleType` _(SYSTEM/CUSTOM/INHERITED)_, `AssignmentScope`            | Role hierarchy definitions aligned with actual `RBAC.schema.v7.yml` role codes. Roles may include runtime metadata property `audience?: 'INTERNAL' \| 'EXTERNAL'`, sourced from the RBAC YAML schema (`rbac.schema.v7.yml`), not from Prisma. |
| **🔐 security/auth.types.ts**       | `Session`, `AuthFactor`, `ServiceAccountKey`, `User`                | `TokenType`, `AuthenticationType`, `AuthenticationMethod`            | Authentication context that works with RLS session initialization via `withRLS.ts`.                                                                                                                                                           |
| **🔐 security/compliance.types.ts** | `DataAccessRequest`, `DataErasureRequest`, `LegalHold`, `AuditRule` | `ComplianceEventType`, `DataClassification`, `RetentionPolicyStatus` | Privacy/compliance types with audit correlation for RBAC permission usage tracking.                                                                                                                                                           |

---

| **File**                              | **Depends on Prisma Tables**                                                     | **Depends on Prisma Enums**                                    | **Purpose / Context**                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| **💼 finance/money.types.ts**         | _(Used by all financial tables)_ `Invoice`, `Estimate`, `Payment`, `PayrollItem` | `CurrencyCode`                                                 | Lightweight money primitive with tenant-aware currency handling.  |
| **💼 finance/accounting.types.ts**    | `GLAccount`, `JournalEntry`, `JournalLine`, `Reconciliation`                     | `DebitCreditIndicator`, `GLAccountType`, `GLAccountCategory`   | Tenant-scoped accounting representation for ledgers and entries.  |
| **💼 finance/currency-rate.types.ts** | `CurrencyRate`                                                                   | `CurrencyRateType`, `CurrencyRateSource`, `CurrencyRateStatus` | Exchange rate data with tenant-specific rate overrides.           |
| **💼 finance/billing.types.ts**       | `Invoice`, `InvoiceLineItem`, `CreditMemo`, `Payment`, `Refund`                  | `BillingStatus`, `PaymentMethodType`, `PaymentStatus`          | Billing flows with RBAC-aware approval workflows and permissions. |

---

| **File**                               | **Depends on Prisma Tables**                                                            | **Depends on Prisma Enums**                                                               | **Purpose / Context**                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **🔄 workflow/status.types.ts**        | Applies to all stateful entities: `Estimate`, `Bid`, `Project`, `ApprovalRequest`, etc. | `EstimateStatus`, `BidStatus`, `ProjectStatus`, `ApprovalStatus`, `SubmittalStatus`, etc. | Status lifecycle with role-based state transition permissions.     |
| **🔄 workflow/revision.types.ts**      | `EstimateRevision`, `ProjectRevision`, `QuoteRevision`                                  | _(None)_                                                                                  | Version control with audit trails and permission-based access.     |
| **🔄 workflow/approval-flow.types.ts** | `ApprovalRule`, `ApprovalRequest`, `ApprovalDecision`                                   | `ApprovalDecisionStatus`, `ApprovalRequestStatus`, `ApprovalRuleScope`                    | RBAC-integrated approval workflows with role-based routing rules.  |
| **🔄 workflow/task.types.ts**          | `Task`, `TaskAssignment`, `TaskChecklistItem`, `TaskDependency`                         | `TaskPriority`, `TaskStatus`, `TaskType`                                                  | Task management with member-based assignments and scope filtering. |

---

| **File**                                       | **Depends on Prisma Tables**                                         | **Depends on Prisma Enums**                                       | **Purpose / Context**                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **🔗 integration/external-reference.types.ts** | `IntegrationMapping`, `IntegrationProvider`, `ExternalShareLink`     | _(None)_                                                          | Represents mapping references between internal entities and external systems (CRM, ERP, etc.). |
| **🔗 integration/webhook.types.ts**            | `Webhook`, `WebhookDelivery`, `WebhookEndpoint`, `WebhookEvent`      | `DeliveryStatus`, `DeliveryChannel`                               | Standardized representation for webhook payloads and delivery tracking.                        |
| **🔗 integration/api.types.ts**                | `ApiKey`, `ExternalApiRequest`, `IntegrationSecret`                  | `ApiKeyStatus`, `IntegrationType`, `ApiRateLimitTier`             | Common structure for external API interactions and credentials.                                |
| **🔗 integration/integration.types.ts**        | `IntegrationProvider`, `IntegrationConnection`, `IntegrationMapping` | `IntegrationStatus`, `IntegrationAuthType`, `IntegrationCategory` | Generic structure describing system-to-system integrations.                                    |

---

# ⚙️ **Cross-Layer Alignment Rules** _(Updated with RBAC Implementation Knowledge)_

| Area                      | Shared Type                                                                       | Connected Runtime Component                                                   | **RBAC Integration**                                           |
| ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **RLS**                   | `RLSContext` (`base/rls.types.ts`)                                                | `withRLS.ts` and middlewares (`rls-session.middleware.ts`)                    | Uses `rls.*` functions for tenant/role context verification    |
| **RBAC / Access Control** | `AccessProfile`, `PermissionGrant`, `RoleDefinition` (`security/access.types.ts`) | `rbac.ts`, `roles.ts`, `permissions.ts`, and `rbac-auth.middleware.ts`        | Integrates with auto-generated RBAC from `RBAC.schema.v7.yml`  |
| **Audit**                 | `AuditMetadata`, `AuditTrailEvent`                                                | `audit-log.middleware.ts` and `TenantAuditLog` table                          | Includes role-based action tracking and permission usage logs  |
| **Authentication**        | `AuthSession`                                                                     | `jwt-auth.middleware.ts`, `Session`, and `AuthFactor` tables                  | Session includes tenant/member/role context for RLS activation |
| **Finance / Totals**      | `CurrencyAmount`, `MoneySummary`, `TaxDetail`                                     | `totals.utils.ts`, `validation.utils.ts`, `EstimateService`, `InvoiceService` | All financial operations respect role-based access permissions |
| **Approvals**             | `ApprovalDecisionBase`, `ApprovalFlowDefinition`                                  | `ApprovalEngine`, `EstimateApproval`, `PurchaseOrderApproval`                 | Approval routing based on role hierarchy and assignment scopes |
| **Integration**           | `WebhookDelivery`, `ExternalReference`                                            | `webhook.middleware.ts`, `integration.utils.ts`                               | Integration access controlled by tenant-scoped API permissions |

---

# 🧠 **Implementation Notes for Copilot** _(Updated with RBAC System Knowledge)_

1. **Import enums** exclusively from `@prisma/client`.
   Do not redeclare any enums found in `schema.prisma`.
2. **Do not import Prisma Client** — only reference types, not runtime.
3. **RBAC Boundary Awareness**:
   - `withRLS.ts` and auto-generated RBAC files (`rbac.ts`, `roles.ts`, `permissions.ts`) live **outside** `shared/types/` and must not be modified.
   - `withRLS.ts` → uses `RLSContext` from `shared/types/base/rls.types.ts`.
   - RBAC layer → consumes types indirectly via `AccessProfile` and `PermissionGrant`.
4. **Database Function Alignment**:
   - All RLS-related types must assume `rls.*` function naming (`rls.tenant_id()`, `rls.is_admin()`)
   - Never reference `app.*` functions as they use the `rls.*` naming in the actual implementation
5. **Role System Integration**:
   - Role types must align with actual Prisma enum: `RoleType: SYSTEM | CUSTOM | INHERITED`
   - Assignment scopes must use: `AssignmentScope: GLOBAL | TENANT | PROJECT | DEPARTMENT | TEAM | RESOURCE`
   - Role codes come from `RBAC.schema.v7.yml`: `ADMIN`, `PROJECT_MANAGER`, `WORKER`, `DRIVER`, `VIEWER`
6. Use **`PascalCase`** for interface names and **`camelCase`** for properties.
7. Every type must include a **JSDoc comment** describing its source table and enum dependency.

---

# ✅ **Expected Outcome** _(RBAC-Aligned Implementation)_

- All transversal `.ts` files under `shared/types/` are implemented and compiled.
- Each type is explicitly tied to its **Prisma table(s)** and **enum(s)**.
- **RBAC System Compliance**:
  - All security types align with actual database functions (`rls.*` naming convention)
  - Role definitions match Prisma schema enums and `RBAC.schema.v7.yml` role codes
  - RLS context types support the verified `withRLS.ts` implementation
  - Permission types integrate with auto-generated RBAC components
- **No naming conflicts** with:
  - Auto-generated RBAC layer (`rbac.ts`, `roles.ts`, `permissions.ts`)
  - Runtime RLS implementation (`withRLS.ts`)
  - Database helper functions (`rls.*` schema functions)
- `shared/types` acts as a **schema-aligned SDK**, providing stable, reusable primitives that correctly represent the actual RBAC implementation.

# 🧩 **Action Plan for Aligning Shared Types with Prisma Schema** _(Updated with RBAC Knowledge)_

To ensure that the shared types in `Backend/src/shared/types/` are fully aligned with the Prisma schema and the actual RBAC implementation, we will follow this structured action plan:

## **Phase 1: RBAC-Aware Audit**

1. **Audit Existing Types with RBAC Context**
   - Review each file in `Backend/src/shared/types/` to identify discrepancies with the Prisma schema
   - **Critical**: Verify all security-related types match actual database functions (`rls.*` not `app.*`)
   - Document enum conflicts, especially `RoleType` and other RBAC-related enums
   - Validate that RLS types support the verified `withRLS.ts` implementation

## **Phase 2: Schema Alignment with RBAC Integration**

2. **Map Prisma Schema with RBAC Context**
   - Create comprehensive mapping of Prisma tables and enums to their corresponding shared types
   - **Ensure RBAC accuracy**: Map role hierarchy (User → Member → MemberRole → Role → RolePermission → Permission)
   - Verify assignment scopes align with actual enum values
   - Document integration points with auto-generated RBAC files

## **Phase 3: Implementation with RBAC Compliance**

3. **Refactor Shared Types with RBAC Alignment**
   - Update shared type files to align with both Prisma schema AND verified RBAC implementation
   - **Priority**: Fix enum conflicts by importing from `@prisma/client`
   - Ensure RLSContext types support actual database function naming
   - Remove redundant or conflicting type definitions that could break RBAC integration
   - Validate all security types work with enterprise-grade RBAC documentation patterns
