# ERP Module Structure — Canonical Mapping (Prisma Schema)

This document maps every Prisma model in the ERP schema to its functional module, clarifies scope (Global, Tenant, Hybrid), highlights root/parent entities, and preserves clean module boundaries for enterprise governance, audit, and extensibility.

- Value-chain backbone: Estimate → Project → Invoice → Payment; Inventory → Transaction → AuditChain; Timesheet → Payroll → Compliance.
- Security backbone: Tenant isolation (RLS), immutable auditability, anti-fraud controls, approval workflows, and privacy governance.

---

## Module Relationships Overview

Visual overview of core module relationships in the value chain and supporting flows:

```
CRM → Estimating → Projects → Billing → Payments → Accounting
HRWorkforce → TimePayroll
Inventory ↔ Procurement ↔ Projects
```

---

## tenant

Strategic purpose: Platform-wide tenant lifecycle, configuration, numbering, and event/audit primitives. Provides consistent identity of tenants, numbering sequences, document grouping, and event sourcing building blocks. Feeds cross-module observability and governance without crossing business domains.

| Model                | Scope  | Parent | Description                                           |
| -------------------- | ------ | ------ | ----------------------------------------------------- |
| Tenant               | Global | ✅     | Platform tenant registry and lifecycle                |
| TenantSettings       | Tenant |        | Per-tenant configuration flags and options            |
| TenantBillingAccount | Tenant |        | Billing profile for subscription and invoicing        |
| TenantSubscription   | Tenant |        | Subscription plan, periods, and limits                |
| TenantUsageRecord    | Tenant |        | Usage metering for billing/quotas                     |
| TenantMetrics        | Tenant |        | Operational KPIs for tenant health                    |
| TenantFeatureFlag    | Tenant |        | Feature allocation and gradual rollout per tenant     |
| NumberSequence       | Tenant |        | Numbering sequences for business documents            |
| DocumentGroup        | Tenant |        | Logical grouping of documents and external references |
| TermsTemplate        | Tenant |        | Standardized terms used across documents              |
| ContractTemplate     | Tenant |        | Template library for contracts                        |
| EncryptionProfile    | Tenant |        | Cryptographic and key-handling profile per tenant     |
| TenantEvent          | Tenant |        | Event-sourcing primitive (domain events)              |
| EventProjection      | Tenant |        | Materialized projections for read models              |
| EventSnapshot        | Tenant |        | Snapshotting for time-travel and rebuilds             |
| TenantAuditLog       | Tenant |        | RLS-scoped audit log entries                          |
| Label                | Global |        | Global labels/tags catalog for cross-module use       |
| Actor                | Global |        | Normalized actor identity for audit attribution       |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## access-control

Strategic purpose: Tenant-scoped authorization — members, roles/permissions, delegated grants, API keys y service accounts. Implementa least-privilege y delegación con trazabilidad. La autenticación (login, sesiones, MFA, dispositivos, IdP) vive en el módulo Identity.

| Model                | Scope  | Parent | Description                                      |
| -------------------- | ------ | ------ | ------------------------------------------------ |
| Member               | Tenant | ✅     | Tenant-scoped profile linking a User to a tenant |
| MemberSettings       | Tenant |        | Per-member preferences/settings                  |
| MemberRole           | Tenant |        | Role assignment for a member                     |
| ApiKey               | Tenant |        | Programmatic access keys                         |
| ServiceAccount       | Tenant |        | Non-human principal for automation               |
| ServiceAccountKey    | Tenant |        | Keys for service accounts                        |
| Permission           | Global |        | Global permission registry                       |
| Role                 | Tenant |        | Tenant-defined role bundles                      |
| RolePermission       | Tenant |        | Role→Permission mapping                          |
| DelegationGrant      | Tenant |        | Delegated access grants with scope/limits        |
| DelegationConstraint | Tenant |        | Constraints applied to delegated grants          |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## identity

Strategic purpose: Autenticación e identidad del usuario — login, refresh, logout, sesiones, MFA (TOTP/WebAuthn/códigos), dispositivos de confianza y federación con proveedores de identidad (SAML/OIDC). Entrega claims y sesiones consumidas por Access-Control para autorización.

| Model                      | Scope  | Parent | Description                                      |
| -------------------------- | ------ | ------ | ------------------------------------------------ |
| User                       | Global | ✅     | Global user identity (IdP, email)                |
| Session                    | Tenant |        | Authenticated tenant session with device context |
| AuthFactor                 | Tenant |        | MFA factors and verifications                    |
| PasswordResetToken         | Tenant |        | Secure reset tokens and flows                    |
| UserDevice                 | Tenant |        | Registered devices and trust signals             |
| IdentityProvider           | Global |        | External IdP registry                            |
| IdentityProviderConnection | Tenant |        | Tenant-level IdP configuration                   |

