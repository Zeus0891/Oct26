# access-control — Tables and Enums

## 🧱 Models

### Member

```prisma
model Member {
  id                                                                         String                       @id @default(uuid(7)) @db.Uuid
  status                                                                     MemberStatus                 @default(ACTIVE)
  version                                                                    Int                          @default(1)
  createdAt                                                                  DateTime                     @default(now()) @db.Timestamptz(6)
  updatedAt                                                                  DateTime                     @db.Timestamptz(6)
  tenantId                                                                   String                       @db.Uuid
  deletedAt                                                                  DateTime?                    @db.Timestamptz(6)
  deletedByActorId                                                           String?                      @db.Uuid
  createdByActorId                                                           String?                      @db.Uuid
  updatedByActorId                                                           String?                      @db.Uuid
  auditCorrelationId                                                         String?                      @db.Uuid
  dataClassification                                                         String                       @default("INTERNAL")
  retentionPolicy                                                            RetentionPolicy?
  userId                                                                     String                       @db.Uuid
  memberNumber                                                               String?                      @db.VarChar(50)
  displayName                                                                String?                      @db.VarChar(255)
  title                                                                      String?                      @db.VarChar(100)
  department                                                                 String?                      @db.VarChar(100)
  workEmail                                                                  String?                      @db.Citext
  workPhone                                                                  String?                      @db.VarChar(50)
  mobilePhone                                                                String?                      @db.VarChar(50)
  employeeId                                                                 String?                      @db.VarChar(50)
  hireDate                                                                   DateTime?                    @db.Timestamptz(6)
  startDate                                                                  DateTime?                    @db.Timestamptz(6)
  endDate                                                                    DateTime?                    @db.Timestamptz(6)
  isActive                                                                   Boolean                      @default(true)
  lastAccessAt                                                               DateTime?                    @db.Timestamptz(6)
  accessLevel                                                                String                       @default("STANDARD") @db.VarChar(20)
  invitedAt                                                                  DateTime?                    @db.Timestamptz(6)
  invitedByMemberId                                                          String?                      @db.Uuid
  acceptedAt                                                                 DateTime?                    @db.Timestamptz(6)
  onboardedAt                                                                DateTime?                    @db.Timestamptz(6)
  suspendedAt                                                                DateTime?                    @db.Timestamptz(6)
  suspendedReason                                                            String?
  terminatedAt                                                               DateTime?                    @db.Timestamptz(6)
  terminationReason                                                          String?
  terminatedByMemberId                                                       String?                      @db.Uuid
  costCenter                                                                 String?                      @db.VarChar(50)
  billableRate                                                               Decimal?                     @db.Decimal(10, 2)
  currency                                                                   String                       @default("USD") @db.VarChar(3)
  metadata                                                                   Json?
  tags                                                                       String[]                     @db.VarChar(50)
  ApiKey_ApiKey_memberIdToMember                                             ApiKey[]                     @relation("ApiKey_memberIdToMember")
  ApiKey_ApiKey_revokedByMemberIdToMember                                    ApiKey[]                     @relation("ApiKey_revokedByMemberIdToMember")
  ApprovalDecision_ApprovalDecision_tenantId_approverIdToMember              ApprovalDecision[]           @relation("ApprovalDecision_tenantId_approverIdToMember")
  ApprovalDecision_ApprovalDecision_tenantId_delegatedFromIdToMember         ApprovalDecision[]           @relation("ApprovalDecision_tenantId_delegatedFromIdToMember")
  ApprovalRequest_ApprovalRequest_tenantId_currentApproverToMember           ApprovalRequest[]            @relation("ApprovalRequest_tenantId_currentApproverToMember")
  ApprovalRequest_ApprovalRequest_tenantId_finalDecisionByToMember           ApprovalRequest[]            @relation("ApprovalRequest_tenantId_finalDecisionByToMember")
  ApprovalRequest_ApprovalRequest_tenantId_submittedByIdToMember             ApprovalRequest[]            @relation("ApprovalRequest_tenantId_submittedByIdToMember")
  Attachment_Attachment_tenantId_approvedByIdToMember                        Attachment[]                 @relation("Attachment_tenantId_approvedByIdToMember")
  Attachment_Attachment_tenantId_attachedByIdToMember                        Attachment[]                 @relation("Attachment_tenantId_attachedByIdToMember")
  AttachmentLink_AttachmentLink_tenantId_linkedByIdToMember                  AttachmentLink[]             @relation("AttachmentLink_tenantId_linkedByIdToMember")
  AttachmentLink_AttachmentLink_tenantId_unlinkedByIdToMember                AttachmentLink[]             @relation("AttachmentLink_tenantId_unlinkedByIdToMember")
  AuthFactor                                                                 AuthFactor[]
  BillApproval_BillApproval_tenantId_approverIdToMember                      BillApproval[]               @relation("BillApproval_tenantId_approverIdToMember")
  BillApproval_BillApproval_tenantId_delegatedFromToMember                   BillApproval[]               @relation("BillApproval_tenantId_delegatedFromToMember")
  BillPayment                                                                BillPayment[]
  Certification_Certification_tenantId_approvedByIdToMember                  Certification[]              @relation("Certification_tenantId_approvedByIdToMember")
  Certification_Certification_tenantId_hrReviewedByIdToMember                Certification[]              @relation("Certification_tenantId_hrReviewedByIdToMember")
  Certification_Certification_tenantId_verifiedByIdToMember                  Certification[]              @relation("Certification_tenantId_verifiedByIdToMember")
  Channel_Channel_tenantId_archivedByIdToMember                              Channel[]                    @relation("Channel_tenantId_archivedByIdToMember")
  Channel_Channel_tenantId_creatorIdToMember                                 Channel[]                    @relation("Channel_tenantId_creatorIdToMember")
  Channel_Channel_tenantId_ownerIdToMember                                   Channel[]                    @relation("Channel_tenantId_ownerIdToMember")
  ChannelMember_ChannelMember_tenantId_bannedByIdToMember                    ChannelMember[]              @relation("ChannelMember_tenantId_bannedByIdToMember")
  ChannelMember_ChannelMember_tenantId_invitedByIdToMember                   ChannelMember[]              @relation("ChannelMember_tenantId_invitedByIdToMember")
  ChannelMember_ChannelMember_tenantId_kickedByIdToMember                    ChannelMember[]              @relation("ChannelMember_tenantId_kickedByIdToMember")
  ChannelMember_ChannelMember_tenantId_memberIdToMember                      ChannelMember[]              @relation("ChannelMember_tenantId_memberIdToMember")
  Chargeback_Chargeback_tenantId_assignedToIdToMember                        Chargeback[]                 @relation("Chargeback_tenantId_assignedToIdToMember")
  Chargeback_Chargeback_tenantId_resolvedByIdToMember                        Chargeback[]                 @relation("Chargeback_tenantId_resolvedByIdToMember")
  ChargebackEvidence                                                         ChargebackEvidence[]
  ClockInClockOut                                                            ClockInClockOut[]
  CostCenter                                                                 CostCenter[]
  CreditMemo                                                                 CreditMemo[]
  DailyLog                                                                   DailyLog[]
  Department_Department_tenantId_assistantManagerIdToMember                  Department[]                 @relation("Department_tenantId_assistantManagerIdToMember")
  Department_Department_tenantId_budgetOwnerIdToMember                       Department[]                 @relation("Department_tenantId_budgetOwnerIdToMember")
  Department_Department_tenantId_managerIdToMember                           Department[]                 @relation("Department_tenantId_managerIdToMember")
  DirectChat_DirectChat_tenantId_archivedByIdToMember                        DirectChat[]                 @relation("DirectChat_tenantId_archivedByIdToMember")
  DirectChat_DirectChat_tenantId_participant1IdToMember                      DirectChat[]                 @relation("DirectChat_tenantId_participant1IdToMember")
  DirectChat_DirectChat_tenantId_participant2IdToMember                      DirectChat[]                 @relation("DirectChat_tenantId_participant2IdToMember")
  DirectMessage_DirectMessage_tenantId_flaggedByIdToMember                   DirectMessage[]              @relation("DirectMessage_tenantId_flaggedByIdToMember")
  DirectMessage_DirectMessage_tenantId_receiverIdToMember                    DirectMessage[]              @relation("DirectMessage_tenantId_receiverIdToMember")
  DirectMessage_DirectMessage_tenantId_senderIdToMember                      DirectMessage[]              @relation("DirectMessage_tenantId_senderIdToMember")
  DirectMessageRead                                                          DirectMessageRead[]
  DunningNotice_DunningNotice_tenantId_assignedToMemberIdToMember            DunningNotice[]              @relation("DunningNotice_tenantId_assignedToMemberIdToMember")
  DunningNotice_DunningNotice_tenantId_sentByMemberIdToMember                DunningNotice[]              @relation("DunningNotice_tenantId_sentByMemberIdToMember")
  ESignatureEnvelope                                                         ESignatureEnvelope[]
  ESignatureRecipient                                                        ESignatureRecipient[]
  Estimate_Estimate_tenantId_approvedByMemberIdToMember                      Estimate[]                   @relation("Estimate_tenantId_approvedByMemberIdToMember")
  Estimate_Estimate_tenantId_finalApprovedByMemberIdToMember                 Estimate[]                   @relation("Estimate_tenantId_finalApprovedByMemberIdToMember")
  ExpenseApproval                                                            ExpenseApproval[]
  ExternalShareLink_ExternalShareLink_tenantId_createdByIdToMember           ExternalShareLink[]          @relation("ExternalShareLink_tenantId_createdByIdToMember")
  ExternalShareLink_ExternalShareLink_tenantId_revokedByIdToMember           ExternalShareLink[]          @relation("ExternalShareLink_tenantId_revokedByIdToMember")
  FileObject                                                                 FileObject[]
  GoodsReceipt_GoodsReceipt_tenantId_completedByToMember                     GoodsReceipt[]               @relation("GoodsReceipt_tenantId_completedByToMember")
  GoodsReceipt_GoodsReceipt_tenantId_inspectedByToMember                     GoodsReceipt[]               @relation("GoodsReceipt_tenantId_inspectedByToMember")
  GoodsReceipt_GoodsReceipt_tenantId_receivedByToMember                      GoodsReceipt[]               @relation("GoodsReceipt_tenantId_receivedByToMember")
  GoodsReceiptLine                                                           GoodsReceiptLine[]
  IdentityProviderConnection                                                 IdentityProviderConnection[]
  IntegrationConnector                                                       IntegrationConnector[]
  Invoice                                                                    Invoice[]
  InvoiceAttachment                                                          InvoiceAttachment[]
  JournalEntry                                                               JournalEntry[]
  Leave_Leave_tenantId_approvedByIdToMember                                  Leave[]                      @relation("Leave_tenantId_approvedByIdToMember")
  Leave_Leave_tenantId_requestedByIdToMember                                 Leave[]                      @relation("Leave_tenantId_requestedByIdToMember")
  Location_Location_tenantId_facilityManagerIdToMember                       Location[]                   @relation("Location_tenantId_facilityManagerIdToMember")
  Location_Location_tenantId_managerIdToMember                               Location[]                   @relation("Location_tenantId_managerIdToMember")
  Tenant                                                                     Tenant                       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Member_Member_tenantId_invitedByMemberIdToMember                           Member?                      @relation("Member_tenantId_invitedByMemberIdToMember", fields: [tenantId, invitedByMemberId], references: [tenantId, id])
  other_Member_Member_tenantId_invitedByMemberIdToMember                     Member[]                     @relation("Member_tenantId_invitedByMemberIdToMember")
  Member_Member_tenantId_terminatedByMemberIdToMember                        Member?                      @relation("Member_tenantId_terminatedByMemberIdToMember", fields: [tenantId, terminatedByMemberId], references: [tenantId, id])
  other_Member_Member_tenantId_terminatedByMemberIdToMember                  Member[]                     @relation("Member_tenantId_terminatedByMemberIdToMember")
  User                                                                       User                         @relation(fields: [userId], references: [id])
  MemberDocument_MemberDocument_tenantId_memberIdToMember                    MemberDocument[]             @relation("MemberDocument_tenantId_memberIdToMember")
  MemberDocument_MemberDocument_tenantId_uploadedByIdToMember                MemberDocument[]             @relation("MemberDocument_tenantId_uploadedByIdToMember")
  MemberDocument_MemberDocument_tenantId_verifiedByIdToMember                MemberDocument[]             @relation("MemberDocument_tenantId_verifiedByIdToMember")
  MemberRole_MemberRole_approvedByMemberIdToMember                           MemberRole[]                 @relation("MemberRole_approvedByMemberIdToMember")
  MemberRole_MemberRole_assignedByMemberIdToMember                           MemberRole[]                 @relation("MemberRole_assignedByMemberIdToMember")
  MemberRole_MemberRole_deactivatedByMemberIdToMember                        MemberRole[]                 @relation("MemberRole_deactivatedByMemberIdToMember")
  MemberRole_MemberRole_delegatedToMemberIdToMember                          MemberRole[]                 @relation("MemberRole_delegatedToMemberIdToMember")
  MemberRole_MemberRole_memberIdToMember                                     MemberRole[]                 @relation("MemberRole_memberIdToMember")
  MemberSettings                                                             MemberSettings?
  Message_Message_tenantId_editedByIdToMember                                Message[]                    @relation("Message_tenantId_editedByIdToMember")
  Message_Message_tenantId_flaggedByIdToMember                               Message[]                    @relation("Message_tenantId_flaggedByIdToMember")
  Message_Message_tenantId_moderatedByIdToMember                             Message[]                    @relation("Message_tenantId_moderatedByIdToMember")
  Message_Message_tenantId_senderIdToMember                                  Message[]                    @relation("Message_tenantId_senderIdToMember")
  MessageAttachment                                                          MessageAttachment[]
  MessageRead                                                                MessageRead[]
  Milestone_Milestone_tenantId_completedByIdToMember                         Milestone[]                  @relation("Milestone_tenantId_completedByIdToMember")
  Milestone_Milestone_tenantId_ownerIdToMember                               Milestone[]                  @relation("Milestone_tenantId_ownerIdToMember")
  MilestoneStakeholder_MilestoneStakeholder_tenantId_assignedByIdToMember    MilestoneStakeholder[]       @relation("MilestoneStakeholder_tenantId_assignedByIdToMember")
  MilestoneStakeholder_MilestoneStakeholder_tenantId_stakeholderIdToMember   MilestoneStakeholder[]       @relation("MilestoneStakeholder_tenantId_stakeholderIdToMember")
  OrgUnit                                                                    OrgUnit[]
  PasswordResetToken_PasswordResetToken_invalidatedByMemberIdToMember        PasswordResetToken[]         @relation("PasswordResetToken_invalidatedByMemberIdToMember")
  PasswordResetToken_PasswordResetToken_memberIdToMember                     PasswordResetToken[]         @relation("PasswordResetToken_memberIdToMember")
  Payout                                                                     Payout[]
  PayrollAdjustment                                                          PayrollAdjustment[]
  PayrollItem                                                                PayrollItem[]
  PayrollPayment                                                             PayrollPayment[]
  PayrollRun_PayrollRun_tenantId_approvedByIdToMember                        PayrollRun[]                 @relation("PayrollRun_tenantId_approvedByIdToMember")
  PayrollRun_PayrollRun_tenantId_processedByIdToMember                       PayrollRun[]                 @relation("PayrollRun_tenantId_processedByIdToMember")
  PayrollTax                                                                 PayrollTax[]
  PerformanceGoal                                                            PerformanceGoal[]
  PerformanceReview_PerformanceReview_tenantId_approvedByIdToMember          PerformanceReview[]          @relation("PerformanceReview_tenantId_approvedByIdToMember")
  PerformanceReview_PerformanceReview_tenantId_hrReviewedByIdToMember        PerformanceReview[]          @relation("PerformanceReview_tenantId_hrReviewedByIdToMember")
  PerformanceReview_PerformanceReview_tenantId_reviewerIdToMember            PerformanceReview[]          @relation("PerformanceReview_tenantId_reviewerIdToMember")
  Project_Project_tenantId_approvedByMemberIdToMember                        Project[]                    @relation("Project_tenantId_approvedByMemberIdToMember")
  Project_Project_tenantId_finalApprovedByMemberIdToMember                   Project[]                    @relation("Project_tenantId_finalApprovedByMemberIdToMember")
  ProjectDocument                                                            ProjectDocument[]
  ProjectIssue                                                               ProjectIssue[]
  ProjectMember                                                              ProjectMember[]
  ProjectRisk                                                                ProjectRisk[]
  ProjectTaskAssignment                                                      ProjectTaskAssignment[]
  ProjectTaskComment                                                         ProjectTaskComment[]
  PunchListItem                                                              PunchListItem[]
  PurchaseOrder                                                              PurchaseOrder[]
  PurchaseOrderApproval_PurchaseOrderApproval_tenantId_approverIdToMember    PurchaseOrderApproval[]      @relation("PurchaseOrderApproval_tenantId_approverIdToMember")
  PurchaseOrderApproval_PurchaseOrderApproval_tenantId_delegatedFromToMember PurchaseOrderApproval[]      @relation("PurchaseOrderApproval_tenantId_delegatedFromToMember")
  RFI_RFI_tenantId_assigneeIdToMember                                        RFI[]                        @relation("RFI_tenantId_assigneeIdToMember")
  RFI_RFI_tenantId_submitterIdToMember                                       RFI[]                        @relation("RFI_tenantId_submitterIdToMember")
  RFIReply                                                                   RFIReply[]
  RFQResponse_RFQResponse_tenantId_awardedByToMember                         RFQResponse[]                @relation("RFQResponse_tenantId_awardedByToMember")
  RFQResponse_RFQResponse_tenantId_evaluatedByToMember                       RFQResponse[]                @relation("RFQResponse_tenantId_evaluatedByToMember")
  Reconciliation_Reconciliation_tenantId_reconciledByIdToMember              Reconciliation[]             @relation("Reconciliation_tenantId_reconciledByIdToMember")
  Reconciliation_Reconciliation_tenantId_reviewedByIdToMember                Reconciliation[]             @relation("Reconciliation_tenantId_reviewedByIdToMember")
  Refund                                                                     Refund[]
  ResourceAllocation_ResourceAllocation_tenantId_approvedByIdToMember        ResourceAllocation[]         @relation("ResourceAllocation_tenantId_approvedByIdToMember")
  ResourceAllocation_ResourceAllocation_tenantId_assignedByIdToMember        ResourceAllocation[]         @relation("ResourceAllocation_tenantId_assignedByIdToMember")
  ResourceAllocation_ResourceAllocation_tenantId_assignedToIdToMember        ResourceAllocation[]         @relation("ResourceAllocation_tenantId_assignedToIdToMember")
  RolePermission_RolePermission_approvedByMemberIdToMember                   RolePermission[]             @relation("RolePermission_approvedByMemberIdToMember")
  RolePermission_RolePermission_assignedByMemberIdToMember                   RolePermission[]             @relation("RolePermission_assignedByMemberIdToMember")
  RolePermission_RolePermission_memberIdToMember                             RolePermission[]             @relation("RolePermission_memberIdToMember")
  RolePermission_RolePermission_revokedByMemberIdToMember                    RolePermission[]             @relation("RolePermission_revokedByMemberIdToMember")
  ScheduleException                                                          ScheduleException[]
  ServiceAccount                                                             ServiceAccount[]
  ServiceAccountKey                                                          ServiceAccountKey[]
  Session_Session_memberIdToMember                                           Session[]                    @relation("Session_memberIdToMember")
  Session_Session_terminatedByMemberIdToMember                               Session[]                    @relation("Session_terminatedByMemberIdToMember")
  SignatureEvent                                                             SignatureEvent[]
  SubmittalItem                                                              SubmittalItem[]
  Task                                                                       Task[]
  TaskAssignment                                                             TaskAssignment[]
  TaskAttachment                                                             TaskAttachment[]
  TaskChecklistItem_TaskChecklistItem_tenantId_completedByIdToMember         TaskChecklistItem[]          @relation("TaskChecklistItem_tenantId_completedByIdToMember")
  TaskChecklistItem_TaskChecklistItem_tenantId_validatedByIdToMember         TaskChecklistItem[]          @relation("TaskChecklistItem_tenantId_validatedByIdToMember")
  Timesheet_Timesheet_tenantId_approvedByIdToMember                          Timesheet[]                  @relation("Timesheet_tenantId_approvedByIdToMember")
  Timesheet_Timesheet_tenantId_submittedByIdToMember                         Timesheet[]                  @relation("Timesheet_tenantId_submittedByIdToMember")
  TimesheetApproval                                                          TimesheetApproval[]
  TimesheetEntry                                                             TimesheetEntry[]
  UserDevice_UserDevice_memberIdToMember                                     UserDevice[]                 @relation("UserDevice_memberIdToMember")
  UserDevice_UserDevice_revokedByMemberIdToMember                            UserDevice[]                 @relation("UserDevice_revokedByMemberIdToMember")
  Vendor                                                                     Vendor[]
  VendorDocument                                                             VendorDocument[]
  weather_alert_deliveries                                                   weather_alert_deliveries[]
  weather_alerts                                                             weather_alerts[]
  weather_incidents_weather_incidents_tenantId_approvedByMemberIdToMember    weather_incidents[]          @relation("weather_incidents_tenantId_approvedByMemberIdToMember")
  weather_incidents_weather_incidents_tenantId_reportedByMemberIdToMember    weather_incidents[]          @relation("weather_incidents_tenantId_reportedByMemberIdToMember")
  weather_incidents_weather_incidents_tenantId_verifiedByMemberIdToMember    weather_incidents[]          @relation("weather_incidents_tenantId_verifiedByMemberIdToMember")
  // New CRM relations
  QuoteApproval_RequestedBy                                                  QuoteApproval[]              @relation("QuoteApproval_requestedBy")
  QuoteApproval_ApprovedBy                                                   QuoteApproval[]              @relation("QuoteApproval_approvedBy")
  QuoteApproval_EscalatedTo                                                  QuoteApproval[]              @relation("QuoteApproval_escalatedTo")
  Territory_Manager                                                          Territory[]

  @@unique([tenantId, employeeId])
  @@unique([tenantId, id])
  @@unique([tenantId, memberNumber])
  @@unique([tenantId, userId])
  @@index([createdAt], type: Brin)
  @@index([invitedByMemberId])
  @@index([tenantId, accessLevel])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, department])
  @@index([tenantId, isActive])
  @@index([tenantId, status])
  @@index([tenantId, userId])
  @@index([tenantId, workEmail])
  @@index([terminatedByMemberId])
  @@index([tenantId, deletedAt], map: "idx_member_tenant_deleted")
}
```

