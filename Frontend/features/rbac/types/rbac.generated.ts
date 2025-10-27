/**
 * RBAC Generated Types
 * 
 * This file is auto-generated from RBAC.schema.v7.yml
 * DO NOT EDIT MANUALLY - Run 'npm run generate:rbac' to regenerate
 * 
 * Generated: 2025-10-13T00:33:43.765Z
 * Schema Version: 7
 * Roles: 5
 * Permissions: 1652
 * Domains: 19
 */

import React from 'react';


/**
 * Role Types
 * Generated from RBAC.schema.v7.yml
 */
export type RoleCode = 
  | 'ADMIN'
  | 'PROJECT_MANAGER'
  | 'WORKER'
  | 'VIEWER'
  | 'DRIVER';

export interface Role {
  code: RoleCode;
  name: string;
  description: string;
  scope: 'TENANT' | 'SYSTEM';
}

export const ROLES: Record<RoleCode, Role> = {
  'ADMIN': {
    code: 'ADMIN',
    name: 'Tenant Administrator',
    description: 'Tenant owner with full administrative control over tenant-scoped resources',
    scope: 'TENANT',
  },
  'PROJECT_MANAGER': {
    code: 'PROJECT_MANAGER',
    name: 'Project Manager',
    description: 'Project and team management with conditional permissions via tenant settings',
    scope: 'TENANT',
  },
  'WORKER': {
    code: 'WORKER',
    name: 'Worker',
    description: 'Field worker with task execution and limited project access',
    scope: 'TENANT',
  },
  'VIEWER': {
    code: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access for observers and stakeholders',
    scope: 'TENANT',
  },
  'DRIVER': {
    code: 'DRIVER',
    name: 'Driver',
    description: 'Delivery/transport worker with minimal project access',
    scope: 'TENANT',
  }
} as const;


/**
 * Permission Types
 * Generated from RBAC.schema.v7.yml
 */
