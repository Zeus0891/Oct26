import {
  PrismaClient,
  TenantEvent,
  EventProjection,
  EventSnapshot,
  Prisma,
} from "@prisma/client";
import type { RequestContext } from "@/shared/services/base/context.service";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";

export interface EventListParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "occurredAt" | "sequence";
  sortOrder?: "asc" | "desc";
  eventType?: string;
  aggregateType?: string;
  aggregateId?: string;
  from?: string;
  to?: string;
  processed?: boolean;
}

export interface ProjectionListParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  name?: string;
}

export interface SnapshotListParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "aggregateVersion";
  sortOrder?: "asc" | "desc";
  aggregateType?: string;
  aggregateId?: string;
}

/**
 * TenantEventsService
 * Read-only service for querying TenantEvent, EventProjection, and EventSnapshot
 * Supports event sourcing queries with filters and pagination
 */
export class TenantEventsService extends BaseService<TenantEvent> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "TenantEvent");
  }

  /**
   * List events with filters and pagination
   */
  async listEvents(
    ctx: RequestContext,
    params: EventListParams
  ): Promise<
    ApiResponse<{
      items: TenantEvent[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 50,
      sortBy = "occurredAt",
      sortOrder = "desc",
      eventType,
      aggregateType,
      aggregateId,
      from,
      to,
      processed,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.TenantEventWhereInput = {
          tenantId: ctx.tenant!.tenantId,
        };
        if (eventType) where.eventType = eventType as any;
        if (aggregateType) where.aggregateType = aggregateType;
        if (aggregateId) where.aggregateId = aggregateId;
        if (processed !== undefined) where.processed = processed;
        if (from || to) {
          where.occurredAt = {};
          if (from) where.occurredAt.gte = new Date(from);
          if (to) where.occurredAt.lte = new Date(to);
        }

        const orderBy: Prisma.TenantEventOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.tenantEvent.findMany({ where, orderBy, skip, take }),
          tx.tenantEvent.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  /**
   * List projections with filters and pagination
   */
  async listProjections(
    ctx: RequestContext,
    params: ProjectionListParams
  ): Promise<
    ApiResponse<{
      items: EventProjection[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 50,
      sortBy = "updatedAt",
      sortOrder = "desc",
      name,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.EventProjectionWhereInput = {
          tenantId: ctx.tenant!.tenantId,
        };
        if (name) where.name = { contains: name, mode: "insensitive" };

        const orderBy: Prisma.EventProjectionOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.eventProjection.findMany({ where, orderBy, skip, take }),
          tx.eventProjection.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  /**
   * List snapshots with filters and pagination
   */
  async listSnapshots(
    ctx: RequestContext,
    params: SnapshotListParams
  ): Promise<
    ApiResponse<{
      items: EventSnapshot[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
      aggregateType,
      aggregateId,
    } = params;

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const result = await this.withTenantRLS(ctx, async (tx) => {
        const where: Prisma.EventSnapshotWhereInput = {
          tenantId: ctx.tenant!.tenantId,
        };
        if (aggregateType) where.aggregateType = aggregateType;
        if (aggregateId) where.aggregateId = aggregateId;

        const orderBy: Prisma.EventSnapshotOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };
        const skip = Math.max(
          0,
          (page - 1) * Math.min(100, Math.max(1, limit))
        );
        const take = Math.min(100, Math.max(1, limit));

        const [items, total] = await Promise.all([
          tx.eventSnapshot.findMany({ where, orderBy, skip, take }),
          tx.eventSnapshot.count({ where }),
        ]);
        return { items, total };
      });

      return { items: result.items, total: result.total, page, limit };
    });
  }

  // Abstract methods not used (read-only service)
  async create(): Promise<any> {
    throw new Error("Not supported - events are immutable");
  }
  async update(): Promise<any> {
    throw new Error("Not supported - events are immutable");
  }
  async delete(): Promise<any> {
    throw new Error("Not supported - events are immutable");
  }
  async findById(): Promise<any> {
    throw new Error("Not supported - use listEvents with filters");
  }
}

export default TenantEventsService;
