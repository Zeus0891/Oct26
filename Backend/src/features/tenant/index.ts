/**
 * Tenant Module Barrel Export
 *
 * Exports the tenant feature aggregate router for mounting in the application.
 * All tenant-scoped routes are mounted under /api/tenant
 */
export { default, default as tenantRouter } from "./routes/index";
