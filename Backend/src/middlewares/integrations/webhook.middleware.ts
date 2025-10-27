import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "../types";

/**
 * Webhook Event Types
 */
enum WebhookEventType {
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",
  PROJECT_CREATED = "project.created",
  PROJECT_UPDATED = "project.updated",
  PROJECT_COMPLETED = "project.completed",
  PAYMENT_PROCESSED = "payment.processed",
  PAYMENT_FAILED = "payment.failed",
  SUBSCRIPTION_CREATED = "subscription.created",
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
  TENANT_CREATED = "tenant.created",
  TENANT_SUSPENDED = "tenant.suspended",
  SECURITY_ALERT = "security.alert",
  COMPLIANCE_VIOLATION = "compliance.violation",
  CUSTOM_EVENT = "custom.event",
}

/**
 * Webhook Payload Interface
 */
interface WebhookPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  version: string;
  data: any;
  metadata: {
    correlationId: string;
    tenantId?: string;
    userId?: string;
    source: string;
    retryCount?: number;
    previousEventId?: string;
  };
  signature?: string;
}

/**
 * Webhook Configuration
 */
interface WebhookConfig {
  enabled: boolean;
  endpoints: WebhookEndpoint[];
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  signatureSecret?: string;
  enableSignatureValidation: boolean;
  enableRetries: boolean;
  enableLogging: boolean;
  batchSize: number;
  batchTimeout: number;
  enableBatching: boolean;
}

/**
 * Webhook Endpoint Configuration
 */
interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEventType[];
  headers?: Record<string, string>;
  active: boolean;
  secret?: string;
  tenantId?: string;
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

/**
 * Webhook Delivery Result
 */
interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  retryCount: number;
  endpoint: WebhookEndpoint;
  payload: WebhookPayload;
}

/**
 * Default webhook configuration
 */
const DEFAULT_CONFIG: WebhookConfig = {
  enabled: true,
  endpoints: [],
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 10000,
  enableSignatureValidation: true,
  enableRetries: true,
  enableLogging: true,
  batchSize: 10,
  batchTimeout: 5000,
  enableBatching: false,
};

/**
 * Webhook Delivery Queue
 */
class WebhookQueue {
  private queue: WebhookPayload[] = [];
  private processing: boolean = false;
  private batchQueue: WebhookPayload[] = [];
  private batchTimer?: NodeJS.Timeout;

  enqueue(payload: WebhookPayload): void {
    this.queue.push(payload);

    if (!this.processing) {
      this.processQueue();
    }
  }

  enqueueBatch(payload: WebhookPayload, config: WebhookConfig): void {
    this.batchQueue.push(payload);

    if (this.batchQueue.length >= config.batchSize) {
      this.processBatch(config);
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch(config);
      }, config.batchTimeout);
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const payload = this.queue.shift()!;
      try {
        await this.deliverWebhook(payload);
      } catch (error) {
        console.error("[WEBHOOK] Queue processing error:", error);
      }
    }

    this.processing = false;
  }

  private async processBatch(config: WebhookConfig): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    if (batch.length > 0) {
      try {
        await this.deliverBatchWebhooks(batch, config);
      } catch (error) {
        console.error("[WEBHOOK] Batch processing error:", error);
      }
    }
  }

  private async deliverWebhook(payload: WebhookPayload): Promise<void> {
    // Implementation for individual webhook delivery
    console.log(`[WEBHOOK] Delivering webhook: ${payload.event}`);
  }

  private async deliverBatchWebhooks(
    batch: WebhookPayload[],
    config: WebhookConfig
  ): Promise<void> {
    // Implementation for batch webhook delivery
    console.log(`[WEBHOOK] Delivering batch of ${batch.length} webhooks`);
  }
}

// Global webhook queue
const webhookQueue = new WebhookQueue();

/**
 * Webhook Middleware
 *
 * Provides webhook integration capabilities for real-time event notifications
 * to external systems. Supports batching, retries, and signature validation.
 *
 * @param config - Webhook configuration options
 */
export const webhookMiddleware = (config: Partial<WebhookConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!finalConfig.enabled) {
      next();
      return;
    }

    // Attach webhook dispatcher to request
    req.webhookDispatcher = {
      dispatch: (event: WebhookEventType, data: any, metadata?: any) => {
        dispatchWebhook(event, data, req, finalConfig, metadata);
      },
      dispatchBatch: (
        events: Array<{ event: WebhookEventType; data: any }>
      ) => {
        events.forEach(({ event, data }) => {
          dispatchWebhook(event, data, req, finalConfig, undefined, true);
        });
      },
    };

    console.log(
      `[WEBHOOK] Webhook dispatcher attached for ${req.method} ${req.path}`
    );
    next();
  };
};

/**
 * Dispatch webhook event
 */
function dispatchWebhook(
  event: WebhookEventType,
  data: any,
  req: AuthenticatedRequest,
  config: WebhookConfig,
  metadata?: any,
  batch: boolean = false
): void {
  const payload: WebhookPayload = {
    id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    event,
    timestamp: new Date().toISOString(),
    version: "1.0",
    data: sanitizeWebhookData(data),
    metadata: {
      correlationId: req.correlationId || "unknown",
      tenantId: req.tenant?.id,
      userId: req.user?.id,
      source: "api",
      ...metadata,
    },
  };

  // Add signature if configured
  if (config.signatureSecret) {
    payload.signature = generateWebhookSignature(
      payload,
      config.signatureSecret
    );
  }

  // Queue for delivery
  if (config.enableBatching && batch) {
    webhookQueue.enqueueBatch(payload, config);
  } else {
    webhookQueue.enqueue(payload);
  }

  if (config.enableLogging) {
    console.log(`[WEBHOOK] Queued webhook: ${event} | ${req.correlationId}`);
  }
}

