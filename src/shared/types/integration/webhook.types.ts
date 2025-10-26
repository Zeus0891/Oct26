/**
 * Integration Webhook Types
 *
 * Defines standardized webhook payload structures and delivery tracking
 * for real-time event notifications and system-to-system communication.
 * Supports enterprise-grade webhook management with retry logic and monitoring.
 *
 * @description Webhook event management and delivery tracking
 * @aligned_with Prisma tables: Webhook, WebhookDelivery, WebhookEndpoint, WebhookEvent
 * @aligned_with Prisma enums: DeliveryStatus, DeliveryChannel
 */

import type {
  DeliveryStatus,
  DeliveryChannel,
  RetentionPolicy,
} from "@prisma/client";

/**
 * Base webhook configuration
 */
export interface WebhookConfig {
  /** Webhook ID */
  id: string;
  /** Webhook name */
  name: string;
  /** Webhook description */
  description?: string;
  /** Target URL for webhook delivery */
  url: string;
  /** HTTP method */
  method: "POST" | "PUT" | "PATCH";
  /** Headers to include */
  headers: Record<string, string>;
  /** Whether webhook is active */
  isActive: boolean;
  /** Secret for signature verification */
  secret?: string;
  /** Signature algorithm */
  signatureAlgorithm?: "SHA256" | "SHA1" | "MD5";
  /** Timeout in seconds */
  timeoutSeconds: number;
  /** Retry configuration */
  retryConfig: WebhookRetryConfig;
}

/**
 * Webhook retry configuration
 */
export interface WebhookRetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in seconds */
  initialDelaySeconds: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Maximum delay in seconds */
  maxDelaySeconds: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff: boolean;
  /** HTTP status codes that should trigger retries */
  retryableStatusCodes: number[];
}

/**
 * Webhook endpoint configuration aligned with WebhookEndpoint table
 */
export interface WebhookEndpointInfo {
  /** Endpoint ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
  /** Endpoint configuration */
  config: WebhookConfig;
  /** Event types this endpoint subscribes to */
  subscribedEvents: string[];
  /** Filtering rules */
  filters?: WebhookEventFilter[];
  /** Endpoint status */
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "FAILED";
  /** Health information */
  health: {
    isHealthy: boolean;
    lastHealthCheck: Date;
    consecutiveFailures: number;
    averageResponseTime: number;
  };
  /** Delivery statistics */
  statistics: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageDeliveryTime: number;
    lastDeliveryAt?: Date;
  };
}

/**
 * Webhook event filter
 */
export interface WebhookEventFilter {
  /** Filter field path */
  field: string;
  /** Filter operator */
  operator: "EQUALS" | "NOT_EQUALS" | "IN" | "NOT_IN" | "CONTAINS" | "MATCHES";
  /** Filter value */
  value: unknown;
  /** Logical operator with next filter */
  logicalOperator?: "AND" | "OR";
}

/**
 * Webhook event aligned with WebhookEvent table
 */
export interface WebhookEventInfo {
  /** Event ID */
  id: string;
  /** Event type */
  eventType: string;
  /** Event source */
  source: string;
  /** Event version */
  version: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event data */
  data: Record<string, unknown>;
  /** Event metadata */
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    tenantId?: string;
    traceId?: string;
  };
  /** Data classification */
  dataClassification: string;
  /** Retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * Webhook delivery aligned with WebhookDelivery table
 */
export interface WebhookDeliveryInfo {
  /** Delivery ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Webhook endpoint ID */
  webhookEndpointId: string;
  /** Event ID being delivered */
  eventId: string;
  /** Delivery status from DeliveryStatus enum */
  status: DeliveryStatus;
  /** Delivery channel from DeliveryChannel enum */
  channel: DeliveryChannel;
  /** Delivery attempt number */
  attemptNumber: number;
  /** HTTP status code received */
  httpStatusCode?: number;
  /** Response headers */
  responseHeaders?: Record<string, string>;
  /** Response body */
  responseBody?: string;
  /** Delivery duration in milliseconds */
  deliveryDurationMs?: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Error code if failed */
  errorCode?: string;
  /** Scheduled delivery time */
  scheduledAt: Date;
  /** Actual delivery time */
  deliveredAt?: Date;
  /** Next retry time (if applicable) */
  nextRetryAt?: Date;
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  /** Payload ID */
  id: string;
  /** Event information */
  event: WebhookEventInfo;
  /** Delivery metadata */
  delivery: {
    attempt: number;
    timestamp: Date;
    endpoint: string;
  };
  /** Signature for verification */
  signature?: string;
  /** Payload format version */
  version: string;
}

/**
 * Webhook delivery request
 */
