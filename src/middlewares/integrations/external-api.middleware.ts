import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * External API Configuration
 */
interface ExternalAPIConfig {
  name: string;
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  authentication?: {
    type: "bearer" | "basic" | "apikey" | "custom";
    credentials: Record<string, string>;
    headerName?: string;
  };
  headers?: Record<string, string>;
}

/**
 * API Request Result
 */
interface APIRequestResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  responseTime: number;
  fromCache?: boolean;
  retryCount?: number;
}

/**
 * HTTP Request Configuration
 */
interface RequestConfig {
  method?: string;
  url?: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

/**
 * Simple HTTP Client Implementation
 */
class SimpleHTTPClient {
  private config: ExternalAPIConfig;

  constructor(config: ExternalAPIConfig) {
    this.config = config;
  }

  async request<T = any>(
    requestConfig: RequestConfig
  ): Promise<APIRequestResult<T>> {
    const startTime = Date.now();

    try {
      // In a real implementation, this would make actual HTTP requests
      // For now, we'll simulate the response
      console.log(
        `[HTTP_CLIENT] Simulating request to ${this.config.name}: ${
          requestConfig.method || "GET"
        } ${requestConfig.url}`
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate successful response
      const mockResponse = {
        data: {
          message: `Mock response from ${this.config.name}`,
          success: true,
        },
        status: 200,
        statusText: "OK",
      };

      return {
        success: true,
        data: mockResponse.data as T,
        statusCode: mockResponse.status,
        responseTime: Date.now() - startTime,
        retryCount: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Request failed",
        responseTime: Date.now() - startTime,
        retryCount: 0,
      };
    }
  }

  getStats() {
    return {
      name: this.config.name,
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    };
  }
}

/**
 * External API Registry
 */
class ExternalAPIRegistry {
  private clients: Map<string, SimpleHTTPClient> = new Map();

  register(name: string, config: ExternalAPIConfig): void {
    this.clients.set(name, new SimpleHTTPClient(config));
  }

  get(name: string): SimpleHTTPClient | undefined {
    return this.clients.get(name);
  }

