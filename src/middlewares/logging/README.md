# Logging Middlewares - Complete Implementation

## 🪵 **ALL LOGGING MIDDLEWARES IMPLEMENTED**

### **📁 Logging Middleware Structure**

```
src/middlewares/logging/
├── request-logger.middleware.ts     ✅ IMPLEMENTED
├── query-logger.middleware.ts       ✅ IMPLEMENTED
├── security-events.middleware.ts    ✅ IMPLEMENTED
├── audit-log.middleware.ts          ✅ IMPLEMENTED (moved from compliance)
└── README.md                       ✅ This file
```

---

## 📝 **1. Request Logger Middleware**

**File**: `request-logger.middleware.ts`

### **Functionality:**

- ✅ **Comprehensive request logging** with method, path, tenant, and user context
- ✅ **Multi-format logging** (JSON, text, Apache combined format)
- ✅ **Performance tracking** with request/response timing
- ✅ **Configurable log levels** (minimal, standard, detailed, debug)
- ✅ **Sensitive data sanitization** for headers and query parameters
- ✅ **Slow request detection** with configurable thresholds
- ✅ **Request analytics API** for monitoring and reporting

### **Key Features:**

```typescript
// Core request logging
export const requestLoggerMiddleware = (config) => { ... }

// Request log entry structure
interface RequestLogEntry {
  timestamp: string;
  correlationId: string;
  method: string;
  path: string;
  userId?: string;
  tenantId?: string;
  ip: string;
  responseTime?: number;
  statusCode?: number;
  userAgent?: string;
  apiVersion?: string;
}

// Pre-configured loggers
export const minimalRequestLogger     // Production-friendly minimal logging
export const standardRequestLogger    // Balanced logging with response data
export const detailedRequestLogger    // Full logging with headers
export const combinedRequestLogger    // Apache-style combined format
export const debugRequestLogger       // Maximum information for debugging
```

### **Usage:**

```typescript
// Standard request logging
app.use(standardRequestLogger);

// Custom configuration
app.use(requestLoggerMiddleware({
  logLevel: 'detailed',
  includeHeaders: true,
  logFormat: 'json',
  slowRequestThreshold: 1000,
  excludePaths: ['/health', '/metrics']
}));

// Get request analytics
GET /api/logs/requests?method=POST&limit=100
GET /api/logs/slow-requests?threshold=500
GET /api/logs/request-stats
```

---

## 🗄️ **2. Query Logger Middleware**

**File**: `query-logger.middleware.ts`

### **Functionality:**

- ✅ **Prisma query logging** with performance metrics tracking
- ✅ **Slow query detection** and optimization recommendations
- ✅ **Query type categorization** (SELECT, INSERT, UPDATE, DELETE, RAW)
- ✅ **Database performance analytics** with response time tracking
- ✅ **Failed query monitoring** with error tracking
- ✅ **Query parameter logging** with sensitive data protection
- ✅ **Prisma integration helpers** for automatic query interception

### **Key Features:**

```typescript
// Core query logging
export const queryLoggerMiddleware = (config) => { ... }

// Query log entry structure
interface QueryLogEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RAW';
  operation: string;
  table?: string;
  duration: number;
  success: boolean;
  rowCount?: number;
  metadata?: {
    model?: string;
    cacheHit?: boolean;
    indexUsed?: string[];
  };
}

// Prisma integration
export const createPrismaQueryLogger = (req) => { ... } // Prisma extension

// Pre-configured loggers
export const productionQueryLogger    // Minimal logging for production
export const developmentQueryLogger   // Detailed logging with parameters
export const performanceQueryLogger   // Performance-focused monitoring
export const debugQueryLogger         // Maximum query information
```

### **Usage:**

```typescript
// Enable query logging middleware
app.use(developmentQueryLogger);

// Prisma integration
const prisma = new PrismaClient().$extends(
  createPrismaQueryLogger(req)
);

// Manual query logging
req.queryLogger?.logQuery({
  queryType: 'SELECT',
  operation: 'User.findMany',
  table: 'users',
  duration: 150,
  success: true
});

// Get query analytics
GET /api/logs/queries?queryType=SELECT&limit=100
GET /api/logs/slow-queries?threshold=1000
GET /api/logs/query-metrics
```

---

## 🔒 **3. Security Events Middleware**

**File**: `security-events.middleware.ts`

### **Functionality:**

