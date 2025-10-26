/**
 * Tenant DTO Schemas and Types
 * - Zod schemas for create/update payloads
 * - Types inferred from schemas for use across controllers/services
 *
 * Notes
 * - Aligns with Prisma enums and field constraints from Tenant model
 * - Reuses shared validators for consistency (slug, email, url, names)
 * - Keep status/mutation semantics separated (deactivation handled elsewhere)
 */

import { z } from "zod";
import {
  EmailSchema,
  UrlSchema,
  NameSchema,
  DescriptionSchema,
  SlugSchema,
} from "@/shared/validators/common.validators";
import {
  TenantRegion,
  TenantTier,
  TenantDeploymentType,
  MigrationStatus,
} from "@prisma/client";

// Create Zod enums from Prisma enums (avoid deprecated nativeEnum signature)
const TenantRegionEnum = z.enum(
  Object.values(TenantRegion) as [
    (typeof TenantRegion)[keyof typeof TenantRegion],
    ...(typeof TenantRegion)[keyof typeof TenantRegion][],
  ]
);
const TenantTierEnum = z.enum(
  Object.values(TenantTier) as [
    (typeof TenantTier)[keyof typeof TenantTier],
    ...(typeof TenantTier)[keyof typeof TenantTier][],
  ]
);
const TenantDeploymentTypeEnum = z.enum(
  Object.values(TenantDeploymentType) as [
    (typeof TenantDeploymentType)[keyof typeof TenantDeploymentType],
    ...(typeof TenantDeploymentType)[keyof typeof TenantDeploymentType][],
  ]
);
const MigrationStatusEnum = z.enum(
  Object.values(MigrationStatus) as [
    (typeof MigrationStatus)[keyof typeof MigrationStatus],
    ...(typeof MigrationStatus)[keyof typeof MigrationStatus][],
  ]
);

// ---------------------------------------------------------------------------
// Create Tenant
// ---------------------------------------------------------------------------

export const createTenantSchema = z
  .object({
    // Core identity
    name: NameSchema.max(255),
    slug: SlugSchema.min(3).max(63),

    // Optional profile
    displayName: z.string().max(255).optional(),
    description: DescriptionSchema,
    industry: z.string().max(100).optional(),
    website: UrlSchema.optional(),
    billingEmail: EmailSchema.optional(),

    // Platform configuration
    region: TenantRegionEnum.optional(),
    tier: TenantTierEnum.optional(),
    deploymentType: TenantDeploymentTypeEnum.optional(),
    migrationStatus: MigrationStatusEnum.optional(),

    // Quotas
    maxUsers: z.number().int().min(1).max(10000).optional(),
    maxStorage: z.number().int().min(1).optional(),

    // Initial settings seed (mapped to TenantSettings during provisioning)
    timezone: z.string().max(50).optional(),
    locale: z.string().max(10).optional(),
    currency: z.string().length(3).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Update Tenant (admin-safe subset; status/deactivate handled via dedicated flow)
// ---------------------------------------------------------------------------

export const updateTenantSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    displayName: z.string().max(255).optional(),
    description: z.string().optional(),
    industry: z.string().max(100).optional(),
    website: UrlSchema.optional(),
    billingEmail: EmailSchema.optional(),

    region: TenantRegionEnum.optional(),
    tier: TenantTierEnum.optional(),
    deploymentType: TenantDeploymentTypeEnum.optional(),
    migrationStatus: MigrationStatusEnum.optional(),

    maxUsers: z.number().int().min(1).max(10000).optional(),
    maxStorage: z.number().int().min(1).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Inferred DTO Types
// ---------------------------------------------------------------------------

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
