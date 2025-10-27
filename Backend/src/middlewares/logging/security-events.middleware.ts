import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Security Event Types
 */
enum SecurityEventType {
  FAILED_AUTHENTICATION = "FAILED_AUTHENTICATION",
  SUCCESSFUL_AUTHENTICATION = "SUCCESSFUL_AUTHENTICATION",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  SUSPICIOUS_ACCESS_PATTERN = "SUSPICIOUS_ACCESS_PATTERN",
  BRUTE_FORCE_ATTEMPT = "BRUTE_FORCE_ATTEMPT",
  INVALID_TOKEN = "INVALID_TOKEN",
  EXPIRED_TOKEN = "EXPIRED_TOKEN",
  PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION",
  UNAUTHORIZED_API_ACCESS = "UNAUTHORIZED_API_ACCESS",
  SUSPICIOUS_PAYLOAD = "SUSPICIOUS_PAYLOAD",
  IP_BLACKLIST_HIT = "IP_BLACKLIST_HIT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  CSRF_ATTEMPT = "CSRF_ATTEMPT",
  UNUSUAL_USER_AGENT = "UNUSUAL_USER_AGENT",
  GEOGRAPHIC_ANOMALY = "GEOGRAPHIC_ANOMALY",
  TIME_BASED_ANOMALY = "TIME_BASED_ANOMALY",
  DATA_EXFILTRATION_ATTEMPT = "DATA_EXFILTRATION_ATTEMPT",
  COMPLIANCE_VIOLATION = "COMPLIANCE_VIOLATION",
}

/**
 * Security Event Severity
 */
enum SecurityEventSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Security Event Entry
 */
interface SecurityEventEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  ip: string;
  userAgent?: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  country?: string;
  city?: string;
  details: {
    reason?: string;
    attemptedAction?: string;
    resource?: string;
    requiredPermission?: string;
    providedCredentials?: string;
    suspiciousPatterns?: string[];
    threatIndicators?: string[];
    remediationSuggested?: string;
    blockRecommended?: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * Threat Detection Rules
 */
interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  enabled: boolean;
  check: (
    req: AuthenticatedRequest,
    context: SecurityContext
  ) => SecurityThreatResult;
}

/**
 * Security Context
 */
interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  requestCount: number;
  failedAttempts: number;
  lastActivity: Date;
  knownGoodIPs: Set<string>;
  suspiciousIPs: Set<string>;
  blacklistedIPs: Set<string>;
}

/**
 * Security Threat Result
 */
interface SecurityThreatResult {
  detected: boolean;
  confidence: number; // 0-1
  indicators: string[];
  recommendAction: "LOG" | "WARN" | "BLOCK" | "ALERT";
}

/**
 * Security Events Configuration
 */
interface SecurityEventsConfig {
  enabled: boolean;
  enableThreatDetection: boolean;
  enableBehaviorAnalysis: boolean;
  enableGeographicTracking: boolean;
  enableRealTimeBlocking: boolean;
  logAllEvents: boolean;
  logFailedAuthOnly: boolean;
  alertThresholds: {
    failedLogins: number;
    rateLimitHits: number;
    suspiciousPatterns: number;
  };
  timeWindows: {
    bruteForceDetection: number;
    anomalyDetection: number;
    patternAnalysis: number;
  };
  trustedNetworks: string[];
  highRiskCountries: string[];
  suspiciousUserAgents: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SecurityEventsConfig = {
  enabled: true,
  enableThreatDetection: true,
  enableBehaviorAnalysis: true,
  enableGeographicTracking: true,
  enableRealTimeBlocking: false,
  logAllEvents: false,
  logFailedAuthOnly: false,
  alertThresholds: {
    failedLogins: 5,
    rateLimitHits: 10,
    suspiciousPatterns: 3,
  },
  timeWindows: {
    bruteForceDetection: 300000, // 5 minutes
    anomalyDetection: 900000, // 15 minutes
    patternAnalysis: 3600000, // 1 hour
  },
  trustedNetworks: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  highRiskCountries: ["CN", "RU", "KP", "IR"],
  suspiciousUserAgents: [
    "sqlmap",
    "nikto",
    "nmap",
    "wget",
    "curl/7",
    "python-requests",
    "masscan",
    "zmap",
    "nessus",
    "openvas",
    "burp",
  ],
};

/**
 * Security Events Store
 */
class SecurityEventsStore {
  private events: SecurityEventEntry[] = [];
  private ipTracking: Map<string, SecurityContext> = new Map();
  private userTracking: Map<string, SecurityContext> = new Map();
  private maxEvents: number = 50000;

