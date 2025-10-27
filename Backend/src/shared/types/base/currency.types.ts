/**
 * Currency Types - Multi-currency support and financial calculations
 *
 * Depends on Prisma Tables: Currency, CurrencyRate, CurrencyConfig
 * Depends on Prisma Enums: CurrencyCode, CurrencyRateSource, CurrencyRateStatus, CurrencyRateType
 *
 * Purpose: Multi-currency financial operations, exchange rates, and currency conversions across all modules
 */

import type {
  CurrencyCode,
  CurrencyRateSource,
  CurrencyRateStatus,
  CurrencyRateType,
} from "@prisma/client";

/**
 * Base currency information
 * Maps to Prisma Currency table core fields
 */
export interface CurrencyBase {
  /** ISO 4217 currency code (USD, EUR, etc.) */
  code: CurrencyCode;
  /** Currency display name */
  name: string;
  /** Currency symbol ($, €, £, etc.) */
  symbol: string;
  /** Number of decimal places */
  decimalPlaces: number;
  /** Whether currency is active */
  isActive: boolean;
  /** Currency type (FIAT, CRYPTO, COMMODITY) */
  type: string;
  /** Country/region code */
  countryCode?: string;
  /** Formatting rules */
  formatting?: CurrencyFormatting;
}

/**
 * Currency formatting configuration
 * Defines how currency values should be displayed
 */
export interface CurrencyFormatting {
  /** Decimal separator (. or ,) */
  decimalSeparator: string;
  /** Thousands separator (, or . or space) */
  thousandsSeparator: string;
  /** Symbol position (BEFORE, AFTER) */
  symbolPosition: "BEFORE" | "AFTER";
  /** Space between symbol and amount */
  symbolSpacing: boolean;
  /** Number format pattern */
  pattern?: string;
}

/**
 * Exchange rate information
 * Maps to Prisma CurrencyRate table
 */
export interface CurrencyRateBase {
  /** Rate identifier */
  id: string;
  /** Base currency code */
  fromCurrency: string;
  /** Target currency code */
  toCurrency: string;
  /** Exchange rate value */
  rate: number;
  /** Rate type (SPOT, FORWARD, HISTORICAL) */
  rateType: string;
  /** Rate source (BANK, API, MANUAL) */
  source: string;
  /** Rate effective date */
  effectiveDate: Date;
  /** Rate expiry date */
  expiryDate?: Date;
  /** Whether rate is active */
  isActive: boolean;
  /** Bid rate (for trading) */
  bidRate?: number;
  /** Ask rate (for trading) */
  askRate?: number;
  /** Rate provider/source name */
  provider?: string;
}

/**
 * Currency configuration for tenant
 * Maps to Prisma CurrencyConfig table
 */
export interface CurrencyConfigBase {
  /** Associated tenant ID */
  tenantId: string;
  /** Base/default currency */
  baseCurrency: string;
  /** Supported currencies */
  supportedCurrencies: string[];
  /** Default rounding mode */
  defaultRounding: string;
  /** Rate update frequency (minutes) */
  rateUpdateFrequency?: number;
  /** Rate tolerance percentage */
  rateTolerance?: number;
  /** Whether auto-conversion is enabled */
  autoConversionEnabled: boolean;
  /** Rate provider configuration */
  rateProvider?: string;
  /** Rate provider API key */
  rateProviderApiKey?: string;
}

/**
 * Money amount with currency
 * Standard structure for representing monetary values
 */
export interface MoneyAmount {
  /** Numeric amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Formatted display string */
  formatted?: string;
}

/**
 * Currency conversion request
 * Used for converting between currencies
 */
export interface CurrencyConversionRequest {
  /** Amount to convert */
  amount: number;
  /** Source currency */
  fromCurrency: string;
  /** Target currency */
  toCurrency: string;
  /** Conversion date (defaults to current) */
  conversionDate?: Date;
  /** Rate type to use */
  rateType?: string;
  /** Rounding precision */
  precision?: number;
}

/**
 * Currency conversion result
 * Result of currency conversion operation
 */
export interface CurrencyConversionResult {
  /** Original amount */
  originalAmount: MoneyAmount;
  /** Converted amount */
  convertedAmount: MoneyAmount;
  /** Exchange rate used */
  exchangeRate: number;
  /** Conversion date */
  conversionDate: Date;
  /** Rate source */
  rateSource: string;
  /** Whether conversion was successful */
  success: boolean;
  /** Error message if conversion failed */
  error?: string;
}

/**
 * Multi-currency amount
 * Represents the same value in multiple currencies
 */
export interface MultiCurrencyAmount {
  /** Base amount and currency */
  base: MoneyAmount;
  /** Equivalent amounts in other currencies */
  equivalents: MoneyAmount[];
  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Currency rate update result
 * Result of updating exchange rates
 */
export interface CurrencyRateUpdateResult {
  /** Number of rates updated */
  updatedCount: number;
  /** Number of new rates added */
  addedCount: number;
  /** Number of failed updates */
  failedCount: number;
  /** Update timestamp */
  updateTimestamp: Date;
  /** Rate provider used */
  provider: string;
  /** Error messages if any */
  errors?: string[];
}

/**
 * Currency validation rules
 * Defines validation rules for currency operations
 */
export interface CurrencyValidationRules {
  /** Minimum amount allowed */
  minAmount?: number;
  /** Maximum amount allowed */
  maxAmount?: number;
  /** Allowed currencies for this context */
  allowedCurrencies?: string[];
  /** Forbidden currencies */
  forbiddenCurrencies?: string[];
  /** Require rate within tolerance */
  requireRecentRate?: boolean;
  /** Maximum rate age in hours */
  maxRateAgeHours?: number;
}

/**
 * Currency context for operations
 * Provides currency context for financial operations
 */
export interface CurrencyContext {
  /** Associated tenant ID */
  tenantId: string;
  /** Default currency for operations */
  defaultCurrency: string;
  /** User's preferred currency */
  userCurrency?: string;
  /** Supported currencies */
  supportedCurrencies: string[];
  /** Current exchange rates */
  currentRates?: CurrencyRateBase[];
  /** Validation rules */
  validationRules?: CurrencyValidationRules;
}
