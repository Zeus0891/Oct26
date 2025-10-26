import { Response, NextFunction } from "express";
import { PlatformTenantChildStatus, TenantSettings } from "@prisma/client";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantSettingsService } from "@/features/tenant/services/settings.service";
import {
  UpdateTenantSettingsSchema,
  ActivateTenantSettingsSchema,
  DeactivateTenantSettingsSchema,
} from "@/features/tenant/validators/settings.validators";
import { mapTenantSettingsToDTO } from "@/features/tenant/utils/tenant.mappers";
import { metrics } from "@/core/logging/metrics.service";

export class TenantSettingsController {
  private readonly svc: TenantSettingsService;

  constructor(service?: TenantSettingsService) {
    const audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, audit);
    this.svc = service ?? new TenantSettingsService(prisma, audit, rbac);
  }

  async get(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const start = Date.now();
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        metrics.recordRequest(
          (req.method as string) || "GET",
          (req as any).originalUrl || "/api/tenant/settings",
          401,
          Date.now() - start,
          req.context?.tenant?.tenantId
        );
        return;
      }
      const result = await this.svc.get(req.context);
      if (!result.success) {
        res.status(400).json(result);
        metrics.recordRequest(
          (req.method as string) || "GET",
          (req as any).originalUrl || "/api/tenant/settings",
          400,
          Date.now() - start,
          req.context?.tenant?.tenantId
        );
        return;
      }
      if (!result.data) {
        res.status(404).json({ success: false, error: "Not Found" });
        metrics.recordRequest(
          (req.method as string) || "GET",
          (req as any).originalUrl || "/api/tenant/settings",
          404,
          Date.now() - start,
          req.context?.tenant?.tenantId
        );
        return;
      }
      const payload = {
        success: true,
        data: mapTenantSettingsToDTO(result.data),
      };
      res.json(payload);
      metrics.recordRequest(
        (req.method as string) || "GET",
        (req as any).originalUrl || "/api/tenant/settings",
        200,
        Date.now() - start,
        req.context?.tenant?.tenantId
      );
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const parsed = UpdateTenantSettingsSchema.parse(req.body);
      const result = await this.svc.upsert(
        req.context,
        parsed as Partial<TenantSettings>
      );
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapTenantSettingsToDTO(result.data) });
    } catch (err) {
      next(err);
    }
  }

  async activate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      // Validate payload (captures optional reason for audit trail)
      ActivateTenantSettingsSchema.parse(req.body ?? {});
      const result = await this.svc.setStatus(
        req.context,
        PlatformTenantChildStatus.ACTIVE
      );
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapTenantSettingsToDTO(result.data) });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      // Validate payload (captures optional reason for audit trail)
      DeactivateTenantSettingsSchema.parse(req.body ?? {});
      const result = await this.svc.setStatus(
        req.context,
        PlatformTenantChildStatus.INACTIVE
      );
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapTenantSettingsToDTO(result.data) });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantSettingsController = new TenantSettingsController();