  addEvent(event: SecurityEventEntry): void {
    this.events.push(event);

    // Keep only the last maxEvents entries
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Update tracking contexts
    this.updateSecurityContext(event);
  }

  private updateSecurityContext(event: SecurityEventEntry): void {
    // Update IP tracking
    const ipContext =
      this.ipTracking.get(event.ip) || this.createSecurityContext();
    ipContext.requestCount++;
    if (event.eventType === SecurityEventType.FAILED_AUTHENTICATION) {
      ipContext.failedAttempts++;
    }
    ipContext.lastActivity = new Date();
    this.ipTracking.set(event.ip, ipContext);

    // Update user tracking
    if (event.userId) {
      const userContext =
        this.userTracking.get(event.userId) || this.createSecurityContext();
      userContext.requestCount++;
      if (event.eventType === SecurityEventType.FAILED_AUTHENTICATION) {
        userContext.failedAttempts++;
      }
      userContext.lastActivity = new Date();
      this.userTracking.set(event.userId, userContext);
    }
  }

  private createSecurityContext(): SecurityContext {
    return {
      ipAddress: "",
      userAgent: "",
      requestCount: 0,
      failedAttempts: 0,
      lastActivity: new Date(),
      knownGoodIPs: new Set(),
      suspiciousIPs: new Set(),
      blacklistedIPs: new Set(),
    };
  }

  getEvents(
    filter?: Partial<SecurityEventEntry>,
    limit: number = 100
  ): SecurityEventEntry[] {
    let filteredEvents = this.events;

    if (filter) {
      filteredEvents = this.events.filter((event) => {
        return Object.entries(filter).every(([key, value]) => {
          return event[key as keyof SecurityEventEntry] === value;
        });
      });
    }

    return filteredEvents.slice(-limit);
  }

  getHighSeverityEvents(): SecurityEventEntry[] {
    return this.events.filter(
      (event) =>
        event.severity === SecurityEventSeverity.HIGH ||
        event.severity === SecurityEventSeverity.CRITICAL
    );
  }

  getSecurityContext(ip: string): SecurityContext | undefined {
    return this.ipTracking.get(ip);
  }

  getUserSecurityContext(userId: string): SecurityContext | undefined {
    return this.userTracking.get(userId);
  }