export type Permission = 
  | 'AIAction.activate'
  | 'AIAction.create'
  | 'AIAction.deactivate'
  | 'AIAction.read'
  | 'AIAction.restore'
  | 'AIAction.soft_delete'
  | 'AIAction.update'
  | 'AIActionRun.create'
  | 'AIActionRun.read'
  | 'AIActionRun.restore'
  | 'AIActionRun.soft_delete'
  | 'AIActionRun.update'
  | 'AIAssistantProfile.activate'
  | 'AIAssistantProfile.create'
  | 'AIAssistantProfile.deactivate'
  | 'AIAssistantProfile.read'
  | 'AIAssistantProfile.restore'
  | 'AIAssistantProfile.soft_delete'
  | 'AIAssistantProfile.update'
  | 'AIDocumentChunk.create'
  | 'AIDocumentChunk.read'
  | 'AIDocumentChunk.restore'
  | 'AIDocumentChunk.soft_delete'
  | 'AIDocumentChunk.update'
  | 'AIDocumentIndex.create'
  | 'AIDocumentIndex.read'
  | 'AIDocumentIndex.restore'
  | 'AIDocumentIndex.soft_delete'
  | 'AIDocumentIndex.update'
  | 'AIEmbedding.create'
  | 'AIEmbedding.read'
  | 'AIEmbedding.restore'
  | 'AIEmbedding.soft_delete'
  | 'AIEmbedding.update'
  | 'AIInsight.create'
  | 'AIInsight.read'
  | 'AIInsight.restore'
  | 'AIInsight.soft_delete'
  | 'AIInsight.update'
  | 'AIInsightFeedback.create'
  | 'AIInsightFeedback.read'
  | 'AIInsightFeedback.restore'
  | 'AIInsightFeedback.soft_delete'
  | 'AIInsightFeedback.update'
  | 'AIJob.create'
  | 'AIJob.read'
  | 'AIJob.restore'
  | 'AIJob.soft_delete'
  | 'AIJob.update'
  | 'AIJobArtifact.create'
  | 'AIJobArtifact.read'
  | 'AIJobArtifact.restore'
  | 'AIJobArtifact.soft_delete'
  | 'AIJobArtifact.update'
  | 'AIPlaybook.activate'
  | 'AIPlaybook.create'
  | 'AIPlaybook.deactivate'
  | 'AIPlaybook.read'
  | 'AIPlaybook.restore'
  | 'AIPlaybook.soft_delete'
  | 'AIPlaybook.update'
  | 'AIPlaybookStep.create'
  | 'AIPlaybookStep.read'
  | 'AIPlaybookStep.restore'
  | 'AIPlaybookStep.soft_delete'
  | 'AIPlaybookStep.update'
  | 'AIPromptTemplate.create'
  | 'AIPromptTemplate.read'
  | 'AIPromptTemplate.restore'
  | 'AIPromptTemplate.soft_delete'
  | 'AIPromptTemplate.update'
  | 'APBill.approve'
  | 'APBill.create'
  | 'APBill.read'
  | 'APBill.reject'
  | 'APBill.restore'
  | 'APBill.soft_delete'
  | 'APBill.update'
  | 'APBillLine.create'
  | 'APBillLine.read'
  | 'APBillLine.restore'
  | 'APBillLine.soft_delete'
  | 'APBillLine.update'
  | 'AbsenceBalance.create'
  | 'AbsenceBalance.read'
  | 'AbsenceBalance.restore'
  | 'AbsenceBalance.soft_delete'
  | 'AbsenceBalance.update'
  | 'Account.activate'
  | 'Account.assign'
  | 'Account.create'
  | 'Account.deactivate'
  | 'Account.hard_delete'
  | 'Account.read'
  | 'Account.restore'
  | 'Account.soft_delete'
  | 'Account.unassign'
  | 'Account.update'
  | 'AccountAddress.create'
  | 'AccountAddress.hard_delete'
  | 'AccountAddress.read'
  | 'AccountAddress.restore'
  | 'AccountAddress.soft_delete'
  | 'AccountAddress.update'
  | 'Activity.create'
  | 'Activity.read'
  | 'Activity.restore'
  | 'Activity.soft_delete'
  | 'Activity.update'
  | 'ActivityAttachment.create'
  | 'ActivityAttachment.read'
  | 'ActivityAttachment.restore'
  | 'ActivityAttachment.soft_delete'
  | 'ActivityAttachment.update'
  | 'Allowance.approve'
  | 'Allowance.create'
  | 'Allowance.read'
  | 'Allowance.reject'
  | 'Allowance.restore'
  | 'Allowance.soft_delete'
  | 'Allowance.update'
  | 'AnomalyCase.create'
  | 'AnomalyCase.investigate'
  | 'AnomalyCase.read'
  | 'AnomalyCase.restore'
  | 'AnomalyCase.soft_delete'
  | 'AnomalyCase.update'
  | 'AnomalyCaseAction.create'
  | 'AnomalyCaseAction.execute'
  | 'AnomalyCaseAction.read'
  | 'AnomalyCaseAction.update'
  | 'AnomalySignal.create'
  | 'AnomalySignal.read'
  | 'AnomalySignal.update'
  | 'AnomalySignalFeature.create'
  | 'AnomalySignalFeature.read'
  | 'AnomalySignalFeature.update'
  | 'ApiKey.activate'
  | 'ApiKey.create'
  | 'ApiKey.deactivate'
  | 'ApiKey.read'
  | 'ApiKey.restore'
  | 'ApiKey.soft_delete'
  | 'ApiKey.update'
  | 'ApprovalDecision.create'
  | 'ApprovalDecision.read'
  | 'ApprovalDecision.restore'
  | 'ApprovalDecision.soft_delete'
  | 'ApprovalDecision.update'
  | 'ApprovalRequest.approve'
  | 'ApprovalRequest.create'
  | 'ApprovalRequest.read'
  | 'ApprovalRequest.reject'
  | 'ApprovalRequest.restore'
  | 'ApprovalRequest.soft_delete'
  | 'ApprovalRequest.submit'
  | 'ApprovalRequest.update'
  | 'ApprovalRule.activate'
  | 'ApprovalRule.create'
  | 'ApprovalRule.deactivate'
  | 'ApprovalRule.read'
  | 'ApprovalRule.restore'
  | 'ApprovalRule.soft_delete'
  | 'ApprovalRule.update'
  | 'Asset.activate'
  | 'Asset.assign'
  | 'Asset.create'
  | 'Asset.deactivate'
  | 'Asset.hard_delete'
  | 'Asset.read'
  | 'Asset.restore'
  | 'Asset.soft_delete'
  | 'Asset.transfer'
  | 'Asset.unassign'
  | 'Asset.update'
  | 'AssetAssignment.assign'
  | 'AssetAssignment.create'
  | 'AssetAssignment.read'
  | 'AssetAssignment.restore'
  | 'AssetAssignment.soft_delete'
  | 'AssetAssignment.transfer'
  | 'AssetAssignment.unassign'
  | 'AssetAssignment.update'
  | 'AssetDepreciation.create'
  | 'AssetDepreciation.read'
  | 'AssetDepreciation.restore'
  | 'AssetDepreciation.soft_delete'
  | 'AssetDepreciation.update'
  | 'AssetDocument.create'
  | 'AssetDocument.read'
  | 'AssetDocument.restore'
  | 'AssetDocument.soft_delete'
  | 'AssetDocument.update'
  | 'AssetMaintenance.create'
  | 'AssetMaintenance.read'
  | 'AssetMaintenance.restore'
  | 'AssetMaintenance.soft_delete'
  | 'AssetMaintenance.update'
  | 'AssetMeterReading.create'
  | 'AssetMeterReading.read'
  | 'AssetMeterReading.restore'
  | 'AssetMeterReading.soft_delete'
  | 'AssetMeterReading.update'
  | 'Attachment.approve'
  | 'Attachment.create'
  | 'Attachment.hard_delete'
  | 'Attachment.read'
  | 'Attachment.reject'
  | 'Attachment.restore'
  | 'Attachment.soft_delete'
  | 'Attachment.update'
  | 'AttachmentLink.create'
  | 'AttachmentLink.read'
  | 'AttachmentLink.restore'
  | 'AttachmentLink.soft_delete'
  | 'AttachmentLink.update'
  | 'AuthFactor.activate'
  | 'AuthFactor.create'
  | 'AuthFactor.deactivate'
  | 'AuthFactor.read'
  | 'AuthFactor.restore'
  | 'AuthFactor.soft_delete'
  | 'AuthFactor.update'
  | 'BankAccount.activate'
  | 'BankAccount.create'
  | 'BankAccount.deactivate'
  | 'BankAccount.read'
  | 'BankAccount.restore'
  | 'BankAccount.soft_delete'
  | 'BankAccount.update'
  | 'BankStatementLine.create'
  | 'BankStatementLine.read'
  | 'BankStatementLine.restore'
  | 'BankStatementLine.soft_delete'
  | 'BankStatementLine.update'
  | 'BenefitDependent.create'
  | 'BenefitDependent.read'
  | 'BenefitDependent.restore'
  | 'BenefitDependent.soft_delete'
  | 'BenefitDependent.update'
  | 'BenefitEnrollment.approve'
  | 'BenefitEnrollment.create'
  | 'BenefitEnrollment.read'
  | 'BenefitEnrollment.reject'
  | 'BenefitEnrollment.restore'
  | 'BenefitEnrollment.soft_delete'
  | 'BenefitEnrollment.update'
  | 'Bid.approve'
  | 'Bid.create'
  | 'Bid.read'
  | 'Bid.reject'
  | 'Bid.restore'
  | 'Bid.soft_delete'
  | 'Bid.submit'
  | 'Bid.update'
  | 'BidComparison.create'
  | 'BidComparison.read'
  | 'BidComparison.restore'
  | 'BidComparison.soft_delete'
  | 'BidComparison.update'
  | 'BidInvitation.create'
  | 'BidInvitation.read'
  | 'BidInvitation.restore'
  | 'BidInvitation.send'
  | 'BidInvitation.soft_delete'
  | 'BidInvitation.update'
  | 'BidSubmission.approve'
  | 'BidSubmission.create'
  | 'BidSubmission.read'
  | 'BidSubmission.reject'
  | 'BidSubmission.submit'
  | 'BidSubmission.update'
  | 'BillApproval.approve'
  | 'BillApproval.create'
  | 'BillApproval.read'
  | 'BillApproval.reject'
  | 'BillPayment.create'
  | 'BillPayment.read'
  | 'BillPayment.restore'
  | 'BillPayment.soft_delete'
  | 'BillPayment.update'
  | 'Certification.approve'
  | 'Certification.create'
  | 'Certification.read'
  | 'Certification.reject'
  | 'Certification.restore'
  | 'Certification.soft_delete'
  | 'Certification.update'
  | 'ChangeOrder.approve'
  | 'ChangeOrder.create'
  | 'ChangeOrder.read'
  | 'ChangeOrder.reject'
  | 'ChangeOrder.restore'
  | 'ChangeOrder.soft_delete'
  | 'ChangeOrder.update'
  | 'ChangeOrderApproval.approve'
  | 'ChangeOrderApproval.create'
  | 'ChangeOrderApproval.read'
  | 'ChangeOrderApproval.reject'
  | 'ChangeOrderDocument.create'
  | 'ChangeOrderDocument.read'
  | 'ChangeOrderDocument.restore'
  | 'ChangeOrderDocument.soft_delete'
  | 'ChangeOrderDocument.update'
  | 'ChangeOrderLine.create'
  | 'ChangeOrderLine.read'
  | 'ChangeOrderLine.restore'
  | 'ChangeOrderLine.soft_delete'
  | 'ChangeOrderLine.update'
  | 'Channel.activate'
  | 'Channel.archive'
  | 'Channel.create'
  | 'Channel.deactivate'
  | 'Channel.hard_delete'
  | 'Channel.read'
  | 'Channel.restore'
  | 'Channel.soft_delete'
  | 'Channel.update'
  | 'ChannelMember.assign'
  | 'ChannelMember.create'
  | 'ChannelMember.read'
  | 'ChannelMember.restore'
  | 'ChannelMember.soft_delete'
  | 'ChannelMember.unassign'
  | 'ChannelMember.update'
  | 'Chargeback.create'
  | 'Chargeback.read'
  | 'Chargeback.restore'
  | 'Chargeback.soft_delete'
  | 'Chargeback.update'
  | 'ChargebackEvidence.create'
  | 'ChargebackEvidence.read'
  | 'ChargebackEvidence.restore'
  | 'ChargebackEvidence.soft_delete'
  | 'ChargebackEvidence.update'
  | 'ClockInClockOut.approve'
  | 'ClockInClockOut.create'
  | 'ClockInClockOut.export'
  | 'ClockInClockOut.read'
  | 'ClockInClockOut.reject'
  | 'ClockInClockOut.restore'
  | 'ClockInClockOut.soft_delete'
  | 'ClockInClockOut.update'
  | 'CompensationComponent.activate'
  | 'CompensationComponent.create'
  | 'CompensationComponent.deactivate'
  | 'CompensationComponent.read'
  | 'CompensationComponent.restore'
  | 'CompensationComponent.soft_delete'
  | 'CompensationComponent.update'
  | 'CompensationPlan.activate'
  | 'CompensationPlan.create'
  | 'CompensationPlan.deactivate'
  | 'CompensationPlan.read'
  | 'CompensationPlan.restore'
  | 'CompensationPlan.soft_delete'
  | 'CompensationPlan.update'
  | 'Contact.create'
  | 'Contact.hard_delete'
  | 'Contact.read'
  | 'Contact.restore'
  | 'Contact.soft_delete'
  | 'Contact.update'
  | 'Contract.approve'
  | 'Contract.create'
  | 'Contract.read'
  | 'Contract.reject'
  | 'Contract.restore'
  | 'Contract.send'
  | 'Contract.soft_delete'
  | 'Contract.update'
  | 'ContractTemplate.create'
  | 'ContractTemplate.hard_delete'
  | 'ContractTemplate.read'
  | 'ContractTemplate.restore'
  | 'ContractTemplate.soft_delete'
  | 'ContractTemplate.update'
  | 'CostCategory.create'
  | 'CostCategory.read'
  | 'CostCategory.restore'
  | 'CostCategory.soft_delete'
  | 'CostCategory.update'
  | 'CostCenter.create'
  | 'CostCenter.read'
  | 'CostCenter.restore'
  | 'CostCenter.soft_delete'
  | 'CostCenter.update'
  | 'CostCode.create'
  | 'CostCode.read'
  | 'CostCode.restore'
  | 'CostCode.soft_delete'
  | 'CostCode.update'
  | 'Country.create'
  | 'Country.read'
  | 'Country.restore'
  | 'Country.soft_delete'
  | 'Country.update'
  | 'CreditMemo.create'
  | 'CreditMemo.read'
  | 'CreditMemo.restore'
  | 'CreditMemo.soft_delete'
  | 'CreditMemo.update'
  | 'CreditMemoLine.create'
  | 'CreditMemoLine.read'
  | 'CreditMemoLine.restore'
  | 'CreditMemoLine.soft_delete'
  | 'CreditMemoLine.update'
  | 'CurrencyRate.create'
  | 'CurrencyRate.read'
  | 'CurrencyRate.update'
  | 'DailyLog.create'
  | 'DailyLog.read'
  | 'DailyLog.restore'
  | 'DailyLog.soft_delete'
  | 'DailyLog.update'
  | 'DashboardDefinition.create'
  | 'DashboardDefinition.read'
  | 'DashboardDefinition.restore'
  | 'DashboardDefinition.soft_delete'
  | 'DashboardDefinition.update'
  | 'DataRetentionPolicy.activate'
  | 'DataRetentionPolicy.create'
  | 'DataRetentionPolicy.deactivate'
  | 'DataRetentionPolicy.read'
  | 'DataRetentionPolicy.restore'
  | 'DataRetentionPolicy.soft_delete'
  | 'DataRetentionPolicy.update'
  | 'Deduction.approve'
  | 'Deduction.create'
  | 'Deduction.read'
  | 'Deduction.reject'
  | 'Deduction.restore'
  | 'Deduction.soft_delete'
  | 'Deduction.update'
  | 'Department.activate'
  | 'Department.create'
  | 'Department.deactivate'
  | 'Department.read'
  | 'Department.restore'
  | 'Department.soft_delete'
  | 'Department.update'
  | 'DirectChat.archive'
  | 'DirectChat.create'
  | 'DirectChat.hard_delete'
  | 'DirectChat.read'
  | 'DirectChat.restore'
  | 'DirectChat.soft_delete'
  | 'DirectChat.update'
  | 'DirectMessage.create'
  | 'DirectMessage.read'
  | 'DirectMessage.restore'
  | 'DirectMessage.soft_delete'
  | 'DirectMessage.update'
  | 'DirectMessageRead.create'
  | 'DirectMessageRead.read'
  | 'DirectMessageRead.update'
  | 'DistributedLock.create'
  | 'DistributedLock.read'
  | 'DistributedLock.update'
  | 'DocumentGroup.create'
  | 'DocumentGroup.read'
  | 'DocumentGroup.restore'
  | 'DocumentGroup.soft_delete'
  | 'DocumentGroup.update'
  | 'DunningNotice.create'
  | 'DunningNotice.read'
  | 'DunningNotice.send'
  | 'DunningNotice.update'
  | 'ESignatureEnvelope.create'
  | 'ESignatureEnvelope.read'
  | 'ESignatureEnvelope.restore'
  | 'ESignatureEnvelope.send'
  | 'ESignatureEnvelope.soft_delete'
  | 'ESignatureEnvelope.update'
  | 'ESignatureRecipient.create'
  | 'ESignatureRecipient.read'
  | 'ESignatureRecipient.restore'
  | 'ESignatureRecipient.soft_delete'
  | 'ESignatureRecipient.update'
  | 'EmailTemplate.create'
  | 'EmailTemplate.read'
  | 'EmailTemplate.restore'
  | 'EmailTemplate.soft_delete'
  | 'EmailTemplate.update'
  | 'Employment.activate'
  | 'Employment.create'
  | 'Employment.deactivate'
  | 'Employment.read'
  | 'Employment.restore'
  | 'Employment.soft_delete'
  | 'Employment.update'
  | 'ErrorReport.create'
  | 'ErrorReport.read'
  | 'ErrorReport.restore'
  | 'ErrorReport.soft_delete'
  | 'ErrorReport.update'
  | 'Estimate.approve'
  | 'Estimate.create'
  | 'Estimate.hard_delete'
  | 'Estimate.read'
  | 'Estimate.reject'
  | 'Estimate.restore'
  | 'Estimate.send'
  | 'Estimate.soft_delete'
  | 'Estimate.update'
  | 'EstimateApproval.approve'
  | 'EstimateApproval.create'
  | 'EstimateApproval.read'
  | 'EstimateApproval.reject'
  | 'EstimateAttachment.create'
  | 'EstimateAttachment.read'
  | 'EstimateAttachment.restore'
  | 'EstimateAttachment.soft_delete'
  | 'EstimateAttachment.update'
  | 'EstimateComment.create'
  | 'EstimateComment.read'
  | 'EstimateComment.restore'
  | 'EstimateComment.soft_delete'
  | 'EstimateComment.update'
  | 'EstimateDiscount.create'
  | 'EstimateDiscount.read'
  | 'EstimateDiscount.restore'
  | 'EstimateDiscount.soft_delete'
  | 'EstimateDiscount.update'
  | 'EstimateHistoryEvent.create'
  | 'EstimateHistoryEvent.read'
  | 'EstimateLineItem.create'
  | 'EstimateLineItem.read'
  | 'EstimateLineItem.restore'
  | 'EstimateLineItem.soft_delete'
  | 'EstimateLineItem.update'
  | 'EstimateRevision.create'
  | 'EstimateRevision.read'
  | 'EstimateRevision.restore'
  | 'EstimateRevision.soft_delete'
  | 'EstimateRevision.update'
  | 'EstimateTax.create'
  | 'EstimateTax.read'
  | 'EstimateTax.restore'
  | 'EstimateTax.soft_delete'
  | 'EstimateTax.update'
  | 'EstimateTerm.create'
  | 'EstimateTerm.read'
  | 'EstimateTerm.restore'
  | 'EstimateTerm.soft_delete'
  | 'EstimateTerm.update'
  | 'Expense.approve'
  | 'Expense.create'
  | 'Expense.export'
  | 'Expense.hard_delete'
  | 'Expense.read'
  | 'Expense.reject'
  | 'Expense.restore'
  | 'Expense.soft_delete'
  | 'Expense.update'
  | 'ExpenseApproval.approve'
  | 'ExpenseApproval.create'
  | 'ExpenseApproval.read'
  | 'ExpenseApproval.reject'
  | 'ExpenseLine.create'
  | 'ExpenseLine.read'
  | 'ExpenseLine.restore'
  | 'ExpenseLine.soft_delete'
  | 'ExpenseLine.update'
  | 'ExpenseReceipt.approve'
  | 'ExpenseReceipt.create'
  | 'ExpenseReceipt.read'
  | 'ExpenseReceipt.reject'
  | 'ExpenseReceipt.restore'
  | 'ExpenseReceipt.soft_delete'
  | 'ExpenseReceipt.update'
  | 'ExpenseReport.approve'
  | 'ExpenseReport.create'
  | 'ExpenseReport.read'
  | 'ExpenseReport.reject'
  | 'ExpenseReport.restore'
  | 'ExpenseReport.soft_delete'
  | 'ExpenseReport.submit'
  | 'ExpenseReport.update'
  | 'ExportArtifact.create'
  | 'ExportArtifact.read'
  | 'ExportArtifact.restore'
  | 'ExportArtifact.soft_delete'
  | 'ExportArtifact.update'
  | 'ExportJob.create'
  | 'ExportJob.read'
  | 'ExportJob.restore'
  | 'ExportJob.soft_delete'
  | 'ExportJob.update'
  | 'FileObject.create'
  | 'FileObject.hard_delete'
  | 'FileObject.read'
  | 'FileObject.restore'
  | 'FileObject.soft_delete'
  | 'FileObject.update'
  | 'ForecastLine.create'
  | 'ForecastLine.read'
  | 'ForecastLine.restore'
  | 'ForecastLine.soft_delete'
  | 'ForecastLine.update'
  | 'ForecastSnapshot.create'
  | 'ForecastSnapshot.export'
  | 'ForecastSnapshot.read'
  | 'FraudPolicy.activate'
  | 'FraudPolicy.create'
  | 'FraudPolicy.deactivate'
  | 'FraudPolicy.read'
  | 'FraudPolicy.restore'
  | 'FraudPolicy.soft_delete'
  | 'FraudPolicy.update'
  | 'FraudPolicyRule.create'
  | 'FraudPolicyRule.read'
  | 'FraudPolicyRule.restore'
  | 'FraudPolicyRule.soft_delete'
  | 'FraudPolicyRule.update'
  | 'FraudPolicyScope.create'
  | 'FraudPolicyScope.read'
  | 'FraudPolicyScope.restore'
  | 'FraudPolicyScope.soft_delete'
  | 'FraudPolicyScope.update'
  | 'GLAccount.activate'
  | 'GLAccount.create'
  | 'GLAccount.deactivate'
  | 'GLAccount.read'
  | 'GLAccount.restore'
  | 'GLAccount.soft_delete'
  | 'GLAccount.update'
  | 'GoodsReceipt.create'
  | 'GoodsReceipt.read'
  | 'GoodsReceipt.restore'
  | 'GoodsReceipt.soft_delete'
  | 'GoodsReceipt.update'
  | 'GoodsReceiptLine.create'
  | 'GoodsReceiptLine.read'
  | 'GoodsReceiptLine.restore'
  | 'GoodsReceiptLine.soft_delete'
  | 'GoodsReceiptLine.update'
  | 'Grade.create'
  | 'Grade.read'
  | 'Grade.restore'
  | 'Grade.soft_delete'
  | 'Grade.update'
  | 'HolidayCalendar.create'
  | 'HolidayCalendar.read'
  | 'HolidayCalendar.restore'
  | 'HolidayCalendar.soft_delete'
  | 'HolidayCalendar.update'
  | 'InAppAnnouncement.create'
  | 'InAppAnnouncement.publish'
  | 'InAppAnnouncement.read'
  | 'InAppAnnouncement.restore'
  | 'InAppAnnouncement.soft_delete'
  | 'InAppAnnouncement.update'
  | 'Inspection.create'
  | 'Inspection.read'
  | 'Inspection.restore'
  | 'Inspection.soft_delete'
  | 'Inspection.update'
  | 'InspectionApproval.approve'
  | 'InspectionApproval.create'
  | 'InspectionApproval.read'
  | 'InspectionApproval.reject'
  | 'InspectionItem.create'
  | 'InspectionItem.read'
  | 'InspectionItem.restore'
  | 'InspectionItem.soft_delete'
  | 'InspectionItem.update'
  | 'IntegrationConnection.activate'
  | 'IntegrationConnection.create'
  | 'IntegrationConnection.deactivate'
  | 'IntegrationConnection.read'
  | 'IntegrationConnection.restore'
  | 'IntegrationConnection.soft_delete'
  | 'IntegrationConnection.update'
  | 'IntegrationConnector.create'
  | 'IntegrationConnector.read'
  | 'IntegrationConnector.restore'
  | 'IntegrationConnector.soft_delete'
  | 'IntegrationConnector.update'
  | 'IntegrationMapping.create'
  | 'IntegrationMapping.read'
  | 'IntegrationMapping.restore'
  | 'IntegrationMapping.soft_delete'
  | 'IntegrationMapping.update'
  | 'IntegrationProvider.create'
  | 'IntegrationProvider.read'
  | 'IntegrationProvider.restore'
  | 'IntegrationProvider.soft_delete'
  | 'IntegrationProvider.update'
  | 'IntegrationSecret.create'
  | 'IntegrationSecret.read'
  | 'IntegrationSecret.restore'
  | 'IntegrationSecret.soft_delete'
  | 'IntegrationSecret.update'
  | 'InventoryAdjustment.approve'
  | 'InventoryAdjustment.create'
  | 'InventoryAdjustment.read'
  | 'InventoryAdjustment.reject'
  | 'InventoryAdjustment.restore'
  | 'InventoryAdjustment.soft_delete'
  | 'InventoryAdjustment.update'
  | 'InventoryAttachment.create'
  | 'InventoryAttachment.read'
  | 'InventoryAttachment.restore'
  | 'InventoryAttachment.soft_delete'
  | 'InventoryAttachment.update'
  | 'InventoryBin.create'
  | 'InventoryBin.read'
  | 'InventoryBin.restore'
  | 'InventoryBin.soft_delete'
  | 'InventoryBin.update'
  | 'InventoryCount.create'
  | 'InventoryCount.read'
  | 'InventoryCount.restore'
  | 'InventoryCount.soft_delete'
  | 'InventoryCount.update'
  | 'InventoryCountLine.create'
  | 'InventoryCountLine.read'
  | 'InventoryCountLine.restore'
  | 'InventoryCountLine.soft_delete'
  | 'InventoryCountLine.update'
  | 'InventoryItem.activate'
  | 'InventoryItem.assign'
  | 'InventoryItem.create'
  | 'InventoryItem.deactivate'
  | 'InventoryItem.hard_delete'
  | 'InventoryItem.read'
  | 'InventoryItem.restore'
  | 'InventoryItem.soft_delete'
  | 'InventoryItem.transfer'
  | 'InventoryItem.unassign'
  | 'InventoryItem.update'
  | 'InventoryLocation.create'
  | 'InventoryLocation.read'
  | 'InventoryLocation.restore'
  | 'InventoryLocation.soft_delete'
  | 'InventoryLocation.update'
  | 'InventoryReservation.create'
  | 'InventoryReservation.read'
  | 'InventoryReservation.restore'
  | 'InventoryReservation.soft_delete'
  | 'InventoryReservation.update'
  | 'InventoryTransaction.create'
  | 'InventoryTransaction.read'
  | 'InventoryTransaction.restore'
  | 'InventoryTransaction.soft_delete'
  | 'InventoryTransaction.update'
  | 'Invoice.approve'
  | 'Invoice.create'
  | 'Invoice.duplicate'
  | 'Invoice.export'
  | 'Invoice.hard_delete'
  | 'Invoice.read'
  | 'Invoice.reject'
  | 'Invoice.restore'
  | 'Invoice.send'
  | 'Invoice.soft_delete'
  | 'Invoice.update'
  | 'InvoiceAttachment.create'
  | 'InvoiceAttachment.read'
  | 'InvoiceAttachment.restore'
  | 'InvoiceAttachment.soft_delete'
  | 'InvoiceAttachment.update'
  | 'InvoiceLineItem.create'
  | 'InvoiceLineItem.read'
  | 'InvoiceLineItem.restore'
  | 'InvoiceLineItem.soft_delete'
  | 'InvoiceLineItem.update'
  | 'InvoicePayment.create'
  | 'InvoicePayment.read'
  | 'InvoicePayment.restore'
  | 'InvoicePayment.soft_delete'
  | 'InvoicePayment.update'
  | 'InvoiceTax.create'
  | 'InvoiceTax.read'
  | 'InvoiceTax.restore'
  | 'InvoiceTax.soft_delete'
  | 'InvoiceTax.update'
  | 'JobFamily.create'
  | 'JobFamily.read'
  | 'JobFamily.restore'
  | 'JobFamily.soft_delete'
  | 'JobFamily.update'
  | 'JobProfile.create'
  | 'JobProfile.read'
  | 'JobProfile.restore'
  | 'JobProfile.soft_delete'
  | 'JobProfile.update'
  | 'JobProfileAssignment.assign'
  | 'JobProfileAssignment.create'
  | 'JobProfileAssignment.read'
  | 'JobProfileAssignment.unassign'
  | 'JobProfileAssignment.update'
  | 'JobRun.create'
  | 'JobRun.read'
  | 'JobRun.restore'
  | 'JobRun.soft_delete'
  | 'JobRun.update'
  | 'JobSchedule.activate'
  | 'JobSchedule.create'
  | 'JobSchedule.deactivate'
  | 'JobSchedule.read'
  | 'JobSchedule.update'
  | 'JournalEntry.create'
  | 'JournalEntry.read'
  | 'JournalEntry.restore'
  | 'JournalEntry.soft_delete'
  | 'JournalEntry.update'
  | 'JournalLine.create'
  | 'JournalLine.read'
  | 'JournalLine.restore'
  | 'JournalLine.soft_delete'
  | 'JournalLine.update'
  | 'Lead.assign'
  | 'Lead.create'
  | 'Lead.hard_delete'
  | 'Lead.read'
  | 'Lead.restore'
  | 'Lead.soft_delete'
  | 'Lead.transfer'
  | 'Lead.unassign'
  | 'Lead.update'
  | 'LeadActivity.create'
  | 'LeadActivity.read'
  | 'LeadActivity.restore'
  | 'LeadActivity.soft_delete'
  | 'LeadActivity.update'
  | 'Leave.approve'
  | 'Leave.create'
  | 'Leave.read'
  | 'Leave.reject'
  | 'Leave.restore'
  | 'Leave.soft_delete'
  | 'Leave.update'
  | 'LeaveOfAbsence.approve'
  | 'LeaveOfAbsence.create'
  | 'LeaveOfAbsence.read'
  | 'LeaveOfAbsence.reject'
  | 'LeaveOfAbsence.restore'
  | 'LeaveOfAbsence.soft_delete'
  | 'LeaveOfAbsence.update'
  | 'Location.create'
  | 'Location.read'
  | 'Location.restore'
  | 'Location.soft_delete'
  | 'Location.update'
  | 'LossInvestigation.create'
  | 'LossInvestigation.read'
  | 'LossInvestigation.restore'
  | 'LossInvestigation.soft_delete'
  | 'LossInvestigation.update'
  | 'LossInvestigationFinding.create'
  | 'LossInvestigationFinding.read'
  | 'LossInvestigationFinding.restore'
  | 'LossInvestigationFinding.soft_delete'
  | 'LossInvestigationFinding.update'
  | 'Member.activate'
  | 'Member.assign'
  | 'Member.create'
  | 'Member.deactivate'
  | 'Member.read'
  | 'Member.restore'
  | 'Member.soft_delete'
  | 'Member.transfer'
  | 'Member.unassign'
  | 'Member.update'
  | 'MemberDocument.approve'
  | 'MemberDocument.create'
  | 'MemberDocument.read'
  | 'MemberDocument.reject'
  | 'MemberDocument.restore'
  | 'MemberDocument.soft_delete'
  | 'MemberDocument.update'
  | 'MemberRole.assign'
  | 'MemberRole.create'
  | 'MemberRole.read'
  | 'MemberRole.restore'
  | 'MemberRole.soft_delete'
  | 'MemberRole.transfer'
  | 'MemberRole.unassign'
  | 'MemberRole.update'
  | 'MemberSettings.activate'
  | 'MemberSettings.deactivate'
  | 'MemberSettings.read'
  | 'MemberSettings.update'
  | 'Message.create'
  | 'Message.read'
  | 'Message.restore'
  | 'Message.soft_delete'
  | 'Message.update'
  | 'MessageAttachment.create'
  | 'MessageAttachment.read'
  | 'MessageAttachment.restore'
  | 'MessageAttachment.soft_delete'
  | 'MessageAttachment.update'
  | 'MessageRead.create'
  | 'MessageRead.read'
  | 'MessageRead.update'
  | 'Milestone.create'
  | 'Milestone.read'
  | 'Milestone.restore'
  | 'Milestone.soft_delete'
  | 'Milestone.update'
  | 'MilestoneDependency.create'
  | 'MilestoneDependency.read'
  | 'MilestoneDependency.restore'
  | 'MilestoneDependency.soft_delete'
  | 'MilestoneDependency.update'
  | 'MilestoneStakeholder.create'
  | 'MilestoneStakeholder.read'
  | 'MilestoneStakeholder.restore'
  | 'MilestoneStakeholder.soft_delete'
  | 'MilestoneStakeholder.update'
  | 'MitigationAction.create'
  | 'MitigationAction.implement'
  | 'MitigationAction.read'
  | 'MitigationAction.restore'
  | 'MitigationAction.soft_delete'
  | 'MitigationAction.update'
  | 'Notification.create'
  | 'Notification.read'
  | 'Notification.restore'
  | 'Notification.soft_delete'
  | 'Notification.update'
  | 'NotificationPreference.create'
  | 'NotificationPreference.read'
  | 'NotificationPreference.restore'
  | 'NotificationPreference.soft_delete'
  | 'NotificationPreference.update'
  | 'NotificationTemplate.create'
  | 'NotificationTemplate.read'
  | 'NotificationTemplate.restore'
  | 'NotificationTemplate.soft_delete'
  | 'NotificationTemplate.update'
  | 'NumberSequence.create'
  | 'NumberSequence.read'
  | 'NumberSequence.update'
  | 'Opportunity.assign'
  | 'Opportunity.create'
  | 'Opportunity.hard_delete'
  | 'Opportunity.read'
  | 'Opportunity.restore'
  | 'Opportunity.soft_delete'
  | 'Opportunity.transfer'
  | 'Opportunity.unassign'
  | 'Opportunity.update'
  | 'OpportunityLineItem.create'
  | 'OpportunityLineItem.read'
  | 'OpportunityLineItem.restore'
  | 'OpportunityLineItem.soft_delete'
  | 'OpportunityLineItem.update'
  | 'OpportunityStage.create'
  | 'OpportunityStage.read'
  | 'OpportunityStage.restore'
  | 'OpportunityStage.soft_delete'
  | 'OpportunityStage.update'
  | 'OrgUnit.activate'
  | 'OrgUnit.create'
  | 'OrgUnit.deactivate'
  | 'OrgUnit.read'
  | 'OrgUnit.restore'
  | 'OrgUnit.soft_delete'
  | 'OrgUnit.update'
  | 'OvertimeRule.activate'
  | 'OvertimeRule.create'
  | 'OvertimeRule.deactivate'
  | 'OvertimeRule.read'
  | 'OvertimeRule.restore'
  | 'OvertimeRule.soft_delete'
  | 'OvertimeRule.update'
  | 'PayCalendar.create'
  | 'PayCalendar.read'
  | 'PayCalendar.restore'
  | 'PayCalendar.soft_delete'
  | 'PayCalendar.update'
  | 'PayGroup.create'
  | 'PayGroup.read'
  | 'PayGroup.restore'
  | 'PayGroup.soft_delete'
  | 'PayGroup.update'
  | 'PayGroupAssignment.assign'
  | 'PayGroupAssignment.create'
  | 'PayGroupAssignment.read'
  | 'PayGroupAssignment.unassign'
  | 'PayGroupAssignment.update'
  | 'PayStatement.read'
  | 'Payment.create'
  | 'Payment.export'
  | 'Payment.read'
  | 'Payment.restore'
  | 'Payment.soft_delete'
  | 'Payment.update'
  | 'PaymentApplication.create'
  | 'PaymentApplication.read'
  | 'PaymentApplication.restore'
  | 'PaymentApplication.soft_delete'
  | 'PaymentApplication.update'
  | 'PaymentGateway.activate'
  | 'PaymentGateway.create'
  | 'PaymentGateway.deactivate'
  | 'PaymentGateway.read'
  | 'PaymentGateway.restore'
  | 'PaymentGateway.soft_delete'
  | 'PaymentGateway.update'
  | 'PaymentMethod.create'
  | 'PaymentMethod.read'
  | 'PaymentMethod.restore'
  | 'PaymentMethod.soft_delete'
  | 'PaymentMethod.update'
  | 'PaymentMethodToken.create'
  | 'PaymentMethodToken.read'
  | 'PaymentMethodToken.restore'
  | 'PaymentMethodToken.soft_delete'
  | 'PaymentMethodToken.update'
  | 'PaymentSchedule.create'
  | 'PaymentSchedule.read'
  | 'PaymentSchedule.restore'
  | 'PaymentSchedule.soft_delete'
  | 'PaymentSchedule.update'
  | 'PaymentTerm.create'
  | 'PaymentTerm.read'
  | 'PaymentTerm.restore'
  | 'PaymentTerm.soft_delete'
  | 'PaymentTerm.update'
  | 'Payout.create'
  | 'Payout.read'
  | 'Payout.restore'
  | 'Payout.soft_delete'
  | 'Payout.update'
  | 'PayrollAdjustment.create'
  | 'PayrollAdjustment.read'
  | 'PayrollAdjustment.restore'
  | 'PayrollAdjustment.soft_delete'
  | 'PayrollAdjustment.update'
  | 'PayrollItem.create'
  | 'PayrollItem.read'
  | 'PayrollItem.restore'
  | 'PayrollItem.soft_delete'
  | 'PayrollItem.update'
  | 'PayrollPayment.create'
  | 'PayrollPayment.read'
  | 'PayrollPayment.restore'
  | 'PayrollPayment.soft_delete'
  | 'PayrollPayment.update'
  | 'PayrollRun.approve'
  | 'PayrollRun.create'
  | 'PayrollRun.read'
  | 'PayrollRun.reject'
  | 'PayrollRun.restore'
  | 'PayrollRun.soft_delete'
  | 'PayrollRun.submit'
  | 'PayrollRun.update'
  | 'PayrollTax.create'
  | 'PayrollTax.read'
  | 'PayrollTax.restore'
  | 'PayrollTax.soft_delete'
  | 'PayrollTax.update'
  | 'PerformanceGoal.create'
  | 'PerformanceGoal.read'
  | 'PerformanceGoal.restore'
  | 'PerformanceGoal.soft_delete'
  | 'PerformanceGoal.update'
  | 'PerformanceReview.approve'
  | 'PerformanceReview.create'
  | 'PerformanceReview.read'
  | 'PerformanceReview.reject'
  | 'PerformanceReview.restore'
  | 'PerformanceReview.soft_delete'
  | 'PerformanceReview.update'
  | 'Permission.read'
  | 'Person.create'
  | 'Person.read'
  | 'Person.restore'
  | 'Person.soft_delete'
  | 'Person.update'
  | 'PersonAddress.create'
  | 'PersonAddress.read'
  | 'PersonAddress.restore'
  | 'PersonAddress.soft_delete'
  | 'PersonAddress.update'
  | 'PersonContactMethod.create'
  | 'PersonContactMethod.read'
  | 'PersonContactMethod.restore'
  | 'PersonContactMethod.soft_delete'
  | 'PersonContactMethod.update'
  | 'PersonDocument.create'
  | 'PersonDocument.read'
  | 'PersonDocument.restore'
  | 'PersonDocument.soft_delete'
  | 'PersonDocument.update'
  | 'PersonName.create'
  | 'PersonName.read'
  | 'PersonName.restore'
  | 'PersonName.soft_delete'
  | 'PersonName.update'
  | 'Position.activate'
  | 'Position.create'
  | 'Position.deactivate'
  | 'Position.read'
  | 'Position.restore'
  | 'Position.soft_delete'
  | 'Position.update'
  | 'PositionAssignment.assign'
  | 'PositionAssignment.create'
  | 'PositionAssignment.read'
  | 'PositionAssignment.restore'
  | 'PositionAssignment.soft_delete'
  | 'PositionAssignment.unassign'
  | 'PositionAssignment.update'
  | 'PositionBudget.create'
  | 'PositionBudget.read'
  | 'PositionBudget.restore'
  | 'PositionBudget.soft_delete'
  | 'PositionBudget.update'
  | 'PriceList.activate'
  | 'PriceList.create'
  | 'PriceList.deactivate'
  | 'PriceList.read'
  | 'PriceList.restore'
  | 'PriceList.soft_delete'
  | 'PriceList.update'
  | 'PriceListItem.create'
  | 'PriceListItem.read'
  | 'PriceListItem.restore'
  | 'PriceListItem.soft_delete'
  | 'PriceListItem.update'
  | 'Project.activate'
  | 'Project.archive'
  | 'Project.assign'
  | 'Project.create'
  | 'Project.deactivate'
  | 'Project.duplicate'
  | 'Project.hard_delete'
  | 'Project.read'
  | 'Project.restore'
  | 'Project.soft_delete'
  | 'Project.transfer'
  | 'Project.unassign'
  | 'Project.update'
  | 'ProjectBudgetLine.create'
  | 'ProjectBudgetLine.read'
  | 'ProjectBudgetLine.restore'
  | 'ProjectBudgetLine.soft_delete'
  | 'ProjectBudgetLine.update'
  | 'ProjectDocument.create'
  | 'ProjectDocument.read'
  | 'ProjectDocument.restore'
  | 'ProjectDocument.soft_delete'
  | 'ProjectDocument.update'
  | 'ProjectExternalAccess.create'
  | 'ProjectExternalAccess.grant'
  | 'ProjectExternalAccess.read'
  | 'ProjectExternalAccess.restore'
  | 'ProjectExternalAccess.revoke'
  | 'ProjectExternalAccess.soft_delete'
  | 'ProjectExternalAccess.update'
  | 'ProjectFinancialSnapshot.create'
  | 'ProjectFinancialSnapshot.export'
  | 'ProjectFinancialSnapshot.read'
  | 'ProjectInventoryTransaction.create'
  | 'ProjectInventoryTransaction.read'
  | 'ProjectInventoryTransaction.restore'
  | 'ProjectInventoryTransaction.soft_delete'
  | 'ProjectInventoryTransaction.update'
  | 'ProjectIssue.assign'
  | 'ProjectIssue.create'
  | 'ProjectIssue.read'
  | 'ProjectIssue.resolve'
  | 'ProjectIssue.restore'
  | 'ProjectIssue.soft_delete'
  | 'ProjectIssue.update'
  | 'ProjectLedgerEntry.create'
  | 'ProjectLedgerEntry.read'
  | 'ProjectLedgerEntry.restore'
  | 'ProjectLedgerEntry.soft_delete'
  | 'ProjectLedgerEntry.update'
  | 'ProjectLocation.create'
  | 'ProjectLocation.read'
  | 'ProjectLocation.restore'
  | 'ProjectLocation.soft_delete'
  | 'ProjectLocation.update'
  | 'ProjectMember.assign'
  | 'ProjectMember.create'
  | 'ProjectMember.read'
  | 'ProjectMember.restore'
  | 'ProjectMember.soft_delete'
  | 'ProjectMember.transfer'
  | 'ProjectMember.unassign'
  | 'ProjectMember.update'
  | 'ProjectNote.create'
  | 'ProjectNote.read'
  | 'ProjectNote.restore'
  | 'ProjectNote.soft_delete'
  | 'ProjectNote.update'
  | 'ProjectPhase.activate'
  | 'ProjectPhase.create'
  | 'ProjectPhase.deactivate'
  | 'ProjectPhase.read'
  | 'ProjectPhase.restore'
  | 'ProjectPhase.soft_delete'
  | 'ProjectPhase.update'
  | 'ProjectReport.create'
  | 'ProjectReport.export'
  | 'ProjectReport.read'
  | 'ProjectReport.restore'
  | 'ProjectReport.soft_delete'
  | 'ProjectReport.update'
  | 'ProjectRisk.assess'
  | 'ProjectRisk.create'
  | 'ProjectRisk.mitigate'
  | 'ProjectRisk.read'
  | 'ProjectRisk.restore'
  | 'ProjectRisk.soft_delete'
  | 'ProjectRisk.update'
  | 'ProjectTask.assign'
  | 'ProjectTask.create'
  | 'ProjectTask.read'
  | 'ProjectTask.restore'
  | 'ProjectTask.soft_delete'
  | 'ProjectTask.transfer'
  | 'ProjectTask.unassign'
  | 'ProjectTask.update'
  | 'ProjectTaskAssignment.assign'
  | 'ProjectTaskAssignment.create'
  | 'ProjectTaskAssignment.read'
  | 'ProjectTaskAssignment.restore'
  | 'ProjectTaskAssignment.soft_delete'
  | 'ProjectTaskAssignment.transfer'
  | 'ProjectTaskAssignment.unassign'
  | 'ProjectTaskAssignment.update'
  | 'ProjectTaskAttachment.create'
  | 'ProjectTaskAttachment.read'
  | 'ProjectTaskAttachment.restore'
  | 'ProjectTaskAttachment.soft_delete'
  | 'ProjectTaskAttachment.update'
  | 'ProjectTaskChecklistItem.complete'
  | 'ProjectTaskChecklistItem.create'
  | 'ProjectTaskChecklistItem.read'
  | 'ProjectTaskChecklistItem.restore'
  | 'ProjectTaskChecklistItem.soft_delete'
  | 'ProjectTaskChecklistItem.update'
  | 'ProjectTaskComment.create'
  | 'ProjectTaskComment.read'
  | 'ProjectTaskComment.restore'
  | 'ProjectTaskComment.soft_delete'
  | 'ProjectTaskComment.update'
  | 'ProjectTaskDependency.create'
  | 'ProjectTaskDependency.read'
  | 'ProjectTaskDependency.restore'
  | 'ProjectTaskDependency.soft_delete'
  | 'ProjectTaskDependency.update'
  | 'ProjectType.activate'
  | 'ProjectType.create'
  | 'ProjectType.deactivate'
  | 'ProjectType.read'
  | 'ProjectType.restore'
  | 'ProjectType.soft_delete'
  | 'ProjectType.update'
  | 'PunchList.create'
  | 'PunchList.read'
  | 'PunchList.restore'
  | 'PunchList.soft_delete'
  | 'PunchList.update'
  | 'PunchListItem.create'
  | 'PunchListItem.read'
  | 'PunchListItem.restore'
  | 'PunchListItem.soft_delete'
  | 'PunchListItem.update'
  | 'PurchaseOrder.approve'
  | 'PurchaseOrder.create'
  | 'PurchaseOrder.read'
  | 'PurchaseOrder.reject'
  | 'PurchaseOrder.restore'
  | 'PurchaseOrder.send'
  | 'PurchaseOrder.soft_delete'
  | 'PurchaseOrder.update'
  | 'PurchaseOrderApproval.approve'
  | 'PurchaseOrderApproval.create'
  | 'PurchaseOrderApproval.read'
  | 'PurchaseOrderApproval.reject'
  | 'PurchaseOrderLine.create'
  | 'PurchaseOrderLine.read'
  | 'PurchaseOrderLine.restore'
  | 'PurchaseOrderLine.soft_delete'
  | 'PurchaseOrderLine.update'
  | 'Quote.approve'
  | 'Quote.create'
  | 'Quote.hard_delete'
  | 'Quote.read'
  | 'Quote.reject'
  | 'Quote.restore'
  | 'Quote.send'
  | 'Quote.soft_delete'
  | 'Quote.update'
  | 'QuoteLineItem.create'
  | 'QuoteLineItem.read'
  | 'QuoteLineItem.restore'
  | 'QuoteLineItem.soft_delete'
  | 'QuoteLineItem.update'
  | 'RFI.create'
  | 'RFI.read'
  | 'RFI.restore'
  | 'RFI.send'
  | 'RFI.soft_delete'
  | 'RFI.update'
  | 'RFIReply.create'
  | 'RFIReply.read'
  | 'RFIReply.restore'
  | 'RFIReply.soft_delete'
  | 'RFIReply.update'
  | 'RFQLine.create'
  | 'RFQLine.read'
  | 'RFQLine.restore'
  | 'RFQLine.soft_delete'
  | 'RFQLine.update'
  | 'RFQResponse.create'
  | 'RFQResponse.read'
  | 'RFQResponse.restore'
  | 'RFQResponse.soft_delete'
  | 'RFQResponse.update'
  | 'RFQResponseLine.create'
  | 'RFQResponseLine.read'
  | 'RFQResponseLine.restore'
  | 'RFQResponseLine.soft_delete'
  | 'RFQResponseLine.update'
  | 'ReasonCode.create'
  | 'ReasonCode.read'
  | 'ReasonCode.restore'
  | 'ReasonCode.soft_delete'
  | 'ReasonCode.update'
  | 'Reconciliation.create'
  | 'Reconciliation.read'
  | 'Reconciliation.restore'
  | 'Reconciliation.soft_delete'
  | 'Reconciliation.update'
  | 'Refund.create'
  | 'Refund.read'
  | 'Refund.restore'
  | 'Refund.soft_delete'
  | 'Refund.update'
  | 'Region.create'
  | 'Region.read'
  | 'Region.restore'
  | 'Region.soft_delete'
  | 'Region.update'
  | 'Reimbursement.create'
  | 'Reimbursement.process'
  | 'Reimbursement.read'
  | 'Reimbursement.restore'
  | 'Reimbursement.soft_delete'
  | 'Reimbursement.update'
  | 'ReportDefinition.create'
  | 'ReportDefinition.read'
  | 'ReportDefinition.restore'
  | 'ReportDefinition.soft_delete'
  | 'ReportDefinition.update'
  | 'RequestForQuote.create'
  | 'RequestForQuote.read'
  | 'RequestForQuote.restore'
  | 'RequestForQuote.send'
  | 'RequestForQuote.soft_delete'
  | 'RequestForQuote.update'
  | 'ResourceAllocation.allocate'
  | 'ResourceAllocation.create'
  | 'ResourceAllocation.deallocate'
  | 'ResourceAllocation.read'
  | 'ResourceAllocation.restore'
  | 'ResourceAllocation.soft_delete'
  | 'ResourceAllocation.update'
  | 'ReturnReminder.create'
  | 'ReturnReminder.read'
  | 'ReturnReminder.send'
  | 'ReturnReminder.update'
  | 'ReturnReminderAttempt.create'
  | 'ReturnReminderAttempt.read'
  | 'RiskFactor.assess'
  | 'RiskFactor.create'
  | 'RiskFactor.read'
  | 'RiskFactor.restore'
  | 'RiskFactor.soft_delete'
  | 'RiskFactor.update'
  | 'Role.activate'
  | 'Role.create'
  | 'Role.deactivate'
  | 'Role.read'
  | 'Role.restore'
  | 'Role.soft_delete'
  | 'Role.update'
  | 'RolePermission.create'
  | 'RolePermission.read'
  | 'RolePermission.restore'
  | 'RolePermission.soft_delete'
  | 'Schedule'
  | 'Schedule.activate'
  | 'Schedule.create'
  | 'Schedule.deactivate'
  | 'Schedule.hard_delete'
  | 'Schedule.publish'
  | 'Schedule.read'
  | 'Schedule.restore'
  | 'Schedule.soft_delete'
  | 'Schedule.update'
  | 'ScheduleException.approve'
  | 'ScheduleException.create'
  | 'ScheduleException.read'
  | 'ScheduleException.reject'
  | 'ScheduleException.restore'
  | 'ScheduleException.soft_delete'
  | 'ScheduleException.update'
  | 'ScheduleRisk.create'
  | 'ScheduleRisk.read'
  | 'ScheduleRisk.restore'
  | 'ScheduleRisk.soft_delete'
  | 'ScheduleRisk.update'
  | 'StateProvince.create'
  | 'StateProvince.read'
  | 'StateProvince.restore'
  | 'StateProvince.soft_delete'
  | 'StateProvince.update'
  | 'Submittal.create'
  | 'Submittal.read'
  | 'Submittal.restore'
  | 'Submittal.soft_delete'
  | 'Submittal.update'
  | 'SubmittalApproval.approve'
  | 'SubmittalApproval.create'
  | 'SubmittalApproval.read'
  | 'SubmittalApproval.reject'
  | 'SubmittalItem.create'
  | 'SubmittalItem.read'
  | 'SubmittalItem.restore'
  | 'SubmittalItem.soft_delete'
  | 'SubmittalItem.update'
  | 'SyncJob.create'
  | 'SyncJob.read'
  | 'SyncJob.restore'
  | 'SyncJob.soft_delete'
  | 'SyncJob.update'
  | 'SyncLog.create'
  | 'SyncLog.read'
  | 'SyncLog.restore'
  | 'SyncLog.soft_delete'
  | 'SyncLog.update'
  | 'SyncState.create'
  | 'SyncState.read'
  | 'SyncState.restore'
  | 'SyncState.soft_delete'
  | 'SyncState.update'
  | 'SystemLog.create'
  | 'SystemLog.read'
  | 'SystemLog.restore'
  | 'SystemLog.soft_delete'
  | 'SystemLog.update'
  | 'Task.activate'
  | 'Task.assign'
  | 'Task.create'
  | 'Task.deactivate'
  | 'Task.duplicate'
  | 'Task.hard_delete'
  | 'Task.read'
  | 'Task.restore'
  | 'Task.soft_delete'
  | 'Task.transfer'
  | 'Task.unassign'
  | 'Task.update'
  | 'TaskAssignment.assign'
  | 'TaskAssignment.create'
  | 'TaskAssignment.read'
  | 'TaskAssignment.restore'
  | 'TaskAssignment.soft_delete'
  | 'TaskAssignment.transfer'
  | 'TaskAssignment.unassign'
  | 'TaskAssignment.update'
  | 'TaskAttachment.create'
  | 'TaskAttachment.read'
  | 'TaskAttachment.restore'
  | 'TaskAttachment.soft_delete'
  | 'TaskAttachment.update'
  | 'TaskChecklistItem.create'
  | 'TaskChecklistItem.read'
  | 'TaskChecklistItem.restore'
  | 'TaskChecklistItem.soft_delete'
  | 'TaskChecklistItem.update'
  | 'TaskDependency.create'
  | 'TaskDependency.read'
  | 'TaskDependency.restore'
  | 'TaskDependency.soft_delete'
  | 'TaskDependency.update'
  | 'Tenant.deactivate'
  | 'Tenant.read'
  | 'Tenant.update'
  | 'TenantAuditLog.export'
  | 'TenantAuditLog.read'
  | 'TenantFeatureFlag.activate'
  | 'TenantFeatureFlag.create'
  | 'TenantFeatureFlag.deactivate'
  | 'TenantFeatureFlag.read'
  | 'TenantFeatureFlag.update'
  | 'TenantMetrics.export'
  | 'TenantMetrics.read'
  | 'TenantPriceList.activate'
  | 'TenantPriceList.create'
  | 'TenantPriceList.deactivate'
  | 'TenantPriceList.read'
  | 'TenantPriceList.update'
  | 'TenantPriceOverride.create'
  | 'TenantPriceOverride.read'
  | 'TenantPriceOverride.restore'
  | 'TenantPriceOverride.soft_delete'
  | 'TenantPriceOverride.update'
  | 'TenantSettings.activate'
  | 'TenantSettings.deactivate'
  | 'TenantSettings.read'
  | 'TenantSettings.update'
  | 'TenantUsageRecord.export'
  | 'TenantUsageRecord.read'
  | 'TermsTemplate.create'
  | 'TermsTemplate.hard_delete'
  | 'TermsTemplate.read'
  | 'TermsTemplate.restore'
  | 'TermsTemplate.soft_delete'
  | 'TermsTemplate.update'
  | 'Timesheet.approve'
  | 'Timesheet.create'
  | 'Timesheet.read'
  | 'Timesheet.reject'
  | 'Timesheet.restore'
  | 'Timesheet.soft_delete'
  | 'Timesheet.submit'
  | 'Timesheet.update'
  | 'TimesheetApproval.approve'
  | 'TimesheetApproval.create'
  | 'TimesheetApproval.read'
  | 'TimesheetApproval.reject'
  | 'TimesheetEntry.create'
  | 'TimesheetEntry.read'
  | 'TimesheetEntry.restore'
  | 'TimesheetEntry.soft_delete'
  | 'TimesheetEntry.update'
  | 'TrainingEnrollment.approve'
  | 'TrainingEnrollment.create'
  | 'TrainingEnrollment.read'
  | 'TrainingEnrollment.reject'
  | 'TrainingEnrollment.restore'
  | 'TrainingEnrollment.soft_delete'
  | 'TrainingEnrollment.update'
  | 'UnitOfMeasure.create'
  | 'UnitOfMeasure.read'
  | 'UnitOfMeasure.restore'
  | 'UnitOfMeasure.soft_delete'
  | 'UnitOfMeasure.update'
  | 'User.activate'
  | 'User.create'
  | 'User.deactivate'
  | 'User.lock'
  | 'User.read'
  | 'User.restore'
  | 'User.soft_delete'
  | 'User.unlock'
  | 'User.update'
  | 'Vendor.activate'
  | 'Vendor.assign'
  | 'Vendor.create'
  | 'Vendor.deactivate'
  | 'Vendor.hard_delete'
  | 'Vendor.read'
  | 'Vendor.restore'
  | 'Vendor.soft_delete'
  | 'Vendor.unassign'
  | 'Vendor.update'
  | 'VendorContact.create'
  | 'VendorContact.read'
  | 'VendorContact.restore'
  | 'VendorContact.soft_delete'
  | 'VendorContact.update'
  | 'VendorDocument.create'
  | 'VendorDocument.read'
  | 'VendorDocument.restore'
  | 'VendorDocument.soft_delete'
  | 'VendorDocument.update'
  | 'WBSItem.create'
  | 'WBSItem.read'
  | 'WBSItem.restore'
  | 'WBSItem.soft_delete'
  | 'WBSItem.update'
  | 'Webhook.activate'
  | 'Webhook.create'
  | 'Webhook.deactivate'
  | 'Webhook.read'
  | 'Webhook.restore'
  | 'Webhook.soft_delete'
  | 'Webhook.update'
  | 'WebhookDelivery.create'
  | 'WebhookDelivery.read'
  | 'WebhookDelivery.restore'
  | 'WebhookDelivery.soft_delete'
  | 'WebhookDelivery.update'
  | 'WebhookEndpoint.create'
  | 'WebhookEndpoint.read'
  | 'WebhookEndpoint.restore'
  | 'WebhookEndpoint.soft_delete'
  | 'WebhookEndpoint.update'
  | 'WebhookEvent.create'
  | 'WebhookEvent.read'
  | 'WebhookEvent.restore'
  | 'WebhookEvent.soft_delete'
  | 'WebhookEvent.update'
  | 'WebhookLog.create'
  | 'WebhookLog.read'
  | 'WebhookLog.restore'
  | 'WebhookLog.soft_delete'
  | 'WebhookLog.update'
  | 'WorkType.create'
  | 'WorkType.read'
  | 'WorkType.restore'
  | 'WorkType.soft_delete'
  | 'WorkType.update'
  | 'Worker.activate'
  | 'Worker.create'
  | 'Worker.deactivate'
  | 'Worker.read'
  | 'Worker.restore'
  | 'Worker.soft_delete'
  | 'Worker.update'
  | 'weather_alert_deliveries.create'
  | 'weather_alert_deliveries.read'
  | 'weather_alert_deliveries.update'
  | 'weather_alerts.activate'
  | 'weather_alerts.create'
  | 'weather_alerts.deactivate'
  | 'weather_alerts.read'
  | 'weather_alerts.update'
  | 'weather_forecast_cache.create'
  | 'weather_forecast_cache.read'
  | 'weather_forecast_cache.update'
  | 'weather_incidents.create'
  | 'weather_incidents.read'
  | 'weather_incidents.resolve'
  | 'weather_incidents.update'
  | 'weather_providers.activate'
  | 'weather_providers.create'
  | 'weather_providers.deactivate'
  | 'weather_providers.read'
  | 'weather_providers.update'
  | 'weather_risk_factors.activate'
  | 'weather_risk_factors.create'
  | 'weather_risk_factors.deactivate'
  | 'weather_risk_factors.read'
  | 'weather_risk_factors.update'
  | 'weather_watches.create'
  | 'weather_watches.read'
  | 'weather_watches.update';