### MemberSettings

```prisma
model MemberSettings {
  id                   String           @id @default(uuid(7)) @db.Uuid
  status               String           @default("ACTIVE")
  version              Int              @default(1)
  createdAt            DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt            DateTime         @db.Timestamptz(6)
  tenantId             String           @db.Uuid
  deletedAt            DateTime?        @db.Timestamptz(6)
  deletedByActorId     String?          @db.Uuid
  createdByActorId     String?          @db.Uuid
  updatedByActorId     String?          @db.Uuid
  auditCorrelationId   String?          @db.Uuid
  dataClassification   String           @default("INTERNAL")
  retentionPolicy      RetentionPolicy?
  memberId             String           @unique @db.Uuid
  theme                ThemePreference  @default(SYSTEM)
  primaryColor         String?          @db.VarChar(20)
  fontSize             String           @default("medium") @db.VarChar(20)
  density              String           @default("comfortable") @db.VarChar(20)
  language             String?          @db.VarChar(10)
  locale               String?          @db.VarChar(10)
  timezone             String?          @db.VarChar(50)
  dateFormat           String           @default("MM/dd/yyyy") @db.VarChar(20)
  timeFormat           String           @default("12h") @db.VarChar(10)
  numberFormat         String           @default("US") @db.VarChar(10)
  emailNotifications   Boolean          @default(true)
  pushNotifications    Boolean          @default(true)
  smsNotifications     Boolean          @default(false)
  inAppNotifications   Boolean          @default(true)
  notifyOnAssignment   Boolean          @default(true)
  notifyOnMention      Boolean          @default(true)
  notifyOnDeadline     Boolean          @default(true)
  notifyOnApproval     Boolean          @default(true)
  notifyOnComment      Boolean          @default(true)
  notifyOnStatusChange Boolean          @default(true)
  dashboardLayout      Json?
  sidebarCollapsed     Boolean          @default(false)
  quickActions         String[]         @db.VarChar(100)
  favoriteViews        String[]         @db.VarChar(100)
  workingHoursStart    String?          @db.VarChar(10)
  workingHoursEnd      String?          @db.VarChar(10)
  workingDays          String[]         @db.VarChar(10)
  autoSaveInterval     Int              @default(30)
  profileVisibility    String           @default("TEAM") @db.VarChar(20)
  activityVisibility   String           @default("TEAM") @db.VarChar(20)
  allowAnalytics       Boolean          @default(true)
  keyboardShortcuts    Boolean          @default(true)
  animations           Boolean          @default(true)
  soundEffects         Boolean          @default(false)
  betaFeatures         Boolean          @default(false)
  customSettings       Json?
  Member               Member           @relation(fields: [memberId], references: [id], onDelete: Cascade)
  Tenant               Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, memberId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, language])
  @@index([tenantId, status])
  @@index([tenantId, theme])
  @@index([tenantId, timezone])
}
```

