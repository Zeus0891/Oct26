/**
 * Core Base Entity Types (Compatibility Layer)
 *
 * Provides legacy-compatible base entity primitives for modules still importing
 * from shared/types/core/* paths. Prefer using shared/types/base moving forward.
 */

// UUID v7 type alias for compatibility
export type UuidV7 = string;

// Common status union used by legacy modules
export type CommonStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "DELETED"
  | "PENDING"
  | string;

// Base entity with audit primitives
export interface BaseEntity {
  id: UuidV7;
  tenantId: UuidV7;
  status?: CommonStatus;
  version?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdByActorId?: UuidV7 | null;
  updatedByActorId?: UuidV7 | null;
  deletedByActorId?: UuidV7 | null;
  auditCorrelationId?: string | null;
  dataClassification?: string;
  retentionPolicy?: string | null;
}

// New entity input minimal shape
export interface NewEntityInput {
  tenantId: UuidV7;
  createdByActorId?: UuidV7 | null;
  auditCorrelationId?: string | null;
}

// Update entity input minimal shape
export interface UpdateEntityInput {
  updatedByActorId?: UuidV7 | null;
  auditCorrelationId?: string | null;
}
