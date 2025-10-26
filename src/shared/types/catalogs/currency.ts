/**
 * Shared Catalog Types - Currency
 *
 * Currency codes and related utilities.
 * Re-exports from Prisma schema to maintain single source of truth.
 */

// Re-export CurrencyCode enum from Prisma to maintain single source of truth
export type { CurrencyCode } from "@prisma/client";

// Import for value operations
import { CurrencyCode } from "@prisma/client";

/**
 * Currency metadata and display information
 */
export interface CurrencyInfo {
  /** Currency code */
  code: CurrencyCode;
  /** Currency name */
  name: string;
  /** Currency symbol */
  symbol: string;
  /** Number of decimal places */
  decimalPlaces: number;
  /** Whether it's a major trading currency */
  isMajor: boolean;
}

/**
 * Currency information mapping
 * Based on common usage patterns in the schema
 */
export const CurrencyInfoMap: Record<CurrencyCode, CurrencyInfo> = {
  // Major currencies (most commonly used)
  USD: {
    code: CurrencyCode.USD,
    name: "US Dollar",
    symbol: "$",
    decimalPlaces: 2,
    isMajor: true,
  },
  EUR: {
    code: CurrencyCode.EUR,
    name: "Euro",
    symbol: "€",
    decimalPlaces: 2,
    isMajor: true,
  },
  GBP: {
    code: CurrencyCode.GBP,
    name: "British Pound",
    symbol: "£",
    decimalPlaces: 2,
    isMajor: true,
  },
  JPY: {
    code: CurrencyCode.JPY,
    name: "Japanese Yen",
    symbol: "¥",
    decimalPlaces: 0,
    isMajor: true,
  },
  CAD: {
    code: CurrencyCode.CAD,
    name: "Canadian Dollar",
    symbol: "C$",
    decimalPlaces: 2,
    isMajor: true,
  },
  AUD: {
    code: CurrencyCode.AUD,
    name: "Australian Dollar",
    symbol: "A$",
    decimalPlaces: 2,
    isMajor: true,
  },
  CHF: {
    code: CurrencyCode.CHF,
    name: "Swiss Franc",
    symbol: "CHF",
    decimalPlaces: 2,
    isMajor: true,
  },
  CNY: {
    code: CurrencyCode.CNY,
    name: "Chinese Yuan",
    symbol: "¥",
    decimalPlaces: 2,
    isMajor: true,
  },

  // Other commonly used currencies
  SEK: {
    code: CurrencyCode.SEK,
    name: "Swedish Krona",
    symbol: "kr",
    decimalPlaces: 2,
    isMajor: false,
  },
  NOK: {
    code: CurrencyCode.NOK,
    name: "Norwegian Krone",
    symbol: "kr",
    decimalPlaces: 2,
    isMajor: false,
  },
  DKK: {
    code: CurrencyCode.DKK,
    name: "Danish Krone",
    symbol: "kr",
    decimalPlaces: 2,
    isMajor: false,
  },
  PLN: {
    code: CurrencyCode.PLN,
    name: "Polish Złoty",
    symbol: "zł",
    decimalPlaces: 2,
    isMajor: false,
  },
  CZK: {
    code: CurrencyCode.CZK,
    name: "Czech Koruna",
    symbol: "Kč",
    decimalPlaces: 2,
    isMajor: false,
  },
  HUF: {
    code: CurrencyCode.HUF,
    name: "Hungarian Forint",
    symbol: "Ft",
    decimalPlaces: 2,
    isMajor: false,
  },

  // Regional currencies
  BRL: {
    code: CurrencyCode.BRL,
    name: "Brazilian Real",
    symbol: "R$",
    decimalPlaces: 2,
    isMajor: false,
  },
  MXN: {
    code: CurrencyCode.MXN,
    name: "Mexican Peso",
    symbol: "$",
    decimalPlaces: 2,
    isMajor: false,
  },
  ARS: {
    code: CurrencyCode.ARS,
    name: "Argentine Peso",
    symbol: "$",
    decimalPlaces: 2,
    isMajor: false,
  },
  CLP: {
    code: CurrencyCode.CLP,
    name: "Chilean Peso",
    symbol: "$",
    decimalPlaces: 0,
    isMajor: false,
  },
  COP: {
    code: CurrencyCode.COP,
    name: "Colombian Peso",
    symbol: "$",
    decimalPlaces: 2,
    isMajor: false,
  },
  PEN: {
    code: CurrencyCode.PEN,
    name: "Peruvian Sol",
    symbol: "S/",
    decimalPlaces: 2,
    isMajor: false,
  },

  // Asia Pacific
  KRW: {
    code: CurrencyCode.KRW,
    name: "South Korean Won",
    symbol: "₩",
    decimalPlaces: 0,
    isMajor: false,
  },
  SGD: {
    code: CurrencyCode.SGD,
    name: "Singapore Dollar",
    symbol: "S$",
    decimalPlaces: 2,
    isMajor: false,
  },
  HKD: {
    code: CurrencyCode.HKD,
    name: "Hong Kong Dollar",
    symbol: "HK$",
    decimalPlaces: 2,
    isMajor: false,
  },
  INR: {
    code: CurrencyCode.INR,
    name: "Indian Rupee",
    symbol: "₹",
    decimalPlaces: 2,
    isMajor: false,
  },
  THB: {
    code: CurrencyCode.THB,
    name: "Thai Baht",
    symbol: "฿",
    decimalPlaces: 2,
    isMajor: false,
  },
  MYR: {
    code: CurrencyCode.MYR,
    name: "Malaysian Ringgit",
    symbol: "RM",
    decimalPlaces: 2,
    isMajor: false,
  },
  IDR: {
    code: CurrencyCode.IDR,
    name: "Indonesian Rupiah",
    symbol: "Rp",
    decimalPlaces: 2,
    isMajor: false,
  },
  PHP: {
    code: CurrencyCode.PHP,
    name: "Philippine Peso",
    symbol: "₱",
    decimalPlaces: 2,
    isMajor: false,
  },
  VND: {
    code: CurrencyCode.VND,
    name: "Vietnamese Dong",
    symbol: "₫",
    decimalPlaces: 0,
    isMajor: false,
  },
  NZD: {
    code: CurrencyCode.NZD,
    name: "New Zealand Dollar",
    symbol: "NZ$",
    decimalPlaces: 2,
    isMajor: false,
  },

  // Middle East & Africa
  AED: {
    code: CurrencyCode.AED,
    name: "UAE Dirham",
    symbol: "د.إ",
    decimalPlaces: 2,
    isMajor: false,
  },
  SAR: {
    code: CurrencyCode.SAR,
    name: "Saudi Riyal",
    symbol: "﷼",
    decimalPlaces: 2,
    isMajor: false,
  },
  ILS: {
    code: CurrencyCode.ILS,
    name: "Israeli Shekel",
    symbol: "₪",
    decimalPlaces: 2,
    isMajor: false,
  },
  ZAR: {
    code: CurrencyCode.ZAR,
    name: "South African Rand",
    symbol: "R",
    decimalPlaces: 2,
    isMajor: false,
  },
  EGP: {
    code: CurrencyCode.EGP,
    name: "Egyptian Pound",
    symbol: "£",
    decimalPlaces: 2,
    isMajor: false,
  },

  // Other European
  RUB: {
    code: CurrencyCode.RUB,
    name: "Russian Ruble",
    symbol: "₽",
    decimalPlaces: 2,
    isMajor: false,
  },
  TRY: {
    code: CurrencyCode.TRY,
    name: "Turkish Lira",
    symbol: "₺",
    decimalPlaces: 2,
    isMajor: false,
  },

  // Additional currencies from schema
  TWD: {
    code: CurrencyCode.TWD,
    name: "Taiwan Dollar",
    symbol: "NT$",
    decimalPlaces: 2,
    isMajor: false,
  },
  UYU: {
    code: CurrencyCode.UYU,
    name: "Uruguayan Peso",
    symbol: "$",
    decimalPlaces: 2,
    isMajor: false,
  },
};

