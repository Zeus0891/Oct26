import {
  PrismaClient,
  Prisma,
  TenantFeatureFlag,
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

export interface ListFeatureFlagsParams {
  page?: number;
  limit?: number;
  sortBy?: "key" | "enabled" | "priority" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
  search?: string;
}

export class TenantFeatureFlagsService extends BaseService<TenantFeatureFlag> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantFeatureFlag");
  }

  async create(
    ctx: RequestContext,
    data: Omit<
      TenantFeatureFlag,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "version"
      | "tenantId"
      | "createdByActorId"
      | "updatedByActorId"
      | "deletedAt"
      | "deletedByActorId"
      | "Tenant"
    >
  ): Promise<ApiResponse<TenantFeatureFlag>> {
    return this.withAudit(ctx, AuditAction.CREATE, async () => {
      const created = await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        const {
          // allowed fields
          key,
          name,
          description,
          enabled,
          rolloutPercentage,
          scope,
          targetUserIds,
          targetRoles,
          conditions,
          startDate,
          endDate,
          isTemporary,
          tags,
          environment,
          priority,
          dataClassification,
          retentionPolicy,
        } = data as Partial<TenantFeatureFlag>;

        return tx.tenantFeatureFlag.create({
          data: {
            tenantId: ctx.tenant!.tenantId,
            key: key!,
            name: name!,
            description: description ?? null,
            enabled: enabled ?? false,
            rolloutPercentage: rolloutPercentage ?? 0,
            scope: scope ?? ("TENANT" as any),
            targetUserIds: targetUserIds ?? [],
            targetRoles: targetRoles ?? [],
            conditions: (conditions as Prisma.InputJsonValue) ?? undefined,
            startDate: startDate ?? null,
            endDate: endDate ?? null,
            isTemporary: isTemporary ?? false,
            tags: tags ?? [],
            environment: environment ?? "production",
            priority: priority ?? 0,
            dataClassification: dataClassification ?? "INTERNAL",
            retentionPolicy: (retentionPolicy as any) ?? undefined,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
          } as Prisma.TenantFeatureFlagUncheckedCreateInput,
        });
      });
      return created;
    });
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: Partial<TenantFeatureFlag> & { version?: number }
  ): Promise<ApiResponse<TenantFeatureFlag>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const updated = await this.withTenantRLS(ctx, async (tx) => {
        const existing = await tx.tenantFeatureFlag.findUnique({
          where: { id },
        });
        if (!existing) {
          throw new Error(`TenantFeatureFlag with ID ${id} not found`);
        }

        if (typeof data.version === "number") {
          this.validateVersion(existing, data.version);
        }

        const now = new Date();
        const {
          // updatable fields only (exclude tenantId, createdAt, createdByActorId, deletedAt, deletedByActorId, id)
          name,
          description,
          enabled,
          rolloutPercentage,
          scope,
          targetUserIds,
          targetRoles,
          conditions,
          startDate,
          endDate,
          isTemporary,
          tags,
          environment,
          priority,
          dataClassification,
          retentionPolicy,
        } = data as Partial<TenantFeatureFlag>;

        return tx.tenantFeatureFlag.update({
          where: { id },
          data: {
            name,
            description: description ?? undefined,
            enabled,
            rolloutPercentage,
            scope,
            targetUserIds,
            targetRoles,
            conditions: (conditions as Prisma.InputJsonValue) ?? undefined,
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            isTemporary,
            tags,
            environment,
            priority,
            dataClassification,
            retentionPolicy: (retentionPolicy as any) ?? undefined,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: (existing.version ?? 0) + 1,
          } as Prisma.TenantFeatureFlagUncheckedUpdateInput,
        });
      });
      return updated;
    });
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    return this.withAudit(ctx, AuditAction.DELETE, async () => {
      await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        await tx.tenantFeatureFlag.update({
          where: { id },
          data: {
            deletedAt: now,
            deletedByActorId: ctx.actor?.userId,
            enabled: false,
            status: PlatformTenantChildStatus.INACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
      });
      return undefined as unknown as void;
    });
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<TenantFeatureFlag | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      const entity = await this.withTenantRLS(ctx, async (tx) =>
        tx.tenantFeatureFlag.findUnique({ where: { id } })
      );
      return entity;
    });
  }

  async list(
    ctx: RequestContext,
    params: ListFeatureFlagsParams = {}
  ): Promise<
    ApiResponse<{
      items: TenantFeatureFlag[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      enabled,
      search,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: any = {
          tenantId: ctx.tenant!.tenantId,
          deletedAt: null,
        };
        if (typeof enabled === "boolean") where.enabled = enabled;
        if (search) {
          where.OR = [
            { key: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
          ];
        }

        const orderBy: Record<string, "asc" | "desc"> = {
          [sortBy]: sortOrder,
        } as any;
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.tenantFeatureFlag.findMany({ where, orderBy, skip, take }),
          tx.tenantFeatureFlag.count({ where }),
        ]);

        return { items, total };
      });

      return {
        items: result.items,
        total: result.total,
        page,
        limit,
      };
    });
  }

  async setEnabled(
    ctx: RequestContext,
    id: string,
    enabled: boolean
  ): Promise<ApiResponse<TenantFeatureFlag>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const updated = await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        return tx.tenantFeatureFlag.update({
          where: { id },
          data: {
            enabled,
            status: enabled
              ? PlatformTenantChildStatus.ACTIVE
              : PlatformTenantChildStatus.INACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
      });
      return updated;
    });
  }
}
