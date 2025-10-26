# Core Infrastructure README

Last updated: 2025-10-23

This directory contains the platform runtime for the ERP Multitenant SaaS Backend: configuration, logging/metrics, global middleware, the Express app factory, bootstrap orchestration, and the server entrypoint.

- Start here for deep detail: ./CORE_INFRASTRUCTURE_DOCUMENTATION.md
- Architecture index (canonical): ../../docs/architecture/README.md

## What lives here

- config/
  - env.config.ts — Environment schema, validation, and typed accessors
  - prisma.config.ts — Prisma client setup, RLS helpers, health, graceful disconnect
  - security.config.ts — Security constants and knobs
- logging/
  - logger.service.ts — Structured logging (Winston) with correlation/tenant context
  - metrics.service.ts — Counters, gauges, histograms, timers, Prometheus export
- middleware.ts — Global middleware chain and production security chain wiring
- app.factory.ts — Creates the Express app, registers routes and error handlers
- bootstrap.ts — Phased startup (validation → logging → metrics → DB → app → health → server)
- server.ts — CLI entrypoint, flags, banner, bootstrap-and-start, legacy fallback

## Request lifecycle (security chain)

Applied to tenant-scoped API routes unless a module handles its own auth (e.g., /api/identity):

1. Correlation ID → 2) Rate limit/slowdown → 3) JWT auth → 4) Tenant context → 5) RLS session → 6) RBAC (per-route) → 7) Audit log → 8) Validation → 9) Route handler → 10) Error handling

Notes

- RBAC is enforced per-route via rbacAuthMiddleware(permission)
- Identity routes mount before the global /api chain to support public endpoints

## Startup and shutdown

Phased startup (see src/core/bootstrap.ts):

- validation: env and config validation
- logging: initialize logger
- metrics: initialize metrics
- database: initialize Prisma (degraded mode allowed when configured)
- application: create Express app, configure middleware, register routes
- health_checks: lightweight checks (DB, memory, process)
- server: bind port/host, set timeouts, wire graceful shutdown
- ready: application is accepting traffic

Graceful shutdown

- Capture SIGTERM/SIGINT and critical errors
- Stop accepting connections, allow inflight to drain
- Disconnect Prisma, flush metrics/logs
- Force-exit after timeout if needed

## Health and observability

Endpoints provided by core:

- GET /ping — liveness probe
- GET /health and GET /api/health — basic health with DB status (degraded when DB unavailable)
- GET /health/detailed — memory/CPU plus stubbed external checks
- GET /ready — readiness flag
- GET /metrics — Prometheus exposition from metrics.service
- GET /api/status — human-friendly status banner

Logging

- logger.service.ts wraps Winston with JSON in prod and pretty in dev
- Correlation ID, tenantId, userId are propagated when available
- Helpers: logger.child, logger.profile, logger.request, logger.audit, logger.security

Metrics

- metrics.service.ts supports counters/gauges/histograms/timers and business metrics
- Prometheus output served at /metrics
- Built-ins: http_requests_total, http_request_duration_ms, db_operations_total, db_operation_duration_ms

## Configuration

Authoritative schema and accessors live in src/core/config/env.config.ts.

- Validation: validateEnvironment()
- Accessors: getDatabaseConfig, getJWTConfig, getSecurityConfig, getRateLimitConfig, getServerConfig, etc.
- Production guardrails: JWT secret length, REQUIRE_DB_ON_START, safe defaults

Database (Prisma)

- initializePrisma(), connectWithRetry(), setupPrismaShutdownHandlers()
- withRLSContext(tenantId, fn) to run operations with PostgreSQL RLS claims
- applyRlsClaims() sets request.jwt.claims via parameterized $executeRaw

## Extension points

- Add routes: contribute feature routes under src/features/\* and mount them in app.factory.ts (or the feature owns its own router export). Identity mounts at /api/identity before the global chain for public endpoints.
- Enforce permissions: wrap handlers with rbacAuthMiddleware("permission.key")
- Add global middleware: extend configureMiddleware or provide customMiddleware in createApp({ middleware: { ... } })
- Customize security: adjust production chain in configureProductionApiMiddleware (JWT → Tenant → RLS → RBAC → Audit)
- Emit metrics: use metrics.counter/gauge/histogram/startTimer/stopTimer/measure and expose new series safely
- Structured logs: createModuleLogger("module"), include correlation and tenant context

## How to run locally

- npm run dev in Backend (or appropriate script) to start with development logging, metrics enabled, and relaxed limits
- Optional flags via src/core/server.ts: --port, --host, --skip-health, --skip-db
- Environment: copy .env.example, ensure JWT_SECRET, and DATABASE_URL if REQUIRE_DB_ON_START=true

## Cross-references

- Core deep dive: ./CORE_INFRASTRUCTURE_DOCUMENTATION.md
- Canonical architecture index: ../../docs/architecture/README.md
- Canonical model ownership and enums:
  - ../../docs/architecture/ERP_MODULE_STRUCTURE.md
  - ../../docs/architecture/ERP_ENUMS_REFERENCE.md

Back to Architecture Index → ../../docs/architecture/README.md