export const PERMISSIONS: Permission[] = [
  'AIAction.activate',
  'AIAction.create',
  'AIAction.deactivate',
  'AIAction.read',
  'AIAction.restore',
  'AIAction.soft_delete',
  'AIAction.update',
  'AIActionRun.create',
  'AIActionRun.read',
  'AIActionRun.restore',
  'AIActionRun.soft_delete',
  'AIActionRun.update',
  'AIAssistantProfile.activate',
  'AIAssistantProfile.create',
  'AIAssistantProfile.deactivate',
  'AIAssistantProfile.read',
  'AIAssistantProfile.restore',
  'AIAssistantProfile.soft_delete',
  'AIAssistantProfile.update',
  'AIDocumentChunk.create',
  'AIDocumentChunk.read',
  'AIDocumentChunk.restore',
  'AIDocumentChunk.soft_delete',
  'AIDocumentChunk.update',
  'AIDocumentIndex.create',
  'AIDocumentIndex.read',
  'AIDocumentIndex.restore',
  'AIDocumentIndex.soft_delete',
  'AIDocumentIndex.update',
  'AIEmbedding.create',
  'AIEmbedding.read',
  'AIEmbedding.restore',
  'AIEmbedding.soft_delete',
  'AIEmbedding.update',
  'AIInsight.create',
  'AIInsight.read',
  'AIInsight.restore',
  'AIInsight.soft_delete',
  'AIInsight.update',
  'AIInsightFeedback.create',
  'AIInsightFeedback.read',
  'AIInsightFeedback.restore',
  'AIInsightFeedback.soft_delete',
  'AIInsightFeedback.update',
  'AIJob.create',
  'AIJob.read',
  'AIJob.restore',
  'AIJob.soft_delete',
  'AIJob.update',
  'AIJobArtifact.create',
  'AIJobArtifact.read',
  'AIJobArtifact.restore',
  'AIJobArtifact.soft_delete',
  'AIJobArtifact.update',
  'AIPlaybook.activate',
  'AIPlaybook.create',
  'AIPlaybook.deactivate',
  'AIPlaybook.read',
  'AIPlaybook.restore',
  'AIPlaybook.soft_delete',
  'AIPlaybook.update',
  'AIPlaybookStep.create',
  'AIPlaybookStep.read',
  'AIPlaybookStep.restore',
  'AIPlaybookStep.soft_delete',
  'AIPlaybookStep.update',
  'AIPromptTemplate.create',
  'AIPromptTemplate.read',
  'AIPromptTemplate.restore',
  'AIPromptTemplate.soft_delete',
  'AIPromptTemplate.update',
  'APBill.approve',
  'APBill.create',
  'APBill.read',
  'APBill.reject',
  'APBill.restore',
  'APBill.soft_delete',
  'APBill.update',
  'APBillLine.create',
  'APBillLine.read',
  'APBillLine.restore',
  'APBillLine.soft_delete',
  'APBillLine.update',
  'AbsenceBalance.create',
  'AbsenceBalance.read',
  'AbsenceBalance.restore',
  'AbsenceBalance.soft_delete',
  'AbsenceBalance.update',
  'Account.activate',
  'Account.assign',
  'Account.create',
  'Account.deactivate',
  'Account.hard_delete',
  'Account.read',
  'Account.restore',
  'Account.soft_delete',
  'Account.unassign',
  'Account.update',
  'AccountAddress.create',
  'AccountAddress.hard_delete',
  'AccountAddress.read',
  'AccountAddress.restore',
  'AccountAddress.soft_delete',
  'AccountAddress.update',
  'Activity.create',
  'Activity.read',
  'Activity.restore',
  'Activity.soft_delete',
  'Activity.update',
  'ActivityAttachment.create',
  'ActivityAttachment.read',
  'ActivityAttachment.restore',
  'ActivityAttachment.soft_delete',
  'ActivityAttachment.update',
  'Allowance.approve',
  'Allowance.create',
  'Allowance.read',
  'Allowance.reject',
  'Allowance.restore',
  'Allowance.soft_delete',
  'Allowance.update',
  'AnomalyCase.create',
  'AnomalyCase.investigate',
  'AnomalyCase.read',
  'AnomalyCase.restore',
  'AnomalyCase.soft_delete',
  'AnomalyCase.update',
  'AnomalyCaseAction.create',
  'AnomalyCaseAction.execute',
  'AnomalyCaseAction.read',
  'AnomalyCaseAction.update',
  'AnomalySignal.create',
  'AnomalySignal.read',
  'AnomalySignal.update',
  'AnomalySignalFeature.create',
  'AnomalySignalFeature.read',
  'AnomalySignalFeature.update',
  'ApiKey.activate',
  'ApiKey.create',
  'ApiKey.deactivate',
  'ApiKey.read',
  'ApiKey.restore',
  'ApiKey.soft_delete',
  'ApiKey.update',
  'ApprovalDecision.create',
  'ApprovalDecision.read',
  'ApprovalDecision.restore',
  'ApprovalDecision.soft_delete',
  'ApprovalDecision.update',
  'ApprovalRequest.approve',
  'ApprovalRequest.create',
  'ApprovalRequest.read',
  'ApprovalRequest.reject',
  'ApprovalRequest.restore',
  'ApprovalRequest.soft_delete',
  'ApprovalRequest.submit',
  'ApprovalRequest.update',
  'ApprovalRule.activate',
  'ApprovalRule.create',
  'ApprovalRule.deactivate',
  'ApprovalRule.read',
  'ApprovalRule.restore',
  'ApprovalRule.soft_delete',
  'ApprovalRule.update',
  'Asset.activate',
  'Asset.assign',
  'Asset.create',
  'Asset.deactivate',
  'Asset.hard_delete',
  'Asset.read',
  'Asset.restore',
  'Asset.soft_delete',
  'Asset.transfer',
  'Asset.unassign',
  'Asset.update',
  'AssetAssignment.assign',
  'AssetAssignment.create',
  'AssetAssignment.read',
  'AssetAssignment.restore',
  'AssetAssignment.soft_delete',
  'AssetAssignment.transfer',
  'AssetAssignment.unassign',
  'AssetAssignment.update',
  'AssetDepreciation.create',
  'AssetDepreciation.read',
  'AssetDepreciation.restore',
  'AssetDepreciation.soft_delete',
  'AssetDepreciation.update',
  'AssetDocument.create',
  'AssetDocument.read',
  'AssetDocument.restore',
  'AssetDocument.soft_delete',
  'AssetDocument.update',
  'AssetMaintenance.create',
  'AssetMaintenance.read',
  'AssetMaintenance.restore',
  'AssetMaintenance.soft_delete',
  'AssetMaintenance.update',
  'AssetMeterReading.create',
  'AssetMeterReading.read',
  'AssetMeterReading.restore',
  'AssetMeterReading.soft_delete',
  'AssetMeterReading.update',
  'Attachment.approve',
  'Attachment.create',
  'Attachment.hard_delete',
  'Attachment.read',
  'Attachment.reject',
  'Attachment.restore',
  'Attachment.soft_delete',
  'Attachment.update',
  'AttachmentLink.create',
  'AttachmentLink.read',
  'AttachmentLink.restore',
  'AttachmentLink.soft_delete',
  'AttachmentLink.update',
  'AuthFactor.activate',
  'AuthFactor.create',
  'AuthFactor.deactivate',
  'AuthFactor.read',
  'AuthFactor.restore',
  'AuthFactor.soft_delete',
  'AuthFactor.update',
  'BankAccount.activate',
  'BankAccount.create',
  'BankAccount.deactivate',
  'BankAccount.read',
  'BankAccount.restore',
  'BankAccount.soft_delete',
  'BankAccount.update',
  'BankStatementLine.create',
  'BankStatementLine.read',
  'BankStatementLine.restore',
  'BankStatementLine.soft_delete',
  'BankStatementLine.update',
  'BenefitDependent.create',
  'BenefitDependent.read',
  'BenefitDependent.restore',
  'BenefitDependent.soft_delete',
  'BenefitDependent.update',
  'BenefitEnrollment.approve',
  'BenefitEnrollment.create',
  'BenefitEnrollment.read',
  'BenefitEnrollment.reject',
  'BenefitEnrollment.restore',
  'BenefitEnrollment.soft_delete',
  'BenefitEnrollment.update',
  'Bid.approve',
  'Bid.create',
  'Bid.read',
  'Bid.reject',
  'Bid.restore',
  'Bid.soft_delete',
  'Bid.submit',
  'Bid.update',
  'BidComparison.create',
  'BidComparison.read',
  'BidComparison.restore',
  'BidComparison.soft_delete',
  'BidComparison.update',
  'BidInvitation.create',
  'BidInvitation.read',
  'BidInvitation.restore',
  'BidInvitation.send',
  'BidInvitation.soft_delete',
  'BidInvitation.update',
  'BidSubmission.approve',
  'BidSubmission.create',
  'BidSubmission.read',
  'BidSubmission.reject',
  'BidSubmission.submit',
  'BidSubmission.update',
  'BillApproval.approve',
  'BillApproval.create',
  'BillApproval.read',
  'BillApproval.reject',
  'BillPayment.create',
  'BillPayment.read',
  'BillPayment.restore',
  'BillPayment.soft_delete',
  'BillPayment.update',
  'Certification.approve',
  'Certification.create',
  'Certification.read',
  'Certification.reject',
  'Certification.restore',
  'Certification.soft_delete',
  'Certification.update',
  'ChangeOrder.approve',
  'ChangeOrder.create',
  'ChangeOrder.read',
  'ChangeOrder.reject',
  'ChangeOrder.restore',
  'ChangeOrder.soft_delete',
  'ChangeOrder.update',
  'ChangeOrderApproval.approve',
  'ChangeOrderApproval.create',
  'ChangeOrderApproval.read',
  'ChangeOrderApproval.reject',
  'ChangeOrderDocument.create',
  'ChangeOrderDocument.read',
  'ChangeOrderDocument.restore',
  'ChangeOrderDocument.soft_delete',
  'ChangeOrderDocument.update',
  'ChangeOrderLine.create',
  'ChangeOrderLine.read',
  'ChangeOrderLine.restore',
  'ChangeOrderLine.soft_delete',
  'ChangeOrderLine.update',
  'Channel.activate',
  'Channel.archive',
  'Channel.create',
  'Channel.deactivate',
  'Channel.hard_delete',
  'Channel.read',
  'Channel.restore',
  'Channel.soft_delete',
  'Channel.update',
  'ChannelMember.assign',
  'ChannelMember.create',
  'ChannelMember.read',
  'ChannelMember.restore',
  'ChannelMember.soft_delete',
  'ChannelMember.unassign',
  'ChannelMember.update',
  'Chargeback.create',
  'Chargeback.read',
  'Chargeback.restore',
  'Chargeback.soft_delete',
  'Chargeback.update',
  'ChargebackEvidence.create',
  'ChargebackEvidence.read',
  'ChargebackEvidence.restore',
  'ChargebackEvidence.soft_delete',
  'ChargebackEvidence.update',
  'ClockInClockOut.approve',
  'ClockInClockOut.create',
  'ClockInClockOut.export',
  'ClockInClockOut.read',
  'ClockInClockOut.reject',
  'ClockInClockOut.restore',
  'ClockInClockOut.soft_delete',
  'ClockInClockOut.update',
  'CompensationComponent.activate',
  'CompensationComponent.create',
  'CompensationComponent.deactivate',
  'CompensationComponent.read',
  'CompensationComponent.restore',
  'CompensationComponent.soft_delete',
  'CompensationComponent.update',
  'CompensationPlan.activate',
  'CompensationPlan.create',
  'CompensationPlan.deactivate',
  'CompensationPlan.read',
  'CompensationPlan.restore',
  'CompensationPlan.soft_delete',
  'CompensationPlan.update',
  'Contact.create',
  'Contact.hard_delete',
  'Contact.read',
  'Contact.restore',
  'Contact.soft_delete',
  'Contact.update',
  'Contract.approve',
  'Contract.create',
  'Contract.read',
  'Contract.reject',
  'Contract.restore',
  'Contract.send',
  'Contract.soft_delete',
  'Contract.update',
  'ContractTemplate.create',
  'ContractTemplate.hard_delete',
  'ContractTemplate.read',
  'ContractTemplate.restore',
  'ContractTemplate.soft_delete',
  'ContractTemplate.update',
  'CostCategory.create',
  'CostCategory.read',
  'CostCategory.restore',
  'CostCategory.soft_delete',
  'CostCategory.update',
  'CostCenter.create',
  'CostCenter.read',
  'CostCenter.restore',
  'CostCenter.soft_delete',
  'CostCenter.update',
  'CostCode.create',
  'CostCode.read',
  'CostCode.restore',
  'CostCode.soft_delete',
  'CostCode.update',
  'Country.create',
  'Country.read',
  'Country.restore',
  'Country.soft_delete',
  'Country.update',
  'CreditMemo.create',
  'CreditMemo.read',
  'CreditMemo.restore',
  'CreditMemo.soft_delete',
  'CreditMemo.update',
  'CreditMemoLine.create',
  'CreditMemoLine.read',
  'CreditMemoLine.restore',
  'CreditMemoLine.soft_delete',
  'CreditMemoLine.update',
  'CurrencyRate.create',
  'CurrencyRate.read',
  'CurrencyRate.update',
  'DailyLog.create',
  'DailyLog.read',
  'DailyLog.restore',
  'DailyLog.soft_delete',
  'DailyLog.update',
  'DashboardDefinition.create',
  'DashboardDefinition.read',
  'DashboardDefinition.restore',
  'DashboardDefinition.soft_delete',
  'DashboardDefinition.update',
  'DataRetentionPolicy.activate',
  'DataRetentionPolicy.create',
  'DataRetentionPolicy.deactivate',
  'DataRetentionPolicy.read',
  'DataRetentionPolicy.restore',
  'DataRetentionPolicy.soft_delete',
  'DataRetentionPolicy.update',
  'Deduction.approve',
  'Deduction.create',
  'Deduction.read',
  'Deduction.reject',
  'Deduction.restore',
  'Deduction.soft_delete',
  'Deduction.update',
  'Department.activate',
  'Department.create',
  'Department.deactivate',
  'Department.read',
  'Department.restore',
  'Department.soft_delete',
  'Department.update',
  'DirectChat.archive',
  'DirectChat.create',
  'DirectChat.hard_delete',
  'DirectChat.read',
  'DirectChat.restore',
  'DirectChat.soft_delete',
  'DirectChat.update',
  'DirectMessage.create',
  'DirectMessage.read',
  'DirectMessage.restore',
  'DirectMessage.soft_delete',
  'DirectMessage.update',
  'DirectMessageRead.create',
  'DirectMessageRead.read',
  'DirectMessageRead.update',
  'DistributedLock.create',
  'DistributedLock.read',
  'DistributedLock.update',
  'DocumentGroup.create',
  'DocumentGroup.read',
  'DocumentGroup.restore',
  'DocumentGroup.soft_delete',
  'DocumentGroup.update',
  'DunningNotice.create',
  'DunningNotice.read',
  'DunningNotice.send',
  'DunningNotice.update',
  'ESignatureEnvelope.create',
  'ESignatureEnvelope.read',
  'ESignatureEnvelope.restore',
  'ESignatureEnvelope.send',
  'ESignatureEnvelope.soft_delete',
  'ESignatureEnvelope.update',
  'ESignatureRecipient.create',
  'ESignatureRecipient.read',
  'ESignatureRecipient.restore',
  'ESignatureRecipient.soft_delete',
  'ESignatureRecipient.update',
  'EmailTemplate.create',
  'EmailTemplate.read',
  'EmailTemplate.restore',
  'EmailTemplate.soft_delete',
  'EmailTemplate.update',
  'Employment.activate',
  'Employment.create',
  'Employment.deactivate',
  'Employment.read',
  'Employment.restore',
  'Employment.soft_delete',
  'Employment.update',
  'ErrorReport.create',
  'ErrorReport.read',
  'ErrorReport.restore',
  'ErrorReport.soft_delete',
  'ErrorReport.update',
  'Estimate.approve',
  'Estimate.create',
  'Estimate.hard_delete',
  'Estimate.read',
  'Estimate.reject',
  'Estimate.restore',
  'Estimate.send',
  'Estimate.soft_delete',
  'Estimate.update',
  'EstimateApproval.approve',
  'EstimateApproval.create',
  'EstimateApproval.read',
  'EstimateApproval.reject',
  'EstimateAttachment.create',
  'EstimateAttachment.read',
  'EstimateAttachment.restore',
  'EstimateAttachment.soft_delete',
  'EstimateAttachment.update',
  'EstimateComment.create',
  'EstimateComment.read',
  'EstimateComment.restore',
  'EstimateComment.soft_delete',
  'EstimateComment.update',
  'EstimateDiscount.create',
  'EstimateDiscount.read',
  'EstimateDiscount.restore',
  'EstimateDiscount.soft_delete',
  'EstimateDiscount.update',
  'EstimateHistoryEvent.create',
  'EstimateHistoryEvent.read',
  'EstimateLineItem.create',
  'EstimateLineItem.read',
  'EstimateLineItem.restore',
  'EstimateLineItem.soft_delete',
  'EstimateLineItem.update',
  'EstimateRevision.create',
  'EstimateRevision.read',
  'EstimateRevision.restore',
  'EstimateRevision.soft_delete',
  'EstimateRevision.update',
  'EstimateTax.create',
  'EstimateTax.read',
  'EstimateTax.restore',
  'EstimateTax.soft_delete',
  'EstimateTax.update',
  'EstimateTerm.create',
  'EstimateTerm.read',
  'EstimateTerm.restore',
  'EstimateTerm.soft_delete',
  'EstimateTerm.update',
  'Expense.approve',
  'Expense.create',
  'Expense.export',
  'Expense.hard_delete',
  'Expense.read',
  'Expense.reject',
  'Expense.restore',
  'Expense.soft_delete',
  'Expense.update',
  'ExpenseApproval.approve',
  'ExpenseApproval.create',
  'ExpenseApproval.read',
  'ExpenseApproval.reject',
  'ExpenseLine.create',
  'ExpenseLine.read',
  'ExpenseLine.restore',
  'ExpenseLine.soft_delete',
  'ExpenseLine.update',
  'ExpenseReceipt.approve',
  'ExpenseReceipt.create',
  'ExpenseReceipt.read',
  'ExpenseReceipt.reject',
  'ExpenseReceipt.restore',
  'ExpenseReceipt.soft_delete',
  'ExpenseReceipt.update',
  'ExpenseReport.approve',
  'ExpenseReport.create',
  'ExpenseReport.read',
  'ExpenseReport.reject',
  'ExpenseReport.restore',
  'ExpenseReport.soft_delete',
  'ExpenseReport.submit',
  'ExpenseReport.update',
  'ExportArtifact.create',
  'ExportArtifact.read',
  'ExportArtifact.restore',
  'ExportArtifact.soft_delete',
  'ExportArtifact.update',
  'ExportJob.create',
  'ExportJob.read',
  'ExportJob.restore',
  'ExportJob.soft_delete',
  'ExportJob.update',
  'FileObject.create',
  'FileObject.hard_delete',
  'FileObject.read',
  'FileObject.restore',
  'FileObject.soft_delete',
  'FileObject.update',
  'ForecastLine.create',
  'ForecastLine.read',
  'ForecastLine.restore',
  'ForecastLine.soft_delete',
  'ForecastLine.update',
  'ForecastSnapshot.create',
  'ForecastSnapshot.export',
  'ForecastSnapshot.read',
  'FraudPolicy.activate',
  'FraudPolicy.create',
  'FraudPolicy.deactivate',
  'FraudPolicy.read',
  'FraudPolicy.restore',
  'FraudPolicy.soft_delete',
  'FraudPolicy.update',
  'FraudPolicyRule.create',
  'FraudPolicyRule.read',
  'FraudPolicyRule.restore',
  'FraudPolicyRule.soft_delete',
  'FraudPolicyRule.update',
  'FraudPolicyScope.create',
  'FraudPolicyScope.read',
  'FraudPolicyScope.restore',
  'FraudPolicyScope.soft_delete',
  'FraudPolicyScope.update',
  'GLAccount.activate',
  'GLAccount.create',
  'GLAccount.deactivate',
  'GLAccount.read',
  'GLAccount.restore',
  'GLAccount.soft_delete',
  'GLAccount.update',
  'GoodsReceipt.create',
  'GoodsReceipt.read',
  'GoodsReceipt.restore',
  'GoodsReceipt.soft_delete',
  'GoodsReceipt.update',
  'GoodsReceiptLine.create',
  'GoodsReceiptLine.read',
  'GoodsReceiptLine.restore',
  'GoodsReceiptLine.soft_delete',
  'GoodsReceiptLine.update',
  'Grade.create',
  'Grade.read',
  'Grade.restore',
  'Grade.soft_delete',
  'Grade.update',
  'HolidayCalendar.create',
  'HolidayCalendar.read',
  'HolidayCalendar.restore',
  'HolidayCalendar.soft_delete',
  'HolidayCalendar.update',
  'InAppAnnouncement.create',
  'InAppAnnouncement.publish',
  'InAppAnnouncement.read',
  'InAppAnnouncement.restore',
  'InAppAnnouncement.soft_delete',
  'InAppAnnouncement.update',
  'Inspection.create',
  'Inspection.read',
  'Inspection.restore',
  'Inspection.soft_delete',
  'Inspection.update',
  'InspectionApproval.approve',
  'InspectionApproval.create',
  'InspectionApproval.read',
  'InspectionApproval.reject',
  'InspectionItem.create',
  'InspectionItem.read',
  'InspectionItem.restore',
  'InspectionItem.soft_delete',
  'InspectionItem.update',
  'IntegrationConnection.activate',
  'IntegrationConnection.create',
  'IntegrationConnection.deactivate',
  'IntegrationConnection.read',
  'IntegrationConnection.restore',
  'IntegrationConnection.soft_delete',
  'IntegrationConnection.update',
  'IntegrationConnector.create',
  'IntegrationConnector.read',
  'IntegrationConnector.restore',
  'IntegrationConnector.soft_delete',
  'IntegrationConnector.update',
  'IntegrationMapping.create',
  'IntegrationMapping.read',
  'IntegrationMapping.restore',
  'IntegrationMapping.soft_delete',
  'IntegrationMapping.update',
  'IntegrationProvider.create',
  'IntegrationProvider.read',
  'IntegrationProvider.restore',
  'IntegrationProvider.soft_delete',
  'IntegrationProvider.update',
  'IntegrationSecret.create',
  'IntegrationSecret.read',
  'IntegrationSecret.restore',
  'IntegrationSecret.soft_delete',
  'IntegrationSecret.update',
  'InventoryAdjustment.approve',
  'InventoryAdjustment.create',
  'InventoryAdjustment.read',
  'InventoryAdjustment.reject',
  'InventoryAdjustment.restore',
  'InventoryAdjustment.soft_delete',
  'InventoryAdjustment.update',
  'InventoryAttachment.create',
  'InventoryAttachment.read',
  'InventoryAttachment.restore',
  'InventoryAttachment.soft_delete',
  'InventoryAttachment.update',
  'InventoryBin.create',
  'InventoryBin.read',
  'InventoryBin.restore',
  'InventoryBin.soft_delete',
  'InventoryBin.update',
  'InventoryCount.create',
  'InventoryCount.read',
  'InventoryCount.restore',
  'InventoryCount.soft_delete',
  'InventoryCount.update',
  'InventoryCountLine.create',
  'InventoryCountLine.read',
  'InventoryCountLine.restore',
  'InventoryCountLine.soft_delete',
  'InventoryCountLine.update',
  'InventoryItem.activate',
  'InventoryItem.assign',
  'InventoryItem.create',
  'InventoryItem.deactivate',
  'InventoryItem.hard_delete',
  'InventoryItem.read',
  'InventoryItem.restore',
  'InventoryItem.soft_delete',
  'InventoryItem.transfer',
  'InventoryItem.unassign',
  'InventoryItem.update',
  'InventoryLocation.create',
  'InventoryLocation.read',
  'InventoryLocation.restore',
  'InventoryLocation.soft_delete',
  'InventoryLocation.update',
  'InventoryReservation.create',
  'InventoryReservation.read',
  'InventoryReservation.restore',
  'InventoryReservation.soft_delete',
  'InventoryReservation.update',
  'InventoryTransaction.create',
  'InventoryTransaction.read',
  'InventoryTransaction.restore',
  'InventoryTransaction.soft_delete',
  'InventoryTransaction.update',
  'Invoice.approve',
  'Invoice.create',
  'Invoice.duplicate',
  'Invoice.export',
  'Invoice.hard_delete',
  'Invoice.read',
  'Invoice.reject',
  'Invoice.restore',
  'Invoice.send',
  'Invoice.soft_delete',
  'Invoice.update',
  'InvoiceAttachment.create',
  'InvoiceAttachment.read',
  'InvoiceAttachment.restore',
  'InvoiceAttachment.soft_delete',
  'InvoiceAttachment.update',
  'InvoiceLineItem.create',
  'InvoiceLineItem.read',
  'InvoiceLineItem.restore',
  'InvoiceLineItem.soft_delete',
  'InvoiceLineItem.update',
  'InvoicePayment.create',
  'InvoicePayment.read',
  'InvoicePayment.restore',
  'InvoicePayment.soft_delete',
  'InvoicePayment.update',
  'InvoiceTax.create',
  'InvoiceTax.read',
  'InvoiceTax.restore',
  'InvoiceTax.soft_delete',
  'InvoiceTax.update',
  'JobFamily.create',
  'JobFamily.read',
  'JobFamily.restore',
  'JobFamily.soft_delete',
  'JobFamily.update',
  'JobProfile.create',
  'JobProfile.read',
  'JobProfile.restore',
  'JobProfile.soft_delete',
  'JobProfile.update',
  'JobProfileAssignment.assign',
  'JobProfileAssignment.create',
  'JobProfileAssignment.read',
  'JobProfileAssignment.unassign',
  'JobProfileAssignment.update',
  'JobRun.create',
  'JobRun.read',
  'JobRun.restore',
  'JobRun.soft_delete',
  'JobRun.update',
  'JobSchedule.activate',
  'JobSchedule.create',
  'JobSchedule.deactivate',
  'JobSchedule.read',
  'JobSchedule.update',
  'JournalEntry.create',
  'JournalEntry.read',
  'JournalEntry.restore',
  'JournalEntry.soft_delete',
  'JournalEntry.update',
  'JournalLine.create',
  'JournalLine.read',
  'JournalLine.restore',
  'JournalLine.soft_delete',
  'JournalLine.update',
  'Lead.assign',
  'Lead.create',
  'Lead.hard_delete',
  'Lead.read',
  'Lead.restore',
  'Lead.soft_delete',
  'Lead.transfer',
  'Lead.unassign',
  'Lead.update',
  'LeadActivity.create',
  'LeadActivity.read',
  'LeadActivity.restore',
  'LeadActivity.soft_delete',
  'LeadActivity.update',
  'Leave.approve',
  'Leave.create',
  'Leave.read',
  'Leave.reject',
  'Leave.restore',
  'Leave.soft_delete',
  'Leave.update',
  'LeaveOfAbsence.approve',
  'LeaveOfAbsence.create',
  'LeaveOfAbsence.read',
  'LeaveOfAbsence.reject',
  'LeaveOfAbsence.restore',
  'LeaveOfAbsence.soft_delete',
  'LeaveOfAbsence.update',
  'Location.create',
  'Location.read',
  'Location.restore',
  'Location.soft_delete',
  'Location.update',
  'LossInvestigation.create',
  'LossInvestigation.read',
  'LossInvestigation.restore',
  'LossInvestigation.soft_delete',
  'LossInvestigation.update',
  'LossInvestigationFinding.create',
  'LossInvestigationFinding.read',
  'LossInvestigationFinding.restore',
  'LossInvestigationFinding.soft_delete',
  'LossInvestigationFinding.update',
  'Member.activate',
  'Member.assign',
  'Member.create',
  'Member.deactivate',
  'Member.read',
  'Member.restore',
  'Member.soft_delete',
  'Member.transfer',
  'Member.unassign',
  'Member.update',
  'MemberDocument.approve',
  'MemberDocument.create',
  'MemberDocument.read',
  'MemberDocument.reject',
  'MemberDocument.restore',
  'MemberDocument.soft_delete',
  'MemberDocument.update',
  'MemberRole.assign',
  'MemberRole.create',
  'MemberRole.read',
  'MemberRole.restore',
  'MemberRole.soft_delete',
  'MemberRole.transfer',
  'MemberRole.unassign',
  'MemberRole.update',
  'MemberSettings.activate',
  'MemberSettings.deactivate',
  'MemberSettings.read',
  'MemberSettings.update',
  'Message.create',
  'Message.read',
  'Message.restore',
  'Message.soft_delete',
  'Message.update',
  'MessageAttachment.create',
  'MessageAttachment.read',
  'MessageAttachment.restore',
  'MessageAttachment.soft_delete',
  'MessageAttachment.update',
  'MessageRead.create',
  'MessageRead.read',
  'MessageRead.update',
  'Milestone.create',
  'Milestone.read',
  'Milestone.restore',
  'Milestone.soft_delete',
  'Milestone.update',
  'MilestoneDependency.create',
  'MilestoneDependency.read',
  'MilestoneDependency.restore',
  'MilestoneDependency.soft_delete',
  'MilestoneDependency.update',
  'MilestoneStakeholder.create',
  'MilestoneStakeholder.read',
  'MilestoneStakeholder.restore',
  'MilestoneStakeholder.soft_delete',
  'MilestoneStakeholder.update',
  'MitigationAction.create',
  'MitigationAction.implement',
  'MitigationAction.read',
  'MitigationAction.restore',
  'MitigationAction.soft_delete',
  'MitigationAction.update',
  'Notification.create',
  'Notification.read',
  'Notification.restore',
  'Notification.soft_delete',
  'Notification.update',
  'NotificationPreference.create',
  'NotificationPreference.read',
  'NotificationPreference.restore',
  'NotificationPreference.soft_delete',
  'NotificationPreference.update',
  'NotificationTemplate.create',
  'NotificationTemplate.read',
  'NotificationTemplate.restore',
  'NotificationTemplate.soft_delete',
  'NotificationTemplate.update',
  'NumberSequence.create',
  'NumberSequence.read',
  'NumberSequence.update',
  'Opportunity.assign',
  'Opportunity.create',
  'Opportunity.hard_delete',
  'Opportunity.read',
  'Opportunity.restore',
  'Opportunity.soft_delete',
  'Opportunity.transfer',
  'Opportunity.unassign',
  'Opportunity.update',
  'OpportunityLineItem.create',
  'OpportunityLineItem.read',
  'OpportunityLineItem.restore',
  'OpportunityLineItem.soft_delete',
  'OpportunityLineItem.update',
  'OpportunityStage.create',
  'OpportunityStage.read',
  'OpportunityStage.restore',
  'OpportunityStage.soft_delete',
  'OpportunityStage.update',
  'OrgUnit.activate',
  'OrgUnit.create',
  'OrgUnit.deactivate',
  'OrgUnit.read',
  'OrgUnit.restore',
  'OrgUnit.soft_delete',
  'OrgUnit.update',
  'OvertimeRule.activate',
  'OvertimeRule.create',
  'OvertimeRule.deactivate',
  'OvertimeRule.read',
  'OvertimeRule.restore',
  'OvertimeRule.soft_delete',
  'OvertimeRule.update',
  'PayCalendar.create',
  'PayCalendar.read',
  'PayCalendar.restore',
  'PayCalendar.soft_delete',
  'PayCalendar.update',
  'PayGroup.create',
  'PayGroup.read',
  'PayGroup.restore',
  'PayGroup.soft_delete',
  'PayGroup.update',
  'PayGroupAssignment.assign',
  'PayGroupAssignment.create',
  'PayGroupAssignment.read',
  'PayGroupAssignment.unassign',
  'PayGroupAssignment.update',
  'PayStatement.read',
  'Payment.create',
  'Payment.export',
  'Payment.read',
  'Payment.restore',
  'Payment.soft_delete',
  'Payment.update',
  'PaymentApplication.create',
  'PaymentApplication.read',
  'PaymentApplication.restore',
  'PaymentApplication.soft_delete',
  'PaymentApplication.update',
  'PaymentGateway.activate',
  'PaymentGateway.create',
  'PaymentGateway.deactivate',
  'PaymentGateway.read',
  'PaymentGateway.restore',
  'PaymentGateway.soft_delete',
  'PaymentGateway.update',
  'PaymentMethod.create',
  'PaymentMethod.read',
  'PaymentMethod.restore',
  'PaymentMethod.soft_delete',
  'PaymentMethod.update',
  'PaymentMethodToken.create',
  'PaymentMethodToken.read',
  'PaymentMethodToken.restore',
  'PaymentMethodToken.soft_delete',
  'PaymentMethodToken.update',
  'PaymentSchedule.create',
  'PaymentSchedule.read',
  'PaymentSchedule.restore',
  'PaymentSchedule.soft_delete',
  'PaymentSchedule.update',
  'PaymentTerm.create',
  'PaymentTerm.read',
  'PaymentTerm.restore',
  'PaymentTerm.soft_delete',
  'PaymentTerm.update',
  'Payout.create',
  'Payout.read',
  'Payout.restore',
  'Payout.soft_delete',
  'Payout.update',
  'PayrollAdjustment.create',
  'PayrollAdjustment.read',
  'PayrollAdjustment.restore',
  'PayrollAdjustment.soft_delete',
  'PayrollAdjustment.update',
  'PayrollItem.create',
  'PayrollItem.read',
  'PayrollItem.restore',
  'PayrollItem.soft_delete',
  'PayrollItem.update',
  'PayrollPayment.create',
  'PayrollPayment.read',
  'PayrollPayment.restore',
  'PayrollPayment.soft_delete',
  'PayrollPayment.update',
  'PayrollRun.approve',
  'PayrollRun.create',
  'PayrollRun.read',
  'PayrollRun.reject',
  'PayrollRun.restore',
  'PayrollRun.soft_delete',
  'PayrollRun.submit',
  'PayrollRun.update',
  'PayrollTax.create',
  'PayrollTax.read',
  'PayrollTax.restore',
  'PayrollTax.soft_delete',
  'PayrollTax.update',
  'PerformanceGoal.create',
  'PerformanceGoal.read',
  'PerformanceGoal.restore',
  'PerformanceGoal.soft_delete',
  'PerformanceGoal.update',
  'PerformanceReview.approve',
  'PerformanceReview.create',
  'PerformanceReview.read',
  'PerformanceReview.reject',
  'PerformanceReview.restore',
  'PerformanceReview.soft_delete',
  'PerformanceReview.update',
  'Permission.read',
  'Person.create',
  'Person.read',
  'Person.restore',
  'Person.soft_delete',
  'Person.update',
  'PersonAddress.create',
  'PersonAddress.read',
  'PersonAddress.restore',
  'PersonAddress.soft_delete',
  'PersonAddress.update',
  'PersonContactMethod.create',
  'PersonContactMethod.read',
  'PersonContactMethod.restore',
  'PersonContactMethod.soft_delete',
  'PersonContactMethod.update',
  'PersonDocument.create',
  'PersonDocument.read',
  'PersonDocument.restore',
  'PersonDocument.soft_delete',
  'PersonDocument.update',
  'PersonName.create',
  'PersonName.read',
  'PersonName.restore',
  'PersonName.soft_delete',
  'PersonName.update',
  'Position.activate',
  'Position.create',
  'Position.deactivate',
  'Position.read',
  'Position.restore',
  'Position.soft_delete',
  'Position.update',
  'PositionAssignment.assign',
  'PositionAssignment.create',
  'PositionAssignment.read',
  'PositionAssignment.restore',
  'PositionAssignment.soft_delete',
  'PositionAssignment.unassign',
  'PositionAssignment.update',
  'PositionBudget.create',
  'PositionBudget.read',
  'PositionBudget.restore',
  'PositionBudget.soft_delete',
  'PositionBudget.update',
  'PriceList.activate',
  'PriceList.create',
  'PriceList.deactivate',
  'PriceList.read',
  'PriceList.restore',
  'PriceList.soft_delete',
  'PriceList.update',
  'PriceListItem.create',
  'PriceListItem.read',
  'PriceListItem.restore',
  'PriceListItem.soft_delete',
  'PriceListItem.update',
  'Project.activate',
  'Project.archive',
  'Project.assign',
  'Project.create',
  'Project.deactivate',
  'Project.duplicate',
  'Project.hard_delete',
  'Project.read',
  'Project.restore',
  'Project.soft_delete',
  'Project.transfer',
  'Project.unassign',
  'Project.update',
  'ProjectBudgetLine.create',
  'ProjectBudgetLine.read',
  'ProjectBudgetLine.restore',
  'ProjectBudgetLine.soft_delete',
  'ProjectBudgetLine.update',
  'ProjectDocument.create',
  'ProjectDocument.read',
  'ProjectDocument.restore',
  'ProjectDocument.soft_delete',
  'ProjectDocument.update',
  'ProjectExternalAccess.create',
  'ProjectExternalAccess.grant',
  'ProjectExternalAccess.read',
  'ProjectExternalAccess.restore',
  'ProjectExternalAccess.revoke',
  'ProjectExternalAccess.soft_delete',
  'ProjectExternalAccess.update',
  'ProjectFinancialSnapshot.create',
  'ProjectFinancialSnapshot.export',
  'ProjectFinancialSnapshot.read',
  'ProjectInventoryTransaction.create',
  'ProjectInventoryTransaction.read',
  'ProjectInventoryTransaction.restore',
  'ProjectInventoryTransaction.soft_delete',
  'ProjectInventoryTransaction.update',
  'ProjectIssue.assign',
  'ProjectIssue.create',
  'ProjectIssue.read',
  'ProjectIssue.resolve',
  'ProjectIssue.restore',
  'ProjectIssue.soft_delete',
  'ProjectIssue.update',
  'ProjectLedgerEntry.create',
  'ProjectLedgerEntry.read',
  'ProjectLedgerEntry.restore',
  'ProjectLedgerEntry.soft_delete',
  'ProjectLedgerEntry.update',
  'ProjectLocation.create',
  'ProjectLocation.read',
  'ProjectLocation.restore',
  'ProjectLocation.soft_delete',
  'ProjectLocation.update',
  'ProjectMember.assign',
  'ProjectMember.create',
  'ProjectMember.read',
  'ProjectMember.restore',
  'ProjectMember.soft_delete',
  'ProjectMember.transfer',
  'ProjectMember.unassign',
  'ProjectMember.update',
  'ProjectNote.create',
  'ProjectNote.read',
  'ProjectNote.restore',
  'ProjectNote.soft_delete',
  'ProjectNote.update',
  'ProjectPhase.activate',
  'ProjectPhase.create',
  'ProjectPhase.deactivate',
  'ProjectPhase.read',
  'ProjectPhase.restore',
  'ProjectPhase.soft_delete',
  'ProjectPhase.update',
  'ProjectReport.create',
  'ProjectReport.export',
  'ProjectReport.read',
  'ProjectReport.restore',
  'ProjectReport.soft_delete',
  'ProjectReport.update',
  'ProjectRisk.assess',
  'ProjectRisk.create',
  'ProjectRisk.mitigate',
  'ProjectRisk.read',
  'ProjectRisk.restore',
  'ProjectRisk.soft_delete',
  'ProjectRisk.update',
  'ProjectTask.assign',
  'ProjectTask.create',
  'ProjectTask.read',
  'ProjectTask.restore',
  'ProjectTask.soft_delete',
  'ProjectTask.transfer',
  'ProjectTask.unassign',
  'ProjectTask.update',
  'ProjectTaskAssignment.assign',
  'ProjectTaskAssignment.create',
  'ProjectTaskAssignment.read',
  'ProjectTaskAssignment.restore',
  'ProjectTaskAssignment.soft_delete',
  'ProjectTaskAssignment.transfer',
  'ProjectTaskAssignment.unassign',
  'ProjectTaskAssignment.update',
  'ProjectTaskAttachment.create',
  'ProjectTaskAttachment.read',
  'ProjectTaskAttachment.restore',
  'ProjectTaskAttachment.soft_delete',
  'ProjectTaskAttachment.update',
  'ProjectTaskChecklistItem.complete',
  'ProjectTaskChecklistItem.create',
  'ProjectTaskChecklistItem.read',
  'ProjectTaskChecklistItem.restore',
  'ProjectTaskChecklistItem.soft_delete',
  'ProjectTaskChecklistItem.update',
  'ProjectTaskComment.create',
  'ProjectTaskComment.read',
  'ProjectTaskComment.restore',
  'ProjectTaskComment.soft_delete',
  'ProjectTaskComment.update',
  'ProjectTaskDependency.create',
  'ProjectTaskDependency.read',
  'ProjectTaskDependency.restore',
  'ProjectTaskDependency.soft_delete',
  'ProjectTaskDependency.update',
  'ProjectType.activate',
  'ProjectType.create',
  'ProjectType.deactivate',
  'ProjectType.read',
  'ProjectType.restore',
  'ProjectType.soft_delete',
  'ProjectType.update',
  'PunchList.create',
  'PunchList.read',
  'PunchList.restore',
  'PunchList.soft_delete',
  'PunchList.update',
  'PunchListItem.create',
  'PunchListItem.read',
  'PunchListItem.restore',
  'PunchListItem.soft_delete',
  'PunchListItem.update',
  'PurchaseOrder.approve',
  'PurchaseOrder.create',
  'PurchaseOrder.read',
  'PurchaseOrder.reject',
  'PurchaseOrder.restore',
  'PurchaseOrder.send',
  'PurchaseOrder.soft_delete',
  'PurchaseOrder.update',
  'PurchaseOrderApproval.approve',
  'PurchaseOrderApproval.create',
  'PurchaseOrderApproval.read',
  'PurchaseOrderApproval.reject',
  'PurchaseOrderLine.create',
  'PurchaseOrderLine.read',
  'PurchaseOrderLine.restore',
  'PurchaseOrderLine.soft_delete',
  'PurchaseOrderLine.update',
  'Quote.approve',
  'Quote.create',
  'Quote.hard_delete',
  'Quote.read',
  'Quote.reject',
  'Quote.restore',
  'Quote.send',
  'Quote.soft_delete',
  'Quote.update',
  'QuoteLineItem.create',
  'QuoteLineItem.read',
  'QuoteLineItem.restore',
  'QuoteLineItem.soft_delete',
  'QuoteLineItem.update',
  'RFI.create',
  'RFI.read',
  'RFI.restore',
  'RFI.send',
  'RFI.soft_delete',
  'RFI.update',
  'RFIReply.create',
  'RFIReply.read',
  'RFIReply.restore',
  'RFIReply.soft_delete',
  'RFIReply.update',
  'RFQLine.create',
  'RFQLine.read',
  'RFQLine.restore',
  'RFQLine.soft_delete',
  'RFQLine.update',
  'RFQResponse.create',
  'RFQResponse.read',
  'RFQResponse.restore',
  'RFQResponse.soft_delete',
  'RFQResponse.update',
  'RFQResponseLine.create',
  'RFQResponseLine.read',
  'RFQResponseLine.restore',
  'RFQResponseLine.soft_delete',
  'RFQResponseLine.update',
  'ReasonCode.create',
  'ReasonCode.read',
  'ReasonCode.restore',
  'ReasonCode.soft_delete',
  'ReasonCode.update',
  'Reconciliation.create',
  'Reconciliation.read',
  'Reconciliation.restore',
  'Reconciliation.soft_delete',
  'Reconciliation.update',
  'Refund.create',
  'Refund.read',
  'Refund.restore',
  'Refund.soft_delete',
  'Refund.update',
  'Region.create',
  'Region.read',
  'Region.restore',
  'Region.soft_delete',
  'Region.update',
  'Reimbursement.create',
  'Reimbursement.process',
  'Reimbursement.read',
  'Reimbursement.restore',
  'Reimbursement.soft_delete',
  'Reimbursement.update',
  'ReportDefinition.create',
  'ReportDefinition.read',
  'ReportDefinition.restore',
  'ReportDefinition.soft_delete',
  'ReportDefinition.update',
  'RequestForQuote.create',
  'RequestForQuote.read',
  'RequestForQuote.restore',
  'RequestForQuote.send',
  'RequestForQuote.soft_delete',
  'RequestForQuote.update',
  'ResourceAllocation.allocate',
  'ResourceAllocation.create',
  'ResourceAllocation.deallocate',
  'ResourceAllocation.read',
  'ResourceAllocation.restore',
  'ResourceAllocation.soft_delete',
  'ResourceAllocation.update',
  'ReturnReminder.create',
  'ReturnReminder.read',
  'ReturnReminder.send',
  'ReturnReminder.update',
  'ReturnReminderAttempt.create',
  'ReturnReminderAttempt.read',
  'RiskFactor.assess',
  'RiskFactor.create',
  'RiskFactor.read',
  'RiskFactor.restore',
  'RiskFactor.soft_delete',
  'RiskFactor.update',
  'Role.activate',
  'Role.create',
  'Role.deactivate',
  'Role.read',
  'Role.restore',
  'Role.soft_delete',
  'Role.update',
  'RolePermission.create',
  'RolePermission.read',
  'RolePermission.restore',
  'RolePermission.soft_delete',
  'Schedule',
  'Schedule.activate',
  'Schedule.create',
  'Schedule.deactivate',
  'Schedule.hard_delete',
  'Schedule.publish',
  'Schedule.read',
  'Schedule.restore',
  'Schedule.soft_delete',
  'Schedule.update',
  'ScheduleException.approve',
  'ScheduleException.create',
  'ScheduleException.read',
  'ScheduleException.reject',
  'ScheduleException.restore',
  'ScheduleException.soft_delete',
  'ScheduleException.update',
  'ScheduleRisk.create',
  'ScheduleRisk.read',
  'ScheduleRisk.restore',
  'ScheduleRisk.soft_delete',
  'ScheduleRisk.update',
  'StateProvince.create',
  'StateProvince.read',
  'StateProvince.restore',
  'StateProvince.soft_delete',
  'StateProvince.update',
  'Submittal.create',
  'Submittal.read',
  'Submittal.restore',
  'Submittal.soft_delete',
  'Submittal.update',
  'SubmittalApproval.approve',
  'SubmittalApproval.create',
  'SubmittalApproval.read',
  'SubmittalApproval.reject',
  'SubmittalItem.create',
  'SubmittalItem.read',
  'SubmittalItem.restore',
  'SubmittalItem.soft_delete',
  'SubmittalItem.update',
  'SyncJob.create',
  'SyncJob.read',
  'SyncJob.restore',
  'SyncJob.soft_delete',
  'SyncJob.update',
  'SyncLog.create',
  'SyncLog.read',
  'SyncLog.restore',
  'SyncLog.soft_delete',
  'SyncLog.update',
  'SyncState.create',
  'SyncState.read',
  'SyncState.restore',
  'SyncState.soft_delete',
  'SyncState.update',
  'SystemLog.create',
  'SystemLog.read',
  'SystemLog.restore',
  'SystemLog.soft_delete',
  'SystemLog.update',
  'Task.activate',
  'Task.assign',
  'Task.create',
  'Task.deactivate',
  'Task.duplicate',
  'Task.hard_delete',
  'Task.read',
  'Task.restore',
  'Task.soft_delete',
  'Task.transfer',
  'Task.unassign',
  'Task.update',
  'TaskAssignment.assign',
  'TaskAssignment.create',
  'TaskAssignment.read',
  'TaskAssignment.restore',
  'TaskAssignment.soft_delete',
  'TaskAssignment.transfer',
  'TaskAssignment.unassign',
  'TaskAssignment.update',
  'TaskAttachment.create',
  'TaskAttachment.read',
  'TaskAttachment.restore',
  'TaskAttachment.soft_delete',
  'TaskAttachment.update',
  'TaskChecklistItem.create',
  'TaskChecklistItem.read',
  'TaskChecklistItem.restore',
  'TaskChecklistItem.soft_delete',
  'TaskChecklistItem.update',
  'TaskDependency.create',
  'TaskDependency.read',
  'TaskDependency.restore',
  'TaskDependency.soft_delete',
  'TaskDependency.update',
  'Tenant.deactivate',
  'Tenant.read',
  'Tenant.update',
  'TenantAuditLog.export',
  'TenantAuditLog.read',
  'TenantFeatureFlag.activate',
  'TenantFeatureFlag.create',
  'TenantFeatureFlag.deactivate',
  'TenantFeatureFlag.read',
  'TenantFeatureFlag.update',
  'TenantMetrics.export',
  'TenantMetrics.read',
  'TenantPriceList.activate',
  'TenantPriceList.create',
  'TenantPriceList.deactivate',
  'TenantPriceList.read',
  'TenantPriceList.update',
  'TenantPriceOverride.create',
  'TenantPriceOverride.read',
  'TenantPriceOverride.restore',
  'TenantPriceOverride.soft_delete',
  'TenantPriceOverride.update',
  'TenantSettings.activate',
  'TenantSettings.deactivate',
  'TenantSettings.read',
  'TenantSettings.update',
  'TenantUsageRecord.export',
  'TenantUsageRecord.read',
  'TermsTemplate.create',
  'TermsTemplate.hard_delete',
  'TermsTemplate.read',
  'TermsTemplate.restore',
  'TermsTemplate.soft_delete',
  'TermsTemplate.update',
  'Timesheet.approve',
  'Timesheet.create',
  'Timesheet.read',
  'Timesheet.reject',
  'Timesheet.restore',
  'Timesheet.soft_delete',
  'Timesheet.submit',
  'Timesheet.update',
  'TimesheetApproval.approve',
  'TimesheetApproval.create',
  'TimesheetApproval.read',
  'TimesheetApproval.reject',
  'TimesheetEntry.create',
  'TimesheetEntry.read',
  'TimesheetEntry.restore',
  'TimesheetEntry.soft_delete',
  'TimesheetEntry.update',
  'TrainingEnrollment.approve',
  'TrainingEnrollment.create',
  'TrainingEnrollment.read',
  'TrainingEnrollment.reject',
  'TrainingEnrollment.restore',
  'TrainingEnrollment.soft_delete',
  'TrainingEnrollment.update',
  'UnitOfMeasure.create',
  'UnitOfMeasure.read',
  'UnitOfMeasure.restore',
  'UnitOfMeasure.soft_delete',
  'UnitOfMeasure.update',
  'User.activate',
  'User.create',
  'User.deactivate',
  'User.lock',
  'User.read',
  'User.restore',
  'User.soft_delete',
  'User.unlock',
  'User.update',
  'Vendor.activate',
  'Vendor.assign',
  'Vendor.create',
  'Vendor.deactivate',
  'Vendor.hard_delete',
  'Vendor.read',
  'Vendor.restore',
  'Vendor.soft_delete',
  'Vendor.unassign',
  'Vendor.update',
  'VendorContact.create',
  'VendorContact.read',
  'VendorContact.restore',
  'VendorContact.soft_delete',
  'VendorContact.update',
  'VendorDocument.create',
  'VendorDocument.read',
  'VendorDocument.restore',
  'VendorDocument.soft_delete',
  'VendorDocument.update',
  'WBSItem.create',
  'WBSItem.read',
  'WBSItem.restore',
  'WBSItem.soft_delete',
  'WBSItem.update',
  'Webhook.activate',
  'Webhook.create',
  'Webhook.deactivate',
  'Webhook.read',
  'Webhook.restore',
  'Webhook.soft_delete',
  'Webhook.update',
  'WebhookDelivery.create',
  'WebhookDelivery.read',
  'WebhookDelivery.restore',
  'WebhookDelivery.soft_delete',
  'WebhookDelivery.update',
  'WebhookEndpoint.create',
  'WebhookEndpoint.read',
  'WebhookEndpoint.restore',
  'WebhookEndpoint.soft_delete',
  'WebhookEndpoint.update',
  'WebhookEvent.create',
  'WebhookEvent.read',
  'WebhookEvent.restore',
  'WebhookEvent.soft_delete',
  'WebhookEvent.update',
  'WebhookLog.create',
  'WebhookLog.read',
  'WebhookLog.restore',
  'WebhookLog.soft_delete',
  'WebhookLog.update',
  'WorkType.create',
  'WorkType.read',
  'WorkType.restore',
  'WorkType.soft_delete',
  'WorkType.update',
  'Worker.activate',
  'Worker.create',
  'Worker.deactivate',
  'Worker.read',
  'Worker.restore',
  'Worker.soft_delete',
  'Worker.update',
  'weather_alert_deliveries.create',
  'weather_alert_deliveries.read',
  'weather_alert_deliveries.update',
  'weather_alerts.activate',
  'weather_alerts.create',
  'weather_alerts.deactivate',
  'weather_alerts.read',
  'weather_alerts.update',
  'weather_forecast_cache.create',
  'weather_forecast_cache.read',
  'weather_forecast_cache.update',
  'weather_incidents.create',
  'weather_incidents.read',
  'weather_incidents.resolve',
  'weather_incidents.update',
  'weather_providers.activate',
  'weather_providers.create',
  'weather_providers.deactivate',
  'weather_providers.read',
  'weather_providers.update',
  'weather_risk_factors.activate',
  'weather_risk_factors.create',
  'weather_risk_factors.deactivate',
  'weather_risk_factors.read',
  'weather_risk_factors.update',
  'weather_watches.create',
  'weather_watches.read',
  'weather_watches.update'
] as const;