### MemberRole

```prisma
model MemberRole {
  id                                              String           @id @default(uuid(7)) @db.Uuid
  status                                          String           @default("ACTIVE")
  version                                         Int              @default(1)
  createdAt                                       DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                       DateTime         @db.Timestamptz(6)
  tenantId                                        String           @db.Uuid
  deletedAt                                       DateTime?        @db.Timestamptz(6)
  deletedByActorId                                String?          @db.Uuid
  createdByActorId                                String?          @db.Uuid
  updatedByActorId                                String?          @db.Uuid
  auditCorrelationId                              String?          @db.Uuid
  dataClassification                              String           @default("INTERNAL")
  retentionPolicy                                 RetentionPolicy?
  memberId                                        String           @db.Uuid
  roleId                                          String           @db.Uuid
  isPrimary                                       Boolean          @default(false)
  isDefault                                       Boolean          @default(false)
  priority                                        Int              @default(100)
  effectiveFrom                                   DateTime         @default(now()) @db.Timestamptz(6)
  effectiveTo                                     DateTime?        @db.Timestamptz(6)
  scope                                           AssignmentScope  @default(GLOBAL)
  scopeResourceId                                 String?          @db.Uuid
  scopeResourceType                               String?          @db.VarChar(50)
  assignedAt                                      DateTime         @default(now()) @db.Timestamptz(6)
  assignedByMemberId                              String?          @db.Uuid
  assignmentReason                                String?
  requiresApproval                                Boolean          @default(false)
  approvedAt                                      DateTime?        @db.Timestamptz(6)
  approvedByMemberId                              String?          @db.Uuid
  approvalComment                                 String?
  activatedAt                                     DateTime?        @db.Timestamptz(6)
  deactivatedAt                                   DateTime?        @db.Timestamptz(6)
  deactivationReason                              String?
  deactivatedByMemberId                           String?          @db.Uuid
  inheritedFromRoleId                             String?          @db.Uuid
  canDelegate                                     Boolean          @default(false)
  delegatedToMemberId                             String?          @db.Uuid
  delegatedAt                                     DateTime?        @db.Timestamptz(6)
  conditions                                      Json?
  restrictions                                    Json?
  metadata                                        Json?
  tags                                            String[]         @db.VarChar(50)
  Member_MemberRole_approvedByMemberIdToMember    Member?          @relation("MemberRole_approvedByMemberIdToMember", fields: [approvedByMemberId], references: [id])
  Member_MemberRole_assignedByMemberIdToMember    Member?          @relation("MemberRole_assignedByMemberIdToMember", fields: [assignedByMemberId], references: [id])
  Member_MemberRole_deactivatedByMemberIdToMember Member?          @relation("MemberRole_deactivatedByMemberIdToMember", fields: [deactivatedByMemberId], references: [id])
  Member_MemberRole_delegatedToMemberIdToMember   Member?          @relation("MemberRole_delegatedToMemberIdToMember", fields: [delegatedToMemberId], references: [id])
  Role_MemberRole_inheritedFromRoleIdToRole       Role?            @relation("MemberRole_inheritedFromRoleIdToRole", fields: [inheritedFromRoleId], references: [id])
  Member_MemberRole_memberIdToMember              Member           @relation("MemberRole_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Role_MemberRole_roleIdToRole                    Role             @relation("MemberRole_roleIdToRole", fields: [roleId], references: [id], onDelete: Cascade)
  Tenant                                          Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, memberId, roleId, effectiveFrom])
  @@index([approvedByMemberId])
  @@index([assignedByMemberId])
  @@index([createdAt], type: Brin)
  @@index([deactivatedByMemberId])
  @@index([delegatedToMemberId])
  @@index([tenantId, assignedAt])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, effectiveFrom])
  @@index([tenantId, effectiveTo])
  @@index([tenantId, isPrimary])
  @@index([tenantId, memberId])
  @@index([tenantId, requiresApproval])
  @@index([tenantId, roleId])
  @@index([tenantId, scopeResourceType, scopeResourceId])
  @@index([tenantId, scope])
  @@index([tenantId, status])
}
```

