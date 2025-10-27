/**
 * RBAC Module Index
 * Main export point for the RBAC module
 * Provides all RBAC functionality with type-safe permissions and roles
 */

// =============================================================================
// CORE EXPORTS
// =============================================================================

// Auto-generated types from RBAC.schema.v7.yml
export * from "./types/rbac.generated";

// Hooks - main RBAC hooks
export { useRbac, useRoleCheck } from "./hooks";

// Components - RBAC guards and providers
export * from "./components/guards";
export * from "./components/providers";

// Validators - RBAC validation schemas
export * from "./validators";

// Services - RBAC API clients
export * from "./services";

// Utils - RBAC utility functions
export * from "./utils";

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

// Main hooks (already exported above)

// Main components
export { TenantGuard } from "./components/guards/TenantGuard";
export { PermissionGuard } from "./components/guards/PermissionGuard";
export { ConditionalGuard } from "./components/guards/ConditionalGuard";
export { RBACProvider } from "./components/providers/RBACProvider";
export {
  ProjectAccess,
  InvoiceAccess,
  TaskAccess,
  UserAccess,
  MemberAccess,
} from "./components/guards/PermissionGuard";
export {
  BusinessHoursGuard,
  FeatureToggleGuard,
  OwnershipGuard,
} from "./components/guards/ConditionalGuard";

// Debug component for development
export { RBACDebugPanel } from "./components/providers/RBACProvider";

// =============================================================================
// MODULE METADATA
// =============================================================================

export const RBAC_MODULE_VERSION = "1.0.0";
export const RBAC_MODULE_NAME = "Frontend RBAC Module";

// =============================================================================
// USAGE EXAMPLES AS CONSTANTS
// =============================================================================

export const RBAC_USAGE_EXAMPLES = {
  basicRoleGuard: `
    <RoleGuard roles="ADMIN">
      <AdminPanel />
    </RoleGuard>
  `,

  basicPermissionGuard: `
    <PermissionGuard permissions="Project.create">
      <CreateProjectButton />
    </PermissionGuard>
  `,

  multipleRoles: `
    <RoleGuard roles={['ADMIN', 'PROJECT_MANAGER']}>
      <ManagementSection />
    </RoleGuard>
  `,

  multiplePermissions: `
    <PermissionGuard permissions={['Invoice.read', 'Payment.read']}>
      <FinancialDashboard />
    </PermissionGuard>
  `,

  conditionalGuard: `
    <ConditionalGuard
      roles="PROJECT_MANAGER"
      permissions="Project.update"
      logic="AND"
      condition={() => isBusinessHours()}
    >
      <ProjectEditor />
    </ConditionalGuard>
  `,

  tenantGuard: `
    <TenantGuard requireActiveTenant>
      <TenantDashboard />
    </TenantGuard>
  `,

  fullProvider: `
    <RBACProvider>
      <TenantGuard>
        <RoleGuard roles="ADMIN">
          <AdminDashboard />
        </RoleGuard>
      </TenantGuard>
    </RBACProvider>
  `,
} as const;

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type RBACModuleExports = {
  version: typeof RBAC_MODULE_VERSION;
  name: typeof RBAC_MODULE_NAME;
  examples: typeof RBAC_USAGE_EXAMPLES;
};

// =============================================================================
// DEFAULT EXPORT (Module Configuration)
// =============================================================================

const RBACModule = {
  version: RBAC_MODULE_VERSION,
  name: RBAC_MODULE_NAME,
  examples: RBAC_USAGE_EXAMPLES,

  // Core components
  components: {
    TenantGuard: () => import("./components/guards/TenantGuard"),
    PermissionGuard: () => import("./components/guards/PermissionGuard"),
    ConditionalGuard: () => import("./components/guards/ConditionalGuard"),
    RBACProvider: () => import("./components/providers/RBACProvider"),
  },

  // Core hooks
  hooks: {
    useRbac: () => import("./hooks/useRbac"),
  },

  // Generated types
  types: () => import("./types/rbac.generated"),

  // Generation metadata
  generation: () => import("./types/rbac.generation.json"),
};

export default RBACModule;
