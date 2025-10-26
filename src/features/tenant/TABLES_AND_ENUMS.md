# tenant — Tables and Enums

## 🧱 Models

### Tenant

```prisma
model Tenant {
  id                         String                       @id @default(uuid(7)) @db.Uuid
  status                     TenantStatus                 @default(ACTIVE)
  version                    Int                          @default(1)
  createdAt                  DateTime                     @default(now()) @db.Timestamptz(6)
  updatedAt                  DateTime                     @db.Timestamptz(6)
  deletedAt                  DateTime?                    @db.Timestamptz(6)
  deletedByActorId           String?                      @db.Uuid
  createdByActorId           String?                      @db.Uuid
  updatedByActorId           String?                      @db.Uuid
  auditCorrelationId         String?                      @db.Uuid
  dataClassification         String                       @default("INTERNAL")
  retentionPolicy            RetentionPolicy?
  name                       String                       @db.VarChar(255)
  slug                       String                       @unique @db.Citext
  displayName                String?                      @db.VarChar(255)
  description                String?
  industry                   String?                      @db.VarChar(100)
  website                    String?                      @db.VarChar(500)
  deploymentType             TenantDeploymentType         @default(SHARED)
  isolationLevel             DataIsolationLevel           @default(SHARED_DATABASE)
  tier                       TenantTier                   @default(STARTER)
  region                     TenantRegion                 @default(US_EAST_1)
  migrationStatus            MigrationStatus              @default(NOT_STARTED)
  maxUsers                   Int?                         @default(10)
  maxStorage                 Int?                         @default(1024)
  maxApiCalls                Int?                         @default(10000)
  billingEmail               String?                      @db.Citext
  subscriptionId             String?                      @db.Uuid
  trialEndsAt                DateTime?                    @db.Timestamptz(6)
  subscriptionEndsAt         DateTime?                    @db.Timestamptz(6)
  complianceLevel            String?                      @default("STANDARD")
  encryptionEnabled          Boolean                      @default(true)
  backupEnabled              Boolean                      @default(true)
  AIAction                   AIAction[]
  AIActionRun                AIActionRun[]
  AIAssistantProfile         AIAssistantProfile[]
  AIDocumentChunk            AIDocumentChunk[]
  AIDocumentIndex            AIDocumentIndex[]
  AIEmbedding                AIEmbedding[]
  AIInsight                  AIInsight[]
  AIInsightFeedback          AIInsightFeedback[]
  AIJob                      AIJob[]
  AIJobArtifact              AIJobArtifact[]
  AIPlaybook                 AIPlaybook[]
  AIPlaybookStep             AIPlaybookStep[]
  AIPromptTemplate           AIPromptTemplate[]
  APBill                     APBill[]
  APBillLine                 APBillLine[]
  AbsenceBalance             AbsenceBalance[]
  ApiKey                     ApiKey[]
  ApprovalDecision           ApprovalDecision[]
  ApprovalRequest            ApprovalRequest[]
  ApprovalRule               ApprovalRule[]
  Attachment                 Attachment[]
  AttachmentLink             AttachmentLink[]
  AuthFactor                 AuthFactor[]
  BenefitDependent           BenefitDependent[]
  BenefitEnrollment          BenefitEnrollment[]
  BillApproval               BillApproval[]
  BillPayment                BillPayment[]
  Certification              Certification[]
  Channel                    Channel[]
  ChannelMember              ChannelMember[]
  CompensationComponent      CompensationComponent[]
  CompensationPlan           CompensationPlan[]
  CostCenter                 CostCenter[]
  CreditMemo                 CreditMemo[]
  CreditMemoLine             CreditMemoLine[]
  Department                 Department[]
  DirectChat                 DirectChat[]
  DirectMessage              DirectMessage[]
  DirectMessageRead          DirectMessageRead[]
  DunningNotice              DunningNotice[]
  ESignatureEnvelope         ESignatureEnvelope[]
  ESignatureRecipient        ESignatureRecipient[]
  Employment                 Employment[]
  ExternalShareLink          ExternalShareLink[]
  FileObject                 FileObject[]
  GLAccount                  GLAccount[]
  GoodsReceipt               GoodsReceipt[]
  GoodsReceiptLine           GoodsReceiptLine[]
  Grade                      Grade[]
  HolidayCalendar            HolidayCalendar[]
  IdentityProviderConnection IdentityProviderConnection[]
  IntegrationConnection      IntegrationConnection[]
  IntegrationConnector       IntegrationConnector[]
  IntegrationMapping         IntegrationMapping[]
  IntegrationSecret          IntegrationSecret[]
  Invoice                    Invoice[]
  InvoiceAttachment          InvoiceAttachment[]
  InvoiceLineItem            InvoiceLineItem[]
  InvoiceTax                 InvoiceTax[]
  JobFamily                  JobFamily[]
  JobProfile                 JobProfile[]
  JobProfileAssignment       JobProfileAssignment[]
  JournalEntry               JournalEntry[]
  JournalLine                JournalLine[]
  Leave                      Leave[]
  Location                   Location[]
  Member                     Member[]
  MemberDocument             MemberDocument[]
  MemberRole                 MemberRole[]
  MemberSettings             MemberSettings[]
  Message                    Message[]
  MessageAttachment          MessageAttachment[]
  MessageRead                MessageRead[]
  Milestone                  Milestone[]
  MilestoneDependency        MilestoneDependency[]
  MilestoneStakeholder       MilestoneStakeholder[]
  OrgUnit                    OrgUnit[]
  PasswordResetToken         PasswordResetToken[]
  PayCalendar                PayCalendar[]
  PayGroup                   PayGroup[]
  PayGroupAssignment         PayGroupAssignment[]
  PaymentSchedule            PaymentSchedule[]
  PayrollRun                 PayrollRun[]
  PerformanceGoal            PerformanceGoal[]
  PerformanceReview          PerformanceReview[]
  Position                   Position[]
  PositionAssignment         PositionAssignment[]
  PositionBudget             PositionBudget[]
  PurchaseOrderApproval      PurchaseOrderApproval[]
  PurchaseOrderLine          PurchaseOrderLine[]
  RFQLine                    RFQLine[]
  RFQResponse                RFQResponse[]
  RFQResponseLine            RFQResponseLine[]
  ReasonCode                 ReasonCode[]
  RequestForQuote            RequestForQuote[]
  ResourceAllocation         ResourceAllocation[]
  Role                       Role[]
  RolePermission             RolePermission[]
  ServiceAccount             ServiceAccount[]
  ServiceAccountKey          ServiceAccountKey[]
  Session                    Session[]
  SignatureArtifact          SignatureArtifact[]
  SignatureEvent             SignatureEvent[]
  SignatureIntent            SignatureIntent[]
  SignatureSession           SignatureSession[]
  SyncJob                    SyncJob[]
  SyncLog                    SyncLog[]
  TenantAuditLog             TenantAuditLog[]
  TenantBillingAccount       TenantBillingAccount[]
  TenantEvent                TenantEvent[]
  TenantFeatureFlag          TenantFeatureFlag[]
  TenantMetrics              TenantMetrics[]
  TenantSettings             TenantSettings?
  TenantSubscription         TenantSubscription[]
  TenantUsageRecord          TenantUsageRecord[]
  NumberSequence             NumberSequence[]
  Timesheet                  Timesheet[]
  TrainingEnrollment         TrainingEnrollment[]
  UserDevice                 UserDevice[]
  Vendor                     Vendor[]
  VendorContact              VendorContact[]
  VendorDocument             VendorDocument[]
  Worker                     Worker[]
  external_data_policies     external_data_policies[]
  external_share_audits      external_share_audits[]
  redaction_rules            redaction_rules[]
  watermark_policies         watermark_policies[]
  weather_alert_deliveries   weather_alert_deliveries[]
  weather_alerts             weather_alerts[]
  weather_incidents          weather_incidents[]
  weather_risk_factors       weather_risk_factors[]
  weather_watches            weather_watches[]

  // RoomPlan Relations
  RoomScanSession   RoomScanSession[]
  RoomScanFile      RoomScanFile[]
  RoomModel         RoomModel[]
  RoomMeasurement   RoomMeasurement[]
  RoomObject        RoomObject[]
  RoomSurface       RoomSurface[]
  RoomAnnotation    RoomAnnotation[]
  RoomExport        RoomExport[]
  RoomPlanPreset    RoomPlanPreset[]
  RoomProcessingJob RoomProcessingJob[]

  // Fraud and Delegation Relations
  AnomalyCase          AnomalyCase[]
  AnomalyCaseAction    AnomalyCaseAction[]
  AnomalySignal        AnomalySignal[]
  AnomalySignalFeature AnomalySignalFeature[]
  DelegationConstraint DelegationConstraint[]
  DelegationGrant      DelegationGrant[]
  FraudPolicy          FraudPolicy[]
  FraudPolicyRule      FraudPolicyRule[]
  FraudPolicyScope     FraudPolicyScope[]

  @@index([auditCorrelationId])
  @@index([createdAt], type: Brin)
  @@index([dataClassification])
  @@index([deletedAt])
  @@index([deploymentType])
  @@index([migrationStatus])
  @@index([region])
  @@index([slug])
  @@index([status])
  @@index([subscriptionEndsAt])
  @@index([tier])
  @@index([trialEndsAt])
}
```