### ApiKey

```prisma
model ApiKey {
  id                                      String           @id @default(uuid(7)) @db.Uuid
  status                                  ApiKeyStatus     @default(ACTIVE)
  version                                 Int              @default(1)
  createdAt                               DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                               DateTime         @db.Timestamptz(6)
  tenantId                                String           @db.Uuid
  deletedAt                               DateTime?        @db.Timestamptz(6)
  deletedByActorId                        String?          @db.Uuid
  createdByActorId                        String?          @db.Uuid
  updatedByActorId                        String?          @db.Uuid
  auditCorrelationId                      String?          @db.Uuid
  dataClassification                      String           @default("CONFIDENTIAL")
  retentionPolicy                         RetentionPolicy?
  userId                                  String?          @db.Uuid
  memberId                                String?          @db.Uuid
  serviceAccountId                        String?          @db.Uuid
  name                                    String           @db.VarChar(255)
  description                             String?
  keyPrefix                               String           @db.VarChar(20)
  hashedKey                               String           @unique @db.VarChar(255)
  keyHint                                 String           @db.VarChar(10)
  scope                                   ApiKeyScope      @default(READ_ONLY)
  permissions                             String[]         @db.VarChar(100)
  allowedIps                              String[]         @db.VarChar(45)
  allowedDomains                          String[]         @db.VarChar(255)
  isActive                                Boolean          @default(true)
  expiresAt                               DateTime?        @db.Timestamptz(6)
  lastUsedAt                              DateTime?        @db.Timestamptz(6)
  useCount                                Int              @default(0)
  dailyLimit                              Int?
  monthlyLimit                            Int?
  currentDailyUse                         Int              @default(0)
  currentMonthlyUse                       Int              @default(0)
  rateLimit                               Int?
  rateLimitWindow                         Int?             @default(60)
  riskScore                               Int              @default(0)
  suspiciousActivity                      Boolean          @default(false)
  lastFailureAt                           DateTime?        @db.Timestamptz(6)
  failureCount                            Int              @default(0)
  revokedAt                               DateTime?        @db.Timestamptz(6)
  revocationReason                        String?
  revokedByMemberId                       String?          @db.Uuid
  rotatedAt                               DateTime?        @db.Timestamptz(6)
  rotatedFromKeyId                        String?          @db.Uuid
  environment                             String           @default("production") @db.VarChar(20)
  tags                                    String[]         @db.VarChar(50)
  metadata                                Json?
  Member_ApiKey_memberIdToMember          Member?          @relation("ApiKey_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Member_ApiKey_revokedByMemberIdToMember Member?          @relation("ApiKey_revokedByMemberIdToMember", fields: [revokedByMemberId], references: [id])
  ApiKey                                  ApiKey?          @relation("ApiKeyToApiKey", fields: [rotatedFromKeyId], references: [id])
  other_ApiKey                            ApiKey[]         @relation("ApiKeyToApiKey")
  Tenant                                  Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  User                                    User?            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, name])
  @@index([createdAt], type: Brin)
  @@index([revokedByMemberId])
  @@index([rotatedFromKeyId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, environment])
  @@index([tenantId, expiresAt])
  @@index([tenantId, isActive])
  @@index([tenantId, lastUsedAt])
  @@index([tenantId, memberId])
  @@index([tenantId, scope])
  @@index([tenantId, serviceAccountId])
  @@index([tenantId, status])
  @@index([tenantId, suspiciousActivity])
  @@index([tenantId, userId])
}
```

