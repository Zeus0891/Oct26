/**
 * Shared Catalog Types - Unit of Measure
 *
 * Standardized units of measure used across procurement, estimating,
 * and inventory management modules.
 */

// Re-export ProcurementUnitOfMeasure from Prisma to maintain single source of truth
export type { ProcurementUnitOfMeasure } from "@prisma/client";

// Import for value operations
import { ProcurementUnitOfMeasure } from "@prisma/client";

/**
 * Unit of Measure type alias for consistency
 * Uses Prisma ProcurementUnitOfMeasure enum
 */
export type UnitOfMeasureCode = ProcurementUnitOfMeasure;

/**
 * Unit of measure information
 */
export interface UnitOfMeasureInfo {
  /** UOM code */
  code: ProcurementUnitOfMeasure;
  /** Display name */
  name: string;
  /** Short abbreviation */
  abbreviation: string;
  /** UOM category */
  category: UOMCategory;
  /** Whether this is a base unit */
  isBase: boolean;
  /** Base unit for conversions (if not base) */
  baseUnit?: ProcurementUnitOfMeasure;
  /** Conversion factor to base unit */
  conversionFactor?: number;
  /** Decimal places for precision */
  decimalPlaces: number;
}

/**
 * UOM categories
 */
export enum UOMCategory {
  QUANTITY = "QUANTITY",
  TIME = "TIME",
  WEIGHT = "WEIGHT",
  LENGTH = "LENGTH",
  AREA = "AREA",
  VOLUME = "VOLUME",
  PACKAGING = "PACKAGING",
}

/**
 * Unit of measure mapping with detailed info
 */
export const UnitOfMeasureInfoMap: Record<
  ProcurementUnitOfMeasure,
  UnitOfMeasureInfo