---

Dependencies: Provides sessions/claims to Access-Control; uses Tenant for RLS context.

## crm

Strategic purpose: Client relationships, pricing, pipeline, and contracts. Connects to Estimating (quotes), Projects (delivery), Billing (contracts), and Support (activities). Enables revenue lifecycle traceability from lead to contract.

| Model               | Scope  | Parent | Description                                   |
| ------------------- | ------ | ------ | --------------------------------------------- |
| Account             | Hybrid | ✅     | Core customer entity across tenants           |
| AccountAddress      | Tenant |        | Addresses associated to an account            |
| AccountInsurance    | Tenant |        | Insurance and compliance docs for accounts    |
| Contact             | Hybrid | ✅     | Contact person for accounts and opportunities |
| Lead                | Tenant | ✅     | Pre-opportunity pipeline lead                 |
| LeadActivity        | Tenant |        | Activities linked to leads                    |
| Opportunity         | Tenant | ✅     | Active sales opportunity                      |
| OpportunityStage    | Tenant |        | Stage progression for opportunities           |
| OpportunityLineItem | Tenant |        | Line items quoted in opportunity              |
| Quote               | Hybrid | ✅     | Commercial quote proposal                     |
| QuoteApproval       | Tenant |        | Approvals associated to quote issuance        |
| QuoteLineItem       | Tenant |        | Itemized lines for quotes                     |
| Contract            | Tenant | ✅     | Executed agreement with commercial terms      |
| PriceList           | Global | ✅     | Global price list registry                    |
| PriceListItem       | Global |        | Items/prices in global lists                  |
| TenantPriceList     | Tenant |        | Tenant-scoped price list reference            |
| TenantPriceOverride | Tenant |        | Overrides to global prices per tenant         |
| Activity            | Tenant |        | CRM activity (call, email, meeting)           |
| ActivityAttachment  | Tenant |        | Files linked to activities                    |
| CustomerSegment     | Tenant |        | Segmentation for targeting and reporting      |
| Territory           | Tenant |        | Sales territory boundaries                    |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## estimating

Strategic purpose: Structured estimates, revisions, approvals, and bid management. Feeds Projects upon conversion with preserved lineage to support 1:1:1 financial integrity.

| Model                | Scope  | Parent | Description                             |
| -------------------- | ------ | ------ | --------------------------------------- |
| Estimate             | Hybrid | ✅     | Commercial estimate with client context |
| EstimateRevision     | Tenant |        | Versioned revisions of an estimate      |
| EstimateLineItem     | Tenant |        | Itemized scope and cost lines           |
| EstimateTax          | Tenant |        | Tax components on estimates             |
| EstimateDiscount     | Tenant |        | Discount components on estimates        |
| EstimateTerm         | Tenant |        | Terms applied to estimate               |
| EstimateAttachment   | Tenant |        | Files linked to estimates               |
| EstimateComment      | Tenant |        | Internal/external comments              |
| EstimateHistoryEvent | Tenant |        | Immutable history of estimate changes   |
| EstimateApproval     | Tenant |        | Approval requests for estimates         |
| Bid                  | Tenant | ✅     | Bid package aggregation                 |
| BidInvitation        | Tenant |        | Invitations sent to vendors/subs        |
| BidSubmission        | Tenant |        | Vendor/submission artifacts             |
| BidComparison        | Tenant |        | Side-by-side bid analysis               |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## projects

Strategic purpose: Project execution core with tasks, RFIs, submittals, inspections, and operational traceability. Integrates with Estimating (conversion), Procurement (materials), Time/Payroll, and Inventory.