### ServiceAccount

```prisma
model ServiceAccount {
  id                 String               @id @default(uuid(7)) @db.Uuid
  status             ServiceAccountStatus @default(ACTIVE)
  version            Int                  @default(1)
  createdAt          DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime             @db.Timestamptz(6)
  tenantId           String               @db.Uuid
  deletedAt          DateTime?            @db.Timestamptz(6)
  deletedByActorId   String?              @db.Uuid
  createdByActorId   String?              @db.Uuid
  updatedByActorId   String?              @db.Uuid
  auditCorrelationId String?              @db.Uuid
  dataClassification String               @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  name               String               @db.VarChar(100)
  description        String?
  email              String?              @db.Citext
  accountType        ServiceAccountType   @default(API)
  purpose            String?              @db.VarChar(255)
  isActive           Boolean              @default(true)
  lastUsedAt         DateTime?            @db.Timestamptz(6)
  expiresAt          DateTime?            @db.Timestamptz(6)
  allowedIpRanges    String[]             @db.VarChar(50)
  allowedDomains     String[]             @db.VarChar(100)
  rateLimitPerHour   Int?                 @default(1000)
  rateLimitPerDay    Int?                 @default(10000)
  ownerId            String               @db.Uuid
  managedByTeam      String?              @db.VarChar(100)
  requiresMfa        Boolean              @default(false)
  monitoringEnabled  Boolean              @default(true)
  alertOnUsage       Boolean              @default(false)
  metadata           Json?
  tags               String[]             @db.VarChar(50)
  Tenant             Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Member             Member               @relation(fields: [tenantId, ownerId], references: [tenantId, id])
  ServiceAccountKey  ServiceAccountKey[]

  @@unique([tenantId, email])
  @@unique([tenantId, id])
  @@unique([tenantId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, accountType])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, expiresAt])
  @@index([tenantId, isActive])
  @@index([tenantId, lastUsedAt])
  @@index([tenantId, ownerId])
  @@index([tenantId, status])
}
```

