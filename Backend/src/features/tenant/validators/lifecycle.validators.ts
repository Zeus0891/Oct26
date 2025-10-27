/**
 * Tenant Lifecycle Validators
 * - Provisioning payloads and admin lifecycle actions
 */
import { z } from "zod";
import { TenantRegion, TenantTier, TenantDeploymentType } from "@prisma/client";
import { createTenantSchema } from "../types/tenant.types";

// Build Zod enums from Prisma enums (avoid deprecated nativeEnum)
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

/**
 * Provision Tenant payload schema
 * - Requires name, slug, region, tier
 * - Accepts optional deploymentType and profile/quotas/settings from createTenantSchema
 */
export const ProvisionTenantSchema = createTenantSchema
  .extend({
    region: TenantRegionEnum,
    tier: TenantTierEnum,
    deploymentType: TenantDeploymentTypeEnum.optional(),
  })
  .strict();

export type ProvisionTenantInput = z.infer<typeof ProvisionTenantSchema>;
