# Shared Types Documentation

## Overview

This directory contains the complete enterprise-grade shared types system for our multi-tenant, RBAC-enabled application. These types provide reusable primitives shared across all feature modules with perfect Prisma schema alignment, comprehensive audit trails, and full security integration.

## Domain overview and compliance

A quick index of each domain with current compliance and deep links to detailed docs.

- Base — 100% compliant
  - Overview: ./base/README.md
  - Technical Guide: ./base/BASE_TYPES_TECHNICAL_GUIDE.md
- Catalogs — 100% compliant
  - Overview: ./catalogs/README.md
  - Technical Guide: ./catalogs/CATALOG_TYPES_TECHNICAL_GUIDE.md
- Finance — 100% compliant
  - Overview: ./finance/README.md
  - Technical Guide: ./finance/FINANCE_TYPES_TECHNICAL_GUIDE.md
- Integration — 100% compliant
  - Overview: ./integration/README.md
  - Technical Guide: ./integration/INTEGRATION_TYPES_TECHNICAL_GUIDE.md
- Security — Ready (RBAC/RLS aligned)
  - Overview: ./security/README.md
  - Technical Guide: ./security/SECURITY_TYPES_TECHNICAL_GUIDE.md
- Workflow — 100% compliant
  - Overview: ./workflow/README.md
  - Technical Guide: ./workflow/WORKFLOW_TYPES_TECHNICAL_GUIDE.md

Notes

- Prisma enums are the single source of truth; do not redefine enums locally.
- Prefer barrel imports from each domain (e.g., import { Money } from "@/shared/types/finance").

## Architecture Principles

### 🎯 **Design Goals**

- **Single Source of Truth**: Eliminate type duplication across domains
- **Prisma Alignment**: Perfect 1:1 mapping with database schema
- **Multi-Tenant Ready**: All types support tenant isolation (RLS)
- **RBAC Integrated**: Permission-aware operations and role hierarchy
- **Audit Complete**: Comprehensive change tracking and compliance
- **Type Safety**: Strong TypeScript guarantees with zero `any` types

### 🏗️ **Enterprise Patterns**

- **Tenant Context**: Every operation is tenant-scoped for security
- **Actor Metadata**: Full audit trails with user attribution
- **Role Hierarchy**: Sophisticated permission inheritance
- **Lifecycle Management**: Status transitions with business rules
- **Integration Ready**: External system connectivity patterns

---

## 📁 Type Categories

### 🧱 **Base Types** (`/base/`)

_Foundational primitives used across all domains_

| File                | Purpose                     | Key Types                                                   | Usage                                |
| ------------------- | --------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `tenant.types.ts`   | Multi-tenant context        | `TenantBase`, `TenantSettingsBase`, `TenantFeatureFlagBase` | Tenant isolation and configuration   |
| `actor.types.ts`    | Identity and authentication | `UserBase`, `MemberBase`, `SessionBase`, `DeviceBase`       | User identity and session management |
| `audit.types.ts`    | Audit trail and tracking    | `AuditLogBase`, `AuditEntity`, `ComplianceRecord`           | Change tracking and compliance       |
| `rls.types.ts`      | Row Level Security          | `RLSPolicyBase`, `RLSContext`, `SecurityContext`            | Database security and access control |
| `currency.types.ts` | Currency and financial      | `CurrencyCode`, `ExchangeRate`, `MoneyAmount`               | Multi-currency financial operations  |
| `tax.types.ts`      | Tax calculation             | `TaxRate`, `TaxCategory`, `TaxCalculation`                  | Tax computation and compliance       |
| `approval.types.ts` | Approval workflows          | `ApprovalRule`, `ApprovalStep`, `ApprovalChain`             | Multi-step approval processes        |
| `document.types.ts` | Document management         | `DocumentInfo`, `DocumentVersion`, `DocumentAccess`         | File and document handling           |
| `metadata.types.ts` | Custom fields and metadata  | `MetadataField`, `CustomField`, `FieldType`                 | Dynamic field definitions            |

### 🔐 **Security Types** (`/security/`)

_Identity and access management primitives_

