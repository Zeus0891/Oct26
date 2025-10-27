/**
 * Member Settings Service
 * API client for member settings operations
 * All endpoints are tenant-scoped
 */

import api from "@/lib/api";
import {
  MemberSettings,
  MemberSettingsUpdateDTO,
} from "../types/member-settings.types";

// =============================================================================
// MEMBER SETTINGS SERVICE
// =============================================================================

export class MemberSettingsService {
  /**
   * Get member settings for current user
   */
  static async getSettings(): Promise<MemberSettings> {
    const response = await api.get("/api/rbac/member/settings");
    return response.data.data;
  }

  /**
   * Get member settings for specific member (admin only)
   */
  static async getSettingsForMember(memberId: string): Promise<MemberSettings> {
    const response = await api.get(`/api/rbac/members/${memberId}/settings`);
    return response.data.data;
  }

  /**
   * Update member settings
   */
  static async updateSettings(
    updates: MemberSettingsUpdateDTO
  ): Promise<MemberSettings> {
    const response = await api.patch("/api/rbac/member/settings", updates);
    return response.data.data;
  }

  /**
   * Update settings for specific member (admin only)
   */
  static async updateSettingsForMember(
    memberId: string,
    updates: MemberSettingsUpdateDTO
  ): Promise<MemberSettings> {
    const response = await api.patch(
      `/api/rbac/members/${memberId}/settings`,
      updates
    );
    return response.data.data;
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(): Promise<MemberSettings> {
    const response = await api.post("/api/rbac/member/settings/reset");
    return response.data.data;
  }

  /**
   * Get available timezones
   */
  static async getTimezones(): Promise<
    Array<{ value: string; label: string; offset: string }>
  > {
    const response = await api.get("/api/rbac/member/settings/timezones");
    return response.data.data;
  }

  /**
   * Get available languages
   */
  static async getLanguages(): Promise<
    Array<{ value: string; label: string; nativeName: string }>
  > {
    const response = await api.get("/api/rbac/member/settings/languages");
    return response.data.data;
  }

  /**
   * Export settings
   */
  static async exportSettings(): Promise<string> {
    const response = await api.get("/api/rbac/member/settings/export");
    return response.data.data;
  }

  /**
   * Import settings
   */
  static async importSettings(settingsData: string): Promise<MemberSettings> {
    const response = await api.post("/api/rbac/member/settings/import", {
      data: settingsData,
    });
    return response.data.data;
  }
}

// Export singleton instance
export const memberSettingsService = MemberSettingsService;
