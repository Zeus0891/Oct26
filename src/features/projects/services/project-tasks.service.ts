import { withTenantRLS } from "../../../lib/prisma/withRLS";
import type {
    CreateProjectTaskDTO,
    ProjectTaskListFilter,
    UpdateProjectTaskDTO,
} from "../../../shared/types";
import { RequestCtx } from "./projects.service";

export const ProjectTasksService = {
  async list(
    ctx: RequestCtx,
    filter?: ProjectTaskListFilter & { limit?: number; cursor?: string }
  ) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.projectTask.findMany({
          where: {
            tenantId,
            deletedAt: null,
            ...(filter?.projectId ? { projectId: filter.projectId } : {}),
            ...(filter?.status
              ? Array.isArray(filter.status)
                ? { status: { in: filter.status } }
                : { status: filter.status }
              : {}),
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
        tx.projectTask.findFirst({ where: { tenantId, id, deletedAt: null } }),
      userId
    );
  },

  async create(ctx: RequestCtx, data: CreateProjectTaskDTO) {
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
      async (tx: any) => tx.projectTask.create({ data: payload }),
      userId
    );
  },

  async update(ctx: RequestCtx, id: string, data: UpdateProjectTaskDTO) {
    const { tenantId, roles, userId } = ctx;
    const payload = { ...data, updatedAt: new Date(), updatedByActorId: userId ?? null };
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) => tx.projectTask.update({ where: { id }, data: payload }),
      userId
    );
  },

  async softDelete(ctx: RequestCtx, id: string) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.projectTask.update({
          where: { id },
          data: { deletedAt: new Date(), deletedByActorId: userId ?? null },
        }),
      userId
    );
  },
};