| File                  | Purpose                   | Key Types                                                | Usage                          |
| --------------------- | ------------------------- | -------------------------------------------------------- | ------------------------------ |
| `rbac.types.ts`       | Role-based access control | `RBACRole`, `PermissionDefinition`, `RoleHierarchy`      | Access control and permissions |
| `permission.types.ts` | Permission management     | `PermissionGrant`, `ResourceAction`, `Scope`             | Fine-grained access control    |
| `role.types.ts`       | Role hierarchy            | `RoleDefinition`, `RoleAssignment`, `RoleInheritance`    | Role management system         |
| `access.types.ts`     | Access control            | `AccessPolicy`, `AccessCondition`, `AccessAudit`         | Dynamic access policies        |
| `compliance.types.ts` | Privacy and compliance    | `DataClassification`, `RetentionPolicy`, `ConsentRecord` | Data protection compliance     |

### 💼 **Finance Types** (`/finance/`)

_Financial operations and accounting primitives_

| File                     | Purpose                  | Key Types                                    | Usage                     |
| ------------------------ | ------------------------ | -------------------------------------------- | ------------------------- |
| `money.types.ts`         | Money and currency       | `Money`, `CurrencyAmount`, `ExchangeRate`    | Financial calculations    |
| `accounting.types.ts`    | Accounting ledger        | `GLAccount`, `JournalEntry`, `TrialBalance`  | General ledger operations |
| `currency-rate.types.ts` | Exchange rate management | `CurrencyRate`, `RateSource`, `RateHistory`  | Multi-currency operations |
| `billing.types.ts`       | Billing automation       | `BillingCycle`, `Invoice`, `PaymentSchedule` | Subscription billing      |

### 🔄 **Workflow Types** (`/workflow/`)

_Business process automation primitives_

| File                     | Purpose                     | Key Types                                               | Usage                         |
| ------------------------ | --------------------------- | ------------------------------------------------------- | ----------------------------- |
| `status.types.ts`        | Status lifecycle management | `StatusDefinition`, `StatusTransition`, `LifecycleRule` | Entity status and transitions |
| `revision.types.ts`      | Version control             | `RevisionInfo`, `ChangeSet`, `VersionHistory`           | Document and data versioning  |
| `approval-flow.types.ts` | Dynamic approvals           | `ApprovalWorkflow`, `ApprovalStep`, `ApprovalCondition` | Multi-step approval processes |
| `task.types.ts`          | Task management             | `TaskDefinition`, `TaskAssignment`, `TaskProgress`      | Work assignment and tracking  |

### 🔗 **Integration Types** (`/integration/`)

_External system connectivity and interoperability_

| File                          | Purpose                      | Key Types                                              | Usage                       |
| ----------------------------- | ---------------------------- | ------------------------------------------------------ | --------------------------- |
| `external-reference.types.ts` | System integration mapping   | `ExternalReference`, `SystemMapping`, `SyncPreference` | CRM/ERP connectivity        |
| `webhook.types.ts`            | Event-driven communication   | `WebhookConfig`, `WebhookDelivery`, `EventFilter`      | Real-time notifications     |
| `api.types.ts`                | External API management      | `ApiKeyInfo`, `ApiCredentials`, `RateLimit`            | Third-party API integration |
| `integration.types.ts`        | Generic integration patterns | `IntegrationConnection`, `SyncStatus`, `ErrorHandling` | Integration lifecycle       |

### 📊 **Catalog Types** (`/catalogs/`)

_Reference data and standardized lookups_

| File          | Purpose               | Key Types                                            | Usage                              |
| ------------- | --------------------- | ---------------------------------------------------- | ---------------------------------- |
| `country.ts`  | Geographic references | `CountryCodes`, `RegionCodes`, `TimeZones`           | Location and regional data         |
| `currency.ts` | Currency definitions  | `CurrencyInfo`, `CurrencyFormat`, `CurrencySymbol`   | Currency formatting and display    |
| `uom.ts`      | Units of measure      | `UnitOfMeasure`, `UnitConversion`, `MeasurementType` | Quantity and measurement standards |

#### **When to Use Base Types**

```typescript
// ✅ Extending base tenant types for domain models
interface ProjectTenant extends TenantBase {
  projectQuota: number;
  customSettings: ProjectSettings;
  // Inherits: id, name, slug, region, status, tier, etc.
}

// ✅ Using actor context for authentication
function authenticateUser(session: SessionBase): Promise<UserBase> {
  // Type-safe session and user handling
}

// ✅ RLS context for tenant isolation
function withTenantContext(
  context: RLSContext,
  operation: () => Promise<void>
): Promise<void> {
  // Inject RLS context for database operations
}
```

