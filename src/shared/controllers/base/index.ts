/**
 * Base Controllers Index
 *
 * Exports all base controller classes for shared infrastructure.
 * These controllers provide reusable patterns for common operations.
 *
 * @module BaseControllers
 * @category Shared Controllers - Base Infrastructure
 * @description Base controller exports
 * @version 1.0.0
 */

// Base controller infrastructure
export {
  BaseController,
  ControllerError,
  ValidationError,
  AuthenticatedRequest,
} from "./base.controller";

// CRUD operations controller
export { CrudController } from "./crud.controller";

// Advanced search controller
export { SearchController } from "./search.controller";

// Data export controller
export { ExportController } from "./export.controller";

// Bulk operations controller
export { BulkController } from "./bulk.controller";

// Health monitoring controller
export { HealthController } from "../system/health.controller";

/**
 * Common controller configuration interface
 */
export interface ControllerConfig {
  /** Enable audit logging */
  enableAudit?: boolean;
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Enable request validation */
  enableValidation?: boolean;
  /** Enable rate limiting */
  enableRateLimit?: boolean;
  /** Default pagination size */
  defaultPageSize?: number;
  /** Maximum pagination size */
  maxPageSize?: number;
}
