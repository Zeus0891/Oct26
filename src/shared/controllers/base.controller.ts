/**
 * Lightweight Base Controller (Compatibility)
 *
 * Provides minimal helper methods used by some feature controllers.
 * This exists for backward compatibility with earlier scaffolds that imported
 * from "shared/controllers/base.controller" instead of the new base module.
 */

import type { Request, Response } from "express";
import {
  ContextService,
  TenantContext,
  RequestContext,
} from "../services/base/context.service";

/**
 * Authenticated request with optional context and user info.
 * Matches the legacy shape expected by feature controllers.
 */
export interface AuthenticatedRequest extends Request {
  context?: RequestContext;
  user?: {
    userId: string;
    email?: string;
    tenantId?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export class BaseController {
  protected readonly contextService = new ContextService();

  /** Send a standardized success response */
  protected sendSuccess<R = unknown>(
    res: Response,
    data?: R,
    status = 200
  ): void {
    res.status(status).json({ success: true, data });
  }

  /** Build a simple error descriptor */
  protected createError(
    code: string,
    message: string,
    status = 500,
    details?: unknown
  ): { code: string; message: string; status: number; details?: unknown } {
    return { code, message, status, details };
  }

  /** Send a standardized error response */
  protected sendError(
    res: Response,
    error: { code: string; message: string; status?: number; details?: unknown }
  ): void {
    res.status(error.status ?? 500).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  /** Retrieve tenant context from request (or derive it) */
  protected getTenantContext(req: AuthenticatedRequest): TenantContext {
    const ctx =
      req.context ?? this.contextService.createContextFromRequest(req as any);
    return this.contextService.getTenantContext(ctx);
  }
}