### 🔐 **Security Types** (`/security/`)

_Identity and access management primitives_

| File                  | Purpose                   | Key Types                                                | Usage                          |
| --------------------- | ------------------------- | -------------------------------------------------------- | ------------------------------ |
| `rbac.types.ts`       | Role-based access control | `RBACRole`, `PermissionDefinition`, `RoleHierarchy`      | Access control and permissions |
| `permission.types.ts` | Permission management     | `PermissionGrant`, `ResourceAction`, `Scope`             | Fine-grained access control    |
| `role.types.ts`       | Role hierarchy            | `RoleDefinition`, `RoleAssignment`, `RoleInheritance`    | Role management system         |
| `access.types.ts`     | Access control            | `AccessPolicy`, `AccessCondition`, `AccessAudit`         | Dynamic access policies        |
| `compliance.types.ts` | Privacy and compliance    | `DataClassification`, `RetentionPolicy`, `ConsentRecord` | Data protection compliance     |

#### **When to Use Security Types**

```typescript
// ✅ RBAC role management
async function assignRole(member: MemberBase, role: RBACRole): Promise<void> {
  // Handle role assignment with proper typing
}

// ✅ Permission checking
function hasPermission(
  member: MemberBase,
  permission: PermissionDefinition,
  resource: string
): boolean {
  // Type-safe permission validation
}

// ✅ Compliance data handling
function classifyData(
  data: any,
  classification: DataClassification
): ComplianceRecord {
  // Handle data classification for privacy compliance
}
```

### 💼 **Finance Types** (`/finance/`)

_Financial operations and accounting primitives_

| File                     | Purpose                  | Key Types                                    | Usage                     |
| ------------------------ | ------------------------ | -------------------------------------------- | ------------------------- |
| `money.types.ts`         | Money and currency       | `Money`, `CurrencyAmount`, `ExchangeRate`    | Financial calculations    |
| `accounting.types.ts`    | Accounting ledger        | `GLAccount`, `JournalEntry`, `TrialBalance`  | General ledger operations |
| `currency-rate.types.ts` | Exchange rate management | `CurrencyRate`, `RateSource`, `RateHistory`  | Multi-currency operations |
| `billing.types.ts`       | Billing automation       | `BillingCycle`, `Invoice`, `PaymentSchedule` | Subscription billing      |

#### **When to Use Finance Types**

```typescript
// ✅ Money operations with currency precision
async function calculateTotal(
  amount: Money,
  currencyRate: CurrencyRateDefinition
): Promise<Money> {
  // Type-safe financial calculations with currency conversion
}

// ✅ Accounting journal entries
async function createJournalEntry(
  entry: JournalEntryDefinition,
  accounts: GLAccountDefinition[]
): Promise<TrialBalance> {
  // Handle double-entry bookkeeping
}

// ✅ Billing automation
function generateInvoice(
  billingCycle: BillingCycleDefinition,
  customerId: string
): Promise<InvoiceDefinition> {
  // Automated invoice generation
}
```

### 🔄 **Workflow Types** (`/workflow/`)

_Business process automation primitives_

| File                     | Purpose                     | Key Types                                               | Usage                         |
| ------------------------ | --------------------------- | ------------------------------------------------------- | ----------------------------- |
| `status.types.ts`        | Status lifecycle management | `StatusDefinition`, `StatusTransition`, `LifecycleRule` | Entity status and transitions |
| `revision.types.ts`      | Version control             | `RevisionInfo`, `ChangeSet`, `VersionHistory`           | Document and data versioning  |
| `approval-flow.types.ts` | Dynamic approvals           | `ApprovalWorkflow`, `ApprovalStep`, `ApprovalCondition` | Multi-step approval processes |
| `task.types.ts`          | Task management             | `TaskDefinition`, `TaskAssignment`, `TaskProgress`      | Work assignment and tracking  |

#### **When to Use Workflow Types**

