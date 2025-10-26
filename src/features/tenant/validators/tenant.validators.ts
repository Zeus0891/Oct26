/**
 * Tenant Validators
 * Enterprise-grade schemas for Tenant operations.
 *
 * - Create/Update schemas are sourced from ../types to keep a single source of truth
 * - Deactivate schema is defined here for admin action payloads
 */
import { z } from "zod";
// Re-export from types as single source of truth
export { createTenantSchema, updateTenantSchema } from "../types/tenant.types";
export type { CreateTenantDto, UpdateTenantDto } from "../types/tenant.types";

/**
 * Create/Update re-exports
 */
// (Re-exports above)

/**
 * Deactivate Tenant payload schema (admin)
 */
export const DeactivateTenantSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();

export type DeactivateTenantInput = z.infer<typeof DeactivateTenantSchema>;
