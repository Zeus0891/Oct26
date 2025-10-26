import { PrismaClient, Prisma, TenantAuditLog } from "@prisma/client";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";

export interface AuditListParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "actorId" | "action";
  sortOrder?: "asc" | "desc";
  action?: string;
  from?: string;
  to?: string;
}

export class TenantAuditService extends BaseService<TenantAuditLog> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantAuditLog");
  }

  async list(
    ctx: RequestContext,
    params: AuditListParams
  ): Promise<
    ApiResponse<{
      items: TenantAuditLog[];
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
      action,
      from,
      to,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: any = { tenantId: ctx.tenant!.tenantId };
        if (action) where.action = action as any;
        if (from || to) {
          where.createdAt = {} as any;
          if (from) where.createdAt.gte = new Date(from);
          if (to) where.createdAt.lte = new Date(to);
        }
        const orderBy: Prisma.TenantAuditLogOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        } as Prisma.TenantAuditLogOrderByWithRelationInput;
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));
        const [items, total] = await Promise.all([
          tx.tenantAuditLog.findMany({ where, orderBy, skip, take }),
          tx.tenantAuditLog.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  async export(
    ctx: RequestContext,
    params: Omit<AuditListParams, "page" | "limit">
  ): Promise<ApiResponse<TenantAuditLog[]>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      const items = await this.withTenantRLS(ctx, async (tx) => {
        const where: any = { tenantId: ctx.tenant!.tenantId };
        if (params.action) where.action = params.action as any;
        if (params.from || params.to) {
          where.createdAt = {} as any;
          if (params.from) where.createdAt.gte = new Date(params.from);
          if (params.to) where.createdAt.lte = new Date(params.to);
        }
        const orderBy: Prisma.TenantAuditLogOrderByWithRelationInput =
          params.sortBy
            ? ({ [params.sortBy]: params.sortOrder ?? "desc" } as any)
            : ({ createdAt: "desc" } as any);
        return tx.tenantAuditLog.findMany({ where, orderBy, take: 5000 });
      });
      return items;
    });
  }

  // Abstract members not used here (read-only service)
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

export default TenantAuditService;
