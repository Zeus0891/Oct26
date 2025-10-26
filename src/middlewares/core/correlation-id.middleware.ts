import { Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthenticatedRequest } from "../types";

/**
 * Correlation ID Middleware
 *
 * Generates unique correlation IDs for request tracking and distributed tracing.
 * Essential for debugging and monitoring in microservices architecture.
 */
export const correlationIdMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Generate correlation ID from header or create new one
  const correlationId =
    (req.headers["x-correlation-id"] as string) ||
    (req.headers["x-request-id"] as string) ||
    uuidv4();

  // Set correlation ID on request for downstream use
  req.correlationId = correlationId;

  // Add correlation ID to response headers for client tracking
  res.setHeader("x-correlation-id", correlationId);

  console.log(
    `[CORRELATION] Request ${correlationId} | ${req.method} ${req.path}`
  );

  next();
};

export default correlationIdMiddleware;
