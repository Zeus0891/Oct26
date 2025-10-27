import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../core/config/prisma.config";
import { AuthenticatedRequest } from "../../middlewares/types";
import { MiddlewareChains } from "../../shared/routes/middleware-chain.builder";
import { AuditService } from "../../shared/services/audit/audit.service";
import { AuthService } from "../../shared/services/security/auth.service";
import { JwtUtils } from "../../shared/utils/security/jwt.util";
import { PasswordUtils } from "../../shared/utils/security/password.util";

// Initialize services and controller (uses core prisma.config wiring)
const auditService = new AuditService(prisma as any);
const authService = new AuthService(prisma as any, auditService);
// Note: AuthController exists but depends on domain models not yet aligned.
// We wire AuthService to prisma for future use, while providing functional
// handlers here to unblock Phase 1 endpoints.

const router = Router();

// POST /users/login — public
router.post(
  "/login",
  ...MiddlewareChains.public(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, tenantId } = req.body || {};
      if (!email || !password || !tenantId) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "email, password and tenantId are required",
        });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        res.status(401).json({
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        });
        return;
      }

      const valid = await PasswordUtils.verify(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        });
        return;
      }

      // Resolve tenant membership and RBAC claims
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: "TENANT_NOT_FOUND",
          message: "Tenant not found",
        });
        return;
      }

      const member = await prisma.member.findFirst({
        where: { tenantId, userId: user.id },
        select: { id: true },
      });
      if (!member) {
        res.status(403).json({
          success: false,
          error: "NO_TENANT_ACCESS",
          message: "User is not a member of the tenant",
        });
        return;
      }

      // Load roles for membership
      const memberRoles = await prisma.memberRole.findMany({
        where: { tenantId, memberId: member.id, deactivatedAt: null },
        select: { roleId: true },
      });
      const roleIds = Array.from(new Set(memberRoles.map((r) => r.roleId)));
      const roles = roleIds.length
        ? await prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, code: true } })
        : [] as { id: string; code: string }[];
      const roleCodes = roles.map((r) => r.code);

      // Load permissions from role grants
      const rolePerms = roleIds.length
        ? await prisma.rolePermission.findMany({
            where: {
              tenantId,
              roleId: { in: roleIds },
              isActive: true,
              isDenied: false,
            },
            select: { permissionId: true },
          })
        : [] as { permissionId: string }[];
      const permIds = Array.from(new Set(rolePerms.map((p) => p.permissionId)));
      const perms = permIds.length
        ? await prisma.permission.findMany({ where: { id: { in: permIds } }, select: { code: true } })
        : [] as { code: string }[];
      const permissionCodes = Array.from(new Set(perms.map((p) => p.code)));

      const secret = process.env.JWT_SECRET || "change-me";
      const tokens = JwtUtils.createTokenPair(user.id, secret, {
        tenantId,
        roles: roleCodes,
        permissions: permissionCodes,
        accessExpiresIn: "1h",
        refreshExpiresIn: "7d",
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            tenantId,
            roles: roleCodes,
            permissions: permissionCodes,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: "Bearer",
            expiresIn: 3600,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/register — public minimal registration
router.post(
  "/register",
  ...MiddlewareChains.public(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "email and password are required",
        });
      }

      // Basic uniqueness check
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "EMAIL_TAKEN",
          message: "Email is already registered",
        });
      }

      const hashed = await PasswordUtils.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          passwordHash: hashed.hash,
          emailVerified: false,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
        },
      });

      return res.status(201).json({ success: true, data: { user } });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /users/refresh — public (uses body refresh token)
router.post(
  "/refresh",
  ...MiddlewareChains.public(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body || {};
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: "INVALID_TOKEN",
          message: "refreshToken is required",
        });
        return;
      }
      const secret = process.env.JWT_SECRET || "change-me";
      const result = JwtUtils.refreshToken(refreshToken, secret, {
        accessExpiresIn: "1h",
        refreshExpiresIn: "7d",
        rotateRefreshToken: true,
        preserveClaims: ["tenantId", "roles", "permissions", "sessionId"],
      });

      if (!result.success || !result.tokens) {
        res.status(401).json({
          success: false,
          error: result.code || "REFRESH_FAILED",
          message: result.error || "Failed to refresh token",
        });
        return;
      }

      res.json({ success: true, data: result.tokens });
    } catch (err) {
      next(err);
    }
  }
);

// GET /users/profile — authenticated
router.get(
  "/profile",
  ...MiddlewareChains.authenticated(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const areq = req as AuthenticatedRequest;
      if (!areq.user) {
        res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
          message: "User not authenticated",
        });
        return;
      }

      // Optionally expand from DB if needed later; for now return token context
      res.json({
        success: true,
        data: {
          user: {
            id: areq.user.id,
            email: areq.user.email,
            tenantId: areq.user.tenantId,
            roles: areq.user.roles,
            permissions: areq.user.permissions,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
