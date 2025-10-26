import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantMetricsService } from "@/features/tenant/services/metrics.service";
import { MetricsQuerySchema } from "@/features/tenant/validators/metrics.validators";
import { mapMetricsToDTO } from "@/features/tenant/utils/tenant.mappers";

export class TenantMetricsController {
  private readonly svc: TenantMetricsService;

  constructor(service?: TenantMetricsService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantMetricsService(prisma, audit, rbac);
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
      const parsed = MetricsQuerySchema.parse(req.query ?? {});
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
          items: result.data.items.map((m) => mapMetricsToDTO(m)),
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
      const parsed = MetricsQuerySchema.parse(req.query ?? {});
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
        data: result.data.map((m) => mapMetricsToDTO(m)),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantMetricsController = new TenantMetricsController();