  clear(): void {
    this.events = [];
    this.ipTracking.clear();
    this.userTracking.clear();
  }
}

// Global security events store
const securityEventsStore = new SecurityEventsStore();

/**
 * Built-in Threat Detection Rules
 */
const THREAT_DETECTION_RULES: ThreatDetectionRule[] = [
  {
    id: "BRUTE_FORCE",
    name: "Brute Force Detection",
    description: "Detects multiple failed authentication attempts from same IP",
    eventType: SecurityEventType.BRUTE_FORCE_ATTEMPT,
    severity: SecurityEventSeverity.HIGH,
    enabled: true,
    check: (req, context) => {
      const threshold = 5;
      const detected = context.failedAttempts >= threshold;
      return {
        detected,
        confidence: Math.min(context.failedAttempts / threshold, 1),
        indicators: [`${context.failedAttempts} failed attempts`],
        recommendAction: detected ? "BLOCK" : "LOG",
      };
    },
  },
  {
    id: "SQL_INJECTION",
    name: "SQL Injection Detection",
    description: "Detects potential SQL injection patterns in requests",
    eventType: SecurityEventType.SQL_INJECTION_ATTEMPT,
    severity: SecurityEventSeverity.CRITICAL,
    enabled: true,
    check: (req, context) => {
      const sqlPatterns = [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b)/i,
        /(\bOR\s+1=1\b|\bAND\s+1=1\b)/i,
        /('|\"|;|--|\*|\/\*|\*\/)/,
        /(\bxp_cmdshell\b|\bsp_executesql\b)/i,
      ];

      const requestString = JSON.stringify({
        path: req.path,
        query: req.query,
        body: req.body,
      });

      const detectedPatterns = sqlPatterns.filter((pattern) =>
        pattern.test(requestString)
      );
      const detected = detectedPatterns.length > 0;

      return {
        detected,
        confidence: detected ? 0.8 : 0,
        indicators: detectedPatterns.map((p) => `SQL pattern: ${p.source}`),
        recommendAction: detected ? "BLOCK" : "LOG",
      };
    },
  },
  {
    id: "XSS_DETECTION",
    name: "Cross-Site Scripting Detection",
    description: "Detects potential XSS attack patterns",
    eventType: SecurityEventType.XSS_ATTEMPT,
    severity: SecurityEventSeverity.HIGH,
    enabled: true,
    check: (req, context) => {
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
      ];

      const requestString = JSON.stringify({
        query: req.query,
        body: req.body,
      });

      const detectedPatterns = xssPatterns.filter((pattern) =>
        pattern.test(requestString)
      );
      const detected = detectedPatterns.length > 0;

      return {
        detected,
        confidence: detected ? 0.7 : 0,
        indicators: detectedPatterns.map((p) => `XSS pattern detected`),
        recommendAction: detected ? "BLOCK" : "LOG",
      };
    },
  },
  {
    id: "SUSPICIOUS_USER_AGENT",
    name: "Suspicious User Agent Detection",
    description: "Detects known malicious or suspicious user agents",
    eventType: SecurityEventType.UNUSUAL_USER_AGENT,
    severity: SecurityEventSeverity.MEDIUM,
    enabled: true,
    check: (req, context) => {
      const userAgent = req.headers["user-agent"]?.toLowerCase() || "";
      const suspiciousPatterns = DEFAULT_CONFIG.suspiciousUserAgents;

      const detected = suspiciousPatterns.some((pattern) =>
        userAgent.includes(pattern.toLowerCase())
      );

      return {
        detected,
        confidence: detected ? 0.9 : 0,
        indicators: detected ? [`Suspicious user agent: ${userAgent}`] : [],
        recommendAction: detected ? "WARN" : "LOG",
      };
    },
  },
  {
    id: "GEOGRAPHIC_ANOMALY",
    name: "Geographic Anomaly Detection",
    description: "Detects access from high-risk geographic locations",
    eventType: SecurityEventType.GEOGRAPHIC_ANOMALY,
    severity: SecurityEventSeverity.MEDIUM,
    enabled: true,
    check: (req, context) => {
      const country = req.headers["cf-ipcountry"] as string;
      const detected =
        country && DEFAULT_CONFIG.highRiskCountries.includes(country);

      return {
        detected: !!detected,
        confidence: detected ? 0.6 : 0,
        indicators: detected ? [`High-risk country: ${country}`] : [],
        recommendAction: detected ? "WARN" : "LOG",
      };
    },
  },
];

/**
 * Security Events Middleware
 *
 * Logs security events including failed authentications, permission denials,
 * and suspicious access patterns. Provides real-time threat detection and analysis.
 *
 * @param config - Security events configuration options
 */