### TenantSettings

```prisma
model TenantSettings {
  id                        String                    @id @default(uuid(7)) @db.Uuid
  status                    PlatformTenantChildStatus @default(ACTIVE)
  version                   Int                       @default(1)
  createdAt                 DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt                 DateTime                  @db.Timestamptz(6)
  tenantId                  String                    @unique @db.Uuid
  deletedAt                 DateTime?                 @db.Timestamptz(6)
  deletedByActorId          String?                   @db.Uuid
  createdByActorId          String?                   @db.Uuid
  updatedByActorId          String?                   @db.Uuid
  auditCorrelationId        String?                   @db.Uuid
  dataClassification        String                    @default("INTERNAL")
  retentionPolicy           RetentionPolicy?
  logoUrl                   String?                   @db.VarChar(500)
  faviconUrl                String?                   @db.VarChar(500)
  primaryColor              String?                   @db.VarChar(7)
  secondaryColor            String?                   @db.VarChar(7)
  accentColor               String?                   @db.VarChar(7)
  displayName               String?                   @db.VarChar(255)
  tagline                   String?                   @db.VarChar(500)
  customCss                 String?
  customJs                  String?
  supportEmail              String?                   @db.Citext
  supportPhone              String?                   @db.VarChar(50)
  supportUrl                String?                   @db.VarChar(500)
  salesEmail                String?                   @db.Citext
  salesPhone                String?                   @db.VarChar(50)
  timezone                  String                    @default("UTC") @db.VarChar(50)
  locale                    String                    @default("en-US") @db.VarChar(10)
  currency                  String                    @default("USD") @db.VarChar(3)
  dateFormat                String                    @default("MM/DD/YYYY") @db.VarChar(20)
  timeFormat                String                    @default("12h") @db.VarChar(5)
  emailNotifications        Boolean                   @default(true)
  smsNotifications          Boolean                   @default(false)
  pushNotifications         Boolean                   @default(true)
  marketingEmails           Boolean                   @default(false)
  maintenanceMode           Boolean                   @default(false)
  publicSignup              Boolean                   @default(true)
  ssoEnabled                Boolean                   @default(false)
  mfaRequired               Boolean                   @default(false)
  apiAccessEnabled          Boolean                   @default(true)
  pmCanDeleteEstimate       Boolean                   @default(false)
  pmCanApproveEstimate      Boolean                   @default(false)
  pmCanConvertEstimate      Boolean                   @default(false)
  pmCanDeleteProject        Boolean                   @default(false)
  pmCanDeleteTask           Boolean                   @default(false)
  pmCanApproveChangeOrder   Boolean                   @default(false)
  pmCanApproveInvoice       Boolean                   @default(false)
  pmCanRejectInvoice        Boolean                   @default(false)
  pmCanApproveTimesheet     Boolean                   @default(false)
  pmCanApproveExpense       Boolean                   @default(false)
  pmCanRejectExpense        Boolean                   @default(false)
  pmCanManageMembers        Boolean                   @default(false)
  pmCanAssignRoles          Boolean                   @default(false)
  pmCanTerminateMembers     Boolean                   @default(false)
  pmCanClosePunchListItem   Boolean                   @default(false)
  pmCanApproveInspection    Boolean                   @default(false)
  pmCanPublishDailyLog      Boolean                   @default(false)
  pmCanPublishReport        Boolean                   @default(false)
  pmCanAuthorizeInventory   Boolean                   @default(false)
  pmCanManageExternalAccess Boolean                   @default(false)
  contractTemplateUrl       String?                   @db.VarChar(500)
  termsTemplateUrl          String?                   @db.VarChar(500)
  customSettings            Json?
  pmCanAccessFinancials     Boolean?                  @default(false)
  Tenant                    Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, contractTemplateUrl])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, status])
  @@index([tenantId, termsTemplateUrl])
}
```

