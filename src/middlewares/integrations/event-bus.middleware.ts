import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Event Types
 */
enum EventType {
  USER_ACTION = "user.action",
  SYSTEM_EVENT = "system.event",
  BUSINESS_EVENT = "business.event",
  INTEGRATION_EVENT = "integration.event",
  ERROR_EVENT = "error.event",
  SECURITY_EVENT = "security.event",
  PERFORMANCE_EVENT = "performance.event",
  CUSTOM_EVENT = "custom.event",
}

/**
 * Event Priority Levels
 */
enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Event Interface
 */
interface Event {
  id: string;
  type: EventType;
  name: string;
  priority: EventPriority;
  timestamp: string;
  source: string;
  correlationId: string;
  tenantId?: string;
  userId?: string;
  data: any;
  metadata: {
    version: string;
    retryCount?: number;
    maxRetries?: number;
    delay?: number;
    tags?: string[];
  };
}

/**
 * Event Handler Function Type
 */
type EventHandler = (event: Event) => Promise<void> | void;

/**
 * Event Subscription
 */
interface EventSubscription {
  id: string;
  eventType: EventType;
  eventName?: string;
  handler: EventHandler;
  filter?: (event: Event) => boolean;
  priority: number;
  active: boolean;
  retryConfig?: {
    maxRetries: number;
    delay: number;
    backoff: "linear" | "exponential";
  };
}

/**
 * Event Bus Configuration
 */
interface EventBusConfig {
  enabled: boolean;
  maxQueueSize: number;
  processingDelay: number;
  enablePersistence: boolean;
  enableRetries: boolean;
  defaultRetries: number;
  deadLetterQueue: boolean;
  enableMetrics: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: EventBusConfig = {
  enabled: true,
  maxQueueSize: 10000,
  processingDelay: 10, // milliseconds
  enablePersistence: false,
  enableRetries: true,
  defaultRetries: 3,
  deadLetterQueue: true,
  enableMetrics: true,
};

/**
 * Event Bus Implementation
 */
class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventQueue: Event[] = [];
  private processing: boolean = false;
  private deadLetterQueue: Event[] = [];
  private metrics = {
    totalEvents: 0,
    processedEvents: 0,
    failedEvents: 0,
    subscriberCount: 0,
  };

  constructor(private config: EventBusConfig) {}

  /**
   * Subscribe to events
   */
  subscribe(
    eventType: EventType,
    handler: EventHandler,
    options?: {
      eventName?: string;
      filter?: (event: Event) => boolean;
      priority?: number;
      retryConfig?: EventSubscription["retryConfig"];
    }
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      eventName: options?.eventName,
      handler,
      filter: options?.filter,
      priority: options?.priority || 1,
      active: true,
      retryConfig: options?.retryConfig,
    };

    const key = this.getSubscriptionKey(eventType, options?.eventName);
    const existingSubscriptions = this.subscriptions.get(key) || [];

    // Insert subscription based on priority (higher priority first)
    existingSubscriptions.push(subscription);
    existingSubscriptions.sort((a, b) => b.priority - a.priority);

    this.subscriptions.set(key, existingSubscriptions);
    this.metrics.subscriberCount++;