/**
 * Default currency (most commonly used in schema)
 */
export const DEFAULT_CURRENCY = CurrencyCode.USD;

/**
 * Major trading currencies
 */
export const MAJOR_CURRENCIES: CurrencyCode[] = [
  CurrencyCode.USD,
  CurrencyCode.EUR,
  CurrencyCode.GBP,
  CurrencyCode.JPY,
  CurrencyCode.CAD,
  CurrencyCode.AUD,
  CurrencyCode.CHF,
  CurrencyCode.CNY,
];

/**
 * Utility functions for currency operations
 */

/**
 * Get currency information
 */
export const getCurrencyInfo = (code: CurrencyCode): CurrencyInfo =>
  CurrencyInfoMap[code];

/**
 * Get currency name
 */
export const getCurrencyName = (code: CurrencyCode): string =>
  CurrencyInfoMap[code]?.name || code;

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (code: CurrencyCode): string =>
  CurrencyInfoMap[code]?.symbol || code;

/**
 * Get decimal places for currency
 */
export const getCurrencyDecimalPlaces = (code: CurrencyCode): number =>
  CurrencyInfoMap[code]?.decimalPlaces || 2;

/**
 * Check if currency is a major trading currency
 */
export const isMajorCurrency = (code: CurrencyCode): boolean =>
  MAJOR_CURRENCIES.includes(code);

