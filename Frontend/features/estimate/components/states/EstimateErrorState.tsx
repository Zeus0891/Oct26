// ============================================================================
// ESTIMATE ERROR STATE COMPONENT
// ============================================================================
// Error state component with retry functionality and different error types
// ============================================================================

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  Server,
  Lock,
  AlertTriangle,
  Bug,
  HelpCircle,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateErrorStateProps {
  error?: string | Error | null;
  type?: "network" | "server" | "permission" | "validation" | "unknown";
  onRetry?: () => void;
  onReport?: () => void;
  className?: string;
  showDetails?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// ============================================================================
// ERROR TYPE DETECTION
// ============================================================================

function detectErrorType(
  error?: string | Error | null
): "network" | "server" | "permission" | "validation" | "unknown" {
  if (!error) return "unknown";

  const errorString = error instanceof Error ? error.message : error;
  const lowerError = errorString.toLowerCase();

  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection")
  ) {
    return "network";
  }
  if (
    lowerError.includes("500") ||
    lowerError.includes("server") ||
    lowerError.includes("internal")
  ) {
    return "server";
  }
  if (
    lowerError.includes("401") ||
    lowerError.includes("403") ||
    lowerError.includes("unauthorized") ||
    lowerError.includes("forbidden")
  ) {
    return "permission";
  }
  if (
    lowerError.includes("400") ||
    lowerError.includes("validation") ||
    lowerError.includes("invalid")
  ) {
    return "validation";
  }

  return "unknown";
}

// ============================================================================
// ERROR CONFIGURATION
// ============================================================================

const ERROR_CONFIG = {
  network: {
    icon: Wifi,
    title: "Connection Error",
    description:
      "Unable to connect to the server. Please check your internet connection and try again.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    suggestion: "Check your network connection",
  },
  server: {
    icon: Server,
    title: "Server Error",
    description:
      "The server encountered an error while processing your request. Our team has been notified.",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    suggestion: "Try again in a few moments",
  },
  permission: {
    icon: Lock,
    title: "Access Denied",
    description:
      "You don't have permission to access this resource. Please contact your administrator.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    suggestion: "Contact your administrator",
  },
  validation: {
    icon: AlertTriangle,
    title: "Invalid Request",
    description:
      "The request contains invalid data. Please check your input and try again.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    suggestion: "Check your input data",
  },
  unknown: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    description:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    suggestion: "Try refreshing the page",
  },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateErrorState({
  error,
  type,
  onRetry,
  onReport,
  className = "",
  showDetails = false,
  retryCount = 0,
  maxRetries = 3,
}: EstimateErrorStateProps) {
  // Determine error type automatically if not provided
  const actualType = type || detectErrorType(error);
  const config = ERROR_CONFIG[actualType];
  const Icon = config.icon;

  // Get error message
  const errorMessage = React.useMemo(() => {
    if (!error) return "An unknown error occurred";
    if (error instanceof Error) return error.message;
    return error;
  }, [error]);

  // Check if retry is available
  const canRetry = onRetry && retryCount < maxRetries;
  const isMaxRetries = retryCount >= maxRetries;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRetry = () => {
    onRetry?.();
  };

  const handleReport = () => {
    onReport?.();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderErrorIcon = () => (
    <div
      className={`
      w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4 relative
      ${config.bgColor} ${config.borderColor} border
    `}
    >
      <Icon className={`w-8 h-8 ${config.color}`} />

      {/* Subtle animation for network errors */}
      {actualType === "network" && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
      )}
    </div>
  );

  const renderActions = () => (
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
      {/* Retry button */}
      {canRetry && (
        <Button
          onClick={handleRetry}
          className="neomorphic-primary min-w-[120px]"
          disabled={isMaxRetries}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
          {retryCount > 0 && ` (${retryCount}/${maxRetries})`}
        </Button>
      )}

      {/* Report button */}
      {onReport && (
        <Button
          variant="ghost"
          onClick={handleReport}
          className="neomorphic-button min-w-[120px]"
        >
          <Bug className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      )}

      {/* Help button */}
      <Button
        variant="ghost"
        className="neomorphic-button"
        onClick={() => window.open("/help", "_blank")}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Get Help
      </Button>
    </div>
  );

  const renderErrorDetails = () => {
    if (!showDetails) return null;

    return (
      <div className="mt-6 text-left">
        <details className="cursor-pointer group">
          <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Technical Details
          </summary>
          <div className="mt-3 p-4 neomorphic-inset rounded-lg">
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Error Type:</span>
                <span className="ml-2 text-foreground">{actualType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Message:</span>
                <span className="ml-2 text-foreground break-words">
                  {errorMessage}
                </span>
              </div>
              {retryCount > 0 && (
                <div>
                  <span className="text-muted-foreground">Retry Attempts:</span>
                  <span className="ml-2 text-foreground">
                    {retryCount}/{maxRetries}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="ml-2 text-foreground">
                  {new Date().toISOString()}
                </span>
              </div>
            </div>
          </div>
        </details>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-8 ${className}`}>
      <div className="text-center max-w-md mx-auto">
        {renderErrorIcon()}

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {config.title}
        </h3>

        <p className="text-muted-foreground mb-4">{config.description}</p>

        {/* Suggestion */}
        <div
          className={`
          p-3 rounded-lg text-sm mb-4
          ${config.bgColor} ${config.borderColor} border
        `}
        >
          <span className="font-medium">💡 Suggestion:</span>
          <span className="ml-2">{config.suggestion}</span>
        </div>

        {/* Max retries warning */}
        {isMaxRetries && (
          <div className="p-3 rounded-lg text-sm mb-4 bg-red-50 border border-red-200 text-red-800">
            <span className="font-medium">
              ⚠️ Maximum retry attempts reached.
            </span>
            <span className="ml-2">
              Please contact support if the problem persists.
            </span>
          </div>
        )}

        {renderActions()}
        {renderErrorDetails()}
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * Inline error for form fields or small containers
 */
export function EstimateErrorStateInline({
  error,
  onRetry,
  className,
}: {
  error?: string | Error | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (!error) return null;

  const message = error instanceof Error ? error.message : error;

  return (
    <div
      className={`
      flex items-center justify-between p-3 rounded-lg border 
      bg-red-50 border-red-200 text-red-800
      ${className}
    `}
    >
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>

      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-red-700 hover:text-red-900 p-1"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Compact error for tight spaces
 */
export function EstimateErrorStateCompact({
  error,
  onRetry,
  className,
}: {
  error?: string | Error | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div className={`text-center py-6 ${className}`}>
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        Failed to load estimates
      </p>
      {onRetry && (
        <Button size="sm" onClick={onRetry} className="neomorphic-button">
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}

export default EstimateErrorState;