export interface WebhookDeliveryRequest {
  /** Event to deliver */
  event: WebhookEventInfo;
  /** Target endpoints */
  endpointIds: string[];
  /** Delivery options */
  options?: {
    /** Priority level */
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    /** Delay delivery by seconds */
    delaySeconds?: number;
    /** Force immediate delivery */
    immediate?: boolean;
    /** Skip filters */
    skipFilters?: boolean;
  };
}

/**
 * Webhook batch delivery request
 */
export interface WebhookBatchDeliveryRequest {
  /** Events to deliver */
  events: WebhookEventInfo[];
  /** Target endpoints */
  endpointIds: string[];
  /** Batch options */
  batchOptions: {
    /** Maximum batch size */
    maxBatchSize: number;
    /** Batch timeout in seconds */
    timeoutSeconds: number;
    /** Whether to fail entire batch on single failure */
    failOnAnyError: boolean;
  };
}

/**
 * Webhook subscription management
 */
export interface WebhookSubscription {
  /** Subscription ID */
  id: string;
  /** Endpoint ID */
  endpointId: string;
  /** Event types */
  eventTypes: string[];
  /** Subscription filters */
  filters?: WebhookEventFilter[];
  /** Subscription status */
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  /** Created by */
  createdBy: string;
  /** Created at */
  createdAt: Date;
  /** Last modified */
  lastModifiedAt: Date;
}

/**
 * Webhook delivery analytics
 */
export interface WebhookDeliveryMetrics {
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** Endpoint ID (if specific endpoint) */
  endpointId?: string;
  /** Total deliveries attempted */
  totalDeliveries: number;
  /** Successful deliveries */
  successfulDeliveries: number;
  /** Failed deliveries */
  failedDeliveries: number;
  /** Success rate percentage */
  successRate: number;
  /** Average delivery time */
  averageDeliveryTime: number;
  /** Deliveries by status */
  deliveriesByStatus: Record<string, number>;
  /** Deliveries by event type */
  deliveriesByEventType: Record<string, number>;
  /** Error analysis */
  errorAnalysis: Array<{
    errorCode: string;
    errorMessage: string;
    frequency: number;
    lastOccurrence: Date;
  }>;
  /** Response time percentiles */
  responseTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

/**
 * Webhook health check result
 */
export interface WebhookHealthCheckResult {
  /** Endpoint ID */
  endpointId: string;
  /** Health status */
  isHealthy: boolean;
  /** Check timestamp */
  checkedAt: Date;
  /** Response time in milliseconds */
  responseTimeMs: number;
  /** HTTP status code */
  statusCode?: number;
  /** Error message if unhealthy */
  errorMessage?: string;
  /** Health score (0-1) */
  healthScore: number;
}

/**
 * Webhook security validation
 */
export interface WebhookSecurityValidation {
  /** Signature validation */
  signatureValid: boolean;
  /** Timestamp validation */
  timestampValid: boolean;
  /** IP address validation */
  ipAddressValid: boolean;
  /** Rate limit status */
  rateLimitStatus: {
    withinLimits: boolean;
    currentCount: number;
    limitPerWindow: number;
    windowResetAt: Date;
  };
  /** Validation errors */
  validationErrors?: string[];
}

/**
 * Webhook event transformation
 */
export interface WebhookEventTransformation {
  /** Transformation ID */
  id: string;
  /** Source event type */
  sourceEventType: string;
  /** Target format */
  targetFormat: string;
  /** Transformation rules */
  rules: Array<{
    sourceField: string;
    targetField: string;
    transformation?: string;
    defaultValue?: unknown;
  }>;
  /** Template for transformation */
  template?: string;
  /** Whether transformation is active */
  isActive: boolean;
}

/**
 * Webhook replay request
 */
export interface WebhookReplayRequest {
  /** Replay ID */
  id: string;
  /** Event IDs to replay */
  eventIds?: string[];
  /** Time range for replay */
  timeRange?: {
    startTime: Date;
    endTime: Date;
  };
  /** Event type filter */
  eventTypeFilter?: string[];
  /** Target endpoints */
  endpointIds: string[];
  /** Replay options */
  options: {
    /** Preserve original timestamps */
    preserveTimestamps: boolean;
    /** Replay speed multiplier */
    speedMultiplier: number;
    /** Maximum concurrent deliveries */
    maxConcurrent: number;
  };
}

/**
 * Webhook debugging information
 */
export interface WebhookDebugInfo {
  /** Request information */
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    timestamp: Date;
  };
  /** Response information */
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    timestamp: Date;
    duration: number;
  };
  /** Error information */
  error?: {
    code: string;
    message: string;
    stack?: string;
    timestamp: Date;
  };
  /** Network information */
  network?: {
    dnsLookupTime: number;
    tcpConnectionTime: number;
    tlsHandshakeTime: number;
    totalTime: number;
  };
}
