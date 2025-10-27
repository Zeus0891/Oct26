import { PrismaClient, Tenant, TenantStatus } from "@prisma/client";
import { ApiResponse } from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";

/**
 * TenantService
 * Orchestrator service for Tenant profile operations and cross-entity queries
 * NOTE: Tenant is a global model, not tenant-scoped, so this service handles
 * direct Prisma operations with manual audit tracking
 */
export class TenantService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditService: AuditService,
    private readonly rbacService: RBACService
  ) {}

  /**
   * Get tenant profile by ID (admin/global read)
   */
  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<Tenant | null>> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id },
      });
      return { success: true, data: tenant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TENANT_READ_FAILED",
          message: error instanceof Error ? error.message : "Read failed",
        },
      };
    }
  }

  /**
   * Update tenant profile (limited attributes, admin-only)
   */
  async update(
    ctx: RequestContext,
    id: string,
    data: Partial<Tenant>
  ): Promise<ApiResponse<Tenant>> {
    try {
      const now = new Date();
      const tenant = await this.prisma.tenant.update({
        where: { id },
        data: {
          ...data,
          updatedAt: now,
          updatedByActorId: ctx.actor?.userId,
        },
      });
      return { success: true, data: tenant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TENANT_UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Update failed",
        },
      };
    }
  }

  /**
   * Deactivate tenant (admin-only)
   */
  async deactivate(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<Tenant>> {
    try {
      const now = new Date();
      const tenant = await this.prisma.tenant.update({
        where: { id },
        data: {
          status: TenantStatus.SUSPENDED,
          updatedAt: now,
          updatedByActorId: ctx.actor?.userId,
        },
      });
      return { success: true, data: tenant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TENANT_DEACTIVATE_FAILED",
          message:
            error instanceof Error ? error.message : "Deactivation failed",
        },
      };
    }
  }

  /**
   * Get tenant profile summary with computed stats
   * (cross-entity query: subscription, usage, metrics, feature flags)
   */
  async getProfileSummary(
    ctx: RequestContext,
    tenantId: string
  ): Promise<
    ApiResponse<{
      tenant: Tenant | null;
      subscriptionStatus?: string;
      activeUsers?: number;
      activeFeaturesCount?: number;
      storageUsedMB?: number;
    }>
  > {
    try {
      const [tenant, subscription, featureFlagsCount] = await Promise.all([
        this.prisma.tenant.findUnique({ where: { id: tenantId } }),
        this.prisma.tenantSubscription.findFirst({
          where: { tenantId, status: "ACTIVE" as any },
        }),
        this.prisma.tenantFeatureFlag.count({
          where: { tenantId, enabled: true, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        data: {
          tenant,
          subscriptionStatus: subscription?.status || "NONE",
          activeFeaturesCount: featureFlagsCount,
          activeUsers: 0, // Placeholder: query User model if available
          storageUsedMB: 0, // Placeholder: aggregate from usage records if needed
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PROFILE_SUMMARY_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Profile summary query failed",
        },
      };
    }
  }
}
