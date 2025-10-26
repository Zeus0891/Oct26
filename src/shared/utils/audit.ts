/**
 * Legacy Audit API Compatibility
 *
 * Provides backward-compatible exports for the AuditUtils class
 * to maintain existing import statements throughout the codebase.
 */

import {
  AuditUtils,
  AuditEventType,
  AuditSeverity,
} from "./security/audit.util";
import { v4 as uuidv4 } from "uuid";

// Export the class for new usage
export { AuditUtils };

// Backward compatibility exports
export const generateAuditCorrelationId = (): string => {
  return uuidv4();
};

// Export instance for easy access
export const auditUtils = new AuditUtils();

// Re-export types and enums
export * from "./security/audit.util";
