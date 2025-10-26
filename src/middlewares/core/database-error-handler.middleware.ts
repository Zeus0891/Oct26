import { Request, Response, NextFunction } from "express";

/**
 * Database Error Handler Middleware
 * Handles database connection errors gracefully
 */
export const databaseErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if it's a database connection error
  const isDatabaseError =
    error.message?.includes("PostgreSQL") ||
    error.message?.includes("Closed") ||
    error.kind === "Closed" ||
    error.code === "P1001" ||
    error.message?.includes("Connection") ||
    error.message?.includes("connection");

  if (isDatabaseError) {
    console.error("[DB_ERROR] Database connection error:", {
      message: error.message,
      code: error.code,
      kind: error.kind,
      correlationId: (req as any).correlationId,
    });

    // Return a user-friendly error message
    res.status(503).json({
      error: "Database temporarily unavailable",
      message:
        "The service is experiencing database connectivity issues. Please try again in a moment.",
      correlationId: (req as any).correlationId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // If not a database error, pass to next error handler
  next(error);
};

export default databaseErrorHandler;