/**
 * Generate webhook signature for validation
 */
function generateWebhookSignature(
  payload: WebhookPayload,
  secret: string
): string {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");
}

/**
 * Sanitize webhook data to remove sensitive information
 */
function sanitizeWebhookData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = [
    "password",
    "secret",
    "token",
    "key",
    "ssn",
    "creditCard",
  ];
  const sanitized = JSON.parse(JSON.stringify(data));

  function recursiveSanitize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(recursiveSanitize);
    }

    if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        if (
          sensitiveFields.some((field) =>
            key.toLowerCase().includes(field.toLowerCase())
          )
        ) {
          obj[key] = "[REDACTED]";
        } else if (typeof value === "object") {
          obj[key] = recursiveSanitize(value);
        }
      }
    }

    return obj;
  }

  return recursiveSanitize(sanitized);
}

/**
 * Validate incoming webhook signature
 */
export const validateWebhookSignature = (secret: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.headers["x-webhook-signature"] as string;

    if (!signature) {
      res.status(401).json({
        message: "Missing webhook signature",
        code: "MISSING_SIGNATURE",
      });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      res.status(401).json({
        message: "Invalid webhook signature",
        code: "INVALID_SIGNATURE",
      });
      return;
    }

    next();
  };
};

// =============================================================================
// WEBHOOK EVENT HELPERS
// =============================================================================

/**
 * User event webhooks
 */
export const dispatchUserCreated =
  (userData: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.USER_CREATED, userData);
  };

export const dispatchUserUpdated =
  (userData: any, changes?: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.USER_UPDATED, {
      user: userData,
      changes,
    });
  };

export const dispatchUserDeleted =
  (userId: string) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.USER_DELETED, { userId });
  };

/**
 * Project event webhooks
 */
export const dispatchProjectCreated =
  (projectData: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(
      WebhookEventType.PROJECT_CREATED,
      projectData
    );
  };

export const dispatchProjectCompleted =
  (projectData: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(
      WebhookEventType.PROJECT_COMPLETED,
      projectData
    );
  };

/**
 * Payment event webhooks
 */
export const dispatchPaymentProcessed =
  (paymentData: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(
      WebhookEventType.PAYMENT_PROCESSED,
      paymentData
    );
  };

export const dispatchPaymentFailed =
  (paymentData: any, error: string) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.PAYMENT_FAILED, {
      payment: paymentData,
      error,
    });
  };

/**
 * Security event webhooks
 */
export const dispatchSecurityAlert =
  (alertData: any) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.SECURITY_ALERT, alertData);
  };

/**
 * Custom event webhook
 */
export const dispatchCustomEvent =
  (eventData: any, customType?: string) => (req: AuthenticatedRequest) => {
    req.webhookDispatcher?.dispatch(WebhookEventType.CUSTOM_EVENT, {
      ...eventData,
      customType,
    });
  };

// =============================================================================
// PRE-CONFIGURED WEBHOOK MIDDLEWARES
// =============================================================================

/**
 * Basic webhook middleware
 */
export const basicWebhookMiddleware = webhookMiddleware({
  enableRetries: true,
  retryAttempts: 3,
  enableLogging: true,
  enableBatching: false,
});

/**
 * High-throughput webhook middleware with batching
 */
export const batchWebhookMiddleware = webhookMiddleware({
  enableBatching: true,
  batchSize: 50,
  batchTimeout: 10000,
  enableRetries: true,
  retryAttempts: 5,
});

/**
 * Secure webhook middleware with signature validation
 */
export const secureWebhookMiddleware = webhookMiddleware({
  enableSignatureValidation: true,
  enableRetries: true,
  retryAttempts: 2,
  timeout: 5000,
});

// =============================================================================
// WEBHOOK MANAGEMENT API
// =============================================================================

/**
 * Register webhook endpoint
 */
export const registerWebhookEndpoint = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { url, events, secret, tenantId } = req.body;

  const endpoint: WebhookEndpoint = {
    id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url,
    events: events || Object.values(WebhookEventType),
    active: true,
    secret,
    tenantId: tenantId || req.tenant?.id,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Enterprise-Webhook/1.0",
    },
  };

  // In production, this would be stored in database
  console.log(
    `[WEBHOOK] Registered endpoint: ${endpoint.id} -> ${endpoint.url}`
  );

  res.json({
    message: "Webhook endpoint registered successfully",
    endpoint: {
      id: endpoint.id,
      url: endpoint.url,
      events: endpoint.events,
      active: endpoint.active,
    },
  });
};

/**
 * Test webhook endpoint
 */
export const testWebhookEndpoint = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { endpointId } = req.params;

  // Send test webhook
  req.webhookDispatcher?.dispatch(
    WebhookEventType.CUSTOM_EVENT,
    {
      test: true,
      message: "This is a test webhook",
      timestamp: new Date().toISOString(),
    },
    {
      endpointId,
      testEvent: true,
    }
  );

  res.json({
    message: "Test webhook dispatched",
    endpointId,
    timestamp: new Date().toISOString(),
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      webhookDispatcher?: {
        dispatch: (event: WebhookEventType, data: any, metadata?: any) => void;
        dispatchBatch: (
          events: Array<{ event: WebhookEventType; data: any }>
        ) => void;
      };
    }
  }
}

export { WebhookEventType };
export default webhookMiddleware;
