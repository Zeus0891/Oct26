/**
 * Currency Rate Types
 *
 * Exchange rate data with tenant-specific rate overrides and multi-source support.
 * Aligns with CurrencyRate table and related enums for accurate currency conversions.
 *
 * Provides comprehensive exchange rate management with automatic updates,
 * manual overrides, and historical tracking. Supports multiple rate sources
 * and confidence metrics for enterprise-grade currency operations.
 *
 * @category Finance Types
 * @subcategory Currency & Exchange Rates
 */

import {
  CurrencyRateType,
  CurrencyRateSource,
  CurrencyRateStatus,
  CurrencyCode,
} from "@prisma/client";

/**
 * Currency exchange rate definition with metadata and confidence metrics
 *
 * Represents a specific currency exchange rate with full audit trail.
 * Aligns with CurrencyRate table and supports automated rate updates.
 *
 * @example
 * ```typescript
 * const usdToEurRate: CurrencyRateDefinition = {
 *   fromCurrency: 'USD',
 *   toCurrency: 'EUR',
 *   rateType: 'SPOT',
 *   exchangeRate: 0.8456,
 *   effectiveFrom: new Date('2024-01-15'),
 *   source: 'API_SERVICE',
 *   status: 'ACTIVE'
 * };
 * ```
 */
export interface CurrencyRateDefinition {
  /** Source currency code */
  fromCurrency: CurrencyCode;

  /** Target currency code */
  toCurrency: CurrencyCode;

  /** Type of exchange rate */
  rateType: CurrencyRateType;

  /** Current exchange rate */
  exchangeRate: number;

  /** Inverse rate (1 / exchangeRate) for optimization */
  inverseRate?: number;

  /** Rate status */
  status: CurrencyRateStatus;

  /** Rate validity period */
  validity: {
    effectiveFrom: Date;
    effectiveTo?: Date;
    rateDate: Date;
    lastUpdated: Date;
  };

  /** Rate source information */
  source: CurrencyRateSource;

  /** Provider details (for external sources) */
  provider?: {
    providerName: string;
    providerId?: string;
    apiEndpoint?: string;
  };

  /** Rate quality metrics */
  quality: {
    confidence?: number; // 0.0 to 1.0
    volatility?: number;
    dataQuality?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    lastVerifiedAt?: Date;
    verifiedBy?: string;
  };

  /** Rate configuration */
  configuration: {
    isDefault: boolean;
    isManualOverride: boolean;
    autoUpdate: boolean;
    updateFrequency?: string;
  };

  /** Pricing adjustments */
  adjustments?: {
    spread?: number;
    margin?: number;
  };

  /** Additional metadata */
  notes?: string;
}

/**
 * Currency rate request for fetching or calculating rates
 *
 * Defines parameters for rate lookup with fallback options.
 * Supports both real-time and historical rate requests.
 */
export interface CurrencyRateRequest {
  /** Currency pair */
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;

  /** Preferred rate type */
  rateType?: CurrencyRateType;

  /** Rate date (defaults to current date) */
  rateDate?: Date;

  /** Acceptable rate age (in minutes) */
  maxRateAge?: number;

  /** Preferred sources (in order of preference) */
  preferredSources?: CurrencyRateSource[];

  /** Whether to allow fallback to default rates */
  allowFallback: boolean;

  /** Whether to accept manual override rates */
  acceptManualRates: boolean;

  /** Required confidence level (0.0 to 1.0) */
  minConfidence?: number;
}

/**
 * Currency rate response with applied rate and metadata
 *
 * Provides the resolved rate with full context and audit information.
 * Includes fallback information and confidence metrics.
 */
export interface CurrencyRateResponse {
  /** Applied exchange rate */
  appliedRate: CurrencyRateDefinition;

  /** Rate resolution metadata */
  resolution: {
    resolvedAt: Date;
    resolutionMethod: "EXACT_MATCH" | "FALLBACK" | "INTERPOLATED" | "DEFAULT";
    sourceUsed: CurrencyRateSource;
    fallbackChain?: string[];
  };

  /** Rate age and freshness */
  freshness: {
    rateAge: number; // minutes since rate was last updated
    isFresh: boolean;
    stalenessWarning?: string;
  };

