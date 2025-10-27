/**
 * Roles Service
 * API client for role management operations
 * All endpoints are tenant-scoped
 */

import api from "@/lib/api";
import { RoleCode, Role } from "../types/rbac.generated";

// =============================================================================
// ROLE INTERFACES
// =============================================================================

interface RoleCreateRequest {
  code: RoleCode;
  name?: string;
  description?: string;
}

interface RoleUpdateRequest {
  name?: string;
  description?: string;
}

interface RoleAssignmentRequest {
  userId: string;
  roles: RoleCode[];
  assignedBy?: string;
  reason?: string;
  expiresAt?: string;
}

interface BulkRoleAssignmentRequest {
  assignments: Array<{
    userId: string;
    roles: RoleCode[];
    reason?: string;
    expiresAt?: string;
  }>;
  assignedBy?: string;
}

interface RoleAssignmentResponse {
  success: boolean;
  data: {
    userId: string;
    assignedRoles: RoleCode[];
    failedRoles: Array<{
      role: RoleCode;
      reason: string;
    }>;
  };
  message?: string;
}

interface BulkRoleAssignmentResponse {
  success: boolean;
  data: {
    successful: Array<{
      userId: string;
      assignedRoles: RoleCode[];
    }>;
    failed: Array<{
      userId: string;
      roles: RoleCode[];
      reason: string;
    }>;
  };
  message?: string;
}

interface RoleUsersResponse {
  success: boolean;
  data: Array<{
    userId: string;
    email: string;
    displayName?: string;
    roles: RoleCode[];
    assignedAt: string;
    assignedBy?: string;
    expiresAt?: string;
  }>;
}

// =============================================================================
// ROLES SERVICE CLASS
// =============================================================================

class RolesService {
  private basePath = "/api/rbac/roles";

  // =============================================================================
  // ROLE MANAGEMENT
  // =============================================================================