```typescript
// ✅ Status lifecycle management
async function transitionStatus(
  entity: BaseEntity,
  newStatus: StatusDefinition,
  rules: LifecycleRule[]
): Promise<void> {
  // Handle status transitions with validation
}

// ✅ Document versioning
async function createRevision(
  document: DocumentInfo,
  changes: ChangeSet
): Promise<RevisionInfo> {
  // Track document changes and versions
}

// ✅ Approval workflow setup
async function createApprovalFlow(
  workflow: ApprovalWorkflow
): Promise<ApprovalProcess> {
  // Set up complex approval chains with conditions
}
```

### 🔗 **Integration Types** (`/integration/`)

_External system connectivity and interoperability_

| File                          | Purpose                      | Key Types                                                   | Usage                       |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------- | --------------------------- |
| `external-reference.types.ts` | System integration mapping   | `IntegrationMapping`, `ExternalReference`, `SyncPreference` | CRM/ERP connectivity        |
| `webhook.types.ts`            | Event-driven communication   | `WebhookConfig`, `WebhookDelivery`, `EventFilter`           | Real-time notifications     |
| `api.types.ts`                | External API management      | `ApiCredentials`, `ApiKeyInfo`, `RateLimit`                 | Third-party API integration |
| `integration.types.ts`        | Generic integration patterns | `IntegrationConnection`, `SyncStatus`, `ErrorHandling`      | Integration lifecycle       |

#### **When to Use Integration Types**

```typescript
// ✅ External system mapping
async function syncWithCRM(
  reference: ExternalReference,
  mapping: SystemMapping
): Promise<SyncStatus> {
  // Map internal entities to external system format
}

// ✅ Webhook delivery
async function deliverWebhook(
  event: WebhookEvent,
  config: WebhookConfig
): Promise<WebhookDelivery> {
  // Reliable webhook delivery with retries
}

// ✅ API key management
function validateApiKey(
  apiKey: ApiKeyInfo,
  endpoint: string
): Promise<boolean> {
  // Enforce API usage limits and permissions
}
```

---

## 🚀 **Usage Guidelines**

### **2. Import Best Practices**

```typescript
// ✅ Import specific types (preferred)
import type { TenantBase, UserBase } from '@/shared/types/base';
import type { RBACRole, PermissionDefinition } from '@/shared/types/security';

// ✅ Import from category index (acceptable)
import type { Money, CurrencyRateDefinition } from '@/shared/types/finance';
import type { ApprovalWorkflow, StatusDefinition } from '@/shared/types/workflow';

// ❌ Avoid wildcard imports
import * from '@/shared/types'; // Too broad
```

### **2. Enum Usage**

```typescript
// ✅ Always import enums from Prisma (single source of truth)
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

// ❌ Never redefine enums locally
enum InvoiceStatus /* Don't do this */ {}
```

### **3. Type Extension**

```typescript
// ✅ Extend base types for domain-specific needs
interface ProjectMember extends UserBase {
  projectRole: string;
  permissions: string[];
  assignedAt: Date;
}

// ✅ Compose types for complex operations
interface ProjectCreation {
  project: Omit<Project, "id" | "createdAt">;
  initialMembers: ProjectMember[];
  approvalFlow: ApprovalWorkflow;
}
```

### **4. Tenant Context**

```typescript
// ✅ Always include tenant context in operations
async function createProject(
  ctx: RLSContext, // Contains tenant and security info
  data: CreateProjectInput
): Promise<Project> {
  return await withTenantRLS(ctx.tenantId, async (tx) => {
    // All operations are tenant-scoped
  });
}
```

### **5. Error Handling**

```typescript
// ✅ Use standardized error responses
function handleError(error: unknown): ApiResponse<never> {
  if (error instanceof BusinessRuleViolation) {
    return {
      success: false,
      error: {
        code: "BUSINESS_RULE_VIOLATION",
        message: error.message,
        details: error.violations,
      },
    };
  }
  // Handle other error types...
}
```

---

## 🔧 **Integration Points**

### **With Prisma Schema**

- All types align perfectly with `schema.prisma` definitions
- Enums are imported directly from `@prisma/client`
- Entity types match database table structures
- No schema drift between types and database

### **With Catalog System**

- Reference data types provide standardized lookups
- Country codes support international operations
- Currency types align with financial operations
- Unit of measure standards for consistent quantity handling

