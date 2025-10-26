/**
 * Integration API Types
 *
 * Defines common structures for external API interactions and credentials
 * management. These types support secure API key management, rate limiting,
 * and comprehensive audit trails for API access and usage.
 *
 * @description External API interaction and credential management
 * @aligned_with Prisma tables: ApiKey, ExternalApiRequest, IntegrationSecret
 * @aligned_with Prisma enums: ApiKeyStatus, ApiKeyScope, IntegrationType, ApiRateLimitTier
 */

import type {
  ApiKeyStatus,
  ApiKeyScope,
  RetentionPolicy,
  TokenType,
} from "@prisma/client";

/**
 * API key information aligned with ApiKey table
 */
export interface ApiKeyInfo {
  /** API key ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Key status from ApiKeyStatus enum */
  status: ApiKeyStatus;
  /** Key scope from ApiKeyScope enum */
  scope: ApiKeyScope;
  /** Associated user ID */
  userId?: string;
  /** Associated member ID */
  memberId?: string;
  /** Associated service account ID */
  serviceAccountId?: string;
  /** Key name */
  name: string;
  /** Key description */
  description?: string;
  /** Key prefix (visible part) */
  keyPrefix: string;
  /** Key hint (last few characters) */
  keyHint: string;
  /** Permissions granted to this key */
  permissions: string[];
  /** Access restrictions */
  restrictions: {
    allowedIps?: string[];
    allowedDomains?: string[];
    allowedEnvironments?: string[];
  };
  /** Usage limits */
  limits: {
    dailyLimit?: number;
    monthlyLimit?: number;
    rateLimit?: number;
    rateLimitWindow?: number;
  };
  /** Current usage */
  usage: {
    useCount: number;
    currentDailyUse: number;
    currentMonthlyUse: number;
    lastUsedAt?: Date;
  };
  /** Key lifecycle */
  lifecycle: {
    isActive: boolean;
    expiresAt?: Date;
    revokedAt?: Date;
    revocationReason?: string;
    revokedByMemberId?: string;
    rotatedAt?: Date;
    rotatedFromKeyId?: string;
  };
  /** Security information */
  security: {
    riskScore: number;
    suspiciousActivity: boolean;
    lastFailureAt?: Date;
    failureCount: number;
  };
  /** Environment and tagging */
  environment: string;
  tags: string[];
  /** Data classification */
  dataClassification: string;
  /** Retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * API request information for external API calls
 */
export interface ExternalApiRequestInfo {
  /** Request ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Integration connection ID */
  integrationConnectionId: string;
  /** API endpoint */
  endpoint: string;
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  /** Request headers */
  headers: Record<string, string>;
  /** Request body */
  requestBody?: string;
  /** Response information */
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    size: number;
  };
  /** Timing information */
  timing: {
    startedAt: Date;
    completedAt?: Date;
    durationMs?: number;
    timeoutMs: number;
  };
  /** Request status */
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "SUCCESS"
    | "FAILED"
    | "TIMEOUT"
    | "CANCELLED";
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  /** Rate limiting */
  rateLimiting?: {
    remaining: number;
    resetAt: Date;
    isThrottled: boolean;
  };
}

/**
 * Integration secret management
 */
