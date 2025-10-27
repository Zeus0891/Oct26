# ERP Enums Reference — Domains and Functional Ownership

This companion reference groups all Prisma enums by functional domain to reinforce clear module boundaries and aid governance, API design, and documentation. Where names are cross-cutting, they are placed under "Shared / Cross-Cutting" or the most relevant platform domain.

Scope notes:

- These enums are consumed by models documented in `ERP_MODULE_STRUCTURE.md`.
- Module separations follow enterprise boundaries: Messaging vs Notifications, Inventory vs Procurement, AI vs Analytics, Approvals vs Audit/Privacy.

---

## tenant

- BillingAccountStatus
- FeatureDataType
- FeatureFlagScope
- FeatureType
- PlatformTenantChildStatus
- SubscriptionInterval
- SubscriptionStatus
- TenantDeploymentType
- TenantRegion
- TenantStatus
- TenantTier
- UsageMetric

---

## access-control

- AccessMethod
- ApiKeyScope
- ApiKeyStatus
- PermissionScope
- RoleType
- SecurityLevel
- ServiceAccountStatus
- ServiceAccountType
- ThemePreference

Note: Authentication and session-related enums have moved to the Identity module.

---

## identity

- AuthenticationMethod
- AuthenticationType
- AuthFactorStatus
- AuthFactorType
- DeviceStatus
- DeviceType
- SessionStatus
- TokenType
- UserStatus

---

## crm

- AccountStatus
- ContactStatus
- ContactType
- CustomerSegmentType
- LeadStatus
- OpportunityStatus
- PreferredContactMethod
- RelationshipType
- Territory (model, see structure doc) — enums used: CoverageLevel
- InsuranceStatus
- InsuranceType
- CoverageLevel

---

## estimating

- BidInvitationStatus
- BidStatus
- BidSubmissionStatus
- CRMChildStatus
- EstimateApprovalDecision
- EstimateChildStatus
- EstimateDiscountType
- EstimateStatus
- EstimateTaxType
- EstimateTermType
- QuoteStatus

---

## projects

- DependencyType
- ExternalAccessLevel
- LocationStatus
- LocationType
- MilestoneStatus
- MilestoneType
- ProjectChildStatus
- ProjectStatus
- RFIReplyType
- RFIStatus
- ScheduleExceptionType
- ScheduleStatus
- StakeholderRole
- WorkItemStatus
- ResourceType
- SafetyRating

---

## tasks

- TaskAttachmentType
- TaskChildStatus
- TaskPriority
- TaskType

---

## changeOrders

- ChangeOrderApprovalDecision
- ChangeOrderChildStatus
- ChangeOrderDocumentType
- ChangeOrderLineStatus
- ChangeOrderStatus

---

## billing

- CreditMemoStatus
- DunningLevel
- DunningNoticeStatus
- InvoiceChildStatus
- InvoiceLineItemType
- InvoiceStatus
- InvoiceTaxType
- PaymentTerms
- PaymentTermStatus

---

## payments

- BankAccountStatus
- BankAccountType
- ChargebackStatus
- PaymentChildStatus
- PaymentDirection
- PaymentMethodTokenStatus
- PaymentMethodType
- PaymentProvider
- PaymentScheduleStatus
- PaymentStatus
- PayoutStatus
- ReconciliationStatus
- StatementLineStatus

---

## procurement

- APBillStatus
- ProcurementApprovalStatus
- ProcurementChildStatus
- ProcurementUnitOfMeasure
- PurchaseOrderStatus
- RFQResponseStatus
- RFQStatus
- RFQType
- GoodsInspectionStatus
- GoodsReceiptStatus
- VendorChildStatus
- VendorComplianceStatus
- VendorContactType
- VendorDocumentType
- VendorRiskRating
- VendorStatus
- VendorType

---

## inventory

- AssetCondition
- AssetStatus
- InventoryChildStatus
- InventoryItemStatus
- InventoryTransactionStatus
- InventoryTransactionType
- MeasurementUnit
- QualityGrade

---

## zeroLossInventoryControls

- (No dedicated enums; uses Inventory/Projects/Approvals enums)

---

## hrWorkforce

- EmploymentStatus
- EmploymentType
- FLSAClassification
- GenderType
- HRWorkforceChildStatus
- JobLevel
- JobProfileStatus
- MaritalStatus
- OrgUnitStatus
- OrgUnitType
- PayGroupStatus
- PerformanceRating
- PersonStatus
- PositionBudgetStatus
- PositionStatus
- PositionType
- ProficiencyLevel
- TrainingStatus
- WorkerStatus
- WorkLocation
- WorkScheduleType
- TerminationReason
- NameType

---

## timePayroll

- AllowanceType
- DeductionType
- OvertimeRuleType
- OvertimeType
- PayFrequency
- PayStatementDeliveryMethod
- PayStatementStatus
- PayrollAdjustmentType
- PayrollItemStatus
- PayrollItemType
- PayrollPaymentMethod
- PayrollPaymentMethodType
- PayrollPaymentType
- PayrollRunStatus
- PayrollRunType
- PayrollTaxType
- ReimbursementStatus
- ReimbursementType
- TimeClockStatus
- TimePayrollChildStatus
- TimesheetApprovalDecision
- TimesheetApprovalType
- TimesheetEntryStatus
- TimesheetEntryType
- TimesheetStatus
- PayType

---

## approvals

- ApprovalDecisionStatus
- ApprovalDecisionType
- ApprovalEntityType
- ApprovalRequestPriority
- ApprovalRequestSource
- ApprovalRequestStatus
- ApprovalRuleScope
- ApprovalRuleStatus
- ApprovalRuleType
- ApprovalStatus
- ReasonCodeCategory
- ReasonCodeStatus
- ReasonCodeType