  /**
   * Get all available roles for tenant
   */
  async getRoles(tenantId: string) {
    try {
      const response = await api.get<Role[]>(this.basePath, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get roles:", error);
      return {
        success: false,
        data: [],
        message: "Failed to retrieve roles",
      };
    }
  }

  /**
   * Get specific role details
   */
  async getRole(roleCode: RoleCode, tenantId: string) {
    try {
      const response = await api.get<Role>(`${this.basePath}/${roleCode}`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get role:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve role details",
      };
    }
  }

  /**
   * Create custom role (Admin only)
   */
  async createRole(request: RoleCreateRequest, tenantId: string) {
    try {
      const response = await api.post<Role>(this.basePath, request, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
        message: "Role created successfully",
      };
    } catch (error) {
      console.error("Failed to create role:", error);
      return {
        success: false,
        data: null,
        message: "Failed to create role",
      };
    }
  }

  /**
   * Update role details (Admin only)
   */
  async updateRole(
    roleCode: RoleCode,
    request: RoleUpdateRequest,
    tenantId: string
  ) {
    try {
      const response = await api.put<Role>(
        `${this.basePath}/${roleCode}`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Role updated successfully",
      };
    } catch (error) {
      console.error("Failed to update role:", error);
      return {
        success: false,
        data: null,
        message: "Failed to update role",
      };
    }
  }

  /**
   * Delete custom role (Admin only)
   */
  async deleteRole(roleCode: RoleCode, tenantId: string) {
    try {
      await api.delete(`${this.basePath}/${roleCode}`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        message: "Role deleted successfully",
      };
    } catch (error) {
      console.error("Failed to delete role:", error);
      return {
        success: false,
        message: "Failed to delete role",
      };
    }
  }

  // =============================================================================
  // ROLE ASSIGNMENTS
  // =============================================================================

  /**
   * Assign roles to user
   */
  async assignRoles(
    request: RoleAssignmentRequest,
    tenantId: string
  ): Promise<RoleAssignmentResponse> {
    try {
      const response = await api.post<RoleAssignmentResponse["data"]>(
        `${this.basePath}/assign`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Roles assigned successfully",
      };
    } catch (error) {
      console.error("Failed to assign roles:", error);
      return {
        success: false,
        data: {
          userId: request.userId,
          assignedRoles: [],
          failedRoles: request.roles.map((role) => ({
            role,
            reason: "Assignment failed",
          })),
        },
        message: "Failed to assign roles",
      };
    }
  }

  /**
   * Unassign roles from user
   */
  async unassignRoles(
    userId: string,
    roles: RoleCode[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/unassign`,
        { userId, roles, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Roles unassigned successfully",
      };
    } catch (error) {
      console.error("Failed to unassign roles:", error);
      return {
        success: false,
        data: {
          userId,
          unassignedRoles: [],
          failedRoles: roles.map((role) => ({
            role,
            reason: "Unassignment failed",
          })),
        },
        message: "Failed to unassign roles",
      };
    }
  }

  /**
   * Bulk assign roles to multiple users
   */
  async bulkAssignRoles(
    request: BulkRoleAssignmentRequest,
    tenantId: string
  ): Promise<BulkRoleAssignmentResponse> {
    try {
      const response = await api.post<BulkRoleAssignmentResponse["data"]>(
        `${this.basePath}/bulk-assign`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Bulk role assignment completed",
      };
    } catch (error) {
      console.error("Failed to bulk assign roles:", error);
      return {
        success: false,
        data: {
          successful: [],
          failed: request.assignments.map((assignment) => ({
            userId: assignment.userId,
            roles: assignment.roles,
            reason: "Bulk assignment failed",
          })),
        },
        message: "Failed to perform bulk role assignment",
      };
    }
  }

  /**
   * Replace user's roles completely
   */
  async replaceUserRoles(
    userId: string,
    roles: RoleCode[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.put(
        `${this.basePath}/users/${userId}/roles`,
        { roles, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "User roles updated successfully",
      };
    } catch (error) {
      console.error("Failed to replace user roles:", error);
      return {
        success: false,
        data: {
          userId,
          currentRoles: [],
          requestedRoles: roles,
        },
        message: "Failed to update user roles",
      };
    }
  }

  // =============================================================================
  // ROLE QUERIES
  // =============================================================================

  /**
   * Get users with specific role
   */
  async getRoleUsers(
    roleCode: RoleCode,
    tenantId: string
  ): Promise<RoleUsersResponse> {
    try {
      const response = await api.get<RoleUsersResponse["data"]>(
        `${this.basePath}/${roleCode}/users`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get role users:", error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get user's roles in tenant
   */
  async getUserRoles(userId: string, tenantId: string) {
    try {
      const response = await api.get<{
        userId: string;
        roles: RoleCode[];
        assignments: Array<{
          role: RoleCode;
          assignedAt: string;
          assignedBy?: string;
          expiresAt?: string;
          isActive: boolean;
        }>;
      }>(`${this.basePath}/users/${userId}`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get user roles:", error);
      return {
        success: false,
        data: {
          userId,
          roles: [],
          assignments: [],
        },
        message: "Failed to retrieve user roles",
      };
    }
  }

  /**
   * Get role hierarchy and relationships
   */
  async getRoleHierarchy(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/hierarchy`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get role hierarchy:", error);
      return {
        success: false,
        data: {
          roles: [],
          hierarchy: {},
          levels: {},
        },
        message: "Failed to retrieve role hierarchy",
      };
    }
  }

  // =============================================================================
  // ROLE STATISTICS
  // =============================================================================

  /**
   * Get role usage statistics
   */
  async getRoleStats(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/stats`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get role stats:", error);
      return {
        success: false,
        data: {
          totalRoles: 0,
          totalAssignments: 0,
          roleUsage: {},
          mostUsedRole: null,
          leastUsedRole: null,
        },
        message: "Failed to retrieve role statistics",
      };
    }
  }

  /**
   * Get role assignment history
   */
  async getRoleHistory(
    tenantId: string,
    options?: {
      userId?: string;
      roleCode?: RoleCode;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options?.userId) queryParams.set("userId", options.userId);
      if (options?.roleCode) queryParams.set("roleCode", options.roleCode);
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
      console.error("Failed to get role history:", error);
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
        message: "Failed to retrieve role history",
      };
    }
  }

  // =============================================================================
  // ROLE VALIDATION
  // =============================================================================

  /**
   * Validate role assignment before execution
   */
  async validateRoleAssignment(
    userId: string,
    roles: RoleCode[],
    tenantId: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/validate-assignment`,
        { userId, roles },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to validate role assignment:", error);
      return {
        success: false,
        data: {
          isValid: false,
          conflicts: [],
          warnings: [],
          suggestions: [],
        },
        message: "Failed to validate role assignment",
      };
    }
  }

  /**
   * Check if user can assign specific roles
   */
  async canAssignRoles(
    assignerUserId: string,
    targetRoles: RoleCode[],
    tenantId: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/can-assign`,
        { assignerUserId, targetRoles },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to check role assignment permissions:", error);
      return {
        success: false,
        data: {
          canAssign: false,
          allowedRoles: [],
          deniedRoles: targetRoles,
          reason: "Permission check failed",
        },
        message: "Failed to check assignment permissions",
      };
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const rolesService = new RolesService();
export default rolesService;

// Export types for external use
export type {
  RoleCreateRequest,
  RoleUpdateRequest,
  RoleAssignmentRequest,
  BulkRoleAssignmentRequest,
  RoleAssignmentResponse,
  BulkRoleAssignmentResponse,
  RoleUsersResponse,
};
