/**
 * File and Attachment Types - Schema-aligned file handling
 *
 * Aligns with Prisma Tables: FileObject, Attachment, AttachmentLink
 * Aligns with Prisma Enums: FileObjectStatus, FileCategory, StorageProvider, VirusScanStatus,
 *                           AttachmentStatus, AttachmentType, AttachmentLinkStatus, AttachmentLinkType
 *
 * Purpose: File storage metadata (FileObject), attachments to business entities (Attachment),
 * and relationships between attachments and entities (AttachmentLink).
 */

import type {
  FileObjectStatus,
  FileCategory,
  StorageProvider,
  VirusScanStatus,
  AttachmentStatus,
  AttachmentType,
  AttachmentLinkStatus,
  AttachmentLinkType,
  RetentionPolicy,
} from "@prisma/client";

/**
 * File object information
 * Maps to Prisma FileObject table core fields
 */
export interface FileObjectBase {
  /** File object identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** File object status */
  status: FileObjectStatus;
  /** Original file name */
  fileName: string;
  /** Optional display name */
  displayName?: string;
  /** File description */
  description?: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** Optional file category */
  fileCategory?: FileCategory;
  /** Storage provider */
  storageProvider: StorageProvider;
  /** Storage path/URL */
  storagePath: string;
  /** Storage region/bucket/key */
  storageRegion?: string;
  storageBucket?: string;
  storageKey: string;
  /** Hashes for integrity */
  md5Hash?: string;
  sha256Hash?: string;
  /** Encryption settings */
  isEncrypted: boolean;
  encryptionKey?: string;
  /** Public access */
  isPublic: boolean;
  accessUrl?: string;
  accessExpiry?: Date;
  /** Access metrics */
  downloadCount: number;
  lastAccessedAt?: Date;
  /** Security & retention */
  retentionPolicy?: RetentionPolicy;
  dataClassification?: string;
  auditCorrelationId?: string;
  /** Virus scanning */
  virusScanStatus?: VirusScanStatus;
  virusScanAt?: Date;
  quarantineReason?: string;
  /** Previews */
  hasPreview: boolean;
  previewPath?: string;
  thumbnailPath?: string;
  /** OCR/Tags */
  ocrText?: string;
  contentTags: string[];
  /** Business relations */
  projectId?: string;
  uploadedById?: string;
  source?: string;
  /** Audit timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Attachment information
 * Maps to Prisma Attachment table
 */
export interface AttachmentBase {
  /** Attachment identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Attachment status */
  status: AttachmentStatus;
  /** Attachment version info */
  versionNumber?: string;
  isLatestVersion: boolean;
  parentAttachmentId?: string;
  /** Attachment classification */
  attachmentType: AttachmentType;
  /** File object reference */
  fileObjectId: string;
  /** Display title and description */
  title: string;
  description?: string;
  /** Visibility and approval */
  isPublic: boolean;
  requiresApproval: boolean;
  isApproved?: boolean;
  approvedAt?: Date;
  approvedById?: string;
  approvalNotes?: string;
  /** Audit & relations */
  attachedById?: string;
  tags?: string[];
  auditCorrelationId?: string;
  dataClassification?: string;
  retentionPolicy?: RetentionPolicy;
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Attachment version subset
 * Shape representing version-related fields of Attachment
 */
export interface AttachmentVersionBase {
  /** Version string label */
  versionNumber?: string;
  /** Whether this is the latest version */
  isLatestVersion: boolean;
  /** Parent attachment for version chains */
  parentAttachmentId?: string;
}

/**
 * Attachment link/relationship
 * Maps to Prisma AttachmentLink table
 */
export interface AttachmentLinkBase {
  /** Link identifier */
  id: string;
  /** Associated tenant ID */
  tenantId: string;
  /** Link status */
  status: AttachmentLinkStatus;
  /** Link type */
  linkType: AttachmentLinkType;
  /** Target entity linkage */
  entityType: string;
  entityId: string;
  /** Attachment reference */
  attachmentId: string;
  /** Ordering/flags */
  displayOrder: number;
  isRequired: boolean;
  isPrimary: boolean;
  /** Permissions */
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Description/tags */
  description?: string;
  tags?: string[];
  /** Linking audit */
  linkedAt: Date;
  linkedById?: string;
  unlinkedAt?: Date;
  unlinkedById?: string;
  unlinkReason?: string;
}

/**
 * File upload request
 * Request structure for uploading files
 */
export interface FileUploadRequest {
  /** File name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** File content (base64 or buffer) */
  content: string | Buffer;
  /** Associated entity type */
  entityType?: string;
  /** Associated entity ID */
  entityId?: string;
  /** Upload description */
  description?: string;
  /** File classification */
  classification?: string;
  /** File tags */
  tags?: string[];
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * File upload result
 * Result of file upload operation
 */
export interface FileUploadResult {
  /** Upload success status */
  success: boolean;
  /** Document/attachment ID (if successful) */
  documentId?: string;
  /** File URL/path */
  fileUrl?: string;
  /** File hash */
  fileHash?: string;
  /** Error message (if failed) */
  error?: string;
  /** Upload timestamp */
  uploadedAt: Date;
  /** File processing status */
  processingStatus?: string;
}

/**
 * Document access permissions
 * Defines who can access a document
 */
export interface DocumentPermissions {
  /** Document identifier */
  documentId: string;
  /** Whether public access is allowed */
  isPublic: boolean;
  /** Allowed member IDs */
  allowedMembers: string[];
  /** Allowed roles */
  allowedRoles: string[];
  /** Permission type (READ, WRITE, ADMIN) */
  permissions: Record<string, string[]>;
  /** Access expiry date */
  expiresAt?: Date;
}

/**
 * Document search filters
 * Filters for searching documents
 */
export interface DocumentSearchFilters {
  /** Search query */
  query?: string;
  /** Filter by document type */
  documentType?: string;
  /** Filter by status */
  status?: FileObjectStatus;
  /** Filter by file extension */
  fileExtension?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by owner */
  ownerId?: string;
  /** Filter by creation date range */
  createdAfter?: Date;
  /** Filter by creation date range */
  createdBefore?: Date;
  /** Filter by file size range */
  minFileSize?: number;
  /** Filter by file size range */
  maxFileSize?: number;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Document processing result
 * Result of document processing operations
 */
export interface DocumentProcessingResult {
  /** Processing success status */
  success: boolean;
  /** Processing operation type */
  operation: string;
  /** Result data */
  result?: Record<string, unknown>;
  /** Error message (if failed) */
  error?: string;
  /** Processing duration (ms) */
  processingTime: number;
  /** Output file URL (if applicable) */
  outputUrl?: string;
}

// ---------------------------------------------------------------------------
// Backward-compatibility aliases (to be removed after migration)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use FileObjectBase instead
 */
export type DocumentBase = FileObjectBase;

/**
 * @deprecated Use AttachmentLinkBase instead
 */
export type DocumentLinkBase = AttachmentLinkBase;

/**
 * @deprecated Use AttachmentVersionBase instead
 */
export type DocumentVersionBase = AttachmentVersionBase;
