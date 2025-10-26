import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Data Classification Types
 */
export enum DataClassification {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  CONFIDENTIAL = "CONFIDENTIAL",
  RESTRICTED = "RESTRICTED",
}

/**
 * Field Classification Configuration
 */
interface FieldClassification {
  field: string;
  classification: DataClassification;
  roles?: string[]; // Roles that can access this field
  permissions?: string[]; // Specific permissions required
}

/**
 * Response Classification Configuration
 */
interface ClassificationConfig {
  entity: string;
  fields: FieldClassification[];
}

/**
 * Data Classification Middleware
 *
 * Enforces data classification policies on API responses based on user roles and permissions.
 * Automatically filters sensitive fields based on classification levels and user access rights.
 *
 * @param config - Classification configuration for the specific entity
 */
export const dataClassificationMiddleware = (config: ClassificationConfig) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Store original res.json to intercept responses
      const originalJson = res.json;

      res.json = function (data: any) {
        const processedData = classifyAndFilterData(data, config, req);
        return originalJson.call(this, processedData);
      };

      console.log(
        `[DATA_CLASSIFICATION] Applied classification rules for ${config.entity}`
      );
      next();
    } catch (error) {
      console.error("[DATA_CLASSIFICATION] Classification error:", error);
      next(error);
    }
  };
};

/**
 * Process and filter data based on classification rules
 */
function classifyAndFilterData(
  data: any,
  config: ClassificationConfig,
  req: AuthenticatedRequest
): any {
  if (!data) return data;

  const userRoles = req.user?.roles || [];
  const userPermissions = req.user?.permissions || [];

  // Process arrays
  if (Array.isArray(data)) {
    return data.map((item) =>
      filterItem(item, config, userRoles, userPermissions)
    );
  }

  // Process single object
  if (typeof data === "object" && data !== null) {
    // Check if this is a paginated response
    if (data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: any) =>
          filterItem(item, config, userRoles, userPermissions)
        ),
      };
    }

    return filterItem(data, config, userRoles, userPermissions);
  }

  return data;
}

/**
 * Filter individual item based on classification rules
 */
function filterItem(
  item: any,
  config: ClassificationConfig,
  userRoles: string[],
  userPermissions: string[]
): any {
  if (!item || typeof item !== "object") return item;

  const filtered = { ...item };

  // Apply field-level classification
  config.fields.forEach((fieldConfig) => {
    const { field, classification, roles, permissions } = fieldConfig;

    if (filtered.hasOwnProperty(field)) {
      const hasAccess = checkFieldAccess(
        classification,
        userRoles,
        userPermissions,
        roles,
        permissions
      );

      if (!hasAccess) {
        // Remove or redact the field
        if (classification === DataClassification.CONFIDENTIAL) {
          filtered[field] = "[REDACTED]";
        } else if (classification === DataClassification.RESTRICTED) {
          delete filtered[field];
        } else {
          filtered[field] = "[CLASSIFIED]";
        }
      }
    }
  });

  return filtered;
}

/**
 * Check if user has access to a specific field based on classification
 */
function checkFieldAccess(
  classification: DataClassification,
  userRoles: string[],
  userPermissions: string[],
  requiredRoles?: string[],
  requiredPermissions?: string[]
): boolean {
  // Super admin always has access
  if (userRoles.includes("SYSTEM_ADMIN")) {
    return true;
  }

  // Check classification level access
  switch (classification) {
    case DataClassification.PUBLIC:
      return true;

    case DataClassification.INTERNAL:
      // Internal data requires authenticated user
      return userRoles.length > 0;

    case DataClassification.CONFIDENTIAL:
      // Confidential requires admin role or specific permissions
      if (userRoles.includes("ADMIN")) return true;
      break;

    case DataClassification.RESTRICTED:
      // Restricted requires system admin only
      return userRoles.includes("SYSTEM_ADMIN");
  }

  // Check specific role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );
    if (!hasRequiredRole) return false;
  }

  // Check specific permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
    if (!hasRequiredPermission) return false;
  }

  return true;
}

// =============================================================================
// PRE-CONFIGURED CLASSIFICATIONS FOR COMMON ENTITIES
// =============================================================================

/**
 * User data classification
 */
export const userDataClassification: ClassificationConfig = {
  entity: "User",
  fields: [
    { field: "email", classification: DataClassification.INTERNAL },
    { field: "phone", classification: DataClassification.CONFIDENTIAL },
    { field: "ssn", classification: DataClassification.RESTRICTED },
    {
      field: "salary",
      classification: DataClassification.CONFIDENTIAL,
      roles: ["ADMIN", "HR_MANAGER"],
    },
    { field: "createdAt", classification: DataClassification.INTERNAL },
    { field: "updatedAt", classification: DataClassification.INTERNAL },
  ],
};

/**
 * Project data classification
 */
export const projectDataClassification: ClassificationConfig = {
  entity: "Project",
  fields: [
    {
      field: "budget",
      classification: DataClassification.CONFIDENTIAL,
      roles: ["ADMIN", "PROJECT_MANAGER"],
    },
    {
      field: "profit",
      classification: DataClassification.CONFIDENTIAL,
      roles: ["ADMIN"],
    },
    { field: "internalNotes", classification: DataClassification.INTERNAL },
    { field: "clientNotes", classification: DataClassification.PUBLIC },
  ],
};

/**
 * Financial data classification
 */
export const financialDataClassification: ClassificationConfig = {
  entity: "Financial",
  fields: [
    { field: "amount", classification: DataClassification.CONFIDENTIAL },
    { field: "bankAccount", classification: DataClassification.RESTRICTED },
    { field: "taxId", classification: DataClassification.RESTRICTED },
    { field: "creditCard", classification: DataClassification.RESTRICTED },
  ],
};

// =============================================================================
// HELPER FUNCTIONS FOR COMMON USE CASES
// =============================================================================

/**
 * Apply user data classification
 */
export const classifyUserData = () =>
  dataClassificationMiddleware(userDataClassification);

/**
 * Apply project data classification
 */
export const classifyProjectData = () =>
  dataClassificationMiddleware(projectDataClassification);

/**
 * Apply financial data classification
 */
export const classifyFinancialData = () =>
  dataClassificationMiddleware(financialDataClassification);

/**
 * Create custom classification middleware
 */
export const customClassification = (
  entity: string,
  fields: FieldClassification[]
) => dataClassificationMiddleware({ entity, fields });

/**
 * Classification audit middleware
 * Logs what data was classified/redacted for audit purposes
 */
export const classificationAuditMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json;

  res.json = function (data: any) {
    // Log classification actions for audit
    console.log(
      `[DATA_CLASSIFICATION_AUDIT] ${
        req.user?.email || "Anonymous"
      } accessed classified data`,
      {
        correlationId: req.correlationId,
        endpoint: req.path,
        method: req.method,
        userRoles: req.user?.roles,
        timestamp: new Date().toISOString(),
      }
    );

    return originalJson.call(this, data);
  };

  next();
};
