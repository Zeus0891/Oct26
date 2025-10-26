/**
 * Shared Catalog Types - Countries & Regions
 *
 * Country and region codes extracted from Prisma schema patterns.
 * These are referenced across CRM, Projects, HR, and other modules.
 */

// Re-export location-related enums from Prisma to maintain single source of truth
export type {
  TenantRegion,
  AddressType,
  LocationType,
  LocationStatus,
} from "@prisma/client";

// Import for value operations
import {
  TenantRegion,
  AddressType,
  LocationType,
  LocationStatus,
} from "@prisma/client";

/**
 * Country codes (ISO 3166-1 alpha-2)
 * Extracted from schema usage patterns in addresses and locations
 */
export const CountryCodes = {
  // North America
  US: "US",
  CA: "CA",
  MX: "MX",

  // Europe
  GB: "GB",
  DE: "DE",
  FR: "FR",
  IT: "IT",
  ES: "ES",
  NL: "NL",
  BE: "BE",
  CH: "CH",
  AT: "AT",
  NO: "NO",
  SE: "SE",
  DK: "DK",
  FI: "FI",
  IE: "IE",
  PT: "PT",

  // Asia Pacific
  AU: "AU",
  NZ: "NZ",
  JP: "JP",
  KR: "KR",
  CN: "CN",
  IN: "IN",
  SG: "SG",
  HK: "HK",

  // Latin America
  BR: "BR",
  AR: "AR",
  CL: "CL",
  CO: "CO",
  PE: "PE",

  // Middle East & Africa
  ZA: "ZA",
  AE: "AE",
  SA: "SA",
  IL: "IL",
} as const;

export type CountryCode = (typeof CountryCodes)[keyof typeof CountryCodes];

/**
 * US State and Province codes
 * Used in address and location schemas
 */
export const StateProvinceCodes = {
  // US States
  AL: "AL",
  AK: "AK",
  AZ: "AZ",
  AR: "AR",
  CA: "CA",
  CO: "CO",
  CT: "CT",
  DE: "DE",
  FL: "FL",
  GA: "GA",
  HI: "HI",
  ID: "ID",
  IL: "IL",
  IN: "IN",
  IA: "IA",
  KS: "KS",
  KY: "KY",
  LA: "LA",
  ME: "ME",
  MD: "MD",
  MA: "MA",
  MI: "MI",
  MN: "MN",
  MS: "MS",
  MO: "MO",
  MT: "MT",
  NE: "NE",
  NV: "NV",
  NH: "NH",
  NJ: "NJ",
  NM: "NM",
  NY: "NY",
  NC: "NC",
  ND: "ND",
  OH: "OH",
  OK: "OK",
  OR: "OR",
  PA: "PA",
  RI: "RI",
  SC: "SC",
  SD: "SD",
  TN: "TN",
  TX: "TX",
  UT: "UT",
  VT: "VT",
  VA: "VA",
  WA: "WA",
  WV: "WV",
  WI: "WI",
  WY: "WY",
  DC: "DC",

  // Canadian Provinces and Territories
  AB: "AB",
  BC: "BC",
  MB: "MB",
  NB: "NB",
  NL: "NL",
  NS: "NS",
  NT: "NT",
  NU: "NU",
  ON: "ON",
  PE: "PE",
  QC: "QC",
  SK: "SK",
  YT: "YT",
} as const;

export type StateProvinceCode =
  (typeof StateProvinceCodes)[keyof typeof StateProvinceCodes];

/**
 * Geographic regions for business organization
 * Used in department, project, and organizational structures
 */
export const RegionCodes = {
  // North America
  NAM_EAST: "NAM_EAST",
  NAM_CENTRAL: "NAM_CENTRAL",
  NAM_WEST: "NAM_WEST",
  NAM_CANADA: "NAM_CANADA",

  // Europe
  EUR_NORTH: "EUR_NORTH",
  EUR_WEST: "EUR_WEST",
  EUR_CENTRAL: "EUR_CENTRAL",
  EUR_SOUTH: "EUR_SOUTH",
  EUR_EAST: "EUR_EAST",

  // Asia Pacific
  APAC_EAST: "APAC_EAST",
  APAC_SOUTHEAST: "APAC_SOUTHEAST",
  APAC_SOUTH: "APAC_SOUTH",
  APAC_PACIFIC: "APAC_PACIFIC",

  // Latin America
  LATAM_NORTH: "LATAM_NORTH",
  LATAM_SOUTH: "LATAM_SOUTH",
  LATAM_CENTRAL: "LATAM_CENTRAL",

  // Middle East & Africa
  MEA_MIDDLE_EAST: "MEA_MIDDLE_EAST",
  MEA_AFRICA: "MEA_AFRICA",
} as const;

