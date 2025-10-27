/**
 * Members Service
 * API client for tenant member management operations
 * All endpoints are tenant-scoped
 */

import api from "@/lib/api";
import { RoleCode, Permission } from "../types/rbac.generated";

// =============================================================================
// MEMBER INTERFACES
// =============================================================================

interface MemberInfo {
  userId: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  joinedAt: string;
  lastLoginAt?: string;
}

interface MemberRoles {
  userId: string;
  roles: RoleCode[];
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
}

interface TenantMember extends MemberInfo, MemberRoles {
  directPermissions: Permission[];
  effectivePermissions: Permission[];
  isSandbox: boolean;
}

interface MemberInviteRequest {
  email: string;
  roles: RoleCode[];
  directPermissions?: Permission[];
  message?: string;
  expiresAt?: string;
}

interface BulkMemberInviteRequest {
  invitations: Array<{
    email: string;
    roles: RoleCode[];
    directPermissions?: Permission[];
    message?: string;
  }>;
  defaultExpiresAt?: string;
}

interface MemberInviteResponse {
  success: boolean;
  data: {
    inviteId: string;
    email: string;
    roles: RoleCode[];
    inviteUrl: string;
    expiresAt: string;
  };
  message?: string;
}

interface BulkMemberInviteResponse {
  success: boolean;
  data: {
    successful: Array<{
      inviteId: string;
      email: string;
      roles: RoleCode[];
      inviteUrl: string;
    }>;
    failed: Array<{
      email: string;
      reason: string;
    }>;
  };
  message?: string;
}

