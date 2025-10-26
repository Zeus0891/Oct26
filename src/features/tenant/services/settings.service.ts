import {
  PrismaClient,
  Prisma,
  TenantSettings,
  PlatformTenantChildStatus,
} from "@prisma/client";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";

export class TenantSettingsService extends BaseService<TenantSettings> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantSettings");
  }

  async get(ctx: RequestContext): Promise<ApiResponse<TenantSettings | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      return this.withTenantRLS(ctx, async (tx) =>
        tx.tenantSettings.findFirst({
          where: { tenantId: ctx.tenant!.tenantId },
        })
      );
    });
  }

  async upsert(
    ctx: RequestContext,
    data: Partial<TenantSettings>
  ): Promise<ApiResponse<TenantSettings>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const updated = await this.withTenantRLS(ctx, async (tx) => {
        const existing = await tx.tenantSettings.findFirst({
          where: { tenantId: ctx.tenant!.tenantId },
        });
        const now = new Date();
        if (!existing) {
          // Create if not present (should exist from provisioning, but be resilient)
          return tx.tenantSettings.create({
            data: {
              ...(data as any),
              tenantId: ctx.tenant!.tenantId,
              createdAt: now,
              updatedAt: now,
              createdByActorId: ctx.actor?.userId,
              updatedByActorId: ctx.actor?.userId,
            } as Prisma.TenantSettingsUncheckedCreateInput,
          });
        }
        return tx.tenantSettings.update({
          where: { id: existing.id },
          data: {
            ...(data as any),
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          } as Prisma.TenantSettingsUncheckedUpdateInput,
        });
      });
      return updated;
    });
  }

  async setStatus(
    ctx: RequestContext,
    status: PlatformTenantChildStatus
  ): Promise<ApiResponse<TenantSettings>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const updated = await this.withTenantRLS(ctx, async (tx) => {
        const existing = await tx.tenantSettings.findFirst({
          where: { tenantId: ctx.tenant!.tenantId },
        });
        if (!existing) {
          throw new Error("TenantSettings not found for tenant");
        }
        const now = new Date();
        return tx.tenantSettings.update({
          where: { id: existing.id },
          data: {
            status,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
      });
      return updated;
    });
  }

  // Implement abstract methods with sensible behavior for a singleton settings entity
  async create(
    ctx: RequestContext,
    data: import("@/shared/services/base/base.service").CreateInput<TenantSettings>
  ): Promise<ApiResponse<TenantSettings>> {
    return this.upsert(ctx, data as Partial<TenantSettings>);
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: import("@/shared/services/base/base.service").UpdateInput<TenantSettings>
  ): Promise<ApiResponse<TenantSettings>> {
    // Ignore id; operate on tenant singleton
    return this.upsert(ctx, data);
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    // For settings, treat delete as deactivate
    await this.setStatus(ctx, PlatformTenantChildStatus.INACTIVE);
    return { success: true, data: undefined as unknown as void };
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<TenantSettings | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      return this.withTenantRLS(ctx, async (tx) =>
        tx.tenantSettings.findUnique({ where: { id } })
      );
    });
  }
}