/**
 * Domain Types
 * Generated from RBAC.schema.v7.yml
 */
export type Domain = 
  | 'tenant_management'
  | 'identity_access'
  | 'rbac_security'
  | 'crm_sales'
  | 'project_management'
  | 'task_execution'
  | 'financial_operations'
  | 'time_scheduling'
  | 'inventory_assets'
  | 'communication'
  | 'document_management'
  | 'hr_employment'
  | 'ai_automation'
  | 'vendor_contract'
  | 'integrations_webhooks'
  | 'system_config'
  | 'audit_compliance'
  | 'data_export_reporting'
  | 'approval_workflows';

export const DOMAINS: Domain[] = [
  'tenant_management',
  'identity_access',
  'rbac_security',
  'crm_sales',
  'project_management',
  'task_execution',
  'financial_operations',
  'time_scheduling',
  'inventory_assets',
  'communication',
  'document_management',
  'hr_employment',
  'ai_automation',
  'vendor_contract',
  'integrations_webhooks',
  'system_config',
  'audit_compliance',
  'data_export_reporting',
  'approval_workflows'
] as const;


/**
 * Action Types
 * Generated from RBAC.schema.v7.yml
 */
export type Action = 
  | 'read'
  | 'list'
  | 'export'
  | 'create'
  | 'update'
  | 'duplicate'
  | 'soft_delete'
  | 'restore'
  | 'hard_delete'
  | 'archive'
  | 'activate'
  | 'deactivate'
  | 'assign'
  | 'unassign'
  | 'transfer'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'review'
  | 'send'
  | 'publish'
  | 'lock'
  | 'unlock'
  | 'sync';

