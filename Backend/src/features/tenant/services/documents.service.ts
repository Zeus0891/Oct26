import { AuditService } from "@/shared/services/audit/audit.service";
import {
    ApiResponse,
    AuditAction,
    BaseService,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import {
    DocumentGroup,
    PlatformTenantChildStatus,
    Prisma,
    PrismaClient,
} from "@prisma/client";

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export class DocumentGroupsService extends BaseService<DocumentGroup> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "DocumentGroup");
  }

  async create(ctx: RequestContext): Promise<ApiResponse<DocumentGroup>> {
    return this.withAudit(ctx, AuditAction.CREATE, async () => {
      const created = await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        return tx.documentGroup.create({
          data: {
            tenantId: ctx.tenant!.tenantId,
            status: PlatformTenantChildStatus.ACTIVE,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
          },
        });
      });
      return created;
    });
  }

  async update(): Promise<any> {
    throw new Error("Not supported");
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    return this.withAudit(ctx, AuditAction.DELETE, async () => {
      await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        await tx.documentGroup.update({
          where: { id },
          data: {
            deletedAt: now,
            deletedByActorId: ctx.actor?.userId,
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

  async restore(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<DocumentGroup>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const restored = await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        return tx.documentGroup.update({
          where: { id },
          data: {
            deletedAt: null,
            deletedByActorId: null,
            status: PlatformTenantChildStatus.ACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
      });
      return restored;
    });
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<DocumentGroup | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      const entity = await this.withTenantRLS(ctx, async (tx) =>
        tx.documentGroup.findUnique({ where: { id } })
      );
      return entity;
    });
  }

  async list(
    ctx: RequestContext,
    params: ListDocumentsParams = {}
  ): Promise<
    ApiResponse<{
      items: DocumentGroup[];
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
      search,
    } = params;
    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.DocumentGroupWhereInput = {
          tenantId: ctx.tenant!.tenantId,
          deletedAt: null,
        } as any;
        if (search) {
          // No name/description fields; use status as basic filter toggle
          (where as any).status = PlatformTenantChildStatus.ACTIVE;
        }
        const orderBy: Prisma.DocumentGroupOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        } as any;
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));
        const [items, total] = await Promise.all([
          tx.documentGroup.findMany({ where, orderBy, skip, take }),
          tx.documentGroup.count({ where }),
        ]);
        return { items, total };
      });
      return { items: result.items, total: result.total, page, limit };
    });
  }
}

export default DocumentGroupsService;