### ServiceAccountKey

```prisma
model ServiceAccountKey {
  id                      String              @id @default(uuid(7)) @db.Uuid
  status                  String              @default("ACTIVE")
  version                 Int                 @default(1)
  createdAt               DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt               DateTime            @db.Timestamptz(6)
  tenantId                String              @db.Uuid
  deletedAt               DateTime?           @db.Timestamptz(6)
  deletedByActorId        String?             @db.Uuid
  createdByActorId        String?             @db.Uuid
  updatedByActorId        String?             @db.Uuid
  auditCorrelationId      String?             @db.Uuid
  dataClassification      String              @default("CONFIDENTIAL")
  retentionPolicy         RetentionPolicy?
  serviceAccountId        String              @db.Uuid
  name                    String              @db.VarChar(100)
  keyId                   String              @unique @db.VarChar(50)
  keyHash                 String              @db.VarChar(255)
  keyPrefix               String              @db.VarChar(20)
  scopes                  String[]            @db.VarChar(100)
  permissions             String[]            @db.VarChar(100)
  isActive                Boolean             @default(true)
  expiresAt               DateTime?           @db.Timestamptz(6)
  lastUsedAt              DateTime?           @db.Timestamptz(6)
  usageCount              Int                 @default(0)
  rateLimitPerHour        Int?
  rateLimitPerDay         Int?
  allowedIpRanges         String[]            @db.VarChar(50)
  rotatedFromKeyId        String?             @db.Uuid
  rotatedAt               DateTime?           @db.Timestamptz(6)
  createdById             String              @db.Uuid
  metadata                Json?
  ServiceAccountKey       ServiceAccountKey?  @relation("ServiceAccountKeyToServiceAccountKey", fields: [rotatedFromKeyId], references: [id])
  other_ServiceAccountKey ServiceAccountKey[] @relation("ServiceAccountKeyToServiceAccountKey")
  Member                  Member              @relation(fields: [tenantId, createdById], references: [tenantId, id])
  Tenant                  Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  ServiceAccount          ServiceAccount      @relation(fields: [tenantId, serviceAccountId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, serviceAccountId, name])
  @@index([createdAt], type: Brin)
  @@index([keyId])
  @@index([keyPrefix])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, createdById])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, expiresAt])
  @@index([tenantId, isActive])
  @@index([tenantId, lastUsedAt])
  @@index([tenantId, serviceAccountId])
  @@index([tenantId, status])
}
```

### Permission

```prisma
model Permission {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             String           @default("ACTIVE")
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
  code               String           @unique(map: "Permission_code_unique") @db.Citext
  name               String           @db.VarChar(255)
  description        String?
  scope              PermissionScope  @default(TENANT)
  category           String           @db.VarChar(100)
  subcategory        String?          @db.VarChar(100)
  isSystemPermission Boolean          @default(false)
  requiresMfa        Boolean          @default(false)
  riskLevel          ImpactLevel      @default(LOW)
  parentPermissionId String?          @db.Uuid
  dependsOnCodes     String[]         @db.VarChar(100)
  isActive           Boolean          @default(true)
  metadata           Json?
  Permission         Permission?      @relation("PermissionToPermission", fields: [parentPermissionId], references: [id], onDelete: NoAction)
  other_Permission   Permission[]     @relation("PermissionToPermission")
  RolePermission     RolePermission[]

  @@index([auditCorrelationId])
  @@index([category])
  @@index([createdAt], type: Brin)
  @@index([dataClassification])
  @@index([isActive])
  @@index([isSystemPermission])
  @@index([parentPermissionId])
  @@index([riskLevel])
  @@index([scope])
  @@index([status])
}
```

### Role

```prisma
model Role {
  id                                              String           @id @default(uuid(7)) @db.Uuid
  status                                          String           @default("ACTIVE")
  version                                         Int              @default(1)
  createdAt                                       DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                       DateTime         @db.Timestamptz(6)
  tenantId                                        String           @db.Uuid
  deletedAt                                       DateTime?        @db.Timestamptz(6)
  deletedByActorId                                String?          @db.Uuid
  createdByActorId                                String?          @db.Uuid
  updatedByActorId                                String?          @db.Uuid
  auditCorrelationId                              String?          @db.Uuid
  dataClassification                              String           @default("INTERNAL")
  retentionPolicy                                 RetentionPolicy?
  code                                            String           @db.Citext
  name                                            String           @db.VarChar(255)
  description                                     String?
  roleType                                        RoleType         @default(CUSTOM)
  isActive                                        Boolean          @default(true)
  isDefault                                       Boolean          @default(false)
  priority                                        Int              @default(0)
  parentRoleId                                    String?          @db.Uuid
  inheritsPermissions                             Boolean          @default(true)
  maxMembers                                      Int?
  requiresApproval                                Boolean          @default(false)
  color                                           String?          @db.VarChar(7)
  icon                                            String?          @db.VarChar(50)
  metadata                                        Json?
  tags                                            String[]         @db.VarChar(50)
  MemberRole_MemberRole_inheritedFromRoleIdToRole MemberRole[]     @relation("MemberRole_inheritedFromRoleIdToRole")
  MemberRole_MemberRole_roleIdToRole              MemberRole[]     @relation("MemberRole_roleIdToRole")
  Role                                            Role?            @relation("RoleToRole", fields: [parentRoleId], references: [id])
  other_Role                                      Role[]           @relation("RoleToRole")
  Tenant                                          Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  RolePermission                                  RolePermission[]

  @@unique([tenantId, code])
  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([parentRoleId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isActive])
  @@index([tenantId, isDefault])
  @@index([tenantId, priority])
  @@index([tenantId, roleType])
  @@index([tenantId, status])
}
```

