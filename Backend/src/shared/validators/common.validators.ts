/**
 * Common Validators
 *
 * Shared validation schemas used across multiple feature modules.
 * Provides consistent validation for common data types like UUIDs, emails, etc.
 */

import { z } from "zod";

// UUID v7 schema validation
export const UuidV7Schema = z.string().uuid().describe("UUID v7 identifier");
// Back-compat alias
export const UuidSchema = UuidV7Schema;

// Common string validators
export const NonEmptyStringSchema = z
  .string()
  .min(1)
  .describe("Non-empty string");

// Back-compat alias
export const TrimmedNonEmptyStringSchema = z.string().trim().min(1);

export const EmailSchema = z.string().email().describe("Valid email address");

export const UrlSchema = z.string().url().describe("Valid URL");
export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .describe("URL-friendly slug");
export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/)
  .describe("E.164 phone number");
export const NameSchema = NonEmptyStringSchema;
export const JwtTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*$/)
  .describe("JWT token");

export const PasswordSchema = z
  .string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .describe("Password with minimum security requirements");

// Back-compat simple content schemas
export const DescriptionSchema = z.string().max(2000).optional();
export const TagsSchema = z.array(z.string().max(100)).max(50).optional();
export const MetadataSchema = z.record(z.string(), z.any()).optional();

// Common number validators
export const PositiveIntegerSchema = z
  .number()
  .int()
  .positive()
  .describe("Positive integer");

export const PositiveNumberSchema = z
  .number()
  .positive()
  .describe("Positive number");

export const SortOrderSchema = z.enum(["asc", "desc"]);
export const TimestampSchema = z.string().datetime();
// Simple IP (v4 or v6) regex-based validation for compatibility
export const IpAddressSchema = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}|\[?[A-Fa-f0-9:]+\]?)$/
  );
export const CidrBlockSchema = z
  .string()
  .regex(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)(\.|$)){4}\/(3[0-2]|[12]?\d)$/)
  .describe("IPv4 CIDR block");

export const DomainNameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9.-]+$/)
  .min(1)
  .max(253);

// Common date validators
export const DateStringSchema = z
  .string()
  .datetime()
  .describe("ISO date string");

export const FutureDateSchema = z
  .string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), {
    message: "Date must be in the future",
  })
  .describe("Future date");

// Common pagination schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const PageNumberSchema = z.number().int().positive().default(1);
export const PageSizeSchema = z.number().int().positive().max(100).default(10);

export const SearchSchema = z.object({
  q: z.string().optional().describe("Search query"),
  ...PaginationSchema.shape,
});

// Back-compat alias
export const SearchQuerySchema = SearchSchema;

// Common response schemas
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

// Helper to validate API key format with prefix (e.g., ak_xxx)
export const createApiKeySchema = (prefix: string) =>
  z
    .string()
    .regex(
      new RegExp(`^${prefix}_[A-Za-z0-9]{20,}$`),
      "Invalid API key format"
    );
