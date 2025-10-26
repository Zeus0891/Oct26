/**
 * Integration Types
 *
 * Defines generic structures for system-to-system integrations including
 * connection management, authentication, and monitoring. These types provide
 * a foundation for all integration patterns and external system connectivity.
 *
 * @description Generic integration and connection management
 * @aligned_with Prisma tables: IntegrationProvider, IntegrationConnection, IntegrationMapping
 * @aligned_with Prisma enums: IntegrationStatus, IntegrationAuthType, IntegrationCategory, IntegrationConnectionStatus
 */

import type {
  IntegrationCategory,
  IntegrationConnectionStatus,
  IntegrationProviderStatus,
  IntegrationEnvironment,
  AuthenticationType,
  TokenType,
  RetentionPolicy,
} from "@prisma/client";

/**
 * Integration capabilities enum
 * Defines what operations an integration can perform
 */
export type IntegrationCapability =
  | "READ_ONLY"
  | "WRITE_ONLY"
  | "BIDIRECTIONAL"
  | "REAL_TIME"
  | "BULK_IMPORT"
  | "BULK_EXPORT"
  | "WEBHOOK_SUPPORT"
  | "FILE_UPLOAD"
  | "FILE_DOWNLOAD"
  | "STREAMING";

/**
 * Integration connection aligned with IntegrationConnection table
 */
export interface IntegrationConnectionInfo {
  /** Connection ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Global connection ID for cross-tenant references */
  globalId: string;
  /** Integration connector ID */
  integrationConnectorId: string;
  /** Connection configuration */
  config: {
    name: string;
    description?: string;
    externalConnectionId?: string;
  };
  /** Connection status from IntegrationConnectionStatus enum */
  status: IntegrationConnectionStatus;
  /** Connection health information */
  health: {
    status: string; // ConnectionHealthStatus enum value
    lastSuccessfulConnect?: Date;
    lastFailedConnect?: Date;
    consecutiveFailures: number;
  };
  /** Authentication information */
  authentication: {
    tokenType?: TokenType;
    tokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
    lastTokenRefresh?: Date;
    authorizationScopes?: string;
  };
  /** API configuration */
  apiConfig: {
    endpoint?: string;
    version?: string;
    userAgent?: string;
    parameters?: Record<string, unknown>;
  };
  /** External system information */
  externalSystem: {
    userId?: string;
    userEmail?: string;
    accountName?: string;
    companyId?: string;
  };
  /** Performance metrics */
  performance: {
    averageResponseTime?: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastRequestAt?: Date;
  };
  /** Rate limiting */
  rateLimiting: {
    currentRateLimit?: number;
    remainingRequests?: number;
    rateLimitResetAt?: Date;
    isThrottled: boolean;
  };
  /** Connection pooling */
  pooling: {
    maxPoolSize: number;
    currentPoolSize: number;
    activeConnections: number;
    idleTimeout: number;
  };
  /** Synchronization */
  synchronization: {
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    frequency?: string;
    totalSyncJobs: number;
  };
  /** Error tracking */
  errorTracking: {
    lastError?: string;
    lastErrorAt?: Date;
  };
  /** Data classification */
  dataClassification: string;
  /** Retention policy */
  retentionPolicy?: RetentionPolicy;
}

/**
 * Integration connector configuration
 */
