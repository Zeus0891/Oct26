// ============================================================================
// ESTIMATE COMMENT TYPES
// ============================================================================
// Types for EstimateComment entity - comments and notes
// ============================================================================

import { BaseEntityFields } from "./shared.types";

export interface EstimateCommentEntity extends BaseEntityFields {
  estimateId: string;
  commentText: string;
  authorId: string;
  isInternal: boolean;
}

export interface CreateEstimateCommentDTO {
  estimateId: string;
  commentText: string;
  isInternal?: boolean;
}

export interface UpdateEstimateCommentDTO {
  commentText?: string;
  isInternal?: boolean;
  version: number;
}

export interface EstimateCommentResponseDTO extends EstimateCommentEntity {
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  estimate?: {
    id: string;
    name: string;
  };
}
