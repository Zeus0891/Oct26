/**
 * Metrics Service
 *
 * Enterprise-grade metrics collection service for performance monitoring,
 * business metrics, and operational insights.
 *
 * @module MetricsService
 * @category Core Infrastructure - Metrics
 * @description Centralized metrics collection with correlation and tenant context
 * @version 1.0.0
 */

import { logger, LogLevel } from "./logger.service";
import { env } from "../config/env.config";

/**
 * Metric types for categorization
 */
export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
  TIMER = "timer",
}

/**
 * Metric severity levels
 */
export enum MetricSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Base metric interface
 */
export interface BaseMetric {
  name: string;
  type: "counter" | "gauge" | "histogram" | "timer";
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
  tenantId?: string;
  userId?: string;
  correlationId?: string;
  module?: string;
  action?: string;
}

/**
 * Counter metric for incremental values
 */
export interface CounterMetric extends BaseMetric {
  type: "counter";
  increment?: number;
}

/**
 * Gauge metric for absolute values
 */
export interface GaugeMetric extends BaseMetric {
  type: "gauge";
  unit?: string;
}

/**
 * Histogram metric for distribution analysis
 */
export interface HistogramMetric extends BaseMetric {
  type: "histogram";
  buckets?: number[];
  count?: number;
  sum?: number;
}

/**
 * Timer metric for duration measurements
 */
export interface TimerMetric extends BaseMetric {
  type: "timer";
  duration: number;
  unit: "ms" | "s" | "ns";
  startTime?: number;
  endTime?: number;
}

/**
 * Performance metric for detailed performance tracking
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  memory?: {
    used: number;
    total: number;
    external: number;
    heapUsed: number;
    heapTotal: number;
  };
  cpu?: {
    user: number;
    system: number;
  };
  context?: Record<string, any>;
}

/**
 * Business metric for tracking business KPIs
 */
export interface BusinessMetric {
  name: string;
  value: number;
  unit?: string;
  category: string;
  tenantId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Active timer tracking
 */
interface ActiveTimer {
  name: string;
  startTime: number;
  startMemory: NodeJS.MemoryUsage;
  startCpuUsage: NodeJS.CpuUsage;
  labels?: Record<string, string>;
  context?: Record<string, any>;
}

/**
 * Metrics aggregation storage
 */
interface MetricsStorage {
  counters: Map<string, number>;
  gauges: Map<string, number>;
  histograms: Map<string, number[]>;
  timers: Map<string, number[]>;
}

/**
 * Metrics Service Class
 */
export class MetricsService {
  private readonly storage: MetricsStorage;
  private readonly activeTimers: Map<string, ActiveTimer>;
  private metricsBuffer: BaseMetric[];
  private flushInterval: NodeJS.Timeout | null;
  private enabled: boolean;

  constructor() {
    this.storage = {
      counters: new Map(),
      gauges: new Map(),
      histograms: new Map(),
      timers: new Map(),
    };
    this.activeTimers = new Map();
    this.metricsBuffer = [];
    this.flushInterval = null;
    this.enabled = env.RLS_ENABLED || false; // Use existing env variable for now

    if (this.enabled) {
      this.startFlushInterval();
    }
  }

  /**
   * Start automatic metrics flushing
   */
  private startFlushInterval(): void {
    const interval = 60000; // 60 seconds default
    this.flushInterval = setInterval(() => {
      this.flush();
    }, interval);
  }

  /**
   * Stop automatic metrics flushing
   */
  private stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Record a counter metric
   */
  counter(
    name: string,
    increment: number = 1,
    labels?: Record<string, string>,
    context?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const key = this.createKey(name, labels);
    const currentValue = this.storage.counters.get(key) || 0;
    this.storage.counters.set(key, currentValue + increment);

    const metric: CounterMetric = {
      name,
      type: "counter" as const,
      value: currentValue + increment,
      timestamp: Date.now(),
      labels,
      increment,
      ...this.extractContext(context),
    };

    this.addToBuffer(metric);
  }

  /**
   * Record a gauge metric
   */
  gauge(
    name: string,
    value: number,
    unit?: string,
    labels?: Record<string, string>,
    context?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const key = this.createKey(name, labels);
    this.storage.gauges.set(key, value);

    const metric: GaugeMetric = {
      name,
      type: "gauge" as const,
      value,
      timestamp: Date.now(),
      labels,
      unit,
      ...this.extractContext(context),
    };

    this.addToBuffer(metric);
  }