### TenantBillingAccount

```prisma
model TenantBillingAccount {
  id                     String               @id @default(uuid(7)) @db.Uuid
  status                 BillingAccountStatus @default(ACTIVE)
  version                Int                  @default(1)
  createdAt              DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt              DateTime             @db.Timestamptz(6)
  tenantId               String               @db.Uuid
  deletedAt              DateTime?            @db.Timestamptz(6)
  deletedByActorId       String?              @db.Uuid
  createdByActorId       String?              @db.Uuid
  updatedByActorId       String?              @db.Uuid
  auditCorrelationId     String?              @db.Uuid
  dataClassification     String               @default("INTERNAL")
  retentionPolicy        RetentionPolicy?
  paymentProvider        PaymentProvider      @default(STRIPE)
  providerCustomerId     String?              @db.VarChar(255)
  providerAccountId      String?              @db.VarChar(255)
  defaultPaymentMethodId String?              @db.VarChar(255)
  paymentMethodType      String?              @db.VarChar(50)
  billingContactName     String?              @db.VarChar(255)
  billingContactEmail    String?              @db.Citext
  billingContactPhone    String?              @db.VarChar(50)
  billingAddressLine1    String?              @db.VarChar(255)
  billingAddressLine2    String?              @db.VarChar(255)
  billingCity            String?              @db.VarChar(100)
  billingState           String?              @db.VarChar(100)
  billingPostalCode      String?              @db.VarChar(20)
  billingCountry         String?              @db.VarChar(2)
  taxId                  String?              @db.VarChar(50)
  taxExempt              Boolean              @default(false)
  taxExemptReason        String?              @db.VarChar(255)
  currency               String               @default("USD") @db.VarChar(3)
  invoiceDeliveryMethod  String               @default("email") @db.VarChar(20)
  paymentTerms           Int?                 @default(30)
  providerSettings       Json?
  webhookEndpoints       String[]             @db.VarChar(500)
  verificationStatus     String               @default("pending") @db.VarChar(20)
  verifiedAt             DateTime?            @db.Timestamptz(6)
  lastVerificationCheck  DateTime?            @db.Timestamptz(6)
  Tenant                 Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, providerCustomerId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, paymentProvider])
  @@index([tenantId, status])
  @@index([tenantId, verificationStatus])
}
```

### TenantSubscription

```prisma
model TenantSubscription {
  id                     String               @id @default(uuid(7)) @db.Uuid
  status                 SubscriptionStatus   @default(ACTIVE)
  version                Int                  @default(1)
  createdAt              DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt              DateTime             @db.Timestamptz(6)
  tenantId               String               @db.Uuid
  deletedAt              DateTime?            @db.Timestamptz(6)
  deletedByActorId       String?              @db.Uuid
  createdByActorId       String?              @db.Uuid
  updatedByActorId       String?              @db.Uuid
  auditCorrelationId     String?              @db.Uuid
  dataClassification     String               @default("INTERNAL")
  retentionPolicy        RetentionPolicy?
  planId                 String               @db.VarChar(100)
  planName               String               @db.VarChar(255)
  planDescription        String?
  interval               SubscriptionInterval @default(MONTHLY)
  intervalCount          Int                  @default(1)
  currency               String               @default("USD") @db.VarChar(3)
  unitAmount             Decimal              @db.Decimal(15, 2)
  quantity               Int                  @default(1)
  totalAmount            Decimal              @db.Decimal(15, 2)
  currentPeriodStart     DateTime             @db.Timestamptz(6)
  currentPeriodEnd       DateTime             @db.Timestamptz(6)
  nextBillingDate        DateTime?            @db.Timestamptz(6)
  isTrialing             Boolean              @default(false)
  trialStart             DateTime?            @db.Timestamptz(6)
  trialEnd               DateTime?            @db.Timestamptz(6)
  trialDays              Int?                 @default(0)
  startedAt              DateTime             @default(now()) @db.Timestamptz(6)
  activatedAt            DateTime?            @db.Timestamptz(6)
  pausedAt               DateTime?            @db.Timestamptz(6)
  resumedAt              DateTime?            @db.Timestamptz(6)
  cancelAtPeriodEnd      Boolean              @default(false)
  canceledAt             DateTime?            @db.Timestamptz(6)
  cancellationReason     String?              @db.VarChar(255)
  canceledBy             String?              @db.Uuid
  providerSubscriptionId String?              @db.VarChar(255)
  providerCustomerId     String?              @db.VarChar(255)
  providerPlanId         String?              @db.VarChar(255)
  usageBasedBilling      Boolean              @default(false)
  meteringEnabled        Boolean              @default(false)
  usageLimits            Json?
  discountPercent        Decimal?             @db.Decimal(5, 2)
  discountAmount         Decimal?             @db.Decimal(15, 2)
  promoCode              String?              @db.VarChar(50)
  discountEndsAt         DateTime?            @db.Timestamptz(6)
  metadata               Json?
  tags                   String[]             @db.VarChar(50)
  Tenant                 Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, providerSubscriptionId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, cancelAtPeriodEnd])
  @@index([tenantId, currentPeriodEnd])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isTrialing])
  @@index([tenantId, nextBillingDate])
  @@index([tenantId, planId])
  @@index([tenantId, status])
}
```