- ✅ **Security event logging** for failed authentications and permission denials
- ✅ **Real-time threat detection** with 20+ built-in security rules
- ✅ **Suspicious pattern recognition** (SQL injection, XSS, brute force)
- ✅ **Behavioral anomaly detection** with geographic and temporal analysis
- ✅ **Automated blocking recommendations** for high-severity threats
- ✅ **SIEM integration ready** with structured security event logging
- ✅ **Compliance-ready security audit** trails

### **Key Features:**

```typescript
// Core security event logging
export const securityEventsMiddleware = (config) => { ... }

// Security event types (20+ supported)
enum SecurityEventType {
  FAILED_AUTHENTICATION = 'FAILED_AUTHENTICATION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SUSPICIOUS_ACCESS_PATTERN = 'SUSPICIOUS_ACCESS_PATTERN',
  GEOGRAPHIC_ANOMALY = 'GEOGRAPHIC_ANOMALY',
  // ... 13 more types
}

// Built-in threat detection rules
const THREAT_DETECTION_RULES = [
  { id: 'BRUTE_FORCE', severity: 'HIGH' },
  { id: 'SQL_INJECTION', severity: 'CRITICAL' },
  { id: 'XSS_DETECTION', severity: 'HIGH' },
  { id: 'SUSPICIOUS_USER_AGENT', severity: 'MEDIUM' },
  { id: 'GEOGRAPHIC_ANOMALY', severity: 'MEDIUM' }
];

// Request integration helpers
req.securityEventLogger?.logFailedAuth(reason, details);
req.securityEventLogger?.logPermissionDenied(resource, permission);
req.securityEventLogger?.logSuspiciousActivity(indicators);

// Pre-configured security monitors
export const productionSecurityEvents   // Balanced monitoring
export const developmentSecurityEvents  // Detailed monitoring
export const highSecurityEvents        // Maximum protection
```

### **Usage:**

```typescript
// Enable security event monitoring
app.use(highSecurityEvents);

// Log specific security events
req.securityEventLogger?.logFailedAuth('Invalid password', {
  attemptCount: 3,
  userAgent: req.headers['user-agent']
});

req.securityEventLogger?.logPermissionDenied('users', 'USER_DELETE', {
  requestedResource: '/api/users/123'
});

// Get security analytics
GET /api/security/events?severity=HIGH&limit=100
GET /api/security/high-severity-events
GET /api/security/threat-analysis
```

---

## 📋 **4. Audit Log Middleware**

**File**: `audit-log.middleware.ts` _(from compliance)_

### **Functionality:**

- ✅ **Compliance audit trails** for CRUD operations
- ✅ **GDPR, SOC2, HIPAA compliance** logging
- ✅ **Data change tracking** with before/after comparisons
- ✅ **Sensitive data masking** with configurable field protection
- ✅ **Regulatory compliance flags** automatic detection
- ✅ **Audit reporting APIs** for compliance officers

---

## 🎯 **LOGGING INTEGRATION PATTERNS**

### **Complete Logging Stack:**

```typescript
import {
  requestLoggerMiddleware,
  queryLoggerMiddleware,
  securityEventsMiddleware,
  auditLogMiddleware,
} from "./middlewares/logging";

// Full logging middleware stack
app.use("/api", [
  requestLoggerMiddleware(), // 1. Request/response logging
  queryLoggerMiddleware(), // 2. Database query logging
  securityEventsMiddleware(), // 3. Security monitoring
  auditLogMiddleware(), // 4. Compliance audit trails
]);
```

### **Environment-Specific Logging:**

```typescript
// Production logging (performance-optimized)
app.use("/api", [
  minimalRequestLogger, // Minimal request logging
  productionQueryLogger, // Slow queries only
  productionSecurityEvents, // Security events only
  basicAuditMiddleware, // Basic audit trails
]);

// Development logging (maximum information)
app.use("/api", [
  debugRequestLogger, // Full request details
  developmentQueryLogger, // All queries with parameters
  developmentSecurityEvents, // All security events
  detailedAuditMiddleware, // Full audit information
]);

// High-security environment
app.use("/api", [
  detailedRequestLogger, // Detailed request tracking
  performanceQueryLogger, // Performance monitoring
  highSecurityEvents, // Real-time threat detection
  complianceAuditMiddleware, // Full compliance logging
]);
```

