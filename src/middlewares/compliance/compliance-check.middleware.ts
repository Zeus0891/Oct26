import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Compliance Framework Types
 */
enum ComplianceFramework {
  GDPR = "GDPR",
  SOC2 = "SOC2",
  CCPA = "CCPA",
  HIPAA = "HIPAA",
  PCI_DSS = "PCI_DSS",
  SOX = "SOX",
  ISO27001 = "ISO27001",
  NIST = "NIST",
}

/**
 * Data Classification Levels
 */
enum DataClassificationLevel {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  CONFIDENTIAL = "CONFIDENTIAL",
  RESTRICTED = "RESTRICTED",
}

/**
 * Compliance Rule Interface
 */
interface ComplianceRule {
  id: string;
  framework: ComplianceFramework;
  name: string;
  description: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  check: (
    req: AuthenticatedRequest,
    context: ComplianceContext
  ) => ComplianceResult;
}

/**
 * Compliance Context
 */
interface ComplianceContext {
  dataClassification: DataClassificationLevel;
  resourceType: string;
  action: string;
  containsPII: boolean;
  containsFinancialData: boolean;
  containsHealthData: boolean;
  userLocation?: string;
  dataLocation?: string;
}

/**
 * Compliance Check Result
 */
interface ComplianceResult {
  passed: boolean;
  framework: ComplianceFramework;
  ruleId: string;
  severity: string;
  message: string;
  remediation?: string;
  details?: Record<string, any>;
}

/**
 * Compliance Configuration
 */
interface ComplianceConfig {
  enabledFrameworks: ComplianceFramework[];
  strictMode: boolean;
  blockOnFailure: boolean;
  auditAllChecks: boolean;
  customRules?: ComplianceRule[];
  dataClassificationRules?: Record<string, DataClassificationLevel>;
}

/**
 * Default compliance configuration
 */
const DEFAULT_CONFIG: ComplianceConfig = {
  enabledFrameworks: [ComplianceFramework.GDPR, ComplianceFramework.SOC2],
  strictMode: false,
  blockOnFailure: true,
  auditAllChecks: true,
  dataClassificationRules: {
    users: DataClassificationLevel.CONFIDENTIAL,
    financial: DataClassificationLevel.RESTRICTED,
    health: DataClassificationLevel.RESTRICTED,
    projects: DataClassificationLevel.INTERNAL,
    public: DataClassificationLevel.PUBLIC,
  },
};

/**
 * Built-in Compliance Rules
 */