### TenantUsageRecord

```prisma
model TenantUsageRecord {
  id                 String                    @id @default(uuid(7)) @db.Uuid
  status             PlatformTenantChildStatus @default(ACTIVE)
  version            Int                       @default(1)
  createdAt          DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                  @db.Timestamptz(6)
  tenantId           String                    @db.Uuid
  deletedAt          DateTime?                 @db.Timestamptz(6)
  deletedByActorId   String?                   @db.Uuid
  createdByActorId   String?                   @db.Uuid
  updatedByActorId   String?                   @db.Uuid
  auditCorrelationId String?                   @db.Uuid
  dataClassification String                    @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  metric             UsageMetric               @default(API_CALLS)
  quantity           Decimal                   @db.Decimal(15, 4)
  unit               String                    @db.VarChar(50)
  recordedAt         DateTime                  @db.Timestamptz(6)
  subscriptionId     String?                   @db.Uuid
  billingPeriodStart DateTime?                 @db.Timestamptz(6)
  billingPeriodEnd   DateTime?                 @db.Timestamptz(6)
  resourceId         String?                   @db.Uuid
  resourceType       String?                   @db.VarChar(100)
  userId             String?                   @db.Uuid
  unitPrice          Decimal?                  @db.Decimal(15, 4)
  totalAmount        Decimal?                  @db.Decimal(15, 2)
  currency           String                    @default("USD") @db.VarChar(3)
  isAggregated       Boolean                   @default(false)
  aggregationPeriod  String?                   @db.VarChar(20)
  sourceRecordIds    String[]                  @db.Uuid
  metadata           Json?
  tags               String[]                  @db.VarChar(50)
  processed          Boolean                   @default(false)
  processedAt        DateTime?                 @db.Timestamptz(6)
  invoiceId          String?                   @db.Uuid
  Tenant             Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([recordedAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, billingPeriodStart, billingPeriodEnd])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, metric])
  @@index([tenantId, processed])
  @@index([tenantId, recordedAt], type: Brin)
  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, status])
  @@index([tenantId, subscriptionId])
}
```

### TenantMetrics

```prisma
model TenantMetrics {
  id                        String                    @id @default(uuid(7)) @db.Uuid
  status                    PlatformTenantChildStatus @default(ACTIVE)
  version                   Int                       @default(1)
  createdAt                 DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt                 DateTime                  @db.Timestamptz(6)
  tenantId                  String                    @db.Uuid
  deletedAt                 DateTime?                 @db.Timestamptz(6)
  deletedByActorId          String?                   @db.Uuid
  createdByActorId          String?                   @db.Uuid
  updatedByActorId          String?                   @db.Uuid
  auditCorrelationId        String?                   @db.Uuid
  dataClassification        String                    @default("INTERNAL")
  retentionPolicy           RetentionPolicy?
  metricDate                DateTime                  @db.Date
  metricHour                Int?                      @default(0)
  activeUsersCount          Int                       @default(0)
  totalUsersCount           Int                       @default(0)
  newUsersCount             Int                       @default(0)
  loginCount                Int                       @default(0)
  sessionDuration           Int?
  storageUsedMB             Int                       @default(0)
  storageQuotaMB            Int?
  filesCount                Int                       @default(0)
  documentsCount            Int                       @default(0)
  apiCallsCount             Int                       @default(0)
  apiErrorsCount            Int                       @default(0)
  avgResponseTimeMs         Int?
  bandwidthUsedMB           Int                       @default(0)
  projectsCount             Int                       @default(0)
  activeProjectsCount       Int                       @default(0)
  tasksCount                Int                       @default(0)
  completedTasksCount       Int                       @default(0)
  revenueAmount             Decimal?                  @db.Decimal(15, 2)
  billingAmount             Decimal?                  @db.Decimal(15, 2)
  lastBillingCycleUsage     Decimal?                  @db.Decimal(15, 2)
  featuresUsedCount         Int                       @default(0)
  integrationsCount         Int                       @default(0)
  reportsGenerated          Int                       @default(0)
  supportTicketsCount       Int                       @default(0)
  avgResolutionTimeHours    Int?
  customerSatisfactionScore Decimal?                  @db.Decimal(3, 2)
  Tenant                    Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, metricDate, metricHour])
  @@index([metricDate], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, metricDate], type: Brin)
  @@index([tenantId, metricDate, metricHour])
  @@index([tenantId, status])
}
```

