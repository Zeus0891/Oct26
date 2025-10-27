// ============================================================================
// RBAC Middleware v7 - Auto-generated
// Generated from RBAC.schema.v7.yml
// Multi-tenant aware permission checking
// Date: 2025-10-27
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, Role } from '../roles';
import { Permission } from '../permissions';

// ============================================================================
// TypeScript Interface Extensions
// ============================================================================
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        tenantId?: string;
        role?: Role;
        permissions?: string[];
        [key: string]: any;
      };
      tenant?: {
        id?: string;
        name?: string;
        [key: string]: any;
      };
    }
  }
}

// ============================================================================
// Permission Checking Functions
// ============================================================================
export function checkPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

export function checkAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => checkPermission(role, permission));
}

export function checkAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => checkPermission(role, permission));
}

export function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function checkTenantAccess(userTenantId: string, requiredTenantId: string): boolean {
  return userTenantId === requiredTenantId;
}

// ============================================================================
// Express Middleware Factories
// ============================================================================
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole) {
        res.status(401).json({ error: 'Unauthorized - No role assigned' });
        return;
      }

      if (!userTenantId) {
        res.status(401).json({ error: 'Unauthorized - No tenant context' });
        return;
      }

      if (!checkPermission(userRole, permission)) {
        res.status(403).json({ 
          error: 'Forbidden - Insufficient permissions',
          required: permission,
          userRole
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole || !userTenantId) {
        res.status(401).json({ error: 'Unauthorized - Missing authentication' });
        return;
      }

      if (!hasHigherOrEqualRole(userRole, ROLES.ADMIN)) {
        res.status(403).json({ 
          error: 'Forbidden - ADMIN role required',
          userRole,
          required: ROLES.ADMIN
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

export function requireProjectManager() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole || !userTenantId) {
        res.status(401).json({ error: 'Unauthorized - Missing authentication' });
        return;
      }

      if (!hasHigherOrEqualRole(userRole, ROLES.PROJECT_MANAGER)) {
        res.status(403).json({ 
          error: 'Forbidden - PROJECT_MANAGER role required',
          userRole,
          required: ROLES.PROJECT_MANAGER
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

export function requireWorker() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole || !userTenantId) {
        res.status(401).json({ error: 'Unauthorized - Missing authentication' });
        return;
      }

      if (!hasHigherOrEqualRole(userRole, ROLES.WORKER)) {
        res.status(403).json({ 
          error: 'Forbidden - WORKER role required',
          userRole,
          required: ROLES.WORKER
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

export function requireDriver() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole || !userTenantId) {
        res.status(401).json({ error: 'Unauthorized - Missing authentication' });
        return;
      }

      if (!hasHigherOrEqualRole(userRole, ROLES.DRIVER)) {
        res.status(403).json({ 
          error: 'Forbidden - DRIVER role required',
          userRole,
          required: ROLES.DRIVER
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

export function requireViewer() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as Role;
      const userTenantId = req.user?.tenantId;
      
      if (!userRole || !userTenantId) {
        res.status(401).json({ error: 'Unauthorized - Missing authentication' });
        return;
      }

      if (!hasHigherOrEqualRole(userRole, ROLES.VIEWER)) {
        res.status(403).json({ 
          error: 'Forbidden - VIEWER role required',
          userRole,
          required: ROLES.VIEWER
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}