---

## fraudShield

- CaseActionType
- CaseCategory
- CasePriority
- CaseStatus
- DelegationConstraintType
- DelegationStatus
- DelegationType
- FraudAction
- FraudPolicyStatus
- FraudPolicyType
- FraudRuleStatus
- FraudRuleType
- ImpactLevel
- PolicyRiskLevel
- EscalationLevel
- AnomalySeverity
- AnomalyStatus
- AnomalyType

---

## messaging

- ChannelMemberRole
- ChannelMemberStatus
- ChannelStatus
- ChannelType
- ChannelVisibility
- CommunicationAttachmentStatus
- CommunicationAttachmentType
- CommunicationMessagePriority
- CommunicationMessageStatus
- CommunicationMessageType
- DirectChatStatus
- DirectChatType
- MessageFormat
- ReadStatus

---

## notifications

- DeliveryChannel
- DeliveryStatus
- DeliveryTargetType
- NotificationChannel
- NotificationLevel

---

## documentManagement

- ChunkType
- DocumentType
- DocumentVerificationStatus
- FileCategory
- FileObjectStatus
- StorageProvider
- VirusScanStatus

---

## eSignature

- ESignatureStatus
- RecipientStatus
- RecipientType
- SignatureIntentStatus
- SignatureIntentType
- SignatureSessionStatus
- SignatureType

---

## analytics

- AggregationFunction
- ArtifactStatus
- ArtifactType
- TemplateStatus

---

## profitabilityForecasting

- BudgetPeriod
- BudgetStatus
- BusinessImpact
- GoalStatus
- GoalType
- RiskLevel
- RiskStatus

---

## scheduleIntelligence

- InsightSeverity
- InsightStatus
- InsightType

---

## financialLedgerTax

- CurrencyCode
- CurrencyRateSource
- CurrencyRateStatus
- CurrencyRateType
- DebitCreditIndicator
- GLAccountCategory
- GLAccountStatus
- GLAccountType
- JournalEntrySource
- JournalEntryStatus
- JournalEntryType
- JournalLineStatus
- TaxCalculationMethod
- TaxJurisdictionStatus
- TaxJurisdictionType
- TaxRateStatus
- TaxRateType
- TaxType

---

## integrations

- ConnectionHealthStatus
- EncryptionMethod
- IntegrationCapability
- IntegrationCategory
- IntegrationConnectionStatus
- IntegrationConnectorStatus
- IntegrationEnvironment
- IntegrationProviderStatus
- MappingDirection
- MappingStatus
- MappingType
- MigrationStatus
- SecretStatus
- SecretType
- SyncDirection
- SyncJobStatus
- SyncJobType
- WeatherActionHint
- WeatherAlertStatus
- WeatherAlertType
- WeatherEntityType
- WeatherIncidentType
- WeatherIndustry
- WeatherMetric
- WeatherRiskLevel
- WeatherSeverity
- WeatherSource

---

## observabilityJobs

- AckStatus
- EventType
- IncidentPriority
- IncidentSeverity
- IncidentStatus
- JobPriority
- LogCategory
- LogLevel
- LogType
- RetryStrategy
- ResolutionCategory

---

## privacyCompliance

- ComplianceLevel
- DataIsolationLevel
- DataRestrictionLevel
- RetentionPolicy
- VerificationStatus

---

## dataLineageGovernance

- RuleConditionType
- RuleFrequency
- RuleOperator
- ScopeType
- ThresholdOperator
- ValidationRule

---

## settingsCatalogs

- DataSyncDirection
- DataType
- FeeType
- MeasurementUnit (also referenced in Inventory)
- NameType (also referenced in HR / PersonName)

---

## room-plan

- Axis
- RoomExportType
- RoomFileType
- RoomJobType
- RoomModelType
- RoomObjectType
- RoomPresetType
- RoomProcessingStatus
- RoomScanStatus
- RoomSurfaceType

---

## accessFirewall

- ExternalDataPolicyStatus
- ExternalDataPolicyType
- ExternalShareAuditStatus
- ExternalShareEventType
- ExternalShareStatus
- ExternalShareType
- RedactionMethod
- RedactionRiskLevel
- RedactionRuleStatus
- RedactionRuleType
- WatermarkPolicyStatus
- WatermarkPosition
- WatermarkType

---

## ai

- AIJobPriority
- AIJobStatus
- AIJobType
- AIModelProvider
- EmbeddingModel
- InsightSeverity (see also Schedule Intelligence)
- InsightStatus (see also Schedule Intelligence)
- InsightType (see also Schedule Intelligence)
- PlaybookStatus
- PlaybookTrigger
- PromptParameterType
- PromptTemplateType

---

## expenseManagement

- ExpenseChildStatus
- ExpenseReportStatus
- ExpenseStatus
- ReimbursementStatus (also in Time & Payroll when reimbursing via payroll)
- ReimbursementType

---

## Shared / Cross‑Cutting

These enums are used across multiple domains or provide generic classifications; placement depends on specific model usage.

- ActionResultStatus
- ActionType
- AdjustmentType

---

# Coverage Summary

- Total Enums: 399
- Domains Covered: 27
- Cross‑cutting Enums: 3 (listed in Shared)

Notes:

- Some enums naturally intersect domains (e.g., Insight\* across AI and Schedule Intelligence). They are listed under primary ownership and referenced where relevant.
- For governance, prefer consuming enums from their owning domain; avoid duplicating similarly named enums across modules.
