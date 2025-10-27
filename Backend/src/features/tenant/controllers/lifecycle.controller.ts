import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantLifecycleService } from "@/features/tenant/services/lifecycle.service";

export class TenantLifecycleController {
  private readonly svc: TenantLifecycleService;

  constructor(service?: TenantLifecycleService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantLifecycleService(prisma, audit, rbac);
  }

  /**
   * Provision a new tenant with defaults (admin-only)
   */
  async provision(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const result = await this.svc.provisionTenant(req.context, req.body);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deactivate a tenant safely (admin-only)
   */
  async deactivate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const result = await this.svc.deactivateTenant(req.context, id);
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

export const tenantLifecycleController = new TenantLifecycleController();
