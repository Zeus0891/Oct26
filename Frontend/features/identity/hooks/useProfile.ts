/**
 * useProfile Hook
 * Simplified user profile management using available service methods
 * Provides basic profile operations that align with actual service implementation
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { profileService } from "../services/profile.service";
import { useIdentityStore } from "../stores/identityStore";
import type { UserProfile } from "../services/profile.service";

export interface UseProfileReturn {
  // Data
  profile: UserProfile | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Error handling
  error: string | null;

  // Available operations (matching service methods)
  getProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  // Avatar management
  uploadAvatar: (file: File) => Promise<void>;

  // Utilities
  refreshProfile: () => Promise<void>;

  // Computed values
  fullName: string;
  initials: string;
  isProfileComplete: boolean;
}

// =============================================================================
// CUSTOM HOOK IMPLEMENTATION
// =============================================================================

export const useProfile = (): UseProfileReturn => {
  const { user } = useIdentityStore();

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const fullName = useMemo(() => {
    if (!profile) return "";

    if (profile.displayName) return profile.displayName;

    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : profile.email;
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "";

    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }

    if (profile.displayName) {
      const words = profile.displayName.split(" ").filter(Boolean);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return profile.displayName.substring(0, 2).toUpperCase();
    }

    return profile.email.substring(0, 2).toUpperCase();
  }, [profile]);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;

    return !!(profile.firstName && profile.lastName && profile.emailVerified);
  }, [profile]);

  // =============================================================================
  // CORE PROFILE OPERATIONS
  // =============================================================================

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await profileService.getProfile();

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        throw new Error("Failed to load profile");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      console.error("Profile loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await profileService.updateProfile(data);

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const uploadAvatar = useCallback(
    async (file: File) => {
      setIsUpdating(true);
      setError(null);

      try {
        const request = { file };
        const result = await profileService.uploadAvatar(request);

        if (result.success && result.data) {
          // Update profile with new avatar URL
          const updatedProfile = {
            ...profile!,
            avatarUrl: result.data.avatarUrl,
          };
          setProfile(updatedProfile);
        } else {
          throw new Error("Failed to upload avatar");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload avatar";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [profile]
  );

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const refreshProfile = useCallback(async () => {
    await getProfile();
  }, [getProfile]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load profile on mount
  useEffect(() => {
    if (user && !profile) {
      getProfile();
    }
  }, [user, profile, getProfile]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // Data
    profile,

    // Loading states
    isLoading,
    isUpdating,

    // Error handling
    error,

    // Available operations
    getProfile,
    updateProfile,
    uploadAvatar,

    // Utilities
    refreshProfile,

    // Computed values
    fullName,
    initials,
    isProfileComplete,
  };
};

export default useProfile;
