import { PrismaClient, TenantUsageRecord } from "@prisma/client";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import {
  buildUsageWhere,
  buildUsageOrderBy,
  toOffsetPagination,
} from "@/features/tenant/utils/tenant.filters";

export interface UsageListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // filters
  metric?: any;
  recordedAfter?: string;
  recordedBefore?: string;
  processed?: boolean;
}

export class TenantUsageService extends BaseService<TenantUsageRecord> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantUsageRecord");
  }

  async list(
    ctx: RequestContext,
    params: UsageListParams
  ): Promise<
    ApiResponse<{
      items: TenantUsageRecord[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const { page = 1, limit = 10, sortBy, sortOrder, ...filters } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const { skip, take } = toOffsetPagination({ page, limit });
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where = buildUsageWhere(ctx.tenant!.tenantId, filters as any);
        const orderBy = buildUsageOrderBy(sortBy, sortOrder) ?? {
          recordedAt: "desc",
        };

        const [items, total] = await Promise.all([
          tx.tenantUsageRecord.findMany({ where, orderBy, skip, take }),
          tx.tenantUsageRecord.count({ where }),
        ]);

        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  async export(
    ctx: RequestContext,
    params: UsageListParams
  ): Promise<ApiResponse<TenantUsageRecord[]>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      const items = await this.withTenantRLS(ctx, async (tx) => {
        const where = buildUsageWhere(ctx.tenant!.tenantId, params as any);
        const orderBy = buildUsageOrderBy(params.sortBy, params.sortOrder) ?? {
          recordedAt: "desc",
        };
        // Hard cap export size for safety
        return tx.tenantUsageRecord.findMany({ where, orderBy, take: 5000 });
      });
      return items;
    });
  }

  // Abstract CRUD not used for read-only listing/export in this context
  async create(): Promise<any> {
    throw new Error("Not supported");
  }
  async update(): Promise<any> {
    throw new Error("Not supported");
  }
  async delete(): Promise<any> {
    throw new Error("Not supported");
  }
  async findById(): Promise<any> {
    throw new Error("Not supported");
  }
}