### TenantFeatureFlag

```prisma
model TenantFeatureFlag {
  id                 String                    @id @default(uuid(7)) @db.Uuid
  status             PlatformTenantChildStatus @default(ACTIVE)
  version            Int                       @default(1)
  createdAt          DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                  @db.Timestamptz(6)
  tenantId           String                    @db.Uuid
  deletedAt          DateTime?                 @db.Timestamptz(6)
  deletedByActorId   String?                   @db.Uuid
  createdByActorId   String?                   @db.Uuid
  updatedByActorId   String?                   @db.Uuid
  auditCorrelationId String?                   @db.Uuid
  dataClassification String                    @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  key                String                    @db.VarChar(100)
  name               String                    @db.VarChar(255)
  description        String?
  enabled            Boolean                   @default(false)
  rolloutPercentage  Int                       @default(0)
  scope              FeatureFlagScope          @default(TENANT)
  targetUserIds      String[]                  @db.Uuid
  targetRoles        String[]                  @db.VarChar(50)
  conditions         Json?
  startDate          DateTime?                 @db.Timestamptz(6)
  endDate            DateTime?                 @db.Timestamptz(6)
  isTemporary        Boolean                   @default(false)
  tags               String[]                  @db.VarChar(50)
  environment        String                    @default("production") @db.VarChar(20)
  priority           Int                       @default(0)
  Tenant             Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, key])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, enabled])
  @@index([tenantId, key, enabled])
  @@index([tenantId, scope])
  @@index([tenantId, status])
}
```

### NumberSequence

```prisma
model NumberSequence {
  id               String                    @id @default(uuid(7)) @db.Uuid
  status           PlatformTenantChildStatus @default(ACTIVE)
  version          Int                       @default(1)
  createdAt        DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime                  @db.Timestamptz(6)
  tenantId         String                    @db.Uuid
  deletedAt        DateTime?                 @db.Timestamptz(6)
  deletedByActorId String?                   @db.Uuid
  createdByActorId String?                   @db.Uuid
  updatedByActorId String?                   @db.Uuid

  // Business configuration fields
  code           String            @db.VarChar(50)   // Unique identifier per tenant (e.g., "ESTIMATE_NUMBER")
  name           String            @db.VarChar(255)  // Human-readable name
  description    String?           @db.Text
  prefix         String            @db.VarChar(20)   // e.g., "EST"
  suffix         String?           @db.VarChar(20)
  paddingLength  Int               @default(6)       // e.g., 6 -> 000001
  currentValue   Int               @default(0)
  minValue       Int               @default(1)
  maxValue       Int?
  step           Int               @default(1)
  resetMode      NumberSequenceResetMode @default(NEVER)
  resetValue     Int               @default(1)
  lastResetAt    DateTime?                       @db.Timestamptz(6)

  // Format configuration
  formatTemplate String            @default("{prefix}-{number}")
  exampleOutput  String?           @db.VarChar(100)

  // Relations
  Tenant         Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  // Constraints & indexes
  @@unique([tenantId, code])
  @@index([tenantId, status])
  @@index([tenantId, deletedAt])
}
```

### DocumentGroup

```prisma
model DocumentGroup {
  id                 String                    @id @default(uuid(7)) @db.Uuid
  status             PlatformTenantChildStatus @default(ACTIVE)
  version            Int                       @default(1)
  createdAt          DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                  @db.Timestamptz(6)
  tenantId           String                    @db.Uuid
  deletedAt          DateTime?                 @db.Timestamptz(6)
  deletedByActorId   String?                   @db.Uuid
  createdByActorId   String?                   @db.Uuid
  updatedByActorId   String?                   @db.Uuid
  CreditMemo         CreditMemo[]
  Estimate           Estimate[]
  EstimateAttachment EstimateAttachment[]
  Invoice            Invoice[]
  Project            Project[]
  TaskAttachment     TaskAttachment[]

  // RoomPlan relationships
  RoomModel  RoomModel[]
  RoomExport RoomExport[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, deletedAt])
  @@index([tenantId, status])
}
```

### TermsTemplate

```prisma
model TermsTemplate {
  id               String                    @id @default(uuid(7)) @db.Uuid
  status           PlatformTenantChildStatus @default(ACTIVE)
  version          Int                       @default(1)
  createdAt        DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime                  @db.Timestamptz(6)
  tenantId         String                    @db.Uuid
  deletedAt        DateTime?                 @db.Timestamptz(6)
  deletedByActorId String?                   @db.Uuid
  createdByActorId String?                   @db.Uuid
  updatedByActorId String?                   @db.Uuid
  Estimate         Estimate[]
  Project          Project[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, deletedAt])
  @@index([tenantId, status])
}
```

### ContractTemplate

```prisma
model ContractTemplate {
  id               String                    @id @default(uuid(7)) @db.Uuid
  status           PlatformTenantChildStatus @default(ACTIVE)
  version          Int                       @default(1)
  createdAt        DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime                  @db.Timestamptz(6)
  tenantId         String                    @db.Uuid
  deletedAt        DateTime?                 @db.Timestamptz(6)
  deletedByActorId String?                   @db.Uuid
  createdByActorId String?                   @db.Uuid
  updatedByActorId String?                   @db.Uuid
  Estimate         Estimate[]
  Project          Project[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, deletedAt])
  @@index([tenantId, status])
}
```

### EncryptionProfile

