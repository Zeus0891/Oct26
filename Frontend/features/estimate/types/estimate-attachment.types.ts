// ============================================================================
// ESTIMATE ATTACHMENT TYPES
// ============================================================================
// Types for EstimateAttachment entity - file attachments
// ============================================================================

import { BaseEntityFields } from "./shared.types";

export interface EstimateAttachmentEntity extends BaseEntityFields {
  estimateId: string;
  documentGroupId?: string;
  fileObjectId?: string;
  fileName: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
  sortOrder: number;
  uploadedBy?: string;
}

export interface CreateEstimateAttachmentDTO {
  estimateId: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  sortOrder?: number;
}

export interface UpdateEstimateAttachmentDTO {
  fileName?: string;
  sortOrder?: number;
  version: number;
}

export interface EstimateAttachmentResponseDTO
  extends EstimateAttachmentEntity {
  uploadedByUser?: {
    id: string;
    displayName: string;
  };
}

export interface FileUploadData {
  file: File;
  estimateId: string;
  sortOrder?: number;
}