| Model                       | Scope  | Parent | Description                                      |
| --------------------------- | ------ | ------ | ------------------------------------------------ |
| Project                     | Hybrid | ✅     | Core execution entity and financial spine        |
| ProjectPhase                | Tenant |        | Phases/stages within a project                   |
| WBSItem                     | Tenant |        | Work breakdown structure elements                |
| ProjectTask                 | Tenant |        | Executable unit of work                          |
| ProjectTaskAssignment       | Tenant |        | Assignees to project tasks                       |
| ProjectTaskAttachment       | Tenant |        | Files linked to project tasks                    |
| ProjectTaskChecklistItem    | Tenant |        | Checklist items per task                         |
| ProjectTaskComment          | Tenant |        | Comments on tasks                                |
| ProjectTaskDependency       | Tenant |        | Predecessor/successor relationships              |
| Schedule                    | Tenant |        | Project schedule and dates                       |
| ScheduleException           | Tenant |        | Holidays/blackout exceptions                     |
| RFI                         | Tenant |        | Request for Information                          |
| RFIReply                    | Tenant |        | Official reply to RFI                            |
| Submittal                   | Tenant |        | Submittal package and specs                      |
| SubmittalItem               | Tenant |        | Itemized components in a submittal               |
| SubmittalApproval           | Tenant |        | Approval records for submittals                  |
| Inspection                  | Tenant |        | Inspection event and results                     |
| InspectionItem              | Tenant |        | Items inspected                                  |
| InspectionApproval          | Tenant |        | Approvals for inspection outcomes                |
| DailyLog                    | Tenant |        | Daily site log of activities                     |
| PunchList                   | Tenant |        | Punch list for completion                        |
| PunchListItem               | Tenant |        | Items in a punch list                            |
| ProjectFinancialSnapshot    | Tenant |        | Snapshot of project financials                   |
| ProjectBudgetLine           | Tenant |        | Budget lines allocated to project                |
| ProjectDocument             | Tenant |        | Documents attached to project                    |
| ProjectExternalAccess       | Tenant |        | External access controls for project             |
| ProjectLocation             | Tenant |        | Jobsite/location metadata                        |
| ProjectMember               | Tenant |        | Members participating in project                 |
| ProjectNote                 | Tenant |        | Notes and narrative entries                      |
| ProjectReport               | Tenant |        | Operational and executive reports                |
| ProjectIssue                | Tenant |        | Project issues and risks captured                |
| ProjectRisk                 | Tenant |        | Risk register entries                            |
| ProjectInventoryTransaction | Tenant |        | Inventory transactions tied to project           |
| Milestone                   | Tenant |        | Major delivery milestones                        |
| MilestoneDependency         | Tenant |        | Dependencies between milestones                  |
| MilestoneStakeholder        | Tenant |        | Stakeholders tied to milestones                  |
| ResourceAllocation          | Tenant |        | Allocation of resources/time                     |
| Location                    | Tenant |        | Project-level locations/areas                    |
| ProjectType                 | Global |        | Controlled vocabulary for project classification |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## tasks

Strategic purpose: Ad-hoc work tracking outside project lineage. Provides lightweight tasking for back-office and internal ops, with clean separation from project WBS.

| Model             | Scope  | Parent | Description                           |
| ----------------- | ------ | ------ | ------------------------------------- |
| Task              | Tenant | ✅     | Standalone task outside project scope |
| TaskAssignment    | Tenant |        | Person(s) assigned to a task          |
| TaskAttachment    | Tenant |        | Files linked to tasks                 |
| TaskChecklistItem | Tenant |        | Checklist items per task              |
| TaskDependency    | Tenant |        | Blocking relationships across tasks   |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## changeOrders

Strategic purpose: Scope control with immutable delta tracking, approvals, and traceability back to Estimate/Project/Invoice.

| Model               | Scope  | Parent | Description                                  |
| ------------------- | ------ | ------ | -------------------------------------------- |
| ChangeOrder         | Hybrid | ✅     | Change request affecting scope/schedule/cost |
| ChangeOrderLine     | Tenant |        | Itemized change components                   |
| ChangeOrderApproval | Tenant |        | Approval records for change orders           |
| ChangeOrderDocument | Tenant |        | Documents attached to change orders          |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## billing

Strategic purpose: Invoice lifecycle, taxes, schedules, and dunning. Connects Projects and Change Orders to receivables and cash application.

| Model             | Scope  | Parent | Description                        |
| ----------------- | ------ | ------ | ---------------------------------- |
| Invoice           | Hybrid | ✅     | Customer invoice and balances      |
| InvoiceLineItem   | Tenant |        | Itemized invoice charges           |
| InvoiceTax        | Tenant |        | Tax lines on invoices              |
| InvoiceAttachment | Tenant |        | Files attached to invoices         |
| PaymentSchedule   | Tenant |        | Payment schedule and milestones    |
| DunningNotice     | Tenant |        | Dunning communications for overdue |
| CreditMemo        | Hybrid | ✅     | Credit issued against invoices     |
| CreditMemoLine    | Tenant |        | Itemized credit memo lines         |
| PaymentTerm       | Global |        | Standard payment terms catalog     |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## payments

Strategic purpose: Cash application, refunds, chargebacks, payouts, reconciliation, and methods/tokens. Ties to Billing via allocations and to Ledger via reconciliation.

| Model              | Scope  | Parent | Description                               |
| ------------------ | ------ | ------ | ----------------------------------------- |
| Payment            | Hybrid | ✅     | Cash receipt or payout transaction        |
| PaymentApplication | Tenant |        | Allocation of payment to invoices         |
| Refund             | Tenant |        | Refund processing                         |
| Chargeback         | Tenant |        | Chargeback case management                |
| ChargebackEvidence | Tenant |        | Evidence submitted for chargeback dispute |
| Payout             | Tenant |        | Outbound payment to vendors/workers       |
| BankAccount        | Tenant |        | Bank accounts under management            |
| BankStatementLine  | Tenant |        | Imported statement lines for matching     |
| Reconciliation     | Tenant |        | Bank reconciliation sessions              |
| PaymentMethodToken | Tenant |        | Tokenized customer payment method         |
| InvoicePayment     | Tenant |        | Join/record linking invoice to payment    |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## procurement

