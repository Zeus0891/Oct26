/**
 * Tenant Constants
 * - Route bases, sorting allowlists, limits
 */

export const TENANT_BASE_PATH = "/api/tenant" as const;

export const TenantRoutes = {
  // Base Tenant CRUD (admin or internal orchestration)
  root: "/",
  byId: "/:id",
  create: "/",
  update: "/:id",
  delete: "/:id",
  deactivate: "/:id/deactivate",
  settings: "/settings",
  featureFlags: "/feature-flags",
  metrics: "/metrics",
  metricsExport: "/metrics/export",
  usage: "/usage",
  usageExport: "/usage/export",
  numbering: "/number-sequences",
  documents: "/document-groups",
  templates: "/templates",
  audit: "/audit",
  events: "/events",
  lifecycle: "/lifecycle",
} as const;

// Sorting allowlists to prevent SQL injection and undefined ordering
export const SortAllowlist = {
  metrics: [
    "metricDate",
    "metricHour",
    "activeUsersCount",
    "apiCallsCount",
    "avgResponseTimeMs",
    "createdAt",
    "updatedAt",
  ],
  usage: ["recordedAt", "metric", "quantity", "createdAt", "updatedAt"],
  featureFlags: ["key", "enabled", "priority", "createdAt", "updatedAt"],
} as const;

export const DefaultPagination = {
  limit: 10,
  maxLimit: 100,
} as const;
