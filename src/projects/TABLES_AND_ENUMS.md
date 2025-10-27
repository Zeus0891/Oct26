# projects — Tables and Enums

## 🧱 Models

### Project

```prisma
model Project {
  id                                                      String                        @id @default(uuid(7)) @db.Uuid
  status                                                  ProjectStatus                 @default(PLANNING)
  version                                                 Int                           @default(1)
  createdAt                                               DateTime                      @default(now()) @db.Timestamptz(6)
  updatedAt                                               DateTime                      @db.Timestamptz(6)
  tenantId                                                String                        @db.Uuid
  deletedAt                                               DateTime?                     @db.Timestamptz(6)
  deletedByActorId                                        String?                       @db.Uuid
  createdByActorId                                        String?                       @db.Uuid
  updatedByActorId                                        String?                       @db.Uuid
  globalId                                                String                        @unique @db.Uuid
  auditCorrelationId                                      String?                       @db.Uuid
  dataClassification                                      String                        @default("INTERNAL")
  retentionPolicy                                         RetentionPolicy?
  documentGroupId                                         String                        @db.Uuid
  externalNumber                                          String                        @db.Citext
  estimateId                                              String?                       @db.Uuid
  invoiceId                                               String?                       @db.Uuid
  clientAccountId                                         String?                       @db.Uuid
  clientContactId                                         String?                       @db.Uuid
  contractTemplateId                                      String?                       @db.Uuid
  termsTemplateId                                         String?                       @db.Uuid
  approvedByMemberId                                      String?                       @db.Uuid
  finalApprovedByMemberId                                 String?                       @db.Uuid
  approvedAt                                              DateTime?                     @db.Timestamptz(6)
  finalApprovedAt                                         DateTime?                     @db.Timestamptz(6)
  declineReason                                           String?
  approvedByActorId                                       String?                       @db.Uuid
  finalApprovedByActorId                                  String?                       @db.Uuid
  approvalCorrelationId                                   String?                       @db.Uuid
  approvalNotes                                           String?
  subtotal                                                Decimal?                      @db.Decimal(12, 2)
  discountAmount                                          Decimal?                      @db.Decimal(12, 2)
  taxAmount                                               Decimal?                      @db.Decimal(12, 2)
  grandTotal                                              Decimal?                      @db.Decimal(12, 2)
  budgetedCost                                            Decimal?                      @db.Decimal(14, 2)
  actualCost                                              Decimal?                      @db.Decimal(14, 2)
  departmentId                                            String?                       @db.Uuid
  orgUnitId                                               String?                       @db.Uuid
  costCenterId                                            String?                       @db.Uuid
  locationId                                              String?                       @db.Uuid
  priority                                                TaskPriority                  @default(MEDIUM)
  riskClassification                                      ImpactLevel                   @default(LOW)
  complexityScore                                         Decimal?                      @db.Decimal(3, 2)
  strategicImportance                                     String?                       @db.VarChar(20)
  name                                                    String
  description                                             String?
  startDate                                               DateTime?                     @db.Date
  endDate                                                 DateTime?                     @db.Date
  APBillLine                                              APBillLine[]
  ApprovalRule                                            ApprovalRule[]
  ChangeOrder                                             ChangeOrder[]
  Channel                                                 Channel[]
  DailyLog                                                DailyLog[]
  ESignatureEnvelope                                      ESignatureEnvelope[]
  Estimate_Estimate_tenantId_approvedProjectIdToProject   Estimate?                     @relation("Estimate_tenantId_approvedProjectIdToProject")
  FileObject                                              FileObject[]
  Inspection                                              Inspection[]
  Invoice                                                 Invoice?
  JournalEntry                                            JournalEntry[]
  JournalLine                                             JournalLine[]
  Milestone                                               Milestone[]
  Member_Project_tenantId_approvedByMemberIdToMember      Member?                       @relation("Project_tenantId_approvedByMemberIdToMember", fields: [tenantId, approvedByMemberId], references: [tenantId, id])
  Account                                                 Account?                      @relation(fields: [tenantId, clientAccountId], references: [tenantId, id], onDelete: NoAction)
  Contact                                                 Contact?                      @relation(fields: [tenantId, clientContactId], references: [tenantId, id])
  ContractTemplate                                        ContractTemplate?             @relation(fields: [tenantId, contractTemplateId], references: [tenantId, id])
  CostCenter                                              CostCenter?                   @relation(fields: [tenantId, costCenterId], references: [tenantId, id])
  Department                                              Department?                   @relation(fields: [tenantId, departmentId], references: [tenantId, id])
  DocumentGroup                                           DocumentGroup                 @relation(fields: [tenantId, documentGroupId], references: [tenantId, id])
  Estimate_Project_tenantId_estimateIdToEstimate          Estimate?                     @relation("Project_tenantId_estimateIdToEstimate", fields: [tenantId, estimateId], references: [tenantId, id])
  Member_Project_tenantId_finalApprovedByMemberIdToMember Member?                       @relation("Project_tenantId_finalApprovedByMemberIdToMember", fields: [tenantId, finalApprovedByMemberId], references: [tenantId, id])
  Location                                                Location?                     @relation(fields: [tenantId, locationId], references: [tenantId, id])
  OrgUnit                                                 OrgUnit?                      @relation(fields: [tenantId, orgUnitId], references: [tenantId, id])
  TermsTemplate                                           TermsTemplate?                @relation(fields: [tenantId, termsTemplateId], references: [tenantId, id])
  ProjectBudgetLine                                       ProjectBudgetLine[]
  ProjectDocument                                         ProjectDocument[]
  ProjectExternalAccess                                   ProjectExternalAccess[]
  ProjectFinancialSnapshot                                ProjectFinancialSnapshot[]
  ProjectInventoryTransaction                             ProjectInventoryTransaction[]
  ProjectIssue                                            ProjectIssue[]
  ProjectLocation                                         ProjectLocation[]
  ProjectMember                                           ProjectMember[]
  ProjectNote                                             ProjectNote[]
  ProjectPhase                                            ProjectPhase[]
  ProjectReport                                           ProjectReport[]
  ProjectRisk                                             ProjectRisk[]
  ProjectTask                                             ProjectTask[]
  ProjectTaskAssignment                                   ProjectTaskAssignment[]
  PunchList                                               PunchList[]
  PurchaseOrderLine                                       PurchaseOrderLine[]
  RFI                                                     RFI[]
  RequestForQuote                                         RequestForQuote[]
  ResourceAllocation                                      ResourceAllocation[]
  Schedule                                                Schedule[]
  Submittal                                               Submittal[]
  Task                                                    Task[]
  TaskAssignment                                          TaskAssignment[]
  Timesheet                                               Timesheet[]
  WBSItem                                                 WBSItem[]
  weather_alerts                                          weather_alerts[]
  weather_incidents                                       weather_incidents[]
  weather_watches                                         weather_watches[]

  // RoomPlan relationships
  RoomScanSession RoomScanSession[]
  RoomModel       RoomModel[]

  // Actor audit relationships
  CreatedByActor Actor? @relation("ProjectCreatedByActor", fields: [createdByActorId], references: [id])
  UpdatedByActor Actor? @relation("ProjectUpdatedByActor", fields: [updatedByActorId], references: [id])
  DeletedByActor Actor? @relation("ProjectDeletedByActor", fields: [deletedByActorId], references: [id])

  @@unique([tenantId, estimateId])
  @@unique([tenantId, id])
  @@unique([tenantId, invoiceId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approvalCorrelationId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, clientAccountId])
  @@index([tenantId, clientContactId])
  @@index([tenantId, contractTemplateId])
  @@index([tenantId, costCenterId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, departmentId])
  @@index([tenantId, documentGroupId])
  @@index([tenantId, estimateId])
  @@index([tenantId, invoiceId])
  @@index([tenantId, locationId])
  @@index([tenantId, orgUnitId])
  @@index([tenantId, priority])
  @@index([tenantId, riskClassification])
  @@index([tenantId, status])
  @@index([tenantId, status, updatedAt])
  @@index([tenantId, strategicImportance])
  @@index([tenantId, termsTemplateId])
  @@index([tenantId, deletedAt], map: "idx_project_tenant_deleted")
}
```

