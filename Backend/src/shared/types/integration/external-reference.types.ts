/**
 * Integration External Reference Types
 *
 * Defines mapping references between internal entities and external systems.
 * These types support integration with CRM, ERP, and other external systems
 * by maintaining bidirectional reference mappings with audit trails.
 *
 * @description External system reference mapping for integrations
 * @aligned_with Prisma tables: IntegrationMapping, IntegrationProvider, ExternalShareLink
 * @aligned_with Prisma enums: None (mainly uses string references)
 */

import type {
  IntegrationCategory,
  IntegrationProviderStatus,
  RetentionPolicy,
} from "@prisma/client";

/**
 * External reference mapping between internal and external entities
 */
export interface ExternalReference {
  /** Internal entity ID */
  internalId: string;
  /** Internal entity type */
  internalType: string;
  /** External system identifier */
  externalId: string;
  /** External system name */
  externalSystem: string;
  /** External entity type */
  externalType: string;
  /** Reference direction */
  direction: "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
  /** Whether reference is active */
  isActive: boolean;
  /** Last synchronized timestamp */
  lastSyncedAt?: Date;
}

/**
 * Integration mapping aligned with IntegrationMapping table
 */
export interface IntegrationMappingInfo {
  /** Mapping ID */
  id: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Version for optimistic locking */
  version: number;
  /** Data classification */
  dataClassification: string;
  /** Retention policy */
  retentionPolicy?: RetentionPolicy;
  /** Integration connection ID */
  integrationConnectionId: string;
  /** Internal entity details */
  internalEntity: {
    /** Entity ID */
    id: string;
    /** Entity type */
    type: string;
    /** Entity schema version */
    schemaVersion?: string;
  };
  /** External entity details */
  externalEntity: {
    /** External ID */
    id: string;
    /** External type */
    type: string;
    /** External system identifier */
    systemId: string;
  };
  /** Mapping configuration */
  mappingConfig: {
    /** Field mappings */
    fieldMappings: FieldMapping[];
    /** Transformation rules */
    transformationRules?: TransformationRule[];
    /** Sync preferences */
    syncPreferences: SyncPreferences;
  };
  /** Mapping status */
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "FAILED";
  /** Last sync information */
  lastSync?: {
    timestamp: Date;
    status: "SUCCESS" | "FAILED" | "PARTIAL";
    recordsProcessed: number;
    errorsEncountered: number;
  };
}

/**
 * Field mapping between internal and external fields
 */
export interface FieldMapping {
  /** Internal field path */
  internalField: string;
  /** External field path */
  externalField: string;
  /** Mapping type */
  mappingType: "DIRECT" | "TRANSFORMED" | "CALCULATED" | "LOOKUP";
  /** Data type */
  dataType: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "OBJECT" | "ARRAY";
  /** Whether field is required */
  isRequired: boolean;
  /** Default value if field is missing */
  defaultValue?: unknown;
  /** Transformation expression */
  transformation?: string;
  /** Validation rules for external references */
  validation?: ExternalReferenceValidationRule[];
}

/**
 * Transformation rule for data conversion
 */
