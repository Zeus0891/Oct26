import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Audit Log Entry Interface
 */
interface AuditLogEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  tenantSlug?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  responseData?: any;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  metadata?: Record<string, any>;
  complianceFlags?: string[];
}

/**
 * Audit Configuration
 */
interface AuditConfig {
  includeRequestBody?: boolean;
  includeResponseData?: boolean;
  excludeFields?: string[];
  sensitiveFields?: string[];
  maxBodySize?: number;
  complianceRules?: string[];
}

/**
 * Audit Log Store (In-Memory Implementation)
 * In production, this should be replaced with persistent storage
 */
class AuditLogStore {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 10000;

  addEntry(entry: AuditLogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, write to persistent storage (database, log files, etc.)
    console.log(
      `[AUDIT_LOG] ${entry.action} | ${entry.userEmail || "Anonymous"} | ${
        entry.resource
      }`
    );
  }

  getLogs(
    filter?: Partial<AuditLogEntry>,
    limit: number = 100
  ): AuditLogEntry[] {
    let filteredLogs = this.logs;

    if (filter) {
      filteredLogs = this.logs.filter((log) => {
        return Object.entries(filter).every(([key, value]) => {
          return log[key as keyof AuditLogEntry] === value;
        });
      });
    }

    return filteredLogs.slice(-limit);
  }

  getLogsByUser(userId: string, limit: number = 100): AuditLogEntry[] {
    return this.getLogs({ userId }, limit);
  }

  getLogsByTenant(tenantId: string, limit: number = 100): AuditLogEntry[] {
    return this.getLogs({ tenantId }, limit);
  }

  clear(): void {
    this.logs = [];
  }
}

// Global audit log store
const auditStore = new AuditLogStore();

/**
 * Audit Log Middleware
 *
 * Creates comprehensive audit trail entries for CRUD operations and compliance tracking.
 * Supports GDPR, SOC2, and custom compliance requirements with configurable logging.
 *
 * @param config - Audit logging configuration
 */
