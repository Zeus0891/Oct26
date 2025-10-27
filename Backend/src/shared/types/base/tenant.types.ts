/**
 * Tenant Types - Multi-tenant context definition
 *
 * Depends on Prisma Tables: Tenant, TenantSettings, TenantFeatureFlag, TenantSubscription
 * Depends on Prisma Enums: TenantRegion, TenantStatus, TenantTier, TenantDeploymentType
 *
 * Purpose: Multi-tenant context definition, used across all modules and RLS isolation boundary
 */

import type {
  TenantRegion,
  TenantStatus,
  TenantTier,
  TenantDeploymentType,
} from "@prisma/client";

/**
 * Base tenant identification and context
 * Maps to Prisma Tenant table core fields
 */
export interface TenantBase {
  /** Unique tenant identifier (UUID) */
  id: string;
  /** Human-readable tenant name */
  name: string;
  /** URL-safe tenant identifier */
  slug: string;
  /** Tenant deployment region */
  region: TenantRegion;
  /** Current tenant status */
  status: TenantStatus;
  /** Tenant service tier */
  tier: TenantTier;
  /** Deployment environment type */
  deploymentType: TenantDeploymentType;
  /** Whether tenant is sandbox (demo/testing) */
  isSandbox: boolean;
  /** Whether tenant is active */
  isActive: boolean;
}

/**
 * Tenant settings configuration
 * Maps to Prisma TenantSettings table
 */
export interface TenantSettingsBase {
  /** Associated tenant ID */
  tenantId: string;
  /** Default timezone for tenant operations */
  defaultTimezone: string;
  /** Default currency code */
  defaultCurrency: string;
  /** Default language/locale */
  defaultLocale: string;
  /** Estimate approval threshold amount */
  estimateApprovalThreshold?: number;
  /** Invoice payment terms (days) */
  defaultPaymentTerms?: number;
  /** Tenant-specific configuration JSON */
  config: Record<string, unknown>;
}

/**
 * Tenant feature flag configuration
 * Maps to Prisma TenantFeatureFlag table
 */
export interface TenantFeatureFlagBase {
  /** Associated tenant ID */
  tenantId: string;
  /** Feature flag key/identifier */
  flagKey: string;
  /** Whether feature is enabled */
  isEnabled: boolean;
  /** Feature configuration parameters */
  config?: Record<string, unknown>;
  /** Feature flag expiry date */
  expiresAt?: Date;
}

/**
 * Tenant subscription information
 * Maps to Prisma TenantSubscription table
 */
export interface TenantSubscriptionBase {
  /** Associated tenant ID */
  tenantId: string;
  /** Subscription plan identifier */
  planId: string;
  /** Subscription status */
  status: string;
  /** Subscription start date */
  startsAt: Date;
  /** Subscription end date */
  endsAt?: Date;
  /** Billing cycle interval */
  billingCycle: string;
  /** Monthly recurring revenue */
  monthlyRecurringRevenue?: number;
}

/**
 * Complete tenant context for multi-tenant operations
 * Combines core tenant data with settings
 */
export interface TenantContext extends TenantBase {
  /** Tenant configuration settings */
  settings?: TenantSettingsBase;
  /** Active feature flags */
  features?: TenantFeatureFlagBase[];
  /** Subscription information */
  subscription?: TenantSubscriptionBase;
}

/**
 * Minimal tenant context for RLS operations
 * Used in withRLS functions and session management
 */
export interface TenantRLSContext {
  /** Tenant identifier for RLS isolation */
  id: string;
  /** Tenant name for logging/debugging */
  name: string;
  /** Tenant slug for URL generation */
  slug: string;
  /** Whether tenant is active */
  isActive: boolean;
  /** Whether tenant is sandbox environment */
  isSandbox: boolean;
}

/**
 * Tenant creation request structure
 * Used for new tenant onboarding and bootstrap
 */
export interface CreateTenantRequest {
  /** Tenant name */
  name: string;
  /** URL-safe identifier */
  slug: string;
  /** Deployment region */
  region: TenantRegion;
  /** Service tier */
  tier: TenantTier;
  /** Owner email address */
  ownerEmail: string;
  /** Owner first name */
  ownerFirstName: string;
  /** Owner last name */
  ownerLastName: string;
  /** Initial settings */
  settings?: Partial<TenantSettingsBase>;
}