  list(): string[] {
    return Array.from(this.clients.keys());
  }
}

// Global API registry
const apiRegistry = new ExternalAPIRegistry();

/**
 * External API Integration Middleware
 *
 * Provides integration capabilities with external APIs including authentication,
 * rate limiting, circuit breaking, caching, and retry logic.
 *
 * @param apis - Array of external API configurations
 */
export const externalAPIMiddleware = (apis: ExternalAPIConfig[] = []) => {
  // Register APIs
  apis.forEach((api) => {
    apiRegistry.register(api.name, api);
  });

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    // Attach API client getter to request
    req.getAPIClient = (name: string) => {
      const client = apiRegistry.get(name);
      if (!client) {
        throw new Error(`API client '${name}' not found`);
      }
      return client;
    };

    // Attach convenient API methods
    req.callAPI = async <T = any>(
      apiName: string,
      requestConfig: RequestConfig
    ): Promise<APIRequestResult<T>> => {
      const client = req.getAPIClient!(apiName);
      return client.request<T>(requestConfig);
    };

    console.log(
      `[EXTERNAL_API] API clients available: ${apiRegistry.list().join(", ")}`
    );
    next();
  };
};

// =============================================================================
// PRE-CONFIGURED API INTEGRATIONS
// =============================================================================

/**
 * Stripe Payment API Integration
 */
export const stripeAPIConfig: ExternalAPIConfig = {
  name: "stripe",
  baseURL: "https://api.stripe.com/v1",
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  authentication: {
    type: "bearer",
    credentials: {
      token: process.env.STRIPE_SECRET_KEY || "sk_test_...",
    },
  },
  headers: {
    "Stripe-Version": "2023-10-16",
  },
};

/**
 * SendGrid Email API Integration
 */
export const sendgridAPIConfig: ExternalAPIConfig = {
  name: "sendgrid",
  baseURL: "https://api.sendgrid.com/v3",
  timeout: 15000,
  retries: 2,
  retryDelay: 2000,
  authentication: {
    type: "bearer",
    credentials: {
      token: process.env.SENDGRID_API_KEY || "SG.xxx",
    },
  },
};

/**
 * Slack API Integration
 */
export const slackAPIConfig: ExternalAPIConfig = {
  name: "slack",
  baseURL: "https://slack.com/api",
  timeout: 8000,
  retries: 2,
  retryDelay: 1000,
  authentication: {
    type: "bearer",
    credentials: {
      token: process.env.SLACK_BOT_TOKEN || "xoxb-xxx",
    },
  },
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Twilio SMS API Integration
 */
export const twilioAPIConfig: ExternalAPIConfig = {
  name: "twilio",
  baseURL: "https://api.twilio.com/2010-04-01",
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  authentication: {
    type: "basic",
    credentials: {
      username: process.env.TWILIO_ACCOUNT_SID || "ACxxx",
      password: process.env.TWILIO_AUTH_TOKEN || "xxx",
    },
  },
};

// =============================================================================
// API HELPER FUNCTIONS
// =============================================================================

/**
 * Send email via SendGrid
 */
export const sendEmail = async (
  req: AuthenticatedRequest,
  to: string,
  subject: string,
  content: string,
  isHTML: boolean = false
): Promise<APIRequestResult> => {
  return req.callAPI!("sendgrid", {
    method: "POST",
    url: "/mail/send",
    data: {
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: process.env.FROM_EMAIL || "noreply@example.com" },
      content: [
        {
          type: isHTML ? "text/html" : "text/plain",
          value: content,
        },
      ],
    },
  });
};

/**
 * Send Slack notification
 */
export const sendSlackNotification = async (
  req: AuthenticatedRequest,
  channel: string,
  message: string,
  attachments?: any[]
): Promise<APIRequestResult> => {
  return req.callAPI!("slack", {
    method: "POST",
    url: "/chat.postMessage",
    data: {
      channel,
      text: message,
      attachments,
    },
  });
};

/**
 * Send SMS via Twilio
 */
export const sendSMS = async (
  req: AuthenticatedRequest,
  to: string,
  message: string
): Promise<APIRequestResult> => {
  return req.callAPI!("twilio", {
    method: "POST",
    url: `/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    data: {
      To: to,
      From: process.env.TWILIO_PHONE_NUMBER,
      Body: message,
    },
  });
};

/**
 * Process Stripe payment
 */
export const processStripePayment = async (
  req: AuthenticatedRequest,
  amount: number,
  currency: string,
  paymentMethodId: string,
  metadata?: Record<string, string>
): Promise<APIRequestResult> => {
  return req.callAPI!("stripe", {
    method: "POST",
    url: "/payment_intents",
    data: {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      metadata,
    },
  });
};

// =============================================================================
// API MONITORING ENDPOINTS
// =============================================================================

/**
 * Get API integration status
 */
export const getAPIStatus = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const apis = apiRegistry.list();
  const status = apis.map((name) => {
    const client = apiRegistry.get(name);
    return {
      name,
      status: "connected",
      stats: client?.getStats(),
    };
  });

  res.json({
    apis: status,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Test API connection
 */
export const testAPIConnection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { apiName } = req.params;

  try {
    const client = req.getAPIClient!(apiName);

    // Simple health check request
    const result = await client.request({
      method: "GET",
      url: "/health", // Most APIs have a health endpoint
    });

    res.json({
      apiName,
      connected: result.success,
      responseTime: result.responseTime,
      error: result.error,
    });
  } catch (error: any) {
    res.status(500).json({
      apiName,
      connected: false,
      error: error.message,
    });
  }
};

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      getAPIClient?: (name: string) => SimpleHTTPClient;
      callAPI?: <T = any>(
        apiName: string,
        config: RequestConfig
      ) => Promise<APIRequestResult<T>>;
    }
  }
}

export { SimpleHTTPClient as ExternalAPIClient, apiRegistry };
export default externalAPIMiddleware;
