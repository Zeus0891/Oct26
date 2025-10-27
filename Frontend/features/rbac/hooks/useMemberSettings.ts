/**
 * useMemberSettings Hook
 * Hook for managing member settings with optimistic updates and caching
 */

import { useState, useEffect, useCallback } from "react";
import { memberSettingsService } from "../services/member-settings.service";
import {
  MemberSettings,
  MemberSettingsUpdateDTO,
} from "../types/member-settings.types";

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UseMemberSettingsReturn {
  // State
  settings: MemberSettings | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  updateSettings: (updates: MemberSettingsUpdateDTO) => Promise<void>;
  resetSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  clearError: () => void;

  // Quick actions
  toggleTheme: () => Promise<void>;
  toggleNotifications: (type: string) => Promise<void>;
  updateWorkingHours: (start: string, end: string) => Promise<void>;

  // Utilities
  isDarkMode: boolean;
  hasUnsavedChanges: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useMemberSettings(memberId?: string): UseMemberSettingsReturn {
  const [settings, setSettings] = useState<MemberSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const isDarkMode =
    settings?.theme === "DARK" ||
    (settings?.theme === "SYSTEM" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // =============================================================================
  // LOAD SETTINGS
  // =============================================================================

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = memberId
        ? await memberSettingsService.getSettingsForMember(memberId)
        : await memberSettingsService.getSettings();

      setSettings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  // =============================================================================
  // UPDATE SETTINGS
  // =============================================================================

  const updateSettings = useCallback(
    async (updates: MemberSettingsUpdateDTO) => {
      if (!settings) return;

      try {
        setIsUpdating(true);
        setError(null);

        // Optimistic update
        const optimisticSettings = { ...settings, ...updates };
        setSettings(optimisticSettings);
        setHasUnsavedChanges(false);

        // API call
        const result = memberId
          ? await memberSettingsService.updateSettingsForMember(
              memberId,
              updates
            )
          : await memberSettingsService.updateSettings(updates);

        setSettings(result);
      } catch (err) {
        // Revert optimistic update on error
        setSettings(settings);
        setError(
          err instanceof Error ? err.message : "Failed to update settings"
        );
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [settings, memberId]
  );

  // =============================================================================
  // RESET SETTINGS
  // =============================================================================

  const resetSettings = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);

      const result = await memberSettingsService.resetSettings();
      setSettings(result);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset settings");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // =============================================================================
  // REFRESH SETTINGS
  // =============================================================================

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // =============================================================================
  // CLEAR ERROR
  // =============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =============================================================================
  // QUICK ACTIONS
  // =============================================================================

  const toggleTheme = useCallback(async () => {
    if (!settings) return;

    const themes: Array<"LIGHT" | "DARK" | "SYSTEM"> = [
      "LIGHT",
      "DARK",
      "SYSTEM",
    ];
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    await updateSettings({ theme: nextTheme });
  }, [settings, updateSettings]);

  const toggleNotifications = useCallback(
    async (type: string) => {
      if (!settings) return;

      const notificationTypes: Record<string, keyof MemberSettings> = {
        email: "emailNotifications",
        push: "pushNotifications",
        sms: "smsNotifications",
        inApp: "inAppNotifications",
        assignment: "notifyOnAssignment",
        mention: "notifyOnMention",
        deadline: "notifyOnDeadline",
        approval: "notifyOnApproval",
        comment: "notifyOnComment",
        statusChange: "notifyOnStatusChange",
      };

      const key = notificationTypes[type];
      if (key && typeof settings[key] === "boolean") {
        await updateSettings({
          [key]: !settings[key],
        } as MemberSettingsUpdateDTO);
      }
    },
    [settings, updateSettings]
  );

  const updateWorkingHours = useCallback(
    async (start: string, end: string) => {
      await updateSettings({
        workingHoursStart: start,
        workingHoursEnd: end,
      });
    },
    [updateSettings]
  );

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // =============================================================================
  // RETURN VALUE
  // =============================================================================

  return {
    // State
    settings,
    isLoading,
    isUpdating,
    error,

    // Actions
    updateSettings,
    resetSettings,
    refreshSettings,
    clearError,

    // Quick actions
    toggleTheme,
    toggleNotifications,
    updateWorkingHours,

    // Utilities
    isDarkMode,
    hasUnsavedChanges,
  };
}
