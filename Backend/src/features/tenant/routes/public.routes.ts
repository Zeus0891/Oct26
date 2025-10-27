import { prisma } from "@/core/config/prisma.config";
import { TenantLifecycleService } from "@/features/tenant/services/lifecycle.service";
import { PERMISSIONS } from "@/rbac/permissions";
import { ROLES } from "@/rbac/roles";
import { AuditService } from "@/shared/services/audit/audit.service";
import { ContextService } from "@/shared/services/base/context.service";
import { RBACService } from "@/shared/services/security/rbac.service";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

// Helper: Canonicalize admin/owner to ADMIN role code
function normalizeAdminRole(code?: string | null): string | null {
  if (!code) return null;
  const c = String(code).toUpperCase();
  if (["ADMIN", "OWNER", "TENANT_ADMIN", "TENANT-ADMIN"].includes(c)) {
    return ROLES.ADMIN;
  }
  return code;
}

// Helper: Ensure a set of permission codes exist and are granted to a role within a tenant
async function ensureRolePermissions(
  tenantId: string,
  roleId: string,
  permissionCodes: string[]
) {
  const now = new Date();
  for (const code of permissionCodes) {
    // Upsert Permission by code (global/system-scoped catalog)
    const existingPerm = await prisma.permission.findUnique({ where: { code }, select: { id: true } });
    const permission =
      existingPerm ||
      (await prisma.permission.create({
        data: {
          code,
          name: code,
          category: code.includes(".") ? code.split(".")[0] : "General",
          subcategory: code.includes(".") ? code.split(".")[1] : undefined,
          updatedAt: now,
          isActive: true,
        },
        select: { id: true },
      }));

    // Ensure RolePermission for this tenant/role/permission
    const existingRolePerm = await prisma.rolePermission.findFirst({
      where: { tenantId, roleId, permissionId: permission.id, memberId: null },
      select: { id: true },
    });

    if (existingRolePerm) {
      await prisma.rolePermission.update({
        where: { id: existingRolePerm.id },
        data: { updatedAt: now, isActive: true, isDenied: false },
      });
    } else {
      await prisma.rolePermission.create({
        data: {
          tenantId,
          roleId,
          permissionId: permission.id,
          isActive: true,
          isDenied: false,
          updatedAt: now,
        },
      });
    }
  }
}

// Baseline admin permissions sufficient for tenant module operations
const BASELINE_ADMIN_PERMISSIONS: string[] = [
  PERMISSIONS.TENANT_READ,
  PERMISSIONS.TENANT_UPDATE,
  PERMISSIONS.TENANT_DEACTIVATE,
  PERMISSIONS.TENANTSETTINGS_READ,
  PERMISSIONS.TENANTSETTINGS_UPDATE,
  PERMISSIONS.TENANTSETTINGS_ACTIVATE,
  PERMISSIONS.TENANTSETTINGS_DEACTIVATE,
  PERMISSIONS.TENANTMETRICS_READ,
  PERMISSIONS.TENANTMETRICS_EXPORT,
  PERMISSIONS.TENANTFEATUREFLAG_READ,
  PERMISSIONS.TENANTFEATUREFLAG_CREATE,
  PERMISSIONS.TENANTFEATUREFLAG_UPDATE,
  PERMISSIONS.TENANTFEATUREFLAG_ACTIVATE,
  PERMISSIONS.TENANTFEATUREFLAG_DEACTIVATE,
  PERMISSIONS.TENANTUSAGERECORD_READ,
  PERMISSIONS.TENANTUSAGERECORD_EXPORT,
  PERMISSIONS.NUMBERSEQUENCE_READ,
  PERMISSIONS.NUMBERSEQUENCE_CREATE,
  PERMISSIONS.NUMBERSEQUENCE_UPDATE,
  PERMISSIONS.TERMSTEMPLATE_READ,
  PERMISSIONS.TERMSTEMPLATE_CREATE,
  PERMISSIONS.TERMSTEMPLATE_UPDATE,
  PERMISSIONS.TERMSTEMPLATE_SOFT_DELETE,
  PERMISSIONS.TERMSTEMPLATE_RESTORE,
  PERMISSIONS.CONTRACTTEMPLATE_READ,
  PERMISSIONS.CONTRACTTEMPLATE_CREATE,
  PERMISSIONS.CONTRACTTEMPLATE_UPDATE,
  PERMISSIONS.CONTRACTTEMPLATE_SOFT_DELETE,
  PERMISSIONS.CONTRACTTEMPLATE_RESTORE,
  PERMISSIONS.DOCUMENTGROUP_READ,
  PERMISSIONS.DOCUMENTGROUP_SOFT_DELETE,
  PERMISSIONS.DOCUMENTGROUP_RESTORE,
  PERMISSIONS.TENANTAUDITLOG_READ,
  PERMISSIONS.TENANTAUDITLOG_EXPORT,
];