Strategic purpose: Vendor sourcing, RFQs, POs, receipts, AP bills, and approvals. Integrates with Inventory for receiving and with Payments for disbursements.

| Model                 | Scope  | Parent | Description                   |
| --------------------- | ------ | ------ | ----------------------------- |
| Vendor                | Tenant | ✅     | Vendor entity and profile     |
| VendorContact         | Tenant |        | Contacts at vendor            |
| VendorDocument        | Tenant |        | Documents attached to vendors |
| RequestForQuote       | Tenant | ✅     | RFQ header for sourcing       |
| RFQLine               | Tenant |        | Lines requested in RFQ        |
| RFQResponse           | Tenant |        | Vendor response header        |
| RFQResponseLine       | Tenant |        | Vendor response lines/prices  |
| PurchaseOrder         | Hybrid | ✅     | PO issued to vendor           |
| PurchaseOrderLine     | Tenant |        | Itemized PO lines             |
| PurchaseOrderApproval | Tenant |        | Approval records for POs      |
| GoodsReceipt          | Tenant |        | Receipt of goods against PO   |
| GoodsReceiptLine      | Tenant |        | Itemized received goods       |
| APBill                | Hybrid | ✅     | Accounts payable bill         |
| APBillLine            | Tenant |        | Itemized lines on AP bill     |
| BillApproval          | Tenant |        | Approval records for AP bills |
| BillPayment           | Tenant |        | Payment records for bills     |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## inventory

Strategic purpose: Items, locations/bins, transactions, counts, reservations, and asset lifecycle. Ensures operational control and reconciles to Projects and Procurement.

| Model                | Scope  | Parent | Description                                   |
| -------------------- | ------ | ------ | --------------------------------------------- |
| InventoryItem        | Tenant | ✅     | Stock item under custody                      |
| InventoryLocation    | Tenant | ✅     | Storage location (site/warehouse)             |
| InventoryBin         | Tenant |        | Sub-location/bin for storage                  |
| InventoryTransaction | Tenant |        | Movement of inventory among parties/locations |
| InventoryAdjustment  | Tenant |        | Adjustments for shrinkage/corrections         |
| InventoryReservation | Tenant |        | Reserve items for future operations           |
| InventoryCount       | Tenant |        | Cycle/physical count session                  |
| InventoryCountLine   | Tenant |        | Line items in a count                         |
| InventoryAttachment  | Tenant |        | Files linked to inventory records             |
| Asset                | Tenant | ✅     | Capital asset under management                |
| AssetAssignment      | Tenant |        | Assignment of assets to workers/locations     |
| AssetMaintenance     | Tenant |        | Maintenance plans/work orders                 |
| AssetDepreciation    | Tenant |        | Depreciation schedules/entries                |
| AssetDocument        | Tenant |        | Documents linked to assets                    |
| AssetMeterReading    | Tenant |        | Meter/usage readings                          |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## zeroLossInventoryControls

Strategic purpose: Fraud-resistant custody chain and tamper-evident trails to prevent loss. Enforces dual signatures and provides investigation/return mechanisms.

| Model                     | Scope  | Parent | Description                                    |
| ------------------------- | ------ | ------ | ---------------------------------------------- |
| DistributedLock           | Tenant | ✅     | Concurrency lock with TTL enforcement          |
| InventoryTransactionChain | Tenant | ✅     | Tamper-evident chain of inventory transactions |
| LossInvestigation         | Tenant | ✅     | Formal investigation of suspected loss         |
| LossInvestigationFinding  | Tenant |        | Findings recorded for investigation            |
| ReturnReminder            | Tenant |        | Automated reminder for returns                 |
| ReturnReminderAttempt     | Tenant |        | Attempts to deliver reminders                  |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## hrWorkforce

Strategic purpose: People registry, worker lifecycle, organization, compensation, benefits, and performance. Feeds Time/Payroll and Projects for workforce planning.

