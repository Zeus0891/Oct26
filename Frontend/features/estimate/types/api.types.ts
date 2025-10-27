// ============================================================================
// API TYPES
// ============================================================================
// Common API-related types (responses, errors, pagination, etc.)
// ============================================================================

import { PaginatedResponse, PaginationParams } from "./shared.types";

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

// ============================================================================
// API PAGINATION
// ============================================================================

export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>;

export interface ApiQueryParams extends PaginationParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  include?: string[];
  fields?: string[];
  expand?: string[];
}

// ============================================================================
// API REQUEST/RESPONSE HEADERS
// ============================================================================

export interface ApiRequestHeaders {
  "Content-Type"?: string;
  Authorization?: string;
  "x-tenant-id"?: string;
  "x-correlation-id"?: string;
  "If-Match"?: string; // For optimistic concurrency
}

export interface ApiResponseHeaders {
  "x-correlation-id"?: string;
  "x-rate-limit-remaining"?: string;
  "x-rate-limit-reset"?: string;
  ETag?: string; // For optimistic concurrency
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkOperation<T> {
  action: "create" | "update" | "delete";
  data: T;
  id?: string;
}

export interface BulkApiRequest<T> {
  operations: BulkOperation<T>[];
  continueOnError?: boolean;
}

export interface BulkApiResponse<T> {
  results: BulkOperationResult<T>[];
  successCount: number;
  errorCount: number;
  totalCount: number;
}

export interface BulkOperationResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  operation: BulkOperation<T>;
}

// ============================================================================
// ASYNC OPERATIONS
// ============================================================================

export interface AsyncOperationStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  message?: string;
  result?: unknown;
  error?: ApiError;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface FileUploadError extends ApiError {
  fileName: string;
  fileSize: number;
}