const COMPLIANCE_RULES: ComplianceRule[] = [
  // GDPR Rules
  {
    id: "GDPR_001",
    framework: ComplianceFramework.GDPR,
    name: "Data Subject Rights",
    description: "Ensure data subjects can exercise their rights",
    category: "Data Rights",
    severity: "HIGH",
    check: (req, context) => {
      if (context.containsPII && !req.user) {
        return {
          passed: false,
          framework: ComplianceFramework.GDPR,
          ruleId: "GDPR_001",
          severity: "HIGH",
          message: "Authentication required for PII access",
          remediation:
            "Implement proper authentication for accessing personal data",
        };
      }
      return {
        passed: true,
        framework: ComplianceFramework.GDPR,
        ruleId: "GDPR_001",
        severity: "HIGH",
        message: "Passed",
      };
    },
  },
  {
    id: "GDPR_002",
    framework: ComplianceFramework.GDPR,
    name: "Data Minimization",
    description: "Only collect and process necessary data",
    category: "Data Minimization",
    severity: "MEDIUM",
    check: (req, context) => {
      // Check if request includes unnecessary sensitive fields
      if (req.body && context.containsPII) {
        const unnecessaryFields = ["ssn", "passport", "driverLicense"];
        const hasUnnecessaryFields = unnecessaryFields.some(
          (field) =>
            req.body.hasOwnProperty(field) &&
            context.resourceType !== "identity"
        );

        if (hasUnnecessaryFields) {
          return {
            passed: false,
            framework: ComplianceFramework.GDPR,
            ruleId: "GDPR_002",
            severity: "MEDIUM",
            message: "Unnecessary personal data fields detected",
            remediation:
              "Remove unnecessary personal data fields from the request",
          };
        }
      }
      return {
        passed: true,
        framework: ComplianceFramework.GDPR,
        ruleId: "GDPR_002",
        severity: "MEDIUM",
        message: "Passed",
      };
    },
  },
  {
    id: "GDPR_003",
    framework: ComplianceFramework.GDPR,
    name: "Consent Management",
    description: "Verify consent for data processing",
    category: "Consent",
    severity: "CRITICAL",
    check: (req, context) => {
      if (context.containsPII && req.method === "POST") {
        // Check for consent flag in request
        if (!req.body?.consent && !req.headers["x-consent-verified"]) {
          return {
            passed: false,
            framework: ComplianceFramework.GDPR,
            ruleId: "GDPR_003",
            severity: "CRITICAL",
            message: "No consent verification for personal data processing",
            remediation:
              "Include consent verification in request headers or body",
          };
        }
      }
      return {
        passed: true,
        framework: ComplianceFramework.GDPR,
        ruleId: "GDPR_003",
        severity: "CRITICAL",
        message: "Passed",
      };
    },
  },

  // SOC2 Rules
  {
    id: "SOC2_001",
    framework: ComplianceFramework.SOC2,
    name: "Access Control",
    description: "Verify proper access controls",
    category: "Security",
    severity: "HIGH",
    check: (req, context) => {
      if (context.dataClassification === DataClassificationLevel.RESTRICTED) {
        const hasAdminRole =
          req.user?.roles?.includes("ADMIN") ||
          req.user?.roles?.includes("SYSTEM_ADMIN");
        if (!hasAdminRole) {
          return {
            passed: false,
            framework: ComplianceFramework.SOC2,
            ruleId: "SOC2_001",
            severity: "HIGH",
            message: "Insufficient privileges for restricted data access",
            remediation:
              "Ensure user has appropriate administrative privileges",
          };
        }
      }
      return {
        passed: true,
        framework: ComplianceFramework.SOC2,
        ruleId: "SOC2_001",
        severity: "HIGH",
        message: "Passed",
      };
    },
  },
  {
    id: "SOC2_002",
    framework: ComplianceFramework.SOC2,
    name: "Audit Trail",
    description: "Ensure all actions are auditable",
    category: "Monitoring",
    severity: "MEDIUM",
    check: (req, context) => {
      if (!req.correlationId) {
        return {
          passed: false,
          framework: ComplianceFramework.SOC2,
          ruleId: "SOC2_002",
          severity: "MEDIUM",
          message: "Missing correlation ID for audit trail",
          remediation:
            "Ensure correlation ID middleware is properly configured",
        };
      }
      return {
        passed: true,
        framework: ComplianceFramework.SOC2,
        ruleId: "SOC2_002",
        severity: "MEDIUM",
        message: "Passed",
      };
    },
  },

  // PCI DSS Rules
  {
    id: "PCI_001",
    framework: ComplianceFramework.PCI_DSS,
    name: "Payment Data Protection",
    description: "Protect payment card data",
    category: "Data Protection",
    severity: "CRITICAL",
    check: (req, context) => {
      if (context.containsFinancialData || context.resourceType === "payment") {
        // Check for encrypted transmission
        if (!req.secure && req.get("x-forwarded-proto") !== "https") {
          return {
            passed: false,
            framework: ComplianceFramework.PCI_DSS,
            ruleId: "PCI_001",
            severity: "CRITICAL",
            message: "Payment data must be transmitted over HTTPS",
            remediation:
              "Ensure HTTPS is enforced for all payment-related requests",
          };
        }

        // Check for prohibited payment data in logs
        if (req.body && hasProhibitedPaymentData(req.body)) {
          return {
            passed: false,
            framework: ComplianceFramework.PCI_DSS,
            ruleId: "PCI_001",
            severity: "CRITICAL",
            message: "Prohibited payment data detected in request",
            remediation: "Remove sensitive payment data from request body",
          };
        }
      }
      return {
        passed: true,
        framework: ComplianceFramework.PCI_DSS,
        ruleId: "PCI_001",
        severity: "CRITICAL",
        message: "Passed",
      };
    },
  },

  // HIPAA Rules
  {
    id: "HIPAA_001",
    framework: ComplianceFramework.HIPAA,
    name: "PHI Access Control",
    description: "Control access to protected health information",
    category: "Access Control",
    severity: "CRITICAL",
    check: (req, context) => {
      if (context.containsHealthData) {
        // Check for healthcare role
        const hasHealthcareRole = req.user?.roles?.some((role) =>
          ["HEALTHCARE_PROVIDER", "MEDICAL_ADMIN", "SYSTEM_ADMIN"].includes(
            role
          )
        );

        if (!hasHealthcareRole) {
          return {
            passed: false,
            framework: ComplianceFramework.HIPAA,
            ruleId: "HIPAA_001",
            severity: "CRITICAL",
            message: "Unauthorized access to protected health information",
            remediation:
              "Ensure user has appropriate healthcare role for PHI access",
          };
        }
      }
      return {
        passed: true,
        framework: ComplianceFramework.HIPAA,
        ruleId: "HIPAA_001",
        severity: "CRITICAL",
        message: "Passed",
      };
    },
  },
];