  /**
   * Record a histogram metric
   */
  histogram(
    name: string,
    value: number,
    buckets?: number[],
    labels?: Record<string, string>,
    context?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const key = this.createKey(name, labels);
    const values = this.storage.histograms.get(key) || [];
    values.push(value);
    this.storage.histograms.set(key, values);

    const metric: HistogramMetric = {
      name,
      type: "histogram" as const,
      value,
      timestamp: Date.now(),
      labels,
      buckets,
      count: values.length,
      sum: values.reduce((sum, val) => sum + val, 0),
      ...this.extractContext(context),
    };

    this.addToBuffer(metric);
  }

  /**
   * Start a timer
   */
  startTimer(
    name: string,
    labels?: Record<string, string>,
    context?: Record<string, any>
  ): string {
    if (!this.enabled) return "";

    const timerId = `${name}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const startCpuUsage = process.cpuUsage();

    this.activeTimers.set(timerId, {
      name,
      startTime,
      startMemory,
      startCpuUsage,
      labels,
      context,
    });

    return timerId;
  }

  /**
   * Stop a timer and record the metric
   */
  stopTimer(timerId: string): number | null {
    if (!this.enabled || !timerId) return null;

    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      logger.warn(`Timer not found: ${timerId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    // Capture system metrics if needed in future
    // const endMemory = process.memoryUsage();
    // const endCpuUsage = process.cpuUsage(timer.startCpuUsage);

    // Store duration in timers storage
    const key = this.createKey(timer.name, timer.labels);
    const durations = this.storage.timers.get(key) || [];
    durations.push(duration);
    this.storage.timers.set(key, durations);

    // Performance snapshot (available for future use)
    // const performanceMetric: PerformanceMetric = { ... };

    // Create timer metric
    const metric: TimerMetric = {
      name: timer.name,
      type: "timer" as const,
      value: duration,
      duration,
      unit: "ms",
      timestamp: Date.now(),
      labels: timer.labels,
      startTime: timer.startTime,
      endTime,
      ...this.extractContext(timer.context),
    };

    this.addToBuffer(metric);
    this.activeTimers.delete(timerId);

    // Log performance if duration is significant
    if (duration > 1000) {
      // More than 1 second
      logger.performance(`Timer completed: ${timer.name}`, duration, {
        module: "metrics",
        action: "timer",
        ...this.extractContext(timer.context),
      });
    }

    return duration;
  }

  /**
   * Measure function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    labels?: Record<string, string>,
    context?: Record<string, any>
  ): Promise<T> {
    const timerId = this.startTimer(name, labels, context);

    try {
      const result = await fn();
      this.stopTimer(timerId);
      return result;
    } catch (error) {
      this.stopTimer(timerId);
      this.counter(`${name}_error`, 1, labels, context);
      throw error;
    }
  }

  /**
   * Record a business metric
   */
  business(
    name: string,
    value: number,
    category: string,
    unit?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    // metric object not needed; log and gauge are sufficient

    logger.business(`Business metric: ${name}`, `${category}_metric`, {
      module: "metrics",
      action: "business_metric",
      value,
      unit,
      category,
      ...metadata,
    } as any);

    // Also record as gauge
    this.gauge(`business_${name}`, value, unit, { category });
  }

  /**
   * Record request metrics
   */
  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    tenantId?: string
  ): void {
    if (!this.enabled) return;

    const labels = {
      method,
      path: this.sanitizePath(path),
      status_code: statusCode.toString(),
      status_class: `${Math.floor(statusCode / 100)}xx`,
    };

    if (tenantId) {
      (labels as any).tenant_id = tenantId;
    }

    // Request counter
    this.counter("http_requests_total", 1, labels);

    // Response time histogram
    this.histogram("http_request_duration_ms", duration, undefined, labels);

    // Status code specific counters
    if (statusCode >= 400) {
      this.counter("http_errors_total", 1, labels);
    }

    if (statusCode >= 500) {
      this.counter("http_server_errors_total", 1, labels);
    }
  }