// POST /tenants/register — create a tenant (public bootstrap)
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, displayName, description } = req.body || {};
      if (!name && !slug) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "name or slug is required",
        });
        return;
      }
      const s = (slug || String(name))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existing = await prisma.tenant.findUnique({ where: { slug: s } });
      if (existing) {
        res.status(409).json({
          success: false,
          error: "TENANT_EXISTS",
          message: "Tenant slug already exists",
          data: { tenant: { id: existing.id, name: existing.name, slug: existing.slug } },
        });
        return;
      }

      const tenant = await prisma.tenant.create({
        data: {
          name: name || s,
          slug: s,
          displayName: displayName || null,
          description: description || null,
          updatedAt: new Date(),
        },
        select: { id: true, name: true, slug: true, displayName: true, createdAt: true },
      });

      res.status(201).json({ success: true, data: { tenant } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /tenants/bootstrap — ensure tenant and link member (optionally assign role)
router.post(
  "/bootstrap",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantName, tenantSlug, userEmail, userId, defaultRoleCode, defaultRoleName } =
        req.body || {};

      if (!tenantName && !tenantSlug) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "tenantName or tenantSlug is required" });
        return;
      }
      if (!userEmail && !userId) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "userEmail or userId is required" });
        return;
      }

      // Resolve tenant
      const slug = (tenantSlug || String(tenantName))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const tenant =
        (await prisma.tenant.findUnique({ where: { slug } })) ||
        (await prisma.tenant.create({
          data: {
            name: tenantName || slug,
            slug,
            displayName: tenantName || null,
            updatedAt: new Date(),
          },
          select: { id: true, name: true, slug: true },
        }));

      // Resolve user
      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findUnique({ where: { email: String(userEmail) } });

      if (!user) {
        res.status(404).json({ success: false, error: "USER_NOT_FOUND", message: "User not found" });
        return;
      }

      // Ensure Member
      const member =
        (await prisma.member.findFirst({ where: { tenantId: tenant.id, userId: user.id } })) ||
        (await prisma.member.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            isActive: true,
            displayName: user.displayName || user.email,
            workEmail: user.email,
            updatedAt: new Date(),
          },
          select: { id: true, tenantId: true, userId: true },
        }));

      let roleAssigned: string | null = null;
      const normalizedRole = normalizeAdminRole(defaultRoleCode);
      if (normalizedRole) {
        // Ensure Role
        const role =
          (await prisma.role.findFirst({ where: { tenantId: tenant.id, code: normalizedRole } })) ||
          (await prisma.role.create({
            data: {
              tenantId: tenant.id,
              code: normalizedRole,
              name: defaultRoleName || normalizedRole,
              isActive: true,
              updatedAt: new Date(),
            },
            select: { id: true, code: true },
          }));

        // Ensure MemberRole active
        await prisma.memberRole.upsert({
          where: {
            tenantId_memberId_roleId_effectiveFrom: {
              tenantId: tenant.id,
              memberId: member.id,
              roleId: role.id,
              effectiveFrom: new Date(0),
            },
          },
          create: {
            tenantId: tenant.id,
            memberId: member.id,
            roleId: role.id,
            isPrimary: true,
            isDefault: true,
            effectiveFrom: new Date(0),
            updatedAt: new Date(),
          },
          update: { deactivatedAt: null },
        });
        roleAssigned = role.code;

        // Seed baseline admin permissions if ADMIN role
        if (role.code === ROLES.ADMIN) {
          await ensureRolePermissions(tenant.id, role.id, BASELINE_ADMIN_PERMISSIONS);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          member: { id: member.id, userId: user.id, tenantId: tenant.id },
          roleAssigned,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /tenants/bootstrap-full — provision tenant (if new) + ensure membership + admin baseline
router.post(
  "/bootstrap-full",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        tenantName,
        tenantSlug,
        userEmail,
        userId,
        defaultRoleCode = ROLES.ADMIN,
        defaultRoleName = "Admin",
      } = req.body || {};

      if (!tenantName && !tenantSlug) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "tenantName or tenantSlug is required" });
        return;
      }
      if (!userEmail && !userId) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "userEmail or userId is required" });
        return;
      }

      // Resolve tenant
      const slug = (tenantSlug || String(tenantName))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingTenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } });
      let tenant: { id: string; name: string; slug: string } | null = existingTenant;
      let createdTenant = false;
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: tenantName || slug,
            slug,
            displayName: tenantName || null,
            updatedAt: new Date(),
          },
          select: { id: true, name: true, slug: true },
        });
        createdTenant = true;
      }

      // Provision defaults if newly created
      if (createdTenant) {
        const audit = new AuditService(prisma as any);
        const rbac = new RBACService(prisma as any, audit);
        const lifecycle = new TenantLifecycleService(prisma as any, audit, rbac);
        const contextService = new ContextService();
        const sysCtx = contextService.createSystemContext(tenant!.id);
        await lifecycle.provisionTenant(sysCtx, {
          name: tenantName || slug,
          slug,
          displayName: tenantName || undefined,
          description: undefined,
        });
      }

      // Resolve user
      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findUnique({ where: { email: String(userEmail) } });

      if (!user) {
        res.status(404).json({ success: false, error: "USER_NOT_FOUND", message: "User not found" });
        return;
      }

      // Ensure Member
      const member =
        (await prisma.member.findFirst({ where: { tenantId: tenant!.id, userId: user.id } })) ||
        (await prisma.member.create({
          data: {
            tenantId: tenant!.id,
            userId: user.id,
            isActive: true,
            displayName: user.displayName || user.email,
            workEmail: user.email,
            updatedAt: new Date(),
          },
          select: { id: true, tenantId: true, userId: true },
        }));

      // Ensure Admin Role and baseline permissions
      const normalizedRole = normalizeAdminRole(defaultRoleCode) || ROLES.ADMIN;
      const role =
        (await prisma.role.findFirst({ where: { tenantId: tenant!.id, code: normalizedRole } })) ||
        (await prisma.role.create({
          data: {
            tenantId: tenant!.id,
            code: normalizedRole,
            name: defaultRoleName || normalizedRole,
            isActive: true,
            updatedAt: new Date(),
          },
          select: { id: true, code: true },
        }));

      await prisma.memberRole.upsert({
        where: {
          tenantId_memberId_roleId_effectiveFrom: {
            tenantId: tenant!.id,
            memberId: member.id,
            roleId: role.id,
            effectiveFrom: new Date(0),
          },
        },
        create: {
          tenantId: tenant!.id,
          memberId: member.id,
          roleId: role.id,
          isPrimary: true,
          isDefault: true,
          effectiveFrom: new Date(0),
          updatedAt: new Date(),
        },
        update: { deactivatedAt: null },
      });

      if (role.code === ROLES.ADMIN) {
        await ensureRolePermissions(tenant!.id, role.id, BASELINE_ADMIN_PERMISSIONS);
      }

      res.status(200).json({
        success: true,
        data: {
          tenant: { id: tenant!.id, name: tenant!.name, slug: tenant!.slug },
          member: { id: member.id, userId: user.id, tenantId: tenant!.id },
          roleAssigned: role.code,
          provisioned: createdTenant,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
