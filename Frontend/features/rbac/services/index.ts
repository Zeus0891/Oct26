/**
 * RBAC Services Index
 * Centralized export for all RBAC services
 * All services are tenant-scoped and require X-Tenant-Id header
 */

// Core RBAC service
export { default as rbacService } from "./rbac.service";

// Specialized services
export { default as rolesService } from "./roles.service";
export { default as permissionsService } from "./permissions.service";
export { default as membersService } from "./members.service";
export { memberSettingsService } from "./member-settings.service";

// Convenience re-exports for the main services
export { rbacService as rbacApi } from "./rbac.service";
export { rolesService as rolesApi } from "./roles.service";
export { permissionsService as permissionsApi } from "./permissions.service";
export { membersService as membersApi } from "./members.service";
export { memberSettingsService as memberSettingsApi } from "./member-settings.service";
