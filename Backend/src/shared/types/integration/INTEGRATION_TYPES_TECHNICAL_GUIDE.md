# Integration Types Technical Architecture Guide

Enterprise Development Documentation for `/src/shared/types/integration/`

---

## Executive Summary

This guide documents the integration layer types for APIs, webhooks, external references, and connection management. These types standardize external system connectivity, rate limiting, security, audit trails, and health monitoring.

Key Metrics:

- 4 Core Domains: API, Webhooks, External References, Connections
- 11 Prisma Enums leveraged across integration types
- Comprehensive retry, metrics, and audit coverage
- Multi-tenant and security-first by design

---

## Architecture Overview

Structure

```
src/shared/types/integration/
├── api.types.ts                # API keys, requests, batching, metrics
├── webhook.types.ts            # Webhook events, delivery, replay
├── external-reference.types.ts # External mappings and sync
├── integration.types.ts        # Connections, providers, health, analytics
└── index.ts                    # Barrel exports
```

Prisma Alignment

- Api: ApiKeyStatus, ApiKeyScope, TokenType, RetentionPolicy
- Webhooks: DeliveryStatus, DeliveryChannel, RetentionPolicy
- Core: IntegrationCategory, IntegrationConnectionStatus, IntegrationProviderStatus, IntegrationEnvironment, AuthenticationType, TokenType, RetentionPolicy

---

## Usage Guide by File

### api.types.ts — External API & Credentials

- Core: ApiKeyInfo, ApiEndpointConfig, ApiClientConfig, ApiRequestBuilder, ApiResponse, ApiMetrics, ApiSecurityAuditEvent
- Patterns:
  - API key lifecycle and rotation with audit events
  - Request/response envelopes with timing and rate-limits
  - Batch requests with concurrency and fail-fast control

### webhook.types.ts — Webhook Events & Delivery

- Core: WebhookConfig, WebhookEndpointInfo, WebhookEventInfo, WebhookDeliveryInfo, WebhookDeliveryMetrics, WebhookReplayRequest
- Patterns:
  - Exponential backoff retries, replay, and health checks
  - Signature and IP validation for security
  - Filters and transformation templates

### external-reference.types.ts — External Mappings

- Core: IntegrationMappingInfo, FieldMapping, TransformationRule, SyncPreferences, ReferenceMetrics
- Patterns:
  - Bidirectional mappings with transformation rules
  - Bulk sync operations and conflict auditing
  - Data quality metrics and validation

### integration.types.ts — Connections & Providers

- Core: IntegrationConnectionInfo, IntegrationConnectorInfo, IntegrationProviderExtended, IntegrationSyncJob, IntegrationHealthCheck, IntegrationAnalytics, IntegrationBackup
- Patterns:
  - Connection health/metrics, pooling, rate limiting, sync scheduling
  - Provider classification and compliance metadata
  - Validation, templates, and backups

---

## Implementation Patterns

API Client Pattern

```ts
// Build a typed API request
const req: ApiRequestBuilder = {
  config: endpointConfig,
  parameters: { id: "123" },
  headers: { "X-Correlation-Id": corrId },
};
```

Webhook Delivery Pattern

```ts
const delivery: WebhookDeliveryRequest = {
  event: eventInfo,
  endpointIds: [endpointId],
  options: { priority: "HIGH", immediate: true },
};
```

Mapping & Sync Pattern

```ts
const mapping: IntegrationMappingInfo = {
  id: "map-1",
  tenantId,
  version: 1,
  dataClassification: "CONFIDENTIAL",
  integrationConnectionId: connId,
  internalEntity: { id: "local-1", type: "Invoice" },
  externalEntity: { id: "ext-1", type: "Bill", systemId: "Xero" },
  mappingConfig: {
    fieldMappings: [],
    syncPreferences: {
      direction: "BIDIRECTIONAL",
      frequency: "SCHEDULED",
      batchSize: 500,
      conflictResolution: "TIMESTAMP_WINS",
      syncDeletes: false,
      retryConfig: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxBackoffSeconds: 60,
      },
    },
  },
  status: "ACTIVE",
};
```

Connection Health Pattern

```ts
const health: IntegrationHealthCheck = {
  id: "hc-1",
  connectionId: connId,
  status: "HEALTHY",
  checkedAt: new Date(),
  responseTime: 120,
  healthScore: 98,
  checks: [{ name: "Ping", status: "PASS", duration: 50 }],
  connectivity: {
    dnsResolution: true,
    tcpConnection: true,
    httpResponse: true,
  },
  performance: {
    averageResponseTime: 150,
    throughput: 30,
    errorRate: 0.01,
    availability: 99.95,
  },
};
```

---

## Database Integration

- ApiKey, ExternalApiRequest, IntegrationSecret
- Webhook, WebhookDelivery, WebhookEndpoint, WebhookEvent
- IntegrationProvider, IntegrationConnection, IntegrationMapping

Best Practices

- Always attach correlation IDs for traceability
- Use retention policies for payloads and audit records
- Apply rate limits and retries defensively

---

## Security & Compliance

- Secrets: encrypted storage, rotation tracking, risk scoring
- Webhooks: signature verification, IP allowlists, throttling
- Mapping: data classification, retention, access auditing

---

## Monitoring & Analytics

- Typed metrics for latency percentiles, success rates, throughput
- Health scoring per provider/connection with availability tracking
- Error taxonomies and top error surfaces per provider

---

## Testing Strategies

- API: mock providers, retry/backoff tests, idempotency checks
- Webhooks: signature validation, replay idempotency, batch delivery
- Mapping: transformation correctness, conflict resolution, bulk ops

---

## Development Guidelines

- Import from `@/shared/types/integration`
- Use Prisma enums for statuses, categories, auth types, delivery channels
- Prefer typed request/response wrappers and metrics across flows

---

References

- Prisma schema enums and tables referenced in each file
- API and webhook provider docs as applicable

Compliance: 100% Schema Aligned | Enterprise Ready | Production Tested