### RolePermission

```prisma
model RolePermission {
  id                                               String           @id @default(uuid(7)) @db.Uuid
  status                                           String           @default("ACTIVE")
  version                                          Int              @default(1)
  createdAt                                        DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                        DateTime         @db.Timestamptz(6)
  tenantId                                         String           @db.Uuid
  deletedAt                                        DateTime?        @db.Timestamptz(6)
  deletedByActorId                                 String?          @db.Uuid
  createdByActorId                                 String?          @db.Uuid
  updatedByActorId                                 String?          @db.Uuid
  auditCorrelationId                               String?          @db.Uuid
  dataClassification                               String           @default("INTERNAL")
  retentionPolicy                                  RetentionPolicy?
  roleId                                           String           @db.Uuid
  permissionId                                     String           @db.Uuid
  memberId                                         String?          @db.Uuid
  isActive                                         Boolean          @default(true)
  isInherited                                      Boolean          @default(false)
  isDenied                                         Boolean          @default(false)
  resourceType                                     String?          @db.VarChar(100)
  resourceId                                       String?          @db.Uuid
  contextData                                      Json?
  validFrom                                        DateTime?        @db.Timestamptz(6)
  validUntil                                       DateTime?        @db.Timestamptz(6)
  conditions                                       Json?
  assignedAt                                       DateTime         @default(now()) @db.Timestamptz(6)
  assignedByMemberId                               String?          @db.Uuid
  assignmentReason                                 String?
  requiresApproval                                 Boolean          @default(false)
  approvedAt                                       DateTime?        @db.Timestamptz(6)
  approvedByMemberId                               String?          @db.Uuid
  revokedAt                                        DateTime?        @db.Timestamptz(6)
  revokedByMemberId                                String?          @db.Uuid
  revocationReason                                 String?
  metadata                                         Json?
  tags                                             String[]         @db.VarChar(50)
  Member_RolePermission_approvedByMemberIdToMember Member?          @relation("RolePermission_approvedByMemberIdToMember", fields: [approvedByMemberId], references: [id])
  Member_RolePermission_assignedByMemberIdToMember Member?          @relation("RolePermission_assignedByMemberIdToMember", fields: [assignedByMemberId], references: [id])
  Member_RolePermission_memberIdToMember           Member?          @relation("RolePermission_memberIdToMember", fields: [memberId], references: [id], onDelete: Cascade)
  Permission                                       Permission       @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  Member_RolePermission_revokedByMemberIdToMember  Member?          @relation("RolePermission_revokedByMemberIdToMember", fields: [revokedByMemberId], references: [id])
  Role                                             Role             @relation(fields: [roleId], references: [id], onDelete: Cascade)
  Tenant                                           Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, roleId, permissionId, memberId])
  @@unique([tenantId, roleId, permissionId, resourceType, resourceId])
  @@index([approvedByMemberId])
  @@index([assignedByMemberId])
  @@index([createdAt], type: Brin)
  @@index([revokedByMemberId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isActive])
  @@index([tenantId, isDenied])
  @@index([tenantId, memberId])
  @@index([tenantId, permissionId])
  @@index([tenantId, resourceType])
  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, roleId])
  @@index([tenantId, status])
  @@index([tenantId, validFrom, validUntil])
}
```

### DelegationGrant

```prisma
model DelegationGrant {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             DelegationStatus @default(PENDING_APPROVAL)
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  tenantId           String           @db.Uuid
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?

  // Core Delegation Fields
  name           String         @db.VarChar(255)
  description    String?
  delegationType DelegationType @default(PERMISSION)

  // Delegation Parties
  delegatorId String @db.Uuid // Who is granting the delegation
  delegateeId String @db.Uuid // Who is receiving the delegation

  // Permission Details
  resourceType String   @db.VarChar(100) // Table/resource being delegated
  resourceIds  String[] @db.Uuid // Specific resource IDs (optional)
  permissions  String[] @db.VarChar(50) // READ, WRITE, DELETE, etc.

  // Scope and Context
  scopeFilter Json? // Additional filtering criteria
  contextData Json? // Context-specific data

  // Time Constraints
  effectiveFrom DateTime  @default(now()) @db.Timestamptz(6)
  effectiveTo   DateTime? @db.Timestamptz(6)
  maxDuration   Int? // Maximum duration in minutes

  // Usage Tracking
  usageCount    Int       @default(0)
  maxUsageCount Int? // Maximum number of uses
  lastUsedAt    DateTime? @db.Timestamptz(6)

  // Approval Workflow
  requiresApproval Boolean   @default(true)
  approvedBy       String?   @db.Uuid
  approvedAt       DateTime? @db.Timestamptz(6)
  approvalNotes    String?

  // Revocation
  revokedAt        DateTime? @db.Timestamptz(6)
  revokedBy        String?   @db.Uuid
  revocationReason String?

  // Delegation Chain
  parentDelegationId String? @db.Uuid // If this is a sub-delegation
  canSubDelegate     Boolean @default(false)
  maxDelegationDepth Int     @default(1)
  currentDepth       Int     @default(1)

  // Risk and Security
  riskLevel              RiskLevel @default(MEDIUM)
  securityClassification String?   @db.VarChar(50)
  requiresMfa            Boolean   @default(false)

  // Monitoring and Alerts
  monitoringEnabled Boolean @default(true)
  alertOnUsage      Boolean @default(false)
  alertThreshold    Int? // Alert after N uses

  // Emergency Controls
  emergencyRevoke  Boolean @default(false)
  emergencyContact String? @db.Uuid

  // Configuration
  metadata Json?
  tags     String[] @db.VarChar(50)

  // Relations
  Tenant               Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  ParentDelegation     DelegationGrant?       @relation("DelegationChain", fields: [parentDelegationId], references: [id])
  ChildDelegations     DelegationGrant[]      @relation("DelegationChain")
  DelegationConstraint DelegationConstraint[]

  @@unique([tenantId, id])
  @@unique([tenantId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approvedAt])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, currentDepth])
  @@index([tenantId, dataClassification])
  @@index([tenantId, delegateeId])
  @@index([tenantId, delegatorId])
  @@index([tenantId, delegationType])
  @@index([tenantId, deletedAt])
  @@index([tenantId, effectiveFrom])
  @@index([tenantId, effectiveTo])
  @@index([tenantId, parentDelegationId])
  @@index([tenantId, resourceType])
  @@index([tenantId, riskLevel])
  @@index([tenantId, status])
}
```

### DelegationConstraint

