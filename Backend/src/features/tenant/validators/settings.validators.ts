/**
 * Tenant Settings Validators
 * - Update payload schema for per-tenant configuration
 */
import { z } from "zod";
import {
  EmailSchema,
  UrlSchema,
  PhoneSchema,
  MetadataSchema,
} from "@/shared/validators/common.validators";

const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .describe("Hex color, e.g. #RRGGBB");

/**
 * Update TenantSettings payload schema
 * Accepts a broad but controlled set of optional fields.
 */
export const UpdateTenantSettingsSchema = z
  .object({
    // Branding
    logoUrl: UrlSchema.optional(),
    faviconUrl: UrlSchema.optional(),
    primaryColor: HexColorSchema.optional(),
    secondaryColor: HexColorSchema.optional(),
    accentColor: HexColorSchema.optional(),
    displayName: z.string().max(255).optional(),
    tagline: z.string().max(500).optional(),
    customCss: z.string().max(20000).optional(),
    customJs: z.string().max(20000).optional(),

    // Contact & support
    supportEmail: EmailSchema.optional(),
    supportPhone: PhoneSchema.optional(),
    supportUrl: UrlSchema.optional(),
    salesEmail: EmailSchema.optional(),
    salesPhone: PhoneSchema.optional(),

    // Locale & formatting
    timezone: z.string().max(50).optional(),
    locale: z.string().max(10).optional(),
    currency: z.string().max(3).optional(),
    dateFormat: z.string().max(20).optional(),
    timeFormat: z.enum(["12h", "24h"]).optional(),

    // Notifications & policies
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    publicSignup: z.boolean().optional(),
    ssoEnabled: z.boolean().optional(),
    mfaRequired: z.boolean().optional(),
    apiAccessEnabled: z.boolean().optional(),

    // PM policy toggles (subset, extend as needed)
    pmCanDeleteEstimate: z.boolean().optional(),
    pmCanApproveEstimate: z.boolean().optional(),
    pmCanConvertEstimate: z.boolean().optional(),
    pmCanDeleteProject: z.boolean().optional(),
    pmCanDeleteTask: z.boolean().optional(),
    pmCanApproveChangeOrder: z.boolean().optional(),
    pmCanApproveInvoice: z.boolean().optional(),
    pmCanRejectInvoice: z.boolean().optional(),
    pmCanApproveTimesheet: z.boolean().optional(),
    pmCanApproveExpense: z.boolean().optional(),
    pmCanRejectExpense: z.boolean().optional(),
    pmCanManageMembers: z.boolean().optional(),
    pmCanAssignRoles: z.boolean().optional(),
    pmCanTerminateMembers: z.boolean().optional(),
    pmCanClosePunchListItem: z.boolean().optional(),
    pmCanApproveInspection: z.boolean().optional(),
    pmCanPublishDailyLog: z.boolean().optional(),
    pmCanPublishReport: z.boolean().optional(),
    pmCanAuthorizeInventory: z.boolean().optional(),
    pmCanManageExternalAccess: z.boolean().optional(),
    pmCanAccessFinancials: z.boolean().optional(),

    // Templates & custom settings
    contractTemplateUrl: UrlSchema.optional(),
    termsTemplateUrl: UrlSchema.optional(),
    customSettings: MetadataSchema, // free-form JSON
  })
  .strict();

export type UpdateTenantSettingsInput = z.infer<
  typeof UpdateTenantSettingsSchema
>;

/**
 * Activate/Deactivate TenantSettings payload schemas (admin)
 * Keep payload minimal and auditable with optional reason.
 */
export const ActivateTenantSettingsSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();

export const DeactivateTenantSettingsSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();

export type ActivateTenantSettingsInput = z.infer<
  typeof ActivateTenantSettingsSchema
>;
export type DeactivateTenantSettingsInput = z.infer<
  typeof DeactivateTenantSettingsSchema
>;