export type RegionCode = (typeof RegionCodes)[keyof typeof RegionCodes];

/**
 * Timezone regions for operational purposes
 */
export const TimezoneRegions = {
  UTC: "UTC",

  // Americas
  EASTERN: "America/New_York",
  CENTRAL: "America/Chicago",
  MOUNTAIN: "America/Denver",
  PACIFIC: "America/Los_Angeles",
  ALASKA: "America/Anchorage",
  HAWAII: "Pacific/Honolulu",

  // Europe
  LONDON: "Europe/London",
  PARIS: "Europe/Paris",
  BERLIN: "Europe/Berlin",
  ROME: "Europe/Rome",
  MADRID: "Europe/Madrid",
  AMSTERDAM: "Europe/Amsterdam",

  // Asia Pacific
  TOKYO: "Asia/Tokyo",
  SEOUL: "Asia/Seoul",
  SHANGHAI: "Asia/Shanghai",
  MUMBAI: "Asia/Kolkata",
  SINGAPORE: "Asia/Singapore",
  SYDNEY: "Australia/Sydney",
  AUCKLAND: "Pacific/Auckland",
} as const;

export type TimezoneRegion =
  (typeof TimezoneRegions)[keyof typeof TimezoneRegions];

/**
 * Country display names mapping
 */
export const CountryNames: Record<CountryCode, string> = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  NO: "Norway",
  SE: "Sweden",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  PT: "Portugal",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  SG: "Singapore",
  HK: "Hong Kong",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  ZA: "South Africa",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
};

/**
 * Region display names mapping
 */
export const RegionNames: Record<RegionCode, string> = {
  NAM_EAST: "North America - East",
  NAM_CENTRAL: "North America - Central",
  NAM_WEST: "North America - West",
  NAM_CANADA: "Canada",
  EUR_NORTH: "Europe - North",
  EUR_WEST: "Europe - West",
  EUR_CENTRAL: "Europe - Central",
  EUR_SOUTH: "Europe - South",
  EUR_EAST: "Europe - East",
  APAC_EAST: "Asia Pacific - East",
  APAC_SOUTHEAST: "Asia Pacific - Southeast",
  APAC_SOUTH: "Asia Pacific - South",
  APAC_PACIFIC: "Asia Pacific - Pacific",
  LATAM_NORTH: "Latin America - North",
  LATAM_SOUTH: "Latin America - South",
  LATAM_CENTRAL: "Latin America - Central",
  MEA_MIDDLE_EAST: "Middle East",
  MEA_AFRICA: "Africa",
};

/**
 * Country-to-region mapping
 */
export const CountryToRegion: Record<CountryCode, RegionCode> = {
  US: RegionCodes.NAM_EAST, // Default to east, can be overridden by state
  CA: RegionCodes.NAM_CANADA,
  MX: RegionCodes.LATAM_NORTH,

  GB: RegionCodes.EUR_WEST,
  DE: RegionCodes.EUR_CENTRAL,
  FR: RegionCodes.EUR_WEST,
  IT: RegionCodes.EUR_SOUTH,
  ES: RegionCodes.EUR_SOUTH,
  NL: RegionCodes.EUR_WEST,
  BE: RegionCodes.EUR_WEST,
  CH: RegionCodes.EUR_CENTRAL,
  AT: RegionCodes.EUR_CENTRAL,
  NO: RegionCodes.EUR_NORTH,
  SE: RegionCodes.EUR_NORTH,
  DK: RegionCodes.EUR_NORTH,
  FI: RegionCodes.EUR_NORTH,
  IE: RegionCodes.EUR_WEST,
  PT: RegionCodes.EUR_SOUTH,

  AU: RegionCodes.APAC_PACIFIC,
  NZ: RegionCodes.APAC_PACIFIC,
  JP: RegionCodes.APAC_EAST,
  KR: RegionCodes.APAC_EAST,
  CN: RegionCodes.APAC_EAST,
  IN: RegionCodes.APAC_SOUTH,
  SG: RegionCodes.APAC_SOUTHEAST,
  HK: RegionCodes.APAC_EAST,

  BR: RegionCodes.LATAM_SOUTH,
  AR: RegionCodes.LATAM_SOUTH,
  CL: RegionCodes.LATAM_SOUTH,
  CO: RegionCodes.LATAM_NORTH,
  PE: RegionCodes.LATAM_SOUTH,

  ZA: RegionCodes.MEA_AFRICA,
  AE: RegionCodes.MEA_MIDDLE_EAST,
  SA: RegionCodes.MEA_MIDDLE_EAST,
  IL: RegionCodes.MEA_MIDDLE_EAST,
};

/**
 * Country-to-timezone mapping (default timezone per country)
 */
