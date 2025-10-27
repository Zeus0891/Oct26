import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * Notification Types
 */
enum NotificationType {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
  SLACK = "slack",
  WEBHOOK = "webhook",
  SYSTEM = "system",
}

/**
 * Notification Priority
 */
enum NotificationPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
  CRITICAL = 4,
}

/**
 * Notification Status
 */
enum NotificationStatus {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  READ = "read",
}

/**
 * Notification Interface
 */
interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientId: string;
  recipientType: "user" | "tenant" | "role" | "custom";
  title: string;
  message: string;
  data?: any;
  metadata: {
    correlationId: string;
    tenantId?: string;
    userId?: string;
    source: string;
    createdAt: string;
    scheduledAt?: string;
    sentAt?: string;
    readAt?: string;
    retryCount: number;
    maxRetries: number;
  };
  channels: NotificationType[];
  template?: {
    id: string;
    variables: Record<string, any>;
  };
}

/**
 * Notification Template
 */
interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

/**
 * Notification Configuration
 */
interface NotificationConfig {
  enabled: boolean;
  enabledChannels: NotificationType[];
  defaultPriority: NotificationPriority;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  batchDelay: number;
  enableTemplates: boolean;
  enableScheduling: boolean;
  enableRateLimiting: boolean;
  rateLimits: Record<NotificationType, { count: number; window: number }>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  enabledChannels: [
    NotificationType.EMAIL,
    NotificationType.IN_APP,
    NotificationType.PUSH,
  ],
  defaultPriority: NotificationPriority.NORMAL,
  retryAttempts: 3,
  retryDelay: 1000,
  batchSize: 100,
  batchDelay: 5000,
  enableTemplates: true,
  enableScheduling: true,
  enableRateLimiting: true,
  rateLimits: {
    [NotificationType.EMAIL]: { count: 100, window: 3600000 }, // 100 per hour
    [NotificationType.SMS]: { count: 20, window: 3600000 }, // 20 per hour
    [NotificationType.PUSH]: { count: 1000, window: 3600000 }, // 1000 per hour
    [NotificationType.IN_APP]: { count: 1000, window: 3600000 },
    [NotificationType.SLACK]: { count: 50, window: 3600000 },
    [NotificationType.WEBHOOK]: { count: 200, window: 3600000 },
    [NotificationType.SYSTEM]: { count: 1000, window: 3600000 },
  },
};

/**
 * Rate Limiter for notifications
 */
class NotificationRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  canSend(key: string, limit: { count: number; window: number }): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < limit.window);

    if (validAttempts.length >= limit.count) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  getWaitTime(key: string, limit: { count: number; window: number }): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < limit.count) return 0;

    const oldestAttempt = attempts[0];
    return limit.window - (Date.now() - oldestAttempt);
  }
}

/**
 * Notification Store
 */
class NotificationStore {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private queue: Notification[] = [];
  private processing = false;

  // Initialize with basic templates
  constructor() {
    this.initializeDefaultTemplates();
  }

  addNotification(notification: Notification): void {
    this.notifications.set(notification.id, notification);

    if (notification.status === NotificationStatus.PENDING) {
      this.queue.push(notification);

      if (!this.processing) {
        this.processQueue();
      }
    }
  }

