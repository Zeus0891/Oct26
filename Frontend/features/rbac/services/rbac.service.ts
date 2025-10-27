/**
 * RBAC Service
 * Main RBAC API client for tenant-scoped operations
 * All endpoints require X-Tenant-Id header
 */

import api from "@/lib/api";
import { Permission, RoleCode } from "../types/rbac.generated";
import type { UserRoles } from "../types/rbac.types";

// =============================================================================
// RBAC INTERFACES
// =============================================================================

interface RbacContextRequest {
  userId?: string;
  tenantId: string;
}

interface RbacContextResponse {
  success: boolean;
  data: UserRoles;
  message?: string;
}

interface PermissionCheckRequest {
  userId?: string; // If not provided, uses current user
  permissions: Permission[];
  requireAll?: boolean; // Default: false (ANY logic)
  resourceContext?: Record<string, unknown>;
}

interface PermissionCheckResponse {
  success: boolean;
  data: {
    hasPermission: boolean;
    grantedPermissions: Permission[];
    deniedPermissions: Permission[];
    details: Array<{
      permission: Permission;
      granted: boolean;
      reason?: string;
    }>;
  };
  message?: string;
}

interface RoleCheckRequest {
  userId?: string;
  roles: RoleCode[];
  requireAll?: boolean;
}

interface RoleCheckResponse {
  success: boolean;
  data: {
    hasRole: boolean;
    grantedRoles: RoleCode[];
    deniedRoles: RoleCode[];
    highestRole: RoleCode | null;
    roleLevel: number;
  };
  message?: string;
}

interface BulkPermissionCheckRequest {
  checks: Array<{
    userId: string;
    permissions: Permission[];
    requireAll?: boolean;
  }>;
}

interface BulkPermissionCheckResponse {
  success: boolean;
  data: Array<{
    userId: string;
    hasPermission: boolean;
    grantedPermissions: Permission[];
    deniedPermissions: Permission[];
  }>;
}

// =============================================================================
// RBAC SERVICE CLASS
// =============================================================================

class RbacService {
  private basePath = "/api/rbac";

  constructor() {
    // Using the api instance directly
  }

  // =============================================================================
  // CONTEXT & USER RBAC DATA
  // =============================================================================

