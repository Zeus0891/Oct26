import { PrismaClient, TenantMetrics } from "@prisma/client";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import {
  buildMetricsWhere,
  buildMetricsOrderBy,
  toOffsetPagination,
} from "@/features/tenant/utils/tenant.filters";

export interface MetricsListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // filters
  from?: string;
  to?: string;
  hour?: number;
}

export class TenantMetricsService extends BaseService<TenantMetrics> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantMetrics");
  }

  async list(
    ctx: RequestContext,
    params: MetricsListParams
  ): Promise<
    ApiResponse<{
      items: TenantMetrics[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const { page = 1, limit = 10, sortBy, sortOrder, ...filters } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const { skip, take } = toOffsetPagination({ page, limit });
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where = buildMetricsWhere(ctx.tenant!.tenantId, filters as any);
        const orderBy = buildMetricsOrderBy(sortBy, sortOrder) ?? {
          metricDate: "desc",
        };

        const [items, total] = await Promise.all([
          tx.tenantMetrics.findMany({ where, orderBy, skip, take }),
          tx.tenantMetrics.count({ where }),
        ]);

        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  async export(
    ctx: RequestContext,
    params: MetricsListParams
  ): Promise<ApiResponse<TenantMetrics[]>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      const items = await this.withTenantRLS(ctx, async (tx) => {
        const where = buildMetricsWhere(ctx.tenant!.tenantId, params as any);
        const orderBy = buildMetricsOrderBy(
          params.sortBy,
          params.sortOrder
        ) ?? {
          metricDate: "desc",
        };
        // Hard cap export size for safety
        return tx.tenantMetrics.findMany({ where, orderBy, take: 5000 });
      });
      return items;
    });
  }

  // Abstract methods not used for read-only model in this context
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