  /** Alternative rates (if available) */
  alternatives?: {
    spotRate?: number;
    averageRate?: number;
    budgetRate?: number;
  };
}

/**
 * Currency rate configuration for tenant-specific settings
 *
 * Defines how currency rates are managed and updated for a specific tenant.
 * Supports custom rate sources and update policies.
 */
export interface CurrencyRateConfiguration {
  /** Default rate source priority */
  sourcePriority: CurrencyRateSource[];

  /** Auto-update settings */
  autoUpdate: {
    enabled: boolean;
    frequency: "REAL_TIME" | "HOURLY" | "DAILY" | "WEEKLY";
    updateWindow?: {
      startTime: string; // HH:MM format
      endTime: string;
      timezone: string;
    };
  };

  /** Rate validation rules */
  validation: {
    maxDailyChange?: number; // percentage
    requiresApprovalThreshold?: number; // percentage change
    minConfidenceLevel?: number;
    stalenessThreshold?: number; // hours
  };

  /** Fallback configuration */
  fallback: {
    allowHistoricalRates: boolean;
    maxHistoricalDays: number;
    useManualRatesAsBackup: boolean;
    defaultRateSource?: CurrencyRateSource;
  };

  /** Notification settings */
  notifications: {
    onRateUpdate: boolean;
    onValidationFailure: boolean;
    onFallbackUsed: boolean;
    recipientRoles: string[];
  };
}

/**
 * Currency rate history entry for audit and analysis
 *
 * Tracks rate changes over time for compliance and analytics.
 * Enables trend analysis and rate volatility calculations.
 */
export interface CurrencyRateHistoryEntry {
  /** Historical rate information */
  rate: CurrencyRateDefinition;

  /** Change information */
  change: {
    changeAmount: number;
    changePercentage: number;
    previousRate?: number;
  };

  /** Change reason and context */
  changeContext: {
    changeReason:
      | "MARKET_UPDATE"
      | "MANUAL_OVERRIDE"
      | "SYSTEM_ADJUSTMENT"
      | "CORRECTION";
    triggeredBy?: string;
    approvedBy?: string;
    changeNotes?: string;
  };

  /** Impact assessment */
  impact?: {
    affectedTransactions?: number;
    estimatedImpact?: number;
    impactCurrency?: CurrencyCode;
  };
}

/**
 * Currency rate bulk update request
 *
 * Supports efficient bulk updates of multiple currency rates.
 * Includes validation and rollback capabilities.
 */
export interface CurrencyRateBulkUpdate {
  /** Rates to update */
  rates: CurrencyRateDefinition[];

  /** Update metadata */
  updateInfo: {
    updateReason: string;
    effectiveDate: Date;
    batchId?: string;
    sourceSystem?: string;
  };

  /** Validation settings */
  validation: {
    validateBeforeUpdate: boolean;
    maxChangeThreshold?: number;
    requiresApproval: boolean;
    rollbackOnError: boolean;
  };

  /** Processing options */
  processing: {
    updateInTransaction: boolean;
    notifyOnCompletion: boolean;
    auditLevel: "BASIC" | "DETAILED" | "COMPREHENSIVE";
  };
}

/**
 * Currency rate analytics for reporting and insights
 *
 * Provides statistical analysis of rate trends and volatility.
 * Supports financial planning and risk assessment.
 */
export interface CurrencyRateAnalytics {
  /** Currency pair being analyzed */
  currencyPair: {
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
  };

  /** Analysis period */
  period: {
    startDate: Date;
    endDate: Date;
    periodType: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  };

  /** Statistical measures */
  statistics: {
    currentRate: number;
    averageRate: number;
    minRate: number;
    maxRate: number;
    standardDeviation: number;
    volatility: number;
  };

  /** Trend analysis */
  trends: {
    trendDirection: "UP" | "DOWN" | "STABLE" | "VOLATILE";
    trendStrength: number; // 0.0 to 1.0
    trendConfidence: number; // 0.0 to 1.0
  };

  /** Risk metrics */
  risk: {
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    valueAtRisk?: number;
    confidenceInterval?: {
      lower: number;
      upper: number;
      confidence: number;
    };
  };
}
