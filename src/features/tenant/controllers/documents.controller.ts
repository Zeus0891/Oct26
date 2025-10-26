import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { DocumentGroupsService } from "@/features/tenant/services/documents.service";

export class DocumentGroupsController {
  private readonly svc: DocumentGroupsService;

  constructor(service?: DocumentGroupsService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new DocumentGroupsService(prisma, audit, rbac);
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
      const { page, limit, sortBy, sortOrder, search } =
        (req.query as any) ?? {};
      const result = await this.svc.list(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: typeof sortBy === "string" ? (sortBy as any) : undefined,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        search: typeof search === "string" ? search : undefined,
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

  async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.findById(req.context, id);
      if (!result.success || !result.data) {
        res.status(404).json({ success: false, error: "Not Found" });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  async remove(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.delete(req.context, id);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async restore(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.restore(req.context, id);
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

export const documentGroupsController = new DocumentGroupsController();