```prisma
model EncryptionProfile {
  id               String                    @id @default(uuid(7)) @db.Uuid
  status           PlatformTenantChildStatus @default(ACTIVE)
  version          Int                       @default(1)
  createdAt        DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime                  @db.Timestamptz(6)
  tenantId         String                    @db.Uuid
  deletedAt        DateTime?                 @db.Timestamptz(6)
  deletedByActorId String?                   @db.Uuid
  createdByActorId String?                   @db.Uuid
  updatedByActorId String?                   @db.Uuid
}
```

### TenantEvent

```prisma
model TenantEvent {
  id                 String                    @id @default(uuid(7)) @db.Uuid
  status             PlatformTenantChildStatus @default(ACTIVE)
  version            Int                       @default(1)
  createdAt          DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                  @db.Timestamptz(6)
  tenantId           String                    @db.Uuid
  deletedAt          DateTime?                 @db.Timestamptz(6)
  deletedByActorId   String?                   @db.Uuid
  createdByActorId   String?                   @db.Uuid
  updatedByActorId   String?                   @db.Uuid
  auditCorrelationId String?                   @db.Uuid
  dataClassification String                    @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  eventType          EventType                 @default(TENANT_PROVISIONED)
  aggregateType      String                    @db.VarChar(100)
  aggregateId        String                    @db.Uuid
  sequence           Int                       @default(1)
  eventName          String                    @db.VarChar(255)
  eventDescription   String?
  occurredAt         DateTime                  @default(now()) @db.Timestamptz(6)
  payload            Json
  payloadSchema      String?                   @db.VarChar(100)
  payloadHash        String?                   @db.VarChar(64)
  actorId            String?                   @db.Uuid
  actorType          String?                   @db.VarChar(50)
  causationId        String?                   @db.Uuid
  correlationId      String?                   @db.Uuid
  streamId           String                    @db.Uuid
  streamPosition     Int                       @default(1)
  expectedVersion    Int?
  processed          Boolean                   @default(false)
  processedAt        DateTime?                 @db.Timestamptz(6)
  projectionVersion  Int?                      @default(1)
  metadata           Json?
  tags               String[]                  @db.VarChar(50)
  isSnapshot         Boolean                   @default(false)
  snapshotVersion    Int?
  Tenant             Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, aggregateType, aggregateId, sequence])
  @@unique([tenantId, id])
  @@unique([tenantId, streamId, streamPosition])
  @@index([occurredAt], type: Brin)
  @@index([tenantId, actorId])
  @@index([tenantId, aggregateType, aggregateId])
  @@index([tenantId, aggregateType])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, causationId])
  @@index([tenantId, correlationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, eventType])
  @@index([tenantId, isSnapshot])
  @@index([tenantId, occurredAt], type: Brin)
  @@index([tenantId, processed])
  @@index([tenantId, status])
  @@index([tenantId, streamId])
}
```

### EventProjection

```prisma
model EventProjection {
  id               String    @id @default(uuid(7)) @db.Uuid
  version          Int       @default(1)
  createdAt        DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime  @db.Timestamptz(6)
  tenantId         String    @db.Uuid
  deletedAt        DateTime? @db.Timestamptz(6)
  deletedByActorId String?   @db.Uuid
  createdByActorId String?   @db.Uuid
  updatedByActorId String?   @db.Uuid
  name             String
  state            Json

  @@unique([tenantId, id])
  @@unique([tenantId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, deletedAt])
  @@index([updatedAt], type: Brin)
}
```

### EventSnapshot

```prisma
model EventSnapshot {
  id               String    @id @default(uuid(7)) @db.Uuid
  version          Int       @default(1)
  createdAt        DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime  @db.Timestamptz(6)
  tenantId         String    @db.Uuid
  deletedAt        DateTime? @db.Timestamptz(6)
  deletedByActorId String?   @db.Uuid
  createdByActorId String?   @db.Uuid
  updatedByActorId String?   @db.Uuid
  aggregateType    String
  aggregateId      String
  snapshot         Json
  aggregateVersion Int

  @@unique([tenantId, aggregateType, aggregateId, aggregateVersion])
  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, aggregateType, aggregateId])
  @@index([tenantId, deletedAt])
}
```

### TenantAuditLog

```prisma
model TenantAuditLog {
  id                 String                    @id @default(uuid(7)) @db.Uuid
  status             PlatformTenantChildStatus @default(ACTIVE)
  version            Int                       @default(1)
  createdAt          DateTime                  @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                  @db.Timestamptz(6)
  tenantId           String                    @db.Uuid
  deletedAt          DateTime?                 @db.Timestamptz(6)
  deletedByActorId   String?                   @db.Uuid
  createdByActorId   String?                   @db.Uuid
  updatedByActorId   String?                   @db.Uuid
  auditCorrelationId String?                   @db.Uuid
  dataClassification String                    @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  action             AuditAction               @default(READ)
  targetModel        String                    @db.VarChar(100)
  targetId           String?                   @db.Uuid
  targetName         String?                   @db.VarChar(255)
  actorId            String?                   @db.Uuid
  actorType          String?                   @db.VarChar(50)
  actorName          String?                   @db.VarChar(255)
  requestId          String?                   @db.Uuid
  sessionId          String?                   @db.Uuid
  ipAddress          String?                   @db.VarChar(45)
  userAgent          String?
  oldValues          Json?
  newValues          Json?
  changedFields      String[]                  @db.VarChar(100)
  payloadHash        String?                   @db.VarChar(64)
  riskLevel          ImpactLevel               @default(LOW)
  complianceFlags    String[]                  @db.VarChar(50)
  metadata           Json?
  tags               String[]                  @db.VarChar(50)
  success            Boolean                   @default(true)
  errorCode          String?                   @db.VarChar(50)
  errorMessage       String?
  Tenant             Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, action])
  @@index([tenantId, actorId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, createdAt], type: Brin)
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, requestId])
  @@index([tenantId, riskLevel])
  @@index([tenantId, status])
  @@index([tenantId, success])
  @@index([tenantId, targetModel])
  @@index([tenantId, targetModel, targetId])
}
```

