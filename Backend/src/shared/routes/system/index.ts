/**
 * System Routes Index
 *
 * Exports all system infrastructure routing including health monitoring,
 * metrics, and system status endpoints.
 *
 * @module SystemRoutesIndex
 * @category Shared Routes - System Infrastructure
 * @description System routing exports
 */

export {
  HealthRoutes,
  HealthRouteConfig,
  HealthStatus,
  HealthCheckResult,
  SystemMetrics,
} from "./health.routes";