export const ACTIONS: Action[] = [
  'read',
  'list',
  'export',
  'create',
  'update',
  'duplicate',
  'soft_delete',
  'restore',
  'hard_delete',
  'archive',
  'activate',
  'deactivate',
  'assign',
  'unassign',
  'transfer',
  'submit',
  'approve',
  'reject',
  'review',
  'send',
  'publish',
  'lock',
  'unlock',
  'sync'
] as const;


/**
 * Role Permission Mappings
 * Generated from RBAC.schema.v7.yml
 */
export const ROLE_PERMISSIONS: Record<RoleCode, Permission[]> = {
  'ADMIN': [
    'Tenant.read',
    'Tenant.update',
    'Tenant.deactivate',
    'TenantSettings.read',
    'TenantSettings.update',
    'TenantSettings.activate',
    'TenantSettings.deactivate',
    'TenantMetrics.read',
    'TenantMetrics.export',
    'TenantFeatureFlag.read',
    'TenantFeatureFlag.create',
    'TenantFeatureFlag.update',
    'TenantFeatureFlag.activate',
    'TenantFeatureFlag.deactivate',
    'TenantUsageRecord.read',
    'TenantUsageRecord.export',
    'TenantPriceList.read',
    'TenantPriceList.create',
    'TenantPriceList.update',
    'TenantPriceList.activate',
    'TenantPriceList.deactivate',
    'TenantPriceOverride.read',
    'TenantPriceOverride.create',
    'TenantPriceOverride.update',
    'TenantPriceOverride.soft_delete',
    'TenantPriceOverride.restore',
    'User.read',
    'User.create',
    'User.update',
    'User.soft_delete',
    'User.restore',
    'User.activate',
    'User.deactivate',
    'User.lock',
    'User.unlock',
    'Member.read',
    'Member.create',
    'Member.update',
    'Member.soft_delete',
    'Member.restore',
    'Member.assign',
    'Member.unassign',
    'Member.transfer',
    'Member.activate',
    'Member.deactivate',
    'MemberRole.read',
    'MemberRole.create',
    'MemberRole.update',
    'MemberRole.soft_delete',
    'MemberRole.restore',
    'MemberRole.assign',
    'MemberRole.unassign',
    'MemberRole.transfer',
    'MemberSettings.read',
    'MemberSettings.update',
    'MemberSettings.activate',
    'MemberSettings.deactivate',
    'MemberDocument.read',
    'MemberDocument.create',
    'MemberDocument.update',
    'MemberDocument.soft_delete',
    'MemberDocument.restore',
    'MemberDocument.approve',
    'MemberDocument.reject',
    'Role.read',
    'Role.create',
    'Role.update',
    'Role.soft_delete',
    'Role.restore',
    'Role.activate',
    'Role.deactivate',
    'Permission.read',
    'RolePermission.read',
    'RolePermission.create',
    'RolePermission.soft_delete',
    'RolePermission.restore',
    'ApiKey.read',
    'ApiKey.create',
    'ApiKey.update',
    'ApiKey.soft_delete',
    'ApiKey.restore',
    'ApiKey.activate',
    'ApiKey.deactivate',
    'AuthFactor.read',
    'AuthFactor.create',
    'AuthFactor.update',
    'AuthFactor.soft_delete',
    'AuthFactor.restore',
    'AuthFactor.activate',
    'AuthFactor.deactivate',
    'Account.read',
    'Account.create',
    'Account.update',
    'Account.soft_delete',
    'Account.restore',
    'Account.activate',
    'Account.deactivate',
    'AccountAddress.read',
    'AccountAddress.create',
    'AccountAddress.update',
    'AccountAddress.soft_delete',
    'AccountAddress.restore',
    'Contact.read',
    'Contact.create',
    'Contact.update',
    'Contact.soft_delete',
    'Contact.restore',
    'Lead.read',
    'Lead.create',
    'Lead.update',
    'Lead.soft_delete',
    'Lead.restore',
    'Lead.assign',
    'Lead.unassign',
    'Lead.transfer',
    'LeadActivity.read',
    'LeadActivity.create',
    'LeadActivity.update',
    'LeadActivity.soft_delete',
    'LeadActivity.restore',
    'Opportunity.read',
    'Opportunity.create',
    'Opportunity.update',
    'Opportunity.soft_delete',
    'Opportunity.restore',
    'Opportunity.assign',
    'Opportunity.unassign',
    'Opportunity.transfer',
    'OpportunityStage.read',
    'OpportunityStage.create',
    'OpportunityStage.update',
    'OpportunityStage.soft_delete',
    'OpportunityStage.restore',
    'OpportunityLineItem.read',
    'OpportunityLineItem.create',
    'OpportunityLineItem.update',
    'OpportunityLineItem.soft_delete',
    'OpportunityLineItem.restore',
    'Quote.read',
    'Quote.create',
    'Quote.update',
    'Quote.soft_delete',
    'Quote.restore',
    'Quote.send',
    'Quote.approve',
    'Quote.reject',
    'QuoteLineItem.read',
    'QuoteLineItem.create',
    'QuoteLineItem.update',
    'QuoteLineItem.soft_delete',
    'QuoteLineItem.restore',
    'Estimate.read',
    'Estimate.create',
    'Estimate.update',
    'Estimate.soft_delete',
    'Estimate.restore',
    'Estimate.send',
    'Estimate.approve',
    'Estimate.reject',
    'EstimateLineItem.read',
    'EstimateLineItem.create',
    'EstimateLineItem.update',
    'EstimateLineItem.soft_delete',
    'EstimateLineItem.restore',
    'EstimateAttachment.read',
    'EstimateAttachment.create',
    'EstimateAttachment.update',
    'EstimateAttachment.soft_delete',
    'EstimateAttachment.restore',
    'EstimateApproval.read',
    'EstimateApproval.create',
    'EstimateApproval.approve',
    'EstimateApproval.reject',
    'RequestForQuote.read',
    'RequestForQuote.create',
    'RequestForQuote.update',
    'RequestForQuote.soft_delete',
    'RequestForQuote.restore',
    'RequestForQuote.send',
    'RFQLine.read',
    'RFQLine.create',
    'RFQLine.update',
    'RFQLine.soft_delete',
    'RFQLine.restore',
    'RFQResponse.read',
    'RFQResponse.create',
    'RFQResponse.update',
    'RFQResponse.soft_delete',
    'RFQResponse.restore',
    'Bid.read',
    'Bid.create',
    'Bid.update',
    'Bid.soft_delete',
    'Bid.restore',
    'Bid.submit',
    'Bid.approve',
    'Bid.reject',
    'BidComparison.read',
    'BidComparison.create',
    'BidComparison.update',
    'BidComparison.soft_delete',
    'BidComparison.restore',
    'BidInvitation.read',
    'BidInvitation.create',
    'BidInvitation.update',
    'BidInvitation.send',
    'BidInvitation.soft_delete',
    'BidInvitation.restore',
    'BidSubmission.read',
    'BidSubmission.create',
    'BidSubmission.update',
    'BidSubmission.submit',
    'BidSubmission.approve',
    'BidSubmission.reject',
    'Project.read',
    'Project.create',
    'Project.update',
    'Project.soft_delete',
    'Project.restore',
    'Project.hard_delete',
    'Project.archive',
    'Project.activate',
    'Project.deactivate',
    'Project.duplicate',
    'Project.transfer',
    'ProjectTaskAssignment.read',
    'ProjectTaskAssignment.create',
    'ProjectTaskAssignment.update',
    'ProjectTaskAssignment.soft_delete',
    'ProjectTaskAssignment.restore',
    'ProjectTaskAssignment.assign',
    'ProjectTaskAssignment.unassign',
    'ProjectTaskAssignment.transfer',
    'ProjectMember.read',
    'ProjectMember.create',
    'ProjectMember.update',
    'ProjectMember.soft_delete',
    'ProjectMember.restore',
    'ProjectMember.assign',
    'ProjectMember.unassign',
    'ProjectMember.transfer',
    'ProjectNote.read',
    'ProjectNote.create',
    'ProjectNote.update',
    'ProjectNote.soft_delete',
    'ProjectNote.restore',
    'ProjectReport.read',
    'ProjectReport.create',
    'ProjectReport.update',
    'ProjectReport.soft_delete',
    'ProjectReport.restore',
    'ProjectReport.export',
    'ProjectBudgetLine.read',
    'ProjectBudgetLine.create',
    'ProjectBudgetLine.update',
    'ProjectBudgetLine.soft_delete',
    'ProjectBudgetLine.restore',
    'ProjectFinancialSnapshot.read',
    'ProjectFinancialSnapshot.create',
    'ProjectFinancialSnapshot.export',
    'ProjectInventoryTransaction.read',
    'ProjectInventoryTransaction.create',
    'ProjectInventoryTransaction.update',
    'ProjectInventoryTransaction.soft_delete',
    'ProjectInventoryTransaction.restore',
    'ProjectPhase.read',
    'ProjectPhase.create',
    'ProjectPhase.update',
    'ProjectPhase.soft_delete',
    'ProjectPhase.restore',
    'ProjectPhase.activate',
    'ProjectPhase.deactivate',
    'WBSItem.read',
    'WBSItem.create',
    'WBSItem.update',
    'WBSItem.soft_delete',
    'WBSItem.restore',
    'ProjectLocation.read',
    'ProjectLocation.create',
    'ProjectLocation.update',
    'ProjectLocation.soft_delete',
    'ProjectLocation.restore',
    'ProjectTask.read',
    'ProjectTask.create',
    'ProjectTask.update',
    'ProjectTask.soft_delete',
    'ProjectTask.restore',
    'ProjectTask.assign',
    'ProjectTask.unassign',
    'ProjectTask.transfer',
    'ProjectTaskDependency.read',
    'ProjectTaskDependency.create',
    'ProjectTaskDependency.update',
    'ProjectTaskDependency.soft_delete',
    'ProjectTaskDependency.restore',
    'ProjectTaskAttachment.read',
    'ProjectTaskAttachment.create',
    'ProjectTaskAttachment.update',
    'ProjectTaskAttachment.soft_delete',
    'ProjectTaskAttachment.restore',
    'ProjectTaskComment.read',
    'ProjectTaskComment.create',
    'ProjectTaskComment.update',
    'ProjectTaskComment.soft_delete',
    'ProjectTaskComment.restore',
    'ChangeOrder.read',
    'ChangeOrder.create',
    'ChangeOrder.update',
    'ChangeOrder.soft_delete',
    'ChangeOrder.restore',
    'ChangeOrder.approve',
    'ChangeOrder.reject',
    'ChangeOrderLine.read',
    'ChangeOrderLine.create',
    'ChangeOrderLine.update',
    'ChangeOrderLine.soft_delete',
    'ChangeOrderLine.restore',
    'ChangeOrderApproval.read',
    'ChangeOrderApproval.create',
    'ChangeOrderApproval.approve',
    'ChangeOrderApproval.reject',
    'ChangeOrderDocument.read',
    'ChangeOrderDocument.create',
    'ChangeOrderDocument.update',
    'ChangeOrderDocument.soft_delete',
    'ChangeOrderDocument.restore',
    'RFI.read',
    'RFI.create',
    'RFI.update',
    'RFI.soft_delete',
    'RFI.restore',
    'RFI.send',
    'RFIReply.read',
    'RFIReply.create',
    'RFIReply.update',
    'RFIReply.soft_delete',
    'RFIReply.restore',
    'Submittal.read',
    'Submittal.create',
    'Submittal.update',
    'Submittal.soft_delete',
    'Submittal.restore',
    'SubmittalItem.read',
    'SubmittalItem.create',
    'SubmittalItem.update',
    'SubmittalItem.soft_delete',
    'SubmittalItem.restore',
    'SubmittalApproval.read',
    'SubmittalApproval.create',
    'SubmittalApproval.approve',
    'SubmittalApproval.reject',
    'Inspection.read',
    'Inspection.create',
    'Inspection.update',
    'Inspection.soft_delete',
    'Inspection.restore',
    'InspectionItem.read',
    'InspectionItem.create',
    'InspectionItem.update',
    'InspectionItem.soft_delete',
    'InspectionItem.restore',
    'InspectionApproval.read',
    'InspectionApproval.create',
    'InspectionApproval.approve',
    'InspectionApproval.reject',
    'DailyLog.read',
    'DailyLog.create',
    'DailyLog.update',
    'DailyLog.soft_delete',
    'DailyLog.restore',
    'PunchList.read',
    'PunchList.create',
    'PunchList.update',
    'PunchList.soft_delete',
    'PunchList.restore',
    'PunchListItem.read',
    'PunchListItem.create',
    'PunchListItem.update',
    'PunchListItem.soft_delete',
    'PunchListItem.restore',
    'Activity.read',
    'Activity.create',
    'Activity.update',
    'Activity.soft_delete',
    'Activity.restore',
    'ActivityAttachment.read',
    'ActivityAttachment.create',
    'ActivityAttachment.update',
    'ActivityAttachment.soft_delete',
    'ActivityAttachment.restore',
    'Milestone.read',
    'Milestone.create',
    'Milestone.update',
    'Milestone.soft_delete',
    'Milestone.restore',
    'MilestoneDependency.read',
    'MilestoneDependency.create',
    'MilestoneDependency.update',
    'MilestoneDependency.soft_delete',
    'MilestoneDependency.restore',
    'MilestoneStakeholder.read',
    'MilestoneStakeholder.create',
    'MilestoneStakeholder.update',
    'MilestoneStakeholder.soft_delete',
    'MilestoneStakeholder.restore',
    'ProjectDocument.read',
    'ProjectDocument.create',
    'ProjectDocument.update',
    'ProjectDocument.soft_delete',
    'ProjectDocument.restore',
    'ProjectExternalAccess.read',
    'ProjectExternalAccess.create',
    'ProjectExternalAccess.update',
    'ProjectExternalAccess.soft_delete',
    'ProjectExternalAccess.restore',
    'ProjectExternalAccess.grant',
    'ProjectExternalAccess.revoke',
    'ProjectIssue.read',
    'ProjectIssue.create',
    'ProjectIssue.update',
    'ProjectIssue.soft_delete',
    'ProjectIssue.restore',
    'ProjectIssue.assign',
    'ProjectIssue.resolve',
    'ProjectLedgerEntry.read',
    'ProjectLedgerEntry.create',
    'ProjectLedgerEntry.update',
    'ProjectLedgerEntry.soft_delete',
    'ProjectLedgerEntry.restore',
    'ProjectRisk.read',
    'ProjectRisk.create',
    'ProjectRisk.update',
    'ProjectRisk.soft_delete',
    'ProjectRisk.restore',
    'ProjectRisk.assess',
    'ProjectRisk.mitigate',
    'ProjectTaskChecklistItem.read',
    'ProjectTaskChecklistItem.create',
    'ProjectTaskChecklistItem.update',
    'ProjectTaskChecklistItem.soft_delete',
    'ProjectTaskChecklistItem.restore',
    'ProjectTaskChecklistItem.complete',
    'ProjectType.read',
    'ProjectType.create',
    'ProjectType.update',
    'ProjectType.soft_delete',
    'ProjectType.restore',
    'ProjectType.activate',
    'ProjectType.deactivate',
    'Task.read',
    'Task.create',
    'Task.update',
    'Task.soft_delete',
    'Task.restore',
    'Task.hard_delete',
    'Task.assign',
    'Task.unassign',
    'Task.transfer',
    'Task.activate',
    'Task.deactivate',
    'Task.duplicate',
    'TaskAssignment.read',
    'TaskAssignment.create',
    'TaskAssignment.update',
    'TaskAssignment.soft_delete',
    'TaskAssignment.restore',
    'TaskAssignment.assign',
    'TaskAssignment.unassign',
    'TaskAssignment.transfer',
    'TaskDependency.read',
    'TaskDependency.create',
    'TaskDependency.update',
    'TaskDependency.soft_delete',
    'TaskDependency.restore',
    'TaskAttachment.read',
    'TaskAttachment.create',
    'TaskAttachment.update',
    'TaskAttachment.soft_delete',
    'TaskAttachment.restore',
    'TaskChecklistItem.read',
    'TaskChecklistItem.create',
    'TaskChecklistItem.update',
    'TaskChecklistItem.soft_delete',
    'TaskChecklistItem.restore',
    'Invoice.read',
    'Invoice.create',
    'Invoice.update',
    'Invoice.soft_delete',
    'Invoice.restore',
    'Invoice.hard_delete',
    'Invoice.send',
    'Invoice.duplicate',
    'Invoice.export',
    'Invoice.approve',
    'Invoice.reject',
    'InvoiceLineItem.read',
    'InvoiceLineItem.create',
    'InvoiceLineItem.update',
    'InvoiceLineItem.soft_delete',
    'InvoiceLineItem.restore',
    'InvoiceAttachment.read',
    'InvoiceAttachment.create',
    'InvoiceAttachment.update',
    'InvoiceAttachment.soft_delete',
    'InvoiceAttachment.restore',
    'InvoiceTax.read',
    'InvoiceTax.create',
    'InvoiceTax.update',
    'InvoiceTax.soft_delete',
    'InvoiceTax.restore',
    'Payment.read',
    'Payment.create',
    'Payment.update',
    'Payment.soft_delete',
    'Payment.restore',
    'Payment.export',
    'PaymentSchedule.read',
    'PaymentSchedule.create',
    'PaymentSchedule.update',
    'PaymentSchedule.soft_delete',
    'PaymentSchedule.restore',
    'APBill.read',
    'APBill.create',
    'APBill.update',
    'APBill.soft_delete',
    'APBill.restore',
    'APBill.approve',
    'APBill.reject',
    'APBillLine.read',
    'APBillLine.create',
    'APBillLine.update',
    'APBillLine.soft_delete',
    'APBillLine.restore',
    'BillApproval.read',
    'BillApproval.create',
    'BillApproval.approve',
    'BillApproval.reject',
    'BillPayment.read',
    'BillPayment.create',
    'BillPayment.update',
    'BillPayment.soft_delete',
    'BillPayment.restore',
    'Expense.read',
    'Expense.create',
    'Expense.update',
    'Expense.soft_delete',
    'Expense.restore',
    'Expense.approve',
    'Expense.reject',
    'Expense.export',
    'ExpenseLine.read',
    'ExpenseLine.create',
    'ExpenseLine.update',
    'ExpenseLine.soft_delete',
    'ExpenseLine.restore',
    'ExpenseApproval.read',
    'ExpenseApproval.create',
    'ExpenseApproval.approve',
    'ExpenseApproval.reject',
    'ExpenseReceipt.read',
    'ExpenseReceipt.create',
    'ExpenseReceipt.update',
    'ExpenseReceipt.soft_delete',
    'ExpenseReceipt.restore',
    'CreditMemo.read',
    'CreditMemo.create',
    'CreditMemo.update',
    'CreditMemo.soft_delete',
    'CreditMemo.restore',
    'CreditMemoLine.read',
    'CreditMemoLine.create',
    'CreditMemoLine.update',
    'CreditMemoLine.soft_delete',
    'CreditMemoLine.restore',
    'PurchaseOrder.read',
    'PurchaseOrder.create',
    'PurchaseOrder.update',
    'PurchaseOrder.soft_delete',
    'PurchaseOrder.restore',
    'PurchaseOrder.send',
    'PurchaseOrder.approve',
    'PurchaseOrder.reject',
    'PurchaseOrderLine.read',
    'PurchaseOrderLine.create',
    'PurchaseOrderLine.update',
    'PurchaseOrderLine.soft_delete',
    'PurchaseOrderLine.restore',
    'PurchaseOrderApproval.read',
    'PurchaseOrderApproval.create',
    'PurchaseOrderApproval.approve',
    'PurchaseOrderApproval.reject',
    'GLAccount.read',
    'GLAccount.create',
    'GLAccount.update',
    'GLAccount.soft_delete',
    'GLAccount.restore',
    'GLAccount.activate',
    'GLAccount.deactivate',
    'JournalEntry.read',
    'JournalEntry.create',
    'JournalEntry.update',
    'JournalEntry.soft_delete',
    'JournalEntry.restore',
    'JournalLine.read',
    'JournalLine.create',
    'JournalLine.update',
    'JournalLine.soft_delete',
    'JournalLine.restore',
    'BankAccount.read',
    'BankAccount.create',
    'BankAccount.update',
    'BankAccount.soft_delete',
    'BankAccount.restore',
    'BankAccount.activate',
    'BankAccount.deactivate',
    'BankStatementLine.read',
    'BankStatementLine.create',
    'BankStatementLine.update',
    'BankStatementLine.soft_delete',
    'BankStatementLine.restore',
    'Reconciliation.read',
    'Reconciliation.create',
    'Reconciliation.update',
    'Reconciliation.soft_delete',
    'Reconciliation.restore',
    'PayrollRun.read',
    'PayrollRun.create',
    'PayrollRun.update',
    'PayrollRun.soft_delete',
    'PayrollRun.restore',
    'PayrollRun.approve',
    'PayrollRun.reject',
    'PayrollItem.read',
    'PayrollItem.create',
    'PayrollItem.update',
    'PayrollItem.soft_delete',
    'PayrollItem.restore',
    'PayrollAdjustment.read',
    'PayrollAdjustment.create',
    'PayrollAdjustment.update',
    'PayrollAdjustment.soft_delete',
    'PayrollAdjustment.restore',
    'PayrollPayment.read',
    'PayrollPayment.create',
    'PayrollPayment.update',
    'PayrollPayment.soft_delete',
    'PayrollPayment.restore',
    'PayrollTax.read',
    'PayrollTax.create',
    'PayrollTax.update',
    'PayrollTax.soft_delete',
    'PayrollTax.restore',
    'InvoicePayment.read',
    'InvoicePayment.create',
    'InvoicePayment.update',
    'InvoicePayment.soft_delete',
    'InvoicePayment.restore',
    'PaymentApplication.read',
    'PaymentApplication.create',
    'PaymentApplication.update',
    'PaymentApplication.soft_delete',
    'PaymentApplication.restore',
    'PaymentGateway.read',
    'PaymentGateway.create',
    'PaymentGateway.update',
    'PaymentGateway.soft_delete',
    'PaymentGateway.restore',
    'PaymentGateway.activate',
    'PaymentGateway.deactivate',
    'PaymentMethod.read',
    'PaymentMethod.create',
    'PaymentMethod.update',
    'PaymentMethod.soft_delete',
    'PaymentMethod.restore',
    'PaymentMethodToken.read',
    'PaymentMethodToken.create',
    'PaymentMethodToken.update',
    'PaymentMethodToken.soft_delete',
    'PaymentMethodToken.restore',
    'PaymentTerm.read',
    'PaymentTerm.create',
    'PaymentTerm.update',
    'PaymentTerm.soft_delete',
    'PaymentTerm.restore',
    'FraudPolicy.read',
    'FraudPolicy.create',
    'FraudPolicy.update',
    'FraudPolicy.soft_delete',
    'FraudPolicy.restore',
    'FraudPolicy.activate',
    'FraudPolicy.deactivate',
    'FraudPolicyRule.read',
    'FraudPolicyRule.create',
    'FraudPolicyRule.update',
    'FraudPolicyRule.soft_delete',
    'FraudPolicyRule.restore',
    'FraudPolicyScope.read',
    'FraudPolicyScope.create',
    'FraudPolicyScope.update',
    'FraudPolicyScope.soft_delete',
    'FraudPolicyScope.restore',
    'CurrencyRate.read',
    'CurrencyRate.create',
    'CurrencyRate.update',
    'ForecastLine.read',
    'ForecastLine.create',
    'ForecastLine.update',
    'ForecastLine.soft_delete',
    'ForecastLine.restore',
    'ForecastSnapshot.read',
    'ForecastSnapshot.create',
    'ForecastSnapshot.export',
    'Chargeback.read',
    'Chargeback.create',
    'Chargeback.update',
    'Chargeback.soft_delete',
    'Chargeback.restore',
    'ChargebackEvidence.read',
    'ChargebackEvidence.create',
    'ChargebackEvidence.update',
    'ChargebackEvidence.soft_delete',
    'ChargebackEvidence.restore',
    'Refund.read',
    'Refund.create',
    'Refund.update',
    'Refund.soft_delete',
    'Refund.restore',
    'Payout.read',
    'Payout.create',
    'Payout.update',
    'Payout.soft_delete',
    'Payout.restore',
    'ExpenseReport.read',
    'ExpenseReport.create',
    'ExpenseReport.update',
    'ExpenseReport.soft_delete',
    'ExpenseReport.restore',
    'ExpenseReport.submit',
    'ExpenseReport.approve',
    'ExpenseReport.reject',
    'Reimbursement.read',
    'Reimbursement.create',
    'Reimbursement.update',
    'Reimbursement.soft_delete',
    'Reimbursement.restore',
    'Reimbursement.process',
    'DunningNotice.read',
    'DunningNotice.create',
    'DunningNotice.update',
    'DunningNotice.send',
    'ReturnReminder.read',
    'ReturnReminder.create',
    'ReturnReminder.update',
    'ReturnReminder.send',
    'ReturnReminderAttempt.read',
    'ReturnReminderAttempt.create',
    'ClockInClockOut.read',
    'ClockInClockOut.create',
    'ClockInClockOut.update',
    'ClockInClockOut.soft_delete',
    'ClockInClockOut.restore',
    'ClockInClockOut.approve',
    'ClockInClockOut.reject',
    'ClockInClockOut.export',
    'Schedule.read',
    'Schedule.create',
    'Schedule.update',
    'Schedule.soft_delete',
    'Schedule.restore',
    'Schedule.publish',
    'Schedule.activate',
    'Schedule.deactivate',
    'ScheduleException.read',
    'ScheduleException.create',
    'ScheduleException.update',
    'Schedule',
    'ScheduleException.soft_delete',
    'ScheduleException.restore',
    'Leave.read',
    'Leave.create',
    'Leave.update',
    'Leave.soft_delete',
    'Leave.restore',
    'Leave.approve',
    'Leave.reject',
    'Timesheet.read',
    'Timesheet.create',
    'Timesheet.update',
    'Timesheet.soft_delete',
    'Timesheet.restore',
    'Timesheet.submit',
    'Timesheet.approve',
    'Timesheet.reject',
    'TimesheetEntry.read',
    'TimesheetEntry.create',
    'TimesheetEntry.update',
    'TimesheetEntry.soft_delete',
    'TimesheetEntry.restore',
    'TimesheetApproval.read',
    'TimesheetApproval.create',
    'TimesheetApproval.approve',
    'TimesheetApproval.reject',
    'LeaveOfAbsence.read',
    'LeaveOfAbsence.create',
    'LeaveOfAbsence.update',
    'LeaveOfAbsence.soft_delete',
    'LeaveOfAbsence.restore',
    'LeaveOfAbsence.approve',
    'LeaveOfAbsence.reject',
    'AbsenceBalance.read',
    'AbsenceBalance.create',
    'AbsenceBalance.update',
    'AbsenceBalance.soft_delete',
    'AbsenceBalance.restore',
    'HolidayCalendar.read',
    'HolidayCalendar.create',
    'HolidayCalendar.update',
    'HolidayCalendar.soft_delete',
    'HolidayCalendar.restore',
    'OvertimeRule.read',
    'OvertimeRule.create',
    'OvertimeRule.update',
    'OvertimeRule.soft_delete',
    'OvertimeRule.restore',
    'OvertimeRule.activate',
    'OvertimeRule.deactivate',
    'PayCalendar.read',
    'PayCalendar.create',
    'PayCalendar.update',
    'PayCalendar.soft_delete',
    'PayCalendar.restore',
    'PayGroup.read',
    'PayGroup.create',
    'PayGroup.update',
    'PayGroup.soft_delete',
    'PayGroup.restore',
    'PayGroupAssignment.read',
    'PayGroupAssignment.create',
    'PayGroupAssignment.update',
    'PayGroupAssignment.assign',
    'PayGroupAssignment.unassign',
    'InventoryItem.read',
    'InventoryItem.create',
    'InventoryItem.update',
    'InventoryItem.soft_delete',
    'InventoryItem.restore',
    'InventoryItem.assign',
    'InventoryItem.unassign',
    'InventoryItem.transfer',
    'InventoryItem.activate',
    'InventoryItem.deactivate',
    'InventoryTransaction.read',
    'InventoryTransaction.create',
    'InventoryTransaction.update',
    'InventoryTransaction.soft_delete',
    'InventoryTransaction.restore',
    'InventoryAdjustment.read',
    'InventoryAdjustment.create',
    'InventoryAdjustment.update',
    'InventoryAdjustment.soft_delete',
    'InventoryAdjustment.restore',
    'InventoryAdjustment.approve',
    'InventoryAdjustment.reject',
    'InventoryCount.read',
    'InventoryCount.create',
    'InventoryCount.update',
    'InventoryCount.soft_delete',
    'InventoryCount.restore',
    'InventoryCountLine.read',
    'InventoryCountLine.create',
    'InventoryCountLine.update',
    'InventoryCountLine.soft_delete',
    'InventoryCountLine.restore',
    'Asset.read',
    'Asset.create',
    'Asset.update',
    'Asset.soft_delete',
    'Asset.restore',
    'Asset.assign',
    'Asset.unassign',
    'Asset.transfer',
    'Asset.activate',
    'Asset.deactivate',
    'AssetAssignment.read',
    'AssetAssignment.create',
    'AssetAssignment.update',
    'AssetAssignment.soft_delete',
    'AssetAssignment.restore',
    'AssetAssignment.assign',
    'AssetAssignment.unassign',
    'AssetAssignment.transfer',
    'AssetMaintenance.read',
    'AssetMaintenance.create',
    'AssetMaintenance.update',
    'AssetMaintenance.soft_delete',
    'AssetMaintenance.restore',
    'AssetDepreciation.read',
    'AssetDepreciation.create',
    'AssetDepreciation.update',
    'AssetDepreciation.soft_delete',
    'AssetDepreciation.restore',
    'AssetDocument.read',
    'AssetDocument.create',
    'AssetDocument.update',
    'AssetDocument.soft_delete',
    'AssetDocument.restore',
    'AssetMeterReading.read',
    'AssetMeterReading.create',
    'AssetMeterReading.update',
    'AssetMeterReading.soft_delete',
    'AssetMeterReading.restore',
    'InventoryLocation.read',
    'InventoryLocation.create',
    'InventoryLocation.update',
    'InventoryLocation.soft_delete',
    'InventoryLocation.restore',
    'InventoryBin.read',
    'InventoryBin.create',
    'InventoryBin.update',
    'InventoryBin.soft_delete',
    'InventoryBin.restore',
    'InventoryReservation.read',
    'InventoryReservation.create',
    'InventoryReservation.update',
    'InventoryReservation.soft_delete',
    'InventoryReservation.restore',
    'InventoryAttachment.read',
    'InventoryAttachment.create',
    'InventoryAttachment.update',
    'InventoryAttachment.soft_delete',
    'InventoryAttachment.restore',
    'GoodsReceipt.read',
    'GoodsReceipt.create',
    'GoodsReceipt.update',
    'GoodsReceipt.soft_delete',
    'GoodsReceipt.restore',
    'GoodsReceiptLine.read',
    'GoodsReceiptLine.create',
    'GoodsReceiptLine.update',
    'GoodsReceiptLine.soft_delete',
    'GoodsReceiptLine.restore',
    'RFQResponseLine.read',
    'RFQResponseLine.create',
    'RFQResponseLine.update',
    'RFQResponseLine.soft_delete',
    'RFQResponseLine.restore',
    'ReasonCode.read',
    'ReasonCode.create',
    'ReasonCode.update',
    'ReasonCode.soft_delete',
    'ReasonCode.restore',
    'ResourceAllocation.read',
    'ResourceAllocation.create',
    'ResourceAllocation.update',
    'ResourceAllocation.soft_delete',
    'ResourceAllocation.restore',
    'ResourceAllocation.allocate',
    'ResourceAllocation.deallocate',
    'Channel.read',
    'Channel.create',
    'Channel.update',
    'Channel.soft_delete',
    'Channel.restore',
    'Channel.archive',
    'Channel.activate',
    'Channel.deactivate',
    'ChannelMember.read',
    'ChannelMember.create',
    'ChannelMember.update',
    'ChannelMember.soft_delete',
    'ChannelMember.restore',
    'ChannelMember.assign',
    'ChannelMember.unassign',
    'DirectChat.read',
    'DirectChat.create',
    'DirectChat.update',
    'DirectChat.soft_delete',
    'DirectChat.restore',
    'DirectChat.archive',
    'DirectMessage.read',
    'DirectMessage.create',
    'DirectMessage.update',
    'DirectMessage.soft_delete',
    'DirectMessage.restore',
    'DirectMessageRead.read',
    'DirectMessageRead.create',
    'DirectMessageRead.update',
    'Notification.read',
    'Notification.create',
    'Notification.update',
    'Notification.soft_delete',
    'Notification.restore',
    'InAppAnnouncement.read',
    'InAppAnnouncement.create',
    'InAppAnnouncement.update',
    'InAppAnnouncement.soft_delete',
    'InAppAnnouncement.restore',
    'InAppAnnouncement.publish',
    'Message.read',
    'Message.create',
    'Message.update',
    'Message.soft_delete',
    'Message.restore',
    'MessageAttachment.read',
    'MessageAttachment.create',
    'MessageAttachment.update',
    'MessageAttachment.soft_delete',
    'MessageAttachment.restore',
    'MessageRead.read',
    'MessageRead.create',
    'MessageRead.update',
    'NotificationPreference.read',
    'NotificationPreference.create',
    'NotificationPreference.update',
    'NotificationPreference.soft_delete',
    'NotificationPreference.restore',
    'NotificationTemplate.read',
    'NotificationTemplate.create',
    'NotificationTemplate.update',
    'NotificationTemplate.soft_delete',
    'NotificationTemplate.restore',
    'EmailTemplate.read',
    'EmailTemplate.create',
    'EmailTemplate.update',
    'EmailTemplate.soft_delete',
    'EmailTemplate.restore',
    'FileObject.read',
    'FileObject.create',
    'FileObject.update',
    'FileObject.soft_delete',
    'FileObject.restore',
    'Attachment.read',
    'Attachment.create',
    'Attachment.update',
    'Attachment.soft_delete',
    'Attachment.restore',
    'Attachment.approve',
    'Attachment.reject',
    'AttachmentLink.read',
    'AttachmentLink.create',
    'AttachmentLink.update',
    'AttachmentLink.soft_delete',
    'AttachmentLink.restore',
    'ESignatureEnvelope.read',
    'ESignatureEnvelope.create',
    'ESignatureEnvelope.update',
    'ESignatureEnvelope.soft_delete',
    'ESignatureEnvelope.restore',
    'ESignatureEnvelope.send',
    'ESignatureRecipient.read',
    'ESignatureRecipient.create',
    'ESignatureRecipient.update',
    'ESignatureRecipient.soft_delete',
    'ESignatureRecipient.restore',
    'DocumentGroup.read',
    'DocumentGroup.create',
    'DocumentGroup.update',
    'DocumentGroup.soft_delete',
    'DocumentGroup.restore',
    'ContractTemplate.read',
    'ContractTemplate.create',
    'ContractTemplate.update',
    'ContractTemplate.soft_delete',
    'ContractTemplate.restore',
    'TermsTemplate.read',
    'TermsTemplate.create',
    'TermsTemplate.update',
    'TermsTemplate.soft_delete',
    'TermsTemplate.restore',
    'Vendor.read',
    'Vendor.create',
    'Vendor.update',
    'Vendor.soft_delete',
    'Vendor.restore',
    'Vendor.activate',
    'Vendor.deactivate',
    'VendorContact.read',
    'VendorContact.create',
    'VendorContact.update',
    'VendorContact.soft_delete',
    'VendorContact.restore',
    'VendorDocument.read',
    'VendorDocument.create',
    'VendorDocument.update',
    'VendorDocument.soft_delete',
    'VendorDocument.restore',
    'Contract.read',
    'Contract.create',
    'Contract.update',
    'Contract.soft_delete',
    'Contract.restore',
    'Contract.send',
    'Contract.approve',
    'Contract.reject',
    'Person.read',
    'Person.create',
    'Person.update',
    'Person.soft_delete',
    'Person.restore',
    'PersonName.read',
    'PersonName.create',
    'PersonName.update',
    'PersonName.soft_delete',
    'PersonName.restore',
    'PersonAddress.read',
    'PersonAddress.create',
    'PersonAddress.update',
    'PersonAddress.soft_delete',
    'PersonAddress.restore',
    'PersonContactMethod.read',
    'PersonContactMethod.create',
    'PersonContactMethod.update',
    'PersonContactMethod.soft_delete',
    'PersonContactMethod.restore',
    'PersonDocument.read',
    'PersonDocument.create',
    'PersonDocument.update',
    'PersonDocument.soft_delete',
    'PersonDocument.restore',
    'AIAction.read',
    'AIAction.create',
    'AIAction.update',
    'AIAction.soft_delete',
    'AIAction.restore',
    'AIAction.activate',
    'AIAction.deactivate',
    'AIActionRun.read',
    'AIActionRun.create',
    'AIActionRun.update',
    'AIActionRun.soft_delete',
    'AIActionRun.restore',
    'AIJob.read',
    'AIJob.create',
    'AIJob.update',
    'AIJob.soft_delete',
    'AIJob.restore',
    'AIJobArtifact.read',
    'AIJobArtifact.create',
    'AIJobArtifact.update',
    'AIJobArtifact.soft_delete',
    'AIJobArtifact.restore',
    'AIInsight.read',
    'AIInsight.create',
    'AIInsight.update',
    'AIInsight.soft_delete',
    'AIInsight.restore',
    'AIInsightFeedback.read',
    'AIInsightFeedback.create',
    'AIInsightFeedback.update',
    'AIInsightFeedback.soft_delete',
    'AIInsightFeedback.restore',
    'AIPlaybook.read',
    'AIPlaybook.create',
    'AIPlaybook.update',
    'AIPlaybook.soft_delete',
    'AIPlaybook.restore',
    'AIPlaybook.activate',
    'AIPlaybook.deactivate',
    'AIPlaybookStep.read',
    'AIPlaybookStep.create',
    'AIPlaybookStep.update',
    'AIPlaybookStep.soft_delete',
    'AIPlaybookStep.restore',
    'AIPromptTemplate.read',
    'AIPromptTemplate.create',
    'AIPromptTemplate.update',
    'AIPromptTemplate.soft_delete',
    'AIPromptTemplate.restore',
    'AIAssistantProfile.read',
    'AIAssistantProfile.create',
    'AIAssistantProfile.update',
    'AIAssistantProfile.soft_delete',
    'AIAssistantProfile.restore',
    'AIAssistantProfile.activate',
    'AIAssistantProfile.deactivate',
    'AIDocumentIndex.read',
    'AIDocumentIndex.create',
    'AIDocumentIndex.update',
    'AIDocumentIndex.soft_delete',
    'AIDocumentIndex.restore',
    'AIDocumentChunk.read',
    'AIDocumentChunk.create',
    'AIDocumentChunk.update',
    'AIDocumentChunk.soft_delete',
    'AIDocumentChunk.restore',
    'AIEmbedding.read',
    'AIEmbedding.create',
    'AIEmbedding.update',
    'AIEmbedding.soft_delete',
    'AIEmbedding.restore',
    'Employment.read',
    'Employment.create',
    'Employment.update',
    'Employment.soft_delete',
    'Employment.restore',
    'Employment.activate',
    'Employment.deactivate',
    'Position.read',
    'Position.create',
    'Position.update',
    'Position.soft_delete',
    'Position.restore',
    'Position.activate',
    'Position.deactivate',
    'PositionAssignment.read',
    'PositionAssignment.create',
    'PositionAssignment.update',
    'PositionAssignment.soft_delete',
    'PositionAssignment.restore',
    'PositionAssignment.assign',
    'PositionAssignment.unassign',
    'PositionBudget.read',
    'PositionBudget.create',
    'PositionBudget.update',
    'PositionBudget.soft_delete',
    'PositionBudget.restore',
    'CompensationComponent.read',
    'CompensationComponent.create',
    'CompensationComponent.update',
    'CompensationComponent.soft_delete',
    'CompensationComponent.restore',
    'CompensationComponent.activate',
    'CompensationComponent.deactivate',
    'CompensationPlan.read',
    'CompensationPlan.create',
    'CompensationPlan.update',
    'CompensationPlan.soft_delete',
    'CompensationPlan.restore',
    'CompensationPlan.activate',
    'CompensationPlan.deactivate',
    'Allowance.read',
    'Allowance.create',
    'Allowance.update',
    'Allowance.soft_delete',
    'Allowance.restore',
    'Allowance.approve',
    'Allowance.reject',
    'Deduction.read',
    'Deduction.create',
    'Deduction.update',
    'Deduction.soft_delete',
    'Deduction.restore',
    'Deduction.approve',
    'Deduction.reject',
    'BenefitDependent.read',
    'BenefitDependent.create',
    'BenefitDependent.update',
    'BenefitDependent.soft_delete',
    'BenefitDependent.restore',
    'BenefitEnrollment.read',
    'BenefitEnrollment.create',
    'BenefitEnrollment.update',
    'BenefitEnrollment.soft_delete',
    'BenefitEnrollment.restore',
    'BenefitEnrollment.approve',
    'BenefitEnrollment.reject',
    'Certification.read',
    'Certification.create',
    'Certification.update',
    'Certification.soft_delete',
    'Certification.restore',
    'Certification.approve',
    'Certification.reject',
    'PerformanceGoal.read',
    'PerformanceGoal.create',
    'PerformanceGoal.update',
    'PerformanceGoal.soft_delete',
    'PerformanceGoal.restore',
    'PerformanceReview.read',
    'PerformanceReview.create',
    'PerformanceReview.update',
    'PerformanceReview.soft_delete',
    'PerformanceReview.restore',
    'PerformanceReview.approve',
    'PerformanceReview.reject',
    'Grade.read',
    'Grade.create',
    'Grade.update',
    'Grade.soft_delete',
    'Grade.restore',
    'Department.read',
    'Department.create',
    'Department.update',
    'Department.soft_delete',
    'Department.restore',
    'Department.activate',
    'Department.deactivate',
    'OrgUnit.read',
    'OrgUnit.create',
    'OrgUnit.update',
    'OrgUnit.soft_delete',
    'OrgUnit.restore',
    'OrgUnit.activate',
    'OrgUnit.deactivate',
    'TrainingEnrollment.read',
    'TrainingEnrollment.create',
    'TrainingEnrollment.update',
    'TrainingEnrollment.soft_delete',
    'TrainingEnrollment.restore',
    'TrainingEnrollment.approve',
    'TrainingEnrollment.reject',
    'Worker.read',
    'Worker.create',
    'Worker.update',
    'Worker.soft_delete',
    'Worker.restore',
    'Worker.activate',
    'Worker.deactivate',
    'LossInvestigation.read',
    'LossInvestigation.create',
    'LossInvestigation.update',
    'LossInvestigation.soft_delete',
    'LossInvestigation.restore',
    'LossInvestigationFinding.read',
    'LossInvestigationFinding.create',
    'LossInvestigationFinding.update',
    'LossInvestigationFinding.soft_delete',
    'LossInvestigationFinding.restore',
    'MitigationAction.read',
    'MitigationAction.create',
    'MitigationAction.update',
    'MitigationAction.soft_delete',
    'MitigationAction.restore',
    'MitigationAction.implement',
    'RiskFactor.read',
    'RiskFactor.create',
    'RiskFactor.update',
    'RiskFactor.soft_delete',
    'RiskFactor.restore',
    'RiskFactor.assess',
    'ScheduleRisk.read',
    'ScheduleRisk.create',
    'ScheduleRisk.update',
    'ScheduleRisk.soft_delete',
    'ScheduleRisk.restore',
    'AnomalyCase.read',
    'AnomalyCase.create',
    'AnomalyCase.update',
    'AnomalyCase.soft_delete',
    'AnomalyCase.restore',
    'AnomalyCase.investigate',
    'AnomalyCaseAction.read',
    'AnomalyCaseAction.create',
    'AnomalyCaseAction.update',
    'AnomalyCaseAction.execute',
    'AnomalySignal.read',
    'AnomalySignal.create',
    'AnomalySignal.update',
    'AnomalySignalFeature.read',
    'AnomalySignalFeature.create',
    'AnomalySignalFeature.update',
    'ApprovalRequest.read',
    'ApprovalRequest.create',
    'ApprovalRequest.update',
    'ApprovalRequest.soft_delete',
    'ApprovalRequest.restore',
    'ApprovalRequest.submit',
    'ApprovalRequest.approve',
    'ApprovalRequest.reject',
    'ApprovalDecision.read',
    'ApprovalDecision.create',
    'ApprovalDecision.update',
    'ApprovalDecision.soft_delete',
    'ApprovalDecision.restore',
    'ApprovalRule.read',
    'ApprovalRule.create',
    'ApprovalRule.update',
    'ApprovalRule.soft_delete',
    'ApprovalRule.restore',
    'ApprovalRule.activate',
    'ApprovalRule.deactivate',
    'JobRun.read',
    'JobRun.create',
    'JobRun.update',
    'JobRun.soft_delete',
    'JobRun.restore',
    'JobSchedule.read',
    'JobSchedule.create',
    'JobSchedule.update',
    'JobSchedule.activate',
    'JobSchedule.deactivate',
    'JobFamily.read',
    'JobFamily.create',
    'JobFamily.update',
    'JobFamily.soft_delete',
    'JobFamily.restore',
    'JobProfile.read',
    'JobProfile.create',
    'JobProfile.update',
    'JobProfile.soft_delete',
    'JobProfile.restore',
    'JobProfileAssignment.read',
    'JobProfileAssignment.create',
    'JobProfileAssignment.update',
    'JobProfileAssignment.assign',
    'JobProfileAssignment.unassign',
    'DistributedLock.read',
    'DistributedLock.create',
    'DistributedLock.update',
    'NumberSequence.read',
    'NumberSequence.create',
    'NumberSequence.update',
    'weather_alerts.read',
    'weather_alerts.create',
    'weather_alerts.update',
    'weather_alerts.activate',
    'weather_alerts.deactivate',
    'weather_watches.read',
    'weather_watches.create',
    'weather_watches.update',
    'weather_incidents.read',
    'weather_incidents.create',
    'weather_incidents.update',
    'weather_incidents.resolve',
    'weather_alert_deliveries.read',
    'weather_alert_deliveries.create',
    'weather_alert_deliveries.update',
    'weather_forecast_cache.read',
    'weather_forecast_cache.create',
    'weather_forecast_cache.update',
    'weather_providers.read',
    'weather_providers.create',
    'weather_providers.update',
    'weather_providers.activate',
    'weather_providers.deactivate',
    'weather_risk_factors.read',
    'weather_risk_factors.create',
    'weather_risk_factors.update',
    'weather_risk_factors.activate',
    'weather_risk_factors.deactivate',
    'Webhook.read',
    'Webhook.create',
    'Webhook.update',
    'Webhook.soft_delete',
    'Webhook.restore',
    'Webhook.activate',
    'Webhook.deactivate',
    'WebhookEndpoint.read',
    'WebhookEndpoint.create',
    'WebhookEndpoint.update',
    'WebhookEndpoint.soft_delete',
    'WebhookEndpoint.restore',
    'WebhookDelivery.read',
    'WebhookDelivery.create',
    'WebhookDelivery.update',
    'WebhookDelivery.soft_delete',
    'WebhookDelivery.restore',
    'WebhookEvent.read',
    'WebhookEvent.create',
    'WebhookEvent.update',
    'WebhookEvent.soft_delete',
    'WebhookEvent.restore',
    'WebhookLog.read',
    'WebhookLog.create',
    'WebhookLog.update',
    'WebhookLog.soft_delete',
    'WebhookLog.restore',
    'IntegrationConnection.read',
    'IntegrationConnection.create',
    'IntegrationConnection.update',
    'IntegrationConnection.soft_delete',
    'IntegrationConnection.restore',
    'IntegrationConnection.activate',
    'IntegrationConnection.deactivate',
    'IntegrationConnector.read',
    'IntegrationConnector.create',
    'IntegrationConnector.update',
    'IntegrationConnector.soft_delete',
    'IntegrationConnector.restore',
    'IntegrationMapping.read',
    'IntegrationMapping.create',
    'IntegrationMapping.update',
    'IntegrationMapping.soft_delete',
    'IntegrationMapping.restore',
    'IntegrationProvider.read',
    'IntegrationProvider.create',
    'IntegrationProvider.update',
    'IntegrationProvider.soft_delete',
    'IntegrationProvider.restore',
    'IntegrationSecret.read',
    'IntegrationSecret.create',
    'IntegrationSecret.update',
    'IntegrationSecret.soft_delete',
    'IntegrationSecret.restore',
    'SyncJob.read',
    'SyncJob.create',
    'SyncJob.update',
    'SyncJob.soft_delete',
    'SyncJob.restore',
    'SyncLog.read',
    'SyncLog.create',
    'SyncLog.update',
    'SyncLog.soft_delete',
    'SyncLog.restore',
    'SyncState.read',
    'SyncState.create',
    'SyncState.update',
    'SyncState.soft_delete',
    'SyncState.restore',
    'Location.read',
    'Location.create',
    'Location.update',
    'Location.soft_delete',
    'Location.restore',
    'Country.read',
    'Country.create',
    'Country.update',
    'Country.soft_delete',
    'Country.restore',
    'Region.read',
    'Region.create',
    'Region.update',
    'Region.soft_delete',
    'Region.restore',
    'StateProvince.read',
    'StateProvince.create',
    'StateProvince.update',
    'StateProvince.soft_delete',
    'StateProvince.restore',
    'PriceList.read',
    'PriceList.create',
    'PriceList.update',
    'PriceList.soft_delete',
    'PriceList.restore',
    'PriceList.activate',
    'PriceList.deactivate',
    'PriceListItem.read',
    'PriceListItem.create',
    'PriceListItem.update',
    'PriceListItem.soft_delete',
    'PriceListItem.restore',
    'CostCenter.read',
    'CostCenter.create',
    'CostCenter.update',
    'CostCenter.soft_delete',
    'CostCenter.restore',
    'CostCategory.read',
    'CostCategory.create',
    'CostCategory.update',
    'CostCategory.soft_delete',
    'CostCategory.restore',
    'CostCode.read',
    'CostCode.create',
    'CostCode.update',
    'CostCode.soft_delete',
    'CostCode.restore',
    'UnitOfMeasure.read',
    'UnitOfMeasure.create',
    'UnitOfMeasure.update',
    'UnitOfMeasure.soft_delete',
    'UnitOfMeasure.restore',
    'WorkType.read',
    'WorkType.create',
    'WorkType.update',
    'WorkType.soft_delete',
    'WorkType.restore',
    'TenantAuditLog.read',
    'TenantAuditLog.export',
    'DataRetentionPolicy.read',
    'DataRetentionPolicy.create',
    'DataRetentionPolicy.update',
    'DataRetentionPolicy.soft_delete',
    'DataRetentionPolicy.restore',
    'DataRetentionPolicy.activate',
    'DataRetentionPolicy.deactivate',
    'ErrorReport.read',
    'ErrorReport.create',
    'ErrorReport.update',
    'ErrorReport.soft_delete',
    'ErrorReport.restore',
    'SystemLog.read',
    'SystemLog.create',
    'SystemLog.update',
    'SystemLog.soft_delete',
    'SystemLog.restore',
    'ExportJob.read',
    'ExportJob.create',
    'ExportJob.update',
    'ExportJob.soft_delete',
    'ExportJob.restore',
    'ExportArtifact.read',
    'ExportArtifact.create',
    'ExportArtifact.update',
    'ExportArtifact.soft_delete',
    'ExportArtifact.restore',
    'ReportDefinition.read',
    'ReportDefinition.create',
    'ReportDefinition.update',
    'ReportDefinition.soft_delete',
    'ReportDefinition.restore',
    'DashboardDefinition.read',
    'DashboardDefinition.create',
    'DashboardDefinition.update',
    'DashboardDefinition.soft_delete',
    'DashboardDefinition.restore'
  ],
  'PROJECT_MANAGER': [
    'Tenant.read',
    'TenantSettings.read',
    'TenantMetrics.read',
    'TenantFeatureFlag.read',
    'TenantUsageRecord.read',
    'User.read',
    'User.update',
    'Member.read',
    'Member.update',
    'Member.create',
    'Member.soft_delete',
    'Member.restore',
    'Member.assign',
    'Member.unassign',
    'Member.transfer',
    'MemberRole.read',
    'MemberRole.assign',
    'MemberRole.unassign',
    'MemberSettings.read',
    'MemberSettings.update',
    'MemberDocument.read',
    'MemberDocument.create',
    'MemberDocument.update',
    'Role.read',
    'Permission.read',
    'RolePermission.read',
    'ApiKey.read',
    'ApiKey.create',
    'ApiKey.soft_delete',
    'AuthFactor.read',
    'AuthFactor.create',
    'AuthFactor.update',
    'Account.read',
    'Account.create',
    'Account.update',
    'Account.soft_delete',
    'Account.restore',
    'Account.assign',
    'Account.unassign',
    'AccountAddress.read',
    'AccountAddress.create',
    'AccountAddress.update',
    'AccountAddress.soft_delete',
    'AccountAddress.restore',
    'Contact.read',
    'Contact.create',
    'Contact.update',
    'Contact.soft_delete',
    'Contact.restore',
    'Lead.read',
    'Lead.create',
    'Lead.update',
    'Lead.soft_delete',
    'Lead.restore',
    'Lead.assign',
    'Lead.unassign',
    'Lead.transfer',
    'LeadActivity.read',
    'LeadActivity.create',
    'LeadActivity.update',
    'LeadActivity.soft_delete',
    'LeadActivity.restore',
    'Opportunity.read',
    'Opportunity.create',
    'Opportunity.update',
    'Opportunity.soft_delete',
    'Opportunity.restore',
    'Opportunity.assign',
    'Opportunity.unassign',
    'OpportunityStage.read',
    'OpportunityStage.create',
    'OpportunityStage.update',
    'OpportunityLineItem.read',
    'OpportunityLineItem.create',
    'OpportunityLineItem.update',
    'OpportunityLineItem.soft_delete',
    'OpportunityLineItem.restore',
    'Quote.read',
    'Quote.create',
    'Quote.update',
    'Quote.soft_delete',
    'Quote.restore',
    'Quote.send',
    'QuoteLineItem.read',
    'QuoteLineItem.create',
    'QuoteLineItem.update',
    'QuoteLineItem.soft_delete',
    'QuoteLineItem.restore',
    'Estimate.read',
    'Estimate.create',
    'Estimate.update',
    'Estimate.soft_delete',
    'Estimate.restore',
    'Estimate.send',
    'Estimate.approve',
    'Estimate.reject',
    'EstimateLineItem.read',
    'EstimateLineItem.create',
    'EstimateLineItem.update',
    'EstimateLineItem.soft_delete',
    'EstimateLineItem.restore',
    'EstimateAttachment.read',
    'EstimateAttachment.create',
    'EstimateAttachment.update',
    'EstimateAttachment.soft_delete',
    'EstimateAttachment.restore',
    'EstimateApproval.read',
    'EstimateApproval.create',
    'EstimateApproval.approve',
    'EstimateApproval.reject',
    'RequestForQuote.read',
    'RequestForQuote.create',
    'RequestForQuote.update',
    'RequestForQuote.send',
    'RFQLine.read',
    'RFQLine.create',
    'RFQLine.update',
    'Bid.read',
    'Bid.create',
    'Bid.update',
    'Bid.submit',
    'Project.read',
    'Project.create',
    'Project.update',
    'Project.soft_delete',
    'Project.restore',
    'Project.archive',
    'Project.activate',
    'Project.deactivate',
    'Project.assign',
    'Project.unassign',
    'Project.transfer',
    'ProjectTaskAssignment.read',
    'ProjectTaskAssignment.create',
    'ProjectTaskAssignment.update',
    'ProjectTaskAssignment.soft_delete',
    'ProjectTaskAssignment.restore',
    'ProjectTaskAssignment.assign',
    'ProjectTaskAssignment.unassign',
    'ProjectMember.read',
    'ProjectMember.create',
    'ProjectMember.update',
    'ProjectMember.soft_delete',
    'ProjectMember.restore',
    'ProjectMember.assign',
    'ProjectMember.unassign',
    'ProjectNote.read',
    'ProjectNote.create',
    'ProjectNote.update',
    'ProjectNote.soft_delete',
    'ProjectNote.restore',
    'ProjectReport.read',
    'ProjectReport.create',
    'ProjectReport.update',
    'ProjectReport.export',
    'ProjectBudgetLine.read',
    'ProjectBudgetLine.create',
    'ProjectBudgetLine.update',
    'ProjectFinancialSnapshot.read',
    'ProjectFinancialSnapshot.export',
    'ProjectPhase.read',
    'ProjectPhase.create',
    'ProjectPhase.update',
    'ProjectPhase.soft_delete',
    'ProjectPhase.restore',
    'ProjectPhase.activate',
    'ProjectPhase.deactivate',
    'WBSItem.read',
    'WBSItem.create',
    'WBSItem.update',
    'WBSItem.soft_delete',
    'WBSItem.restore',
    'ProjectLocation.read',
    'ProjectLocation.create',
    'ProjectLocation.update',
    'ProjectLocation.soft_delete',
    'ProjectLocation.restore',
    'ProjectTask.read',
    'ProjectTask.create',
    'ProjectTask.update',
    'ProjectTask.soft_delete',
    'ProjectTask.restore',
    'ProjectTask.assign',
    'ProjectTask.unassign',
    'ProjectTaskDependency.read',
    'ProjectTaskDependency.create',
    'ProjectTaskDependency.update',
    'ProjectTaskDependency.soft_delete',
    'ProjectTaskDependency.restore',
    'ProjectTaskComment.read',
    'ProjectTaskComment.create',
    'ProjectTaskComment.update',
    'ProjectTaskComment.soft_delete',
    'ProjectTaskComment.restore',
    'ChangeOrder.read',
    'ChangeOrder.create',
    'ChangeOrder.update',
    'ChangeOrder.soft_delete',
    'ChangeOrder.restore',
    'ChangeOrder.approve',
    'ChangeOrder.reject',
    'ChangeOrderLine.read',
    'ChangeOrderLine.create',
    'ChangeOrderLine.update',
    'ChangeOrderApproval.read',
    'ChangeOrderApproval.create',
    'ChangeOrderApproval.approve',
    'ChangeOrderApproval.reject',
    'RFI.read',
    'RFI.create',
    'RFI.update',
    'RFI.send',
    'RFIReply.read',
    'RFIReply.create',
    'RFIReply.update',
    'Submittal.read',
    'Submittal.create',
    'Submittal.update',
    'SubmittalItem.read',
    'SubmittalItem.create',
    'SubmittalItem.update',
    'SubmittalApproval.read',
    'SubmittalApproval.create',
    'SubmittalApproval.approve',
    'SubmittalApproval.reject',
    'Inspection.read',
    'Inspection.create',
    'Inspection.update',
    'InspectionItem.read',
    'InspectionItem.create',
    'InspectionItem.update',
    'InspectionApproval.read',
    'InspectionApproval.create',
    'InspectionApproval.approve',
    'InspectionApproval.reject',
    'DailyLog.read',
    'DailyLog.create',
    'DailyLog.update',
    'PunchList.read',
    'PunchList.create',
    'PunchList.update',
    'PunchListItem.read',
    'PunchListItem.create',
    'PunchListItem.update',
    'Task.read',
    'Task.create',
    'Task.update',
    'Task.soft_delete',
    'Task.restore',
    'Task.assign',
    'Task.unassign',
    'Task.transfer',
    'Task.activate',
    'Task.deactivate',
    'TaskAssignment.read',
    'TaskAssignment.create',
    'TaskAssignment.update',
    'TaskAssignment.assign',
    'TaskAssignment.unassign',
    'TaskAssignment.transfer',
    'TaskDependency.read',
    'TaskDependency.create',
    'TaskDependency.update',
    'TaskDependency.soft_delete',
    'TaskDependency.restore',
    'TaskAttachment.read',
    'TaskAttachment.create',
    'TaskAttachment.update',
    'TaskAttachment.soft_delete',
    'TaskAttachment.restore',
    'TaskChecklistItem.read',
    'TaskChecklistItem.create',
    'TaskChecklistItem.update',
    'TaskChecklistItem.soft_delete',
    'TaskChecklistItem.restore',
    'Invoice.read',
    'Invoice.create',
    'Invoice.update',
    'Invoice.send',
    'Invoice.soft_delete',
    'InvoiceLineItem.read',
    'InvoiceLineItem.create',
    'InvoiceLineItem.update',
    'Payment.read',
    'PaymentSchedule.read',
    'PurchaseOrder.read',
    'PurchaseOrder.create',
    'PurchaseOrder.update',
    'PurchaseOrder.send',
    'PurchaseOrder.approve',
    'PurchaseOrder.reject',
    'PurchaseOrderLine.read',
    'PurchaseOrderLine.create',
    'PurchaseOrderLine.update',
    'Expense.read',
    'Expense.create',
    'Expense.update',
    'Expense.approve',
    'Expense.reject',
    'ExpenseLine.read',
    'ExpenseLine.create',
    'ExpenseLine.update',
    'ExpenseReceipt.read',
    'ExpenseReceipt.create',
    'ExpenseReceipt.update',
    'ExpenseReceipt.approve',
    'ExpenseReceipt.reject',
    'PayrollRun.read',
    'PayrollItem.read',
    'PayrollRun.submit',
    'PayrollRun.approve',
    'ClockInClockOut.read',
    'ClockInClockOut.create',
    'ClockInClockOut.update',
    'ClockInClockOut.approve',
    'ClockInClockOut.reject',
    'Schedule.read',
    'Schedule.create',
    'Schedule.update',
    'Schedule.soft_delete',
    'Schedule.restore',
    'Schedule.publish',
    'ScheduleException.read',
    'ScheduleException.create',
    'ScheduleException.update',
    'ScheduleException.approve',
    'ScheduleException.reject',
    'Leave.read',
    'Leave.create',
    'Leave.update',
    'Leave.approve',
    'Leave.reject',
    'Timesheet.read',
    'Timesheet.create',
    'Timesheet.update',
    'Timesheet.approve',
    'Timesheet.reject',
    'TimesheetEntry.read',
    'TimesheetEntry.create',
    'TimesheetEntry.update',
    'LeaveOfAbsence.read',
    'LeaveOfAbsence.approve',
    'LeaveOfAbsence.reject',
    'InventoryItem.read',
    'InventoryItem.update',
    'InventoryItem.assign',
    'InventoryItem.unassign',
    'InventoryItem.transfer',
    'InventoryTransaction.read',
    'InventoryTransaction.create',
    'InventoryTransaction.update',
    'InventoryCount.read',
    'InventoryCount.create',
    'InventoryCount.update',
    'Asset.read',
    'Asset.assign',
    'Asset.unassign',
    'Asset.transfer',
    'AssetAssignment.read',
    'AssetAssignment.create',
    'AssetAssignment.update',
    'AssetAssignment.assign',
    'AssetAssignment.unassign',
    'Channel.read',
    'Channel.create',
    'Channel.update',
    'Channel.archive',
    'ChannelMember.read',
    'ChannelMember.create',
    'ChannelMember.assign',
    'ChannelMember.unassign',
    'DirectChat.read',
    'DirectChat.create',
    'DirectChat.update',
    'DirectMessage.read',
    'DirectMessage.create',
    'DirectMessage.update',
    'DirectMessage.soft_delete',
    'Notification.read',
    'NotificationPreference.read',
    'NotificationPreference.update',
    'FileObject.read',
    'FileObject.create',
    'FileObject.update',
    'FileObject.soft_delete',
    'FileObject.restore',
    'Attachment.read',
    'Attachment.create',
    'Attachment.update',
    'Attachment.soft_delete',
    'Attachment.restore',
    'ContractTemplate.read',
    'TermsTemplate.read',
    'Vendor.read',
    'Vendor.create',
    'Vendor.update',
    'Vendor.assign',
    'Vendor.unassign',
    'VendorContact.read',
    'VendorContact.create',
    'VendorContact.update',
    'Contract.read',
    'Contract.create',
    'Contract.update',
    'ApprovalRequest.read',
    'ApprovalRequest.create',
    'ApprovalRequest.update',
    'ApprovalRequest.submit',
    'ApprovalRequest.approve',
    'ApprovalRequest.reject',
    'ApprovalDecision.read',
    'ApprovalDecision.create',
    'ApprovalRule.read',
    'Location.read',
    'Country.read',
    'Region.read',
    'StateProvince.read',
    'PriceList.read',
    'PriceListItem.read',
    'CostCenter.read',
    'CostCategory.read',
    'CostCode.read',
    'WorkType.read',
    'TenantAuditLog.read',
    'ExportJob.read',
    'ExportJob.create',
    'ReportDefinition.read',
    'DashboardDefinition.read'
  ],
  'WORKER': [
    'User.read',
    'User.update',
    'Member.read',
    'Member.update',
    'MemberSettings.read',
    'MemberSettings.update',
    'MemberDocument.read',
    'MemberDocument.create',
    'MemberDocument.update',
    'Project.read',
    'ProjectTaskAssignment.read',
    'ProjectNote.read',
    'ProjectNote.create',
    'ProjectNote.update',
    'ProjectLocation.read',
    'ProjectTask.read',
    'ProjectTask.update',
    'ProjectTaskComment.read',
    'ProjectTaskComment.create',
    'ProjectTaskComment.update',
    'DailyLog.read',
    'DailyLog.create',
    'DailyLog.update',
    'Task.read',
    'Task.update',
    'TaskAssignment.read',
    'TaskDependency.read',
    'TaskAttachment.read',
    'TaskAttachment.create',
    'TaskChecklistItem.read',
    'TaskChecklistItem.update',
    'Expense.read',
    'Expense.create',
    'Expense.update',
    'ExpenseLine.read',
    'ExpenseLine.create',
    'ExpenseLine.update',
    'ExpenseReceipt.read',
    'ExpenseReceipt.create',
    'ExpenseReceipt.update',
    'PayrollRun.read',
    'PayrollItem.read',
    'PayStatement.read',
    'ClockInClockOut.read',
    'ClockInClockOut.create',
    'ClockInClockOut.update',
    'Schedule.read',
    'ScheduleException.read',
    'ScheduleException.create',
    'ScheduleException.update',
    'Leave.read',
    'Leave.create',
    'Leave.update',
    'Timesheet.read',
    'Timesheet.create',
    'Timesheet.update',
    'TimesheetEntry.read',
    'TimesheetEntry.create',
    'TimesheetEntry.update',
    'InventoryItem.read',
    'InventoryTransaction.read',
    'Asset.read',
    'AssetAssignment.read',
    'Channel.read',
    'ChannelMember.read',
    'DirectChat.read',
    'DirectChat.create',
    'DirectMessage.read',
    'DirectMessage.create',
    'DirectMessage.update',
    'DirectMessage.soft_delete',
    'Notification.read',
    'NotificationPreference.read',
    'NotificationPreference.update',
    'FileObject.read',
    'FileObject.create',
    'Attachment.read',
    'Attachment.create'
  ],
  'DRIVER': [
    'User.read',
    'User.update',
    'Member.read',
    'Member.update',
    'MemberSettings.read',
    'MemberSettings.update',
    'Project.read',
    'ProjectTaskAssignment.read',
    'ProjectLocation.read',
    'Task.read',
    'Task.update',
    'TaskAssignment.read',
    'TaskAttachment.read',
    'TaskAttachment.create',
    'Expense.read',
    'Expense.create',
    'Expense.update',
    'ExpenseReceipt.read',
    'ExpenseReceipt.create',
    'ExpenseReceipt.update',
    'PayrollRun.read',
    'PayrollItem.read',
    'PayStatement.read',
    'ClockInClockOut.read',
    'ClockInClockOut.create',
    'Schedule.read',
    'Leave.read',
    'Leave.create',
    'Leave.update',
    'InventoryItem.read',
    'InventoryTransaction.read',
    'DirectChat.read',
    'DirectChat.create',
    'DirectMessage.read',
    'DirectMessage.create',
    'DirectMessage.update',
    'DirectMessage.soft_delete',
    'Notification.read',
    'NotificationPreference.read',
    'NotificationPreference.update'
  ],
  'VIEWER': [
    'Tenant.read',
    'Tenant.update',
    'TenantSettings.read',
    'TenantSettings.update',
    'TenantSettings.activate',
    'TenantSettings.deactivate',
    'TenantMetrics.read',
    'TenantMetrics.export',
    'TenantFeatureFlag.read',
    'TenantFeatureFlag.create',
    'TenantFeatureFlag.update',
    'TenantFeatureFlag.activate',
    'TenantFeatureFlag.deactivate',
    'TenantUsageRecord.read',
    'TenantUsageRecord.export',
    'User.read',
    'User.update',
    'Member.read',
    'Member.create',
    'Member.update',
    'Member.soft_delete',
    'Member.restore',
    'Member.assign',
    'Member.unassign',
    'MemberSettings.read',
    'MemberSettings.update',
    'MemberDocument.read',
    'MemberDocument.create',
    'MemberDocument.update',
    'Role.read',
    'Role.create',
    'Role.update',
    'Role.soft_delete',
    'Role.restore',
    'Permission.read',
    'RolePermission.read',
    'RolePermission.create',
    'RolePermission.soft_delete',
    'RolePermission.restore',
    'Account.read',
    'Account.create',
    'Account.update',
    'Account.soft_delete',
    'Account.restore',
    'Account.hard_delete',
    'AccountAddress.read',
    'AccountAddress.create',
    'AccountAddress.update',
    'AccountAddress.soft_delete',
    'AccountAddress.restore',
    'AccountAddress.hard_delete',
    'Contact.read',
    'Contact.create',
    'Contact.update',
    'Contact.soft_delete',
    'Contact.restore',
    'Contact.hard_delete',
    'Lead.read',
    'Lead.create',
    'Lead.update',
    'Lead.soft_delete',
    'Lead.restore',
    'Lead.hard_delete',
    'Lead.assign',
    'Lead.unassign',
    'LeadActivity.read',
    'LeadActivity.create',
    'LeadActivity.update',
    'LeadActivity.soft_delete',
    'LeadActivity.restore',
    'Opportunity.read',
    'Opportunity.create',
    'Opportunity.update',
    'Opportunity.soft_delete',
    'Opportunity.restore',
    'Opportunity.hard_delete',
    'Opportunity.assign',
    'Opportunity.unassign',
    'OpportunityStage.read',
    'OpportunityStage.create',
    'OpportunityStage.update',
    'OpportunityLineItem.read',
    'OpportunityLineItem.create',
    'OpportunityLineItem.update',
    'OpportunityLineItem.soft_delete',
    'OpportunityLineItem.restore',
    'Quote.read',
    'Quote.create',
    'Quote.update',
    'Quote.soft_delete',
    'Quote.restore',
    'Quote.hard_delete',
    'Quote.send',
    'Quote.approve',
    'Quote.reject',
    'QuoteLineItem.read',
    'QuoteLineItem.create',
    'QuoteLineItem.update',
    'QuoteLineItem.soft_delete',
    'QuoteLineItem.restore',
    'Estimate.read',
    'Estimate.create',
    'Estimate.update',
    'Estimate.soft_delete',
    'Estimate.restore',
    'Estimate.hard_delete',
    'Estimate.send',
    'Estimate.approve',
    'Estimate.reject',
    'EstimateLineItem.read',
    'EstimateLineItem.create',
    'EstimateLineItem.update',
    'EstimateLineItem.soft_delete',
    'EstimateLineItem.restore',
    'EstimateAttachment.read',
    'EstimateAttachment.create',
    'EstimateAttachment.update',
    'EstimateAttachment.soft_delete',
    'EstimateAttachment.restore',
    'EstimateApproval.read',
    'EstimateApproval.create',
    'EstimateApproval.approve',
    'EstimateApproval.reject',
    'EstimateComment.read',
    'EstimateComment.create',
    'EstimateComment.update',
    'EstimateComment.soft_delete',
    'EstimateComment.restore',
    'EstimateDiscount.read',
    'EstimateDiscount.create',
    'EstimateDiscount.update',
    'EstimateDiscount.soft_delete',
    'EstimateDiscount.restore',
    'EstimateHistoryEvent.read',
    'EstimateHistoryEvent.create',
    'EstimateRevision.read',
    'EstimateRevision.create',
    'EstimateRevision.update',
    'EstimateRevision.soft_delete',
    'EstimateRevision.restore',
    'EstimateTax.read',
    'EstimateTax.create',
    'EstimateTax.update',
    'EstimateTax.soft_delete',
    'EstimateTax.restore',
    'EstimateTerm.read',
    'EstimateTerm.create',
    'EstimateTerm.update',
    'EstimateTerm.soft_delete',
    'EstimateTerm.restore',
    'RequestForQuote.read',
    'RequestForQuote.create',
    'RequestForQuote.update',
    'RequestForQuote.send',
    'RFQLine.read',
    'RFQLine.create',
    'RFQLine.update',
    'Bid.read',
    'Bid.create',
    'Bid.update',
    'Bid.submit',
    'Bid.approve',
    'Bid.reject',
    'Project.read',
    'Project.create',
    'Project.update',
    'Project.soft_delete',
    'Project.restore',
    'Project.hard_delete',
    'Project.archive',
    'Project.activate',
    'Project.deactivate',
    'Project.assign',
    'Project.unassign',
    'ProjectTaskAssignment.read',
    'ProjectTaskAssignment.create',
    'ProjectTaskAssignment.update',
    'ProjectTaskAssignment.soft_delete',
    'ProjectTaskAssignment.restore',
    'ProjectTaskAssignment.assign',
    'ProjectTaskAssignment.unassign',
    'ProjectMember.read',
    'ProjectMember.create',
    'ProjectMember.update',
    'ProjectMember.soft_delete',
    'ProjectMember.restore',
    'ProjectMember.assign',
    'ProjectMember.unassign',
    'ProjectNote.read',
    'ProjectNote.create',
    'ProjectNote.update',
    'ProjectNote.soft_delete',
    'ProjectNote.restore',
    'ProjectReport.read',
    'ProjectReport.create',
    'ProjectReport.update',
    'ProjectReport.export',
    'ProjectBudgetLine.read',
    'ProjectBudgetLine.create',
    'ProjectBudgetLine.update',
    'ProjectFinancialSnapshot.read',
    'ProjectFinancialSnapshot.create',
    'ProjectFinancialSnapshot.export',
    'ProjectTask.read',
    'ProjectTask.create',
    'ProjectTask.update',
    'ProjectTask.soft_delete',
    'ProjectTask.restore',
    'ProjectTask.assign',
    'ProjectTask.unassign',
    'ProjectTaskComment.read',
    'ProjectTaskComment.create',
    'ProjectTaskComment.update',
    'ChangeOrder.read',
    'ChangeOrder.create',
    'ChangeOrder.update',
    'ChangeOrder.soft_delete',
    'ChangeOrder.restore',
    'ChangeOrder.approve',
    'ChangeOrder.reject',
    'ChangeOrderLine.read',
    'ChangeOrderLine.create',
    'ChangeOrderLine.update',
    'ChangeOrderApproval.read',
    'ChangeOrderApproval.create',
    'ChangeOrderApproval.approve',
    'ChangeOrderApproval.reject',
    'Task.read',
    'Task.create',
    'Task.update',
    'Task.soft_delete',
    'Task.restore',
    'Task.hard_delete',
    'Task.assign',
    'Task.unassign',
    'Task.activate',
    'Task.deactivate',
    'TaskAssignment.read',
    'TaskAssignment.create',
    'TaskAssignment.update',
    'TaskAssignment.assign',
    'TaskAssignment.unassign',
    'TaskDependency.read',
    'TaskDependency.create',
    'TaskDependency.update',
    'TaskAttachment.read',
    'TaskAttachment.create',
    'TaskAttachment.update',
    'TaskChecklistItem.read',
    'TaskChecklistItem.create',
    'TaskChecklistItem.update',
    'Invoice.read',
    'Invoice.create',
    'Invoice.update',
    'Invoice.soft_delete',
    'Invoice.restore',
    'Invoice.hard_delete',
    'Invoice.send',
    'Invoice.approve',
    'Invoice.reject',
    'Invoice.export',
    'InvoiceLineItem.read',
    'InvoiceLineItem.create',
    'InvoiceLineItem.update',
    'Payment.read',
    'Payment.create',
    'Payment.update',
    'Payment.export',
    'PurchaseOrder.read',
    'PurchaseOrder.create',
    'PurchaseOrder.update',
    'PurchaseOrder.send',
    'PurchaseOrder.approve',
    'PurchaseOrder.reject',
    'PurchaseOrderLine.read',
    'PurchaseOrderLine.create',
    'PurchaseOrderLine.update',
    'Expense.read',
    'Expense.create',
    'Expense.update',
    'Expense.soft_delete',
    'Expense.restore',
    'Expense.hard_delete',
    'Expense.approve',
    'Expense.reject',
    'ExpenseLine.read',
    'ExpenseLine.create',
    'ExpenseLine.update',
    'ExpenseReceipt.read',
    'ExpenseReceipt.create',
    'ExpenseReceipt.update',
    'PayrollRun.read',
    'PayrollRun.create',
    'PayrollRun.update',
    'PayrollRun.soft_delete',
    'PayrollRun.restore',
    'PayrollRun.approve',
    'PayrollRun.reject',
    'PayrollItem.read',
    'PayrollItem.create',
    'PayrollItem.update',
    'ClockInClockOut.read',
    'ClockInClockOut.create',
    'ClockInClockOut.update',
    'ClockInClockOut.approve',
    'ClockInClockOut.reject',
    'Schedule.read',
    'Schedule.create',
    'Schedule.update',
    'Schedule.soft_delete',
    'Schedule.restore',
    'Schedule.hard_delete',
    'Schedule.publish',
    'ScheduleException.read',
    'ScheduleException.create',
    'ScheduleException.update',
    'ScheduleException.approve',
    'ScheduleException.reject',
    'Leave.read',
    'Leave.create',
    'Leave.update',
    'Leave.approve',
    'Leave.reject',
    'Timesheet.read',
    'Timesheet.create',
    'Timesheet.update',
    'Timesheet.approve',
    'Timesheet.reject',
    'TimesheetEntry.read',
    'TimesheetEntry.create',
    'TimesheetEntry.update',
    'InventoryItem.read',
    'InventoryItem.create',
    'InventoryItem.update',
    'InventoryItem.soft_delete',
    'InventoryItem.restore',
    'InventoryItem.hard_delete',
    'InventoryItem.assign',
    'InventoryItem.unassign',
    'InventoryItem.transfer',
    'InventoryTransaction.read',
    'InventoryTransaction.create',
    'InventoryTransaction.update',
    'InventoryTransaction.soft_delete',
    'InventoryTransaction.restore',
    'InventoryAdjustment.read',
    'InventoryAdjustment.create',
    'InventoryAdjustment.update',
    'InventoryAdjustment.approve',
    'InventoryAdjustment.reject',
    'Asset.read',
    'Asset.create',
    'Asset.update',
    'Asset.soft_delete',
    'Asset.restore',
    'Asset.hard_delete',
    'Asset.assign',
    'Asset.unassign',
    'Asset.transfer',
    'AssetAssignment.read',
    'AssetAssignment.create',
    'AssetAssignment.update',
    'AssetAssignment.assign',
    'AssetAssignment.unassign',
    'Channel.read',
    'Channel.create',
    'Channel.update',
    'Channel.soft_delete',
    'Channel.restore',
    'Channel.hard_delete',
    'Channel.archive',
    'ChannelMember.read',
    'ChannelMember.create',
    'ChannelMember.assign',
    'ChannelMember.unassign',
    'DirectChat.read',
    'DirectChat.create',
    'DirectChat.update',
    'DirectChat.soft_delete',
    'DirectChat.restore',
    'DirectChat.hard_delete',
    'DirectMessage.read',
    'DirectMessage.create',
    'DirectMessage.update',
    'DirectMessage.soft_delete',
    'DirectMessage.restore',
    'Notification.read',
    'NotificationPreference.read',
    'NotificationPreference.update',
    'NotificationTemplate.read',
    'NotificationTemplate.create',
    'NotificationTemplate.update',
    'FileObject.read',
    'FileObject.create',
    'FileObject.update',
    'FileObject.soft_delete',
    'FileObject.restore',
    'FileObject.hard_delete',
    'Attachment.read',
    'Attachment.create',
    'Attachment.update',
    'Attachment.soft_delete',
    'Attachment.restore',
    'Attachment.hard_delete',
    'ContractTemplate.read',
    'ContractTemplate.create',
    'ContractTemplate.update',
    'ContractTemplate.soft_delete',
    'ContractTemplate.restore',
    'ContractTemplate.hard_delete',
    'TermsTemplate.read',
    'TermsTemplate.create',
    'TermsTemplate.update',
    'TermsTemplate.soft_delete',
    'TermsTemplate.restore',
    'TermsTemplate.hard_delete',
    'Vendor.read',
    'Vendor.create',
    'Vendor.update',
    'Vendor.soft_delete',
    'Vendor.restore',
    'Vendor.hard_delete',
    'VendorContact.read',
    'VendorContact.create',
    'VendorContact.update',
    'Contract.read',
    'Contract.create',
    'Contract.update',
    'Contract.send',
    'Contract.approve',
    'Contract.reject',
    'AIAction.read',
    'AIAction.create',
    'AIAction.update',
    'AIAction.activate',
    'AIAction.deactivate',
    'AIActionRun.read',
    'AIActionRun.create',
    'AIActionRun.update',
    'AIJob.read',
    'AIJob.create',
    'AIJob.update',
    'AIJobArtifact.read',
    'AIJobArtifact.create',
    'AIJobArtifact.update',
    'AIInsight.read',
    'AIInsight.create',
    'AIInsight.update',
    'AIInsightFeedback.read',
    'AIInsightFeedback.create',
    'AIInsightFeedback.update',
    'ApprovalRequest.read',
    'ApprovalRequest.create',
    'ApprovalRequest.update',
    'ApprovalRequest.submit',
    'ApprovalRequest.approve',
    'ApprovalRequest.reject',
    'ApprovalDecision.read',
    'ApprovalDecision.create',
    'ApprovalRule.read',
    'ApprovalRule.create',
    'ApprovalRule.update',
    'Location.read',
    'Location.create',
    'Location.update',
    'PriceList.read',
    'PriceList.create',
    'PriceList.update',
    'PriceListItem.read',
    'PriceListItem.create',
    'PriceListItem.update',
    'CostCenter.read',
    'CostCenter.create',
    'CostCenter.update',
    'CostCategory.read',
    'CostCategory.create',
    'CostCategory.update',
    'TenantAuditLog.read',
    'ExportJob.read',
    'ExportJob.create',
    'ReportDefinition.read',
    'ReportDefinition.create',
    'ReportDefinition.update',
    'DashboardDefinition.read',
    'DashboardDefinition.create',
    'DashboardDefinition.update'
  ]
} as const;


/**
 * Utility Types and Interfaces
 * Generated from RBAC.schema.v7.yml
 */

export interface RbacContext {
  roles: RoleCode[];
  permissions: Permission[];
  tenantId: string | null;
  userId: string;
}

export interface RbacCheck {
  hasRole(role: RoleCode | RoleCode[]): boolean;
  hasPermission(permission: Permission | Permission[]): boolean;
  hasAnyRole(roles: RoleCode[]): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllRoles(roles: RoleCode[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}

export interface MemberProfile {
  id: string;
  userId: string;
  tenantId: string;
  roles: RoleCode[];
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGuardProps {
  permissions: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface RoleGuardProps {
  roles: RoleCode | RoleCode[];
  fallback?: React.ReactNode; 
  children: React.ReactNode;
}