### Label

```prisma
model Label {
  id               String    @id @default(uuid(7)) @db.Uuid
  status           String    @default("ACTIVE")
  version          Int       @default(1)
  createdAt        DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime  @db.Timestamptz(6)
  deletedAt        DateTime? @db.Timestamptz(6)
  deletedByActorId String?   @db.Uuid
  createdByActorId String?   @db.Uuid
  updatedByActorId String?   @db.Uuid
}
```

### Actor

```prisma
model Actor {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             ActorStatus      @default(ACTIVE)
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("INTERNAL")
  retentionPolicy    RetentionPolicy?

  // Core identification
  actorType   ActorType
  globalId    String    @unique @db.VarChar(255) // Cross-tenant identifier
  displayName String    @db.VarChar(255)
  description String?

  // Entity references (only one should be set based on actorType)
  userId            String? @unique @db.Uuid // For USER type
  serviceAccountId  String? @unique @db.Uuid // For SERVICE_ACCOUNT type
  apiKeyId          String? @unique @db.Uuid // For API_KEY type
  systemProcessName String? @db.VarChar(100) // For SYSTEM type

  // Actor capabilities and constraints
  isActive          Boolean @default(true)
  isSystem          Boolean @default(false)
  canPerformActions Boolean @default(true)
  requiresMfa       Boolean @default(false)

  // Security and monitoring
  lastActivityAt      DateTime? @db.Timestamptz(6)
  lastLoginAt         DateTime? @db.Timestamptz(6)
  lastIpAddress       String?   @db.Inet
  sessionCount        Int       @default(0)
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime? @db.Timestamptz(6)

  // Audit and compliance
  riskScore       Int?     @default(0) @db.SmallInt // 0-100
  complianceLevel String?  @db.VarChar(50)
  auditFlags      String[] @default([])

  // Metadata and context
  tags     String[] @default([])
  metadata Json?    @default("{}")

  // Self-referential relationships for audit trail
  DeletedByActor Actor? @relation("ActorDeletedBy", fields: [deletedByActorId], references: [id])
  CreatedByActor Actor? @relation("ActorCreatedBy", fields: [createdByActorId], references: [id])
  UpdatedByActor Actor? @relation("ActorUpdatedBy", fields: [updatedByActorId], references: [id])

  ActorsDeleted Actor[] @relation("ActorDeletedBy")
  ActorsCreated Actor[] @relation("ActorCreatedBy")
  ActorsUpdated Actor[] @relation("ActorUpdatedBy")

  // Related entity relationships (these will be added when those models exist)
  // User                  User?         @relation(fields: [userId], references: [id])
  // ServiceAccount        ServiceAccount? @relation(fields: [serviceAccountId], references: [id])
  // ApiKey                ApiKey?       @relation(fields: [apiKeyId], references: [id])

  // =============================================================================
  // CRITICAL MODULE RELATIONSHIPS
  // =============================================================================

  // Financial Modules
  InvoicesCreated Invoice[] @relation("InvoiceCreatedByActor")
  InvoicesUpdated Invoice[] @relation("InvoiceUpdatedByActor")
  InvoicesDeleted Invoice[] @relation("InvoiceDeletedByActor")

  APBillsCreated APBill[] @relation("APBillCreatedByActor")
  APBillsUpdated APBill[] @relation("APBillUpdatedByActor")
  APBillsDeleted APBill[] @relation("APBillDeletedByActor")

  EstimatesCreated Estimate[] @relation("EstimateCreatedByActor")
  EstimatesUpdated Estimate[] @relation("EstimateUpdatedByActor")
  EstimatesDeleted Estimate[] @relation("EstimateDeletedByActor")

  // Project Management
  ProjectsCreated Project[] @relation("ProjectCreatedByActor")
  ProjectsUpdated Project[] @relation("ProjectUpdatedByActor")
  ProjectsDeleted Project[] @relation("ProjectDeletedByActor")

  TasksCreated Task[] @relation("TaskCreatedByActor")
  TasksUpdated Task[] @relation("TaskUpdatedByActor")
  TasksDeleted Task[] @relation("TaskDeletedByActor")

  // Access Control & Identity
  UsersCreated User[] @relation("UserCreatedByActor")
  UsersUpdated User[] @relation("UserUpdatedByActor")
  UsersDeleted User[] @relation("UserDeletedByActor")

  // Procurement
  PurchaseOrdersCreated PurchaseOrder[] @relation("PurchaseOrderCreatedByActor")
  PurchaseOrdersUpdated PurchaseOrder[] @relation("PurchaseOrderUpdatedByActor")
  PurchaseOrdersDeleted PurchaseOrder[] @relation("PurchaseOrderDeletedByActor")

  // Compliance & Audit
  ApprovalRequestsCreated ApprovalRequest[] @relation("ApprovalRequestCreatedByActor")
  ApprovalRequestsUpdated ApprovalRequest[] @relation("ApprovalRequestUpdatedByActor")
  ApprovalRequestsDeleted ApprovalRequest[] @relation("ApprovalRequestDeletedByActor")

  // RoomPlan Module
  RoomScanSessionsCreated RoomScanSession[] @relation("RoomScanSessionCreatedBy")
  RoomScanSessionsUpdated RoomScanSession[] @relation("RoomScanSessionUpdatedBy")
  RoomScanSessionsDeleted RoomScanSession[] @relation("RoomScanSessionDeletedBy")

  RoomModelsCreated RoomModel[] @relation("RoomModelCreatedBy")
  RoomModelsUpdated RoomModel[] @relation("RoomModelUpdatedBy")
  RoomModelsDeleted RoomModel[] @relation("RoomModelDeletedBy")

  RoomAnnotationsCreated RoomAnnotation[] @relation("RoomAnnotationCreatedBy")
  RoomExportsCreated     RoomExport[]     @relation("RoomExportCreatedBy")

  RoomPlanPresetsCreated RoomPlanPreset[] @relation("RoomPlanPresetCreatedBy")
  RoomPlanPresetsUpdated RoomPlanPreset[] @relation("RoomPlanPresetUpdatedBy")

  @@index([actorType])
  @@index([globalId])
  @@index([isActive])
  @@index([isSystem])
  @@index([lastActivityAt])
  @@index([riskScore])
  @@index([complianceLevel])
  @@index([userId])
  @@index([serviceAccountId])
  @@index([apiKeyId])
  @@index([systemProcessName])
  @@index([createdAt], type: Brin)
  @@index([auditCorrelationId])
  @@index([dataClassification])
  @@index([deletedAt])
  @@index([status])
}
```