interface MembersListResponse {
  success: boolean;
  data: {
    members: TenantMember[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

// =============================================================================
// MEMBERS SERVICE CLASS
// =============================================================================

class MembersService {
  private basePath = "/api/rbac/members";

  // =============================================================================
  // MEMBER LISTING & QUERYING
  // =============================================================================

  /**
   * Get all tenant members with pagination
   */
  async getMembers(
    tenantId: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      role?: RoleCode;
      status?: "active" | "inactive" | "pending" | "suspended";
      sortBy?: "name" | "email" | "joinedAt" | "lastLogin";
      sortOrder?: "asc" | "desc";
    }
  ): Promise<MembersListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.set("limit", options.limit.toString());
      if (options?.offset) queryParams.set("offset", options.offset.toString());
      if (options?.search) queryParams.set("search", options.search);
      if (options?.role) queryParams.set("role", options.role);
      if (options?.status) queryParams.set("status", options.status);
      if (options?.sortBy) queryParams.set("sortBy", options.sortBy);
      if (options?.sortOrder) queryParams.set("sortOrder", options.sortOrder);

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get<MembersListResponse["data"]>(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get members:", error);
      return {
        success: false,
        data: {
          members: [],
          pagination: {
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        },
      };
    }
  }

  /**
   * Get specific member details
   */
  async getMember(userId: string, tenantId: string) {
    try {
      const response = await api.get<TenantMember>(
        `${this.basePath}/${userId}`,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get member:", error);
      return {
        success: false,
        data: null,
        message: "Failed to retrieve member details",
      };
    }
  }

  /**
   * Search members by various criteria
   */
  async searchMembers(
    tenantId: string,
    query: string,
    filters?: {
      roles?: RoleCode[];
      permissions?: Permission[];
      status?: string[];
      joinedAfter?: string;
      joinedBefore?: string;
    }
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/search`,
        { query, filters },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to search members:", error);
      return {
        success: false,
        data: {
          members: [],
          totalMatches: 0,
        },
        message: "Failed to search members",
      };
    }
  }

  // =============================================================================
  // MEMBER INVITATIONS
  // =============================================================================

  /**
   * Invite new member to tenant
   */
  async inviteMember(
    request: MemberInviteRequest,
    tenantId: string
  ): Promise<MemberInviteResponse> {
    try {
      const response = await api.post<MemberInviteResponse["data"]>(
        `${this.basePath}/invite`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Member invited successfully",
      };
    } catch (error) {
      console.error("Failed to invite member:", error);
      return {
        success: false,
        data: {
          inviteId: "",
          email: request.email,
          roles: request.roles,
          inviteUrl: "",
          expiresAt: "",
        },
        message: "Failed to send invitation",
      };
    }
  }

  /**
   * Bulk invite multiple members
   */
  async bulkInviteMembers(
    request: BulkMemberInviteRequest,
    tenantId: string
  ): Promise<BulkMemberInviteResponse> {
    try {
      const response = await api.post<BulkMemberInviteResponse["data"]>(
        `${this.basePath}/bulk-invite`,
        request,
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Bulk invitations sent",
      };
    } catch (error) {
      console.error("Failed to bulk invite members:", error);
      return {
        success: false,
        data: {
          successful: [],
          failed: request.invitations.map((invite) => ({
            email: invite.email,
            reason: "Invitation failed",
          })),
        },
        message: "Failed to send bulk invitations",
      };
    }
  }

  /**
   * Resend invitation to pending member
   */
  async resendInvitation(inviteId: string, tenantId: string) {
    try {
      const response = await api.post(
        `${this.basePath}/invitations/${inviteId}/resend`,
        {},
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Invitation resent successfully",
      };
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      return {
        success: false,
        message: "Failed to resend invitation",
      };
    }
  }

  /**
   * Cancel pending invitation
   */
  async cancelInvitation(inviteId: string, tenantId: string) {
    try {
      await api.delete(`${this.basePath}/invitations/${inviteId}`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        message: "Invitation cancelled successfully",
      };
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
      return {
        success: false,
        message: "Failed to cancel invitation",
      };
    }
  }

  /**
   * Get pending invitations
   */
  async getPendingInvitations(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/invitations`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get pending invitations:", error);
      return {
        success: false,
        data: {
          invitations: [],
          total: 0,
        },
        message: "Failed to retrieve pending invitations",
      };
    }
  }

  // =============================================================================
  // MEMBER MANAGEMENT
  // =============================================================================

  /**
   * Update member roles
   */
  async updateMemberRoles(
    userId: string,
    roles: RoleCode[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.put(
        `${this.basePath}/${userId}/roles`,
        { roles, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Member roles updated successfully",
      };
    } catch (error) {
      console.error("Failed to update member roles:", error);
      return {
        success: false,
        data: {
          userId,
          currentRoles: [],
          requestedRoles: roles,
        },
        message: "Failed to update member roles",
      };
    }
  }

  /**
   * Update member permissions (direct grants)
   */
  async updateMemberPermissions(
    userId: string,
    permissions: Permission[],
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.put(
        `${this.basePath}/${userId}/permissions`,
        { permissions, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Member permissions updated successfully",
      };
    } catch (error) {
      console.error("Failed to update member permissions:", error);
      return {
        success: false,
        data: {
          userId,
          currentPermissions: [],
          requestedPermissions: permissions,
        },
        message: "Failed to update member permissions",
      };
    }
  }

  /**
   * Update member status
   */
  async updateMemberStatus(
    userId: string,
    status: "active" | "inactive" | "suspended",
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.put(
        `${this.basePath}/${userId}/status`,
        { status, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: `Member ${status} successfully`,
      };
    } catch (error) {
      console.error("Failed to update member status:", error);
      return {
        success: false,
        data: {
          userId,
          currentStatus: "unknown",
          requestedStatus: status,
        },
        message: "Failed to update member status",
      };
    }
  }

  /**
   * Remove member from tenant
   */
  async removeMember(userId: string, tenantId: string, reason?: string) {
    try {
      const response = await api.delete(`${this.basePath}/${userId}`, {
        data: { reason },
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
        message: "Member removed successfully",
      };
    } catch (error) {
      console.error("Failed to remove member:", error);
      return {
        success: false,
        message: "Failed to remove member",
      };
    }
  }

  /**
   * Transfer member ownership/admin rights
   */
  async transferOwnership(
    currentOwnerId: string,
    newOwnerId: string,
    tenantId: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/transfer-ownership`,
        { currentOwnerId, newOwnerId },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Ownership transferred successfully",
      };
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
      return {
        success: false,
        message: "Failed to transfer ownership",
      };
    }
  }

  // =============================================================================
  // MEMBER ANALYTICS
  // =============================================================================

  /**
   * Get member activity statistics
   */
  async getMemberStats(tenantId: string) {
    try {
      const response = await api.get(`${this.basePath}/stats`, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get member stats:", error);
      return {
        success: false,
        data: {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvitations: 0,
          roleDistribution: {},
          recentJoins: [],
          recentLogins: [],
        },
        message: "Failed to retrieve member statistics",
      };
    }
  }

  /**
   * Get member activity history
   */
  async getMemberActivity(
    userId: string,
    tenantId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      actionType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options?.startDate) queryParams.set("startDate", options.startDate);
      if (options?.endDate) queryParams.set("endDate", options.endDate);
      if (options?.actionType)
        queryParams.set("actionType", options.actionType);
      if (options?.limit) queryParams.set("limit", options.limit.toString());
      if (options?.offset) queryParams.set("offset", options.offset.toString());

      const url = `${this.basePath}/${userId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get member activity:", error);
      return {
        success: false,
        data: {
          activities: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
          },
        },
        message: "Failed to retrieve member activity",
      };
    }
  }

  /**
   * Get member login history
   */
  async getMemberLogins(
    userId: string,
    tenantId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.set("limit", options.limit.toString());
      if (options?.offset) queryParams.set("offset", options.offset.toString());
      if (options?.startDate) queryParams.set("startDate", options.startDate);
      if (options?.endDate) queryParams.set("endDate", options.endDate);

      const url = `${this.basePath}/${userId}/logins${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url, {
        headers: { "X-Tenant-Id": tenantId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get member logins:", error);
      return {
        success: false,
        data: {
          logins: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
          },
        },
        message: "Failed to retrieve member login history",
      };
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Bulk update member roles
   */
  async bulkUpdateRoles(
    updates: Array<{
      userId: string;
      roles: RoleCode[];
    }>,
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/bulk-update-roles`,
        { updates, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Bulk role update completed",
      };
    } catch (error) {
      console.error("Failed to bulk update roles:", error);
      return {
        success: false,
        data: {
          successful: [],
          failed: updates.map((update) => ({
            userId: update.userId,
            reason: "Bulk update failed",
          })),
        },
        message: "Failed to perform bulk role update",
      };
    }
  }

  /**
   * Bulk update member status
   */
  async bulkUpdateStatus(
    userIds: string[],
    status: "active" | "inactive" | "suspended",
    tenantId: string,
    reason?: string
  ) {
    try {
      const response = await api.post(
        `${this.basePath}/bulk-update-status`,
        { userIds, status, reason },
        {
          headers: { "X-Tenant-Id": tenantId },
        }
      );

      return {
        success: true,
        data: response.data,
        message: `Bulk status update to ${status} completed`,
      };
    } catch (error) {
      console.error("Failed to bulk update status:", error);
      return {
        success: false,
        data: {
          successful: [],
          failed: userIds.map((userId) => ({
            userId,
            reason: "Bulk status update failed",
          })),
        },
        message: "Failed to perform bulk status update",
      };
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const membersService = new MembersService();
export default membersService;

// Export types for external use
export type {
  MemberInfo,
  MemberRoles,
  TenantMember,
  MemberInviteRequest,
  BulkMemberInviteRequest,
  MemberInviteResponse,
  BulkMemberInviteResponse,
  MembersListResponse,
};
