/**
 * Billing and Payment Types
 *
 * Billing flows with RBAC-aware approval workflows and comprehensive payment processing.
 * Aligns with Invoice, InvoiceLineItem, CreditMemo, Payment, and Refund tables.
 *
 * Provides enterprise-grade billing and payment processing foundation with
 * multi-payment method support, dunning management, and chargeback handling.
 * Includes full audit trails and approval workflows.
 *
 * @category Finance Types
 * @subcategory Billing & Payments
 */

import type {
  PaymentMethod,
  BillingAccountStatus,
  PaymentStatus,
  PaymentTerms,
  PaymentMethodType,
  RefundStatus,
  ChargebackStatus,
  InvoiceStatus,
  CreditMemoStatus,
  InvoiceTaxType,
  InvoiceLineItemType,
  DunningLevel,
  DunningNoticeStatus,
} from "@prisma/client";

/**
 * Payment direction enumeration
 */
export type PaymentDirection = "INBOUND" | "OUTBOUND" | "TRANSFER" | "REFUND";

/**
 * Additional billing-related types
 */
export type BillingFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_TIME";
export type BillingAccountType = "CUSTOMER" | "VENDOR" | "INTERNAL";
export type PaymentType = "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK" | "CASH";
export type PaymentFailureReason =
  | "INSUFFICIENT_FUNDS"
  | "EXPIRED_CARD"
  | "DECLINED"
  | "FRAUD";
export type RefundReason =
  | "CUSTOMER_REQUEST"
  | "DUPLICATE_PAYMENT"
  | "ERROR_CORRECTION";
export type ChargebackReason =
  | "FRAUD"
  | "DISPUTE"
  | "AUTHORIZATION"
  | "PROCESSING_ERROR";
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
export type DisputeReason =
  | "BILLING_ERROR"
  | "SERVICE_ISSUE"
  | "QUALITY_CONCERN";
export type BillingPeriod =
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUALLY"
  | "ANNUALLY";
export type InvoiceType =
  | "STANDARD"
  | "PROFORMA"
  | "CREDIT_NOTE"
  | "DEBIT_NOTE";
export type CreditMemoReason =
  | "RETURN"
  | "DISCOUNT"
  | "ERROR_CORRECTION"
  | "GOODWILL";
// InvoiceLineItemType now provided by Prisma enum
export type PaymentProvider = "STRIPE" | "PAYPAL" | "SQUARE" | "BANK_TRANSFER";
// DunningLevel and DunningNoticeStatus now provided by Prisma enums
import { Money, MoneySummary } from "./money.types";

/**
 * Invoice definition with comprehensive billing details
 *
 * Represents a complete invoice with line items, taxes, and payment tracking.
 * Aligns with Invoice and InvoiceLineItem tables and supports approval workflows.
 *
 * @example
 * ```typescript
 * const invoice: InvoiceDefinition = {
 *   invoiceNumber: 'INV-2024-001',
 *   customerId: 'cust-123',
 *   status: 'SENT',
 *   issueDate: new Date('2024-01-15'),
 *   dueDate: new Date('2024-02-14'),
 *   paymentTerms: 'NET_30'
 * };
 * ```
 */
export interface InvoiceDefinition {
  /** Invoice number (unique within tenant) */
  invoiceNumber: string;

  /** Customer/account being billed */
  customerId: string;

  /** Current invoice status */
  status: InvoiceStatus;

  /** Invoice dates and terms */
  dates: {
    issueDate: Date;
    dueDate: Date;
    serviceDate?: Date;
    periodStart?: Date;
    periodEnd?: Date;
  };

  /** Payment terms and conditions */
  paymentTerms: PaymentTerms;

  /** Invoice totals and summary */
  totals: MoneySummary;

  /** Payment tracking */
  paymentInfo: {
    amountPaid: Money;
    amountDue: Money;
    lastPaymentDate?: Date;
    paymentCount: number;
  };

  /** Project or job reference */
  projectReference?: {
    projectId: string;
    projectNumber?: string;
    jobId?: string;
  };

