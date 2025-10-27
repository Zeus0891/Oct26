import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../core/config/prisma.config";
import { withTenantRLS } from "../../lib/prisma/withRLS";
import { AuthenticatedRequest } from "../../middlewares/types";
import { PERMISSIONS } from "../../rbac/permissions";
import { MiddlewareChains } from "../../shared/routes/middleware-chain.builder";

// Access Control Router: /api/access
const accessRouter = Router();

// Utility: extract tenant and roles from request
function getCtx(req: AuthenticatedRequest) {
  const tenantId = req.tenant?.id as string;
  const userId = req.user?.id as string | undefined;
  const roles = (req.user?.roles || []) as string[];
  return { tenantId, userId, roles };
}

// ----------------------------------------------------------------------------
// Roles endpoints
// ----------------------------------------------------------------------------
// GET /api/access/roles
accessRouter.get(
  "/roles",
  ...MiddlewareChains.protected(PERMISSIONS.ROLE_READ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const items = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.role.findMany({
            where: { tenantId, deletedAt: null },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          }),
        userId
      );
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/access/roles/:id
accessRouter.get(
  "/roles/:id",
  ...MiddlewareChains.protected(PERMISSIONS.ROLE_READ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { id } = req.params;
      const item = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.role.findFirst({ where: { tenantId, id, deletedAt: null } }),
        userId
      );
      if (!item) {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/access/roles
accessRouter.post(
  "/roles",
  ...MiddlewareChains.protected(PERMISSIONS.ROLE_CREATE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { code, name, description, roleType, isDefault, priority } =
        req.body || {};

      if (!code || !name) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "code and name are required",
        });
        return;
      }

      const created = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.role.create({
            data: {
              tenantId,
              code,
              name,
              description: description || null,
              roleType: roleType || "CUSTOM",
              isDefault: Boolean(isDefault) || false,
              priority: typeof priority === "number" ? priority : 0,
              updatedAt: new Date(),
            },
          }),
        userId
      );

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/access/roles/:id
accessRouter.put(
  "/roles/:id",
  ...MiddlewareChains.protected(PERMISSIONS.ROLE_UPDATE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { id } = req.params;
      const { name, description, roleType, isDefault, priority, isActive } =
        req.body || {};

      const updated = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.role.update({
            where: { id },
            data: {
              name,
              description,
              roleType,
              isDefault,
              priority,
              isActive,
              updatedAt: new Date(),
            },
          }),
        userId
      );

      res.json({ success: true, data: updated });
    } catch (err: any) {
      if (err?.code === "P2025") {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      next(err);
    }
  }
);

// DELETE /api/access/roles/:id (soft delete)
accessRouter.delete(
  "/roles/:id",
  ...MiddlewareChains.protected(PERMISSIONS.ROLE_SOFT_DELETE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { id } = req.params;

      const deleted = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.role.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
          }),
        userId
      );

      res.json({ success: true, data: deleted });
    } catch (err: any) {
      if (err?.code === "P2025") {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      next(err);
    }
  }
);

// ----------------------------------------------------------------------------
// Permissions endpoints (global)
// ----------------------------------------------------------------------------
// GET /api/access/permissions
accessRouter.get(
  "/permissions",
  ...MiddlewareChains.protected(PERMISSIONS.PERMISSION_READ),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.permission.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: [{ category: "asc" }, { code: "asc" }],
      });
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/access/permissions (admin-only; schema-driven perms recommended)
accessRouter.post(
  "/permissions",
  ...MiddlewareChains.admin(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, name, description, category, subcategory, scope } =
        req.body || {};
      if (!code || !name || !category) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "code, name, and category are required",
        });
        return;
      }
      const created = await prisma.permission.create({
        data: {
          code,
          name,
          description: description || null,
          category,
          subcategory: subcategory || null,
          scope: scope || "TENANT",
          isSystemPermission: false,
          updatedAt: new Date(),
        },
      });
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/access/permissions/:id (admin-only)
accessRouter.put(
  "/permissions/:id",
  ...MiddlewareChains.admin(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description, category, subcategory, isActive } =
        req.body || {};
      const updated = await prisma.permission.update({
        where: { id },
        data: { name, description, category, subcategory, isActive },
      });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      if (err?.code === "P2025") {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      next(err);
    }
  }
);

// DELETE /api/access/permissions/:id (soft delete; admin-only)
accessRouter.delete(
  "/permissions/:id",
  ...MiddlewareChains.admin(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await prisma.permission.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
      res.json({ success: true, data: deleted });
    } catch (err: any) {
      if (err?.code === "P2025") {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      next(err);
    }
  }
);

// ----------------------------------------------------------------------------
// Role-Permissions endpoints
// ----------------------------------------------------------------------------
// GET /api/access/role-permissions?roleId=...
accessRouter.get(
  "/role-permissions",
  ...MiddlewareChains.protected(PERMISSIONS.ROLEPERMISSION_READ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { roleId } = req.query as { roleId?: string };

      const items = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.rolePermission.findMany({
            where: {
              tenantId,
              ...(roleId ? { roleId } : {}),
              isActive: true,
            },
            include: {
              Permission: { select: { id: true, code: true, name: true } },
              Role: { select: { id: true, code: true, name: true } },
            },
            orderBy: [{ createdAt: "desc" }],
          }),
        userId
      );

      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/access/role-permissions/grant
accessRouter.post(
  "/role-permissions/grant",
  ...MiddlewareChains.protected(PERMISSIONS.ROLEPERMISSION_CREATE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { roleId, permissionCode, permissionId, resourceType, resourceId } =
        req.body || {};

      if (!roleId || (!permissionCode && !permissionId)) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "roleId and permissionCode or permissionId are required",
        });
        return;
      }

      // Resolve permission by code if provided
      const perm = permissionId
        ? await prisma.permission.findUnique({ where: { id: permissionId } })
        : await prisma.permission.findUnique({
            where: { code: permissionCode },
          });
      if (!perm) {
        res.status(404).json({ success: false, error: "PERMISSION_NOT_FOUND" });
        return;
      }

      // Create role-permission within tenant via RLS
      const created = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.rolePermission.create({
            data: {
              tenantId,
              roleId,
              permissionId: perm.id,
              isActive: true,
              isDenied: false,
              resourceType: resourceType || null,
              resourceId: resourceId || null,
              assignedAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        userId
      );

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/access/role-permissions/:id (revoke/soft-delete)
accessRouter.delete(
  "/role-permissions/:id",
  ...MiddlewareChains.protected(PERMISSIONS.ROLEPERMISSION_SOFT_DELETE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      const { tenantId, roles, userId } = getCtx(areq);
      const { id } = req.params;

      const revoked = await withTenantRLS(
        tenantId,
        roles,
        async (tx: any) =>
          await tx.rolePermission.update({
            where: { id },
            data: { isActive: false, revokedAt: new Date() },
          }),
        userId
      );
      res.json({ success: true, data: revoked });
    } catch (err: any) {
      if (err?.code === "P2025") {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      next(err);
    }
  }
);

export default accessRouter;
