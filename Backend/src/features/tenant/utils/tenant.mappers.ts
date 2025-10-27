/**
 * Tenant Mappers
 * - Prisma → API DTO mapping with redaction and normalization
 */
import type {
  Tenant,
  TenantSettings,
  TenantFeatureFlag,
  TenantMetrics,
  TenantUsageRecord,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

function decimalToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Decimal) return value.toString();
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return value;
  // Fallback: best-effort stringification
  try {
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    // For other uncommon types (symbol, function), do not force stringification
    return null;
  } catch {
    return null;
  }
}

// -------------------------------
// DTO Types
// -------------------------------

export interface TenantDTO {
  id: string;
  name: string;
  slug: string;
  displayName?: string | null;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  status: string;
  region: string;
  tier: string;
  deploymentType: string;
  migrationStatus: string;
  maxUsers?: number | null;
  maxStorage?: number | null;
  billingEmail?: string | null;
  complianceLevel?: string | null;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
}

export interface TenantSettingsDTO {
  id: string;
  tenantId: string;
  status: string;
  displayName?: string | null;
  branding?: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    tagline?: string | null;
  };
  contact?: {
    supportEmail?: string | null;
    supportPhone?: string | null;
    supportUrl?: string | null;
    salesEmail?: string | null;
    salesPhone?: string | null;
  };
  locale?: {
    timezone: string;
    locale: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  notifications?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  policies?: {
    maintenanceMode: boolean;
    publicSignup: boolean;
    ssoEnabled: boolean;
    mfaRequired: boolean;
    apiAccessEnabled: boolean;
  };
  pm?: Record<string, boolean | undefined>;
  templates?: {
    contractTemplateUrl?: string | null;
    termsTemplateUrl?: string | null;
  };
}

export interface TenantFeatureFlagDTO {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  scope: string;
  targetUserIds: string[];
  targetRoles: string[];
  conditions?: unknown;
  startDate?: string | null;
  endDate?: string | null;
  isTemporary: boolean;
  tags: string[];
  environment: string;
  priority: number;
  activeNow: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMetricsDTO {
  id: string;
  metricDate: string; // ISO date string
  metricHour?: number | null;
  activeUsersCount: number;
  totalUsersCount: number;
  newUsersCount: number;
  loginCount: number;
  sessionDuration?: number | null;
  storageUsedMB: number;
  storageQuotaMB?: number | null;
  filesCount: number;
  documentsCount: number;
  apiCallsCount: number;
  apiErrorsCount: number;
  avgResponseTimeMs?: number | null;
  bandwidthUsedMB: number;
  projectsCount: number;
  activeProjectsCount: number;
  tasksCount: number;
  completedTasksCount: number;
  revenueAmount?: string | null;
  billingAmount?: string | null;
  lastBillingCycleUsage?: string | null;
}

export interface TenantUsageRecordDTO {
  id: string;
  metric: string;
  quantity: string; // Decimal as string
  unit: string;
  recordedAt: string;
  resourceId?: string | null;
  resourceType?: string | null;
  userId?: string | null;
  subscriptionId?: string | null;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
}

// -------------------------------
// Mapper Functions
// -------------------------------

export function mapTenantToDTO(t: Tenant): TenantDTO {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    displayName: t.displayName ?? null,
    description: t.description ?? null,
    industry: t.industry ?? null,
    website: t.website ?? null,
    status: String(t.status),
    region: String(t.region),
    tier: String(t.tier),
    deploymentType: String(t.deploymentType),
    migrationStatus: String(t.migrationStatus),
    maxUsers: t.maxUsers ?? null,
    maxStorage: t.maxStorage ?? null,
    billingEmail: t.billingEmail ?? null,
    complianceLevel: t.complianceLevel ?? null,
    encryptionEnabled: !!t.encryptionEnabled,
    backupEnabled: !!t.backupEnabled,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    trialEndsAt: t.trialEndsAt ? t.trialEndsAt.toISOString() : null,
    subscriptionEndsAt: t.subscriptionEndsAt
      ? t.subscriptionEndsAt.toISOString()
      : null,
  };
}

