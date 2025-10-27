import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantUsageService } from "@/features/tenant/services/usage.service";
import { UsageQuerySchema } from "@/features/tenant/validators/usage.validators";
import { mapUsageRecordToDTO } from "@/features/tenant/utils/tenant.mappers";

export class TenantUsageController {
  private readonly svc: TenantUsageService;

  constructor(service?: TenantUsageService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantUsageService(prisma, audit, rbac);
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
      const parsed = UsageQuerySchema.parse(req.query ?? {});
      const { sortBy, sortOrder } = req.query as any;
      const result = await this.svc.list(req.context, {
        ...parsed,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        sortOrder:
          typeof sortOrder === "string" ? (sortOrder as any) : undefined,
      });
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({
        success: true,
        data: {
          items: result.data.items.map((u) => mapUsageRecordToDTO(u)),
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
        },
      });
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
      const parsed = UsageQuerySchema.parse(req.query ?? {});
      const { sortBy, sortOrder } = req.query as any;
      const result = await this.svc.export(req.context, {
        ...parsed,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        sortOrder:
          typeof sortOrder === "string" ? (sortOrder as any) : undefined,
      });
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({
        success: true,
        data: result.data.map((u) => mapUsageRecordToDTO(u)),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantUsageController = new TenantUsageController();