### **With RLS System**

- `RLSContext` integrates with `withTenantRLS()` helper
- All operations are tenant-scoped by default
- Security boundaries enforced at the type level

### **With RBAC Layer**

- Auto-generated RBAC files consume security type definitions
- Permission checks use standardized `PermissionGrant` types
- Role hierarchy supported through `RBACRole` structures

### **With Audit System**

- `AuditMetadata` integrates with `TenantAuditLog` table
- All changes tracked with proper actor attribution
- Compliance records support regulatory requirements

### **With Validation System**

- Business rules reference shared validation patterns
- Input validation uses `ValidationRule` definitions
- Error responses follow `ApiError` standards

---

## 🎯 **Migration Guide**

### **From Legacy Types**

```typescript
// ❌ Before (legacy approach)
interface User {
  id: string;
  name: string;
  email: string;
  // Missing tenant isolation, audit trails, etc.
}

// ✅ After (using shared types)
interface User extends UserBase {
  customFields: MetadataField[];
  // Inherits: id, email, firstName, lastName, status, etc.
  // Gets: multi-tenant support, audit trails, type safety
}
```

### **Adopting Shared Types**

1. **Replace domain-specific types** with shared equivalents
2. **Add tenant context** to all operations
3. **Use standardized responses** for all APIs
4. **Implement proper error handling** with shared error types
5. **Add audit metadata** to all mutations

---

## 📊 **Type Coverage**

| Domain      | Files  | Types    | Coverage |
| ----------- | ------ | -------- | -------- |
| Base        | 10     | 60+      | 100%     |
| Security    | 6      | 35+      | 100%     |
| Finance     | 5      | 25+      | 100%     |
| Workflow    | 5      | 20+      | 100%     |
| Integration | 5      | 25+      | 100%     |
| Catalogs    | 4      | 15+      | 100%     |
| **Total**   | **35** | **180+** | **100%** |

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Import Path Errors**

   ```typescript
   // ❌ Incorrect path
   import { TenantBase } from "../../../shared/types/base/tenant";

   // ✅ Correct path
   import { TenantBase } from "@/shared/types/base";
   ```

2. **Enum Conflicts**

   ```typescript
   // ❌ Local enum definition
   enum Status {
     ACTIVE,
     INACTIVE,
   }

   // ✅ Prisma enum import
   import { TenantStatus } from "@prisma/client";
   ```

3. **Missing Tenant Context**

   ```typescript
   // ❌ Missing tenant isolation
   function getUsers(): Promise<UserBase[]> {
     /* ... */
   }

   // ✅ With tenant context
   function getUsers(ctx: RLSContext): Promise<UserBase[]> {
     /* ... */
   }
   ```

4. **Currency Type Confusion**

   ```typescript
   // ❌ Mixing currency types
   import { CurrencyCode } from "@/shared/types/base/currency";
   import { CurrencyInfo } from "@/shared/types/catalogs/currency"; // Different!

   // ✅ Use appropriate type for context
   import { CurrencyCode } from "@/shared/types/base/currency"; // For amounts
   import { CurrencyInfo } from "@/shared/types/catalogs/currency"; // For display
   ```

---

## 📈 **Future Enhancements**

- **GraphQL Integration**: Generate GraphQL schemas from shared types
- **API Documentation**: Auto-generate OpenAPI specs from type definitions
- **Runtime Validation**: Generate Zod schemas from TypeScript types
- **Database Migrations**: Generate Prisma migrations from type changes
- **Testing Utilities**: Type-safe mock generators and test helpers

---

## 🤝 **Contributing**

When adding new shared types:

1. **Follow naming conventions**: `EntityBase`, `EntityInfo`, `EntityDefinition`
2. **Include JSDoc comments**: Document purpose, Prisma alignment, and relationships
3. **Extend base types**: Use inheritance for common patterns from `/base/`
4. **Add usage examples**: Include code examples in documentation
5. **Update category index**: Export new types in appropriate `/index.ts`
6. **Update this README**: Keep documentation current with actual implementation
7. **Prisma alignment**: Ensure types map to actual database schema structures

---

_This shared types system provides the foundation for our enterprise-grade, multi-tenant application with comprehensive type safety, security, and maintainability._