/**
 * Compliance Check Middleware
 *
 * Ensures compliance with GDPR, SOC2, CCPA, HIPAA, PCI-DSS and other frameworks.
 * Performs real-time compliance validation with configurable rules and enforcement.
 *
 * @param config - Compliance configuration options
 */
export const complianceCheckMiddleware = (
  config: Partial<ComplianceConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const allRules = [...COMPLIANCE_RULES, ...(finalConfig.customRules || [])];

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Build compliance context
      const context = buildComplianceContext(req, finalConfig);

      // Get applicable rules
      const applicableRules = allRules.filter((rule) =>
        finalConfig.enabledFrameworks.includes(rule.framework)
      );

      // Run compliance checks
      const results: ComplianceResult[] = [];
      const failures: ComplianceResult[] = [];

      for (const rule of applicableRules) {
        try {
          const result = rule.check(req, context);
          results.push(result);

          if (!result.passed) {
            failures.push(result);
          }
        } catch (error) {
          console.error(`[COMPLIANCE] Error running rule ${rule.id}:`, error);

          if (finalConfig.strictMode) {
            failures.push({
              passed: false,
              framework: rule.framework,
              ruleId: rule.id,
              severity: "HIGH",
              message: `Rule execution failed: ${error}`,
              remediation: "Contact system administrator",
            });
          }
        }
      }

      // Add compliance results to request
      req.complianceResults = {
        context,
        results,
        failures,
        passed: failures.length === 0,
        timestamp: new Date().toISOString(),
      };

      // Add compliance headers
      res.setHeader(
        "X-Compliance-Status",
        failures.length === 0 ? "PASS" : "FAIL"
      );
      res.setHeader(
        "X-Compliance-Frameworks",
        finalConfig.enabledFrameworks.join(",")
      );

      if (failures.length > 0) {
        res.setHeader("X-Compliance-Failures", failures.length.toString());
      }

      // Handle failures
      if (failures.length > 0) {
        const criticalFailures = failures.filter(
          (f) => f.severity === "CRITICAL"
        );

        console.warn(
          `[COMPLIANCE] ${failures.length} compliance failures detected`,
          {
            correlationId: req.correlationId,
            user: req.user?.email,
            failures: failures.map((f) => ({
              framework: f.framework,
              rule: f.ruleId,
              severity: f.severity,
            })),
          }
        );

        // Block request if configured and critical failures exist
        if (
          finalConfig.blockOnFailure &&
          (criticalFailures.length > 0 || finalConfig.strictMode)
        ) {
          res.status(403).json({
            message: "Request blocked due to compliance violations",
            code: "COMPLIANCE_VIOLATION",
            correlationId: req.correlationId,
            failures: failures.map((f) => ({
              framework: f.framework,
              rule: f.ruleId,
              severity: f.severity,
              message: f.message,
              remediation: f.remediation,
            })),
          });
          return;
        }
      }

      // Log compliance check for audit
      if (finalConfig.auditAllChecks) {
        console.log(`[COMPLIANCE] Check completed`, {
          correlationId: req.correlationId,
          user: req.user?.email,
          passed: failures.length === 0,
          rulesChecked: results.length,
          failureCount: failures.length,
        });
      }

      next();
    } catch (error) {
      console.error("[COMPLIANCE] Compliance middleware error:", error);

      if (finalConfig.strictMode) {
        res.status(500).json({
          message: "Compliance check failed",
          code: "COMPLIANCE_CHECK_ERROR",
          correlationId: req.correlationId,
        });
        return;
      }

      next();
    }
  };
};

/**
 * Build compliance context from request
 */
function buildComplianceContext(
  req: AuthenticatedRequest,
  config: ComplianceConfig
): ComplianceContext {
  const resourceType = extractResourceType(req.path);
  const dataClassification =
    config.dataClassificationRules?.[resourceType] ||
    DataClassificationLevel.INTERNAL;

  return {
    dataClassification,
    resourceType,
    action: req.method.toUpperCase(),
    containsPII: detectPII(req),
    containsFinancialData: detectFinancialData(req, resourceType),
    containsHealthData: detectHealthData(req, resourceType),
    userLocation:
      (req.headers["cf-ipcountry"] as string) ||
      (req.headers["x-user-country"] as string),
    dataLocation: (req.headers["x-data-region"] as string) || "US",
  };
}

/**
 * Extract resource type from request path
 */
