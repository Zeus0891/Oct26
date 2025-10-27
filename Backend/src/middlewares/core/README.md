# Core Middlewares - Complete Implementation

## 🧩 **ALL CORE MIDDLEWARES IMPLEMENTED**

### **📁 Core Middleware Structure**

```
src/middlewares/core/
├── rate-limit.middleware.ts         ✅ IMPLEMENTED
├── validation.middleware.ts         ✅ IMPLEMENTED
├── error-handler.middleware.ts      ✅ IMPLEMENTED
├── correlation-id.middleware.ts     ✅ IMPLEMENTED
├── performance-monitor.middleware.ts ✅ IMPLEMENTED
└── README.md                       ✅ This file
```

---

## 🚦 **1. Rate Limiting Middleware**

**File**: `rate-limit.middleware.ts`

### **Functionality:**

- ✅ **Plan-based rate limiting** (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
- ✅ **Multi-key support** (per tenant, user, IP address)
- ✅ **In-memory store** with automatic cleanup (Redis-ready for production)
- ✅ **Intelligent key generation** with priority fallback
- ✅ **Configurable windows and limits**
- ✅ **Rate limit headers** for client information
- ✅ **Skip options** for successful/failed requests

### **Key Features:**

```typescript
// Core rate limiting
export const rateLimitMiddleware = (options) => { ... }

// Plan-based limits
const PLAN_LIMITS = {
  FREE: { requestsPerMinute: 10, requestsPerHour: 100 },
  BASIC: { requestsPerMinute: 60, requestsPerHour: 1000 },
  PROFESSIONAL: { requestsPerMinute: 300, requestsPerHour: 5000 },
  ENTERPRISE: { requestsPerMinute: 1000, requestsPerHour: 20000 }
}

// Pre-configured middlewares
export const authRateLimitMiddleware       // 5 attempts per 15 minutes
export const apiRateLimitMiddleware        // Plan-based API limits
export const bulkOperationRateLimitMiddleware  // 10 operations per minute
export const uploadRateLimitMiddleware     // 20 uploads per minute
```

### **Usage:**

```typescript
// Custom rate limiting
app.use(
  "/api",
  rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 100,
    enablePlanBasedLimits: true,
  })
);

// Pre-configured
app.use("/auth", authRateLimitMiddleware);
app.use("/api/bulk", bulkOperationRateLimitMiddleware);
```

---

## ✅ **2. Validation Middleware**

**File**: `validation.middleware.ts`

### **Functionality:**

- ✅ **Zod schema-driven validation** for requests
- ✅ **Body, query, and params validation**
- ✅ **Input sanitization** with XSS protection
- ✅ **Pre-defined schemas** for common entities
- ✅ **Type-safe validation** with TypeScript integration
- ✅ **Comprehensive error details**

### **Key Features:**

```typescript
// Core validation
export const validationMiddleware = (schema) => { ... }

// Shorthand validators
export const validateBody = (schema) => { ... }
export const validateQuery = (schema) => { ... }
export const validateParams = (schema) => { ... }

// Common schemas
export const uuidParamsSchema = z.object({ id: z.string().uuid() })
export const paginationQuerySchema = z.object({ page: z.number(), limit: z.number() })
export const createUserSchema = z.object({ email: z.string().email(), ... })
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })

// Input sanitization
export const sanitizeInputMiddleware = (req, res, next) => { ... }
```

### **Usage:**

```typescript
// Schema-based validation
app.post("/api/users", validateBody(createUserSchema), handler);

// Combined validation
app.get(
  "/api/users/:id",
  validateParams(uuidParamsSchema),
  validateQuery(paginationQuerySchema),
  handler
);
```

---

## 🔥 **3. Error Handler Middleware**

**File**: `error-handler.middleware.ts`

### **Functionality:**

- ✅ **Global error handling** with centralized processing
- ✅ **Safe error exposure** with security masking
- ✅ **Custom error classes** for different scenarios
- ✅ **Correlation ID integration** for error tracking
- ✅ **Environment-aware error details**
- ✅ **HTTP status code handling**
- ✅ **Async error wrapper**

### **Key Features:**

```typescript
// Global error handler
export const errorHandlerMiddleware = (error, req, res, next) => { ... }

// 404 handler
export const notFoundHandler = (req, res, next) => { ... }

// Async wrapper
export const asyncHandler = (fn) => { ... }

// Custom error classes
export class ValidationError extends Error { statusCode = 400 }
export class UnauthorizedError extends Error { statusCode = 401 }
export class ForbiddenError extends Error { statusCode = 403 }
export class NotFoundError extends Error { statusCode = 404 }
export class ConflictError extends Error { statusCode = 409 }
```

### **Usage:**

```typescript
// Throw custom errors
if (!user) throw new NotFoundError("User not found");
if (!isValid) throw new ValidationError("Invalid data", details);

// Wrap async functions
app.get(
  "/api/users",
  asyncHandler(async (req, res) => {
    // Async code that might throw
  })
);

// Global error handling (last middleware)
app.use(errorHandlerMiddleware);
```

---

## 🔗 **4. Correlation ID Middleware**

**File**: `correlation-id.middleware.ts`

### **Functionality:**

- ✅ **Unique request tracking** with UUID generation
- ✅ **Header-based correlation** (x-correlation-id, x-request-id)
- ✅ **Response header injection** for client tracking
- ✅ **Distributed tracing** support
- ✅ **Logging integration** for request correlation

### **Key Features:**

```typescript
// Correlation ID generation
export const correlationIdMiddleware = (req, res, next) => {
  const correlationId =
    req.headers["x-correlation-id"] || req.headers["x-request-id"] || uuidv4();

  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  next();
};
```

### **Usage:**

```typescript
// Apply early in middleware stack
app.use(correlationIdMiddleware);

// Use in logging
console.log(`Request ${req.correlationId}: Processing user data`);

// Client can track requests via response header
```

---

## 📊 **5. Performance Monitor Middleware**

**File**: `performance-monitor.middleware.ts`

### **Functionality:**

- ✅ **Request execution time tracking** with high precision
- ✅ **Memory usage monitoring** with delta calculations
- ✅ **Database query latency** tracking (integration ready)
- ✅ **Performance level classification** (GOOD, SLOW, WARNING, CRITICAL)
- ✅ **Configurable thresholds** and sampling
- ✅ **Performance metrics API** for monitoring dashboards
- ✅ **APM integration** ready structure

### **Key Features:**

```typescript
// Core performance monitoring
export const performanceMonitorMiddleware = (options) => { ... }

// Performance thresholds
const DEFAULT_THRESHOLDS = {
  slow: 1000,      // 1 second
  warning: 3000,   // 3 seconds
  critical: 10000  // 10 seconds
}

// Pre-configured monitors
export const basicPerformanceMonitor        // Basic timing only
export const detailedPerformanceMonitor     // Full metrics with memory
export const productionPerformanceMonitor   // Sampled for production

// Metrics API
export const getPerformanceMetrics = (req, res) => { ... }
export const clearPerformanceMetrics = (req, res) => { ... }
```

### **Usage:**

```typescript
// Basic monitoring
app.use(basicPerformanceMonitor);

// Detailed monitoring with custom thresholds
app.use(
  performanceMonitorMiddleware({
    thresholds: { slow: 500, warning: 2000, critical: 5000 },
    enableMemoryTracking: true,
    enableDBTracking: true,
    sampleRate: 0.1, // Monitor 10% of requests
  })
);

// Performance metrics endpoint
app.get("/api/metrics/performance", getPerformanceMetrics);
```

---

## 🎯 **MIDDLEWARE INTEGRATION ORDER**

```typescript
// Correct order for maximum effectiveness
app.use(correlationIdMiddleware); // 1. Request tracking
app.use(performanceMonitorMiddleware()); // 2. Performance timing
app.use(rateLimitMiddleware()); // 3. Rate limiting
app.use(validationMiddleware()); // 4. Input validation
// ... auth middlewares here ...
// ... routes here ...
app.use(errorHandlerMiddleware); // Last. Error handling
```

## 📈 **PERFORMANCE CONSIDERATIONS**

### **✅ Optimized for High Throughput:**

- **Efficient rate limiting** with in-memory store
- **Minimal overhead** performance monitoring
- **Early validation** to fail fast
- **Sampling support** for production loads
- **Configurable exclusions** for health checks

### **✅ Memory Management:**

- **Automatic cleanup** of expired rate limits
- **Bounded metrics storage** (configurable limits)
- **Efficient correlation tracking**
- **Optional memory monitoring**

## 🔧 **CONFIGURATION**

### **Environment Variables:**

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Performance Monitoring
PERF_MONITOR_SAMPLE_RATE=0.1
PERF_MONITOR_SLOW_THRESHOLD=1000

# Error Handling
NODE_ENV=production  # Controls error detail exposure
```

### **Plan Configuration:**

```typescript
// Tenant plan-based rate limits
const tenantSettings = {
  plan: "PROFESSIONAL", // Automatically applies 300 req/min
  customLimits: {
    requestsPerMinute: 500, // Override default plan limits
  },
};
```

## 🚀 **PRODUCTION READINESS**

### **✅ Production Features:**

- **Rate limiting** with plan-based enforcement
- **Performance monitoring** with sampling
- **Error masking** for security
- **Correlation tracking** for debugging
- **Schema validation** with sanitization
- **Memory efficient** implementations
- **Configurable thresholds** and limits

### **✅ Monitoring Integration:**

- **APM ready** structure for external tools
- **Metrics endpoints** for dashboards
- **Performance classification** for alerting
- **Correlation IDs** for distributed tracing
- **Structured logging** for analysis

### **✅ Scalability:**

- **Redis-ready** rate limiting store
- **Sampling support** for high-volume applications
- **Configurable exclusions** for optimization
- **Efficient memory usage** with automatic cleanup

---

**Status**: ✅ **ALL CORE MIDDLEWARES COMPLETE - PRODUCTION READY**

The complete core middleware stack provides enterprise-grade request processing, monitoring, and protection capabilities ready for high-scale production deployment.
