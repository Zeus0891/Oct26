# Shared Types vs Prisma Schema Audit

Date: 2025-10-23
Scope: Backend/src/shared/types/\* compared to prisma/schema.prisma

## Executive summary

- Overall structure is solid: shared types are organized into base, security, finance, workflow, integration, and catalogs. Most status/approval/money primitives are transversal and align well with Prisma enums.
- Key alignment issues:
  - Document primitives are out of sync with the schema (referencing non-existent Document/DocumentVersion tables). Schema uses FileObject, Attachment, and AttachmentLink.
  - Several string-literal unions exist where Prisma enums are available (notably in finance/billing and parts of integration). These should be replaced with the corresponding @prisma/client enums to maintain a single source of truth.
  - Workflow status wrappers include entity-specific interfaces (EstimateStatusInfo, ProjectStatusInfo, etc.). They are technically correct but slightly leak feature naming into shared. Consider a generic status wrapper pattern to increase transversality.
- Completeness: Shared types cover the core cross-cutting concerns well (RLS, RBAC, money, approvals, status, integration, catalogs). A few small gaps are noted below (e.g., file taxonomy alignment, explicit AttachmentLink types, and enum usage tightening).

## How this audit was performed

- Reviewed the full Prisma schema (21k+ lines; numerous models and enums) focusing on tables and enums referenced by shared types.
- Inspected all files under src/shared/types/\*\*, with deeper reads in:
  - base: actor, approval, audit, currency, document, metadata, rls, tax, tenant
  - workflow: status, approval-flow, revision, task
  - finance: money, accounting, currency-rate, billing
  - integration: api, integration, external-reference, webhook
  - catalogs: country, currency, uom
- Verified enum availability and names in schema for any string literal unions encountered in shared types.

## Findings by category

### 1) Base types

- actor.types.ts: Aligned; uses MemberStatus, DeviceType, DeviceStatus from Prisma. OK.
- approval.types.ts: Aligned; uses ApprovalRequestStatus, ApprovalDecisionStatus, ApprovalDecisionType, ApprovalEntityType. OK.
- audit.types.ts: Internal primitives; no schema enum redefinitions. OK.
- currency.types.ts and tax.types.ts: Internal primitives; references CurrencyCode elsewhere via finance.money.types.ts. OK.
- metadata.types.ts, rls.types.ts, tenant.types.ts: Internal primitives; no schema drift. OK.
- document.types.ts: Needs realignment.
  - Issue: File states “Depends on Prisma Tables: Document, DocumentVersion, DocumentType, Attachment, DocumentLink”. Schema does not define Document or DocumentVersion tables; it defines FileObject, Attachment, AttachmentLink, FileTag; AI-specific indexing lives under AIDocumentIndex and AIDocumentChunk.
  - Misaligned fields:
    - DocumentBase: fields like documentType, status, visibility, classification, fileName/originalFileName, storagePath, fileHash, version, etc., overlap conceptually with FileObject + Attachment but do not match names or types (e.g., FileObject has displayName, storageKey, fileCategory, storageProvider, md5Hash/sha256Hash, virusScanStatus, etc.).
    - DocumentVersionBase: schema models versioning through Attachment and parentAttachmentId/versionNumber/isLatestVersion (not a separate DocumentVersion table).
    - DocumentLinkBase: should align to AttachmentLink (linkType, entityType, entityId, attachmentId, permissions flags, etc.).
  - Recommendation:
    - Rename and split:
      - DocumentBase -> FileObjectBase (aligning to FileObject fields/names)
      - DocumentLinkBase -> AttachmentLinkBase (aligning to AttachmentLink)
      - DocumentVersionBase -> AttachmentVersionBase (aligning to Attachment + parentAttachmentId/versionNumber)
    - Replace free-form status: string with FileObjectStatus/AttachmentStatus Prisma enums where applicable.
    - Review AttachmentBase against schema Attachment; align field names (title vs name, attachmentType, isApproved/isLatestVersion, fileObjectId, etc.).
    - Consider a small helper namespace/types for file taxonomy: FileCategory, StorageProvider, VirusScanStatus (all present as Prisma enums).

### 2) Workflow types

