import { withTenantRLS } from "../../../lib/prisma/withRLS";
import type {
    CreateProjectMemberDTO,
    ProjectMemberListFilter,
    UpdateProjectMemberDTO,
} from "../../../shared/types";
import { RequestCtx } from "./projects.service";

export const ProjectMembersService = {
  async list(
    ctx: RequestCtx,
    filter?: ProjectMemberListFilter & { limit?: number; cursor?: string }
  ) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.projectMember.findMany({
          where: {
            tenantId,
            deletedAt: null,
            ...(filter?.projectId ? { projectId: filter.projectId } : {}),
            ...(filter?.memberId ? { memberId: filter.memberId } : {}),
            ...(filter?.role ? { role: filter.role } : {}),
          },
          orderBy: [{ createdAt: "desc" }],
          take: filter?.limit,
        }),
      userId
    );
  },

  async getById(ctx: RequestCtx, id: string) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.projectMember.findFirst({ where: { tenantId, id, deletedAt: null } }),
      userId
    );
  },

  async create(ctx: RequestCtx, data: CreateProjectMemberDTO) {
    const { tenantId, roles, userId } = ctx;
    const payload = {
      ...data,
      tenantId,
      updatedAt: new Date(),
      updatedByActorId: null,
      createdByActorId: null,
    };
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) => tx.projectMember.create({ data: payload }),
      userId
    );
  },

  async update(ctx: RequestCtx, id: string, data: UpdateProjectMemberDTO) {
    const { tenantId, roles, userId } = ctx;
    const payload = { ...data, updatedAt: new Date(), updatedByActorId: userId ?? null };
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) => tx.projectMember.update({ where: { id }, data: payload }),
      userId
    );
  },

  async softDelete(ctx: RequestCtx, id: string) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.projectMember.update({
          where: { id },
          data: { deletedAt: new Date(), deletedByActorId: userId ?? null },
        }),
      userId
    );
  },
};