export function mapTenantSettingsToDTO(s: TenantSettings): TenantSettingsDTO {
  return {
    id: s.id,
    tenantId: s.tenantId,
    status: String(s.status),
    displayName: s.displayName ?? null,
    branding: {
      logoUrl: s.logoUrl ?? null,
      faviconUrl: s.faviconUrl ?? null,
      primaryColor: s.primaryColor ?? null,
      secondaryColor: s.secondaryColor ?? null,
      accentColor: s.accentColor ?? null,
      tagline: s.tagline ?? null,
    },
    contact: {
      supportEmail: s.supportEmail ?? null,
      supportPhone: s.supportPhone ?? null,
      supportUrl: s.supportUrl ?? null,
      salesEmail: s.salesEmail ?? null,
      salesPhone: s.salesPhone ?? null,
    },
    locale: {
      timezone: s.timezone,
      locale: s.locale,
      currency: s.currency,
      dateFormat: s.dateFormat,
      timeFormat: s.timeFormat,
    },
    notifications: {
      emailNotifications: s.emailNotifications,
      smsNotifications: s.smsNotifications,
      pushNotifications: s.pushNotifications,
      marketingEmails: s.marketingEmails,
    },
    policies: {
      maintenanceMode: s.maintenanceMode,
      publicSignup: s.publicSignup,
      ssoEnabled: s.ssoEnabled,
      mfaRequired: s.mfaRequired,
      apiAccessEnabled: s.apiAccessEnabled,
    },
    pm: {
      pmCanDeleteEstimate: s.pmCanDeleteEstimate,
      pmCanApproveEstimate: s.pmCanApproveEstimate,
      pmCanConvertEstimate: s.pmCanConvertEstimate,
      pmCanDeleteProject: s.pmCanDeleteProject,
      pmCanDeleteTask: s.pmCanDeleteTask,
      pmCanApproveChangeOrder: s.pmCanApproveChangeOrder,
      pmCanApproveInvoice: s.pmCanApproveInvoice,
      pmCanRejectInvoice: s.pmCanRejectInvoice,
      pmCanApproveTimesheet: s.pmCanApproveTimesheet,
      pmCanApproveExpense: s.pmCanApproveExpense,
      pmCanRejectExpense: s.pmCanRejectExpense,
      pmCanManageMembers: s.pmCanManageMembers,
      pmCanAssignRoles: s.pmCanAssignRoles,
      pmCanTerminateMembers: s.pmCanTerminateMembers,
      pmCanClosePunchListItem: s.pmCanClosePunchListItem,
      pmCanApproveInspection: s.pmCanApproveInspection,
      pmCanPublishDailyLog: s.pmCanPublishDailyLog,
      pmCanPublishReport: s.pmCanPublishReport,
      pmCanAuthorizeInventory: s.pmCanAuthorizeInventory,
      pmCanManageExternalAccess: s.pmCanManageExternalAccess,
      pmCanAccessFinancials: s.pmCanAccessFinancials ?? false,
    },
    templates: {
      contractTemplateUrl: s.contractTemplateUrl ?? null,
      termsTemplateUrl: s.termsTemplateUrl ?? null,
    },
  };
}

export function mapFeatureFlagToDTO(
  f: TenantFeatureFlag
): TenantFeatureFlagDTO {
  const now = new Date();
  const startOk = !f.startDate || f.startDate <= now;
  const endOk = !f.endDate || f.endDate >= now;
  return {
    id: f.id,
    key: f.key,
    name: f.name,
    description: f.description ?? null,
    enabled: f.enabled,
    rolloutPercentage: f.rolloutPercentage,
    scope: String(f.scope),
    targetUserIds: f.targetUserIds,
    targetRoles: f.targetRoles,
    conditions: f.conditions ?? undefined,
    startDate: f.startDate ? f.startDate.toISOString() : null,
    endDate: f.endDate ? f.endDate.toISOString() : null,
    isTemporary: f.isTemporary,
    tags: f.tags,
    environment: f.environment,
    priority: f.priority,
    activeNow: !!f.enabled && startOk && endOk,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

export function mapMetricsToDTO(m: TenantMetrics): TenantMetricsDTO {
  return {
    id: m.id,
    metricDate: new Date(m.metricDate).toISOString().slice(0, 10),
    metricHour: m.metricHour ?? null,
    activeUsersCount: m.activeUsersCount,
    totalUsersCount: m.totalUsersCount,
    newUsersCount: m.newUsersCount,
    loginCount: m.loginCount,
    sessionDuration: m.sessionDuration ?? null,
    storageUsedMB: m.storageUsedMB,
    storageQuotaMB: m.storageQuotaMB ?? null,
    filesCount: m.filesCount,
    documentsCount: m.documentsCount,
    apiCallsCount: m.apiCallsCount,
    apiErrorsCount: m.apiErrorsCount,
    avgResponseTimeMs: m.avgResponseTimeMs ?? null,
    bandwidthUsedMB: m.bandwidthUsedMB,
    projectsCount: m.projectsCount,
    activeProjectsCount: m.activeProjectsCount,
    tasksCount: m.tasksCount,
    completedTasksCount: m.completedTasksCount,
    revenueAmount: decimalToString((m as any).revenueAmount),
    billingAmount: decimalToString((m as any).billingAmount),
    lastBillingCycleUsage: decimalToString((m as any).lastBillingCycleUsage),
  };
}

export function mapUsageRecordToDTO(
  u: TenantUsageRecord
): TenantUsageRecordDTO {
  return {
    id: u.id,
    metric: String(u.metric),
    quantity: decimalToString((u as any).quantity) ?? "0",
    unit: u.unit,
    recordedAt: u.recordedAt.toISOString(),
    resourceId: u.resourceId ?? null,
    resourceType: u.resourceType ?? null,
    userId: u.userId ?? null,
    subscriptionId: u.subscriptionId ?? null,
    billingPeriodStart: u.billingPeriodStart
      ? u.billingPeriodStart.toISOString()
      : null,
    billingPeriodEnd: u.billingPeriodEnd
      ? u.billingPeriodEnd.toISOString()
      : null,
  };
}
