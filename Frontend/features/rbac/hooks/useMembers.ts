/**
 * useMembers Hook
 * Simplified tenant member management using available service methods
 * Provides basic member operations that align with actual service implementation
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { membersService } from "../services/members.service";
import { useCurrentTenant } from "./useTenantContext";
// RoleCode type may be needed for future enhancements
import type { TenantMember } from "../services/members.service";

// Simple interface matching available methods
export interface UseMembersReturn {
  // Data
  members: TenantMember[];
  selectedMember: TenantMember | null;

  // Loading states
  isLoading: boolean;
  isOperating: boolean;

  // Error handling
  error: string | null;

  // Available operations (matching service methods)
  getMembers: () => Promise<void>;
  getMember: (userId: string) => Promise<TenantMember | null>;
  removeMember: (userId: string, reason?: string) => Promise<void>;
  getMemberStats: () => Promise<void>;

  // Utilities
  refreshMembers: () => Promise<void>;
  selectMember: (member: TenantMember | null) => void;

  // Computed values
  activeMembers: TenantMember[];
  canManageMembers: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useMembers = (): UseMembersReturn => {
  const currentTenant = useCurrentTenant();

  // State management
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.status === "active");
  }, [members]);

  const canManageMembers = useMemo(() => {
    // TODO: Implement proper permission checking from current user context
    return true;
  }, []);

  // =============================================================================
  // CORE MEMBER OPERATIONS
  // =============================================================================

  const getMembers = useCallback(async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await membersService.getMembers(currentTenant.id);

      if (result.success) {
        setMembers(result.data?.members || []);
      } else {
        throw new Error("Failed to load members");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load members";
      setError(errorMessage);
      console.error("Members loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant?.id]);

  const getMember = useCallback(
    async (userId: string): Promise<TenantMember | null> => {
      if (!currentTenant?.id) return null;

      try {
        const result = await membersService.getMember(userId, currentTenant.id);
        return result.success ? result.data : null;
      } catch (err) {
        console.error("Failed to get member:", err);
        return null;
      }
    },
    [currentTenant?.id]
  );

  const removeMember = useCallback(
    async (userId: string, reason?: string) => {
      if (!currentTenant?.id) throw new Error("No tenant selected");

      setIsOperating(true);
      setError(null);

      try {
        const result = await membersService.removeMember(
          userId,
          currentTenant.id,
          reason
        );

        if (result.success) {
          await getMembers(); // Refresh members

          // Clear selected member if it was removed
          if (selectedMember?.userId === userId) {
            setSelectedMember(null);
          }
        } else {
          throw new Error("Failed to remove member");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove member";
        setError(errorMessage);
        throw err;
      } finally {
        setIsOperating(false);
      }
    },
    [currentTenant?.id, selectedMember?.userId, getMembers]
  );

  const getMemberStats = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      const result = await membersService.getMemberStats(currentTenant.id);

      if (result.success) {
        console.log("Member stats:", result.data);
      }
    } catch (err) {
      console.error("Failed to get member stats:", err);
    }
  }, [currentTenant?.id]);

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const refreshMembers = useCallback(async () => {
    await getMembers();
  }, [getMembers]);

  const selectMember = useCallback((member: TenantMember | null) => {
    setSelectedMember(member);
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load members when tenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      getMembers();
    }
  }, [currentTenant?.id, getMembers]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    members,
    selectedMember,

    // Loading states
    isLoading,
    isOperating,

    // Error handling
    error,

    // Available operations
    getMembers,
    getMember,
    removeMember,
    getMemberStats,

    // Utilities
    refreshMembers,
    selectMember,

    // Computed values
    activeMembers,
    canManageMembers,
  };
};

export default useMembers;