| Model                 | Scope  | Parent | Description                          |
| --------------------- | ------ | ------ | ------------------------------------ |
| Person                | Global | ✅     | Global people registry               |
| PersonName            | Global |        | Person names over time               |
| PersonAddress         | Global |        | Postal addresses                     |
| PersonContactMethod   | Global |        | Email/phone/contact methods          |
| PersonDocument        | Global |        | Identity/employment docs             |
| Worker                | Tenant | ✅     | Worker profile within a tenant       |
| Employment            | Tenant |        | Employment relationships             |
| Department            | Tenant |        | Department within org                |
| OrgUnit               | Tenant |        | Organizational hierarchy             |
| CostCenter            | Tenant |        | Financial cost center                |
| Position              | Tenant | ✅     | Job position slot                    |
| PositionAssignment    | Tenant |        | Assignment of worker to position     |
| PositionBudget        | Tenant |        | Budget allocated for position        |
| Grade                 | Global |        | Job level/grade catalog              |
| PayGroup              | Tenant |        | Payroll group configuration          |
| PayGroupAssignment    | Tenant |        | Worker assignment to pay group       |
| PayCalendar           | Tenant |        | Pay periods and calendars            |
| HolidayCalendar       | Tenant |        | Holiday schedules                    |
| TrainingEnrollment    | Tenant |        | Worker training enrollment           |
| Certification         | Tenant |        | Worker certifications                |
| CommissionRule        | Tenant |        | Commission policy definitions        |
| CompensationPlan      | Tenant |        | Plan grouping for compensation       |
| CompensationComponent | Tenant |        | Components (base, bonus, commission) |
| PerformanceGoal       | Tenant |        | Performance goals set                |
| PerformanceReview     | Tenant |        | Review cycles and outcomes           |
| AbsenceBalance        | Tenant |        | Accrued balances                     |
| Leave                 | Tenant |        | Leave requests                       |
| LeaveOfAbsence        | Tenant |        | Extended leave management            |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## timePayroll

Strategic purpose: Time capture to payroll execution with approvals and compliance. Integrates with Projects (allocations) and HR (employment).

| Model             | Scope  | Parent | Description                           |
| ----------------- | ------ | ------ | ------------------------------------- |
| Timesheet         | Tenant | ✅     | Timesheet header per worker/timeframe |
| TimesheetEntry    | Tenant |        | Itemized time entries                 |
| TimesheetApproval | Tenant |        | Approval gate on timesheets           |
| ClockInClockOut   | Tenant |        | Clock punches for attendance          |
| PayrollRun        | Tenant | ✅     | Payroll processing run                |
| PayrollItem       | Tenant |        | Items calculated in payroll           |
| PayrollTax        | Tenant |        | Tax withholdings                      |
| PayrollAdjustment | Tenant |        | Adjustments (manual/auto)             |
| PayrollPayment    | Tenant |        | Payments executed in payroll          |
| PayStatement      | Tenant |        | Pay stub records                      |
| OvertimeRule      | Tenant |        | Overtime policy setup                 |
| Allowance         | Tenant |        | Allowances awarded                    |
| Deduction         | Tenant |        | Deductions applied                    |
| Reimbursement     | Tenant |        | Expense reimbursements via payroll    |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## approvals

Strategic purpose: Uniform approval engine across modules (estimates, POs, bills, submittals, time). Supports separation of duties and anti-fraud policies.

| Model            | Scope  | Parent | Description                        |
| ---------------- | ------ | ------ | ---------------------------------- |
| ApprovalRule     | Tenant | ✅     | Rule definition for approvals      |
| ApprovalRequest  | Tenant |        | Approval instance raised           |
| ApprovalDecision | Tenant |        | Decision artifact (approve/reject) |
| ReasonCode       | Tenant |        | Standard reasons for decisions     |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## fraudShield

Strategic purpose: Policy-driven anomaly detection with escalation and delegated permissions. Integrates with Approvals and Audit for traceability and control.

| Model                | Scope  | Parent | Description                     |
| -------------------- | ------ | ------ | ------------------------------- |
| FraudPolicy          | Tenant | ✅     | Fraud/anomaly policy definition |
| FraudPolicyRule      | Tenant |        | Rules composing a policy        |
| FraudPolicyScope     | Tenant |        | Scope/targets for a policy      |
| AnomalySignal        | Tenant | ✅     | Detected anomaly signal         |
| AnomalySignalFeature | Tenant |        | Contributing features/metrics   |
| AnomalyCase          | Tenant | ✅     | Case management for anomalies   |
| AnomalyCaseAction    | Tenant |        | Actions taken in a case         |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## messaging

Strategic purpose: Internal communications, channels, direct messages, attachments, and read receipts. Separate from Notifications to preserve domain boundaries.

| Model             | Scope  | Parent | Description                    |
| ----------------- | ------ | ------ | ------------------------------ |
| Channel           | Tenant | ✅     | Group channel for messaging    |
| ChannelMember     | Tenant |        | Memberships in channels        |
| Message           | Tenant |        | Message content in channels    |
| MessageAttachment | Tenant |        | Attachments linked to messages |
| MessageRead       | Tenant |        | Read receipts per user/message |
| DirectChat        | Tenant | ✅     | 1:1 or small group direct chat |
| DirectMessage     | Tenant |        | Messages in direct chat        |
| DirectMessageRead | Tenant |        | Read receipts for DMs          |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## notifications

