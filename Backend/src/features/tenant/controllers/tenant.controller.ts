import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";
import { prisma } from "@/core/config/prisma.config";
import {
  AuditService,
  AuditEventType,
  AuditSeverity,
} from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { TenantService } from "@/features/tenant/services/tenant.service";
import { metrics } from "@/core/logging/metrics.service";

export class TenantController {
  private readonly svc: TenantService;
  private readonly audit: AuditService;

  constructor(service?: TenantService) {
    this.audit = new AuditService(prisma);
    const rbac = new RBACService(prisma, this.audit);
    this.svc = service ?? new TenantService(prisma, this.audit, rbac);
  }

  /**
   * Get current tenant (from request context)
   */
  async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const start = Date.now();
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        // record endpoint metrics
        metrics.recordRequest(
          (req.method as string) || "GET",
          (req as any).originalUrl || "/api/tenant/me",
          401,
          Date.now() - start,
          req.context?.tenant?.tenantId
        );
        return;
      }
      const tenantId = req.context.tenant.tenantId;
      const result = await this.svc.findById(req.context, tenantId);
      if (!result.success || !result.data) {
        res.status(404).json({ success: false, error: "Tenant not found" });
        // record endpoint metrics
        metrics.recordRequest(
          (req.method as string) || "GET",
          (req as any).originalUrl || "/api/tenant/me",
          404,
          Date.now() - start,
          req.context?.tenant?.tenantId
        );
        return;
      }
      // Map to DTO for consistent output
      const { mapTenantToDTO } = await import(
        "@/features/tenant/utils/tenant.mappers"
      );
      // Emit audit event for tenant profile view
      try {
        await this.audit.logEvent({
          type: "TENANT_VIEWED" as unknown as AuditEventType,
          severity: AuditSeverity.LOW,
          description: "Current tenant profile viewed",
          userId: req.context.actor.userId,
          sessionId: req.context.actor.sessionId,
          tenantId: req.context.tenant.tenantId,
          resource: { type: "Tenant", id: tenantId },
          request: {
            method: req.context.request?.method || (req.method as string),
            url: req.context.request?.url || (req as any).originalUrl,
          },
          metadata: { correlationId: req.context.correlationId },
        });
      } catch {
        // Swallow audit errors: audit must not break business path
      }

      const payload = { success: true, data: mapTenantToDTO(result.data) };
      res.json(payload);
      // record endpoint metrics
      metrics.recordRequest(
        (req.method as string) || "GET",
        (req as any).originalUrl || "/api/tenant/me",
        200,
        Date.now() - start,
        req.context?.tenant?.tenantId
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get tenant profile by ID (admin/global read)
   */
  async getById(
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
      const result = await this.svc.findById(req.context, id);
      if (!result.success || !result.data) {
        res.status(404).json({ success: false, error: "Tenant not found" });
        return;
      }
      res.json({ success: true, data: result.data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update tenant profile (limited fields, admin-only)
   */
  async update(
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
      const result = await this.svc.update(req.context, id, req.body);
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
   * Deactivate tenant (admin-only)
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
      const result = await this.svc.deactivate(req.context, id);
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

export const tenantController = new TenantController();
