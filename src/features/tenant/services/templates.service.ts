import {
  PrismaClient,
  Prisma,
  TermsTemplate,
  ContractTemplate,
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

export interface ListTemplatesParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
  status?: PlatformTenantChildStatus;
}

/**
 * TermsTemplateService
 * Manages standardized terms templates used across documents
 */
export class TermsTemplateService extends BaseService<TermsTemplate> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TermsTemplate");
  }

  async list(
    ctx: RequestContext,
    params: ListTemplatesParams
  ): Promise<
    ApiResponse<{
      items: TermsTemplate[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.TermsTemplateWhereInput = {
          tenantId: ctx.tenant!.tenantId,
          deletedAt: null,
        };
        if (status) where.status = status;

        const orderBy: Prisma.TermsTemplateOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };

        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.termsTemplate.findMany({ where, orderBy, skip, take }),
          tx.termsTemplate.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<TermsTemplate | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      return this.withTenantRLS(ctx, async (tx) =>
        tx.termsTemplate.findUnique({
          where: { id },
        })
      );
    });
  }

  async create(
    ctx: RequestContext,
    data: import("@/shared/services/base/base.service").CreateInput<TermsTemplate>
  ): Promise<ApiResponse<TermsTemplate>> {
    return this.withAudit(ctx, AuditAction.CREATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.termsTemplate.create({
          data: {
            tenantId: ctx.tenant!.tenantId,
            status: PlatformTenantChildStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
            ...(data as any),
          } as Prisma.TermsTemplateUncheckedCreateInput,
        })
      );
    });
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: import("@/shared/services/base/base.service").UpdateInput<TermsTemplate>
  ): Promise<ApiResponse<TermsTemplate>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.termsTemplate.update({
          where: { id },
          data: {
            ...(data as any),
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 },
          } as Prisma.TermsTemplateUncheckedUpdateInput,
        })
      );
    });
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    return this.withAudit(ctx, AuditAction.DELETE, async () => {
      const now = new Date();
      await this.withTenantRLS(ctx, async (tx) =>
        tx.termsTemplate.update({
          where: { id },
          data: {
            deletedAt: now,
            deletedByActorId: ctx.actor?.userId,
            status: PlatformTenantChildStatus.ARCHIVED,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
          },
        })
      );
      return undefined;
    });
  }

  async restore(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<TermsTemplate>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.termsTemplate.update({
          where: { id },
          data: {
            deletedAt: null,
            deletedByActorId: null,
            status: PlatformTenantChildStatus.ACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
          },
        })
      );
    });
  }
}

/**
 * ContractTemplateService
 * Manages contract templates for reuse across projects and estimates
 */
export class ContractTemplateService extends BaseService<ContractTemplate> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "ContractTemplate");
  }

  async list(
    ctx: RequestContext,
    params: ListTemplatesParams
  ): Promise<
    ApiResponse<{
      items: ContractTemplate[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.ContractTemplateWhereInput = {
          tenantId: ctx.tenant!.tenantId,
          deletedAt: null,
        };
        if (status) where.status = status;

        const orderBy: Prisma.ContractTemplateOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };

        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.contractTemplate.findMany({ where, orderBy, skip, take }),
          tx.contractTemplate.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<ContractTemplate | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      return this.withTenantRLS(ctx, async (tx) =>
        tx.contractTemplate.findUnique({
          where: { id },
        })
      );
    });
  }

  async create(
    ctx: RequestContext,
    data: import("@/shared/services/base/base.service").CreateInput<ContractTemplate>
  ): Promise<ApiResponse<ContractTemplate>> {
    return this.withAudit(ctx, AuditAction.CREATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.contractTemplate.create({
          data: {
            tenantId: ctx.tenant!.tenantId,
            status: PlatformTenantChildStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
            ...(data as any),
          } as Prisma.ContractTemplateUncheckedCreateInput,
        })
      );
    });
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: import("@/shared/services/base/base.service").UpdateInput<ContractTemplate>
  ): Promise<ApiResponse<ContractTemplate>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.contractTemplate.update({
          where: { id },
          data: {
            ...(data as any),
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 },
          } as Prisma.ContractTemplateUncheckedUpdateInput,
        })
      );
    });
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    return this.withAudit(ctx, AuditAction.DELETE, async () => {
      const now = new Date();
      await this.withTenantRLS(ctx, async (tx) =>
        tx.contractTemplate.update({
          where: { id },
          data: {
            deletedAt: now,
            deletedByActorId: ctx.actor?.userId,
            status: PlatformTenantChildStatus.ARCHIVED,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
          },
        })
      );
      return undefined;
    });
  }

  async restore(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<ContractTemplate>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) =>
        tx.contractTemplate.update({
          where: { id },
          data: {
            deletedAt: null,
            deletedByActorId: null,
            status: PlatformTenantChildStatus.ACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
          },
        })
      );
    });
  }
}
