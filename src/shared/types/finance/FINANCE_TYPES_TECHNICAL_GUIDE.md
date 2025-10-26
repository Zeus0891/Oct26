# Finance Types — Technical Architecture Guide

This guide documents the technical design and usage of the Finance shared types. It complements the Finance README by focusing on contracts, Prisma alignment, data integrity, and cross-domain interactions.

## Scope

Finance types standardize data contracts for:

- Money and currency primitives
- Accounting (GL accounts, journal entries, reconciliation)
- Currency rate management
- Billing, invoicing, payments, refunds, chargebacks

All types are tenant-aware, RBAC-friendly, and audit-first.

## Contracts at a Glance

- Inputs
  - Money: amount (number), currency (CurrencyCode), precision (optional)
  - Accounting: GLAccountDefinition, JournalEntryDefinition, JournalLineDefinition
  - Currency Rates: CurrencyRateRequest, CurrencyRateDefinition
  - Billing: InvoiceDefinition, PaymentDefinition, CreditMemoDefinition
- Outputs
  - MoneyCalculationResult, TrialBalance, CurrencyRateResponse, PaymentApplicationDefinition
- Error modes
  - ValidationError (business rule violations)
  - ReconciliationError (accounting reconciliation only)
  - PaymentGatewayError (billing/payments)
- Success criteria
  - Enum-backed fields always use Prisma enums
  - All mutations carry audit metadata (actor, timestamps, reason)

## Prisma Alignment

All enum-backed fields import from @prisma/client. Highlights:

- Money: CurrencyCode
- Accounting: DebitCreditIndicator, GLAccountType, GLAccountCategory, GLAccountStatus, JournalEntryType, JournalEntryStatus, JournalEntrySource, JournalLineStatus
- Currency Rates: CurrencyRateType, CurrencyRateSource, CurrencyRateStatus, CurrencyCode
- Billing: PaymentMethod, BillingAccountStatus, PaymentStatus, PaymentTerms, PaymentMethodType, RefundStatus, ChargebackStatus, InvoiceStatus, CreditMemoStatus, InvoiceTaxType

Never redefine these enums locally.

## Data Integrity Rules

- Money
  - Preserve precision; never cast amounts to integers
  - CurrencyCode is mandatory for all Money values
- Accounting
  - Journal entries must balance: sum(debits) === sum(credits)
  - GL account normalBalance is enforced for validation and reporting
  - Posting restrictions by JournalEntryStatus and approval state
- Currency Rates
  - Historical tracking required; immutable once recorded
  - Rate source and confidence must be retained for audit and analytics
  - Bulk updates are atomic per tenant and rateType
- Billing & Payments
  - InvoiceStatus lifecycle enforced (DRAFT → SENT → PARTIALLY_PAID/PAID → CLOSED)
  - PaymentStatus lifecycles reflect gateway outcomes and retries
  - Refunds and chargebacks produce counter-postings via accounting integration

## Cross-Domain Interactions

- Security (RBAC)
  - Posting journals, issuing refunds, or writing rates require specific permissions
  - Access decisions use security/access.types and permission.types
- Workflow
  - Approvals for journal posting or credit memos use workflow/approval-flow.types
  - Status transitions for invoices leverage workflow/status.types
- Catalogs
  - Currency metadata and display formatting via catalogs/currency.ts
- Base
  - Audit metadata, tenant context, and actor details via base/audit.types and base/actor.types

## Usage Patterns

- Prefer barrel imports: import { Money, InvoiceDefinition } from "@/shared/types/finance"
- Keep API boundaries enum-strong: do not accept string statuses at edges
- Compose financial operations with explicit context types (e.g., MoneyValidationContext)

## Edge Cases to Consider

1. Currency precision mismatches between source and target currency
2. Stale or missing currency rates (allowFallback, acceptManualRates)
3. Partial payments and rounding remainders on invoices
4. Journal line allocations that break balancing constraints
5. Payment gateway async confirmations and idempotency

## Minimal Examples

- Money Conversion

```ts
import { CurrencyCode } from "@prisma/client";
import { Money, CurrencyConversion } from "@/shared/types/finance";

const usd: Money = { amount: 1500.5, currency: CurrencyCode.USD, precision: 2 };
const eur: Money = {
  amount: 1268.17,
  currency: CurrencyCode.EUR,
  precision: 2,
};

const conversion: CurrencyConversion = {
  originalAmount: usd,
  convertedAmount: eur,
  exchangeRate: 0.8456,
  conversionDate: new Date(),
  rateSource: "API_SERVICE",
};
```

- Journal Entry Balance Check

```ts
import { DebitCreditIndicator } from "@prisma/client";
import {
  JournalEntryDefinition,
  JournalLineDefinition,
} from "@/shared/types/finance";

const lines: JournalLineDefinition[] = [
  { accountCode: "1000", amount: 200, indicator: DebitCreditIndicator.DEBIT },
  { accountCode: "4000", amount: 200, indicator: DebitCreditIndicator.CREDIT },
];

const entry: JournalEntryDefinition = { entryNumber: "JE-2024-001", lines };
```

- Invoice + Payment

```ts
import {
  InvoiceStatus,
  PaymentStatus,
  PaymentMethodType,
  PaymentTerms,
} from "@prisma/client";
import { InvoiceDefinition, PaymentDefinition } from "@/shared/types/finance";

const invoice: InvoiceDefinition = {
  invoiceNumber: "INV-2024-001",
  status: InvoiceStatus.SENT,
  paymentTerms: PaymentTerms.NET_30,
};

const payment: PaymentDefinition = {
  paymentNumber: "PAY-2024-001",
  status: PaymentStatus.COMPLETED,
  paymentMethod: {
    methodType: PaymentMethodType.CREDIT_CARD,
    provider: "STRIPE",
  },
};
```

## Validation Checklist

- Prisma enums only for enum-backed fields: PASS
- Barrel exports used in imports: PASS
- Tenant and audit metadata present on mutations: PASS
- Money precision preserved: PASS
- Journal balancing validated: PASS

## References

- README: ./README.md
- Prisma schema: ../../prisma/schema.prisma
- Related domains: ../base, ../catalogs, ../workflow, ../security