  /** Billing address and contact */
  billingDetails: {
    billingAddress: {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    contactInfo?: {
      contactName?: string;
      email?: string;
      phone?: string;
    };
  };

  /** Invoice notes and terms */
  notes?: {
    publicNotes?: string;
    privateNotes?: string;
    termsAndConditions?: string;
  };

  /** Approval workflow */
  approvalStatus?: {
    requiresApproval: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    approvalComments?: string;
  };

  /** Recurring billing information */
  recurringInfo?: {
    isRecurring: boolean;
    parentInvoiceId?: string;
    recurrencePattern?: string;
    nextInvoiceDate?: Date;
  };
}

/**
 * Invoice line item with detailed breakdown
 *
 * Represents individual items or services on an invoice.
 * Supports quantity-based and time-based billing with tax calculations.
 */
export interface InvoiceLineItemDefinition {
  /** Line item sequence number */
  lineNumber: number;

  /** Line item type */
  itemType: InvoiceLineItemType;

  /** Item or service description */
  description: string;

  /** Quantity and pricing */
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;

  /** Product or service reference */
  itemReference?: {
    itemId?: string;
    itemCode?: string;
    itemName?: string;
  };

  /** Tax information */
  taxInfo: {
    taxType: InvoiceTaxType;
    taxable: boolean;
    taxRate?: number;
    taxAmount?: Money;
    taxCode?: string;
  };

  /** Project allocation */
  projectAllocation?: {
    projectId: string;
    phaseId?: string;
    taskId?: string;
    costCodeId?: string;
  };

  /** Time tracking (for labor items) */
  timeTracking?: {
    startDate: Date;
    endDate: Date;
    totalHours: number;
    billableHours: number;
    hourlyRate: Money;
  };

  /** Discount information */
  discount?: {
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    discountAmount: Money;
    discountReason?: string;
  };

  /** Line item notes */
  notes?: string;
}

/**
 * Credit memo definition for billing adjustments
 *
 * Represents credit memos, returns, and billing adjustments.
 * Aligns with CreditMemo table and supports various credit scenarios.
 */
export interface CreditMemoDefinition {
  /** Credit memo number */
  creditMemoNumber: string;

  /** Related invoice (if applicable) */
  originalInvoiceId?: string;

  /** Credit memo status */
  status: CreditMemoStatus;

  /** Customer receiving credit */
  customerId: string;

  /** Credit memo dates */
  creditDate: Date;
  issueDate: Date;

  /** Credit amount and details */
  creditAmount: Money;
  creditReason: string;

  /** Credit application */
  application: {
    appliedToInvoice?: string;
    appliedAmount?: Money;
    remainingCredit?: Money;
    autoApply: boolean;
  };

  /** Approval workflow */
  approvalInfo: {
    requiresApproval: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    approvalLevel?: string;
  };
}

/**
 * Payment definition with comprehensive processing details
 *
 * Represents payment transactions with full audit trail and processing metadata.
 * Aligns with Payment table and supports multiple payment processors.
 */
export interface PaymentDefinition {
  /** Payment reference number */
  paymentNumber: string;

  /** Payment direction (inbound/outbound) */
  direction: PaymentDirection;

  /** Payment status */
  status: PaymentStatus;

  /** Payment amounts */
  paymentAmount: Money;
  appliedAmount: Money;
  unappliedAmount: Money;

  /** Payment method and processing */
  paymentMethod: {
    methodType: PaymentMethodType;
    provider: PaymentProvider;
    processorTransactionId?: string;
    last4Digits?: string;
    expiryDate?: string;
  };

  /** Payment dates */
  paymentDate: Date;
  processedDate?: Date;
  settlementDate?: Date;

  /** Customer/payer information */
  payerInfo: {
    customerId: string;
    payerName: string;
    payerEmail?: string;
    payerAddress?: string;
  };

  /** Payment processing details */
  processingInfo: {
    processorFee?: Money;
    exchangeRate?: number;
    originalAmount?: Money;
    authorizationCode?: string;
    batchId?: string;
  };

  /** Risk and fraud information */
  riskInfo?: {
    riskScore?: number;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    fraudChecks?: string[];
    ipAddress?: string;
    deviceFingerprint?: string;
  };

  /** Payment application to invoices */
  applications: {
    invoiceId: string;
    appliedAmount: Money;
    appliedDate: Date;
  }[];

  /** Refund information */
  refundInfo?: {
    isRefunded: boolean;
    refundAmount?: Money;
    refundDate?: Date;
    refundReason?: string;
  };
}

/**
 * Payment application details for invoice allocation
 *
 * Tracks how payments are applied to specific invoices.
 * Supports partial payments and payment reallocation.
 */
export interface PaymentApplicationDefinition {
  /** Payment being applied */
  paymentId: string;