export interface IntegrationSecretInfo {
  /** Secret ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Integration connection ID */
  integrationConnectionId: string;
  /** Secret name */
  name: string;
  /** Secret type */
  type:
    | "API_KEY"
    | "CLIENT_SECRET"
    | "PRIVATE_KEY"
    | "CERTIFICATE"
    | "TOKEN"
    | "PASSWORD";
  /** Secret description */
  description?: string;
  /** Whether secret is encrypted */
  isEncrypted: boolean;
  /** Secret metadata */
  metadata: {
    algorithm?: string;
    keySize?: number;
    expiresAt?: Date;
    issuer?: string;
    audience?: string[];
  };
  /** Usage tracking */
  usage: {
    lastUsedAt?: Date;
    useCount: number;
    lastRotatedAt?: Date;
  };
  /** Secret status */
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "REVOKED" | "COMPROMISED";
  /** Data classification */
  dataClassification: string;
  /** Retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * API rate limit configuration
 */
export interface ApiRateLimit {
  /** Rate limit tier */
  tier: string;
  /** Requests per window */
  requestsPerWindow: number;
  /** Window duration in seconds */
  windowDurationSeconds: number;
  /** Burst allowance */
  burstAllowance?: number;
  /** Current usage */
  currentUsage: number;
  /** Window reset time */
  windowResetAt: Date;
  /** Whether currently throttled */
  isThrottled: boolean;
}

/**
 * API authentication configuration
 */
export interface ApiAuthConfig {
  /** Authentication type */
  type: "API_KEY" | "BEARER_TOKEN" | "BASIC_AUTH" | "OAUTH2" | "HMAC" | "JWT";
  /** Authentication parameters */
  parameters: Record<string, unknown>;
  /** Token information */
  token?: {
    type: TokenType;
    value: string;
    expiresAt?: Date;
    refreshToken?: string;
    refreshExpiresAt?: Date;
    scopes?: string[];
  };
  /** Header configuration */
  headers?: Record<string, string>;
  /** Query parameters */
  queryParams?: Record<string, string>;
}

/**
 * API endpoint configuration
 */
export interface ApiEndpointConfig {
  /** Endpoint ID */
  id: string;
  /** Endpoint name */
  name: string;
  /** Base URL */
  baseUrl: string;
  /** Endpoint path */
  path: string;
  /** HTTP method */
  method: string;
  /** Authentication configuration */
  auth: ApiAuthConfig;
  /** Request configuration */
  request: {
    headers: Record<string, string>;
    queryParams?: Record<string, string>;
    bodyTemplate?: string;
    timeout: number;
  };
  /** Response configuration */
  response: {
    expectedStatusCodes: number[];
    successCriteria?: string;
    errorMapping?: Record<string, string>;
  };
  /** Rate limiting */
  rateLimit?: ApiRateLimit;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Client ID */
  id: string;
  /** Client name */
  name: string;
  /** Provider information */
  provider: {
    name: string;
    baseUrl: string;
    version?: string;
  };
  /** Authentication */
  authentication: ApiAuthConfig;
  /** Default headers */
  defaultHeaders: Record<string, string>;
  /** Timeout configuration */
  timeouts: {
    connect: number;
    request: number;
    read: number;
  };
  /** Retry configuration */
  retry: {
    maxAttempts: number;
    backoffMultiplier: number;
    retryableStatusCodes: number[];
  };
  /** Rate limiting */
  rateLimit?: ApiRateLimit;
}

/**
 * API request builder
 */
export interface ApiRequestBuilder {
  /** Request configuration */
  config: ApiEndpointConfig;
  /** Request parameters */
  parameters?: Record<string, unknown>;
  /** Request body */
  body?: Record<string, unknown> | string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters */
  queryParams?: Record<string, string>;
  /** Timeout override */
  timeout?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Request ID */
  requestId: string;
  /** Response status */
  status: "SUCCESS" | "ERROR" | "TIMEOUT";
  /** HTTP status code */
  statusCode: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response data */
  data?: T;
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  /** Timing information */
  timing: {
    requestedAt: Date;
    respondedAt: Date;
    durationMs: number;
  };
  /** Rate limit information */
  rateLimit?: {
    remaining: number;
    resetAt: Date;
    limit: number;
  };
}

/**
 * API batch request
 */
export interface ApiBatchRequest {
  /** Batch ID */
  id: string;
  /** Individual requests */
  requests: ApiRequestBuilder[];
  /** Batch configuration */
  config: {
    maxConcurrency: number;
    timeout: number;
    failFast: boolean;
    continueOnError: boolean;
  };
  /** Batch status */
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  /** Progress information */
  progress?: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
  };
}

/**
 * API monitoring and metrics
 */
export interface ApiMetrics {
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** API endpoint or client */
  apiIdentifier: string;
  /** Total requests */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Success rate */
  successRate: number;
  /** Average response time */
  averageResponseTime: number;
  /** Response time percentiles */
  responseTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  /** Error breakdown */
  errorBreakdown: Array<{
    statusCode: number;
    errorCode: string;
    count: number;
    percentage: number;
  }>;
  /** Rate limit hits */
  rateLimitHits: number;
  /** Throughput (requests per second) */
  throughput: number;
}

/**
 * API key rotation request
 */
export interface ApiKeyRotationRequest {
  /** Current API key ID */
  currentKeyId: string;
  /** Rotation reason */
  reason: string;
  /** New key configuration */
  newKeyConfig?: Partial<ApiKeyInfo>;
  /** Rotation options */
  options: {
    /** Grace period before old key expires */
    gracePeriodHours: number;
    /** Whether to immediately disable old key */
    immediateRevocation: boolean;
    /** Notification preferences */
    notifyUsers: boolean;
  };
}

/**
 * API security audit event
 */
export interface ApiSecurityAuditEvent {
  /** Event ID */
  id: string;
  /** Event type */
  eventType:
    | "KEY_CREATED"
    | "KEY_USED"
    | "KEY_ROTATED"
    | "KEY_REVOKED"
    | "SUSPICIOUS_ACTIVITY"
    | "RATE_LIMIT_EXCEEDED";
  /** API key ID */
  apiKeyId: string;
  /** Actor information */
  actor: {
    id: string;
    type: "USER" | "SERVICE" | "SYSTEM";
    ipAddress?: string;
    userAgent?: string;
  };
  /** Event timestamp */
  timestamp: Date;
  /** Event details */
  details: {
    endpoint?: string;
    statusCode?: number;
    riskScore?: number;
    anomalies?: string[];
  };
  /** Event metadata */
  metadata?: Record<string, unknown>;
}
