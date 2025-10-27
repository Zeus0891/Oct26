import { AuditService } from "@/shared/services/audit/audit.service";
import { ApiResponse } from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import {
    NumberSequenceResetMode,
    PlatformTenantChildStatus,
    PrismaClient,
    Tenant,
    TenantStatus,
} from "@prisma/client";

export interface ProvisionTenantInput {
  name: string;
  slug: string;
  displayName?: string;
  description?: string;
  industry?: string;
  website?: string;
  tier?: string;
  region?: string;
  billingEmail?: string;
}

/**
 * TenantLifecycleService
 * Manages tenant provisioning, bootstrapping, and deactivation
 * NOTE: Does not extend BaseService since Tenant is a global model, not tenant-scoped
 */
export class TenantLifecycleService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditService: AuditService,
    private readonly rbacService: RBACService
  ) {}

  /**
   * Provision a new tenant with default settings, encryption, sequences, and templates
   */
  async provisionTenant(
    ctx: RequestContext,
    input: ProvisionTenantInput
  ): Promise<ApiResponse<Tenant>> {
    const now = new Date();

    try {
      // Run provisioning in a transaction for atomicity
      const tenant = await this.prisma.$transaction(async (tx) => {
        // 1. Create global Tenant record
        const newTenant = await tx.tenant.create({
          data: {
            name: input.name,
            slug: input.slug,
            displayName: input.displayName,
            description: input.description,
            industry: input.industry,
            website: input.website,
            tier: (input.tier as any) || "STARTER",
            region: (input.region as any) || "US_EAST_1",
            billingEmail: input.billingEmail,
            status: TenantStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
            encryptionEnabled: true,
            backupEnabled: true,
            complianceLevel: "STANDARD",
          },
        });

        // 2. Bootstrap TenantSettings with defaults
        await tx.tenantSettings.create({
          data: {
            tenantId: newTenant.id,
            status: PlatformTenantChildStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
            // Use fields that exist in schema
            timezone: "UTC",
            locale: "en-US",
            currency: "USD",
          },
        });

        // 3. Create EncryptionProfile baseline (minimal fields)
        await tx.encryptionProfile.create({
          data: {
            tenantId: newTenant.id,
            status: PlatformTenantChildStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
          },
        });

        // 4. Seed core NumberSequences
        const sequences = [
          {
            code: "INV",
            name: "Invoice Sequence",
            prefix: "INV",
            description: "Sequential numbering for invoices",
          },
          {
            code: "PO",
            name: "Purchase Order Sequence",
            prefix: "PO",
            description: "Sequential numbering for purchase orders",
          },
          {
            code: "EST",
            name: "Estimate Sequence",
            prefix: "EST",
            description: "Sequential numbering for estimates",
          },
          {
            code: "PROJ",
            name: "Project Sequence",
            prefix: "PROJ",
            description: "Sequential numbering for projects",
          },
        ];

        for (const seq of sequences) {
          await tx.numberSequence.create({
            data: {
              tenantId: newTenant.id,
              status: PlatformTenantChildStatus.ACTIVE,
              code: seq.code,
              name: seq.name,
              description: seq.description,
              prefix: seq.prefix,
              suffix: null,
              paddingLength: 6,
              currentValue: 1,
              minValue: 1,
              maxValue: null,
              step: 1,
              resetMode: NumberSequenceResetMode.NEVER,
              resetValue: 1,
              formatTemplate: "{prefix}-{number}",
              exampleOutput: `${seq.prefix}-000001`,
              createdAt: now,
              updatedAt: now,
              createdByActorId: ctx.actor?.userId,
              updatedByActorId: ctx.actor?.userId,
            },
          });
        }

        // 5. Seed a baseline DocumentGroup to enable dependent modules (e.g., Projects)
        // Ensure RLS claims are set within this transaction for the new tenant
        try {
          await tx.$executeRaw`select set_config('request.jwt.claims', ${JSON.stringify({
            tenant_id: newTenant.id,
            user_id: ctx.actor?.userId || null,
            role: 'authenticated',
            roles: 'ADMIN',
            correlation_id: `tenant_provision_${Date.now()}`,
          })}, true)`;
        } catch {}
        await tx.documentGroup.create({
          data: {
            tenantId: newTenant.id,
            // status defaults to ACTIVE
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
          },
        });

        // 6. Optionally seed default templates (placeholder if URLs/content needed)
        // NOTE: TermsTemplate and ContractTemplate have no business fields beyond base,
        // so we skip creation unless there's a URL or content field to populate in future schema updates.

        return newTenant;
      });

      return { success: true, data: tenant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PROVISION_FAILED",
          message:
            error instanceof Error ? error.message : "Provisioning failed",
        },
      };
    }
  }

  /**
   * Deactivate a tenant and update status
   * (Admin-only operation; orchestrates safe deactivation)
   */
  async deactivateTenant(
    ctx: RequestContext,
    tenantId: string
  ): Promise<ApiResponse<Tenant>> {
    const now = new Date();

    try {
      const tenant = await this.prisma.$transaction(async (tx) => {
        // Update tenant status
        const updated = await tx.tenant.update({
          where: { id: tenantId },
          data: {
            status: TenantStatus.SUSPENDED,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
          },
        });

        // Optionally deactivate related settings (keep as ACTIVE unless policy dictates otherwise)
        // await tx.tenantSettings.updateMany({
        //   where: { tenantId },
        //   data: { status: PlatformTenantChildStatus.INACTIVE, updatedAt: now },
        // });

        return updated;
      });

      return { success: true, data: tenant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEACTIVATION_FAILED",
          message:
            error instanceof Error ? error.message : "Deactivation failed",
        },
      };
    }
  }
}