  getNotification(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  updateNotificationStatus(id: string, status: NotificationStatus): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = status;

      if (status === NotificationStatus.SENT) {
        notification.metadata.sentAt = new Date().toISOString();
      } else if (status === NotificationStatus.READ) {
        notification.metadata.readAt = new Date().toISOString();
      }
    }
  }

  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const notification = this.queue.shift()!;

      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error(
          `[NOTIFICATION] Failed to send notification ${notification.id}:`,
          error
        );
        this.handleFailedNotification(notification, error);
      }
    }

    this.processing = false;
  }

  private async sendNotification(notification: Notification): Promise<void> {
    notification.status = NotificationStatus.SENDING;

    // Simulate sending notification
    console.log(
      `[NOTIFICATION] Sending ${notification.type}: ${notification.title} to ${notification.recipientId}`
    );

    // In a real implementation, this would integrate with actual notification services
    await this.sleep(100); // Simulate async operation

    notification.status = NotificationStatus.SENT;
    notification.metadata.sentAt = new Date().toISOString();
  }

  private handleFailedNotification(
    notification: Notification,
    error: any
  ): void {
    notification.metadata.retryCount++;

    if (notification.metadata.retryCount < notification.metadata.maxRetries) {
      notification.status = NotificationStatus.PENDING;
      this.queue.push(notification);
      console.log(
        `[NOTIFICATION] Retrying notification ${notification.id} (attempt ${notification.metadata.retryCount})`
      );
    } else {
      notification.status = NotificationStatus.FAILED;
      console.error(
        `[NOTIFICATION] Notification ${notification.id} failed after ${notification.metadata.maxRetries} attempts`
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private initializeDefaultTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: "welcome_email",
        name: "Welcome Email",
        type: NotificationType.EMAIL,
        subject: "Welcome to {{appName}}!",
        body: "Hi {{userName}}, welcome to {{appName}}! We're excited to have you on board.",
        variables: ["appName", "userName"],
        isActive: true,
      },
      {
        id: "password_reset",
        name: "Password Reset",
        type: NotificationType.EMAIL,
        subject: "Reset Your Password",
        body: "Click the following link to reset your password: {{resetLink}}",
        variables: ["resetLink"],
        isActive: true,
      },
      {
        id: "project_completed",
        name: "Project Completed",
        type: NotificationType.IN_APP,
        body: 'Your project "{{projectName}}" has been completed successfully!',
        variables: ["projectName"],
        isActive: true,
      },
      {
        id: "security_alert",
        name: "Security Alert",
        type: NotificationType.PUSH,
        body: "Security alert: {{alertMessage}}",
        variables: ["alertMessage"],
        isActive: true,
      },
    ];

    templates.forEach((template) => this.addTemplate(template));
  }

  getNotificationsByRecipient(recipientId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.recipientId === recipientId)
      .sort(
        (a, b) =>
          new Date(b.metadata.createdAt).getTime() -
          new Date(a.metadata.createdAt).getTime()
      );
  }

  getUnreadNotifications(recipientId: string): Notification[] {
    return this.getNotificationsByRecipient(recipientId).filter(
      (n) => n.status !== NotificationStatus.READ
    );
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.status !== NotificationStatus.READ) {
      this.updateNotificationStatus(notificationId, NotificationStatus.READ);
      return true;
    }
    return false;
  }
}

// Global notification store
const notificationStore = new NotificationStore();
const rateLimiter = new NotificationRateLimiter();

/**
 * Notification Middleware
 *
 * Provides comprehensive notification capabilities including email, SMS, push,
 * in-app notifications with templates, scheduling, and rate limiting.
 *
 * @param config - Notification configuration options
 */
export const notificationMiddleware = (
  config: Partial<NotificationConfig> = {}
) => {
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

    // Attach notification methods to request
    req.notifications = {
      send: async (
        type: NotificationType,
        recipientId: string,
        title: string,
        message: string,
        options?: {
          priority?: NotificationPriority;
          data?: any;
          channels?: NotificationType[];
          templateId?: string;
          templateVariables?: Record<string, any>;
          scheduledAt?: Date;
        }
      ) => {
        return sendNotification(
          type,
          recipientId,
          title,
          message,
          req,
          finalConfig,
          options
        );
      },

      sendEmail: async (
        recipientId: string,
        subject: string,
        body: string,
        options?: any
      ) => {
        return sendNotification(
          NotificationType.EMAIL,
          recipientId,
          subject,
          body,
          req,
          finalConfig,
          options
        );
      },

      sendSMS: async (recipientId: string, message: string, options?: any) => {
        return sendNotification(
          NotificationType.SMS,
          recipientId,
          "SMS Notification",
          message,
          req,
          finalConfig,
          options
        );
      },

      sendPush: async (
        recipientId: string,
        title: string,
        body: string,
        options?: any
      ) => {
        return sendNotification(
          NotificationType.PUSH,
          recipientId,
          title,
          body,
          req,
          finalConfig,
          options
        );
      },

      sendInApp: async (
        recipientId: string,
        title: string,
        message: string,
        options?: any
      ) => {
        return sendNotification(
          NotificationType.IN_APP,
          recipientId,
          title,
          message,
          req,
          finalConfig,
          options
        );
      },

      getForUser: (userId: string) => {
        return notificationStore.getNotificationsByRecipient(userId);
      },

      getUnreadForUser: (userId: string) => {
        return notificationStore.getUnreadNotifications(userId);
      },

      markAsRead: (notificationId: string) => {
        return notificationStore.markAsRead(notificationId);
      },
    };

    console.log(
      `[NOTIFICATION] Notification system attached for ${req.method} ${req.path}`
    );
    next();
  };
};