Strategic purpose: In-app and external notifications, templates, delivery pipeline, and outbound webhooks. Supports reliable outbox patterns and audit trails.

| Model                  | Scope  | Parent | Description                        |
| ---------------------- | ------ | ------ | ---------------------------------- |
| Notification           | Tenant | ✅     | In-app notification record         |
| NotificationPreference | Tenant |        | User preferences for notifications |
| NotificationTemplate   | Global |        | Global template registry           |
| InAppAnnouncement      | Tenant |        | Broadcast announcements            |
| EmailTemplate          | Tenant |        | Tenant-level email templates       |
| Webhook                | Global | ✅     | Registered webhook                 |
| WebhookEvent           | Tenant |        | Events raised for webhook delivery |
| WebhookEndpoint        | Tenant |        | Tenant-configured endpoint targets |
| WebhookDelivery        | Tenant |        | Delivery attempts and results      |
| WebhookLog             | Global |        | Logs of webhook activity           |
| OutboxMessage          | Tenant |        | Outbox pattern message record      |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## documentManagement

Strategic purpose: File storage objects and generic attachment/linking. Supports all modules with consistent classification and retention tagging.

| Model          | Scope  | Parent | Description                                |
| -------------- | ------ | ------ | ------------------------------------------ |
| FileObject     | Tenant | ✅     | Stored binary/file metadata                |
| Attachment     | Tenant |        | Attachment wrapper reusable across modules |
| MemberDocument | Tenant |        | Documents attached to a member             |
| AttachmentLink | Tenant |        | Polymorphic link to domain entities        |
| FileTag        | Global |        | Tagging taxonomy for files                 |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## eSignature

Strategic purpose: Digital agreement flows with envelopes, recipients, sessions, intents, events, and artifacts. Integrates with CRM (contracts), Procurement (POs), and Projects.

| Model               | Scope  | Parent | Description                                  |
| ------------------- | ------ | ------ | -------------------------------------------- |
| ESignatureEnvelope  | Tenant | ✅     | Envelope containing documents and recipients |
| ESignatureRecipient | Tenant |        | Recipients in an envelope                    |
| SignatureSession    | Tenant | ✅     | Session where signature occurs               |
| SignatureIntent     | Tenant |        | Intent to sign declarations                  |
| SignatureEvent      | Tenant |        | Events during signature lifecycle            |
| SignatureArtifact   | Tenant |        | Artifacts (certificates, hashes)             |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## analytics

Strategic purpose: Operational analytics, KPIs, dashboards, exports, and snapshot cubes for stable analytical querying separate from OLTP workloads.

| Model                 | Scope  | Parent | Description                    |
| --------------------- | ------ | ------ | ------------------------------ |
| MetricSnapshot        | Tenant | ✅     | Periodic metric snapshots      |
| KPIAggregate          | Tenant |        | Aggregated KPI measures        |
| ReportDefinition      | Tenant | ✅     | Report definitions and layouts |
| DashboardDefinition   | Tenant | ✅     | Dashboard configurations       |
| SnapshotCube          | Tenant | ✅     | Snapshot cube for analytics    |
| SnapshotCubePartition | Tenant |        | Partitions of snapshot cubes   |
| ExportJob             | Tenant | ✅     | Export job orchestration       |
| ExportArtifact        | Tenant |        | Generated export files         |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## profitabilityForecasting

Strategic purpose: Project ledger entries, forecasting snapshots, assumptions, and what-if scenario planning. Drives margin insights and forward-looking decisions.

| Model              | Scope  | Parent | Description                      |
| ------------------ | ------ | ------ | -------------------------------- |
| ProjectLedgerEntry | Tenant | ✅     | Ledger entries tied to projects  |
| ForecastSnapshot   | Tenant | ✅     | Forecast snapshot header         |
| ForecastLine       | Tenant |        | Lines within a forecast snapshot |
| ScenarioPlan       | Tenant | ✅     | Scenario planning header         |
| ScenarioAssumption | Tenant |        | Assumptions used in scenarios    |
| ScenarioWhatIfRun  | Tenant |        | Executed what-if simulations     |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## scheduleIntelligence

Strategic purpose: Predictive schedule risk modeling and mitigation, informed by project/task data and external signals.

| Model            | Scope  | Parent | Description                      |
| ---------------- | ------ | ------ | -------------------------------- |
| ScheduleRisk     | Tenant | ✅     | Risk models applied to schedules |
| RiskFactor       | Tenant |        | Underlying risk factor catalog   |
| MitigationAction | Tenant |        | Action plans to reduce risk      |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## financialLedgerTax

Strategic purpose: Core accounting objects for GL, journals, and tax registries. Provides financial system of record for postings and reporting.