export const securityEventsMiddleware = (
  config: Partial<SecurityEventsConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!finalConfig.enabled) {
      next();
      return;
    }

    // Attach security event logger to request
    req.securityEventLogger = {
      logEvent: (eventType: SecurityEventType, details: any) => {
        logSecurityEvent(eventType, details, req, finalConfig);
      },
      logFailedAuth: (reason: string, details?: any) => {
        logSecurityEvent(
          SecurityEventType.FAILED_AUTHENTICATION,
          {
            reason,
            ...details,
          },
          req,
          finalConfig
        );
      },
      logPermissionDenied: (
        resource: string,
        permission: string,
        details?: any
      ) => {
        logSecurityEvent(
          SecurityEventType.PERMISSION_DENIED,
          {
            resource,
            requiredPermission: permission,
            ...details,
          },
          req,
          finalConfig
        );
      },
      logSuspiciousActivity: (indicators: string[], details?: any) => {
        logSecurityEvent(
          SecurityEventType.SUSPICIOUS_ACCESS_PATTERN,
          {
            suspiciousPatterns: indicators,
            ...details,
          },
          req,
          finalConfig
        );
      },
    };

    // Run threat detection if enabled
    if (finalConfig.enableThreatDetection) {
      runThreatDetection(req, finalConfig);
    }

    // Set up response monitoring
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
      // Log failed authentication responses
      if (res.statusCode === 401 && finalConfig.logFailedAuthOnly) {
        logSecurityEvent(
          SecurityEventType.FAILED_AUTHENTICATION,
          {
            reason: "Invalid credentials or token",
            endpoint: req.path,
            method: req.method,
          },
          req,
          finalConfig
        );
      }

      // Log permission denied responses
      if (res.statusCode === 403) {
        logSecurityEvent(
          SecurityEventType.PERMISSION_DENIED,
          {
            reason: "Insufficient permissions",
            endpoint: req.path,
            method: req.method,
          },
          req,
          finalConfig
        );
      }

      return originalEnd.call(this, chunk, encoding, cb);
    };

    console.log(
      `[SECURITY_EVENTS] Security monitoring enabled for ${req.method} ${req.path}`
    );
    next();
  };
};

/**
 * Log security event
 */
function logSecurityEvent(
  eventType: SecurityEventType,
  details: any,
  req: AuthenticatedRequest,
  config: SecurityEventsConfig
): void {
  const event: SecurityEventEntry = {
    id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId || "unknown",
    eventType,
    severity: determineEventSeverity(eventType),
    message: generateEventMessage(eventType, details),
    userId: req.user?.id,
    userEmail: req.user?.email,
    tenantId: req.tenant?.id,
    ip: getClientIP(req),
    userAgent: req.headers["user-agent"],
    endpoint: req.path,
    method: req.method,
    statusCode: undefined, // Will be set when response completes
    country: req.headers["cf-ipcountry"] as string,
    city: req.headers["cf-ipcity"] as string,
    details,
    metadata: {
      timestamp: Date.now(),
      requestId: req.correlationId,
      sessionId: extractSessionId(req),
    },
  };

  // Store event
  securityEventsStore.addEvent(event);

  // Log to console based on severity
  logEventToConsole(event, config);

  // Handle high severity events
  if (
    event.severity === SecurityEventSeverity.CRITICAL ||
    event.severity === SecurityEventSeverity.HIGH
  ) {
    handleHighSeverityEvent(event, config);
  }
}

/**
 * Run threat detection rules
 */
function runThreatDetection(
  req: AuthenticatedRequest,
  config: SecurityEventsConfig
): void {
  const ip = getClientIP(req);
  const ipContext = securityEventsStore.getSecurityContext(ip) || {
    ipAddress: ip,
    userAgent: req.headers["user-agent"] || "",
    requestCount: 0,
    failedAttempts: 0,
    lastActivity: new Date(),
    knownGoodIPs: new Set(),
    suspiciousIPs: new Set(),
    blacklistedIPs: new Set(),
  };

  // Run enabled threat detection rules
  for (const rule of THREAT_DETECTION_RULES) {
    if (!rule.enabled) continue;

    try {
      const result = rule.check(req, ipContext);

      if (result.detected) {
        logSecurityEvent(
          rule.eventType,
          {
            threatRule: rule.id,
            confidence: result.confidence,
            indicators: result.indicators,
            recommendedAction: result.recommendAction,
          },
          req,
          config
        );

        // Handle blocking recommendation
        if (
          result.recommendAction === "BLOCK" &&
          config.enableRealTimeBlocking
        ) {
          // This would integrate with a WAF or firewall to block the IP
          console.error(
            `[SECURITY_EVENTS] BLOCKING IP ${ip} due to ${rule.name}`
          );
        }
      }
    } catch (error) {
      console.error(
        `[SECURITY_EVENTS] Error running threat rule ${rule.id}:`,
        error
      );
    }
  }
}

