import { randomUUID } from "crypto";
import { withTenantRLS } from "../../../lib/prisma/withRLS";
import type { CreateProjectDTO, UpdateProjectDTO } from "../../../shared/types";
import type { SecurityContext } from "../../../shared/types/base/rls.types";

// Reuse shared SecurityContext primitives to avoid local type duplication
export type RequestCtx = Pick<SecurityContext, "tenantId" | "userId" | "roles"> & {
  // Ensure roles are provided (withTenantRLS requires a concrete string[])
  roles: string[];
};

export const ProjectsService = {
  async list(ctx: RequestCtx, filter?: { status?: any; q?: string; accountId?: string; locationId?: string; limit?: number; cursor?: string }) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.project.findMany({
          where: {
            tenantId,
            deletedAt: null,
            ...(filter?.accountId ? { accountId: filter.accountId } : {}),
            ...(filter?.locationId ? { locationId: filter.locationId } : {}),
            ...(filter?.status
              ? Array.isArray(filter.status)
                ? { status: { in: filter.status } }
                : { status: filter.status }
              : {}),
            ...(filter?.q
              ? {
                  OR: [
                    { name: { contains: filter.q, mode: "insensitive" } },
                    { externalNumber: { contains: filter.q, mode: "insensitive" } },
                  ],
                }
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
        tx.project.findFirst({ where: { tenantId, id, deletedAt: null } }),
      userId
    );
  },

  async create(ctx: RequestCtx, data: CreateProjectDTO) {
    const { tenantId, roles, userId } = ctx;
    type ProjectCreatePayload = CreateProjectDTO & {
      tenantId: string;
      updatedAt: Date;
      globalId: string;
      createdByActorId?: string | null;
      updatedByActorId?: string | null;
    };

    const payload: ProjectCreatePayload = {
      ...data,
      tenantId,
      updatedAt: new Date(),
      globalId: randomUUID(),
      // Use null for actor ids unless we resolve Actor mapping
      createdByActorId: null,
      updatedByActorId: null,
    };
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) => tx.project.create({ data: payload }),
      userId
    );
  },

  async update(ctx: RequestCtx, id: string, data: UpdateProjectDTO) {
    const { tenantId, roles, userId } = ctx;
    const payload = { ...data, updatedAt: new Date(), updatedByActorId: userId ?? null };
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) => tx.project.update({ where: { id }, data: payload }),
      userId
    );
  },

  async softDelete(ctx: RequestCtx, id: string) {
    const { tenantId, roles, userId } = ctx;
    return withTenantRLS(
      tenantId,
      roles,
      async (tx: any) =>
        tx.project.update({
          where: { id },
          data: { deletedAt: new Date(), deletedByActorId: userId ?? null },
        }),
      userId
    );
  },
};