  /**
   * Record database metrics
   */
  recordDatabase(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    tenantId?: string
  ): void {
    if (!this.enabled) return;

    const labels = {
      operation,
      table,
      success: success.toString(),
    };

    if (tenantId) {
      (labels as any).tenant_id = tenantId;
    }

    this.counter("db_operations_total", 1, labels);
    this.histogram("db_operation_duration_ms", duration, undefined, labels);

    if (!success) {
      this.counter("db_errors_total", 1, labels);
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): MetricsStorage {
    return {
      counters: new Map(this.storage.counters),
      gauges: new Map(this.storage.gauges),
      histograms: new Map(this.storage.histograms),
      timers: new Map(this.storage.timers),
    };
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    if (!this.enabled) return "";

    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.storage.counters) {
      const { name, labels } = this.parseKey(key);
      const labelsStr = this.formatPrometheusLabels(labels);
      const chunk = [`# TYPE ${name} counter`, `${name}${labelsStr} ${value}`];
      lines.push(...chunk);
    }

    // Gauges
    for (const [key, value] of this.storage.gauges) {
      const { name, labels } = this.parseKey(key);
      const labelsStr = this.formatPrometheusLabels(labels);
      const chunk = [`# TYPE ${name} gauge`, `${name}${labelsStr} ${value}`];
      lines.push(...chunk);
    }

    // Histograms
    for (const [key, values] of this.storage.histograms) {
      const { name, labels } = this.parseKey(key);
      const labelsStr = this.formatPrometheusLabels(labels);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const count = values.length;

      const chunk = [
        `# TYPE ${name} histogram`,
        `${name}_sum${labelsStr} ${sum}`,
        `${name}_count${labelsStr} ${count}`,
      ];
      lines.push(...chunk);
    }

    return lines.join("\n");
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.storage.counters.clear();
    this.storage.gauges.clear();
    this.storage.histograms.clear();
    this.storage.timers.clear();
    this.metricsBuffer = [];
  }

  /**
   * Flush metrics to logger
   */
  flush(): void {
    if (!this.enabled || this.metricsBuffer.length === 0) return;

    logger.info(`Flushing ${this.metricsBuffer.length} metrics`, {
      module: "metrics",
      action: "flush",
    });

    // Reset buffer
    this.metricsBuffer = [];
  }

  /**
   * Shutdown metrics service
   */
  shutdown(): void {
    this.stopFlushInterval();
    this.flush();
    this.reset();
    this.enabled = false;
  }

  /**
   * Create a unique key for metric storage
   */
  private createKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const sortedLabels = Object.keys(labels)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => `${key}="${labels[key]}"`)
      .join(",");

    return `${name}{${sortedLabels}}`;
  }

  /**
   * Parse a metric key back to name and labels
   */
  private parseKey(key: string): {
    name: string;
    labels: Record<string, string>;
  } {
    const regex = /^([^{]+)(?:\{(.+)\})?$/;
    const match = regex.exec(key);
    if (!match) {
      return { name: key, labels: {} };
    }

    const name = match[1];
    const labelsStr = match[2];
    const labels: Record<string, string> = {};

    if (labelsStr) {
      const labelPairs = labelsStr.split(",");
      for (const pair of labelPairs) {
        const [key, value] = pair.split("=");
        if (key && value) {
          labels[key] = value.replaceAll('"', "");
        }
      }
    }

    return { name, labels };
  }

  /**
   * Format labels for Prometheus
   */
  private formatPrometheusLabels(labels: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return "";
    }

    const labelPairs = Object.keys(labels)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => `${key}="${labels[key]}"`)
      .join(",");

    return `{${labelPairs}}`;
  }

  /**
   * Sanitize URL path for metrics
   */
  private sanitizePath(path: string): string {
    // Replace UUIDs and numeric IDs with placeholders
    return path
      .replaceAll(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "/:uuid"
      )
      .replaceAll(/\/\d+/g, "/:id")
      .replaceAll(/\/\d+\.\d+/g, "/:version");
  }

  /**
   * Extract context information
   */
  private extractContext(context?: Record<string, any>): {
    tenantId?: string;
    userId?: string;
    correlationId?: string;
    module?: string;
    action?: string;
  } {
    if (!context) return {};

    return {
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      module: context.module,
      action: context.action,
    };
  }

  /**
   * Add metric to buffer
   */
  private addToBuffer(metric: BaseMetric): void {
    this.metricsBuffer.push(metric);

    // Prevent buffer overflow
    if (this.metricsBuffer.length > 10000) {
      this.flush();
    }
  }
}

/**
 * Global metrics instance
 */
export const metrics = new MetricsService();

/**
 * Initialize metrics service
 */
export function initializeMetrics(): MetricsService {
  logger.log(LogLevel.INFO, "Metrics service initialized", {
    module: "core",
    action: "initialize",
    enabled: metrics["enabled"],
  });

  return metrics;
}

// Export default metrics instance
export default metrics;