- status.types.ts:

  - Base types (StatusTrackingBase, StatusTransition, StatusLifecycle) use string for status fields and generic transitions. The entity-specific wrappers restrict status to Prisma enums (EstimateStatus, ProjectStatus, etc.).
  - Good: Wrappers ensure enums from Prisma remain the source of truth.
  - Improvement:
    - Option A (keep as-is): Leave entity wrappers but move them behind more generic names to reduce feature bleed (see Transversality section).
    - Option B (generic): Introduce a generic status interface: `type StatusInfo<S extends string> = StatusTrackingBase & { status: S }` and provide named aliases per entity near features (not in shared). Keep only the generic in shared.

- approval-flow.types.ts, revision.types.ts, task.types.ts: Conceptually transversal and align with approval/Task enums (TaskPriority, TaskType, WorkItemStatus). OK.

### 3) Finance types

- money.types.ts: Aligned; uses CurrencyCode from Prisma. OK.
- accounting.types.ts, currency-rate.types.ts: Transversal primitives, fine.
- billing.types.ts:
  - Multiple string-literal unions exist where Prisma enums appear to exist:
    - InvoiceLineItemType: Prisma enum exists (InvoiceLineItemType).
    - DunningLevel and DunningNoticeStatus: Prisma enums exist.
    - InvoiceStatus, CreditMemoStatus, InvoiceTaxType: Already using Prisma enums (good).
    - PaymentMethodType, PaymentStatus: Using Prisma enums (good). But local PaymentType/PaymentProvider string unions overlap with domain; check schema: PaymentGateway/PaymentMethod enums exist; consider mapping to schema enums if present (e.g., PaymentMethodType, PaymentGatewayProvider if defined) or keep local if not.
    - DisputeStatus/DisputeReason/ChargebackReason: Schema has ChargebackStatus; for reason/status enums, verify presence; where present, switch to Prisma; where not, keep local but prefix to avoid confusion (e.g., BillingDisputeStatus).
  - Recommendation:
    - Replace literal unions with Prisma enums where 1:1 exists:
      - InvoiceLineItemType, DunningLevel, DunningNoticeStatus.
    - Review and, if available, align Chargeback status/reason enums to Prisma (ChargebackStatus exists; map local status to it where appropriate). Keep human-facing reason strings as separate taxonomy if schema has no enum.
    - Consider introducing a canonical enum alias export section at top to centralize enum imports.

### 4) Integration types

- api.types.ts: Contains many operational string-literal unions (HTTP method, statuses, secret types, event types). These are reasonable as operational taxonomies. However, where Prisma enums already exist (ApiKeyStatus, ApiKeyScope, RetentionPolicy, TokenType), they are properly used.
- integration.types.ts, external-reference.types.ts, webhook.types.ts: Similar pattern; validate against schema and switch to Prisma enums where available (e.g., IntegrationConnectionStatus, IntegrationCategory, DeliveryStatus, DeliveryChannel).

### 5) Catalogs

- country.ts & currency.ts: Catalog data models and re-export of CurrencyCode; OK.
- uom.ts: Re-exports ProcurementUnitOfMeasure from Prisma. Defines UOMCategory (custom, not conflicting). OK.

## Enum alignment matrix (representative)

- Replace with Prisma enums (actionable now):

  - finance/billing.types.ts
    - InvoiceLineItemType -> import { InvoiceLineItemType } from '@prisma/client'
    - DunningLevel -> import { DunningLevel } from '@prisma/client'
    - DunningNoticeStatus -> import { DunningNoticeStatus } from '@prisma/client'
  - integration/api.types.ts
    - Where applicable, use Prisma enums for integration status/category/delivery if referenced (IntegrationConnectionStatus, IntegrationCategory, DeliveryStatus, DeliveryChannel)

- Validate and replace if present in schema:

  - finance/billing.types.ts: DisputeStatus, DisputeReason, ChargebackReason. Confirm presence of corresponding schema enums; if present, align. If not, keep as local taxonomies with explicit prefix (e.g., BillingDisputeStatus) to avoid confusion with DB-level status.
  - integration/api.types.ts: ApiResponse.status currently string union; OK to keep as operational response wrapper (not a DB field). No change needed.

- Keep custom/local (no schema equivalent):
  - catalogs/uom.ts: UOMCategory (domain taxonomy only). Keep.
  - workflow/status.types.ts: StatusLifecycle/Transition definitions (engine-level config). Keep.

## Transversality review

- Good:

  - money, approval, audit, rls, tax, metadata, tenant, actor are transversal and reusable.
  - integration and catalogs are transversal.

