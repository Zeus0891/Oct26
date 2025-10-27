/**
 * Core RBAC Types (Compatibility Layer)
 *
 * Re-exports and minimal shims to satisfy legacy imports.
 */
import type { RoleType } from "@prisma/client";
import type {
  PermissionBase as Permission,
  RBACRole,
} from "../security/rbac.types";

// Minimal RBAC context used by some modules
export interface RBACContext {
  tenantId: string;
  memberId?: string;
  roles: string[];
  permissions?: string[];
}

export type { RoleType, Permission, RBACRole };
