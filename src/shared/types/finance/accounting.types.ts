/**
 * Accounting Types
 *
 * Tenant-scoped accounting representation for ledgers and journal entries.
 * Aligns with GLAccount, JournalEntry, JournalLine, and Reconciliation tables.
 *
 * Provides enterprise-grade accounting foundation with proper audit trails
 * and multi-tenant isolation. Supports standard accounting practices with
 * debit/credit indicators and account classifications.
 *
 * @category Finance Types
 * @subcategory Accounting & Ledger
 */

import {
  DebitCreditIndicator,
  GLAccountType,
  GLAccountCategory,
  GLAccountStatus,
  JournalEntryType,
  JournalEntryStatus,
  JournalEntrySource,
  JournalLineStatus,
} from "@prisma/client";
import { Money } from "./money.types";

/**
 * General Ledger Account definition with hierarchy support
 *
 * Represents the chart of accounts structure with parent-child relationships.
 * Aligns with GLAccount table and supports multi-level account hierarchies.
 *
 * @example
 * ```typescript
 * const cashAccount: GLAccountDefinition = {
 *   accountCode: '1000',
 *   accountName: 'Cash - Operating',
 *   accountType: 'ASSET',
 *   accountCategory: 'CURRENT_ASSET',
 *   normalBalance: 'DEBIT',
 *   isActive: true
 * };
 * ```
 */
export interface GLAccountDefinition {
  /** Unique account code (e.g., "1000", "4000") */
  accountCode: string;

  /** Account display name */
  accountName: string;

  /** Account description for clarity */
  description?: string;

  /** Account type from Prisma enum */
  accountType: GLAccountType;

  /** Account category for reporting */
  accountCategory: GLAccountCategory;

  /** Normal balance side (debit or credit) */
  normalBalance: DebitCreditIndicator;

  /** Account status */
  status: GLAccountStatus;

  /** Parent account for hierarchy */
  parentAccountCode?: string;

  /** Account level in hierarchy (1 = top level) */
  accountLevel: number;

  /** Full hierarchical path */
  fullPath: string;

  /** Whether this is a parent account */
  isParentAccount: boolean;

  /** Whether this account accepts direct entries */
  isDetailAccount: boolean;

  /** Whether account is currently active */
  isActive: boolean;

  /** Account configuration flags */
  configuration: {
    requiresProject: boolean;
    requiresCostCode: boolean;
    allowManualEntry: boolean;
    isSystemAccount: boolean;
    allowMultiCurrency: boolean;
  };

  /** Module-specific flags */
  moduleFlags: {
    isEstimatingAccount: boolean;
    isBillingAccount: boolean;
    isPayrollAccount: boolean;
    isProcurementAccount: boolean;
  };

  /** Currency settings */
  baseCurrency: string;

  /** Current balances */
  balances?: {
    currentBalance?: number;
    ytdBalance?: number;
    lastTransactionAt?: Date;
  };
}

/**
 * Journal entry header with metadata and approval workflow
 *
 * Represents a complete journal entry with all associated lines.
 * Aligns with JournalEntry table and supports approval workflows.
 */
export interface JournalEntryDefinition {
  /** Entry reference number */
  entryNumber: string;

  /** Entry description */
  description: string;

  /** Entry type from Prisma enum */
  entryType: JournalEntryType;

  /** Current status */
  status: JournalEntryStatus;

  /** Source of the entry */
  source: JournalEntrySource;

  /** Transaction date */
  transactionDate: Date;

  /** Posting date (when entry was posted) */
  postingDate?: Date;

  /** Accounting period */
  period: string;

  /** Fiscal year */
  fiscalYear: number;

  /** Total debit amount for validation */
  totalDebits: Money;

  /** Total credit amount for validation */
  totalCredits: Money;

  /** Whether entry is balanced (debits = credits) */
  isBalanced: boolean;

  /** Whether entry is posted to GL */
  isPosted: boolean;

  /** Whether entry is system-generated */
  isSystemGenerated: boolean;

  /** Approval workflow status */
  approvalStatus?: {
    isApprovalRequired: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    approvalComments?: string;
  };

