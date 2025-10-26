import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantNumberSequenceService } from "@/features/tenant/services/numbering.service";
import {
  CreateNumberSequenceSchema,
  UpdateNumberSequenceSchema,
  ResetSequenceSchema,
} from "@/features/tenant/validators/numbering.validators";

export class TenantNumberSequenceController {
  private readonly svc: TenantNumberSequenceService;

  constructor(service?: TenantNumberSequenceService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantNumberSequenceService(prisma, audit, rbac);
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { page, limit, sortBy, sortOrder } = req.query as any;
      const result = await this.svc.list(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: typeof sortBy === "string" ? (sortBy as any) : undefined,
        sortOrder:
          typeof sortOrder === "string" ? (sortOrder as any) : undefined,
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

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const parsed = CreateNumberSequenceSchema.parse(req.body ?? {});
      const result = await this.svc.create(req.context, parsed as any);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const parsed = UpdateNumberSequenceSchema.parse(req.body ?? {});
      const result = await this.svc.update(req.context, id, parsed as any);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async next(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.getNext(req.context, id);
      if (!result.success || result.data == null) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.generateNumber(req.context, id);
      if (!result.success || result.data == null) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  async reset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const parsed = ResetSequenceSchema.parse(req.body ?? {});
      const result = await this.svc.reset(req.context, id, parsed.newValue);
      if (!result.success || result.data == null) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantNumberSequenceController =
  new TenantNumberSequenceController();