/**
 * Determine event severity based on type
 */
function determineEventSeverity(
  eventType: SecurityEventType
): SecurityEventSeverity {
  const severityMap: Record<SecurityEventType, SecurityEventSeverity> = {
    [SecurityEventType.FAILED_AUTHENTICATION]: SecurityEventSeverity.LOW,
    [SecurityEventType.SUCCESSFUL_AUTHENTICATION]: SecurityEventSeverity.LOW,
    [SecurityEventType.PERMISSION_DENIED]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.SUSPICIOUS_ACCESS_PATTERN]: SecurityEventSeverity.HIGH,
    [SecurityEventType.BRUTE_FORCE_ATTEMPT]: SecurityEventSeverity.HIGH,
    [SecurityEventType.INVALID_TOKEN]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.EXPIRED_TOKEN]: SecurityEventSeverity.LOW,
    [SecurityEventType.PRIVILEGE_ESCALATION]: SecurityEventSeverity.CRITICAL,
    [SecurityEventType.UNAUTHORIZED_API_ACCESS]: SecurityEventSeverity.HIGH,
    [SecurityEventType.SUSPICIOUS_PAYLOAD]: SecurityEventSeverity.HIGH,
    [SecurityEventType.IP_BLACKLIST_HIT]: SecurityEventSeverity.HIGH,
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: SecurityEventSeverity.CRITICAL,
    [SecurityEventType.XSS_ATTEMPT]: SecurityEventSeverity.HIGH,
    [SecurityEventType.CSRF_ATTEMPT]: SecurityEventSeverity.HIGH,
    [SecurityEventType.UNUSUAL_USER_AGENT]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.GEOGRAPHIC_ANOMALY]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.TIME_BASED_ANOMALY]: SecurityEventSeverity.MEDIUM,
    [SecurityEventType.DATA_EXFILTRATION_ATTEMPT]:
      SecurityEventSeverity.CRITICAL,
    [SecurityEventType.COMPLIANCE_VIOLATION]: SecurityEventSeverity.HIGH,
  };

  return severityMap[eventType] || SecurityEventSeverity.MEDIUM;
}

/**
 * Generate human-readable event message
 */
function generateEventMessage(
  eventType: SecurityEventType,
  details: any
): string {
  switch (eventType) {
    case SecurityEventType.FAILED_AUTHENTICATION:
      return `Failed authentication attempt: ${
        details.reason || "Invalid credentials"
      }`;
    case SecurityEventType.PERMISSION_DENIED:
      return `Permission denied for resource '${details.resource}' - required: ${details.requiredPermission}`;
    case SecurityEventType.BRUTE_FORCE_ATTEMPT:
      return `Brute force attack detected with ${
        details.indicators?.join(", ") || "multiple failed attempts"
      }`;
    case SecurityEventType.SQL_INJECTION_ATTEMPT:
      return `SQL injection attempt detected: ${
        details.indicators?.join(", ") || "malicious patterns found"
      }`;
    case SecurityEventType.SUSPICIOUS_ACCESS_PATTERN:
      return `Suspicious access pattern detected: ${
        details.suspiciousPatterns?.join(", ") || "anomalous behavior"
      }`;
    default:
      return `Security event: ${eventType}`;
  }
}

/**
 * Log event to console based on configuration
 */
function logEventToConsole(
  event: SecurityEventEntry,
  config: SecurityEventsConfig
): void {
  const logLevel =
    event.severity === SecurityEventSeverity.CRITICAL
      ? "error"
      : event.severity === SecurityEventSeverity.HIGH
        ? "warn"
        : "log";

  const logMessage = `[SECURITY_EVENTS] ${event.severity} | ${
    event.eventType
  } | ${event.ip} | ${event.userEmail || "anonymous"} | ${event.message}`;

  console[logLevel](logMessage);

  // Log detailed information for high severity events
  if (
    event.severity === SecurityEventSeverity.HIGH ||
    event.severity === SecurityEventSeverity.CRITICAL
  ) {
    console[logLevel](
      `[SECURITY_EVENTS] Details:`,
      JSON.stringify(event.details, null, 2)
    );
  }
}