/**
 * Send notification
 */
async function sendNotification(
  type: NotificationType,
  recipientId: string,
  title: string,
  message: string,
  req: AuthenticatedRequest,
  config: NotificationConfig,
  options?: any
): Promise<string> {
  // Check if notification type is enabled
  if (!config.enabledChannels.includes(type)) {
    throw new Error(`Notification type ${type} is not enabled`);
  }

  // Check rate limiting
  if (config.enableRateLimiting) {
    const rateLimitKey = `${recipientId}:${type}`;
    const limit = config.rateLimits[type];

    if (!rateLimiter.canSend(rateLimitKey, limit)) {
      const waitTime = rateLimiter.getWaitTime(rateLimitKey, limit);
      throw new Error(
        `Rate limit exceeded for ${type}. Wait ${Math.ceil(
          waitTime / 1000
        )} seconds.`
      );
    }
  }

  // Process template if provided
  let processedTitle = title;
  let processedMessage = message;

  if (options?.templateId && config.enableTemplates) {
    const template = notificationStore.getTemplate(options.templateId);
    if (template) {
      processedTitle = processTemplate(
        template.subject || title,
        options.templateVariables || {}
      );
      processedMessage = processTemplate(
        template.body,
        options.templateVariables || {}
      );
    }
  }

  // Create notification
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    priority: options?.priority || config.defaultPriority,
    status: NotificationStatus.PENDING,
    recipientId,
    recipientType: "user", // Default to user, could be enhanced
    title: processedTitle,
    message: processedMessage,
    data: options?.data,
    metadata: {
      correlationId: req.correlationId || "unknown",
      tenantId: req.tenant?.id,
      userId: req.user?.id,
      source: `${req.method} ${req.path}`,
      createdAt: new Date().toISOString(),
      scheduledAt: options?.scheduledAt?.toISOString(),
      retryCount: 0,
      maxRetries: config.retryAttempts,
    },
    channels: options?.channels || [type],
    template: options?.templateId
      ? {
          id: options.templateId,
          variables: options.templateVariables || {},
        }
      : undefined,
  };

  // Add to store and queue for processing
  notificationStore.addNotification(notification);

  console.log(
    `[NOTIFICATION] Queued ${type} notification: ${title} for ${recipientId}`
  );
  return notification.id;
}

/**
 * Process template with variables
 */
function processTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let processed = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, String(value));
  });

  return processed;
}

// =============================================================================
// NOTIFICATION EVENT HANDLERS
// =============================================================================

/**
 * Welcome notification for new users
 */
export const sendWelcomeNotification =
  (userData: any) => (req: AuthenticatedRequest) => {
    if (req.notifications) {
      req.notifications.send(
        NotificationType.EMAIL,
        userData.id,
        "Welcome!",
        "",
        {
          templateId: "welcome_email",
          templateVariables: {
            appName: "Your App",
            userName: userData.firstName || userData.email,
          },
          priority: NotificationPriority.NORMAL,
        }
      );
    }
  };

/**
 * Project completion notification
 */
export const sendProjectCompletionNotification =
  (projectData: any) => (req: AuthenticatedRequest) => {
    if (req.notifications) {
      req.notifications.send(
        NotificationType.IN_APP,
        projectData.ownerId,
        "Project Completed",
        "",
        {
          templateId: "project_completed",
          templateVariables: {
            projectName: projectData.name,
          },
          priority: NotificationPriority.HIGH,
          channels: [NotificationType.IN_APP, NotificationType.PUSH],
        }
      );
    }
  };