| Model           | Scope  | Parent | Description              |
| --------------- | ------ | ------ | ------------------------ |
| GLAccount       | Tenant | ✅     | Chart of accounts        |
| JournalEntry    | Tenant | ✅     | Journal entry header     |
| JournalLine     | Tenant |        | Lines for journal entry  |
| TaxRate         | Global |        | Tax rates registry       |
| TaxJurisdiction | Global |        | Jurisdiction definitions |
| CurrencyRate    | Global |        | Currency FX rates        |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## integrations

Strategic purpose: External connectors, secrets, mappings, sync jobs/logs, and specialized data providers (e.g., weather). Ensures clean boundaries and secure connectivity.

| Model                    | Scope  | Parent | Description                         |
| ------------------------ | ------ | ------ | ----------------------------------- |
| IntegrationProvider      | Global | ✅     | Registry of external providers      |
| IntegrationConnector     | Tenant | ✅     | Connector instance configuration    |
| IntegrationConnection    | Tenant |        | Live connection metadata            |
| IntegrationSecret        | Tenant |        | Encrypted credentials/secrets       |
| IntegrationMapping       | Tenant |        | Field/object mapping rules          |
| SyncJob                  | Tenant |        | Integration sync job runs           |
| SyncLog                  | Tenant |        | Logs from integration jobs          |
| weather_providers        | Global | ✅     | Weather data providers              |
| weather_forecast_cache   | Tenant |        | Cached forecasts                    |
| weather_alerts           | Tenant |        | Weather alerts received             |
| weather_watches          | Tenant |        | Watch bulletins observed            |
| weather_incidents        | Tenant |        | Weather incidents/logs              |
| weather_risk_factors     | Tenant |        | Derived risk factors from weather   |
| weather_alert_deliveries | Tenant |        | Delivery attempts of weather alerts |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## mobileSync

Strategic purpose: Offline-first synchronization with change vectors and conflict resolution. Supports field operations and resiliency.

| Model        | Scope  | Parent | Description                           |
| ------------ | ------ | ------ | ------------------------------------- |
| SyncState    | Tenant | ✅     | Client sync state per device/context  |
| ChangeVector | Tenant |        | Change vector tracking for delta sync |
| ConflictLog  | Tenant |        | Conflict logs and resolutions         |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## observabilityJobs

Strategic purpose: Background job orchestration and system logging with tenant isolation. Enables reliable processing and auditability of operational events.

| Model       | Scope  | Parent | Description                    |
| ----------- | ------ | ------ | ------------------------------ |
| JobSchedule | Tenant | ✅     | Scheduled jobs configuration   |
| JobRun      | Tenant |        | Executions of scheduled jobs   |
| SystemLog   | Tenant |        | Tenant-scoped operational logs |
| ErrorReport | Tenant |        | Error reports and diagnostics  |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## privacyCompliance

Strategic purpose: Data subject rights, retention policies, legal holds, and erasure/access flows. Ensures GDPR/SOC2 alignment with audit trail linkage.

| Model               | Scope  | Parent | Description                  |
| ------------------- | ------ | ------ | ---------------------------- |
| DataSubject         | Tenant | ✅     | Data subject registry        |
| DataAccessRequest   | Tenant |        | Access requests (DSAR)       |
| DataErasureRequest  | Tenant |        | Erasure requests             |
| LegalHold           | Tenant |        | Legal hold orders            |
| DataRetentionPolicy | Tenant |        | Retention schedules/policies |
| RetentionSchedule   | Tenant |        | Concrete retention schedules |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## dataLineageGovernance

Strategic purpose: End-to-end data lineage for compliance and RCA. Connects audit/event streams with domain entities.

| Model            | Scope  | Parent | Description                   |
| ---------------- | ------ | ------ | ----------------------------- |
| DataLineageEvent | Tenant | ✅     | Events captured for lineage   |
| DataLineageEdge  | Tenant |        | Directed edges between events |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## settingsCatalogs

Strategic purpose: Global controlled vocabularies preventing data drift and enabling consistent analytics across tenants.

| Model          | Scope  | Parent | Description                 |
| -------------- | ------ | ------ | --------------------------- |
| UnitOfMeasure  | Global | ✅     | Units of measure catalog    |
| CostCode       | Global |        | Cost code catalog           |
| CostCategory   | Global |        | Cost category catalog       |
| WorkType       | Global |        | Work type catalog           |
| ServiceType    | Global |        | Service type catalog        |
| ProjectType    | Global |        | Project type catalog        |
| Region         | Global |        | Regions catalog             |
| Country        | Global |        | Country catalog             |
| StateProvince  | Global |        | Sub-national region catalog |
| PaymentMethod  | Global |        | Payment method catalog      |
| PaymentGateway | Global |        | Supported payment gateways  |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## room-plan

Strategic purpose: Spatial capture and processing for rooms and structures. Supports estimation, planning, and verification workflows.

