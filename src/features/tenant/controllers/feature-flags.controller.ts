import { Response, NextFunction } from "express";
import { TenantFeatureFlag } from "@prisma/client";
import { CrudController } from "@/shared/controllers/base/crud.controller";
import { BaseValidator } from "@/shared/validators/base.validator";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { prisma } from "@/core/config/prisma.config";
import { TenantFeatureFlagsService } from "@/features/tenant/services/feature-flags.service";
import {
  CreateFeatureFlagSchema,
  UpdateFeatureFlagSchema,
} from "@/features/tenant/validators/feature-flags.validators";
import { mapFeatureFlagToDTO } from "@/features/tenant/utils/tenant.mappers";
import type { AuthenticatedRequest } from "@/shared/controllers/base/base.controller";

// Minimal validator to satisfy CrudController constructor (we override handlers anyway)
class FeatureFlagValidator extends BaseValidator<any> {
  // Use update schema as permissive base; create/update handlers will validate explicitly
  public readonly schema = UpdateFeatureFlagSchema as any;
}

export class TenantFeatureFlagsController extends CrudController<TenantFeatureFlag> {
  private readonly svc: TenantFeatureFlagsService;

  constructor(
    service?: TenantFeatureFlagsService,
    validator?: BaseValidator<TenantFeatureFlag>,
    auditService?: AuditService
  ) {
    const _audit = auditService ?? new AuditService(prisma);
    const _rbac = new RBACService(prisma, _audit);
    const _service =
      service ?? new TenantFeatureFlagsService(prisma, _audit, _rbac);
    super(_service, validator ?? new FeatureFlagValidator(), _audit, {
      softDelete: true,
      auditLogging: true,
      optimisticLocking: true,
      defaultPageSize: 20,
      maxPageSize: 100,
    });
    this.svc = _service;
  }

  protected getEntityName(): string {
    return "TenantFeatureFlag";
  }

  // Override create to use strict Create schema
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.context?.tenant || !req.context?.actor) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const parsed = CreateFeatureFlagSchema.parse(req.body);
      const result = await this.svc.create(req.context, parsed as any);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }

      res
        .status(201)
        .json({ success: true, data: mapFeatureFlagToDTO(result.data) });
    } catch (err) {
      next(err);
    }
  }

  // Override update to use Update schema
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
      const { id } = req.params;
      const parsed = UpdateFeatureFlagSchema.parse(req.body);
      const result = await this.svc.update(req.context, id, parsed as any);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapFeatureFlagToDTO(result.data) });
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
      res.json({ success: true, data: mapFeatureFlagToDTO(result.data) });
    } catch (err) {
      next(err);
    }
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
      const { page, limit, sortBy, sortOrder, enabled, search } =
        req.query as any;
      const result = await this.svc.list(req.context, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy,
        sortOrder,
        enabled: typeof enabled === "string" ? enabled === "true" : undefined,
        search: typeof search === "string" ? search : undefined,
      });

      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({
        success: true,
        data: {
          items: result.data.items.map((f) => mapFeatureFlagToDTO(f)),
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
        },
      });
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
      const { id } = req.params;
      const result = await this.svc.setEnabled(req.context, id, true);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapFeatureFlagToDTO(result.data) });
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
      const { id } = req.params;
      const result = await this.svc.setEnabled(req.context, id, false);
      if (!result.success || !result.data) {
        res.status(400).json(result);
        return;
      }
      res.json({ success: true, data: mapFeatureFlagToDTO(result.data) });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantFeatureFlagsController = new TenantFeatureFlagsController();