export const CountryToTimezone: Record<CountryCode, TimezoneRegion> = {
  US: TimezoneRegions.EASTERN, // Default, varies by state
  CA: TimezoneRegions.EASTERN, // Default, varies by province
  MX: TimezoneRegions.CENTRAL,

  GB: TimezoneRegions.LONDON,
  DE: TimezoneRegions.BERLIN,
  FR: TimezoneRegions.PARIS,
  IT: TimezoneRegions.ROME,
  ES: TimezoneRegions.MADRID,
  NL: TimezoneRegions.AMSTERDAM,
  BE: TimezoneRegions.PARIS,
  CH: TimezoneRegions.BERLIN,
  AT: TimezoneRegions.BERLIN,
  NO: TimezoneRegions.BERLIN,
  SE: TimezoneRegions.BERLIN,
  DK: TimezoneRegions.BERLIN,
  FI: TimezoneRegions.BERLIN,
  IE: TimezoneRegions.LONDON,
  PT: TimezoneRegions.LONDON,

  AU: TimezoneRegions.SYDNEY,
  NZ: TimezoneRegions.AUCKLAND,
  JP: TimezoneRegions.TOKYO,
  KR: TimezoneRegions.SEOUL,
  CN: TimezoneRegions.SHANGHAI,
  IN: TimezoneRegions.MUMBAI,
  SG: TimezoneRegions.SINGAPORE,
  HK: TimezoneRegions.SHANGHAI,

  BR: TimezoneRegions.UTC, // Varies greatly
  AR: TimezoneRegions.UTC,
  CL: TimezoneRegions.UTC,
  CO: TimezoneRegions.UTC,
  PE: TimezoneRegions.UTC,

  ZA: TimezoneRegions.UTC,
  AE: TimezoneRegions.UTC,
  SA: TimezoneRegions.UTC,
  IL: TimezoneRegions.UTC,
};

/**
 * Utility functions
 */
export const getCountryName = (code: CountryCode): string =>
  CountryNames[code] || code;

export const getRegionName = (code: RegionCode): string =>
  RegionNames[code] || code;

export const getCountryRegion = (countryCode: CountryCode): RegionCode =>
  CountryToRegion[countryCode] || RegionCodes.NAM_EAST;

export const getCountryTimezone = (countryCode: CountryCode): TimezoneRegion =>
  CountryToTimezone[countryCode] || TimezoneRegions.UTC;

export const isValidCountryCode = (code: string): code is CountryCode =>
  Object.values(CountryCodes).includes(code as CountryCode);

export const isValidRegionCode = (code: string): code is RegionCode =>
  Object.values(RegionCodes).includes(code as RegionCode);

export const isValidStateProvinceCode = (
  code: string
): code is StateProvinceCode =>
  Object.values(StateProvinceCodes).includes(code as StateProvinceCode);

/**
 * Mapping between business regions and Prisma TenantRegion enum
 * Used for tenant deployment and infrastructure alignment
 */
export const BusinessRegionToTenantRegion: Record<RegionCode, TenantRegion> = {
  // North America mappings
  NAM_EAST: TenantRegion.US_EAST_1,
  NAM_CENTRAL: TenantRegion.US_EAST_1, // Default to East for central
  NAM_WEST: TenantRegion.US_WEST_1,
  NAM_CANADA: TenantRegion.CA_CENTRAL_1,

  // Europe mappings
  EUR_NORTH: TenantRegion.EU_CENTRAL_1,
  EUR_WEST: TenantRegion.EU_WEST_1,
  EUR_CENTRAL: TenantRegion.EU_CENTRAL_1,
  EUR_SOUTH: TenantRegion.EU_WEST_1, // Default to West for South Europe
  EUR_EAST: TenantRegion.EU_CENTRAL_1,

  // Asia Pacific mappings
  APAC_EAST: TenantRegion.AP_NORTHEAST_1,
  APAC_SOUTHEAST: TenantRegion.AP_SOUTHEAST_1,
  APAC_SOUTH: TenantRegion.AP_SOUTHEAST_1, // Default to Southeast for South Asia
  APAC_PACIFIC: TenantRegion.AP_SOUTHEAST_1,

  // Latin America mappings (default to US regions)
  LATAM_NORTH: TenantRegion.US_WEST_2,
  LATAM_SOUTH: TenantRegion.US_WEST_2,
  LATAM_CENTRAL: TenantRegion.US_WEST_2,

  // Middle East & Africa mappings (default to EU regions)
  MEA_MIDDLE_EAST: TenantRegion.EU_CENTRAL_1,
  MEA_AFRICA: TenantRegion.EU_WEST_1,
};

/**
 * Get the appropriate Prisma TenantRegion for a business region
 */
export const getTenantRegion = (businessRegion: RegionCode): TenantRegion =>
  BusinessRegionToTenantRegion[businessRegion] || TenantRegion.US_EAST_1;