### ProjectPhase

```prisma
model ProjectPhase {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  name               String
  description        String?
  startDate          DateTime?          @db.Date
  endDate            DateTime?          @db.Date
  sortOrder          Int                @default(0)
  completion         Decimal?           @db.Decimal(5, 2)
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  ProjectTask        ProjectTask[]
  WBSItem            WBSItem[]

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, sortOrder])
  @@index([tenantId, status])
}
```

### WBSItem

```prisma
model WBSItem {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  code               String
  name               String
  description        String?
  level              Int                @default(1)
  parentId           String?            @db.Uuid
  projectId          String             @db.Uuid
  phaseId            String?            @db.Uuid
  ProjectTask        ProjectTask[]
  WBSItem            WBSItem?           @relation("WBSItemToWBSItem", fields: [tenantId, parentId], references: [tenantId, id])
  other_WBSItem      WBSItem[]          @relation("WBSItemToWBSItem")
  ProjectPhase       ProjectPhase?      @relation(fields: [tenantId, phaseId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, code])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, level])
  @@index([tenantId, parentId])
  @@index([tenantId, phaseId])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### ProjectTask

```prisma
model ProjectTask {
  id                                                                                  String                     @id @default(uuid(7)) @db.Uuid
  status                                                                              WorkItemStatus             @default(OPEN)
  version                                                                             Int                        @default(1)
  createdAt                                                                           DateTime                   @default(now()) @db.Timestamptz(6)
  updatedAt                                                                           DateTime                   @db.Timestamptz(6)
  tenantId                                                                            String                     @db.Uuid
  deletedAt                                                                           DateTime?                  @db.Timestamptz(6)
  deletedByActorId                                                                    String?                    @db.Uuid
  createdByActorId                                                                    String?                    @db.Uuid
  updatedByActorId                                                                    String?                    @db.Uuid
  auditCorrelationId                                                                  String?                    @db.Uuid
  dataClassification                                                                  String                     @default("INTERNAL")
  retentionPolicy                                                                     RetentionPolicy?
  name                                                                                String
  description                                                                         String?
  priority                                                                            TaskPriority               @default(MEDIUM)
  budgetedHours                                                                       Decimal?                   @db.Decimal(8, 2)
  actualHours                                                                         Decimal?                   @db.Decimal(8, 2)
  budgetedAmount                                                                      Decimal?                   @db.Decimal(12, 2)
  actualCostToDate                                                                    Decimal?                   @db.Decimal(12, 2)
  plannedStartDate                                                                    DateTime?                  @db.Date
  plannedEndDate                                                                      DateTime?                  @db.Date
  actualStartDate                                                                     DateTime?                  @db.Date
  actualEndDate                                                                       DateTime?                  @db.Date
  sourceEstimateLineItemId                                                            String?                    @db.Uuid
  sourceChangeOrderLineId                                                             String?                    @db.Uuid
  phaseId                                                                             String?                    @db.Uuid
  wbsItemId                                                                           String?                    @db.Uuid
  projectId                                                                           String                     @db.Uuid
  EstimateLineItem_EstimateLineItem_tenantId_taskIdToProjectTask                      EstimateLineItem[]         @relation("EstimateLineItem_tenantId_taskIdToProjectTask")
  InvoiceLineItem                                                                     InvoiceLineItem[]
  ProjectPhase                                                                        ProjectPhase?              @relation(fields: [tenantId, phaseId], references: [tenantId, id])
  Project                                                                             Project                    @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  ChangeOrderLine                                                                     ChangeOrderLine?           @relation(fields: [tenantId, sourceChangeOrderLineId], references: [tenantId, id])
  EstimateLineItem_ProjectTask_tenantId_sourceEstimateLineItemIdToEstimateLineItem    EstimateLineItem?          @relation("ProjectTask_tenantId_sourceEstimateLineItemIdToEstimateLineItem", fields: [tenantId, sourceEstimateLineItemId], references: [tenantId, id])
  WBSItem                                                                             WBSItem?                   @relation(fields: [tenantId, wbsItemId], references: [tenantId, id])
  ProjectTaskAssignment                                                               ProjectTaskAssignment[]
  ProjectTaskAttachment                                                               ProjectTaskAttachment[]
  ProjectTaskChecklistItem                                                            ProjectTaskChecklistItem[]
  ProjectTaskComment                                                                  ProjectTaskComment[]
  ProjectTaskDependency_ProjectTaskDependency_tenantId_predecessorTaskIdToProjectTask ProjectTaskDependency[]    @relation("ProjectTaskDependency_tenantId_predecessorTaskIdToProjectTask")
  ProjectTaskDependency_ProjectTaskDependency_tenantId_successorTaskIdToProjectTask   ProjectTaskDependency[]    @relation("ProjectTaskDependency_tenantId_successorTaskIdToProjectTask")
  TimesheetEntry                                                                      TimesheetEntry[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, phaseId])
  @@index([tenantId, plannedStartDate])
  @@index([tenantId, projectId])
  @@index([tenantId, projectId, status])
  @@index([tenantId, sourceChangeOrderLineId])
  @@index([tenantId, sourceEstimateLineItemId])
  @@index([tenantId, status])
  @@index([tenantId, wbsItemId])
}
```

### ProjectTaskAssignment

```prisma
model ProjectTaskAssignment {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  assigneeId         String             @db.Uuid
  role               String?
  allocationPercent  Decimal?           @db.Decimal(5, 2)
  startDate          DateTime?          @db.Date
  endDate            DateTime?          @db.Date
  assignedDate       DateTime           @default(now()) @db.Timestamptz(6)
  projectId          String             @db.Uuid
  taskId             String             @db.Uuid
  Member             Member             @relation(fields: [tenantId, assigneeId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  ProjectTask        ProjectTask        @relation(fields: [tenantId, taskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, taskId, assigneeId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, assignedDate])
  @@index([tenantId, assigneeId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, endDate])
  @@index([tenantId, projectId])
  @@index([tenantId, startDate])
  @@index([tenantId, status])
  @@index([tenantId, taskId])
}
```

### ProjectTaskAttachment

```prisma
model ProjectTaskAttachment {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  fileName           String
  fileUrl            String
  fileType           String?
  fileSize           Int?
  uploadedAt         DateTime           @default(now()) @db.Timestamptz(6)
  uploadedById       String             @db.Uuid
  taskId             String             @db.Uuid
  attachmentId       String?            @db.Uuid
  Attachment         Attachment?        @relation(fields: [tenantId, attachmentId], references: [tenantId, id])
  ProjectTask        ProjectTask        @relation(fields: [tenantId, taskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, fileType])
  @@index([tenantId, status])
  @@index([tenantId, taskId])
  @@index([tenantId, uploadedAt])
  @@index([tenantId, uploadedById])
}
```

### ProjectTaskChecklistItem

```prisma
model ProjectTaskChecklistItem {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  isCompleted        Boolean            @default(false)
  completedAt        DateTime?          @db.Timestamptz(6)
  sortOrder          Int                @default(0)
  taskId             String             @db.Uuid
  ProjectTask        ProjectTask        @relation(fields: [tenantId, taskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isCompleted])
  @@index([tenantId, status])
  @@index([tenantId, taskId])
  @@index([tenantId, taskId, sortOrder])
}
```

### ProjectTaskComment

```prisma
model ProjectTaskComment {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  content            String
  mentionedMemberIds Json?
  isInternal         Boolean            @default(false)
  authoredById       String             @db.Uuid
  taskId             String             @db.Uuid
  Member             Member             @relation(fields: [tenantId, authoredById], references: [tenantId, id])
  ProjectTask        ProjectTask        @relation(fields: [tenantId, taskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, authoredById])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isInternal])
  @@index([tenantId, status])
  @@index([tenantId, taskId, createdAt])
  @@index([tenantId, taskId])
}
```

### ProjectTaskDependency

```prisma
model ProjectTaskDependency {
  id                                                                        String             @id @default(uuid(7)) @db.Uuid
  status                                                                    ProjectChildStatus @default(ACTIVE)
  version                                                                   Int                @default(1)
  createdAt                                                                 DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt                                                                 DateTime           @db.Timestamptz(6)
  tenantId                                                                  String             @db.Uuid
  deletedAt                                                                 DateTime?          @db.Timestamptz(6)
  deletedByActorId                                                          String?            @db.Uuid
  createdByActorId                                                          String?            @db.Uuid
  updatedByActorId                                                          String?            @db.Uuid
  auditCorrelationId                                                        String?            @db.Uuid
  dataClassification                                                        String             @default("INTERNAL")
  retentionPolicy                                                           RetentionPolicy?
  dependencyType                                                            DependencyType     @default(FINISH_TO_START)
  lagDays                                                                   Int?               @default(0)
  predecessorTaskId                                                         String             @db.Uuid
  successorTaskId                                                           String             @db.Uuid
  ProjectTask_ProjectTaskDependency_tenantId_predecessorTaskIdToProjectTask ProjectTask        @relation("ProjectTaskDependency_tenantId_predecessorTaskIdToProjectTask", fields: [tenantId, predecessorTaskId], references: [tenantId, id], onDelete: Cascade)
  ProjectTask_ProjectTaskDependency_tenantId_successorTaskIdToProjectTask   ProjectTask        @relation("ProjectTaskDependency_tenantId_successorTaskIdToProjectTask", fields: [tenantId, successorTaskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, predecessorTaskId, successorTaskId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, dependencyType])
  @@index([tenantId, predecessorTaskId])
  @@index([tenantId, status])
  @@index([tenantId, successorTaskId])
}
```

### Schedule

```prisma
model Schedule {
  id                 String               @id @default(uuid(7)) @db.Uuid
  status             ScheduleStatus       @default(DRAFT)
  version            Int                  @default(1)
  createdAt          DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime             @db.Timestamptz(6)
  tenantId           String               @db.Uuid
  deletedAt          DateTime?            @db.Timestamptz(6)
  deletedByActorId   String?              @db.Uuid
  createdByActorId   String?              @db.Uuid
  updatedByActorId   String?              @db.Uuid
  auditCorrelationId String?              @db.Uuid
  dataClassification String               @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  name               String               @db.VarChar(255)
  description        String?
  startDate          DateTime             @db.Date
  endDate            DateTime             @db.Date
  isBaseline         Boolean              @default(false)
  baselineDate       DateTime?            @db.Timestamptz(6)
  projectId          String               @db.Uuid
  Milestone          Milestone[]
  ResourceAllocation ResourceAllocation[]
  Project            Project              @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  ScheduleException  ScheduleException[]
  Task               Task[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, startDate, endDate])
  @@index([tenantId, status])
}
```

### ScheduleException

```prisma
model ScheduleException {
  id                 String                @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus    @default(ACTIVE)
  version            Int                   @default(1)
  createdAt          DateTime              @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime              @db.Timestamptz(6)
  tenantId           String                @db.Uuid
  deletedAt          DateTime?             @db.Timestamptz(6)
  deletedByActorId   String?               @db.Uuid
  createdByActorId   String?               @db.Uuid
  updatedByActorId   String?               @db.Uuid
  auditCorrelationId String?               @db.Uuid
  dataClassification String                @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  reason             String                @db.VarChar(500)
  description        String?
  exceptionDate      DateTime              @db.Date
  isWorkday          Boolean               @default(false)
  exceptionType      ScheduleExceptionType @default(HOLIDAY)
  affectedHours      Decimal?              @db.Decimal(4, 2)
  isRecurring        Boolean               @default(false)
  approvedAt         DateTime?             @db.Timestamptz(6)
  approvedById       String?               @db.Uuid
  scheduleId         String                @db.Uuid
  Member             Member?               @relation(fields: [tenantId, approvedById], references: [tenantId, id])
  Schedule           Schedule              @relation(fields: [tenantId, scheduleId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, scheduleId, exceptionDate])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approvedById])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, exceptionDate])
  @@index([tenantId, exceptionType])
  @@index([tenantId, isRecurring])
  @@index([tenantId, isWorkday])
  @@index([tenantId, scheduleId])
  @@index([tenantId, status])
}
```

### RFI

```prisma
model RFI {
  id                                      String           @id @default(uuid(7)) @db.Uuid
  status                                  RFIStatus        @default(SUBMITTED)
  version                                 Int              @default(1)
  createdAt                               DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                               DateTime         @db.Timestamptz(6)
  tenantId                                String           @db.Uuid
  deletedAt                               DateTime?        @db.Timestamptz(6)
  deletedByActorId                        String?          @db.Uuid
  createdByActorId                        String?          @db.Uuid
  updatedByActorId                        String?          @db.Uuid
  auditCorrelationId                      String?          @db.Uuid
  dataClassification                      String           @default("INTERNAL")
  retentionPolicy                         RetentionPolicy?
  number                                  String
  title                                   String
  description                             String
  category                                String?
  priority                                TaskPriority     @default(MEDIUM)
  dueDate                                 DateTime?        @db.Date
  submitterId                             String           @db.Uuid
  assigneeId                              String?          @db.Uuid
  projectId                               String           @db.Uuid
  Member_RFI_tenantId_assigneeIdToMember  Member?          @relation("RFI_tenantId_assigneeIdToMember", fields: [tenantId, assigneeId], references: [tenantId, id])
  Project                                 Project          @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  Member_RFI_tenantId_submitterIdToMember Member           @relation("RFI_tenantId_submitterIdToMember", fields: [tenantId, submitterId], references: [tenantId, id])
  RFIReply                                RFIReply[]

  @@unique([tenantId, id])
  @@unique([tenantId, number])
  @@index([createdAt], type: Brin)
  @@index([tenantId, assigneeId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, dueDate])
  @@index([tenantId, priority])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
  @@index([tenantId, submitterId])
}
```

### RFIReply

```prisma
model RFIReply {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  message            String
  replyType          RFIReplyType       @default(RESPONSE)
  authorId           String             @db.Uuid
  rfiId              String             @db.Uuid
  Member             Member             @relation(fields: [tenantId, authorId], references: [tenantId, id])
  RFI                RFI                @relation(fields: [tenantId, rfiId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, authorId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, replyType])
  @@index([tenantId, rfiId])
  @@index([tenantId, status])
}
```

### Submittal

```prisma
model Submittal {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             SubmittalStatus     @default(SUBMITTED)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  submittedDate      DateTime?           @db.Date
  reviewDate         DateTime?           @db.Date
  projectId          String              @db.Uuid
  Project            Project             @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  SubmittalApproval  SubmittalApproval[]
  SubmittalItem      SubmittalItem[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### SubmittalItem

```prisma
model SubmittalItem {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             SubmittalItemStatus @default(DRAFT)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  submittedAt        DateTime?           @db.Timestamptz(6)
  approvedAt         DateTime?           @db.Timestamptz(6)
  dueDate            DateTime?           @db.Date
  reviewerId         String?             @db.Uuid
  submittalId        String              @db.Uuid
  Member             Member?             @relation(fields: [tenantId, reviewerId], references: [tenantId, id])
  Submittal          Submittal           @relation(fields: [tenantId, submittalId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, dueDate])
  @@index([tenantId, reviewerId])
  @@index([tenantId, status])
  @@index([tenantId, submittalId])
  @@index([tenantId, submittedAt])
}
```

### SubmittalApproval

```prisma
model SubmittalApproval {
  id                 String                    @id @default(uuid(7)) @db.Uuid
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
  decision           SubmittalApprovalDecision @default(PENDING)
  approverId         String?                   @db.Uuid
  requestedAt        DateTime?                 @db.Timestamptz(6)
  decidedAt          DateTime?                 @db.Timestamptz(6)
  comments           String?
  submittalId        String                    @db.Uuid
  Submittal          Submittal                 @relation(fields: [tenantId, submittalId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approverId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, decidedAt])
  @@index([tenantId, decision])
  @@index([tenantId, deletedAt])
}
```

### Inspection

```prisma
model Inspection {
  id                 String               @id @default(uuid(7)) @db.Uuid
  status             InspectionStatus     @default(SCHEDULED)
  version            Int                  @default(1)
  createdAt          DateTime             @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime             @db.Timestamptz(6)
  tenantId           String               @db.Uuid
  deletedAt          DateTime?            @db.Timestamptz(6)
  deletedByActorId   String?              @db.Uuid
  createdByActorId   String?              @db.Uuid
  updatedByActorId   String?              @db.Uuid
  auditCorrelationId String?              @db.Uuid
  dataClassification String               @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  inspectionType     String
  scheduledDate      DateTime?            @db.Date
  actualDate         DateTime?            @db.Date
  inspectorId        String?              @db.Uuid
  notes              String?
  passed             Boolean?
  projectId          String               @db.Uuid
  Project            Project              @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  InspectionApproval InspectionApproval[]
  InspectionItem     InspectionItem[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, scheduledDate])
  @@index([tenantId, status])
}
```

### InspectionItem

```prisma
model InspectionItem {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  itemNumber         String
  description        String
  requirement        String
  passed             Boolean?
  comments           String?
  deficiency         String?
  inspectionId       String             @db.Uuid
  Inspection         Inspection         @relation(fields: [tenantId, inspectionId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, inspectionId, itemNumber])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, inspectionId])
  @@index([tenantId, passed])
  @@index([tenantId, status])
}
```

### InspectionApproval

```prisma
model InspectionApproval {
  id                 String                     @id @default(uuid(7)) @db.Uuid
  version            Int                        @default(1)
  createdAt          DateTime                   @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                   @db.Timestamptz(6)
  tenantId           String                     @db.Uuid
  deletedAt          DateTime?                  @db.Timestamptz(6)
  deletedByActorId   String?                    @db.Uuid
  createdByActorId   String?                    @db.Uuid
  updatedByActorId   String?                    @db.Uuid
  auditCorrelationId String?                    @db.Uuid
  dataClassification String                     @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  decision           InspectionApprovalDecision @default(PENDING)
  approverId         String?                    @db.Uuid
  requestedAt        DateTime?                  @db.Timestamptz(6)
  decidedAt          DateTime?                  @db.Timestamptz(6)
  comments           String?
  inspectionId       String                     @db.Uuid
  Inspection         Inspection                 @relation(fields: [tenantId, inspectionId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approverId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, decidedAt])
  @@index([tenantId, decision])
  @@index([tenantId, deletedAt])
}
```

### DailyLog

```prisma
model DailyLog {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  logDate            DateTime           @db.Date
  weather            Json?
  notes              String?
  safetyIncidents    String?
  manpowerCount      Int?
  authorId           String             @db.Uuid
  projectId          String             @db.Uuid
  Member             Member             @relation(fields: [tenantId, authorId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, logDate])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, authorId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, logDate])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### PunchList

```prisma
model PunchList {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             WorkItemStatus   @default(OPEN)
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  tenantId           String           @db.Uuid
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  priority           TaskPriority     @default(MEDIUM)
  dueDate            DateTime?        @db.Date
  assigneeId         String?          @db.Uuid
  projectId          String           @db.Uuid
  Project            Project          @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  PunchListItem      PunchListItem[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, assigneeId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### PunchListItem

```prisma
model PunchListItem {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             WorkItemStatus   @default(OPEN)
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  tenantId           String           @db.Uuid
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  priority           TaskPriority     @default(MEDIUM)
  dueDate            DateTime?        @db.Date
  completedAt        DateTime?        @db.Timestamptz(6)
  assigneeId         String?          @db.Uuid
  punchListId        String           @db.Uuid
  Member             Member?          @relation(fields: [tenantId, assigneeId], references: [tenantId, id])
  PunchList          PunchList        @relation(fields: [tenantId, punchListId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, assigneeId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, completedAt])
  @@index([tenantId, deletedAt])
  @@index([tenantId, dueDate])
  @@index([tenantId, priority])
  @@index([tenantId, punchListId])
  @@index([tenantId, status])
}
```

### ProjectFinancialSnapshot

```prisma
model ProjectFinancialSnapshot {
  id                    String             @id @default(uuid(7)) @db.Uuid
  status                ProjectChildStatus @default(ACTIVE)
  version               Int                @default(1)
  createdAt             DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt             DateTime           @db.Timestamptz(6)
  tenantId              String             @db.Uuid
  deletedAt             DateTime?          @db.Timestamptz(6)
  deletedByActorId      String?            @db.Uuid
  createdByActorId      String?            @db.Uuid
  updatedByActorId      String?            @db.Uuid
  auditCorrelationId    String?            @db.Uuid
  dataClassification    String             @default("INTERNAL")
  retentionPolicy       RetentionPolicy?
  estimateOriginalTotal Decimal            @db.Decimal(14, 2)
  changeOrderDeltaTotal Decimal            @default(0) @db.Decimal(14, 2)
  actualCostsToDate     Decimal            @default(0) @db.Decimal(14, 2)
  totalLaborHours       Decimal            @default(0) @db.Decimal(10, 2)
  totalLaborCost        Decimal            @default(0) @db.Decimal(14, 2)
  snapshotDate          DateTime           @db.Timestamptz(6)
  snapshotReason        String
  projectId             String             @db.Uuid
  Project               Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, projectId, snapshotDate])
  @@index([tenantId, snapshotDate])
  @@index([tenantId, status])
}
```

### ProjectBudgetLine

```prisma
model ProjectBudgetLine {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  budgetCategory     String
  costCode           String
  budgetedAmount     Decimal            @db.Decimal(12, 2)
  actualAmount       Decimal            @default(0) @db.Decimal(12, 2)
  projectId          String             @db.Uuid
  taskId             String?            @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  TimesheetEntry     TimesheetEntry[]

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, budgetCategory])
  @@index([tenantId, costCode])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId, costCode])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### ProjectDocument

```prisma
model ProjectDocument {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  fileUrl            String
  fileType           String?
  uploadedAt         DateTime           @default(now()) @db.Timestamptz(6)
  uploaderId         String?            @db.Uuid
  attachmentId       String?            @db.Uuid
  projectId          String             @db.Uuid
  Attachment         Attachment?        @relation(fields: [tenantId, attachmentId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  Member             Member?            @relation(fields: [tenantId, uploaderId], references: [tenantId, id])

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, attachmentId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, fileType])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
  @@index([tenantId, status, updatedAt])
  @@index([tenantId, uploadedAt])
  @@index([tenantId, uploaderId])
}
```

### ProjectExternalAccess

```prisma
model ProjectExternalAccess {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  email              String
  role               String
  expiresAt          DateTime?          @db.Timestamptz(6)
  invitedAt          DateTime           @default(now()) @db.Timestamptz(6)
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, email])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, email])
  @@index([tenantId, expiresAt])
  @@index([tenantId, invitedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, role])
  @@index([tenantId, status])
}
```

### ProjectLocation

```prisma
model ProjectLocation {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  name               String
  address            String?
  coordinates        String?
  locationType       LocationType       @default(SITE)
  isPrimary          Boolean            @default(false)
  description        String?
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isPrimary])
  @@index([tenantId, locationType])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### ProjectMember

