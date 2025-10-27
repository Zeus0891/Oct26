/**
 * Tenant Filters & Query Builders
 * - Centralized safe builders for where/order/pagination
 */
import { SortAllowlist } from "./tenant.constants";
import type { MetricsQueryInput } from "../validators/metrics.validators";
import type { UsageQueryInput } from "../validators/usage.validators";

export type SortOrder = "asc" | "desc";

/**
 * Build safe orderBy object constrained by allowlist
 */
export function buildOrderBy(
  allowlist: readonly string[],
  sortBy?: string,
  sortOrder: SortOrder = "desc"
): Record<string, SortOrder> | undefined {
  if (!sortBy || !allowlist.includes(sortBy)) return undefined;
  return { [sortBy]: sortOrder };
}

/**
 * Offset pagination conversion
 */
export function toOffsetPagination(p: { page?: number; limit?: number }) {
  const page = Math.max(1, p.page ?? 1);
  const take = Math.min(100, Math.max(1, p.limit ?? 10));
  const skip = (page - 1) * take;
  return { skip, take };
}

/**
 * Metrics where builder
 */
export function buildMetricsWhere(tenantId: string, q: MetricsQueryInput) {
  const where: any = { tenantId };
  if (q.from || q.to) {
    where.metricDate = {} as any;
    if (q.from) where.metricDate.gte = new Date(q.from);
    if (q.to) where.metricDate.lte = new Date(q.to);
  }
  if (typeof q.hour === "number") {
    where.metricHour = q.hour;
  }
  // Soft-delete default exclusion handled at service level if needed
  return where;
}

/**
 * Metrics orderBy builder
 */
export function buildMetricsOrderBy(sortBy?: string, sortOrder?: SortOrder) {
  return buildOrderBy(SortAllowlist.metrics, sortBy, sortOrder);
}

/**
 * Usage where builder
 */
export function buildUsageWhere(tenantId: string, q: UsageQueryInput) {
  const where: any = { tenantId };
  if (q.metric) where.metric = q.metric;
  if (q.recordedAfter || q.recordedBefore) {
    where.recordedAt = {} as any;
    if (q.recordedAfter) where.recordedAt.gte = new Date(q.recordedAfter);
    if (q.recordedBefore) where.recordedAt.lte = new Date(q.recordedBefore);
  }
  if (typeof q.processed === "boolean") {
    where.processed = q.processed;
  }
  return where;
}

/**
 * Usage orderBy builder
 */
export function buildUsageOrderBy(sortBy?: string, sortOrder?: SortOrder) {
  return buildOrderBy(SortAllowlist.usage, sortBy, sortOrder);
}

/**
 * Feature flags orderBy builder
 */
export function buildFeatureFlagsOrderBy(
  sortBy?: string,
  sortOrder?: SortOrder
) {
  return buildOrderBy(SortAllowlist.featureFlags, sortBy, sortOrder);
}