/**
 * Security alert notification
 */
export const sendSecurityAlertNotification =
  (alertData: any) => (req: AuthenticatedRequest) => {
    if (req.notifications) {
      req.notifications.send(
        NotificationType.PUSH,
        alertData.userId,
        "Security Alert",
        "",
        {
          templateId: "security_alert",
          templateVariables: {
            alertMessage: alertData.message,
          },
          priority: NotificationPriority.CRITICAL,
          channels: [
            NotificationType.PUSH,
            NotificationType.EMAIL,
            NotificationType.IN_APP,
          ],
        }
      );
    }
  };

// =============================================================================
// PRE-CONFIGURED NOTIFICATION MIDDLEWARES
// =============================================================================

/**
 * Basic notification middleware
 */
export const basicNotificationMiddleware = notificationMiddleware({
  enabledChannels: [NotificationType.EMAIL, NotificationType.IN_APP],
  enableTemplates: true,
  enableRateLimiting: true,
});

/**
 * Full notification middleware with all channels
 */
export const fullNotificationMiddleware = notificationMiddleware({
  enabledChannels: Object.values(NotificationType),
  enableTemplates: true,
  enableScheduling: true,
  enableRateLimiting: true,
});

/**
 * High-priority notification middleware
 */
export const priorityNotificationMiddleware = notificationMiddleware({
  enabledChannels: [
    NotificationType.EMAIL,
    NotificationType.SMS,
    NotificationType.PUSH,
  ],
  defaultPriority: NotificationPriority.HIGH,
  retryAttempts: 5,
});

// =============================================================================
// NOTIFICATION API ENDPOINTS
// =============================================================================

/**
 * Get user notifications
 */
export const getUserNotifications = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const { unreadOnly = false, limit = 50 } = req.query;

  let notifications =
    unreadOnly === "true"
      ? notificationStore.getUnreadNotifications(req.user.id)
      : notificationStore.getNotificationsByRecipient(req.user.id);

  notifications = notifications.slice(0, parseInt(limit as string));

  res.json({
    notifications,
    total: notifications.length,
    unreadCount: notificationStore.getUnreadNotifications(req.user.id).length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { notificationId } = req.params;

  const success = notificationStore.markAsRead(notificationId);

  if (success) {
    res.json({
      message: "Notification marked as read",
      notificationId,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(404).json({
      message: "Notification not found or already read",
      notificationId,
    });
  }
};

/**
 * Send test notification
 */
export const sendTestNotification = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const { type = "in_app", title, message } = req.body;

  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.notifications) {
    req.notifications
      .send(
        type as NotificationType,
        req.user.id,
        title || "Test Notification",
        message || "This is a test notification.",
        {
          priority: NotificationPriority.LOW,
          data: { test: true },
        }
      )
      .then((notificationId) => {
        res.json({
          message: "Test notification sent",
          notificationId,
          timestamp: new Date().toISOString(),
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Failed to send test notification",
          error: error.message,
        });
      });
  } else {
    res.status(500).json({ message: "Notification system not available" });
  }
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      notifications?: {
        send: (
          type: NotificationType,
          recipientId: string,
          title: string,
          message: string,
          options?: any
        ) => Promise<string>;
        sendEmail: (
          recipientId: string,
          subject: string,
          body: string,
          options?: any
        ) => Promise<string>;
        sendSMS: (
          recipientId: string,
          message: string,
          options?: any
        ) => Promise<string>;
        sendPush: (
          recipientId: string,
          title: string,
          body: string,
          options?: any
        ) => Promise<string>;
        sendInApp: (
          recipientId: string,
          title: string,
          message: string,
          options?: any
        ) => Promise<string>;
        getForUser: (userId: string) => Notification[];
        getUnreadForUser: (userId: string) => Notification[];
        markAsRead: (notificationId: string) => boolean;
      };
    }
  }
}

export { NotificationType, NotificationPriority, NotificationStatus };
export default notificationMiddleware;
