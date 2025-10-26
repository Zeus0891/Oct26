/**
 * Tenant Feature Flags Validators
 * - Create/Update payload schemas for TenantFeatureFlag
 * - Aligns with Prisma model and enterprise constraints
 */
import { z } from "zod";
import { FeatureFlagScope } from "@prisma/client";
import {
  UuidSchema,
  NonEmptyStringSchema,
  DescriptionSchema,
  DateStringSchema,
} from "@/shared/validators/common.validators";

// Avoid deprecated nativeEnum by constructing from values
const FeatureFlagScopeEnum = z.enum(
  Object.values(FeatureFlagScope) as [
    (typeof FeatureFlagScope)[keyof typeof FeatureFlagScope],
    ...(typeof FeatureFlagScope)[keyof typeof FeatureFlagScope][],
  ]
);

const KeySchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9:_.-]+$/)
  .describe("Feature flag key (letters, digits, :, -, ., _)");

const NameSchema = NonEmptyStringSchema.max(255);
const ShortTagSchema = z.string().min(1).max(50);
const EnvironmentSchema = z.string().min(1).max(20);

/**
 * Create Feature Flag payload
 */
export const CreateFeatureFlagSchema = z
  .object({
    key: KeySchema,
    name: NameSchema,
    description: DescriptionSchema,
    enabled: z.boolean().optional(),
    rolloutPercentage: z.number().int().min(0).max(100).optional(),
    scope: FeatureFlagScopeEnum.default("TENANT" as any),
    targetUserIds: z.array(UuidSchema).max(500).optional(),
    targetRoles: z.array(ShortTagSchema).max(200).optional(),
    conditions: z.any().optional(),
    startDate: DateStringSchema.optional(),
    endDate: DateStringSchema.optional(),
    isTemporary: z.boolean().optional(),
    tags: z.array(ShortTagSchema).max(200).optional(),
    environment: EnvironmentSchema.optional(),
    priority: z.number().int().min(0).max(1000).optional(),
  })
  .strict()
  .refine(
    (v) =>
      !v.startDate ||
      !v.endDate ||
      new Date(v.startDate) <= new Date(v.endDate),
    {
      message: "startDate must be before or equal to endDate",
      path: ["startDate"],
    }
  );

/**
 * Update Feature Flag payload
 */
export const UpdateFeatureFlagSchema = z
  .object({
    name: NameSchema.optional(),
    description: DescriptionSchema,
    enabled: z.boolean().optional(),
    rolloutPercentage: z.number().int().min(0).max(100).optional(),
    scope: FeatureFlagScopeEnum.optional(),
    targetUserIds: z.array(UuidSchema).max(500).optional(),
    targetRoles: z.array(ShortTagSchema).max(200).optional(),
    conditions: z.any().optional(),
    startDate: DateStringSchema.optional(),
    endDate: DateStringSchema.optional(),
    isTemporary: z.boolean().optional(),
    tags: z.array(ShortTagSchema).max(200).optional(),
    environment: EnvironmentSchema.optional(),
    priority: z.number().int().min(0).max(1000).optional(),
  })
  .strict()
  .refine(
    (v) =>
      !v.startDate ||
      !v.endDate ||
      new Date(v.startDate) <= new Date(v.endDate),
    {
      message: "startDate must be before or equal to endDate",
      path: ["startDate"],
    }
  );

export type CreateFeatureFlagInput = z.infer<typeof CreateFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof UpdateFeatureFlagSchema>;
