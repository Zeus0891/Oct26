import { prisma } from "@/core/config/prisma.config";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

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
      if (defaultRoleCode) {
        // Ensure Role
        const role =
          (await prisma.role.findFirst({ where: { tenantId: tenant.id, code: defaultRoleCode } })) ||
          (await prisma.role.create({
            data: {
              tenantId: tenant.id,
              code: defaultRoleCode,
              name: defaultRoleName || defaultRoleCode,
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

export default router;