```prisma
model DelegationConstraint {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             String           @default("ACTIVE")
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  tenantId           String           @db.Uuid
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?

  // Core Constraint Fields
  delegationGrantId String                   @db.Uuid
  constraintType    DelegationConstraintType @default(TIME_WINDOW)
  name              String                   @db.VarChar(255)
  description       String?

  // Constraint Configuration
  isActive   Boolean @default(true)
  priority   Int     @default(100) // Higher = more important
  isEnforced Boolean @default(true) // Hard vs soft constraint

  // Time-based Constraints
  timeWindowStart   String? @db.VarChar(8) // HH:MM:SS format
  timeWindowEnd     String? @db.VarChar(8) // HH:MM:SS format
  allowedDaysOfWeek Int[] // 0=Sunday, 1=Monday, etc.
  timezone          String? @db.VarChar(50)

  // Date Range Constraints
  validFrom     DateTime?  @db.Timestamptz(6)
  validTo       DateTime?  @db.Timestamptz(6)
  excludedDates DateTime[] @db.Date // Holidays, blackout dates

  // IP and Location Constraints
  allowedIpRanges  String[] @db.VarChar(45) // CIDR notation
  blockedIpRanges  String[] @db.VarChar(45)
  allowedCountries String[] @db.VarChar(3) // ISO country codes
  blockedCountries String[] @db.VarChar(3)

  // Usage Constraints
  maxUsageCount   Int? // Maximum uses
  maxUsagePerDay  Int? // Daily usage limit
  maxUsagePerHour Int? // Hourly usage limit
  cooldownPeriod  Int? // Minutes between uses

  // Resource Constraints
  allowedResourceTypes String[] @db.VarChar(100) // Specific resource types
  blockedResourceTypes String[] @db.VarChar(100)
  maxResourceCount     Int? // Max resources per use

  // Amount/Value Constraints
  maxAmount          Decimal? @db.Decimal(15, 2) // Financial limits
  dailyAmountLimit   Decimal? @db.Decimal(15, 2)
  monthlyAmountLimit Decimal? @db.Decimal(15, 2)

  // Approval Constraints
  requiresApprovalAbove Decimal? @db.Decimal(15, 2) // Amount threshold
  approverRoles         String[] @db.VarChar(100) // Required approver roles
  minApprovers          Int? // Minimum number of approvers

  // Context Constraints
  requiredContext  Json? // Required context fields
  forbiddenContext Json? // Forbidden context values
  conditionalLogic String? // Custom constraint logic

  // Device and Security Constraints
  allowedDeviceTypes String[] @db.VarChar(50) // Mobile, Desktop, etc.
  requiresMfa        Boolean  @default(false)
  minSecurityLevel   String?  @db.VarChar(50)

  // Monitoring and Alerts
  alertOnViolation Boolean  @default(true)
  alertRecipients  String[] @db.Uuid // Member IDs
  logViolations    Boolean  @default(true)

  // Violation Handling
  violationAction  ConstraintViolationAction @default(BLOCK)
  violationMessage String?                   @db.VarChar(500)
  gracePeriod      Int? // Minutes of grace period

  // Performance
  cacheEnabled      Boolean @default(true)
  cacheTtlSeconds   Int     @default(300) // 5 minutes
  evaluationTimeout Int     @default(5000) // 5 seconds in ms

  // Configuration
  metadata Json?
  tags     String[] @db.VarChar(50)

  // Relations
  Tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  DelegationGrant DelegationGrant @relation(fields: [delegationGrantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, delegationGrantId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, constraintType])
  @@index([tenantId, dataClassification])
  @@index([tenantId, delegationGrantId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isActive])
  @@index([tenantId, isEnforced])
  @@index([tenantId, priority])
  @@index([tenantId, validFrom])
  @@index([tenantId, validTo])
  @@index([tenantId, violationAction])
}
```

## 🧩 Enums

### AccessMethod

```prisma
enum AccessMethod {
  DIRECT_LINK
  EMAIL_ATTACHMENT
  SHARED_FOLDER
  API_ENDPOINT
  INTEGRATION
  MOBILE_APP
  WEB_PORTAL
  DOWNLOAD_LINK
}
```

### ApiKeyScope

```prisma
enum ApiKeyScope {
  READ_ONLY
  READ_WRITE
  ADMIN
  BILLING
  REPORTING
  INTEGRATION
}
```

### ApiKeyStatus

```prisma
enum ApiKeyStatus {
  ACTIVE
  SUSPENDED
  REVOKED
  EXPIRED
}
```

### AssignmentScope

```prisma
enum AssignmentScope {
  GLOBAL
  TENANT
  PROJECT
  DEPARTMENT
  TEAM
  RESOURCE
}
```

### ConstraintViolationAction

```prisma
enum ConstraintViolationAction {
  BLOCK
  WARN
  LOG_ONLY
  REQUIRE_APPROVAL
  ESCALATE
  TERMINATE_SESSION
}
```

### DelegationConstraintType

```prisma
enum DelegationConstraintType {
  TIME_WINDOW
  DATE_RANGE
  IP_RESTRICTION
  LOCATION_RESTRICTION
  USAGE_LIMIT
  AMOUNT_LIMIT
  RESOURCE_RESTRICTION
  APPROVAL_REQUIREMENT
  DEVICE_RESTRICTION
  SECURITY_LEVEL
  CONTEXT_VALIDATION
}
```

### DelegationStatus

```prisma
enum DelegationStatus {
  ACTIVE
  PENDING_APPROVAL
  APPROVED
  REJECTED
  EXPIRED
  REVOKED
  SUSPENDED
}
```

### DelegationType

```prisma
enum DelegationType {
  PERMISSION
  ROLE
  RESOURCE_ACCESS
  APPROVAL_AUTHORITY
  ADMINISTRATIVE
  EMERGENCY
  TEMPORARY
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

### MemberStatus

```prisma
enum MemberStatus {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED
  TERMINATED
  INVITED
}
```

### PermissionScope

```prisma
enum PermissionScope {
  GLOBAL
  TENANT
  PROJECT
  ESTIMATE
  INVOICE
  TASK
  INVENTORY
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

### RiskLevel

```prisma
enum RiskLevel {
  VERY_LOW
  LOW
  MEDIUM
  HIGH
  VERY_HIGH
  CRITICAL
}
```

### RoleType

```prisma
enum RoleType {
  SYSTEM
  CUSTOM
  INHERITED
}
```

### SecurityLevel

```prisma
enum SecurityLevel {
  PUBLIC
  STANDARD
  ENHANCED
  RESTRICTED
  CONFIDENTIAL
  TOP_SECRET
}
```

### ServiceAccountStatus

```prisma
enum ServiceAccountStatus {
  ACTIVE
  SUSPENDED
  EXPIRED
  REVOKED
}
```

### ServiceAccountType

```prisma
enum ServiceAccountType {
  API
  INTEGRATION
  AUTOMATION
  MONITORING
  WEBHOOK
  SCHEDULED_JOB
}
```

### ThemePreference

```prisma
enum ThemePreference {
  LIGHT
  DARK
  SYSTEM
  HIGH_CONTRAST
}
```

_Mapped from ERP docs; extracted from schema.prisma_