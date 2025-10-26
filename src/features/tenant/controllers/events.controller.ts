import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantEventsService } from "@/features/tenant/services/events.service";

export class TenantEventsController {
  private readonly svc: TenantEventsService;

  constructor(service?: TenantEventsService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantEventsService(prisma, audit, rbac);
  }

  /**
   * List tenant events with filters
   */
  async listEvents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        eventType,
        aggregateType,
        aggregateId,
        from,
        to,
        processed,
      } = (req.query as any) ?? {};
      let processedFilter: boolean | undefined;
      if (processed === "true") processedFilter = true;
      else if (processed === "false") processedFilter = false;
      const result = await this.svc.listEvents(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: typeof sortBy === "string" ? (sortBy as any) : undefined,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        eventType: typeof eventType === "string" ? eventType : undefined,
        aggregateType:
          typeof aggregateType === "string" ? aggregateType : undefined,
        aggregateId: typeof aggregateId === "string" ? aggregateId : undefined,
        from: typeof from === "string" ? from : undefined,
        to: typeof to === "string" ? to : undefined,
        processed: processedFilter,
      });
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List event projections
   */
  async listProjections(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { page, limit, sortBy, sortOrder, name } = (req.query as any) ?? {};
      const result = await this.svc.listProjections(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: typeof sortBy === "string" ? (sortBy as any) : undefined,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        name: typeof name === "string" ? name : undefined,
      });
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List event snapshots
   */
  async listSnapshots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { page, limit, sortBy, sortOrder, aggregateType, aggregateId } =
        (req.query as any) ?? {};
      const result = await this.svc.listSnapshots(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: typeof sortBy === "string" ? (sortBy as any) : undefined,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        aggregateType:
          typeof aggregateType === "string" ? aggregateType : undefined,
        aggregateId: typeof aggregateId === "string" ? aggregateId : undefined,
      });
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantEventsController = new TenantEventsController();
