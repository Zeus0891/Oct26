/**
 * Permissions Service
 * API client for permission management operations
 * All endpoints are tenant-scoped
 */

import api from "@/lib/api";
import { Permission, RoleCode } from "../types/rbac.generated";

// =============================================================================
// PERMISSION INTERFACES
// =============================================================================

interface PermissionGrantRequest {
  userId: string;
  permissions: Permission[];
  grantedBy?: string;
  reason?: string;
  expiresAt?: string;
  resourceContext?: Record<string, unknown>;
}

interface BulkPermissionGrantRequest {
  grants: Array<{
    userId: string;
    permissions: Permission[];
    reason?: string;
    expiresAt?: string;
    resourceContext?: Record<string, unknown>;
  }>;
  grantedBy?: string;
}

interface PermissionGrantResponse {
  success: boolean;
  data: {
    userId: string;
    grantedPermissions: Permission[];
    failedPermissions: Array<{
      permission: Permission;
      reason: string;
    }>;
  };
  message?: string;
}

interface BulkPermissionGrantResponse {
  success: boolean;
  data: {
    successful: Array<{
      userId: string;
      grantedPermissions: Permission[];
    }>;
    failed: Array<{
      userId: string;
      permissions: Permission[];
      reason: string;
    }>;
  };
  message?: string;
}

interface UserPermissionsResponse {
  success: boolean;
  data: {
    userId: string;
    directPermissions: Permission[];
    rolePermissions: Permission[];
    allPermissions: Permission[];
    effectivePermissions: Array<{
      permission: Permission;
      source: "direct" | "role";
      sourceDetail?: string;
      grantedAt: string;
      grantedBy?: string;
      expiresAt?: string;
    }>;
  };
}

interface PermissionUsersResponse {
  success: boolean;
  data: Array<{
    userId: string;
    email: string;
    displayName?: string;
    hasPermission: boolean;
    source: "direct" | "role";
    sourceDetail?: string;
    grantedAt: string;
    grantedBy?: string;
  }>;
}

// =============================================================================
// PERMISSIONS SERVICE CLASS
// =============================================================================

class PermissionsService {
  private basePath = "/api/rbac/permissions";

  // =============================================================================
  // PERMISSION DISCOVERY
  // =============================================================================

  /**
   * Get all available permissions for tenant
   */
  async getAvailablePermissions(tenantId: string) {
    try {
      const response = await api.get<Permission[]>(
        `${this.basePath}/available`,
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
        message: "Failed to retrieve available permissions",
      };
    }
  }

