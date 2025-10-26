/**
 * Metadata Types - Extensible metadata and custom field management
 *
 * Depends on Prisma Tables: MetadataField, MetadataValue, CustomField, EntityMetadata
 * Depends on Prisma Enums: DataType, ValidationRule
 *
 * Purpose: Dynamic metadata, custom fields, and extensible data structures across all modules
 */

import { DataType } from "@prisma/client";

/**
 * Validation rule type for metadata validation
 * Based on Prisma ValidationRule enum
 */
export type ValidationRule =
  | "REQUIRED"
  | "MIN_LENGTH"
  | "MAX_LENGTH"
  | "PATTERN"
  | "UNIQUE"
  | "RANGE"
  | "FORMAT"
  | "CUSTOM";

/**
 * Metadata field definition
 * Defines structure and validation for metadata fields
 */
export interface MetadataFieldBase {
  /** Field identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Field name/key */
  name: string;
  /** Display label */
  label: string;
  /** Field description */
  description?: string;
  /** Data type */
  dataType: DataType;
  /** Field type category */
  fieldType: string;
  /** Entity types this field applies to */
  entityTypes: string[];
  /** Whether field is required */
  isRequired: boolean;
  /** Whether field is searchable */
  isSearchable: boolean;
  /** Whether field is system-defined */
  isSystem: boolean;
  /** Whether field is active */
  isActive: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** Validation rules */
  validationRules?: MetadataValidationRule[];
  /** Field options (for select fields) */
  options?: MetadataFieldOption[];
  /** Field ordering */
  sortOrder: number;
  /** Field group/section */
  group?: string;
}

/**
 * Metadata validation rule
 * Defines validation constraints for metadata fields
 */
export interface MetadataValidationRule {
  /** Rule type */
  rule: ValidationRule;
  /** Rule value/parameter */
  value?: unknown;
  /** Custom validation message */
  message?: string;
  /** Whether rule is active */
  isActive: boolean;
}

/**
 * Metadata field option
 * Options for select-type metadata fields
 */
export interface MetadataFieldOption {
  /** Option value */
  value: string;
  /** Option display label */
  label: string;
  /** Option description */
  description?: string;
  /** Whether option is active */
  isActive: boolean;
  /** Option ordering */
  sortOrder: number;
  /** Option metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Metadata value entry
 * Actual metadata value for an entity
 */
export interface MetadataValueBase {
  /** Value identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Metadata field ID */
  fieldId: string;
  /** Entity type */
  entityType: string;
  /** Entity identifier */
  entityId: string;
  /** Field value */
  value: unknown;
  /** Value type for polymorphic storage */
  valueType: string;
  /** String representation of value */
  stringValue?: string;
  /** Numeric representation of value */
  numericValue?: number;
  /** Boolean representation of value */
  booleanValue?: boolean;
  /** Date representation of value */
  dateValue?: Date;
  /** JSON representation of complex values */
  jsonValue?: Record<string, unknown>;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Member who last updated */
  updatedById?: string;
}

/**
 * Complete entity metadata
 * All metadata associated with an entity
 */
export interface EntityMetadata {
  /** Entity type */
  entityType: string;
  /** Entity identifier */
  entityId: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Metadata field-value pairs */
  fields: Record<string, unknown>;
  /** Field definitions */
  fieldDefinitions?: Record<string, MetadataFieldBase>;
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Custom field configuration
 * Configuration for tenant-specific custom fields
 */
export interface CustomFieldBase {
  /** Custom field identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Field name */
  name: string;
  /** Display label */
  label: string;
  /** Field description */
  description?: string;
  /** Target entity type */
  entityType: string;
  /** Field data type */
  dataType: string;
  /** Input component type */
  inputType: string;
  /** Whether field is required */
  isRequired: boolean;
  /** Whether field is visible */
  isVisible: boolean;
  /** Whether field is editable */
  isEditable: boolean;
  /** Field validation schema */
  validationSchema?: Record<string, unknown>;
  /** Field configuration */
  configuration?: CustomFieldConfiguration;
  /** Default value */
  defaultValue?: unknown;
  /** Field ordering in forms */
  displayOrder: number;
}

/**
 * Custom field configuration
 * Type-specific configuration for custom fields
 */
export interface CustomFieldConfiguration {
  /** Minimum value (for numeric fields) */
  min?: number;
  /** Maximum value (for numeric fields) */
  max?: number;
  /** Minimum length (for text fields) */
  minLength?: number;
  /** Maximum length (for text fields) */
  maxLength?: number;
  /** Regular expression pattern */
  pattern?: string;
  /** Available options (for select fields) */
  options?: Array<{ value: string; label: string }>;
  /** Whether multiple values allowed */
  allowMultiple?: boolean;
  /** Date format (for date fields) */
  dateFormat?: string;
  /** Decimal precision (for decimal fields) */
  precision?: number;
  /** Currency code (for money fields) */
  currency?: string;
  /** File types allowed (for file fields) */
  allowedFileTypes?: string[];
  /** Maximum file size (for file fields) */
  maxFileSize?: number;
}

/**
 * Metadata query filters
 * Filters for searching metadata
 */
export interface MetadataQueryFilters {
  /** Filter by entity type */
  entityType?: string;
  /** Filter by entity IDs */
  entityIds?: string[];
  /** Filter by field names */
  fieldNames?: string[];
  /** Filter by field values */
  fieldValues?: Record<string, unknown>;
  /** Filter by date range */
  updatedAfter?: Date;
  /** Filter by date range */
  updatedBefore?: Date;
  /** Include field definitions */
  includeDefinitions?: boolean;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Metadata validation result
 * Result of validating metadata values
 */
export interface MetadataValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Field validation results */
  fieldResults: Record<string, FieldValidationResult>;
  /** Overall error messages */
  errors?: string[];
  /** Overall warning messages */
  warnings?: string[];
}

/**
 * Field validation result
 * Result of validating a single field
 */
export interface FieldValidationResult {
  /** Field name */
  fieldName: string;
  /** Whether field is valid */
  isValid: boolean;
  /** Validation errors */
  errors?: string[];
  /** Validation warnings */
  warnings?: string[];
  /** Normalized value */
  normalizedValue?: unknown;
}

/**
 * Metadata update request
 * Request to update entity metadata
 */
export interface MetadataUpdateRequest {
  /** Entity type */
  entityType: string;
  /** Entity identifier */
  entityId: string;
  /** Metadata updates */
  updates: Record<string, unknown>;
  /** Whether to validate before update */
  validate?: boolean;
  /** Whether to merge with existing metadata */
  merge?: boolean;
}

/**
 * Metadata template
 * Template for common metadata configurations
 */
export interface MetadataTemplate {
  /** Template identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Target entity types */
  entityTypes: string[];
  /** Template fields */
  fields: MetadataFieldBase[];
  /** Whether template is active */
  isActive: boolean;
  /** Template version */
  version: number;
}