> = {
  [ProcurementUnitOfMeasure.EA]: {
    code: ProcurementUnitOfMeasure.EA,
    name: "Each",
    abbreviation: "ea",
    category: UOMCategory.QUANTITY,
    isBase: true,
    decimalPlaces: 0,
  },

  // Time-based units
  [ProcurementUnitOfMeasure.HOUR]: {
    code: ProcurementUnitOfMeasure.HOUR,
    name: "Hour",
    abbreviation: "hr",
    category: UOMCategory.TIME,
    isBase: true,
    decimalPlaces: 2,
  },
  [ProcurementUnitOfMeasure.DAY]: {
    code: ProcurementUnitOfMeasure.DAY,
    name: "Day",
    abbreviation: "day",
    category: UOMCategory.TIME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.HOUR,
    conversionFactor: 24,
    decimalPlaces: 1,
  },
  [ProcurementUnitOfMeasure.WEEK]: {
    code: ProcurementUnitOfMeasure.WEEK,
    name: "Week",
    abbreviation: "wk",
    category: UOMCategory.TIME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.HOUR,
    conversionFactor: 168, // 7 * 24
    decimalPlaces: 1,
  },
  [ProcurementUnitOfMeasure.MONTH]: {
    code: ProcurementUnitOfMeasure.MONTH,
    name: "Month",
    abbreviation: "mo",
    category: UOMCategory.TIME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.HOUR,
    conversionFactor: 730, // ~30.4 * 24
    decimalPlaces: 1,
  },
  [ProcurementUnitOfMeasure.YEAR]: {
    code: ProcurementUnitOfMeasure.YEAR,
    name: "Year",
    abbreviation: "yr",
    category: UOMCategory.TIME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.HOUR,
    conversionFactor: 8760, // 365 * 24
    decimalPlaces: 1,
  },

  // Weight units
  [ProcurementUnitOfMeasure.KG]: {
    code: ProcurementUnitOfMeasure.KG,
    name: "Kilogram",
    abbreviation: "kg",
    category: UOMCategory.WEIGHT,
    isBase: true,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.LB]: {
    code: ProcurementUnitOfMeasure.LB,
    name: "Pound",
    abbreviation: "lb",
    category: UOMCategory.WEIGHT,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.KG,
    conversionFactor: 0.453592,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.TON]: {
    code: ProcurementUnitOfMeasure.TON,
    name: "Metric Ton",
    abbreviation: "t",
    category: UOMCategory.WEIGHT,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.KG,
    conversionFactor: 1000,
    decimalPlaces: 3,
  },

  // Length units
  [ProcurementUnitOfMeasure.M]: {
    code: ProcurementUnitOfMeasure.M,
    name: "Meter",
    abbreviation: "m",
    category: UOMCategory.LENGTH,
    isBase: true,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.FT]: {
    code: ProcurementUnitOfMeasure.FT,
    name: "Foot",
    abbreviation: "ft",
    category: UOMCategory.LENGTH,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.M,
    conversionFactor: 0.3048,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.IN]: {
    code: ProcurementUnitOfMeasure.IN,
    name: "Inch",
    abbreviation: "in",
    category: UOMCategory.LENGTH,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.M,
    conversionFactor: 0.0254,
    decimalPlaces: 4,
  },

  // Area units
  [ProcurementUnitOfMeasure.M2]: {
    code: ProcurementUnitOfMeasure.M2,
    name: "Square Meter",
    abbreviation: "m²",
    category: UOMCategory.AREA,
    isBase: true,
    decimalPlaces: 3,
  },

  // Volume units
  [ProcurementUnitOfMeasure.M3]: {
    code: ProcurementUnitOfMeasure.M3,
    name: "Cubic Meter",
    abbreviation: "m³",
    category: UOMCategory.VOLUME,
    isBase: true,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.L]: {
    code: ProcurementUnitOfMeasure.L,
    name: "Liter",
    abbreviation: "L",
    category: UOMCategory.VOLUME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.M3,
    conversionFactor: 0.001,
    decimalPlaces: 3,
  },
  [ProcurementUnitOfMeasure.GAL]: {
    code: ProcurementUnitOfMeasure.GAL,
    name: "Gallon (US)",
    abbreviation: "gal",
    category: UOMCategory.VOLUME,
    isBase: false,
    baseUnit: ProcurementUnitOfMeasure.L,
    conversionFactor: 3.78541,
    decimalPlaces: 3,
  },

  // Packaging units
  [ProcurementUnitOfMeasure.BOX]: {
    code: ProcurementUnitOfMeasure.BOX,
    name: "Box",
    abbreviation: "box",
    category: UOMCategory.PACKAGING,
    isBase: true,
    decimalPlaces: 0,
  },
  [ProcurementUnitOfMeasure.CASE]: {
    code: ProcurementUnitOfMeasure.CASE,
    name: "Case",
    abbreviation: "case",
    category: UOMCategory.PACKAGING,
    isBase: true,
    decimalPlaces: 0,
  },
  [ProcurementUnitOfMeasure.PALLET]: {
    code: ProcurementUnitOfMeasure.PALLET,
    name: "Pallet",
    abbreviation: "pallet",
    category: UOMCategory.PACKAGING,
    isBase: true,
    decimalPlaces: 0,
  },
  [ProcurementUnitOfMeasure.LOT]: {
    code: ProcurementUnitOfMeasure.LOT,
    name: "Lot",
    abbreviation: "lot",
    category: UOMCategory.PACKAGING,
    isBase: true,
    decimalPlaces: 0,
  },
  [ProcurementUnitOfMeasure.SET]: {
    code: ProcurementUnitOfMeasure.SET,
    name: "Set",
    abbreviation: "set",
    category: UOMCategory.PACKAGING,
    isBase: true,
    decimalPlaces: 0,
  },
};

/**
 * Utility functions for UOM operations
 */
export const getUOMInfo = (code: UnitOfMeasureCode): UnitOfMeasureInfo =>
  UnitOfMeasureInfoMap[code];

export const getUOMsByCategory = (category: UOMCategory): UnitOfMeasureCode[] =>
  Object.values(ProcurementUnitOfMeasure).filter(
    (code) => UnitOfMeasureInfoMap[code].category === category
  );

export const isBaseUnit = (code: UnitOfMeasureCode): boolean =>
  UnitOfMeasureInfoMap[code].isBase;

export const convertToBaseUnit = (
  value: number,
  fromUnit: UnitOfMeasureCode
): number => {
  const info = UnitOfMeasureInfoMap[fromUnit];
  if (info.isBase) return value;
  return value * (info.conversionFactor || 1);
};

export const convertFromBaseUnit = (
  value: number,
  toUnit: UnitOfMeasureCode
): number => {
  const info = UnitOfMeasureInfoMap[toUnit];
  if (info.isBase) return value;
  return value / (info.conversionFactor || 1);
};
