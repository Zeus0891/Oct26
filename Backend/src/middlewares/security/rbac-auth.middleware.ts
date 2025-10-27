import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { PERMISSIONS } from "../../rbac/permissions";
import { ROLES } from "../../rbac/roles";

/**
 * RBAC Authorization Middleware
 *
 * Integrates with existing RBAC system to enforce permission-based access control.
 * Validates user roles and permissions against required access levels.
 *
 * @param requiredPermission - Permission code required for access
 * @param options - Additional authorization options
 */
export const rbacAuthMiddleware = (
  requiredPermission: string,
  options: {
    requireRole?: string;
    allowSuperAdmin?: boolean;
    bypassForTenantAdmin?: boolean;
  } = {}
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({
          message: "Authentication required",
          code: "AUTH_REQUIRED",
          correlationId: req.correlationId,
        });
        return;
      }

      const { user } = req;
      const {
        requireRole,
        allowSuperAdmin = true,
        bypassForTenantAdmin = true,
      } = options;

      // Super admin bypass (if enabled)
      if (allowSuperAdmin && user.roles.includes("SYSTEM_ADMIN")) {
        console.log(`[RBAC_AUTH] Super admin ${user.email} access granted`);
        next();
        return;
      }

      // Tenant admin bypass (if enabled)
      if (bypassForTenantAdmin && user.roles.includes(ROLES.ADMIN)) {
        console.log(`[RBAC_AUTH] Tenant admin ${user.email} access granted`);
        next();
        return;
      }

      // Check specific role requirement
      if (requireRole && !user.roles.includes(requireRole)) {
        res.status(403).json({
          message: `Role '${requireRole}' required`,
          code: "INSUFFICIENT_ROLE",
          correlationId: req.correlationId,
        });
        return;
      }

      // Check permission requirement
      if (
        requiredPermission &&
        !user.permissions.includes(requiredPermission)
      ) {
        res.status(403).json({
          message: `Permission '${requiredPermission}' required`,
          code: "INSUFFICIENT_PERMISSION",
          correlationId: req.correlationId,
          details: {
            required: requiredPermission,
            userPermissions: user.permissions,
          },
        });
        return;
      }

      // Set RBAC context helper
      req.rbac = {
        currentTenant: user.tenantId,
        currentUser: user.id,
        roles: user.roles,
        hasPermission: (permission: string) =>
          user.permissions.includes(permission),
      };

      console.log(
        `[RBAC_AUTH] User ${user.email} authorized for ${requiredPermission}`
      );
      next();
    } catch (error) {
      console.error("[RBAC_AUTH] Authorization error:", error);
      res.status(500).json({
        message: "Authorization service error",
        code: "RBAC_SERVICE_ERROR",
        correlationId: req.correlationId,
      });
    }
  };
};

/**
 * Helper function to require specific permission
 */
export const requirePermission = (permission: string) =>
  rbacAuthMiddleware(permission);

/**
 * Helper function to require specific role
 */
export const requireRole = (role: string) =>
  rbacAuthMiddleware("", { requireRole: role });

/**
 * Helper functions for common permission checks
 */
export const requireAdmin = () => requireRole(ROLES.ADMIN);
export const requireProjectManager = () => requireRole(ROLES.PROJECT_MANAGER);
export const requireUser = () => rbacAuthMiddleware(""); // Just authenticated

/**
 * Permission-based middleware shortcuts
 */
export const canReadUsers = () => requirePermission(PERMISSIONS.USER_READ);
export const canCreateUsers = () => requirePermission(PERMISSIONS.USER_CREATE);
export const canUpdateUsers = () => requirePermission(PERMISSIONS.USER_UPDATE);
export const canDeleteUsers = () =>
  requirePermission(PERMISSIONS.USER_SOFT_DELETE);

export const canReadProjects = () =>
  requirePermission(PERMISSIONS.PROJECT_READ);
export const canCreateProjects = () =>
  requirePermission(PERMISSIONS.PROJECT_CREATE);
export const canUpdateProjects = () =>
  requirePermission(PERMISSIONS.PROJECT_UPDATE);
export const canDeleteProjects = () =>
  requirePermission(PERMISSIONS.PROJECT_SOFT_DELETE);