/**
 * Handle high severity security events
 */
function handleHighSeverityEvent(
  event: SecurityEventEntry,
  config: SecurityEventsConfig
): void {
  // This would integrate with external alerting systems
  console.error(`[SECURITY_EVENTS] HIGH SEVERITY EVENT DETECTED:`, {
    eventType: event.eventType,
    severity: event.severity,
    ip: event.ip,
    user: event.userEmail,
    message: event.message,
    correlationId: event.correlationId,
  });

  // TODO: Integrate with:
  // - SIEM systems
  // - Slack/Discord notifications
  // - Email alerts
  // - PagerDuty
  // - External security services
}

/**
 * Get client IP address (same as request logger)
 */
function getClientIP(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"] as string;

  return (
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    (forwardedFor && forwardedFor.split(",")[0]?.trim()) ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

/**
 * Extract session ID from request (same as request logger)
 */
function extractSessionId(req: Request): string | undefined {
  const sessionHeader = req.headers["x-session-id"] as string;
  if (sessionHeader) return sessionHeader;

  const cookies = req.headers.cookie;
  if (cookies) {
    const sessionMatch = cookies.match(/sessionid=([^;]+)/);
    if (sessionMatch) return sessionMatch[1];
  }

  return undefined;
}

// =============================================================================
// PRE-CONFIGURED SECURITY EVENT LOGGERS
// =============================================================================

/**
 * Production security events (balanced monitoring)
 */
export const productionSecurityEvents = securityEventsMiddleware({
  enableThreatDetection: true,
  enableRealTimeBlocking: false,
  logAllEvents: false,
  logFailedAuthOnly: true,
});

/**
 * Development security events (detailed monitoring)
 */
export const developmentSecurityEvents = securityEventsMiddleware({
  enableThreatDetection: true,
  enableBehaviorAnalysis: true,
  enableRealTimeBlocking: false,
  logAllEvents: true,
});

/**
 * High security environment (maximum protection)
 */
export const highSecurityEvents = securityEventsMiddleware({
  enableThreatDetection: true,
  enableBehaviorAnalysis: true,
  enableGeographicTracking: true,
  enableRealTimeBlocking: true,
  logAllEvents: true,
  alertThresholds: {
    failedLogins: 3,
    rateLimitHits: 5,
    suspiciousPatterns: 2,
  },
});

// =============================================================================
// SECURITY EVENTS API ENDPOINTS
// =============================================================================

/**
 * Get security events
 */
export const getSecurityEvents = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { eventType, severity, ip, userId, limit = 100 } = req.query;

  const filter: Partial<SecurityEventEntry> = {};
  if (eventType) filter.eventType = eventType as SecurityEventType;
  if (severity) filter.severity = severity as SecurityEventSeverity;
  if (ip) filter.ip = ip as string;
  if (userId) filter.userId = userId as string;

  const events = securityEventsStore.getEvents(
    filter,
    parseInt(limit as string)
  );

  res.json({
    events,
    total: events.length,
    filter,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get high severity security events
 */
export const getHighSeverityEvents = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const events = securityEventsStore.getHighSeverityEvents();

  res.json({
    events,
    count: events.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clear security events (admin only)
 */
export const clearSecurityEvents = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.roles?.includes("SYSTEM_ADMIN")) {
    res.status(403).json({ message: "System admin access required" });
    return;
  }

  securityEventsStore.clear();

  res.json({
    message: "Security events cleared",
    clearedBy: req.user.email,
    timestamp: new Date().toISOString(),
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      securityEventLogger?: {
        logEvent: (eventType: SecurityEventType, details: any) => void;
        logFailedAuth: (reason: string, details?: any) => void;
        logPermissionDenied: (
          resource: string,
          permission: string,
          details?: any
        ) => void;
        logSuspiciousActivity: (indicators: string[], details?: any) => void;
      };
    }
  }
}

export { SecurityEventType, SecurityEventSeverity };
export default securityEventsMiddleware;
