# RLS (Row Level Security) Audit Report

**Date**: October 26, 2025  
**Schema Version**: Current Prisma Schema  
**Architecture Reference**: ERP_MODULE_STRUCTURE.md

## Executive Summary

This audit compares the current RLS implementation in the Prisma schema against the documented module structure to identify:

- Tables that currently have RLS enabled
- Tables that should have RLS based on their scope (Tenant/Hybrid)
- Missing RLS implementations
- Incorrectly configured RLS
- Global tables that should NOT have RLS

## RLS Configuration Analysis

### Current RLS Status (274+ tables with RLS enabled)

Based on Prisma schema comments, the following tables currently have RLS enabled:

#### ✅ CORRECTLY CONFIGURED - Tenant Scope Models

These models are correctly marked as "Tenant" scope in the module structure and have RLS enabled:

**AI Module (Tenant)**

- AIAction, AIActionRun, AIAssistantProfile, AIDocumentChunk, AIDocumentIndex
- AIEmbedding, AIInsight, AIInsightFeedback, AIJob, AIJobArtifact
- AIPlaybook, AIPlaybookStep, AIPromptTemplate

**Access Control Module (Tenant)**

- Member, MemberRole, MemberSettings, ApiKey, ServiceAccount, ServiceAccountKey
- Role, RolePermission, DelegationGrant, DelegationConstraint

**Identity Module (Tenant)**

- Session, AuthFactor, PasswordResetToken, UserDevice, IdentityProviderConnection

**CRM Module (Tenant)**

- AccountAddress, AccountInsurance, Lead, LeadActivity, Opportunity, OpportunityStage
- OpportunityLineItem, QuoteApproval, QuoteLineItem, Contract, TenantPriceList
- TenantPriceOverride, Activity, ActivityAttachment, CustomerSegment, Territory

**Estimating Module (Tenant)**

- EstimateRevision, EstimateLineItem, EstimateTax, EstimateDiscount, EstimateTerm
- EstimateAttachment, EstimateComment, EstimateHistoryEvent, EstimateApproval
- Bid, BidInvitation, BidSubmission, BidComparison

**Projects Module (Tenant)**

- ProjectPhase, WBSItem, ProjectTask, ProjectTaskAssignment, ProjectTaskAttachment
- ProjectTaskChecklistItem, ProjectTaskComment, ProjectTaskDependency, Schedule
- ScheduleException, RFI, RFIReply, Submittal, SubmittalItem, SubmittalApproval
- Inspection, InspectionItem, InspectionApproval, DailyLog, PunchList, PunchListItem
- ProjectFinancialSnapshot, ProjectBudgetLine, ProjectDocument, ProjectExternalAccess
- ProjectLocation, ProjectMember, ProjectNote, ProjectReport, ProjectIssue, ProjectRisk
- ProjectInventoryTransaction, Milestone, MilestoneDependency, MilestoneStakeholder
- ResourceAllocation, Location

**Tasks Module (Tenant)**

- Task, TaskAssignment, TaskAttachment, TaskChecklistItem, TaskDependency

**Change Orders Module (Tenant)**

- ChangeOrderLine, ChangeOrderApproval, ChangeOrderDocument

**Billing Module (Tenant)**

- InvoiceLineItem, InvoiceTax, InvoiceAttachment, PaymentSchedule, DunningNotice
- CreditMemoLine

**Payments Module (Tenant)**

- PaymentApplication, Refund, Chargeback, ChargebackEvidence, Payout
- BankAccount, BankStatementLine, Reconciliation, PaymentMethodToken, InvoicePayment

**Procurement Module (Tenant)**

- Vendor, VendorContact, VendorDocument, RequestForQuote, RFQLine, RFQResponse
- RFQResponseLine, PurchaseOrderLine, PurchaseOrderApproval, GoodsReceipt
- GoodsReceiptLine, APBillLine, BillApproval, BillPayment

**Inventory Module (Tenant)**

- InventoryItem, InventoryLocation, InventoryBin, InventoryTransaction
- InventoryAdjustment, InventoryReservation, InventoryCount, InventoryCountLine
- InventoryAttachment, Asset, AssetAssignment, AssetMaintenance, AssetDepreciation
- AssetDocument, AssetMeterReading

**Zero Loss Inventory Controls (Tenant)**

- DistributedLock, InventoryTransactionChain, LossInvestigation, LossInvestigationFinding
- ReturnReminder, ReturnReminderAttempt

**HR Workforce Module (Tenant)**

- Worker, Employment, Department, OrgUnit, CostCenter, Position, PositionAssignment
- PositionBudget, PayGroup, PayGroupAssignment, PayCalendar, HolidayCalendar
- TrainingEnrollment, Certification, CommissionRule, CompensationPlan
- CompensationComponent, PerformanceGoal, PerformanceReview, AbsenceBalance
- Leave, LeaveOfAbsence