    console.log(
      `[EVENT_BUS] Subscribed to ${eventType}${
        options?.eventName ? `:${options.eventName}` : ""
      } with priority ${subscription.priority}`
    );
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [key, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((sub) => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(key);
        }
        this.metrics.subscriberCount--;
        console.log(`[EVENT_BUS] Unsubscribed ${subscriptionId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Publish event
   */
  async publish(event: Event): Promise<void> {
    if (!this.config.enabled) return;

    // Add to queue if it's not full
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      console.warn(`[EVENT_BUS] Queue full, dropping event: ${event.name}`);
      return;
    }

    this.eventQueue.push(event);
    this.metrics.totalEvents++;

    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;

      try {
        await this.processEvent(event);
        this.metrics.processedEvents++;
      } catch (error) {
        console.error(`[EVENT_BUS] Error processing event ${event.id}:`, error);
        this.handleFailedEvent(event, error);
        this.metrics.failedEvents++;
      }

      // Small delay to prevent CPU overload
      if (this.config.processingDelay > 0) {
        await this.sleep(this.config.processingDelay);
      }
    }

    this.processing = false;
  }

  /**
   * Process individual event
   */
  private async processEvent(event: Event): Promise<void> {
    const key = this.getSubscriptionKey(event.type, event.name);
    const subscriptions = this.subscriptions.get(key) || [];

    // Also check for wildcard subscriptions (no specific event name)
    const wildcardKey = this.getSubscriptionKey(event.type);
    const wildcardSubscriptions = this.subscriptions.get(wildcardKey) || [];

    const allSubscriptions = [...subscriptions, ...wildcardSubscriptions];

    if (allSubscriptions.length === 0) {
      console.log(
        `[EVENT_BUS] No subscribers for event: ${event.type}:${event.name}`
      );
      return;
    }

    // Process subscriptions in parallel (for different handlers)
    const promises = allSubscriptions
      .filter((sub) => sub.active)
      .filter((sub) => !sub.filter || sub.filter(event))
      .map((sub) => this.executeHandler(sub, event));

    await Promise.allSettled(promises);
  }

  /**
   * Execute event handler with retry logic
   */
  private async executeHandler(
    subscription: EventSubscription,
    event: Event
  ): Promise<void> {
    const maxRetries =
      subscription.retryConfig?.maxRetries || this.config.defaultRetries;
    let retryCount = event.metadata.retryCount || 0;

    while (retryCount <= maxRetries) {
      try {
        await subscription.handler(event);
        return; // Success
      } catch (error) {
        retryCount++;

        if (retryCount > maxRetries) {
          console.error(
            `[EVENT_BUS] Handler failed after ${maxRetries} retries:`,
            error
          );
          throw error;
        }

        // Calculate retry delay
        const baseDelay = subscription.retryConfig?.delay || 1000;
        const delay =
          subscription.retryConfig?.backoff === "exponential"
            ? baseDelay * Math.pow(2, retryCount - 1)
            : baseDelay * retryCount;

        console.warn(
          `[EVENT_BUS] Handler failed, retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`
        );
        await this.sleep(delay);

        // Update retry count in event metadata
        event.metadata.retryCount = retryCount;
      }
    }
  }

  /**
   * Handle failed events
   */
  private handleFailedEvent(event: Event, error: any): void {
    if (this.config.deadLetterQueue) {
      // Add error information to event
      const failedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          error: error.message || "Unknown error",
          failedAt: new Date().toISOString(),
        },
      };

      this.deadLetterQueue.push(failedEvent);
      console.log(`[EVENT_BUS] Event moved to dead letter queue: ${event.id}`);
    }
  }

  /**
   * Get subscription key
   */
  private getSubscriptionKey(eventType: EventType, eventName?: string): string {
    return eventName ? `${eventType}:${eventName}` : eventType;
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get event bus metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      queueSize: this.eventQueue.length,
      deadLetterQueueSize: this.deadLetterQueue.length,
      subscriptionCount: Array.from(this.subscriptions.values()).reduce(
        (total, subs) => total + subs.length,
        0
      ),
    };
  }

  /**
   * Get dead letter queue events
   */
  getDeadLetterQueue(): Event[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }
}

// Global event bus instance
const eventBus = new EventBus(DEFAULT_CONFIG);

/**
 * Event Bus Middleware
 *
 * Provides internal event bus capabilities for decoupled communication
 * between different parts of the application.
 *
 * @param config - Event bus configuration options
 */
export const eventBusMiddleware = (config: Partial<EventBusConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Update global event bus configuration
  Object.assign(eventBus["config"], finalConfig);

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!finalConfig.enabled) {
      next();
      return;
    }

    // Attach event bus methods to request
    req.eventBus = {
      publish: async (
        type: EventType,
        name: string,
        data: any,
        options?: {
          priority?: EventPriority;
          tags?: string[];
          maxRetries?: number;
        }
      ) => {
        const event: Event = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          name,
          priority: options?.priority || EventPriority.NORMAL,
          timestamp: new Date().toISOString(),
          source: `${req.method} ${req.path}`,
          correlationId: req.correlationId || "unknown",
          tenantId: req.tenant?.id,
          userId: req.user?.id,
          data,
          metadata: {
            version: "1.0",
            maxRetries: options?.maxRetries,
            tags: options?.tags,
          },
        };

        await eventBus.publish(event);
        console.log(
          `[EVENT_BUS] Published event: ${type}:${name} | ${req.correlationId}`
        );
      },

      subscribe: (
        eventType: EventType,
        handler: EventHandler,
        options?: Parameters<typeof eventBus.subscribe>[2]
      ) => {
        return eventBus.subscribe(eventType, handler, options);
      },

      unsubscribe: (subscriptionId: string) => {
        return eventBus.unsubscribe(subscriptionId);
      },
    };

    console.log(`[EVENT_BUS] Event bus attached for ${req.method} ${req.path}`);
    next();
  };
};

// =============================================================================
// EVENT PUBLISHERS (Helper Functions)
// =============================================================================

/**
 * User Events
 */
export const publishUserCreated =
  (userData: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(EventType.USER_ACTION, "user.created", userData, {
      priority: EventPriority.HIGH,
      tags: ["user", "creation"],
    });
  };

export const publishUserUpdated =
  (userData: any, changes: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.USER_ACTION,
      "user.updated",
      { user: userData, changes },
      {
        priority: EventPriority.NORMAL,
        tags: ["user", "update"],
      }
    );
  };

export const publishUserDeleted =
  (userId: string) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.USER_ACTION,
      "user.deleted",
      { userId },
      {
        priority: EventPriority.HIGH,
        tags: ["user", "deletion"],
      }
    );
  };

/**
 * Business Events
 */
export const publishProjectCompleted =
  (projectData: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.BUSINESS_EVENT,
      "project.completed",
      projectData,
      {
        priority: EventPriority.HIGH,
        tags: ["project", "completion"],
      }
    );
  };

export const publishPaymentProcessed =
  (paymentData: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.BUSINESS_EVENT,
      "payment.processed",
      paymentData,
      {
        priority: EventPriority.CRITICAL,
        tags: ["payment", "financial"],
      }
    );
  };

/**
 * System Events
 */
export const publishSystemError =
  (error: any, context: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.ERROR_EVENT,
      "system.error",
      { error: error.message, context },
      {
        priority: EventPriority.CRITICAL,
        tags: ["system", "error"],
      }
    );
  };

export const publishPerformanceAlert =
  (metrics: any) => (req: AuthenticatedRequest) => {
    req.eventBus?.publish(
      EventType.PERFORMANCE_EVENT,
      "performance.alert",
      metrics,
      {
        priority: EventPriority.HIGH,
        tags: ["performance", "monitoring"],
      }
    );
  };

// =============================================================================
// EVENT SUBSCRIBERS (Example Handlers)
// =============================================================================

/**
 * Email notification subscriber
 */
const emailNotificationHandler: EventHandler = async (event: Event) => {
  console.log(`[EVENT_BUS] Email notification for: ${event.name}`, event.data);
  // TODO: Integrate with email service
};

/**
 * Slack notification subscriber
 */
const slackNotificationHandler: EventHandler = async (event: Event) => {
  if (event.priority >= EventPriority.HIGH) {
    console.log(
      `[EVENT_BUS] Slack notification for: ${event.name}`,
      event.data
    );
    // TODO: Integrate with Slack API
  }
};

/**
 * Analytics subscriber
 */
const analyticsHandler: EventHandler = async (event: Event) => {
  console.log(`[EVENT_BUS] Analytics tracking: ${event.name}`, {
    type: event.type,
    tenantId: event.tenantId,
    userId: event.userId,
    timestamp: event.timestamp,
  });
  // TODO: Integrate with analytics service
};

/**
 * Audit log subscriber
 */
const auditLogHandler: EventHandler = async (event: Event) => {
  if (
    event.type === EventType.USER_ACTION ||
    event.type === EventType.BUSINESS_EVENT
  ) {
    console.log(`[EVENT_BUS] Audit log entry: ${event.name}`, event.data);
    // TODO: Integrate with audit log service
  }
};

// =============================================================================
// PRE-CONFIGURED EVENT BUS SETUPS
// =============================================================================

/**
 * Initialize default event subscribers
 */
export const initializeDefaultSubscribers = (): void => {
  // Email notifications for user events
  eventBus.subscribe(EventType.USER_ACTION, emailNotificationHandler, {
    priority: 1,
    filter: (event) => ["user.created", "user.deleted"].includes(event.name),
  });

  // Slack notifications for critical events
  eventBus.subscribe(EventType.ERROR_EVENT, slackNotificationHandler, {
    priority: 3,
  });
  eventBus.subscribe(EventType.SECURITY_EVENT, slackNotificationHandler, {
    priority: 3,
  });

  // Analytics for all events
  eventBus.subscribe(EventType.USER_ACTION, analyticsHandler, { priority: 1 });
  eventBus.subscribe(EventType.BUSINESS_EVENT, analyticsHandler, {
    priority: 1,
  });

  // Audit logging for important events
  eventBus.subscribe(EventType.USER_ACTION, auditLogHandler, { priority: 2 });
  eventBus.subscribe(EventType.BUSINESS_EVENT, auditLogHandler, {
    priority: 2,
  });

  console.log("[EVENT_BUS] Default subscribers initialized");
};

/**
 * Basic event bus middleware
 */
export const basicEventBusMiddleware = eventBusMiddleware({
  maxQueueSize: 1000,
  enableRetries: true,
  defaultRetries: 2,
});

/**
 * High-throughput event bus middleware
 */
export const highThroughputEventBusMiddleware = eventBusMiddleware({
  maxQueueSize: 50000,
  processingDelay: 0,
  enableRetries: false,
  deadLetterQueue: false,
});

// =============================================================================
// EVENT BUS MANAGEMENT API
// =============================================================================

/**
 * Get event bus metrics
 */
export const getEventBusMetrics = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const metrics = eventBus.getMetrics();

  res.json({
    metrics,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get dead letter queue
 */
export const getDeadLetterQueue = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const deadLetterQueue = eventBus.getDeadLetterQueue();

  res.json({
    events: deadLetterQueue,
    count: deadLetterQueue.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Clear dead letter queue
 */
export const clearDeadLetterQueue = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user?.roles?.includes("SYSTEM_ADMIN")) {
    res.status(403).json({ message: "System admin access required" });
    return;
  }

  eventBus.clearDeadLetterQueue();

  res.json({
    message: "Dead letter queue cleared",
    clearedBy: req.user.email,
    timestamp: new Date().toISOString(),
  });
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      eventBus?: {
        publish: (
          type: EventType,
          name: string,
          data: any,
          options?: {
            priority?: EventPriority;
            tags?: string[];
            maxRetries?: number;
          }
        ) => Promise<void>;
        subscribe: (
          eventType: EventType,
          handler: EventHandler,
          options?: Parameters<typeof eventBus.subscribe>[2]
        ) => string;
        unsubscribe: (subscriptionId: string) => boolean;
      };
    }
  }
}

export { EventType, EventPriority, eventBus };
export default eventBusMiddleware;