  /** Invoice receiving payment */
  invoiceId: string;

  /** Application details */
  appliedAmount: Money;
  appliedDate: Date;

  /** Application status */
  status: "APPLIED" | "UNAPPLIED" | "REVERSED";

  /** Discount taken (early payment) */
  discountTaken?: Money;

  /** Write-off amount (if any) */
  writeOffAmount?: Money;

  /** Application notes */
  notes?: string;

  /** Approval information (for adjustments) */
  approvalInfo?: {
    approvedBy: string;
    approvedDate: Date;
    approvalReason: string;
  };
}

/**
 * Dunning notice for collections management
 *
 * Represents collection notices sent for overdue invoices.
 * Aligns with DunningNotice table and supports escalation workflows.
 */
export interface DunningNoticeDefinition {
  /** Notice number */
  noticeNumber: string;

  /** Dunning level/severity */
  dunningLevel: DunningLevel;

  /** Notice status */
  status: DunningNoticeStatus;

  /** Customer being dunned */
  customerId: string;

  /** Related invoices */
  invoices: {
    invoiceId: string;
    invoiceNumber: string;
    originalAmount: Money;
    outstandingAmount: Money;
    daysPastDue: number;
  }[];

  /** Notice dates */
  noticeDate: Date;
  sentDate?: Date;
  responseDate?: Date;

  /** Notice content */
  content: {
    subject: string;
    message: string;
    templateUsed?: string;
  };

  /** Delivery information */
  delivery: {
    method: "EMAIL" | "POSTAL" | "PHONE" | "IN_PERSON";
    deliveredTo: string;
    deliveryConfirmed: boolean;
    deliveryDate?: Date;
  };

  /** Follow-up actions */
  followUp: {
    nextActionDate?: Date;
    nextActionType?: string;
    escalateToLegal?: boolean;
    collectionsAgency?: string;
  };
}

/**
 * Billing cycle definition for recurring billing
 *
 * Defines billing cycles and recurring invoice generation.
 * Supports complex billing schedules and prorations.
 */
export interface BillingCycleDefinition {
  /** Cycle identification */
  cycleId: string;
  cycleName: string;

  /** Billing frequency */
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "CUSTOM";

  /** Cycle dates */
  cycleStart: Date;
  cycleEnd: Date;
  billingDate: Date;
  dueDate: Date;

  /** Customer group */
  customerGroup?: string;

  /** Billing rules */
  rules: {
    proratePartialPeriods: boolean;
    advanceBilling: boolean;
    minimumBillAmount?: Money;
    roundingRule?: "UP" | "DOWN" | "NEAREST";
  };

  /** Usage-based billing */
  usageBilling?: {
    meteringEnabled: boolean;
    usageCutoffDate: Date;
    tierPricing: boolean;
  };

  /** Cycle statistics */
  statistics: {
    customerCount: number;
    totalBilled: Money;
    invoicesGenerated: number;
    failedBillings: number;
  };
}

/**
 * Chargeback definition for dispute management
 *
 * Represents payment chargebacks and dispute resolution.
 * Supports chargeback lifecycle and evidence management.
 */
export interface ChargebackDefinition {
  /** Chargeback identification */
  chargebackId: string;
  chargebackNumber: string;

  /** Related payment */
  originalPaymentId: string;

  /** Chargeback details */
  chargebackAmount: Money;
  reasonCode: string;
  reasonDescription: string;

  /** Important dates */
  chargebackDate: Date;
  responseDeadline: Date;
  resolvedDate?: Date;

  /** Dispute status */
  status:
    | "RECEIVED"
    | "UNDER_REVIEW"
    | "EVIDENCE_SUBMITTED"
    | "WON"
    | "LOST"
    | "WITHDRAWN";

  /** Evidence and documentation */
  evidence: {
    evidenceType: string;
    description: string;
    documentId?: string;
    submittedDate?: Date;
  }[];

  /** Resolution details */
  resolution?: {
    outcome: "MERCHANT_WINS" | "CUSTOMER_WINS" | "SETTLED";
    settlementAmount?: Money;
    resolutionNotes?: string;
  };

  /** Impact assessment */
  impact: {
    feesCharged: Money;
    revenueImpact: Money;
    customerRelationship: "MAINTAINED" | "DAMAGED" | "TERMINATED";
  };
}
