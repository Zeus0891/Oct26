// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model Estimate {
  id                                                       String                 @id @default(uuid(7)) @db.Uuid
  status                                                   EstimateStatus         @default(DRAFT)
  version                                                  Int                    @default(1)
  createdAt                                                DateTime               @default(now()) @db.Timestamptz(6)
  updatedAt                                                DateTime               @db.Timestamptz(6)
  tenantId                                                 String                 @db.Uuid
  deletedAt                                                DateTime?              @db.Timestamptz(6)
  deletedByActorId                                         String?                @db.Uuid
  createdByActorId                                         String?                @db.Uuid
  updatedByActorId                                         String?                @db.Uuid
  globalId                                                 String                 @unique @db.Uuid
  auditCorrelationId                                       String?                @db.Uuid
  dataClassification                                       String                 @default("CONFIDENTIAL")
  retentionPolicy                                          RetentionPolicy?
  clientAccountId                                          String?                @db.Uuid
  clientContactId                                          String?                @db.Uuid
  contractTemplateId                                       String?                @db.Uuid
  termsTemplateId                                          String?                @db.Uuid
  documentGroupId                                          String?                @db.Uuid
  estimateNumber                                           String?                @db.Citext
  sentAt                                                   DateTime?              @db.Timestamptz(6)
  viewedAt                                                 DateTime?              @db.Timestamptz(6)
  clientApprovedAt                                         DateTime?              @db.Timestamptz(6)
  clientDeclinedAt                                         DateTime?              @db.Timestamptz(6)
  declinedAt                                               DateTime?              @db.Timestamptz(6)
  clientDecisionNote                                       String?
  enablePublicView                                         Boolean                @default(false)
  approvalTokenHash                                        String?                @unique
  publicViewTokenHash                                      String?                @unique
  approvedByMemberId                                       String?                @db.Uuid
  approvedAt                                               DateTime?              @db.Timestamptz(6)
  finalApprovedByMemberId                                  String?                @db.Uuid
  finalApprovedAt                                          DateTime?              @db.Timestamptz(6)
  declineReason                                            String?
  approvedProjectId                                        String?                @db.Uuid
  approvedInvoiceId                                        String?                @db.Uuid
  subtotal                                                 Decimal?               @db.Decimal(12, 2)
  discountType                                             EstimateDiscountType   @default(NONE)
  discountValue                                            Decimal?               @db.Decimal(6, 3)
  discountAmount                                           Decimal                @default(0) @db.Decimal(12, 2)
  taxType                                                  EstimateTaxType        @default(NONE)
  taxRate                                                  Decimal?               @db.Decimal(6, 3)
  taxAmount                                                Decimal                @default(0) @db.Decimal(12, 2)
  totalDue                                                 Decimal?               @db.Decimal(12, 2)
  grandTotal                                               Decimal?               @db.Decimal(12, 2)
  validUntil                                               DateTime?
  name                                                     String
  clientNotes                                              String?
  internalNotes                                            String?
  serviceLocation                                          String?
  specialRequirements                                      String?
  Bid                                                      Bid[]
  ChangeOrder                                              ChangeOrder[]
  Member_Estimate_tenantId_approvedByMemberIdToMember      Member?                @relation("Estimate_tenantId_approvedByMemberIdToMember", fields: [tenantId, approvedByMemberId], references: [tenantId, id], onDelete: SetNull)
  Invoice_Estimate_tenantId_approvedInvoiceIdToInvoice     Invoice?               @relation("Estimate_tenantId_approvedInvoiceIdToInvoice", fields: [tenantId, approvedInvoiceId], references: [tenantId, id], onDelete: SetNull)
  Project_Estimate_tenantId_approvedProjectIdToProject     Project?               @relation("Estimate_tenantId_approvedProjectIdToProject", fields: [tenantId, approvedProjectId], references: [tenantId, id], onDelete: SetNull)
  Account                                                  Account?               @relation(fields: [tenantId, clientAccountId], references: [tenantId, id], onDelete: SetNull)
  Contact                                                  Contact?               @relation(fields: [tenantId, clientContactId], references: [tenantId, id], onDelete: SetNull)
  ContractTemplate                                         ContractTemplate?      @relation(fields: [tenantId, contractTemplateId], references: [tenantId, id], onDelete: SetNull)
  DocumentGroup                                            DocumentGroup?         @relation(fields: [tenantId, documentGroupId], references: [tenantId, id], onDelete: SetNull)
  Member_Estimate_tenantId_finalApprovedByMemberIdToMember Member?                @relation("Estimate_tenantId_finalApprovedByMemberIdToMember", fields: [tenantId, finalApprovedByMemberId], references: [tenantId, id], onDelete: SetNull)
  TermsTemplate                                            TermsTemplate?         @relation(fields: [tenantId, termsTemplateId], references: [tenantId, id], onDelete: SetNull)
  EstimateApproval                                         EstimateApproval[]
  EstimateAttachment                                       EstimateAttachment[]
  EstimateComment                                          EstimateComment[]
  EstimateDiscount                                         EstimateDiscount[]
  EstimateHistoryEvent                                     EstimateHistoryEvent[]
  EstimateLineItem                                         EstimateLineItem[]
  EstimateRevision                                         EstimateRevision[]
  EstimateTax                                              EstimateTax[]
  EstimateTerm                                             EstimateTerm[]
  Invoice_Invoice_tenantId_estimateIdToEstimate            Invoice?               @relation("Invoice_tenantId_estimateIdToEstimate")
  Project_Project_tenantId_estimateIdToEstimate            Project?               @relation("Project_tenantId_estimateIdToEstimate")

  @@unique([tenantId, approvedInvoiceId])
  @@unique([tenantId, approvedProjectId])
  @@unique([tenantId, estimateNumber])
  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, approvedInvoiceId])
  @@index([tenantId, approvedProjectId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, clientAccountId])
  @@index([tenantId, clientContactId])
  @@index([tenantId, contractTemplateId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, documentGroupId])
  @@index([tenantId, grandTotal])
  @@index([tenantId, serviceLocation])
  @@index([tenantId, status, createdAt])
  @@index([tenantId, status])
  @@index([tenantId, termsTemplateId])
  @@index([tenantId, validUntil])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateApproval {
  id                 String                   @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus      @default(ACTIVE)
  version            Int                      @default(1)
  createdAt          DateTime                 @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime                 @db.Timestamptz(6)
  tenantId           String                   @db.Uuid
  deletedAt          DateTime?                @db.Timestamptz(6)
  deletedByActorId   String?                  @db.Uuid
  createdByActorId   String?                  @db.Uuid
  updatedByActorId   String?                  @db.Uuid
  auditCorrelationId String?                  @db.Uuid
  dataClassification String                   @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  estimateId         String                   @db.Uuid
  approvalRequestId  String?                  @db.Uuid
  approverId         String?                  @db.Uuid
  decision           EstimateApprovalDecision @default(PENDING)
  comments           String?
  requestedAt        DateTime?                @db.Timestamptz(6)
  decidedAt          DateTime?                @db.Timestamptz(6)
  ApprovalRequest    ApprovalRequest?         @relation(fields: [tenantId, approvalRequestId], references: [tenantId, id], onDelete: SetNull)
  Estimate           Estimate                 @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, approvalRequestId])
  @@index([tenantId, approverId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, decision, createdAt])
  @@index([tenantId, decision])
  @@index([tenantId, estimateId])
  @@index([tenantId, requestedAt])
  @@index([tenantId, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateAttachment {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  estimateId         String              @db.Uuid
  documentGroupId    String?             @db.Uuid
  fileObjectId       String?             @db.Uuid
  fileName           String
  url                String
  mimeType           String?
  fileSize           Int?
  sortOrder          Int                 @default(0)
  uploadedBy         String?             @db.Uuid
  DocumentGroup      DocumentGroup?      @relation(fields: [tenantId, documentGroupId], references: [tenantId, id], onDelete: SetNull)
  Estimate           Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)
  FileObject         FileObject?         @relation(fields: [tenantId, fileObjectId], references: [tenantId, id], onDelete: SetNull)

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, documentGroupId])
  @@index([tenantId, estimateId])
  @@index([tenantId, estimateId, sortOrder])
  @@index([tenantId, fileName])
  @@index([tenantId, fileObjectId])
  @@index([tenantId, mimeType])
  @@index([tenantId, status])
  @@index([tenantId, uploadedBy])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateComment {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
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
  estimateId         String              @db.Uuid
  commentText        String
  authorId           String              @db.Uuid
  isInternal         Boolean             @default(true)
  Estimate           Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, authorId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, estimateId])
  @@index([tenantId, isInternal])
  @@index([tenantId, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateDiscount {
  id                 String               @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus  @default(ACTIVE)
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
  estimateId         String               @db.Uuid
  type               EstimateDiscountType
  value              Decimal?             @db.Decimal(6, 3)
  amount             Decimal              @db.Decimal(12, 2)
  reason             String?
  Estimate           Estimate             @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, estimateId])
  @@index([tenantId, status])
  @@index([tenantId, type])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateHistoryEvent {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
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
  estimateId         String              @db.Uuid
  eventType          String              @db.VarChar(100)
  eventDescription   String
  actorId            String?             @db.Uuid
  timestamp          DateTime            @default(now()) @db.Timestamptz(6)
  Estimate           Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, actorId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, estimateId])
  @@index([tenantId, estimateId, timestamp])
  @@index([tenantId, eventType])
  @@index([tenantId, status])
  @@index([tenantId, timestamp])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateLineItem {
  id                                                                          String              @id @default(uuid(7)) @db.Uuid
  status                                                                      EstimateChildStatus @default(ACTIVE)
  version                                                                     Int                 @default(1)
  createdAt                                                                   DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt                                                                   DateTime            @db.Timestamptz(6)
  tenantId                                                                    String              @db.Uuid
  deletedAt                                                                   DateTime?           @db.Timestamptz(6)
  deletedByActorId                                                            String?             @db.Uuid
  createdByActorId                                                            String?             @db.Uuid
  updatedByActorId                                                            String?             @db.Uuid
  auditCorrelationId                                                          String?             @db.Uuid
  dataClassification                                                          String              @default("CONFIDENTIAL")
  retentionPolicy                                                             RetentionPolicy?
  estimateId                                                                  String              @db.Uuid
  taskId                                                                      String?             @db.Uuid
  purchaseOrderLineId                                                         String?             @db.Uuid
  priceListItemId                                                             String?             @db.Uuid
  name                                                                        String
  description                                                                 String?
  quantity                                                                    Decimal             @db.Decimal(12, 3)
  unitPrice                                                                   Decimal             @db.Decimal(12, 2)
  total                                                                       Decimal             @db.Decimal(12, 2)
  sortOrder                                                                   Int                 @default(0)
  PriceListItem                                                               PriceListItem?      @relation(fields: [priceListItemId], references: [id])
  Estimate                                                                    Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)
  PurchaseOrderLine                                                           PurchaseOrderLine?  @relation(fields: [tenantId, purchaseOrderLineId], references: [tenantId, id], onDelete: SetNull)
  ProjectTask_EstimateLineItem_tenantId_taskIdToProjectTask                   ProjectTask?        @relation("EstimateLineItem_tenantId_taskIdToProjectTask", fields: [tenantId, taskId], references: [tenantId, id], onDelete: SetNull)
  InvoiceLineItem                                                             InvoiceLineItem[]
  ProjectTask_ProjectTask_tenantId_sourceEstimateLineItemIdToEstimateLineItem ProjectTask[]       @relation("ProjectTask_tenantId_sourceEstimateLineItemIdToEstimateLineItem")

  @@unique([tenantId, id])
  @@index([priceListItemId])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, estimateId])
  @@index([tenantId, estimateId, sortOrder])
  @@index([tenantId, name])
  @@index([tenantId, purchaseOrderLineId])
  @@index([tenantId, status])
  @@index([tenantId, taskId])
  @@index([tenantId, unitPrice])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateRevision {
  id                     String              @id @default(uuid(7)) @db.Uuid
  status                 EstimateChildStatus @default(ACTIVE)
  version                Int                 @default(1)
  createdAt              DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt              DateTime            @db.Timestamptz(6)
  tenantId               String              @db.Uuid
  deletedAt              DateTime?           @db.Timestamptz(6)
  deletedByActorId       String?             @db.Uuid
  createdByActorId       String?             @db.Uuid
  updatedByActorId       String?             @db.Uuid
  auditCorrelationId     String?             @db.Uuid
  dataClassification     String              @default("CONFIDENTIAL")
  retentionPolicy        RetentionPolicy?
  estimateId             String              @db.Uuid
  revisionNumber         Int
  snapshotSubtotal       Decimal?            @db.Decimal(12, 2)
  snapshotDiscountType   String?
  snapshotDiscountValue  Decimal?            @db.Decimal(6, 3)
  snapshotDiscountAmount Decimal?            @db.Decimal(12, 2)
  snapshotTaxType        String?
  snapshotTaxRate        Decimal?            @db.Decimal(6, 3)
  snapshotTaxAmount      Decimal?            @db.Decimal(12, 2)
  snapshotGrandTotal     Decimal?            @db.Decimal(12, 2)
  snapshotTerms          String?
  snapshotValidUntil     DateTime?           @db.Timestamptz(6)
  Estimate               Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, createdAt])
  @@index([tenantId, dataClassification])
  @@index([tenantId, estimateId])
  @@index([tenantId, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateTax {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  estimateId         String              @db.Uuid
  taxType            EstimateTaxType
  rate               Decimal             @db.Decimal(6, 3)
  amount             Decimal             @db.Decimal(12, 2)
  Estimate           Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, estimateId])
  @@index([tenantId, rate])
  @@index([tenantId, status])
  @@index([tenantId, taxType])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model EstimateTerm {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  estimateId         String              @db.Uuid
  termType           EstimateTermType
  body               String
  sortOrder          Int                 @default(0)
  Estimate           Estimate            @relation(fields: [tenantId, estimateId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, estimateId])
  @@index([tenantId, estimateId, sortOrder])
  @@index([tenantId, status])
  @@index([tenantId, termType])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model Bid {
  id                 String           @id @default(uuid(7)) @db.Uuid
  status             BidStatus        @default(DRAFT)
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
  estimateId         String?          @db.Uuid
  opportunityId      String?          @db.Uuid
  name               String
  description        String?
  dueDate            DateTime?        @db.Timestamptz(6)
  Estimate           Estimate?        @relation(fields: [tenantId, estimateId], references: [tenantId, id])
  Opportunity        Opportunity?     @relation(fields: [tenantId, opportunityId], references: [tenantId, id], onDelete: Cascade)
  BidComparison      BidComparison[]
  BidInvitation      BidInvitation[]
  BidSubmission      BidSubmission[]

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, dueDate])
  @@index([tenantId, estimateId])
  @@index([tenantId, name])
  @@index([tenantId, opportunityId])
  @@index([tenantId, status, dueDate])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model BidComparison {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             EstimateChildStatus @default(ACTIVE)
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
  bidId              String              @db.Uuid
  criterion          String              @db.VarChar(200)
  value              String?
  ranking            Int?
  recommendation     String?
  Bid                Bid                 @relation(fields: [tenantId, bidId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([createdAt], type: Brin)
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, bidId])
  @@index([tenantId, criterion])
  @@index([tenantId, dataClassification])
  @@index([tenantId, deletedAt])
  @@index([tenantId, ranking])
  @@index([tenantId, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model BidInvitation {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             BidInvitationStatus @default(SENT)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  bidId              String              @db.Uuid
  inviteeName        String
  inviteeEmail       String
  sentAt             DateTime?           @db.Timestamptz(6)
  respondedAt        DateTime?           @db.Timestamptz(6)
  Bid                Bid                 @relation(fields: [tenantId, bidId], references: [tenantId, id], onDelete: Cascade)
  BidSubmission      BidSubmission[]

  @@unique([tenantId, id])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, bidId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, inviteeEmail])
  @@index([tenantId, respondedAt])
  @@index([tenantId, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model BidSubmission {
  id                 String              @id @default(uuid(7)) @db.Uuid
  status             BidSubmissionStatus @default(DRAFT)
  version            Int                 @default(1)
  createdAt          DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime            @db.Timestamptz(6)
  tenantId           String              @db.Uuid
  deletedAt          DateTime?           @db.Timestamptz(6)
  deletedByActorId   String?             @db.Uuid
  createdByActorId   String?             @db.Uuid
  updatedByActorId   String?             @db.Uuid
  auditCorrelationId String?             @db.Uuid
  dataClassification String              @default("CONFIDENTIAL")
  retentionPolicy    RetentionPolicy?
  invitationId       String              @db.Uuid
  bidId              String              @db.Uuid
  submittedAt        DateTime?           @db.Timestamptz(6)
  amount             Decimal?            @db.Decimal(12, 2)
  notes              String?
  attachmentUrl      String?
  Bid                Bid                 @relation(fields: [tenantId, bidId], references: [tenantId, id], onDelete: Cascade)
  BidInvitation      BidInvitation       @relation(fields: [tenantId, invitationId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, id])
  @@index([tenantId, amount])
  @@index([tenantId, auditCorrelationId])
  @@index([tenantId, bidId])
  @@index([tenantId, dataClassification])
  @@index([tenantId, invitationId])
  @@index([tenantId, status])
  @@index([tenantId, submittedAt])
}

enum EstimateApprovalDecision {
  PENDING
  APPROVED
  DECLINED
  CANCELLED
  ESCALATED
}

enum EstimateChildStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum EstimateDiscountType {
  NONE
  PERCENTAGE
  FIXED_AMOUNT
  VOLUME
  EARLY_PAYMENT
  PROMOTIONAL
}

enum EstimateStatus {
  DRAFT
  SENT
  VIEWED
  CLIENT_APPROVED
  CLIENT_DECLINED
  APPROVED
  DECLINED
  CONVERTED
  EXPIRED
  CANCELLED
}

enum EstimateTaxType {
  NONE
  SALES_TAX
  VAT
  GST
  CUSTOM
}

enum EstimateTermType {
  PAYMENT
  DELIVERY
  WARRANTY
  CANCELLATION
  SCOPE
  LIABILITY
  COMPLIANCE
}

enum BidInvitationStatus {
  SENT
  VIEWED
  RESPONDED
  EXPIRED
  CANCELLED
}

enum BidStatus {
  DRAFT
  OPEN
  CLOSED
  AWARDED
  CANCELLED
}

enum BidSubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
  WITHDRAWN
  EXPIRED
}

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

enum TaxCalculationMethod {
  PERCENTAGE
  FIXED_AMOUNT
  GRADUATED
  COMPOUND
}

enum TaxJurisdictionStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  MERGED
  SPLIT
}

enum TaxJurisdictionType {
  COUNTRY
  STATE
  PROVINCE
  COUNTY
  CITY
  MUNICIPALITY
  DISTRICT
  ZONE
  OTHER
}

enum TaxRateStatus {
  ACTIVE
  INACTIVE
  SCHEDULED
  EXPIRED
  SUSPENDED
}

enum TaxRateType {
  SALES_TAX
  VAT
  GST
  EXCISE
  CUSTOMS
  WITHHOLDING
  PAYROLL
  PROPERTY
  MUNICIPAL
  OTHER
}

enum TaxType {
  FEDERAL_INCOME
  STATE_INCOME
  LOCAL_INCOME
  SOCIAL_SECURITY
  MEDICARE
  STATE_UNEMPLOYMENT
  STATE_DISABILITY
  CITY_TAX
  COUNTY_TAX
}
