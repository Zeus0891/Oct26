import { Request } from "express";

/**
 * Extended Express Request interface with enterprise security context
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
  tenant?: {
    id: string;
    slug: string;
    name: string;
    status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
    settings?: Record<string, any>;
  };
  rbac?: {
    currentTenant: string;
    currentUser: string;
    roles: string[];
    hasPermission: (permission: string) => boolean;
  };
  rlsContext?: {
    tenantId: string;
    userId: string;
    roles: string[];
    setJwtClaims: () => Record<string, any>;
  };
  correlationId?: string;
  startTime?: number;
}

/**
 * JWT Payload structure for our authentication system
 */
export interface JwtPayload {
  sub: string; // User ID
  tenant_id: string;
  roles: string[];
  permissions: string[];
  email: string;
  iat: number;
  exp: number;
}

/**
 * Tenant context for RLS integration
 */
export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  settings: Record<string, any>;
}

/**
 * Error response structure
 */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  correlationId?: string;
  details?: Record<string, any>;
}