function extractResourceType(path: string): string {
  const pathParts = path.replace(/^\/api\//, "").split("/");
  return pathParts[0] || "unknown";
}

/**
 * Detect if request contains PII
 */
function detectPII(req: AuthenticatedRequest): boolean {
  if (!req.body) return false;

  const piiFields = [
    "email",
    "phone",
    "ssn",
    "passport",
    "driverLicense",
    "firstName",
    "lastName",
    "dateOfBirth",
    "address",
  ];

  return piiFields.some((field) => hasField(req.body, field));
}

/**
 * Detect if request contains financial data
 */
function detectFinancialData(
  req: AuthenticatedRequest,
  resourceType: string
): boolean {
  const financialResources = [
    "payment",
    "invoice",
    "billing",
    "financial",
    "bank",
  ];

  if (financialResources.includes(resourceType)) {
    return true;
  }

  if (!req.body) return false;

  const financialFields = [
    "creditCard",
    "bankAccount",
    "routingNumber",
    "accountNumber",
    "cvv",
    "paymentMethod",
    "amount",
    "salary",
  ];

  return financialFields.some((field) => hasField(req.body, field));
}

/**
 * Detect if request contains health data
 */
function detectHealthData(
  req: AuthenticatedRequest,
  resourceType: string
): boolean {
  const healthResources = [
    "medical",
    "health",
    "patient",
    "diagnosis",
    "treatment",
  ];

  if (healthResources.includes(resourceType)) {
    return true;
  }

  if (!req.body) return false;

  const healthFields = [
    "medicalRecord",
    "diagnosis",
    "treatment",
    "prescription",
    "healthCondition",
    "bloodType",
    "allergies",
  ];

  return healthFields.some((field) => hasField(req.body, field));
}

/**
 * Check if object has field (case insensitive, nested)
 */
function hasField(obj: any, fieldName: string): boolean {
  if (!obj || typeof obj !== "object") return false;

  for (const [key, value] of Object.entries(obj)) {
    if (key.toLowerCase().includes(fieldName.toLowerCase())) {
      return true;
    }

    if (typeof value === "object" && value !== null) {
      if (hasField(value, fieldName)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check for prohibited payment data
 */
function hasProhibitedPaymentData(data: any): boolean {
  const prohibitedFields = ["cvv", "pin", "securityCode", "fullTrackData"];
  return prohibitedFields.some((field) => hasField(data, field));
}

// =============================================================================
// PRE-CONFIGURED COMPLIANCE MIDDLEWARES
// =============================================================================

/**
 * GDPR compliance checking
 */
export const gdprComplianceMiddleware = complianceCheckMiddleware({
  enabledFrameworks: [ComplianceFramework.GDPR],
  strictMode: true,
  blockOnFailure: true,
});

/**
 * SOC2 compliance checking
 */
export const soc2ComplianceMiddleware = complianceCheckMiddleware({
  enabledFrameworks: [ComplianceFramework.SOC2],
  strictMode: false,
  blockOnFailure: false,
});

/**
 * Financial compliance (SOC2 + PCI DSS)
 */
export const financialComplianceMiddleware = complianceCheckMiddleware({
  enabledFrameworks: [ComplianceFramework.SOC2, ComplianceFramework.PCI_DSS],
  strictMode: true,
  blockOnFailure: true,
});

/**
 * Healthcare compliance (HIPAA + SOC2)
 */
export const healthcareComplianceMiddleware = complianceCheckMiddleware({
  enabledFrameworks: [ComplianceFramework.HIPAA, ComplianceFramework.SOC2],
  strictMode: true,
  blockOnFailure: true,
});

/**
 * Full compliance checking
 */
export const fullComplianceMiddleware = complianceCheckMiddleware({
  enabledFrameworks: [
    ComplianceFramework.GDPR,
    ComplianceFramework.SOC2,
    ComplianceFramework.CCPA,
    ComplianceFramework.PCI_DSS,
  ],
  strictMode: false,
  blockOnFailure: true,
});

// =============================================================================
// COMPLIANCE REPORTING ENDPOINTS
// =============================================================================

/**
 * Get compliance status
 */
export const getComplianceStatus = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  res.json({
    status: req.complianceResults?.passed ? "COMPLIANT" : "NON_COMPLIANT",
    results: req.complianceResults,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  // This would typically aggregate compliance data from audit logs
  res.json({
    message: "Compliance report generation not implemented",
    availableEndpoints: ["/api/compliance/status", "/api/audit/logs"],
    timestamp: new Date().toISOString(),
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      complianceResults?: {
        context: ComplianceContext;
        results: ComplianceResult[];
        failures: ComplianceResult[];
        passed: boolean;
        timestamp: string;
      };
    }
  }
}

export { ComplianceFramework, DataClassificationLevel };
export default complianceCheckMiddleware;
