import { prisma } from "@/core/config/prisma.config";
import type { AuthenticatedRequest } from "@/middlewares/types";
import { NextFunction, Response } from "express";

export class TenantMembersController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const rows = await prisma.member.findMany({
        where: { tenantId: req.user.tenantId },
        select: {
          id: true,
          userId: true,
          isActive: true,
          displayName: true,
          workEmail: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { id } = req.params as { id: string };
      const row = await prisma.member.findFirst({
        where: { id, tenantId: req.user.tenantId },
        select: {
          id: true,
          userId: true,
          isActive: true,
          displayName: true,
          workEmail: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!row) {
        res.status(404).json({ success: false, error: "NOT_FOUND" });
        return;
      }
      res.json({ success: true, data: row });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { userId, email, displayName } = req.body || {};
      if (!userId && !email) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "userId or email is required" });
        return;
      }
      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findUnique({ where: { email: String(email) } });
      if (!user) {
        res.status(404).json({ success: false, error: "USER_NOT_FOUND" });
        return;
      }
      const existing = await prisma.member.findFirst({ where: { tenantId, userId: user.id } });
      if (existing) {
        res.status(200).json({ success: true, data: { id: existing.id, tenantId, userId: user.id } });
        return;
      }
      const member = await prisma.member.create({
        data: {
          tenantId,
          userId: user.id,
          isActive: true,
          displayName: displayName || user.displayName || user.email,
          workEmail: user.email,
          updatedAt: new Date(),
        },
        select: { id: true, tenantId: true, userId: true },
      });
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }

  async assignRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { id } = req.params as { id: string };
      const { roleId, roleCode, isPrimary = false, isDefault = false } = req.body || {};
      if (!roleId && !roleCode) {
        res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "roleId or roleCode is required" });
        return;
      }

      const member = await prisma.member.findFirst({ where: { id, tenantId }, select: { id: true } });
      if (!member) {
        res.status(404).json({ success: false, error: "MEMBER_NOT_FOUND" });
        return;
      }

      const role = roleId
        ? await prisma.role.findFirst({ where: { id: roleId, tenantId }, select: { id: true } })
        : await prisma.role.findFirst({ where: { tenantId, code: String(roleCode) }, select: { id: true } });

      const ensuredRole = role || (await prisma.role.create({
        data: { tenantId, code: String(roleCode), name: String(roleCode), isActive: true, updatedAt: new Date() },
        select: { id: true },
      }));

      await prisma.memberRole.upsert({
        where: {
          tenantId_memberId_roleId_effectiveFrom: {
            tenantId,
            memberId: member.id,
            roleId: ensuredRole.id,
            effectiveFrom: new Date(0),
          },
        },
        create: {
          tenantId,
          memberId: member.id,
          roleId: ensuredRole.id,
          isPrimary: Boolean(isPrimary),
          isDefault: Boolean(isDefault),
          effectiveFrom: new Date(0),
          updatedAt: new Date(),
        },
        update: { deactivatedAt: null, isPrimary: Boolean(isPrimary), isDefault: Boolean(isDefault), updatedAt: new Date() },
      });

      res.json({ success: true, data: { memberId: member.id, roleId: ensuredRole.id } });
    } catch (err) {
      next(err);
    }
  }

  async removeRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { id, roleId } = req.params as { id: string; roleId: string };
      const member = await prisma.member.findFirst({ where: { id, tenantId }, select: { id: true } });
      if (!member) {
        res.status(404).json({ success: false, error: "MEMBER_NOT_FOUND" });
        return;
      }
      await prisma.memberRole.updateMany({
        where: { tenantId, memberId: member.id, roleId, deactivatedAt: null },
        data: { deactivatedAt: new Date(), updatedAt: new Date() },
      });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async activate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { id } = req.params as { id: string };
      await prisma.member.updateMany({ where: { id, tenantId }, data: { isActive: true, updatedAt: new Date() } });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ success: false, error: "UNAUTHORIZED" });
        return;
      }
      const { id } = req.params as { id: string };
      await prisma.member.updateMany({ where: { id, tenantId }, data: { isActive: false, updatedAt: new Date() } });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const tenantMembersController = new TenantMembersController();
