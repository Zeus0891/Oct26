/**
 * Actor Types - Identity and authentication context
 *
 * Depends on Prisma Tables: User, Member, Session, Device, Profile
 * Depends on Prisma Enums: UserStatus, UserRole, MemberStatus, DeviceType, DeviceStatus
 *
 * Purpose: Identity management, authentication context, and actor information across all modules
 */

import type {
  UserStatus,
  MemberStatus,
  DeviceType,
  DeviceStatus,
} from "@prisma/client";

/**
 * Base user identity information
 * Maps to Prisma User table core fields
 */
export interface UserBase {
  /** Unique user identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** User phone number */
  phone?: string;
  /** User avatar image URL */
  avatarUrl?: string;
  /** User account status */
  status: UserStatus;
  /** Whether user is verified */
  isVerified: boolean;
  /** Whether user account is active */
  isActive: boolean;
  /** User timezone */
  timezone?: string;
  /** User preferred language */
  language?: string;
}

/**
 * Tenant member information
 * Maps to Prisma Member table
 */
export interface MemberBase {
  /** Unique member identifier (UUID) */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Associated user ID */
  userId: string;
  /** Member status within tenant */
  status: MemberStatus;
  /** Member title/position */
  title?: string;
  /** Member department */
  department?: string;
  /** Date member joined tenant */
  joinedAt: Date;
  /** Whether member is tenant owner */
  isOwner: boolean;
  /** Whether member account is active */
  isActive: boolean;
}

/**
 * User session information
 * Maps to Prisma Session table
 */
export interface SessionBase {
  /** Session identifier */
  id: string;
  /** Associated user ID */
  userId: string;
  /** Associated tenant ID (for tenant-scoped sessions) */
  tenantId?: string;
  /** Session token hash */
  tokenHash: string;
  /** Session expiry timestamp */
  expiresAt: Date;
  /** Client IP address */
  ipAddress?: string;
  /** Client user agent */
  userAgent?: string;
  /** Whether session is active */
  isActive: boolean;
}

/**
 * Device/client information
 * Maps to Prisma Device table
 */
export interface DeviceBase {
  /** Device identifier */
  id: string;
  /** Associated user ID */
  userId: string;
  /** Device name/description */
  name: string;
  /** Device type classification */
  type: DeviceType;
  /** Device status */
  status: DeviceStatus;
  /** Device fingerprint/identifier */
  fingerprint?: string;
  /** Last access timestamp */
  lastAccessAt?: Date;
  /** Whether device is trusted */
  isTrusted: boolean;
}

/**
 * User profile extended information
 * Maps to Prisma Profile table
 */
export interface ProfileBase {
  /** Associated user ID */
  userId: string;
  /** Profile bio/description */
  bio?: string;
  /** Professional title */
  title?: string;
  /** Company/organization */
  company?: string;
  /** Location/address */
  location?: string;
  /** Website URL */
  website?: string;
  /** Social media links */
  socialLinks?: Record<string, string>;
  /** Profile visibility settings */
  visibility: Record<string, boolean>;
}

/**
 * Complete actor context for authenticated operations
 * Combines user, member, and session information
 */
export interface ActorContext {
  /** User identity information */
  user: UserBase;
  /** Current tenant membership (if any) */
  member?: MemberBase;
  /** Active session information */
  session: SessionBase;
  /** Device information */
  device?: DeviceBase;
  /** Extended profile (if available) */
  profile?: ProfileBase;
}

/**
 * Minimal actor context for RLS operations
 * Used in withRLS functions and permission checks
 */
export interface ActorRLSContext {
  /** User identifier for RLS */
  userId: string;
  /** Member identifier for tenant-scoped operations */
  memberId?: string;
  /** Tenant identifier for multi-tenant context */
  tenantId?: string;
  /** Whether user is tenant owner */
  isOwner?: boolean;
  /** Member status within tenant */
  memberStatus?: MemberStatus;
}

/**
 * Authentication request structure
 * Used for login and session creation
 */
export interface AuthRequest {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Optional tenant context */
  tenantId?: string;
  /** Device information */
  deviceInfo?: {
    name: string;
    type: DeviceType;
    fingerprint?: string;
  };
  /** Client information */
  clientInfo?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * User registration request structure
 * Used for new user account creation
 */
export interface RegisterUserRequest {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** User phone number */
  phone?: string;
  /** User timezone */
  timezone?: string;
  /** User preferred language */
  language?: string;
}