  /** Source document reference */
  sourceDocument?: {
    documentType: string;
    documentId: string;
    documentNumber?: string;
  };

  /** Reversal information */
  reversalInfo?: {
    isReversed: boolean;
    reversalDate?: Date;
    reversedBy?: string;
    reversalReason?: string;
    originalEntryId?: string;
  };
}

/**
 * Individual journal line item with account and amount details
 *
 * Represents a single line within a journal entry.
 * Aligns with JournalLine table and supports project/cost center allocation.
 */
export interface JournalLineDefinition {
  /** Line sequence number within entry */
  lineNumber: number;

  /** Line description */
  description: string;

  /** Account code being debited/credited */
  accountCode: string;

  /** Debit or credit indicator */
  debitCreditIndicator: DebitCreditIndicator;

  /** Line amount */
  amount: Money;

  /** Line status */
  status: JournalLineStatus;

  /** Project allocation (optional) */
  projectId?: string;

  /** Cost center allocation (optional) */
  costCenterId?: string;

  /** Department allocation (optional) */
  departmentId?: string;

  /** Additional dimensions for reporting */
  dimensions?: {
    dimension1?: string;
    dimension2?: string;
    dimension3?: string;
  };

  /** Tax information (if applicable) */
  taxInfo?: {
    taxable: boolean;
    taxCode?: string;
    taxAmount?: Money;
  };

  /** Quantity and unit information (for inventory) */
  quantityInfo?: {
    quantity?: number;
    unitOfMeasure?: string;
    unitPrice?: Money;
  };
}

/**
 * Bank reconciliation definition with matching logic
 *
 * Represents bank statement reconciliation process.
 * Aligns with Reconciliation and BankStatementLine tables.
 */
export interface ReconciliationDefinition {
  /** Reconciliation period */
  reconciliationDate: Date;

  /** Bank account being reconciled */
  bankAccountId: string;

  /** Statement information */
  statement: {
    statementDate: Date;
    beginningBalance: Money;
    endingBalance: Money;
    statementNumber?: string;
  };

  /** Book balance information */
  bookBalance: {
    balanceDate: Date;
    bookBalance: Money;
    adjustedBookBalance: Money;
  };

  /** Outstanding items */
  outstandingItems: {
    outstandingChecks: Money;
    depositsInTransit: Money;
    otherAdjustments: Money;
  };

  /** Reconciliation status */
  status: {
    isReconciled: boolean;
    reconciledAt?: Date;
    reconciledBy?: string;
    variance?: Money;
  };

  /** Adjusting entries needed */
  adjustingEntries?: {
    bankCharges?: Money;
    interestEarned?: Money;
    nsfChecks?: Money;
    otherAdjustments?: Money;
  };
}

/**
 * Account balance summary for reporting
 *
 * Provides standardized balance information for financial reporting.
 * Supports trial balance and financial statement generation.
 */
export interface AccountBalanceSummary {
  /** Account identification */
  accountCode: string;
  accountName: string;
  accountType: GLAccountType;
  accountCategory: GLAccountCategory;

  /** Balance information */
  beginningBalance: Money;
  currentBalance: Money;
  endingBalance: Money;

  /** Period activity */
  periodActivity: {
    totalDebits: Money;
    totalCredits: Money;
    netChange: Money;
  };

  /** Year-to-date activity */
  ytdActivity: {
    ytdDebits: Money;
    ytdCredits: Money;
    ytdNetChange: Money;
  };

  /** Balance date and period */
  asOfDate: Date;
  fiscalYear: number;
  period: string;
}

/**
 * Trial balance data structure
 *
 * Represents a complete trial balance with all account balances.
 * Ensures debits equal credits for accounting integrity.
 */
export interface TrialBalance {
  /** Trial balance date */
  asOfDate: Date;

  /** Fiscal period information */
  period: string;
  fiscalYear: number;

  /** Account balances */
  accounts: AccountBalanceSummary[];

  /** Control totals */
  totals: {
    totalDebits: Money;
    totalCredits: Money;
    isBalanced: boolean;
    variance?: Money;
  };

  /** Trial balance metadata */
  generatedAt: Date;
  generatedBy: string;
  includeInactiveAccounts: boolean;
}