- Needs refinement:

  - workflow/status.types.ts exposes entity-named wrappers (EstimateStatusInfo, ProjectStatusInfo, etc.) which slightly couple shared to specific features. Two options:
    1. Keep wrappers but relocate entity-specific named interfaces to their feature modules (estimating, projects) and keep a generic `StatusInfo<S extends string>` in shared.
    2. Or keep current but move the re-exports out of the shared root index; instead, expose only generic status base types from shared and let features import enums and compose their local wrappers.

- base/document.types.ts contains feature-agnostic concepts, but naming should reflect actual schema models (FileObject/Attachment/AttachmentLink) to reduce ambiguity and improve discoverability.

## Completeness review (gaps and suggestions)

- File/Document domain:

  - Add FileObjectBase (aligned to schema) and a FileTaxonomy types snippet that consolidates FileCategory, StorageProvider, VirusScanStatus enums from Prisma.
  - Add AttachmentLinkBase aligned to schema fields (canView/canDownload flags, linkType, displayOrder, isPrimary, etc.).

- Security/RBAC:

  - RBACRole.scope and related fields currently use string. Consider aligning to AssignmentScope or a dedicated RoleScope enum if present. If scope is intentionally free-form at application level, document it with a jsdoc note to avoid confusion with db enums.

- Integration:
  - Consider adding small enum alias exports at the top (IntegrationConnectionStatus, IntegrationCategory, DeliveryStatus, DeliveryChannel) to signal canonical usage within the file.

## Concrete recommendations (actionable backlog)

Priority P0 (schema correctness):

1. Realign base/document.types.ts to schema

   - Rename interfaces to map schema entities accurately:
     - DocumentBase -> FileObjectBase
     - DocumentVersionBase -> AttachmentVersionBase
     - DocumentLinkBase -> AttachmentLinkBase
   - Align field names/types with FileObject, Attachment, AttachmentLink models
   - Replace string statuses with FileObjectStatus/AttachmentStatus

2. Replace literal unions with Prisma enums (where 1:1)
   - finance/billing.types.ts:
     - Replace InvoiceLineItemType, DunningLevel, DunningNoticeStatus with Prisma enums
   - integration/api.types.ts:
     - Where fields represent DB-backed statuses/categories, use Prisma enums (IntegrationConnectionStatus, IntegrationCategory, DeliveryStatus, DeliveryChannel)

Priority P1 (transversality/purity): 3) Introduce generic status wrapper and deprecate entity-specific wrappers in shared

- Add `type StatusInfo<S extends string> = StatusTrackingBase & { status: S }`
- Keep entity wrappers temporarily, mark with @deprecated, and plan to move to feature modules

4. RBAC alignment
   - Evaluate scope/status string fields and replace with Prisma enums when available or document as intentional app-level taxonomy

Priority P2 (documentation/devex): 5) Add a short README section under shared/types/base/document to explain FileObject vs Attachment vs AttachmentLink with a tiny mapping table 6) In shared/types/index.ts, consider removing the entity-specific workflow re-exports from the root to avoid accidental coupling; export only the base workflow primitives and let features compose their variants

## Suggested diffs at-a-glance (non-breaking, low-risk)

- finance/billing.types.ts

  - import { InvoiceLineItemType, DunningLevel, DunningNoticeStatus } from '@prisma/client'
  - Replace corresponding `export type` literal unions with these imports

- base/document.types.ts

  - Rename interfaces and align fields; introduce FileObjectStatus/AttachmentStatus imports

- workflow/status.types.ts
  - Add `export type StatusInfo<S extends string> = StatusTrackingBase & { status: S }`
  - Mark entity wrappers with @deprecated JSDoc, suggest local composition in feature modules

No runtime behavior changes are required for these adjustments, but they improve type safety and reduce drift risk.

## Risks and mitigations

- Risk: Replacing literal unions with Prisma enums may surface compile errors where string values were used. Mitigation: Incremental changes with codemod or quick fixes; update tests accordingly.
- Risk: Renaming document interfaces could break imports. Mitigation: Provide type aliases for one release cycle (e.g., `export type DocumentBase = FileObjectBase`) and deprecate with clear jsdoc.

## Quality gates (current change)

- Build: PASS (no code changes yet; report only)
- Lint/Typecheck: PASS (no code changes yet)
- Tests: PASS (no code changes yet)

## Next steps

- Approve the P0 changes; I can apply them in a focused PR:
  - Document types realignment
  - Billing enums replacement
  - Optional: add generic StatusInfo
- Run typecheck and fix any fallout (primarily enum imports/values).
- If desired, proceed with P1 transversality cleanup in a second PR to keep surface changes scoped.