## 🧩 Enums

### ActorStatus

```prisma
enum ActorStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  LOCKED
  EXPIRED
  ARCHIVED
}
```

### ActorType

```prisma
enum ActorType {
  USER
  SERVICE_ACCOUNT
  API_KEY
  SYSTEM
  INTEGRATION
  WEBHOOK
  AUTOMATION
  MONITORING
}
```

### AuditAction

```prisma
enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  APPROVE
  REJECT
  ASSIGN
  TRANSFER
  EXPORT
  IMPORT
  BACKUP
  RESTORE
}
```

### BillingAccountStatus

```prisma
enum BillingAccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION
  VERIFICATION_FAILED
  CLOSED
}
```

### DataIsolationLevel

```prisma
enum DataIsolationLevel {
  SHARED_DATABASE
  DEDICATED_SCHEMA
  DEDICATED_DATABASE
  DEDICATED_INSTANCE
}
```

### EventType

```prisma
enum EventType {
  TENANT_PROVISIONED
  TENANT_SUSPENDED
  TENANT_ACTIVATED
  SUBSCRIPTION_CREATED
  SUBSCRIPTION_UPDATED
  SUBSCRIPTION_CANCELED
  USAGE_RECORDED
  FEATURE_FLAG_TOGGLED
  BILLING_CYCLE_COMPLETED
  AUDIT_LOG_CREATED
  USER_INVITED
  USER_ACTIVATED
  PROJECT_CREATED
  PROJECT_COMPLETED
  ESTIMATE_APPROVED
  INVOICE_GENERATED
}
```

### FeatureDataType

```prisma
enum FeatureDataType {
  INTEGER
  DECIMAL
  STRING
  BOOLEAN
  DATE
  DATETIME
  JSON
  ARRAY
}
```

### FeatureFlagScope

```prisma
enum FeatureFlagScope {
  GLOBAL
  TENANT
  USER
  ROLE
}
```

### FeatureType

```prisma
enum FeatureType {
  NUMERICAL
  CATEGORICAL
  TEMPORAL
  TEXTUAL
  BOOLEAN
  COMPOSITE
  DERIVED
  AGGREGATED
}
```

### ImpactLevel

```prisma
enum ImpactLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### MigrationStatus

```prisma
enum MigrationStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  FAILED
  ROLLBACK_IN_PROGRESS
  ROLLBACK_COMPLETED
}
```

### NumberSequenceResetMode

```prisma
enum NumberSequenceResetMode {
  NEVER
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

### PaymentProvider

```prisma
enum PaymentProvider {
  STRIPE
  PAYPAL
  SQUARE
  BRAINTREE
  AUTHORIZE_NET
  ADYEN
  RAZORPAY
  INTERNAL
}
```

### PlatformTenantChildStatus

```prisma
enum PlatformTenantChildStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### RetentionPolicy

```prisma
enum RetentionPolicy {
  DAYS_30
  DAYS_90
  MONTHS_6
  YEAR_1
  YEARS_3
  YEARS_7
  YEARS_10
  PERMANENT
}
```

### SubscriptionInterval

```prisma
enum SubscriptionInterval {
  MONTHLY
  QUARTERLY
  YEARLY
  WEEKLY
  DAILY
}
```

### SubscriptionStatus

```prisma
enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  UNPAID
  PAUSED
  PENDING_CANCELLATION
}
```

### TenantDeploymentType

```prisma
enum TenantDeploymentType {
  SHARED
  DEDICATED
  HYBRID
  ON_PREMISE
}
```

### TenantRegion

```prisma
enum TenantRegion {
  US_EAST_1
  US_WEST_1
  US_WEST_2
  EU_WEST_1
  EU_CENTRAL_1
  AP_SOUTHEAST_1
  AP_NORTHEAST_1
  CA_CENTRAL_1
}
```

### TenantStatus

```prisma
enum TenantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_ACTIVATION
  MIGRATING
  ARCHIVED
  DELETED
}
```

### TenantTier

```prisma
enum TenantTier {
  STARTER
  PROFESSIONAL
  ENTERPRISE
  CUSTOM
}
```

### UsageMetric

```prisma
enum UsageMetric {
  API_CALLS
  STORAGE_GB
  PROJECTS
  USERS
  DOCUMENTS
  BANDWIDTH_GB
  COMPUTE_HOURS
  TRANSACTIONS
  REPORTS_GENERATED
  INTEGRATIONS
}
```

_Mapped from ERP docs; extracted from schema.prisma_