  /**
   * Get current user's RBAC context (roles and permissions)
   */
  async getCurrentUserRbac(tenantId: string): Promise<RbacContextResponse> {
    try {
      const response = await api.get<UserRoles>(`${this.basePath}/me`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get current user RBAC context:", error);
      return {
        success: false,
        data: {
          tenantId,
          roles: [],
          permissions: [],
          isSandbox: false,
        },
        message: "Failed to retrieve RBAC context",
      };
    }
  }

  /**
   * Get specific user's RBAC context
   */
  async getUserRbac(
    userId: string,
    tenantId: string
  ): Promise<RbacContextResponse> {
    try {
      const response = await api.get<UserRoles>(
        `${this.basePath}/users/${userId}`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get user RBAC context:", error);
      return {
        success: false,
        data: {
          tenantId,
          roles: [],
          permissions: [],
          isSandbox: false,
        },
        message: "Failed to retrieve user RBAC context",
      };
    }
  }

  /**
   * Refresh current user's RBAC context (force reload)
   */
  async refreshUserRbac(tenantId: string): Promise<RbacContextResponse> {
    try {
      const response = await api.post<UserRoles>(
        `${this.basePath}/me/refresh`,
        {},
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to refresh RBAC context:", error);
      return {
        success: false,
        data: {
          tenantId,
          roles: [],
          permissions: [],
          isSandbox: false,
        },
        message: "Failed to refresh RBAC context",
      };
    }
  }

  // =============================================================================
  // PERMISSION CHECKING
  // =============================================================================

  /**
   * Check if user has specific permissions
   */
  async checkPermissions(
    request: PermissionCheckRequest,
    tenantId: string
  ): Promise<PermissionCheckResponse> {
    try {
      const response = await api.post<PermissionCheckResponse["data"]>(
        `${this.basePath}/permissions/check`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to check permissions:", error);
      return {
        success: false,
        data: {
          hasPermission: false,
          grantedPermissions: [],
          deniedPermissions: request.permissions,
          details: request.permissions.map((permission) => ({
            permission,
            granted: false,
            reason: "Permission check failed",
          })),
        },
        message: "Failed to check permissions",
      };
    }
  }

  /**
   * Check permissions for multiple users (bulk operation)
   */
  async bulkCheckPermissions(
    request: BulkPermissionCheckRequest,
    tenantId: string
  ): Promise<BulkPermissionCheckResponse> {
    try {
      const response = await api.post<BulkPermissionCheckResponse["data"]>(
        `${this.basePath}/permissions/bulk-check`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to bulk check permissions:", error);
      return {
        success: false,
        data: request.checks.map((check) => ({
          userId: check.userId,
          hasPermission: false,
          grantedPermissions: [],
          deniedPermissions: check.permissions,
        })),
      };
    }
  }

  // =============================================================================
  // ROLE CHECKING
  // =============================================================================

  /**
   * Check if user has specific roles
   */
  async checkRoles(
    request: RoleCheckRequest,
    tenantId: string
  ): Promise<RoleCheckResponse> {
    try {
      const response = await api.post<RoleCheckResponse["data"]>(
        `${this.basePath}/roles/check`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to check roles:", error);
      return {
        success: false,
        data: {
          hasRole: false,
          grantedRoles: [],
          deniedRoles: request.roles,
          highestRole: null,
          roleLevel: 0,
        },
        message: "Failed to check roles",
      };
    }
  }

  // =============================================================================
  // RBAC HEALTH & VALIDATION
  // =============================================================================

  /**
   * Validate RBAC configuration health
   */
  async validateRbacHealth(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/health`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to validate RBAC health:", error);
      return {
        success: false,
        data: {
          isHealthy: false,
          issues: ["Health check failed"],
          warnings: [],
        },
        message: "Failed to validate RBAC health",
      };
    }
  }

  /**
   * Get RBAC system statistics
   */
  async getRbacStats(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/stats`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get RBAC stats:", error);
      return {
        success: false,
        data: {
          totalUsers: 0,
          totalRoles: 0,
          totalPermissions: 0,
          activeAssignments: 0,
        },
        message: "Failed to get RBAC statistics",
      };
    }
  }

  // =============================================================================
  // RBAC AUDIT & LOGGING
  // =============================================================================

  /**
   * Get RBAC audit log
   */
  async getRbacAuditLog(
    tenantId: string,
    options?: {
      userId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options?.userId) queryParams.set("userId", options.userId);
      if (options?.action) queryParams.set("action", options.action);
      if (options?.startDate) queryParams.set("startDate", options.startDate);
      if (options?.endDate) queryParams.set("endDate", options.endDate);
      if (options?.limit) queryParams.set("limit", options.limit.toString());
      if (options?.offset) queryParams.set("offset", options.offset.toString());

      const url = `${this.basePath}/audit${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get RBAC audit log:", error);
      return {
        success: false,
        data: {
          entries: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
          },
        },
        message: "Failed to get audit log",
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get all available permissions for tenant
   */
  async getAvailablePermissions(tenantId: string) {
    try {
      const response = await api.get<Permission[]>(
        `${this.basePath}/permissions/available`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get available permissions:", error);
      return {
        success: false,
        data: [],
        message: "Failed to get available permissions",
      };
    }
  }

  /**
   * Get all available roles for tenant
   */
  async getAvailableRoles(tenantId: string) {
    try {
      const response = await api.get<RoleCode[]>(
        `${this.basePath}/roles/available`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get available roles:", error);
      return {
        success: false,
        data: [],
        message: "Failed to get available roles",
      };
    }
  }

  /**
   * Get RBAC configuration for tenant
   */
  async getRbacConfig(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/config`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get RBAC config:", error);
      return {
        success: false,
        data: {
          tenantId,
          enableSandbox: false,
          defaultRole: "VIEWER",
          maxRolesPerUser: 3,
        },
        message: "Failed to get RBAC configuration",
      };
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const rbacService = new RbacService();
export default rbacService;

// Export types for external use
export type {
  RbacContextRequest,
  RbacContextResponse,
  PermissionCheckRequest,
  PermissionCheckResponse,
  RoleCheckRequest,
  RoleCheckResponse,
  BulkPermissionCheckRequest,
  BulkPermissionCheckResponse,
};
