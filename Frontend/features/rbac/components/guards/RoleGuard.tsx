import React from "react";
import { useRbac } from "../../hooks";
import { RoleGuardProps } from "../../types/rbac.generated";

// Extended props to add requireAll functionality
interface ExtendedRoleGuardProps extends RoleGuardProps {
  requireAll?: boolean;
}

/**
 * RoleGuard Component
 *
 * Protects UI elements based on user roles using auto-generated types.
 * Extends RoleGuardProps with optional requireAll functionality.
 *
 * @param requireAll - If true, user must have ALL specified roles (AND logic)
 *                     If false/undefined, user must have ANY specified role (OR logic)
 *
 * @example
 * ```tsx
 * // OR logic (default) - user needs ADMIN OR PROJECT_MANAGER
 * <RoleGuard roles={["ADMIN", "PROJECT_MANAGER"]}>
 *   <ManagementTools />
 * </RoleGuard>
 *
 * // AND logic - user needs BOTH ADMIN AND PROJECT_MANAGER
 * <RoleGuard roles={["ADMIN", "PROJECT_MANAGER"]} requireAll={true}>
 *   <SuperAdminTools />
 * </RoleGuard>
 * ```
 */
export const RoleGuard: React.FC<ExtendedRoleGuardProps> = ({
  roles,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasRole, hasAllRoles } = useRbac();

  // Handle single role or array of roles with requireAll logic
  let hasRequiredRole: boolean;

  if (Array.isArray(roles)) {
    hasRequiredRole = requireAll ? hasAllRoles(roles) : hasRole(roles);
  } else {
    // Single role always passes regardless of requireAll
    hasRequiredRole = hasRole([roles]);
  }

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
