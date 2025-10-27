# Core Infrastructure Layer Documentation

**ERP Multitenant SaaS Backend - Core Infrastructure Layer**

Version: 1.0.0  
Last Updated: October 21, 2025  
Maintainer: Core Infrastructure Team

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Configuration Management](#configuration-management)
5. [Logging & Monitoring](#logging--monitoring)
6. [Application Lifecycle](#application-lifecycle)
7. [Security Framework](#security-framework)
8. [Multi-tenancy Support](#multi-tenancy-support)
9. [Development Guide](#development-guide)
10. [Deployment Guide](#deployment-guide)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)
13. [Best Practices](#best-practices)
14. [Performance Considerations](#performance-considerations)
15. [Security Considerations](#security-considerations)

---

## Overview

The Core Infrastructure Layer provides the foundational runtime environment for the ERP Multitenant SaaS backend application. It implements enterprise-grade patterns for configuration management, logging, metrics collection, middleware orchestration, and application lifecycle management.

### Key Features

- **🔧 Configuration Management**: Environment-specific configuration with validation
- **📊 Logging & Metrics**: Structured logging with correlation tracking and Prometheus metrics
- **🛡️ Security Framework**: Comprehensive security headers, rate limiting, and audit logging
- **🏢 Multi-tenancy**: Row-level security (RLS) and tenant isolation
- **⚡ Performance**: Connection pooling, caching, and performance monitoring
- **🔄 Graceful Lifecycle**: Controlled startup and shutdown with health checks
- **🚀 Production Ready**: Enterprise patterns for scalability and reliability

### Design Principles

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Configuration-Driven**: Environment-specific behavior without code changes
3. **Observability First**: Comprehensive logging, metrics, and tracing
4. **Security by Default**: Security measures enabled and enforced by default
5. **Tenant Isolation**: Complete data and resource isolation between tenants
6. **Fail-Safe Operations**: Graceful degradation and error recovery

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
├─────────────────────────────────────────────────────────┤
│                     Feature Modules                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  Identity   │ │ Access Ctrl │ │   Tenant    │ ...  │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   Shared Components                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Routes    │ │    Types    │ │ Validators  │ ...  │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                 CORE INFRASTRUCTURE                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Config    │ │   Logging   │ │ Middleware  │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ App Factory │ │  Bootstrap  │ │   Server    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   External Services                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ PostgreSQL  │ │    Redis    │ │ Monitoring  │ ...  │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Core Infrastructure Components

```
src/core/
├── config/                    # Configuration Management
│   ├── env.config.ts         # Environment variable validation
│   ├── prisma.config.ts      # Database configuration
│   └── security.config.ts    # Security constants
├── logging/                   # Logging & Monitoring
│   ├── logger.service.ts     # Structured logging service
│   └── metrics.service.ts    # Metrics collection service
├── middleware.ts             # Global middleware chain
├── app.factory.ts           # Express application factory
├── bootstrap.ts             # Application initialization
└── server.ts               # Main entry point
```

---

## Core Components

### Configuration Management (`/config`)

#### Environment Configuration (`env.config.ts`)

Manages environment-specific configuration with Zod validation.

**Key Features:**

- 30+ environment variables with type safety
- Development, staging, and production environments
- Automatic validation on startup
- Default values for development

**Usage:**

```typescript
import { env, getSecurityConfig } from "../config/env.config";

// Access environment variables
const port = env.PORT;
const dbUrl = env.DATABASE_URL;

// Get configuration groups
const securityConfig = getSecurityConfig();
```

#### Database Configuration (`prisma.config.ts`)

Enterprise-grade Prisma configuration with connection pooling and RLS.

**Key Features:**

- Connection pooling with configurable limits
- Row-Level Security (RLS) integration
- Query logging and performance monitoring
- Health checks and retry logic
- Graceful connection management

**Usage:**

```typescript
import { initializePrisma, withRLSContext } from "../config/prisma.config";

// Initialize Prisma with enterprise settings
const prisma = await initializePrisma();

// Execute operations with tenant context
const users = await withRLSContext("tenant-123", async (prisma) => {
  return prisma.user.findMany();
});
```

#### Security Configuration (`security.config.ts`)

Comprehensive security constants and configuration.

**Key Features:**

- JWT configuration with rotation support
- Password security policies
- Encryption settings
- RBAC configuration
- Rate limiting settings
- Audit configuration

### Logging & Monitoring (`/logging`)

#### Logger Service (`logger.service.ts`)

Enterprise-grade structured logging with Winston.

**Key Features:**

- Correlation ID tracking
- Tenant context propagation
- Multiple output formats (JSON, console)
- Performance profiling
- Error tracking with stack traces
- Child logger creation

**Usage:**

```typescript
import { logger, createModuleLogger } from "../logging/logger.service";

// Basic logging
logger.info("User created", { userId: "123", tenantId: "tenant-1" });

// Create module-specific logger
const moduleLogger = createModuleLogger("auth");
moduleLogger.debug("Authentication attempt");

// Profile function execution
await logger.profile("database-query", async () => {
  return await prisma.user.findMany();
});
```

#### Metrics Service (`metrics.service.ts`)

Comprehensive metrics collection with Prometheus support.

**Key Features:**

- Counter, gauge, histogram, and timer metrics
- Tenant-aware metrics
- Business metrics tracking
- Performance monitoring
- Prometheus format export
- Automatic buffer management

**Usage:**

```typescript
import { metrics } from "../logging/metrics.service";

// Record counter metric
metrics.counter("user_created", 1, { tenant: "tenant-1" });

// Record gauge metric
metrics.gauge("active_connections", 45);

// Time operations
const timerId = metrics.startTimer("api_request");
// ... perform operation
metrics.stopTimer(timerId);

// Measure function execution
const result = await metrics.measure("db_query", async () => {
  return await prisma.user.findMany();
});
```

### Middleware Management (`middleware.ts`)

Global middleware chain configuration with security, CORS, and tenant handling.

**Key Features:**

- Security headers (Helmet)
- CORS configuration
- Rate limiting with tenant context
- Request logging and metrics
- Tenant resolution
- Authentication and authorization
- Error handling

### Application Factory (`app.factory.ts`)

Express application creation and configuration.

**Key Features:**

- Configurable middleware chain
- Route registration
- Error handling
- Health check endpoints
- Graceful shutdown support
- Development vs production optimization

### Bootstrap (`bootstrap.ts`)

Controlled application initialization with dependency management.

**Key Features:**

- Phased startup sequence
- Configuration validation
- Service initialization
- Health checks
- Graceful shutdown handlers
- Error recovery

### Server (`server.ts`)

Main entry point with production-ready server lifecycle management.

**Key Features:**

- Command-line argument parsing
- Environment-specific startup
- Process monitoring
- Graceful shutdown
- Error handling
- Startup banner and logging

---

## Configuration Management

### Environment Variables

#### Core Application Settings

| Variable    | Type   | Default       | Description             |
| ----------- | ------ | ------------- | ----------------------- |
| `NODE_ENV`  | string | `development` | Application environment |
| `PORT`      | number | `3001`        | Server port             |
| `HOST`      | string | `localhost`   | Server host             |
| `LOG_LEVEL` | string | `info`        | Logging level           |

#### Database Configuration

| Variable                   | Type   | Required | Description                   |
| -------------------------- | ------ | -------- | ----------------------------- |
| `DATABASE_URL`             | string | ✅       | PostgreSQL connection string  |
| `DATABASE_MAX_CONNECTIONS` | number | ❌       | Maximum connection pool size  |
| `DATABASE_TIMEOUT`         | number | ❌       | Query timeout in milliseconds |

#### Security Configuration

| Variable         | Type   | Required | Description                 |
| ---------------- | ------ | -------- | --------------------------- |
| `JWT_SECRET`     | string | ✅       | JWT signing secret          |
| `JWT_EXPIRES_IN` | string | ❌       | JWT expiration time         |
| `ENCRYPTION_KEY` | string | ✅       | Data encryption key         |
| `RATE_LIMIT_MAX` | number | ❌       | Rate limit maximum requests |

#### External Services

| Variable         | Type   | Required | Description              |
| ---------------- | ------ | -------- | ------------------------ |
| `REDIS_URL`      | string | ❌       | Redis connection string  |
| `SMTP_HOST`      | string | ❌       | Email server host        |
| `WEBHOOK_SECRET` | string | ❌       | Webhook signature secret |

### Configuration Validation

All environment variables are validated using Zod schemas with:

- Type checking
- Required field validation
- Format validation (URLs, emails, etc.)
- Range validation for numbers
- Custom validation rules

---

## Logging & Monitoring

### Structured Logging

#### Log Levels

- **ERROR**: System errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **HTTP**: HTTP request/response logging
- **DEBUG**: Detailed debug information
- **VERBOSE**: Verbose debug information

#### Log Context

Every log entry includes:

- **Timestamp**: ISO 8601 format
- **Level**: Log level
- **Message**: Human-readable message
- **Correlation ID**: Request correlation tracking
- **Tenant ID**: Multi-tenant context
- **User ID**: User context (when available)
- **Module**: Source module/component
- **Action**: Specific action being performed

#### Log Formats

**Development Format:**

```
14:30:15.123 [INFO] [auth] [login] [req_123] [tenant:abc] [user:456]: User authentication successful
```

**Production Format (JSON):**

```json
{
  "timestamp": "2025-10-21T14:30:15.123Z",
  "level": "info",
  "message": "User authentication successful",
  "correlationId": "req_123",
  "tenantId": "abc",
  "userId": "456",
  "module": "auth",
  "action": "login"
}
```

### Metrics Collection

#### Metric Types

1. **Counters**: Incrementing values (requests, errors, events)
2. **Gauges**: Absolute values (connections, memory usage)
3. **Histograms**: Value distributions (response times, sizes)
4. **Timers**: Duration measurements (operation timing)

#### Built-in Metrics

- `http_requests_total`: HTTP request counter
- `http_request_duration_ms`: Request duration histogram
- `http_errors_total`: HTTP error counter
- `db_operations_total`: Database operation counter
- `db_operation_duration_ms`: Database operation duration

#### Business Metrics

Track business-specific KPIs:

```typescript
metrics.business("user_signup", 1, "acquisition");
metrics.business("revenue", 1500.0, "financial", "USD");
```

### Prometheus Integration

Metrics are exported in Prometheus format at `/metrics` endpoint:

```
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/users",status_code="200"} 1523

# TYPE http_request_duration_ms histogram
http_request_duration_ms_sum{method="GET",path="/api/users"} 45231.2
http_request_duration_ms_count{method="GET",path="/api/users"} 1523
```

---

## Application Lifecycle

### Startup Sequence

1. **Configuration Validation**

   - Validate environment variables
   - Check required configurations
   - Set defaults for development

2. **Service Initialization**

   - Initialize logging service
   - Initialize metrics collection
   - Initialize database connections

3. **Application Creation**

   - Create Express application
   - Configure middleware chain
   - Register routes

4. **Health Checks**

   - Database connectivity
   - External service availability
   - Memory and resource checks

5. **Server Startup**
   - Bind to port and host
   - Start accepting requests
   - Register shutdown handlers

### Shutdown Sequence

1. **Signal Handling**

   - Capture SIGTERM, SIGINT, SIGQUIT
   - Set shutdown timeout (30 seconds default)

2. **Connection Management**

   - Stop accepting new requests
   - Allow existing requests to complete
   - Close database connections

3. **Resource Cleanup**

   - Flush logs and metrics
   - Close file handles
   - Clean up temporary resources

4. **Graceful Exit**
   - Log shutdown completion
   - Exit with appropriate code

### Health Check Endpoints

- **`/health`**: Basic health status
- **`/health/detailed`**: Comprehensive health information
- **`/ping`**: Simple connectivity test
- **`/metrics`**: Prometheus metrics

---

## Security Framework

### Security Headers

Implemented via Helmet middleware:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

### Rate Limiting

Multi-layered rate limiting:

- **General Limits**: 100 requests per 15 minutes per IP
- **Authentication Limits**: 5 attempts per 15 minutes per IP
- **Tenant-Aware Limits**: Combined IP + Tenant ID limiting
- **Speed Limiting**: Progressive delays for suspicious behavior

### Authentication & Authorization

- **JWT Tokens**: Signed with HS256 algorithm
- **Token Rotation**: Configurable expiration and refresh
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Row-Level Security (RLS)**: Database-level tenant isolation

### Audit Logging

Comprehensive audit trail:

- User actions and access patterns
- Data modifications with before/after values
- Security events and policy violations
- System administration activities

---

## Multi-tenancy Support

### Tenant Isolation

#### Data Isolation

- **Row-Level Security (RLS)**: Database-level enforcement
- **Tenant Context**: Automatic tenant ID injection
- **Query Filtering**: All queries automatically scoped to tenant

#### Resource Isolation

- **Connection Pooling**: Per-tenant connection limits
- **Rate Limiting**: Tenant-specific rate limits
- **Metrics**: Tenant-tagged metrics for monitoring

#### Security Isolation

- **JWT Claims**: Tenant ID embedded in tokens
- **API Keys**: Tenant-scoped API authentication
- **Encryption**: Tenant-specific encryption keys

### Tenant Context Propagation

Tenant context is maintained throughout the request lifecycle:

1. **Request Headers**: `X-Tenant-ID` header extraction
2. **JWT Claims**: Tenant ID from authentication token
3. **Database Context**: Automatic RLS context setting
4. **Logging Context**: Tenant ID in all log entries
5. **Metrics Tags**: Tenant labels on all metrics

---

## Development Guide

### Getting Started

1. **Environment Setup**

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd Backend

   # Install dependencies
   npm install

   # Copy environment template
   cp .env.example .env

   # Configure environment variables
   nano .env
   ```

2. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed database (optional)
   npx prisma db seed
   ```

3. **Development Server**

   ```bash
   # Start in development mode
   npm run dev

   # Start with specific options
   npm start -- --port 8080 --skip-health
   ```

### Project Structure

```
src/core/
├── config/                    # Configuration management
│   ├── env.config.ts         # Environment variables
│   ├── prisma.config.ts      # Database configuration
│   └── security.config.ts    # Security settings
├── logging/                   # Logging and monitoring
│   ├── logger.service.ts     # Structured logging
│   └── metrics.service.ts    # Metrics collection
├── middleware.ts             # Global middleware
├── app.factory.ts           # Express app factory
├── bootstrap.ts             # Application bootstrap
└── server.ts               # Server entry point
```

### Environment-Specific Configuration

#### Development

- Detailed error messages
- Request/response logging
- Hot reload support
- Relaxed security policies
- Local database connections

#### Staging

- Production-like environment
- Limited debug information
- Performance monitoring
- SSL/TLS enforcement
- External service integration

#### Production

- Optimized performance
- Security-first configuration
- Comprehensive monitoring
- Error reporting integration
- High availability setup

### Testing

#### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- app.factory.test.ts
```

#### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

#### Performance Tests

```bash
# Load testing
npm run test:load

# Stress testing
npm run test:stress
```

---

## Deployment Guide

### Container Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY dist/ ./dist/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
```

#### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/erp
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: erp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

### Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: erp-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: erp-backend
  template:
    metadata:
      labels:
        app: erp-backend
    spec:
      containers:
        - name: app
          image: erp-backend:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Environment Variables for Production

```bash
# Application
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_MAX_CONNECTIONS=100
DATABASE_TIMEOUT=30000

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
RATE_LIMIT_MAX=1000

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true

# External Services
REDIS_URL=redis://redis:6379
SMTP_HOST=smtp.example.com
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms:**

- Application exits immediately
- Error messages during startup

**Solutions:**

1. Check environment variables:

   ```bash
   npm start -- --help
   ```

2. Validate configuration:

   ```bash
   node -e "require('./dist/core/config/env.config').validateConfig()"
   ```

3. Check database connectivity:
   ```bash
   npm run db:check
   ```

#### Database Connection Issues

**Symptoms:**

- Connection timeout errors
- "Cannot connect to database" messages

**Solutions:**

1. Verify DATABASE_URL format:

   ```
   postgresql://username:password@host:port/database
   ```

2. Check network connectivity:

   ```bash
   telnet database-host 5432
   ```

3. Validate database credentials and permissions

#### Performance Issues

**Symptoms:**

- Slow response times
- High memory usage
- CPU spikes

**Solutions:**

1. Check metrics at `/metrics` endpoint
2. Review logs for slow queries
3. Monitor connection pool usage
4. Analyze garbage collection patterns

#### Memory Leaks

**Symptoms:**

- Gradually increasing memory usage
- Out of memory errors

**Solutions:**

1. Enable heap snapshots:

   ```bash
   node --inspect --heapsnapshot-signal=SIGUSR2 dist/server.js
   ```

2. Monitor active handles:
   ```javascript
   setInterval(() => {
     console.log("Active handles:", process._getActiveHandles().length);
   }, 30000);
   ```

### Debugging Tools

#### Log Analysis

```bash
# Filter logs by level
cat app.log | grep '"level":"error"'

# Extract correlation IDs
cat app.log | jq -r '.correlationId' | sort | uniq

# Monitor real-time logs
tail -f app.log | jq '.message'
```

#### Performance Profiling

```bash
# CPU profiling
node --prof dist/server.js
node --prof-process isolate-*.log > processed.txt

# Memory profiling
node --inspect dist/server.js
# Connect Chrome DevTools
```

#### Database Debugging

```bash
# Enable query logging
export DATABASE_LOGGING=true

# Monitor slow queries
tail -f app.log | grep '"duration"' | jq 'select(.duration > 1000)'
```

---

## API Reference

### Core Configuration

#### Environment Configuration

```typescript
// Get environment configuration
import { env } from "./config/env.config";

interface EnvConfig {
  NODE_ENV: "development" | "staging" | "production";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  // ... other environment variables
}
```

#### Database Configuration

```typescript
// Initialize Prisma client
import { initializePrisma } from "./config/prisma.config";

const prisma = await initializePrisma();

// Execute with RLS context
import { withRLSContext } from "./config/prisma.config";

const result = await withRLSContext(tenantId, async (prisma) => {
  return prisma.user.findMany();
});
```

### Logging Service

```typescript
import { logger, LogLevel } from './logging/logger.service';

// Basic logging methods
logger.error(message: string, error?: Error, context?: LoggerContext);
logger.warn(message: string, context?: LoggerContext);
logger.info(message: string, context?: LoggerContext);
logger.debug(message: string, context?: LoggerContext);

// Specialized logging
logger.security(message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', context?: LoggerContext);
logger.audit(message: string, action: string, resource?: string, context?: LoggerContext);
logger.business(message: string, event: string, context?: LoggerContext);

// Performance profiling
const result = await logger.profile(name: string, fn: () => Promise<T>, context?: LoggerContext);

// Child logger creation
const moduleLogger = logger.child({ module: 'auth' });
```

### Metrics Service

```typescript
import { metrics } from './logging/metrics.service';

// Counter metrics
metrics.counter(name: string, increment?: number, labels?: Record<string, string>, context?: Record<string, any>);

// Gauge metrics
metrics.gauge(name: string, value: number, unit?: string, labels?: Record<string, string>, context?: Record<string, any>);

// Histogram metrics
metrics.histogram(name: string, value: number, buckets?: number[], labels?: Record<string, string>, context?: Record<string, any>);

// Timer metrics
const timerId = metrics.startTimer(name: string, labels?: Record<string, string>, context?: Record<string, any>);
const duration = metrics.stopTimer(timerId: string);

// Function measurement
const result = await metrics.measure(name: string, fn: () => Promise<T>, labels?: Record<string, string>, context?: Record<string, any>);

// Business metrics
metrics.business(name: string, value: number, category: string, unit?: string, metadata?: Record<string, any>);

// Request metrics
metrics.recordRequest(method: string, path: string, statusCode: number, duration: number, tenantId?: string);

// Database metrics
metrics.recordDatabase(operation: string, table: string, duration: number, success: boolean, tenantId?: string);
```

### Application Factory

```typescript
import createApp from "./app.factory";

// Create application with default configuration
const app = createApp();

// Create application with custom configuration
const app = createApp({
  middleware: {
    enableCors: true,
    enableRateLimit: false,
    customMiddleware: [myCustomMiddleware],
  },
  customRoutes: (app) => {
    app.get("/custom", handler);
  },
});
```

### Bootstrap Service

```typescript
import { bootstrap, startServer } from "./bootstrap";

// Bootstrap application
const context = await bootstrap({
  skipHealthChecks: false,
  enableGracefulShutdown: true,
  shutdownTimeout: 30000,
});

// Start server
const server = await startServer(context, 3001, "localhost");

// Bootstrap and start in one step
const context = await bootstrapAndStart();
```

---

## Best Practices

### Configuration Management

1. **Environment Variables**

   - Use descriptive names with prefixes (e.g., `DATABASE_*`, `JWT_*`)
   - Provide sensible defaults for development
   - Validate all required variables at startup
   - Use different configurations per environment

2. **Security Configuration**

   - Never commit secrets to version control
   - Use strong random values for secrets
   - Rotate secrets regularly
   - Implement secret management systems

3. **Feature Flags**
   - Use environment variables for feature toggles
   - Implement gradual rollouts
   - Monitor feature usage and performance impact

### Logging & Monitoring

1. **Structured Logging**

   - Always include correlation IDs
   - Add tenant context to all logs
   - Use consistent log levels
   - Include relevant context information

2. **Error Handling**

   - Log errors with full context
   - Include stack traces in development
   - Sanitize sensitive information
   - Implement error aggregation

3. **Performance Monitoring**
   - Track all external API calls
   - Monitor database query performance
   - Set up alerting for critical metrics
   - Regular performance reviews

### Security

1. **Input Validation**

   - Validate all inputs at entry points
   - Use Zod schemas for type safety
   - Sanitize user inputs
   - Implement rate limiting

2. **Authentication & Authorization**

   - Use strong JWT secrets
   - Implement token rotation
   - Validate permissions at multiple layers
   - Log all authentication events

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement proper session management
   - Regular security audits

### Performance

1. **Database Optimization**

   - Use connection pooling
   - Implement query result caching
   - Monitor slow queries
   - Regular index optimization

2. **Caching Strategy**

   - Cache frequently accessed data
   - Implement cache invalidation
   - Use appropriate TTL values
   - Monitor cache hit rates

3. **Resource Management**
   - Monitor memory usage patterns
   - Implement proper cleanup procedures
   - Use streaming for large data sets
   - Regular garbage collection monitoring

---

## Performance Considerations

### Database Performance

#### Connection Pooling

- **Default Pool Size**: 20 connections
- **Max Pool Size**: Configurable via `DATABASE_MAX_CONNECTIONS`
- **Connection Timeout**: 30 seconds default
- **Idle Timeout**: 10 minutes

#### Query Optimization

- **Prepared Statements**: Automatic via Prisma
- **Query Logging**: Enabled in development
- **Slow Query Monitoring**: Queries > 1 second logged
- **Index Usage**: Monitor via database metrics

#### RLS Performance

- **Context Switching**: Minimized with connection reuse
- **Query Planning**: Cached per tenant context
- **Index Strategy**: Tenant-aware composite indexes

### Application Performance

#### Memory Management

- **Heap Size**: Monitor via metrics
- **Garbage Collection**: Tune for workload
- **Memory Leaks**: Automated detection and alerting
- **Buffer Management**: Automatic buffer limits

#### CPU Optimization

- **Event Loop Monitoring**: Track event loop lag
- **Worker Threads**: For CPU-intensive tasks
- **Clustering**: Multiple processes in production
- **Load Balancing**: Distribute requests efficiently

#### Network Performance

- **Response Compression**: Enabled by default
- **Keep-Alive**: Connection reuse
- **Request Pipelining**: HTTP/2 support
- **CDN Integration**: Static asset optimization

### Monitoring & Alerting

#### Key Performance Indicators (KPIs)

- **Response Time**: 95th percentile < 500ms
- **Throughput**: Requests per second
- **Error Rate**: < 0.1% for 4xx, < 0.01% for 5xx
- **Availability**: > 99.9% uptime

#### Resource Monitoring

- **CPU Usage**: < 70% average
- **Memory Usage**: < 80% of available
- **Disk I/O**: Monitor queue depth and wait times
- **Network I/O**: Track bandwidth utilization

#### Application Metrics

- **Database Connections**: Monitor pool utilization
- **Cache Hit Rate**: > 90% for frequently accessed data
- **Queue Lengths**: Background job processing
- **Session Count**: Active user sessions

---

## Security Considerations

### Infrastructure Security

#### Network Security

- **Firewall Rules**: Restrict access to necessary ports
- **VPC/VNET**: Isolated network environments
- **Load Balancer**: SSL termination and DDoS protection
- **WAF**: Web Application Firewall protection

#### Data Security

- **Encryption at Rest**: Database and file storage
- **Encryption in Transit**: TLS 1.3 for all communications
- **Key Management**: Secure key storage and rotation
- **Backup Security**: Encrypted backups with versioning

#### Access Control

- **Principle of Least Privilege**: Minimal required permissions
- **Multi-Factor Authentication**: For administrative access
- **Regular Access Reviews**: Quarterly permission audits
- **Service Accounts**: Dedicated accounts for applications

### Application Security

#### Authentication & Authorization

- **JWT Security**: Strong secrets and short expiration
- **Session Management**: Secure session handling
- **Password Policies**: Strong password requirements
- **Account Lockout**: Protection against brute force

#### Input Validation

- **Schema Validation**: Zod schemas for all inputs
- **SQL Injection**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Token-based protection

#### Security Headers

- **Helmet Integration**: Comprehensive security headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **Frame Options**: Clickjacking protection

### Compliance & Auditing

#### Audit Logging

- **Comprehensive Audit Trail**: All user actions logged
- **Immutable Logs**: Tamper-proof log storage
- **Log Retention**: Configurable retention periods
- **Compliance Reporting**: Automated compliance reports

#### Data Privacy

- **GDPR Compliance**: Right to erasure and portability
- **Data Minimization**: Collect only necessary data
- **Consent Management**: Explicit user consent
- **Privacy by Design**: Privacy considerations in development

#### Security Monitoring

- **SIEM Integration**: Security Information and Event Management
- **Anomaly Detection**: Unusual activity patterns
- **Vulnerability Scanning**: Regular security assessments
- **Incident Response**: Documented response procedures

---

## Appendices

### Appendix A: Environment Variable Reference

Complete list of all supported environment variables with types, defaults, and descriptions.

### Appendix B: Error Codes Reference

Standardized error codes used throughout the application with descriptions and resolution steps.

### Appendix C: Metrics Reference

Complete list of all metrics collected by the application with descriptions and alert thresholds.

### Appendix D: Security Checklist

Comprehensive security checklist for deployment and operations.

### Appendix E: Performance Tuning Guide

Detailed guide for optimizing application performance in different deployment scenarios.

---

**Document Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Next Review**: January 21, 2026

For questions or updates to this documentation, please contact the Core Infrastructure Team or create an issue in the project repository.