/**
 * Validate currency code
 */
export const isValidCurrencyCode = (code: string): code is CurrencyCode =>
  Object.values(CurrencyCode).includes(code as CurrencyCode);

/**
 * Get all available currencies
 */
export const getAllCurrencies = (): CurrencyCode[] =>
  Object.values(CurrencyCode);

/**
 * Get major currencies only
 */
export const getMajorCurrencies = (): CurrencyCode[] => MAJOR_CURRENCIES;

/**
 * Get currencies by region (based on common usage)
 */
export const getCurrenciesByRegion = (region: string): CurrencyCode[] => {
  switch (region.toUpperCase()) {
    case "NORTH_AMERICA":
      return [CurrencyCode.USD, CurrencyCode.CAD, CurrencyCode.MXN];
    case "EUROPE":
      return [
        CurrencyCode.EUR,
        CurrencyCode.GBP,
        CurrencyCode.CHF,
        CurrencyCode.SEK,
        CurrencyCode.NOK,
        CurrencyCode.DKK,
      ];
    case "ASIA_PACIFIC":
      return [
        CurrencyCode.JPY,
        CurrencyCode.CNY,
        CurrencyCode.AUD,
        CurrencyCode.KRW,
        CurrencyCode.SGD,
        CurrencyCode.HKD,
        CurrencyCode.INR,
      ];
    case "LATIN_AMERICA":
      return [
        CurrencyCode.BRL,
        CurrencyCode.ARS,
        CurrencyCode.CLP,
        CurrencyCode.COP,
        CurrencyCode.PEN,
      ];
    case "MIDDLE_EAST_AFRICA":
      return [
        CurrencyCode.AED,
        CurrencyCode.SAR,
        CurrencyCode.ILS,
        CurrencyCode.ZAR,
      ];
    default:
      return MAJOR_CURRENCIES;
  }
};

/**
 * Format currency for display
 */
export const formatCurrencyCode = (
  code: CurrencyCode,
  options?: {
    withSymbol?: boolean;
    withName?: boolean;
  }
): string => {
  const info = getCurrencyInfo(code);
  if (!info) return code;

  if (options?.withName) {
    return `${info.name} (${code})`;
  }

  if (options?.withSymbol) {
    return `${info.symbol} ${code}`;
  }

  return code;
};