```prisma
model ProjectMember {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  memberId           String             @db.Uuid
  role               String
  joinedAt           DateTime           @default(now()) @db.Timestamptz(6)
  leftAt             DateTime?          @db.Timestamptz(6)
  projectId          String             @db.Uuid
  Member             Member             @relation(fields: [tenantId, memberId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, projectId, memberId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, joinedAt])
  @@index([tenantId, leftAt])
  @@index([tenantId, memberId])
  @@index([tenantId, projectId])
  @@index([tenantId, role])
  @@index([tenantId, status])
}
```

### ProjectNote

```prisma
model ProjectNote {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### ProjectReport

```prisma
model ProjectReport {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### ProjectIssue

```prisma
model ProjectIssue {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  severity           ImpactLevel        @default(MEDIUM)
  issueStatus        WorkItemStatus     @default(OPEN)
  reportedAt         DateTime           @default(now()) @db.Timestamptz(6)
  resolvedAt         DateTime?          @db.Timestamptz(6)
  assigneeId         String?            @db.Uuid
  projectId          String             @db.Uuid
  Member             Member?            @relation(fields: [tenantId, assigneeId], references: [tenantId, id])
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, assigneeId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, issueStatus])
  @@index([tenantId, projectId])
  @@index([tenantId, reportedAt])
  @@index([tenantId, resolvedAt])
  @@index([tenantId, severity])
  @@index([tenantId, status])
  @@index([tenantId, status, updatedAt])
}
```

### ProjectRisk

```prisma
model ProjectRisk {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             RiskStatus       @default(IDENTIFIED)
  version            Int              @default(1)
  createdAt          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime         @db.Timestamptz(6)
  tenantId           String           @db.Uuid
  deletedAt          DateTime?        @db.Timestamptz(6)
  deletedByActorId   String?          @db.Uuid
  createdByActorId   String?          @db.Uuid
  updatedByActorId   String?          @db.Uuid
  auditCorrelationId String?          @db.Uuid
  dataClassification String           @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  title              String
  description        String?
  probability        Int              @default(0)
  impact             ImpactLevel      @default(MEDIUM)
  mitigationPlan     String?
  identifiedAt       DateTime         @default(now()) @db.Timestamptz(6)
  ownerId            String?          @db.Uuid
  projectId          String           @db.Uuid
  Member             Member?          @relation(fields: [tenantId, ownerId], references: [tenantId, id])
  Project            Project          @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, identifiedAt])
  @@index([tenantId, impact])
  @@index([tenantId, ownerId])
  @@index([tenantId, probability])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
  @@index([tenantId, status, updatedAt])
}
```

### ProjectInventoryTransaction

```prisma
model ProjectInventoryTransaction {
  id                 String             @id @default(uuid(7)) @db.Uuid
  status             ProjectChildStatus @default(ACTIVE)
  version            Int                @default(1)
  createdAt          DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime           @db.Timestamptz(6)
  tenantId           String             @db.Uuid
  deletedAt          DateTime?          @db.Timestamptz(6)
  deletedByActorId   String?            @db.Uuid
  createdByActorId   String?            @db.Uuid
  updatedByActorId   String?            @db.Uuid
  auditCorrelationId String?            @db.Uuid
  dataClassification String             @default("INTERNAL")
  retentionPolicy    RetentionPolicy?
  projectId          String             @db.Uuid
  Project            Project            @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, status])
}
```

### Milestone

```prisma
model Milestone {
  id                                                                                  String                 @id @default(uuid(7)) @db.Uuid
  status                                                                              String                 @default("ACTIVE")
  version                                                                             Int                    @default(1)
  createdAt                                                                           DateTime               @default(now()) @db.Timestamptz(6)
  updatedAt                                                                           DateTime               @db.Timestamptz(6)
  tenantId                                                                            String                 @db.Uuid
  deletedAt                                                                           DateTime?              @db.Timestamptz(6)
  deletedByActorId                                                                    String?                @db.Uuid
  createdByActorId                                                                    String?                @db.Uuid
  updatedByActorId                                                                    String?                @db.Uuid
  auditCorrelationId                                                                  String?                @db.Uuid
  dataClassification                                                                  String                 @default("INTERNAL")
  retentionPolicy                                                                     RetentionPolicy?
  name                                                                                String                 @db.VarChar(255)
  description                                                                         String?
  milestoneType                                                                       MilestoneType          @default(CUSTOM)
  targetDate                                                                          DateTime               @db.Date
  actualDate                                                                          DateTime?              @db.Date
  milestoneStatus                                                                     MilestoneStatus        @default(PLANNED)
  progressPercentage                                                                  Decimal                @default(0) @db.Decimal(5, 2)
  isCompleted                                                                         Boolean                @default(false)
  completedAt                                                                         DateTime?              @db.Timestamptz(6)
  completedById                                                                       String?                @db.Uuid
  priority                                                                            ImpactLevel            @default(MEDIUM)
  isCriticalPath                                                                      Boolean                @default(false)
  isClientFacing                                                                      Boolean                @default(false)
  deliverables                                                                        Json?
  acceptanceCriteria                                                                  Json?
  budgetImpact                                                                        Decimal?               @db.Decimal(12, 2)
  revenueImpact                                                                       Decimal?               @db.Decimal(12, 2)
  penaltyRisk                                                                         Decimal?               @db.Decimal(12, 2)
  ownerId                                                                             String                 @db.Uuid
  alertDaysBefore                                                                     Int?
  lastAlertSent                                                                       DateTime?              @db.Timestamptz(6)
  escalationLevel                                                                     EscalationLevel        @default(NONE)
  scheduleId                                                                          String?                @db.Uuid
  projectId                                                                           String?                @db.Uuid
  metadata                                                                            Json?
  tags                                                                                String[]               @db.VarChar(50)
  Member_Milestone_tenantId_completedByIdToMember                                     Member?                @relation("Milestone_tenantId_completedByIdToMember", fields: [tenantId, completedById], references: [tenantId, id])
  Tenant                                                                              Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Member_Milestone_tenantId_ownerIdToMember                                           Member                 @relation("Milestone_tenantId_ownerIdToMember", fields: [tenantId, ownerId], references: [tenantId, id])
  Project                                                                             Project?               @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  Schedule                                                                            Schedule?              @relation(fields: [tenantId, scheduleId], references: [tenantId, id], onDelete: Cascade)
  MilestoneDependency_MilestoneDependency_tenantId_dependentMilestoneIdToMilestone    MilestoneDependency[]  @relation("MilestoneDependency_tenantId_dependentMilestoneIdToMilestone")
  MilestoneDependency_MilestoneDependency_tenantId_prerequisiteMilestoneIdToMilestone MilestoneDependency[]  @relation("MilestoneDependency_tenantId_prerequisiteMilestoneIdToMilestone")
  MilestoneStakeholder                                                                MilestoneStakeholder[]

  @@unique([tenantId, id])
  @@unique([tenantId, scheduleId, name])
  @@index([createdAt], type: Brin)
  @@index([tenantId, alertDaysBefore, targetDate])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, completedAt])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, isClientFacing])
  @@index([tenantId, isCompleted])
  @@index([tenantId, isCriticalPath])
  @@index([tenantId, milestoneStatus])
  @@index([tenantId, milestoneType])
  @@index([tenantId, ownerId])
  @@index([tenantId, priority])
  @@index([tenantId, projectId])
  @@index([tenantId, scheduleId])
  @@index([tenantId, status])
  @@index([tenantId, targetDate])
}
```

### MilestoneDependency

```prisma
model MilestoneDependency {
  id                                                                        String           @id @default(uuid(7)) @db.Uuid
  status                                                                    String           @default("ACTIVE")
  version                                                                   Int              @default(1)
  createdAt                                                                 DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                                                 DateTime         @db.Timestamptz(6)
  tenantId                                                                  String           @db.Uuid
  deletedAt                                                                 DateTime?        @db.Timestamptz(6)
  deletedByActorId                                                          String?          @db.Uuid
  createdByActorId                                                          String?          @db.Uuid
  updatedByActorId                                                          String?          @db.Uuid
  auditCorrelationId                                                        String?          @db.Uuid
  dataClassification                                                        String           @default("INTERNAL")
  retentionPolicy                                                           RetentionPolicy?
  dependentMilestoneId                                                      String           @db.Uuid
  prerequisiteMilestoneId                                                   String           @db.Uuid
  dependencyType                                                            String           @default("FINISH_TO_START") @db.VarChar(30)
  lagDays                                                                   Int?             @default(0)
  isHardDependency                                                          Boolean          @default(true)
  isActive                                                                  Boolean          @default(true)
  violationRisk                                                             ImpactLevel?
  lastValidated                                                             DateTime?        @db.Timestamptz(6)
  reason                                                                    String?          @db.VarChar(500)
  impact                                                                    String?
  Milestone_MilestoneDependency_tenantId_dependentMilestoneIdToMilestone    Milestone        @relation("MilestoneDependency_tenantId_dependentMilestoneIdToMilestone", fields: [tenantId, dependentMilestoneId], references: [tenantId, id], onDelete: Cascade)
  Tenant                                                                    Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Milestone_MilestoneDependency_tenantId_prerequisiteMilestoneIdToMilestone Milestone        @relation("MilestoneDependency_tenantId_prerequisiteMilestoneIdToMilestone", fields: [tenantId, prerequisiteMilestoneId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, dependentMilestoneId, prerequisiteMilestoneId])
  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, dependencyType])
  @@index([tenantId, dependentMilestoneId])
  @@index([tenantId, isActive])
  @@index([tenantId, prerequisiteMilestoneId])
  @@index([tenantId, status])
  @@index([tenantId, violationRisk])
}
```

### MilestoneStakeholder

```prisma
model MilestoneStakeholder {
  id                                                         String           @id @default(uuid(7)) @db.Uuid
  status                                                     String           @default("ACTIVE")
  version                                                    Int              @default(1)
  createdAt                                                  DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                                  DateTime         @db.Timestamptz(6)
  tenantId                                                   String           @db.Uuid
  deletedAt                                                  DateTime?        @db.Timestamptz(6)
  deletedByActorId                                           String?          @db.Uuid
  createdByActorId                                           String?          @db.Uuid
  updatedByActorId                                           String?          @db.Uuid
  auditCorrelationId                                         String?          @db.Uuid
  dataClassification                                         String           @default("INTERNAL")
  retentionPolicy                                            RetentionPolicy?
  milestoneId                                                String           @db.Uuid
  stakeholderId                                              String           @db.Uuid
  stakeholderRole                                            StakeholderRole  @default(OBSERVER)
  involvementLevel                                           ImpactLevel      @default(MEDIUM)
  isRequired                                                 Boolean          @default(false)
  notifyOnUpdate                                             Boolean          @default(true)
  notifyOnDelay                                              Boolean          @default(true)
  notifyOnCompletion                                         Boolean          @default(true)
  assignedAt                                                 DateTime         @default(now()) @db.Timestamptz(6)
  assignedById                                               String           @db.Uuid
  Member_MilestoneStakeholder_tenantId_assignedByIdToMember  Member           @relation("MilestoneStakeholder_tenantId_assignedByIdToMember", fields: [tenantId, assignedById], references: [tenantId, id])
  Tenant                                                     Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Milestone                                                  Milestone        @relation(fields: [tenantId, milestoneId], references: [tenantId, id], onDelete: Cascade)
  Member_MilestoneStakeholder_tenantId_stakeholderIdToMember Member           @relation("MilestoneStakeholder_tenantId_stakeholderIdToMember", fields: [tenantId, stakeholderId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@unique([tenantId, milestoneId, stakeholderId])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, involvementLevel])
  @@index([tenantId, isRequired])
  @@index([tenantId, milestoneId])
  @@index([tenantId, stakeholderId])
  @@index([tenantId, stakeholderRole])
  @@index([tenantId, status])
}
```

### ResourceAllocation

```prisma
model ResourceAllocation {
  id                                                      String           @id @default(uuid(7)) @db.Uuid
  status                                                  String           @default("ACTIVE")
  version                                                 Int              @default(1)
  createdAt                                               DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                               DateTime         @db.Timestamptz(6)
  tenantId                                                String           @db.Uuid
  deletedAt                                               DateTime?        @db.Timestamptz(6)
  deletedByActorId                                        String?          @db.Uuid
  createdByActorId                                        String?          @db.Uuid
  updatedByActorId                                        String?          @db.Uuid
  auditCorrelationId                                      String?          @db.Uuid
  dataClassification                                      String           @default("INTERNAL")
  retentionPolicy                                         RetentionPolicy?
  resourceType                                            ResourceType     @default(HUMAN)
  resourceId                                              String?          @db.Uuid
  resourceName                                            String           @db.VarChar(255)
  allocationType                                          AllocationType   @default(FULL_TIME)
  allocationUnit                                          String           @db.VarChar(20)
  allocatedAmount                                         Decimal          @db.Decimal(10, 2)
  availableAmount                                         Decimal?         @db.Decimal(10, 2)
  startDate                                               DateTime         @db.Date
  endDate                                                 DateTime         @db.Date
  estimatedHours                                          Decimal?         @db.Decimal(8, 2)
  actualHours                                             Decimal?         @db.Decimal(8, 2)
  costPerUnit                                             Decimal?         @db.Decimal(10, 2)
  budgetedCost                                            Decimal?         @db.Decimal(12, 2)
  actualCost                                              Decimal?         @db.Decimal(12, 2)
  assignedById                                            String           @db.Uuid
  assignedToId                                            String?          @db.Uuid
  priority                                                ImpactLevel      @default(MEDIUM)
  allocationStatus                                        AllocationStatus @default(PLANNED)
  utilizationRate                                         Decimal?         @db.Decimal(5, 2)
  requiresApproval                                        Boolean          @default(false)
  approvedAt                                              DateTime?        @db.Timestamptz(6)
  approvedById                                            String?          @db.Uuid
  scheduleId                                              String?          @db.Uuid
  projectId                                               String?          @db.Uuid
  taskId                                                  String?          @db.Uuid
  metadata                                                Json?
  tags                                                    String[]         @db.VarChar(50)
  Member_ResourceAllocation_tenantId_approvedByIdToMember Member?          @relation("ResourceAllocation_tenantId_approvedByIdToMember", fields: [tenantId, approvedById], references: [tenantId, id])
  Member_ResourceAllocation_tenantId_assignedByIdToMember Member           @relation("ResourceAllocation_tenantId_assignedByIdToMember", fields: [tenantId, assignedById], references: [tenantId, id])
  Member_ResourceAllocation_tenantId_assignedToIdToMember Member?          @relation("ResourceAllocation_tenantId_assignedToIdToMember", fields: [tenantId, assignedToId], references: [tenantId, id])
  Tenant                                                  Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Project                                                 Project?         @relation(fields: [tenantId, projectId], references: [tenantId, id], onDelete: Cascade)
  Schedule                                                Schedule?        @relation(fields: [tenantId, scheduleId], references: [tenantId, id], onDelete: Cascade)
  Task                                                    Task?            @relation(fields: [tenantId, taskId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, allocationStatus])
  @@index([tenantId, assignedById])
  @@index([tenantId, assignedToId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, projectId])
  @@index([tenantId, requiresApproval, approvedAt])
  @@index([tenantId, resourceType])
  @@index([tenantId, scheduleId])
  @@index([tenantId, startDate, endDate])
  @@index([tenantId, status])
  @@index([tenantId, taskId])
}
```

### Location

```prisma
model Location {
  id                                                 String           @id @default(uuid(7)) @db.Uuid
  status                                             LocationStatus   @default(ACTIVE)
  version                                            Int              @default(1)
  createdAt                                          DateTime         @default(now()) @db.Timestamptz(6)
  updatedAt                                          DateTime         @db.Timestamptz(6)
  tenantId                                           String           @db.Uuid
  deletedAt                                          DateTime?        @db.Timestamptz(6)
  deletedByActorId                                   String?          @db.Uuid
  createdByActorId                                   String?          @db.Uuid
  updatedByActorId                                   String?          @db.Uuid
  auditCorrelationId                                 String?          @db.Uuid
  dataClassification                                 String           @default("INTERNAL")
  retentionPolicy                                    RetentionPolicy?
  locationCode                                       String           @unique @db.Citext
  locationName                                       String           @db.VarChar(100)
  locationDescription                                String?
  locationType                                       LocationType     @default(OFFICE)
  addressLine1                                       String           @db.VarChar(255)
  addressLine2                                       String?          @db.VarChar(255)
  city                                               String           @db.VarChar(100)
  stateProvince                                      String           @db.VarChar(100)
  postalCode                                         String           @db.VarChar(20)
  country                                            String           @db.VarChar(100)
  latitude                                           Decimal?         @db.Decimal(10, 8)
  longitude                                          Decimal?         @db.Decimal(11, 8)
  timeZone                                           String?          @db.VarChar(50)
  primaryPhone                                       String?          @db.VarChar(50)
  secondaryPhone                                     String?          @db.VarChar(50)
  faxNumber                                          String?          @db.VarChar(50)
  email                                              String?          @db.Citext
  website                                            String?          @db.VarChar(500)
  isHeadquarters                                     Boolean          @default(false)
  isActive                                           Boolean          @default(true)
  capacity                                           Int?
  squareFootage                                      Int?
  floorCount                                         Int?
  parkingSpaces                                      Int?
  managerId                                          String?          @db.Uuid
  facilityManagerId                                  String?          @db.Uuid
  monthlyRent                                        Decimal?         @db.Decimal(12, 2)
  currency                                           CurrencyCode     @default(USD)
  costCenterId                                       String?          @db.Uuid
  safetyRating                                       SafetyRating?    @default(NOT_RATED)
  complianceCerts                                    Json?
  emergencyContact                                   String?          @db.VarChar(255)
  effectiveDate                                      DateTime         @db.Date
  endDate                                            DateTime?        @db.Date
  approvedByActorId                                  String?          @db.Uuid
  approvedAt                                         DateTime?        @db.Timestamptz(6)
  Department                                         Department[]
  CostCenter                                         CostCenter?      @relation(fields: [tenantId, costCenterId], references: [tenantId, id])
  Member_Location_tenantId_facilityManagerIdToMember Member?          @relation("Location_tenantId_facilityManagerIdToMember", fields: [tenantId, facilityManagerId], references: [tenantId, id])
  Tenant                                             Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  Member_Location_tenantId_managerIdToMember         Member?          @relation("Location_tenantId_managerIdToMember", fields: [tenantId, managerId], references: [tenantId, id])
  Project                                            Project[]

  @@unique([tenantId, id])
  @@unique([tenantId, locationCode])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approvedByActorId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, city, country])
  @@index([tenantId, city])
  @@index([tenantId, costCenterId])
  @@index([tenantId, country])
  @@index([tenantId, dataClassification])
  @@index([tenantId, effectiveDate])
  @@index([tenantId, facilityManagerId])
  @@index([tenantId, isActive])
  @@index([tenantId, isHeadquarters])
  @@index([tenantId, locationName])
  @@index([tenantId, locationType])
  @@index([tenantId, managerId])
  @@index([tenantId, stateProvince])
}
```

### ProjectType

```prisma
model ProjectType {
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

## 🧩 Enums

### AllocationStatus

```prisma
enum AllocationStatus {
  PLANNED
  ACTIVE
  COMPLETED
  CANCELLED
  ON_HOLD
  OVERALLOCATED
}
```

### AllocationType

```prisma
enum AllocationType {
  FULL_TIME
  PART_TIME
  SHARED
  ON_DEMAND
  TEMPORARY
  CONTRACT
}
```

### CurrencyCode

```prisma
enum CurrencyCode {
  USD
  EUR
  GBP
  CAD
  AUD
  JPY
  CHF
  CNY
  INR
  BRL
  MXN
  KRW
  SGD
  HKD
  NOK
  SEK
  DKK
  PLN
  CZK
  HUF
  RUB
  ZAR
  NZD
  THB
  MYR
  IDR
  PHP
  VND
  TWD
  ILS
  AED
  SAR
  EGP
  TRY
  CLP
  COP
  PEN
  ARS
  UYU
}
```

### DependencyType

```prisma
enum DependencyType {
  FINISH_TO_START
  START_TO_START
  FINISH_TO_FINISH
  START_TO_FINISH
}
```

### EscalationLevel

```prisma
enum EscalationLevel {
  NONE
  MANAGER
  DIRECTOR
  EXECUTIVE
  BOARD
}
```

### ExternalAccessLevel

```prisma
enum ExternalAccessLevel {
  VIEW_ONLY
  DOWNLOAD
  COMMENT
  LIMITED_EDIT
  FULL_COLLABORATE
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

### InspectionApprovalDecision

```prisma
enum InspectionApprovalDecision {
  PENDING
  APPROVED
  DECLINED
  ESCALATED
  CANCELLED
}
```

### InspectionStatus

```prisma
enum InspectionStatus {
  SCHEDULED
  IN_PROGRESS
  PASSED
  FAILED
  RESCHEDULED
}
```

### LocationStatus

```prisma
enum LocationStatus {
  ACTIVE
  INACTIVE
  TEMPORARY_CLOSURE
  PERMANENTLY_CLOSED
  ARCHIVED
}
```

### LocationType

```prisma
enum LocationType {
  SITE
  OFFICE
  WAREHOUSE
  STAGING_AREA
}
```

### MilestoneStatus

```prisma
enum MilestoneStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  DELAYED
  CANCELLED
  AT_RISK
  BLOCKED
}
```

### MilestoneType

```prisma
enum MilestoneType {
  PROJECT_START
  PROJECT_END
  PHASE_COMPLETE
  DELIVERY
  PAYMENT
  APPROVAL
  REVIEW
  TESTING
  DEPLOYMENT
  CUSTOM
}
```

### ProjectChildStatus

```prisma
enum ProjectChildStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### ProjectStatus

```prisma
enum ProjectStatus {
  PLANNING
  ACTIVE
  IN_PROGRESS
  COMPLETED
  ON_HOLD
  CANCELLED
  CLOSED
  ARCHIVED
}
```

### ResourceType

```prisma
enum ResourceType {
  HUMAN
  EQUIPMENT
  MATERIAL
  BUDGET
  SOFTWARE
  FACILITY
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

### RFIReplyType

```prisma
enum RFIReplyType {
  RESPONSE
  CLARIFICATION
  FOLLOW_UP
}
```

### RFIStatus

```prisma
enum RFIStatus {
  SUBMITTED
  UNDER_REVIEW
  CLARIFICATION_REQUESTED
  ANSWERED
  CLOSED
}
```

### RiskStatus

```prisma
enum RiskStatus {
  IDENTIFIED
  ANALYZING
  MITIGATING
  MONITORING
  CLOSED
}
```

### SafetyRating

```prisma
enum SafetyRating {
  A_EXCELLENT
  B_GOOD
  C_SATISFACTORY
  D_NEEDS_IMPROVEMENT
  F_UNSATISFACTORY
  NOT_RATED
  UNDER_REVIEW
  EXEMPT
}
```

### ScheduleExceptionType

```prisma
enum ScheduleExceptionType {
  HOLIDAY
  MAINTENANCE
  WEATHER_DELAY
  RESOURCE_UNAVAILABLE
  EMERGENCY
  CUSTOM
}
```

### ScheduleStatus

```prisma
enum ScheduleStatus {
  DRAFT
  ACTIVE
  BASELINED
  ARCHIVED
  CANCELLED
}
```

### StakeholderRole

```prisma
enum StakeholderRole {
  OWNER
  APPROVER
  REVIEWER
  OBSERVER
  CONTRIBUTOR
}
```

### SubmittalApprovalDecision

```prisma
enum SubmittalApprovalDecision {
  PENDING
  APPROVED
  DECLINED
  ESCALATED
  CANCELLED
}
```

### SubmittalItemStatus

```prisma
enum SubmittalItemStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}
```

### SubmittalStatus

```prisma
enum SubmittalStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  RESUBMIT
}
```

### TaskPriority

```prisma
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
  URGENT
}
```

### WorkItemStatus

```prisma
enum WorkItemStatus {
  DRAFT
  OPEN
  IN_PROGRESS
  ON_HOLD
  BLOCKED
  RESOLVED
  COMPLETED
  CLOSED
  CANCELLED
}
```

_Mapped from ERP docs; extracted from schema.prisma_