export interface TransformationRule {
  /** Rule ID */
  id: string;
  /** Rule name */
  name: string;
  /** Rule expression or function */
  expression: string;
  /** Rule type */
  type:
    | "FIELD_TRANSFORM"
    | "DATA_CLEANSING"
    | "FORMAT_CONVERSION"
    | "VALIDATION";
  /** Execution order */
  order: number;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * External reference validation rule
 */
export interface ExternalReferenceValidationRule {
  /** Validation rule name */
  name: string;
  /** Rule condition */
  condition: string;
  /** Error message if validation fails */
  errorMessage: string;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Sync preferences configuration
 */
export interface SyncPreferences {
  /** Sync direction */
  direction: "PULL" | "PUSH" | "BIDIRECTIONAL";
  /** Sync frequency */
  frequency: "REAL_TIME" | "SCHEDULED" | "MANUAL";
  /** Schedule expression (if scheduled) */
  scheduleExpression?: string;
  /** Batch size for sync operations */
  batchSize: number;
  /** Conflict resolution strategy */
  conflictResolution:
    | "INTERNAL_WINS"
    | "EXTERNAL_WINS"
    | "TIMESTAMP_WINS"
    | "MANUAL";
  /** Whether to sync deletes */
  syncDeletes: boolean;
  /** Retry configuration */
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}

/**
 * Integration provider aligned with IntegrationProvider table
 */
export interface IntegrationProviderInfo {
  /** Provider ID */
  id: string;
  /** Provider status */
  status: IntegrationProviderStatus;
  /** Provider name */
  providerName: string;
  /** Provider code */
  providerCode: string;
  /** Provider description */
  description?: string;
  /** Provider URLs */
  urls: {
    logo?: string;
    website?: string;
    documentation?: string;
    support?: string;
  };
  /** Provider category */
  category: IntegrationCategory;
  /** Authentication type */
  authenticationType: string;
  /** API configuration */
  apiConfig: {
    version?: string;
    baseUrl: string;
    supportedRegions?: string[];
    supportedCountries?: string[];
  };
  /** Capabilities */
  capabilities: string[];
  /** Rate limits */
  rateLimits?: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  };
  /** Enterprise features */
  enterpriseFeatures: {
    isEnterprise: boolean;
    requiresApproval: boolean;
    maxConnections?: number;
    requiresEncryption: boolean;
    supportsSSO: boolean;
  };
  /** Compliance information */
  compliance: {
    standards?: string[];
    certifications?: string[];
    dataRetentionDays?: number;
  };
}

/**
 * External share link aligned with ExternalShareLink table
 */
export interface ExternalShareLinkInfo {
  /** Link ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Shared entity ID */
  entityId: string;
  /** Shared entity type */
  entityType: string;
  /** Share token */
  shareToken: string;
  /** Share URL */
  shareUrl: string;
  /** Share permissions */
  permissions: string[];
  /** Expiration date */
  expiresAt?: Date;
  /** Whether link is active */
  isActive: boolean;
  /** Access count */
  accessCount: number;
  /** Last accessed timestamp */
  lastAccessedAt?: Date;
  /** Access restrictions */
  restrictions?: {
    allowedIps?: string[];
    allowedDomains?: string[];
    maxAccesses?: number;
    requiresAuthentication?: boolean;
  };
}

/**
 * External reference sync operation
 */
export interface ExternalReferenceSyncOperation {
  /** Operation ID */
  id: string;
  /** Operation type */
  type: "FULL_SYNC" | "INCREMENTAL_SYNC" | "ENTITY_SYNC" | "FIELD_SYNC";
  /** Source system */
  sourceSystem: string;
  /** Target system */
  targetSystem: string;
  /** Entity mappings involved */
  mappingIds: string[];
  /** Operation status */
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  /** Started timestamp */
  startedAt: Date;
  /** Completed timestamp */
  completedAt?: Date;
  /** Operation statistics */
  statistics?: {
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    skippedRecords: number;
  };
  /** Error information */
  errors?: Array<{
    recordId: string;
    errorCode: string;
    errorMessage: string;
    fieldErrors?: Record<string, string>;
  }>;
}

/**
 * Cross-reference lookup result
 */
export interface CrossReferenceLookupResult {
  /** Whether reference was found */
  found: boolean;
  /** External reference if found */
  reference?: ExternalReference;
  /** Suggested mappings if not found */
  suggestions?: ExternalReference[];
  /** Confidence score (0-1) */
  confidence?: number;
  /** Lookup metadata */
  metadata?: {
    searchCriteria: Record<string, unknown>;
    searchDuration: number;
    cacheHit: boolean;
  };
}

/**
 * Reference audit trail entry
 */
export interface ReferenceAuditEntry {
  /** Audit ID */
  id: string;
  /** Reference ID */
  referenceId: string;
  /** Action performed */
  action: "CREATED" | "UPDATED" | "DELETED" | "SYNCED" | "ACCESSED";
  /** Actor who performed action */
  actorId: string;
  /** Timestamp */
  timestamp: Date;
  /** Changes made */
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Bulk reference operation
 */
export interface BulkReferenceOperation {
  /** Operation ID */
  id: string;
  /** Operation type */
  operationType: "CREATE" | "UPDATE" | "DELETE" | "SYNC";
  /** Reference IDs or criteria */
  references: string[] | Record<string, unknown>;
  /** Operation parameters */
  parameters: Record<string, unknown>;
  /** Actor performing operation */
  actorId: string;
  /** Operation status */
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  /** Progress information */
  progress?: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
}

/**
 * Reference validation result
 */
export interface ReferenceValidationResult {
  /** Whether reference is valid */
  isValid: boolean;
  /** Validation errors */
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  /** Validation warnings */
  warnings?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  /** Data quality score (0-1) */
  qualityScore?: number;
}

/**
 * Reference metrics and analytics
 */
export interface ReferenceMetrics {
  /** Time period */
  periodStart: Date;
  periodEnd: Date;
  /** Total references */
  totalReferences: number;
  /** Active references */
  activeReferences: number;
  /** References by system */
  referencesBySystem: Record<string, number>;
  /** Sync success rate */
  syncSuccessRate: number;
  /** Average sync time */
  averageSyncTime: number;
  /** Top integrated systems */
  topSystems: Array<{
    systemName: string;
    referenceCount: number;
    successRate: number;
  }>;
  /** Data quality metrics */
  dataQuality: {
    averageQualityScore: number;
    validationFailureRate: number;
    commonErrors: Array<{
      errorCode: string;
      frequency: number;
    }>;
  };
}
