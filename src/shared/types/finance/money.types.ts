/**
 * Money and Currency Types
 *
 * Defines lightweight money primitive and currency handling for financial operations.
 * Used by all financial tables: Invoice, Estimate, Payment, PayrollItem.
 *
 * Provides tenant-aware currency handling with precision support.
 * Aligns with Prisma schema CurrencyCode enum.
 *
 * @category Finance Types
 * @subcategory Money & Currency
 */

import { CurrencyCode } from "@prisma/client";

/**
 * Standardized money representation with currency and precision
 *
 * Used across all financial entities for consistent money handling.
 * Provides decimal precision with proper rounding and formatting.
 *
 * @example
 * ```typescript
 * const amount: Money = {
 *   amount: 1500.50,
 *   currency: 'USD',
 *   precision: 2
 * };
 * ```
 */
export interface Money {
  /** Monetary amount with decimal precision */
  amount: number;

  /** Currency code aligned with Prisma CurrencyCode enum */
  currency: CurrencyCode;

  /** Decimal places for currency precision (default: 2) */
  precision?: number;
}

/**
 * Money summary with breakdown for complex financial calculations
 *
 * Provides detailed breakdown of totals including tax, discounts, and fees.
 * Used in invoices, estimates, and payment processing.
 */
export interface MoneySummary {
  /** Base subtotal before taxes and adjustments */
  subtotal: Money;

  /** Total tax amount */
  taxTotal: Money;

  /** Total discount amount (negative value) */
  discountTotal: Money;

  /** Additional fees and charges */
  feeTotal: Money;

  /** Final total amount */
  total: Money;
}

/**
 * Currency conversion context for multi-currency operations
 *
 * Supports tenant-specific currency preferences and exchange rates.
 * Integrates with CurrencyRate table for accurate conversions.
 */
export interface CurrencyConversion {
  /** Original money amount */
  originalAmount: Money;

  /** Converted money amount */
  convertedAmount: Money;

  /** Exchange rate used for conversion */
  exchangeRate: number;

  /** Conversion timestamp */
  conversionDate: Date;

  /** Rate source for audit trail */
  rateSource?: string;
}

/**
 * Money calculation result with detailed breakdown
 *
 * Provides comprehensive calculation context for audit and verification.
 * Includes all intermediate calculations and applied rates.
 */
export interface MoneyCalculationResult {
  /** Input amounts used in calculation */
  inputs: Money[];

  /** Applied rates and percentages */
  rates: {
    taxRate?: number;
    discountRate?: number;
    exchangeRate?: number;
  };

  /** Intermediate calculation steps */
  breakdown: {
    baseAmount: Money;
    adjustments: Money[];
    finalAmount: Money;
  };

  /** Calculation metadata */
  calculatedAt: Date;
  calculatedBy?: string;
}

/**
 * Tenant-specific currency configuration
 *
 * Defines currency preferences and formatting rules per tenant.
 * Supports multi-currency operations with proper localization.
 */
export interface TenantCurrencyConfig {
  /** Tenant's default currency */
  defaultCurrency: CurrencyCode;

  /** Supported currencies for this tenant */
  supportedCurrencies: CurrencyCode[];

  /** Currency display preferences */
  displayPreferences: {
    symbolPosition: "before" | "after";
    thousandsSeparator: string;
    decimalSeparator: string;
    decimalPlaces: number;
  };

  /** Multi-currency handling settings */
  multiCurrencyEnabled: boolean;
  autoConversion: boolean;
}

/**
 * Money validation context for business rules
 *
 * Defines validation parameters for financial amounts.
 * Ensures compliance with business rules and limits.
 */
export interface MoneyValidationContext {
  /** Minimum allowed amount */
  minAmount?: Money;

  /** Maximum allowed amount */
  maxAmount?: Money;

  /** Allowed currencies for this context */
  allowedCurrencies?: CurrencyCode[];

  /** Required precision level */
  requiredPrecision?: number;

  /** Business context for validation */
  context: "invoice" | "payment" | "estimate" | "expense" | "payroll" | "other";
}
