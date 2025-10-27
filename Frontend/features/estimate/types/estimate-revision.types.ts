// ============================================================================
// ESTIMATE REVISION TYPES
// ============================================================================
// Types for EstimateRevision entity - version control and change tracking
// ============================================================================

import { BaseEntityFields } from "./shared.types";

export interface EstimateRevisionEntity extends BaseEntityFields {
  estimateId: string;
  revisionNumber: number;
  snapshotSubtotal?: number;
  snapshotDiscountType?: string;
  snapshotDiscountValue?: number;
  snapshotDiscountAmount?: number;
  snapshotTaxType?: string;
  snapshotTaxRate?: number;
  snapshotTaxAmount?: number;
  snapshotGrandTotal?: number;
  snapshotTerms?: string;
  snapshotValidUntil?: string;
}

export interface EstimateRevisionResponseDTO extends EstimateRevisionEntity {
  estimate?: {
    id: string;
    name: string;
    estimateNumber?: string;
  };
}

export interface RevisionComparison {
  fromRevision: EstimateRevisionEntity;
  toRevision: EstimateRevisionEntity;
  changes: RevisionChange[];
}

export interface RevisionChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "modified" | "removed";
}