  /**
   * Get permissions grouped by model/domain
   */
  async getPermissionsByDomain(tenantId: string) {
    try {
      const response = await api.get<Record<string, Permission[]>>(
        `${this.basePath}/by-domain`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permissions by domain:", error);
      return {
        success: false,
        data: {},
        message: "Failed to retrieve permissions by domain",
      };
    }
  }

  /**
   * Get role-based permission matrix
   */
  async getPermissionMatrix(tenantId: string) {
    try {
      const response = await api.get<Record<RoleCode, Permission[]>>(
        `${this.basePath}/matrix`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permission matrix:", error);
      return {
        success: false,
        data: {} as Record<RoleCode, Permission[]>,
        message: "Failed to retrieve permission matrix",
      };
    }
  }

  /**
   * Search permissions by pattern or model
   */
  async searchPermissions(
    tenantId: string,
    options: {
      query?: string;
      model?: string;
      action?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options.query) queryParams.set("q", options.query);
      if (options.model) queryParams.set("model", options.model);
      if (options.action) queryParams.set("action", options.action);
      if (options.limit) queryParams.set("limit", options.limit.toString());
      if (options.offset) queryParams.set("offset", options.offset.toString());

      const url = `${this.basePath}/search${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to search permissions:", error);
      return {
        success: false,
        data: {
          permissions: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
          },
        },
        message: "Failed to search permissions",
      };
    }
  }

  // =============================================================================
  // PERMISSION GRANTS
  // =============================================================================

  /**
   * Grant direct permissions to user
   */
  async grantPermissions(
    request: PermissionGrantRequest,
    tenantId: string
  ): Promise<PermissionGrantResponse> {
    try {
      const response = await api.post<PermissionGrantResponse["data"]>(
        `${this.basePath}/grant`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Permissions granted successfully",
      };
    } catch (error) {
      console.error("Failed to grant permissions:", error);
      return {
        success: false,
        data: {
          userId: request.userId,
          grantedPermissions: [],
          failedPermissions: request.permissions.map((permission) => ({
            permission,
            reason: "Grant failed",
          })),
        },
        message: "Failed to grant permissions",
      };
    }
  }

  /**
   * Revoke direct permissions from user
   */
  async revokePermissions(
    userId: string,
    permissions: Permission[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/revoke`,
        { userId, permissions, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Permissions revoked successfully",
      };
    } catch (error) {
      console.error("Failed to revoke permissions:", error);
      return {
        success: false,
        data: {
          userId,
          revokedPermissions: [],
          failedPermissions: permissions.map((permission) => ({
            permission,
            reason: "Revoke failed",
          })),
        },
        message: "Failed to revoke permissions",
      };
    }
  }

  /**
   * Bulk grant permissions to multiple users
   */
  async bulkGrantPermissions(
    request: BulkPermissionGrantRequest,
    tenantId: string
  ): Promise<BulkPermissionGrantResponse> {
    try {
      const response = await api.post<BulkPermissionGrantResponse["data"]>(
        `${this.basePath}/bulk-grant`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Bulk permission grant completed",
      };
    } catch (error) {
      console.error("Failed to bulk grant permissions:", error);
      return {
        success: false,
        data: {
          successful: [],
          failed: request.grants.map((grant) => ({
            userId: grant.userId,
            permissions: grant.permissions,
            reason: "Bulk grant failed",
          })),
        },
        message: "Failed to perform bulk permission grant",
      };
    }
  }

  /**
   * Replace user's direct permissions completely
   */
  async replaceUserPermissions(
    userId: string,
    permissions: Permission[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.put(
        `${this.basePath}/users/${userId}/permissions`,
        { permissions, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "User permissions updated successfully",
      };
    } catch (error) {
      console.error("Failed to replace user permissions:", error);
      return {
        success: false,
        data: {
          userId,
          currentPermissions: [],
          requestedPermissions: permissions,
        },
        message: "Failed to update user permissions",
      };
    }
  }

  // =============================================================================
  // PERMISSION QUERIES
  // =============================================================================

  /**
   * Get user's effective permissions (direct + role-based)
   */
  async getUserPermissions(
    userId: string,
    tenantId: string
  ): Promise<UserPermissionsResponse> {
    try {
      const response = await api.get<UserPermissionsResponse["data"]>(
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
      console.error("Failed to get user permissions:", error);
      return {
        success: false,
        data: {
          userId,
          directPermissions: [],
          rolePermissions: [],
          allPermissions: [],
          effectivePermissions: [],
        },
      };
    }
  }

  /**
   * Get users who have specific permission
   */
  async getPermissionUsers(
    permission: Permission,
    tenantId: string
  ): Promise<PermissionUsersResponse> {
    try {
      const response = await api.get<PermissionUsersResponse["data"]>(
        `${this.basePath}/${encodeURIComponent(permission)}/users`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permission users:", error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Compare permissions between two users
   */
  async compareUserPermissions(
    userId1: string,
    userId2: string,
    tenantId: string
  ) {
    try {
      const response = await api.get(
        `${this.basePath}/compare/${userId1}/${userId2}`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to compare user permissions:", error);
      return {
        success: false,
        data: {
          user1: { userId: userId1, permissions: [] },
          user2: { userId: userId2, permissions: [] },
          common: [],
          onlyUser1: [],
          onlyUser2: [],
          comparison: {
            totalUser1: 0,
            totalUser2: 0,
            commonCount: 0,
            differenceCount: 0,
          },
        },
        message: "Failed to compare user permissions",
      };
    }
  }

  // =============================================================================
  // PERMISSION ANALYSIS
  // =============================================================================

  /**
   * Get permission usage statistics
   */
  async getPermissionStats(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/stats`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permission stats:", error);
      return {
        success: false,
        data: {
          totalPermissions: 0,
          totalGrants: 0,
          permissionUsage: {},
          mostUsedPermission: null,
          leastUsedPermission: null,
          byDomain: {},
        },
        message: "Failed to retrieve permission statistics",
      };
    }
  }

  /**
   * Analyze permission conflicts and redundancies
   */
  async analyzePermissions(tenantId: string, userId?: string) {
    try {
      const url = userId
        ? `${this.basePath}/analyze?userId=${userId}`
        : `${this.basePath}/analyze`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to analyze permissions:", error);
      return {
        success: false,
        data: {
          conflicts: [],
          redundancies: [],
          suggestions: [],
          healthScore: 0,
        },
        message: "Failed to analyze permissions",
      };
    }
  }

  /**
   * Get permission assignment history
   */
  async getPermissionHistory(
    tenantId: string,
    options?: {
      userId?: string;
      permission?: Permission;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options?.userId) queryParams.set("userId", options.userId);
      if (options?.permission)
        queryParams.set("permission", options.permission);
      if (options?.startDate) queryParams.set("startDate", options.startDate);
      if (options?.endDate) queryParams.set("endDate", options.endDate);
      if (options?.limit) queryParams.set("limit", options.limit.toString());
      if (options?.offset) queryParams.set("offset", options.offset.toString());

      const url = `${this.basePath}/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permission history:", error);
      return {
        success: false,
        data: {
          history: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
          },
        },
        message: "Failed to retrieve permission history",
      };
    }
  }

  // =============================================================================
  // PERMISSION VALIDATION
  // =============================================================================

  /**
   * Validate permission grant before execution
   */
  async validatePermissionGrant(
    userId: string,
    permissions: Permission[],
    tenantId: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/validate-grant`,
        { userId, permissions },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to validate permission grant:", error);
      return {
        success: false,
        data: {
          isValid: false,
          conflicts: [],
          warnings: [],
          suggestions: [],
        },
        message: "Failed to validate permission grant",
      };
    }
  }

  /**
   * Check if user can grant specific permissions
   */
  async canGrantPermissions(
    granterUserId: string,
    targetPermissions: Permission[],
    tenantId: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/can-grant`,
        { granterUserId, targetPermissions },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to check permission grant permissions:", error);
      return {
        success: false,
        data: {
          canGrant: false,
          allowedPermissions: [],
          deniedPermissions: targetPermissions,
          reason: "Permission check failed",
        },
        message: "Failed to check grant permissions",
      };
    }
  }

  /**
   * Get permission suggestions based on role or usage patterns
   */
  async getPermissionSuggestions(
    userId: string,
    tenantId: string,
    context?: {
      role?: RoleCode;
      similarUsers?: string[];
      taskContext?: string;
    }
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/suggestions`,
        { userId, context },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get permission suggestions:", error);
      return {
        success: false,
        data: {
          suggestions: [],
          reasoning: [],
          confidence: 0,
        },
        message: "Failed to get permission suggestions",
      };
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const permissionsService = new PermissionsService();
export default permissionsService;

// Export types for external use
export type {
  PermissionGrantRequest,
  BulkPermissionGrantRequest,
  PermissionGrantResponse,
  BulkPermissionGrantResponse,
  UserPermissionsResponse,
  PermissionUsersResponse,
};