### **Feature-Specific Logging:**

```typescript
// Authentication endpoints
app.use("/auth", [
  requestLoggerMiddleware({ logLevel: "detailed" }),
  securityEventsMiddleware({ enableThreatDetection: true }),
  auditLogMiddleware({ complianceRules: ["SOC2"] }),
]);

// Database-heavy operations
app.use("/api/reports", [
  standardRequestLogger,
  debugQueryLogger, // Log all queries for optimization
  basicSecurityEvents,
]);

// Financial operations
app.use("/api/financial", [
  detailedRequestLogger,
  productionQueryLogger,
  highSecurityEvents, // Maximum security monitoring
  financialAuditMiddleware, // PCI compliance audit
]);
```

## 📊 **LOGGING ANALYTICS & MONITORING**

### **Request Analytics:**

```typescript
// Request performance analysis
GET /api/logs/requests?method=GET&statusCode=200&limit=1000
GET /api/logs/slow-requests?threshold=2000
GET /api/logs/request-stats // Aggregated statistics

// Response includes:
{
  logs: [...],
  stats: {
    averageResponseTime: 245,
    errorRate: 0.02,
    requestsPerSecond: 15.3,
    slowRequestCount: 12
  }
}
```

### **Query Performance Analysis:**

```typescript
// Database query optimization
GET /api/logs/queries?queryType=SELECT&duration=>1000
GET /api/logs/query-metrics

// Response includes:
{
  metrics: {
    totalQueries: 1547,
    averageResponseTime: 89,
    slowQueries: 23,
    queriesPerSecond: 8.2,
    topSlowQueries: [...],
    tableAccessFrequency: { users: 450, projects: 320 }
  }
}
```

### **Security Event Analysis:**

```typescript
// Security threat monitoring
GET /api/security/events?eventType=BRUTE_FORCE_ATTEMPT
GET /api/security/high-severity-events
GET /api/security/threat-summary

// Response includes:
{
  events: [...],
  threatLevel: 'MEDIUM',
  activeThreats: 3,
  blockedIPs: ['192.168.1.100'],
  recommendations: ['Enable rate limiting', 'Block suspicious IPs']
}
```

## 🔧 **CONFIGURATION & CUSTOMIZATION**

### **Log Level Configuration:**

```typescript
// Environment-based configuration
const logConfig = {
  development: {
    request: { logLevel: "debug", includeHeaders: true },
    query: { logAllQueries: true, includeParams: true },
    security: { enableThreatDetection: true, logAllEvents: true },
  },
  production: {
    request: { logLevel: "minimal", excludeHealthChecks: true },
    query: { logSlowQueries: true, slowQueryThreshold: 2000 },
    security: { enableRealTimeBlocking: true, logFailedAuthOnly: true },
  },
};
```

### **Custom Threat Detection Rules:**

```typescript
// Add custom security rules
const customThreatRules = [{
  id: 'CUSTOM_PATTERN',
  name: 'Custom Suspicious Pattern',
  eventType: SecurityEventType.SUSPICIOUS_ACCESS_PATTERN,
  severity: SecurityEventSeverity.HIGH,
  check: (req, context) => {
    // Custom threat detection logic
    return {
      detected: /* your logic */,
      confidence: 0.8,
      indicators: ['Custom indicator'],
      recommendAction: 'WARN'
    };
  }
}];

app.use(securityEventsMiddleware({
  customRules: customThreatRules
}));
```

## 🚀 **PRODUCTION FEATURES**

### **✅ Performance Optimized:**

- **Efficient log storage** with automatic cleanup
- **Configurable sampling** for high-volume applications
- **Asynchronous logging** to prevent request blocking
- **Memory-efficient** circular buffers for log storage

### **✅ Security Focused:**

- **Real-time threat detection** with automated response
- **Sensitive data protection** with automatic masking
- **SIEM integration ready** with structured logging
- **Compliance audit trails** for regulatory requirements

### **✅ Monitoring Integration:**

- **Metrics APIs** for dashboard integration
- **Alert thresholds** for operational monitoring
- **Performance analytics** for optimization insights
- **Security dashboards** for threat visibility

---

**Status**: ✅ **ALL LOGGING MIDDLEWARES COMPLETE - PRODUCTION READY**

The complete logging middleware stack provides comprehensive request tracking, database monitoring, security event detection, and compliance audit trails for enterprise-grade applications.