export const auditLogMiddleware = (config: AuditConfig = {}) => {
  const {
    includeRequestBody = false,
    includeResponseData = false,
    excludeFields = ["password", "token", "secret", "key"],
    sensitiveFields = ["ssn", "creditCard", "bankAccount", "taxId"],
    maxBodySize = 10000, // 10KB limit
    complianceRules = ["GDPR", "SOC2"],
  } = config;

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const startTime = Date.now();

    // Generate audit entry ID
    const auditId = `audit_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Capture original response methods
    const originalJson = res.json;
    const originalEnd = res.end;
    let responseData: any = null;

    // Override res.json to capture response data
    res.json = function (data: any) {
      if (includeResponseData) {
        responseData = sanitizeData(data, excludeFields, sensitiveFields);
      }
      return originalJson.call(this, data);
    };

    // Override res.end to log the audit entry
    res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Create audit log entry
      const auditEntry: AuditLogEntry = {
        id: auditId,
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId || "unknown",
        userId: req.user?.id,
        userEmail: req.user?.email,
        tenantId: req.tenant?.id,
        tenantSlug: req.tenant?.slug,
        action: determineAction(req.method, req.path, res.statusCode),
        resource: extractResourceFromPath(req.path),
        resourceId: extractResourceId(req.path, req.params),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        metadata: {
          duration: `${duration}ms`,
          contentLength: res.getHeader("content-length"),
          timestamp: endTime,
        },
      };

      // Add request body if configured
      if (includeRequestBody && req.body) {
        const bodySize = JSON.stringify(req.body).length;
        if (bodySize <= maxBodySize) {
          auditEntry.requestBody = sanitizeData(
            req.body,
            excludeFields,
            sensitiveFields
          );
        } else {
          auditEntry.metadata!.requestBodyTruncated = true;
          auditEntry.metadata!.requestBodySize = bodySize;
        }
      }

      // Add response data if captured
      if (responseData) {
        auditEntry.responseData = responseData;
      }

      // Add compliance flags
      auditEntry.complianceFlags = determineComplianceFlags(
        auditEntry,
        req,
        complianceRules
      );

      // Store audit entry
      auditStore.addEntry(auditEntry);

      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  };
};

/**
 * Sanitize data by removing/masking sensitive fields
 */
function sanitizeData(
  data: any,
  excludeFields: string[],
  sensitiveFields: string[]
): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) =>
      sanitizeData(item, excludeFields, sensitiveFields)
    );
  }

  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    const lowerKey = key.toLowerCase();

    // Remove excluded fields completely
    if (excludeFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
      delete sanitized[key];
      continue;
    }

    // Mask sensitive fields
    if (
      sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))
    ) {
      if (typeof value === "string" && value.length > 4) {
        sanitized[key] = "*".repeat(value.length - 4) + value.slice(-4);
      } else {
        sanitized[key] = "[MASKED]";
      }
      continue;
    }

    // Recursively sanitize objects
    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value, excludeFields, sensitiveFields);
    }
  }

  return sanitized;
}

/**
 * Determine audit action based on HTTP method and response
 */
function determineAction(
  method: string,
  path: string,
  statusCode: number
): string {
  const baseAction = method.toUpperCase();

  if (statusCode >= 400) {
    return `${baseAction}_FAILED`;
  }

  switch (method.toUpperCase()) {
    case "GET":
      return "READ";
    case "POST":
      return path.includes("/auth/login") ? "LOGIN" : "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return baseAction;
  }
}

/**
 * Extract resource type from API path
 */
function extractResourceFromPath(path: string): string {
  // Remove /api prefix and extract resource
  const pathParts = path.replace(/^\/api\//, "").split("/");
  return pathParts[0] || "unknown";
}

/**
 * Extract resource ID from path or params
 */
function extractResourceId(path: string, params: any): string | undefined {
  if (params?.id) return params.id;

  // Try to extract UUID-like ID from path
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = path.match(uuidRegex);
  return match ? match[0] : undefined;
}

/**
 * Determine compliance flags based on the audit entry and rules
 */
function determineComplianceFlags(
  entry: AuditLogEntry,
  req: AuthenticatedRequest,
  complianceRules: string[]
): string[] {
  const flags: string[] = [];

  // GDPR compliance flags
  if (complianceRules.includes("GDPR")) {
    // Personal data access
    if (entry.action === "READ" && entry.resource === "users") {
      flags.push("GDPR_DATA_ACCESS");
    }

    // Personal data modification
    if (
      ["CREATE", "UPDATE", "DELETE"].includes(entry.action) &&
      ["users", "profiles", "contacts"].includes(entry.resource)
    ) {
      flags.push("GDPR_DATA_MODIFICATION");
    }

    // Data export requests
    if (entry.path.includes("/export") || entry.path.includes("/download")) {
      flags.push("GDPR_DATA_EXPORT");
    }
  }

  // SOC2 compliance flags
  if (complianceRules.includes("SOC2")) {
    // Administrative access
    if (
      req.user?.roles?.includes("ADMIN") ||
      req.user?.roles?.includes("SYSTEM_ADMIN")
    ) {
      flags.push("SOC2_ADMIN_ACCESS");
    }

    // Failed access attempts
    if (entry.statusCode === 401 || entry.statusCode === 403) {
      flags.push("SOC2_ACCESS_DENIED");
    }

    // Sensitive resource access
    if (
      ["financial", "billing", "payment", "security"].includes(entry.resource)
    ) {
      flags.push("SOC2_SENSITIVE_ACCESS");
    }
  }

  // Financial data flags
  if (["invoice", "payment", "billing", "financial"].includes(entry.resource)) {
    flags.push("FINANCIAL_DATA");
  }

  // Authentication events
  if (entry.action === "LOGIN" || entry.path.includes("/auth/")) {
    flags.push("AUTHENTICATION_EVENT");
  }

  return flags;
}

// =============================================================================
// PRE-CONFIGURED AUDIT MIDDLEWARES
// =============================================================================

/**
 * Basic audit logging (minimal data capture)
 */
export const basicAuditMiddleware = auditLogMiddleware({
  includeRequestBody: false,
  includeResponseData: false,
  complianceRules: ["GDPR", "SOC2"],
});

/**
 * Detailed audit logging (full data capture)
 */
export const detailedAuditMiddleware = auditLogMiddleware({
  includeRequestBody: true,
  includeResponseData: true,
  maxBodySize: 50000, // 50KB
  complianceRules: ["GDPR", "SOC2", "HIPAA", "PCI"],
});

/**
 * Compliance-focused audit logging
 */
export const complianceAuditMiddleware = auditLogMiddleware({
  includeRequestBody: true,
  includeResponseData: false,
  sensitiveFields: [
    "ssn",
    "creditCard",
    "bankAccount",
    "taxId",
    "passport",
    "license",
  ],
  complianceRules: ["GDPR", "SOC2", "CCPA", "HIPAA"],
});

/**
 * Financial audit logging
 */
export const financialAuditMiddleware = auditLogMiddleware({
  includeRequestBody: true,
  includeResponseData: true,
  sensitiveFields: ["accountNumber", "routingNumber", "creditCard", "cvv"],
  complianceRules: ["SOC2", "PCI", "SOX"],
});

// =============================================================================
// AUDIT LOG API ENDPOINTS
// =============================================================================

/**
 * Get audit logs with filtering
 */
export const getAuditLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { userId, tenantId, resource, action, limit = 100 } = req.query;

  const filter: Partial<AuditLogEntry> = {};
  if (userId) filter.userId = userId as string;
  if (tenantId) filter.tenantId = tenantId as string;
  if (resource) filter.resource = resource as string;
  if (action) filter.action = action as string;

  const logs = auditStore.getLogs(filter, parseInt(limit as string));

  res.json({
    logs,
    total: logs.length,
    filter,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get audit logs for current user
 */
export const getUserAuditLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 100;
  const logs = auditStore.getLogsByUser(req.user.id, limit);

  res.json({
    logs,
    userId: req.user.id,
    total: logs.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clear audit logs (admin only)
 */
export const clearAuditLogs = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.roles?.includes("SYSTEM_ADMIN")) {
    res.status(403).json({ message: "System admin access required" });
    return;
  }

  auditStore.clear();

  res.json({
    message: "Audit logs cleared",
    clearedBy: req.user.email,
    timestamp: new Date().toISOString(),
  });
};

export default auditLogMiddleware;