export interface IntegrationConnectorInfo {
  /** Connector ID */
  id: string;
  /** Integration provider ID */
  integrationProviderId: string;
  /** Connector configuration */
  config: {
    name: string;
    description?: string;
    version: string;
    connectorType: string;
  };
  /** Connector capabilities */
  capabilities: IntegrationCapability[];
  /** Supported operations */
  supportedOperations: Array<{
    operation: string;
    method: string;
    endpoint: string;
    parameters?: Record<string, unknown>;
  }>;
  /** Authentication requirements */
  authenticationConfig: {
    type: AuthenticationType;
    parameters: Record<string, unknown>;
    scopes?: string[];
    redirectUri?: string;
  };
  /** Connection limits */
  limits: {
    maxConnections?: number;
    rateLimitPerMinute?: number;
    rateLimitPerHour?: number;
    rateLimitPerDay?: number;
  };
  /** Environment configuration */
  environment: IntegrationEnvironment;
  /** Status */
  status: string; // IntegrationConnectorStatus enum value
  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * Integration provider extended information
 */
export interface IntegrationProviderExtended {
  /** Basic provider info */
  provider: {
    id: string;
    name: string;
    code: string;
    description?: string;
    status: IntegrationProviderStatus;
  };
  /** Provider branding */
  branding: {
    logoUrl?: string;
    websiteUrl?: string;
    documentationUrl?: string;
    supportUrl?: string;
  };
  /** Provider classification */
  classification: {
    category: IntegrationCategory;
    isEnterprise: boolean;
    requiresApproval: boolean;
  };
  /** Technical specifications */
  specifications: {
    authenticationType: AuthenticationType;
    apiVersion?: string;
    baseApiUrl: string;
    capabilities?: string[];
  };
  /** Regional and compliance information */
  compliance: {
    supportedRegions?: string[];
    supportedCountries?: string[];
    dataRetentionDays?: number;
    requiresEncryption: boolean;
    supportsSSO: boolean;
    complianceStandards?: string[];
    securityCertifications?: string[];
  };
  /** Service limits */
  serviceLimits: {
    rateLimitPerMinute?: number;
    rateLimitPerHour?: number;
    rateLimitPerDay?: number;
    maxConnections?: number;
  };
}

/**
 * Integration synchronization job
 */
export interface IntegrationSyncJob {
  /** Job ID */
  id: string;
  /** Connection ID */
  connectionId: string;
  /** Job type */
  type: "FULL_SYNC" | "INCREMENTAL_SYNC" | "DELTA_SYNC" | "VALIDATION_SYNC";
  /** Job status */
  status:
    | "PENDING"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "PAUSED";
  /** Job configuration */
  config: {
    syncDirection: "PULL" | "PUSH" | "BIDIRECTIONAL";
    entityTypes: string[];
    filters?: Record<string, unknown>;
    batchSize: number;
    maxRecords?: number;
  };
  /** Job progress */
  progress: {
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    skippedRecords: number;
    percentComplete: number;
  };
  /** Job timing */
  timing: {
    scheduledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletionAt?: Date;
    durationMs?: number;
  };
  /** Error handling */
  errorHandling: {
    errors: Array<{
      recordId?: string;
      errorCode: string;
      errorMessage: string;
      severity: "WARNING" | "ERROR" | "CRITICAL";
    }>;
    errorThreshold: number;
    stopOnError: boolean;
  };
  /** Audit information */
  audit: {
    triggeredBy: string;
    triggerReason: string;
    correlationId?: string;
  };
}

/**
 * Integration monitoring and health check
 */
export interface IntegrationHealthCheck {
  /** Health check ID */
  id: string;
  /** Connection ID */
  connectionId: string;
  /** Health status */
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
  /** Check timestamp */
  checkedAt: Date;
  /** Response time */
  responseTime: number;
  /** Health score (0-100) */
  healthScore: number;
  /** Check details */
  checks: Array<{
    name: string;
    status: "PASS" | "FAIL" | "WARN";
    message?: string;
    duration: number;
    value?: unknown;
    threshold?: unknown;
  }>;
  /** Connectivity tests */
  connectivity: {
    dnsResolution: boolean;
    tcpConnection: boolean;
    sslHandshake?: boolean;
    httpResponse: boolean;
  };
  /** Performance metrics */
  performance: {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
}

/**
 * Integration event for audit and monitoring
 */
export interface IntegrationEvent {
  /** Event ID */
  id: string;
  /** Event type */
  type:
    | "CONNECTION_ESTABLISHED"
    | "CONNECTION_LOST"
    | "SYNC_STARTED"
    | "SYNC_COMPLETED"
    | "ERROR_OCCURRED"
    | "HEALTH_CHECK"
    | "RATE_LIMIT_HIT";
  /** Connection ID */
  connectionId: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event source */
  source: string;
  /** Event severity */
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  /** Event message */
  message: string;
  /** Event data */
  data?: Record<string, unknown>;
  /** Event metadata */
  metadata?: {
    correlationId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Integration configuration template
 */
export interface IntegrationTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Provider ID this template is for */
  providerId: string;
  /** Template category */
  category: string;
  /** Configuration template */
  configTemplate: {
    fields: Array<{
      name: string;
      type:
        | "STRING"
        | "NUMBER"
        | "BOOLEAN"
        | "SELECT"
        | "MULTISELECT"
        | "PASSWORD";
      required: boolean;
      defaultValue?: unknown;
      options?: Array<{ label: string; value: unknown }>;
      validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
      };
    }>;
    sections?: Array<{
      name: string;
      title: string;
      fields: string[];
    }>;
  };
  /** Template version */
  version: string;
  /** Whether template is active */
  isActive: boolean;
  /** Template tags */
  tags: string[];
}

/**
 * Integration analytics and metrics
 */
export interface IntegrationAnalytics {
  /** Analytics period */
  period: {
    startDate: Date;
    endDate: Date;
  };
  /** Connection metrics */
  connections: {
    total: number;
    active: number;
    inactive: number;
    failed: number;
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
  };
  /** Performance metrics */
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    successRate: number;
    errorRate: number;
    throughput: number;
  };
  /** Usage metrics */
  usage: {
    totalSyncJobs: number;
    totalDataTransferred: number;
    apiCallsPerProvider: Record<string, number>;
    mostActiveConnections: Array<{
      connectionId: string;
      requestCount: number;
    }>;
  };
  /** Error analysis */
  errors: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByProvider: Record<string, number>;
    topErrors: Array<{
      errorCode: string;
      message: string;
      frequency: number;
    }>;
  };
  /** Health metrics */
  health: {
    overallHealthScore: number;
    healthByProvider: Record<string, number>;
    availabilityPercentage: number;
    uptimePercentage: number;
  };
}

/**
 * Integration configuration validation
 */
export interface IntegrationConfigValidation {
  /** Validation status */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: "ERROR" | "WARNING";
  }>;
  /** Validation warnings */
  warnings: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  /** Suggestions for improvement */
  suggestions: Array<{
    field: string;
    suggestion: string;
    impact: "LOW" | "MEDIUM" | "HIGH";
  }>;
}

/**
 * Integration backup and restore
 */
export interface IntegrationBackup {
  /** Backup ID */
  id: string;
  /** Backup name */
  name: string;
  /** Backup description */
  description?: string;
  /** Backup timestamp */
  createdAt: Date;
  /** Backed up connections */
  connections: Array<{
    connectionId: string;
    connectionName: string;
    providerId: string;
  }>;
  /** Backup data */
  data: {
    connections: IntegrationConnectionInfo[];
    mappings: Array<Record<string, unknown>>;
    configurations: Array<Record<string, unknown>>;
  };
  /** Backup metadata */
  metadata: {
    version: string;
    createdBy: string;
    tenantId: string;
    size: number;
    checksum: string;
  };
}