**Time Payroll Module (Tenant)**

- Timesheet, TimesheetEntry, TimesheetApproval, ClockInClockOut, PayrollRun
- PayrollItem, PayrollTax, PayrollAdjustment, PayrollPayment, PayStatement
- OvertimeRule, Allowance, Deduction, Reimbursement

**Tenant Module (Tenant)**

- TenantSettings, TenantBillingAccount, TenantSubscription, TenantUsageRecord
- TenantMetrics, TenantFeatureFlag, NumberSequence, DocumentGroup, TermsTemplate
- ContractTemplate, EncryptionProfile, TenantEvent, EventProjection, EventSnapshot
- TenantAuditLog

And many more tenant-scoped models...

#### ✅ CORRECTLY CONFIGURED - Hybrid Scope Models

These models are marked as "Hybrid" scope and correctly have RLS enabled:

- Account, Contact, Quote, Estimate, Project, Invoice, CreditMemo, Payment
- APBill, PurchaseOrder, ChangeOrder, ExpenseReport, Expense

#### ⚠️ POTENTIALLY INCORRECT - Global Scope Models with RLS

These models are documented as "Global" scope but currently have RLS enabled in the schema:

**Should be reviewed - May not need RLS:**

- Grade (Global in HR module)
- Label (Global in Tenant module)
- Actor (Global in Tenant module)
- Permission (Global in Access Control module)
- IdentityProvider (Global in Identity module)
- PriceList, PriceListItem (Global in CRM module)
- PaymentTerm (Global in Billing module)
- NotificationTemplate (Global in Notifications module)
- Webhook, WebhookLog (Global in Notifications module)
- FileTag (Global in Document Management module)
- TaxRate, TaxJurisdiction, CurrencyRate (Global in Financial Ledger module)
- IntegrationProvider (Global in Integrations module)
- weather_providers (Global in Integrations module)
- All models in settingsCatalogs module (UnitOfMeasure, CostCode, etc.)

### Missing RLS Configuration

Based on the module structure, these models should have RLS but may be missing the configuration:

#### Models that should have RLS (Tenant/Hybrid scope) but are not in current RLS list:

**Need to verify in schema:**

- User (Global but has tenant relationships)
- Person, PersonName, PersonAddress, PersonContactMethod, PersonDocument (Global in HR but may need hybrid approach)

## Recommendations

### Immediate Actions Required

1. **Review Global Models with RLS**
   - Audit all Global-scoped models that currently have RLS enabled
   - Determine if they truly need tenant isolation or should be globally accessible
   - Remove RLS from pure Global catalog/reference models

2. **Add Missing RLS**
   - Verify that all Tenant and Hybrid scoped models have RLS enabled
   - Pay special attention to User model relationships

3. **Hybrid Model Strategy**
   - Ensure Hybrid models (Account, Contact, Quote, etc.) have proper RLS policies
   - These should allow cross-tenant visibility with proper business rules

### RLS Policy Categories

Based on the analysis, we need these RLS policy types:

#### 1. **Strict Tenant Isolation** (Most models)

```sql
-- Example policy for tenant-scoped models
CREATE POLICY tenant_isolation ON table_name
    FOR ALL
    USING (tenant_id = current_setting('request.jwt.claims')::json->>'tenant_id');
```

#### 2. **Hybrid Tenant Access** (Account, Contact, Quote, etc.)

```sql
-- Example policy for hybrid models
CREATE POLICY hybrid_access ON table_name
    FOR ALL
    USING (
        tenant_id = current_setting('request.jwt.claims')::json->>'tenant_id'
        OR
        is_public = true
        OR
        id IN (SELECT entity_id FROM shared_access WHERE tenant_id = current_setting('request.jwt.claims')::json->>'tenant_id')
    );
```

#### 3. **No RLS** (Global catalogs)

```sql
-- These tables should NOT have RLS enabled
-- Examples: UnitOfMeasure, Country, PaymentMethod, etc.
```

### Security Considerations

1. **System Context**: Ensure system operations can bypass RLS when needed
2. **Admin Access**: Consider super-admin policies for cross-tenant operations
3. **Reporting**: Analytics may need special cross-tenant access patterns
4. **Integrations**: External integrations may need system-level access

### Implementation Plan

1. **Phase 1**: Remove incorrect RLS from Global models
2. **Phase 2**: Add missing RLS to Tenant/Hybrid models
3. **Phase 3**: Implement proper policies for each category
4. **Phase 4**: Test with actual workloads and adjust policies

## Summary

- **Current**: ~274 models have RLS enabled
- **Correct**: Most tenant-scoped models are properly configured
- **Issues**: Several global models incorrectly have RLS
- **Missing**: Few models may be missing RLS configuration

**Priority**: Review and remove RLS from Global catalog models to improve performance and ensure proper data access patterns.
