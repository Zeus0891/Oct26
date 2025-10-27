// ============================================================================
// MEMBER SETTINGS TYPES
// ============================================================================
// Types for Member Settings based on schema.prisma MemberSettings model
// ============================================================================

export interface MemberSettings {
  id: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  deletedAt?: string;
  memberId: string;

  // Theme and UI preferences
  theme: "SYSTEM" | "LIGHT" | "DARK";
  primaryColor?: string;
  fontSize: "small" | "medium" | "large";
  density: "compact" | "comfortable" | "spacious";

  // Localization
  language?: string;
  locale?: string;
  timezone?: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  numberFormat: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnAssignment: boolean;
  notifyOnMention: boolean;
  notifyOnDeadline: boolean;
  notifyOnApproval: boolean;
  notifyOnComment: boolean;
  notifyOnStatusChange: boolean;

  // Dashboard and Layout
  dashboardLayout?: Record<string, unknown>;
  sidebarCollapsed: boolean;
  quickActions: string[];
  favoriteViews: string[];

  // Working hours
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays: string[];

  // Behavior
  autoSaveInterval: number;
  profileVisibility: "PRIVATE" | "TEAM" | "PUBLIC";
  activityVisibility: "PRIVATE" | "TEAM" | "PUBLIC";
  allowAnalytics: boolean;
  keyboardShortcuts: boolean;
  animations: boolean;
  soundEffects: boolean;
  betaFeatures: boolean;

  // Custom settings
  customSettings?: Record<string, unknown>;
}

export interface MemberSettingsUpdateDTO {
  theme?: "SYSTEM" | "LIGHT" | "DARK";
  primaryColor?: string;
  fontSize?: "small" | "medium" | "large";
  density?: "compact" | "comfortable" | "spacious";
  language?: string;
  locale?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: "12h" | "24h";
  numberFormat?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  inAppNotifications?: boolean;
  notifyOnAssignment?: boolean;
  notifyOnMention?: boolean;
  notifyOnDeadline?: boolean;
  notifyOnApproval?: boolean;
  notifyOnComment?: boolean;
  notifyOnStatusChange?: boolean;
  dashboardLayout?: Record<string, unknown>;
  sidebarCollapsed?: boolean;
  quickActions?: string[];
  favoriteViews?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string[];
  autoSaveInterval?: number;
  profileVisibility?: "PRIVATE" | "TEAM" | "PUBLIC";
  activityVisibility?: "PRIVATE" | "TEAM" | "PUBLIC";
  allowAnalytics?: boolean;
  keyboardShortcuts?: boolean;
  animations?: boolean;
  soundEffects?: boolean;
  betaFeatures?: boolean;
  customSettings?: Record<string, unknown>;
}

export interface MemberSettingsContextType {
  settings: MemberSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: MemberSettingsUpdateDTO) => Promise<void>;
  resetSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}