| Model             | Scope  | Parent | Description                    |
| ----------------- | ------ | ------ | ------------------------------ |
| RoomScanSession   | Tenant | ✅     | Capture session metadata       |
| RoomScanFile      | Tenant |        | Raw scan file ingestion        |
| RoomProcessingJob | Tenant |        | Processing job for scans       |
| RoomModel         | Tenant |        | 3D/semantic room model         |
| RoomObject        | Tenant |        | Objects detected in room       |
| RoomSurface       | Tenant |        | Surfaces/areas detected        |
| RoomMeasurement   | Tenant |        | Measurements/extracted metrics |
| RoomExport        | Tenant |        | Exported artifacts             |
| RoomPlanPreset    | Tenant |        | Plan presets/templates         |
| RoomAnnotation    | Tenant |        | Manual annotations             |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## accessFirewall

Strategic purpose: Redaction, watermarking, external data policy, and share auditing for secure external collaboration. Enforces contractual and privacy boundaries.

| Model                  | Scope  | Parent | Description                            |
| ---------------------- | ------ | ------ | -------------------------------------- |
| external_data_policies | Tenant | ✅     | External data policy definitions       |
| redaction_rules        | Tenant |        | Redaction rules for sensitive fields   |
| watermark_policies     | Tenant |        | Watermarking policies for documents    |
| external_share_audits  | Tenant |        | Audit trail for external shares        |
| ExternalShareLink      | Tenant |        | Share links issued for external access |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## ai

Strategic purpose: Prompts, jobs, insights, embeddings, playbooks, actions, and assistants. Drives proactive intelligence and automation across the ERP.

| Model              | Scope  | Parent | Description                     |
| ------------------ | ------ | ------ | ------------------------------- |
| AIPromptTemplate   | Tenant | ✅     | Prompt templates                |
| AIJob              | Tenant | ✅     | AI job orchestration            |
| AIJobArtifact      | Tenant |        | Artifacts generated by a job    |
| AIInsight          | Tenant | ✅     | Insight generated by AI         |
| AIInsightFeedback  | Tenant |        | Feedback on AI insights         |
| AIEmbedding        | Tenant |        | Vector embeddings store         |
| AIDocumentIndex    | Tenant | ✅     | Indexed documents for RAG       |
| AIDocumentChunk    | Tenant |        | Document chunks for indexing    |
| AIPlaybook         | Tenant | ✅     | Playbook definition (workflow)  |
| AIPlaybookStep     | Tenant |        | Steps within a playbook         |
| AIAction           | Tenant | ✅     | Action definition (callable)    |
| AIActionRun        | Tenant |        | Executions of actions           |
| AIAssistantProfile | Tenant | ✅     | Persona profiles for assistants |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

## expenseManagement

Strategic purpose: Employee expenses and approvals, feeding AP or Payroll paths depending on policy. Maintains full audit and receipts.

| Model           | Scope  | Parent | Description                   |
| --------------- | ------ | ------ | ----------------------------- |
| ExpenseReport   | Hybrid | ✅     | Expense report header         |
| Expense         | Hybrid |        | Expense item at header level  |
| ExpenseLine     | Tenant |        | Itemized expense lines        |
| ExpenseReceipt  | Tenant |        | Receipts attached to expenses |
| ExpenseApproval | Tenant |        | Approvals for expense reports |

---

Dependencies: Feeds Projects and Billing; uses Approvals and Compliance.

# Orphan Models & Suggested New Modules

The following names appear in the schema list but are not clearly assignable to a business domain; they look like parsing artifacts or reserved tokens. They should be reviewed and likely removed or renamed.

| Model    | Suggested Module     | Reason / Context                                                         |
| -------- | -------------------- | ------------------------------------------------------------------------ |
| contains | N/A (Schema Hygiene) | Appears to be a tokenizer/reserved word accidentally captured as a model |
| name     | N/A (Schema Hygiene) | Generic token; likely not a real entity                                  |
| or       | N/A (Schema Hygiene) | Logical operator token, not a domain model                               |
| String   | N/A (Schema Hygiene) | Primitive type token, not a model                                        |

If these are intentional, add documentation clarifying their purpose and adjust module placement accordingly; otherwise, remove from the schema inventory.

---

# Final Summary

| Total Models | Total Modules | Orphans Found | Coverage |
| ------------ | ------------- | ------------- | -------- |
| 363          | 32            | 4             | 100%     |

Notes:

- Scope definitions: Global (shared across tenants), Tenant (RLS-scoped to a single tenant), Hybrid (shared identity with tenant usage, e.g., Estimate, Project, Invoice, Payment).
- Parent indicates root entities in a module’s aggregate structure. All other models are children/supporting entities.
- Boundaries respected: Messaging separated from Notifications; Inventory separate from Procurement; AI separate from Analytics; Approvals separate from Audit.
