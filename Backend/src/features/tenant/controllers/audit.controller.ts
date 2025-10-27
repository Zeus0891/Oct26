import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantAuditService } from "@/features/tenant/services/audit.service";

export class TenantAuditController {
  private readonly svc: TenantAuditService;

  constructor(service?: TenantAuditService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantAuditService(prisma, audit, rbac);
  }

  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const { page, limit, sortBy, sortOrder, action, from, to } =
        (req.query as any) ?? {};
      const allowedSort = [
        "createdAt",
        "updatedAt",
        "actorId",
        "action",
      ] as const;
      const sortBySafe =
        typeof sortBy === "string" &&
        (allowedSort as readonly string[]).includes(sortBy)
          ? (sortBy as (typeof allowedSort)[number])
          : undefined;
      const result = await this.svc.list(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBySafe,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        action: typeof action === "string" ? action : undefined,
        from: typeof from === "string" ? from : undefined,
        to: typeof to === "string" ? to : undefined,
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

  async export(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { sortBy, sortOrder, action, from, to } = (req.query as any) ?? {};
      const allowedSort = [
        "createdAt",
        "updatedAt",
        "actorId",
        "action",
      ] as const;
      const sortBySafe =
        typeof sortBy === "string" &&
        (allowedSort as readonly string[]).includes(sortBy)
          ? (sortBy as (typeof allowedSort)[number])
          : undefined;
      const result = await this.svc.export(req.context, {
        sortBy: sortBySafe,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        action: typeof action === "string" ? action : undefined,
        from: typeof from === "string" ? from : undefined,
        to: typeof to === "string" ? to : undefined,
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

export const tenantAuditController = new TenantAuditController();
