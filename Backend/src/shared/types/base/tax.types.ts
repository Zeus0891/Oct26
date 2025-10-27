/**
 * Tax Types - Tax calculation and compliance management
 *
 * Depends on Prisma Tables: TaxRate, TaxJurisdiction, EstimateTax, InvoiceTax, PayrollTax
 * Depends on Prisma Enums: EstimateTaxType, InvoiceTaxType, PayrollTaxType, TaxRateType, TaxRateStatus, TaxJurisdictionType, TaxCalculationMethod
 *
 * Purpose: Tax calculations, compliance tracking, and tax reporting across all financial modules
 */

import type {
  EstimateTaxType,
  InvoiceTaxType,
  PayrollTaxType,
  TaxRateType,
  TaxRateStatus,
  TaxJurisdictionType,
  TaxCalculationMethod,
  PaymentMethod,
} from "@prisma/client";

/**
 * Base tax rate information
 * Maps to Prisma TaxRate table core fields
 */
export interface TaxRateBase {
  /** Tax rate identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Tax rate name/description */
  name: string;
  /** Tax rate type */
  type: TaxRateType;
  /** Tax jurisdiction ID */
  jurisdictionId: string;
  /** Tax rate percentage (0-100) */
  rate: number;
  /** Tax rate status */
  status: TaxRateStatus;
  /** Calculation method */
  calculationMethod: TaxCalculationMethod;
  /** Effective start date */
  effectiveFrom: Date;
  /** Effective end date */
  effectiveTo?: Date;
  /** Whether rate is compound (calculated on top of other taxes) */
  isCompound: boolean;
  /** Whether rate applies to taxable amount or total */
  applyToTaxable: boolean;
  /** Minimum taxable amount */
  minTaxableAmount?: number;
  /** Maximum taxable amount */
  maxTaxableAmount?: number;
  /** Fixed amount (for FIXED_AMOUNT calculation) */
  fixedAmount?: number;
}

/**
 * Tax jurisdiction information
 * Maps to Prisma TaxJurisdiction table
 */
export interface TaxJurisdictionBase {
  /** Jurisdiction identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Jurisdiction name */
  name: string;
  /** Jurisdiction type */
  type: TaxJurisdictionType;
  /** Jurisdiction code */
  code: string;
  /** Parent jurisdiction ID */
  parentId?: string;
  /** Country code */
  countryCode: string;
  /** State/province code */
  stateCode?: string;
  /** City/locality code */
  cityCode?: string;
  /** Postal/ZIP codes covered */
  postalCodes?: string[];
  /** Whether jurisdiction is active */
  isActive: boolean;
  /** Tax authority name */
  taxAuthority?: string;
  /** Filing requirements */
  filingRequirements?: Record<string, unknown>;
}

/**
 * Tax calculation line item
 * Represents a single tax calculation on an amount
 */
export interface TaxCalculationLine {
  /** Tax rate used */
  taxRate: TaxRateBase;
  /** Taxable amount */
  taxableAmount: number;
  /** Calculated tax amount */
  taxAmount: number;
  /** Tax percentage applied */
  appliedRate: number;
  /** Tax jurisdiction */
  jurisdiction: TaxJurisdictionBase;
  /** Whether tax is inclusive or exclusive */
  isInclusive: boolean;
  /** Base amount for compound tax */
  baseAmount?: number;
}

/**
 * Complete tax calculation result
 * Result of calculating taxes on an amount
 */
export interface TaxCalculationResult {
  /** Original amount before tax */
  originalAmount: number;
  /** Net taxable amount */
  taxableAmount: number;
  /** Total tax amount */
  totalTaxAmount: number;
  /** Amount including tax */
  totalAmount: number;
  /** Individual tax calculations */
  taxLines: TaxCalculationLine[];
  /** Currency code */
  currency: string;
  /** Calculation timestamp */
  calculatedAt: Date;
  /** Tax configuration used */
  configurationId?: string;
}

/**
 * Tax calculation request
 * Input for tax calculation operations
 */
export interface TaxCalculationRequest {
  /** Amount to calculate tax on */
  amount: number;
  /** Currency code */
  currency: string;
  /** Tax jurisdictions to apply */
  jurisdictions: string[];
  /** Calculation date (defaults to current) */
  calculationDate?: Date;
  /** Whether amount includes tax */
  isInclusive?: boolean;
  /** Product/service category for tax rules */
  category?: string;
  /** Customer type (B2B, B2C, etc.) */
  customerType?: string;
  /** Additional tax context */
  context?: Record<string, unknown>;
}

/**
 * Tax configuration for entity
 * Defines tax behavior for a tenant or entity type
 */
export interface TaxConfigurationBase {
  /** Configuration identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Configuration name */
  name: string;
  /** Entity type this applies to */
  entityType: string;
  /** Default tax jurisdictions */
  defaultJurisdictions: string[];
  /** Tax calculation mode */
  calculationMode: string;
  /** Whether tax is inclusive by default */
  defaultInclusive: boolean;
  /** Rounding rules */
  roundingRules?: TaxRoundingRules;
  /** Whether configuration is active */
  isActive: boolean;
}

/**
 * Tax rounding rules
 * Defines how tax amounts should be rounded
 */
export interface TaxRoundingRules {
  /** Rounding method (ROUND, FLOOR, CEILING) */
  method: string;
  /** Decimal precision */
  precision: number;
  /** Rounding increment (e.g., 0.05 for nickel rounding) */
  increment?: number;
  /** Whether to round per line or total */
  roundPerLine: boolean;
}

/**
 * Tax compliance report data
 * Data structure for tax reporting and compliance
 */
export interface TaxComplianceData {
  /** Reporting period start */
  periodStart: Date;
  /** Reporting period end */
  periodEnd: Date;
  /** Tax jurisdiction */
  jurisdiction: TaxJurisdictionBase;
  /** Total taxable sales */
  totalTaxableSales: number;
  /** Total tax collected */
  totalTaxCollected: number;
  /** Tax by rate breakdown */
  taxByRate: Record<string, number>;
  /** Number of transactions */
  transactionCount: number;
  /** Currency code */
  currency: string;
  /** Report generated timestamp */
  generatedAt: Date;
}

/**
 * Tax exempt information
 * Information about tax exemptions
 */
export interface TaxExemptionBase {
  /** Exemption identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Entity ID (customer, product, etc.) */
  entityId: string;
  /** Entity type (CUSTOMER, PRODUCT, TRANSACTION) */
  entityType: string;
  /** Exemption certificate number */
  certificateNumber?: string;
  /** Tax types exempt from */
  exemptTaxTypes: (EstimateTaxType | InvoiceTaxType | PayrollTaxType)[];
  /** Jurisdictions where exempt */
  exemptJurisdictions: string[];
  /** Exemption effective date */
  effectiveFrom: Date;
  /** Exemption expiry date */
  effectiveTo?: Date;
  /** Whether exemption is active */
  isActive: boolean;
  /** Exemption reason */
  reason?: string;
}

/**
 * Tax context for calculations
 * Context information for tax calculations
 */
export interface TaxContext {
  /** Associated tenant ID */
  tenantId: string;
  /** Calculation date */
  calculationDate: Date;
  /** Customer location */
  customerLocation?: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
  /** Vendor/seller location */
  vendorLocation?: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
  /** Transaction type */
  transactionType?: string;
  /** Customer type */
  customerType?: string;
  /** Product/service category */
  productCategory?: string;
  /** Tax exemptions to consider */
  exemptions?: TaxExemptionBase[];
}
