/**
 * Performance Measurement Utility
 *
 * Provides enterprise-grade performance monitoring for critical utility functions.
 * Enables execution time measurement, memory usage tracking, and performance profiling.
 *
 * @module UtilityPerformance
 * @category Shared Utils - Performance
 * @description Performance monitoring and measurement utilities
 * @version 1.0.0
 */

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
  /** Function name that was measured */
  functionName: string;
  /** Execution time in milliseconds */
  duration: number;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
  /** Memory usage before execution (if available) */
  memoryBefore?: number;
  /** Memory usage after execution (if available) */
  memoryAfter?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Performance measurement options
 */
export interface PerformanceMeasurementOptions {
  /** Whether to track memory usage */
  trackMemory?: boolean;
  /** Whether to log measurements to console */
  logToConsole?: boolean;
  /** Custom metadata to include */
  metadata?: Record<string, unknown>;
  /** Minimum duration threshold to log (ms) */
  logThreshold?: number;
}

/**
 * Performance measurement callback type
 */
export type PerformanceCallback = (measurement: PerformanceMeasurement) => void;

/**
 * Utility class for measuring performance of critical functions.
 * Provides wrapper functions for timing execution, memory tracking, and profiling.
 *
 * @example
 * ```typescript
 * import { UtilityPerformance } from '@/shared/utils';
 *
 * // Measure a synchronous function
 * const result = UtilityPerformance.measure('hashPassword', () => {
 *   return bcrypt.hashSync(password, 12);
 * });
 *
 * // Measure an async function
 * const asyncResult = await UtilityPerformance.measureAsync('encryptData', async () => {
 *   return await CryptoUtils.encryptWithAES(data, key);
 * });
 *
 * // Set up performance monitoring
 * UtilityPerformance.onMeasurement((measurement) => {
 *   if (measurement.duration > 1000) {
 *     console.warn(`Slow operation detected: ${measurement.functionName} took ${measurement.duration}ms`);
 *   }
 * });
 * ```
 */
export class UtilityPerformance {
  private static callbacks: PerformanceCallback[] = [];
  private static measurements: PerformanceMeasurement[] = [];
  private static maxMeasurements = 1000; // Prevent memory leaks

  /**
   * Measures the execution time of a synchronous function.
   *
   * @template T - Return type of the function
   * @param functionName - Name of the function being measured
   * @param fn - Function to measure
   * @param options - Measurement options
   * @returns Result of the function execution
   *
   * @example
   * ```typescript
   * const hashedPassword = UtilityPerformance.measure('hashPassword', () => {
   *   return bcrypt.hashSync(password, 12);
   * }, { trackMemory: true, logToConsole: true });
   * ```
   *
   * @complexity O(1) + O(f) where f is the complexity of the measured function
   */
  static measure<T>(
    functionName: string,
    fn: () => T,
    options: PerformanceMeasurementOptions = {}
  ): T {
    const startTime = performance.now();
    const memoryBefore = options.trackMemory
      ? this.getMemoryUsage()
      : undefined;

    let result: T;
    let error: Error | undefined;

    try {
      result = fn();
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const memoryAfter = options.trackMemory
        ? this.getMemoryUsage()
        : undefined;

      const measurement: PerformanceMeasurement = {
        functionName,
        duration: endTime - startTime,
        startTime,
        endTime,
        memoryBefore,
        memoryAfter,
        metadata: {
          ...options.metadata,
          error: error?.message,
          success: !error,
        },
      };

      this.recordMeasurement(measurement, options);
    }

    return result!;
  }

  /**
   * Measures the execution time of an asynchronous function.
   *
   * @template T - Return type of the function
   * @param functionName - Name of the function being measured
   * @param fn - Async function to measure
   * @param options - Measurement options
   * @returns Promise resolving to the function result
   *
   * @example
   * ```typescript
   * const encryptedData = await UtilityPerformance.measureAsync('encryptData', async () => {
   *   return await CryptoUtils.encryptWithAES(data, key);
   * }, { logThreshold: 100 });
   * ```
   *
   * @complexity O(1) + O(f) where f is the complexity of the measured function
   */
  static async measureAsync<T>(
    functionName: string,
    fn: () => Promise<T>,
    options: PerformanceMeasurementOptions = {}
  ): Promise<T> {
    const startTime = performance.now();
    const memoryBefore = options.trackMemory
      ? this.getMemoryUsage()
      : undefined;

    let result: T;
    let error: Error | undefined;

    try {
      result = await fn();
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const memoryAfter = options.trackMemory
        ? this.getMemoryUsage()
        : undefined;

      const measurement: PerformanceMeasurement = {
        functionName,
        duration: endTime - startTime,
        startTime,
        endTime,
        memoryBefore,
        memoryAfter,
        metadata: {
          ...options.metadata,
          error: error?.message,
          success: !error,
        },
      };

      this.recordMeasurement(measurement, options);
    }

    return result!;
  }

  /**
   * Creates a performance wrapper for a function that can be reused.
   *
   * @template T - Function type
   * @param functionName - Name of the function
   * @param fn - Function to wrap
   * @param options - Default measurement options
   * @returns Wrapped function with performance measurement
   *
   * @example
   * ```typescript
   * const measuredHashPassword = UtilityPerformance.wrap('hashPassword',
   *   (password: string) => bcrypt.hashSync(password, 12),
   *   { trackMemory: true }
   * );
   *
   * // Use the wrapped function
   * const hash = measuredHashPassword('mypassword');
   * ```
   *
   * @complexity O(1)
   */
  static wrap<T extends (...args: any[]) => any>(
    functionName: string,
    fn: T,
    options: PerformanceMeasurementOptions = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.measure(functionName, () => fn(...args), options);
    }) as T;
  }

  /**
   * Creates a performance wrapper for an async function.
   *
   * @template T - Function type
   * @param functionName - Name of the function
   * @param fn - Async function to wrap
   * @param options - Default measurement options
   * @returns Wrapped async function with performance measurement
   *
   * @example
   * ```typescript
   * const measuredEncrypt = UtilityPerformance.wrapAsync('encryptData',
   *   async (data: string) => await CryptoUtils.encrypt(data),
   *   { logThreshold: 50 }
   * );
   *
   * // Use the wrapped function
   * const encrypted = await measuredEncrypt('sensitive data');
   * ```
   *
   * @complexity O(1)
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    functionName: string,
    fn: T,
    options: PerformanceMeasurementOptions = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.measureAsync(functionName, () => fn(...args), options);
    }) as T;
  }

  /**
   * Registers a callback to be called when measurements are recorded.
   *
   * @param callback - Function to call with measurement data
   *
   * @example
   * ```typescript
   * UtilityPerformance.onMeasurement((measurement) => {
   *   // Log slow operations
   *   if (measurement.duration > 1000) {
   *     logger.warn('Slow operation', measurement);
   *   }
   *
   *   // Store in analytics
   *   analytics.track('performance', measurement);
   * });
   * ```
   *
   * @complexity O(1)
   */
  static onMeasurement(callback: PerformanceCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Removes a measurement callback.
   *
   * @param callback - Callback to remove
   *
   * @complexity O(n) where n is the number of callbacks
   */
  static offMeasurement(callback: PerformanceCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Gets all recorded measurements.
   *
   * @returns Array of all measurements
   *
   * @example
   * ```typescript
   * const measurements = UtilityPerformance.getMeasurements();
   * const avgDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
   * ```
   *
   * @complexity O(1)
   */
  static getMeasurements(): readonly PerformanceMeasurement[] {
    return [...this.measurements];
  }

  /**
   * Gets measurements for a specific function.
   *
   * @param functionName - Name of the function to filter by
   * @returns Array of measurements for the specified function
   *
   * @complexity O(n) where n is the number of measurements
   */
  static getMeasurementsFor(functionName: string): PerformanceMeasurement[] {
    return this.measurements.filter((m) => m.functionName === functionName);
  }

  /**
   * Gets performance statistics for a function.
   *
   * @param functionName - Name of the function
   * @returns Performance statistics
   *
   * @example
   * ```typescript
   * const stats = UtilityPerformance.getStatistics('hashPassword');
   * console.log(`Average duration: ${stats.avgDuration}ms`);
   * console.log(`Total calls: ${stats.callCount}`);
   * ```
   *
   * @complexity O(n) where n is the number of measurements for the function
   */
  static getStatistics(functionName: string): {
    callCount: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
  } {
    const measurements = this.getMeasurementsFor(functionName);

    if (measurements.length === 0) {
      return {
        callCount: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
      };
    }

    const durations = measurements.map((m) => m.duration);
    const successCount = measurements.filter(
      (m) => m.metadata?.success === true
    ).length;

    return {
      callCount: measurements.length,
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: successCount / measurements.length,
    };
  }

  /**
   * Clears all recorded measurements.
   *
   * @complexity O(1)
   */
  static clearMeasurements(): void {
    this.measurements.length = 0;
  }

  /**
   * Records a measurement and notifies callbacks.
   *
   * @param measurement - The measurement to record
   * @param options - Measurement options
   *
   * @complexity O(k) where k is the number of callbacks
   */
  private static recordMeasurement(
    measurement: PerformanceMeasurement,
    options: PerformanceMeasurementOptions
  ): void {
    // Store measurement (with size limit to prevent memory leaks)
    this.measurements.push(measurement);
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift(); // Remove oldest measurement
    }

    // Log to console if requested and above threshold
    if (
      options.logToConsole &&
      (!options.logThreshold || measurement.duration >= options.logThreshold)
    ) {
      console.log(
        `[Performance] ${
          measurement.functionName
        }: ${measurement.duration.toFixed(2)}ms`,
        measurement.metadata
      );
    }

    // Notify callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(measurement);
      } catch (error) {
        console.error("Performance measurement callback error:", error);
      }
    });
  }

  /**
   * Gets current memory usage (Node.js only).
   *
   * @returns Memory usage in MB or undefined if not available
   *
   * @complexity O(1)
   */
  private static getMemoryUsage(): number | undefined {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100; // MB with 2 decimal places
    }
    return undefined;
  }
}

/**
 * Performance measurement decorator for methods.
 *
 * @param functionName - Optional name override for the measurement
 * @param options - Measurement options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class CryptoService {
 *   @measurePerformance('encrypt', { trackMemory: true })
 *   async encrypt(data: string): Promise<string> {
 *     // ... encryption logic
 *   }
 * }
 * ```
 */
export function measurePerformance(
  functionName?: string,
  options: PerformanceMeasurementOptions = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName =
      functionName || `${target.constructor.name}.${propertyKey}`;

    if (originalMethod.constructor.name === "AsyncFunction") {
      descriptor.value = function (...args: any[]) {
        return UtilityPerformance.measureAsync(
          methodName,
          () => originalMethod.apply(this, args),
          options
        );
      };
    } else {
      descriptor.value = function (...args: any[]) {
        return UtilityPerformance.measure(
          methodName,
          () => originalMethod.apply(this, args),
          options
        );
      };
    }

    return descriptor;
  };
}

/**
 * Type-safe performance wrapper for utility classes
 */
export type PerformanceWrapper<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<any>
    ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
    : T[K] extends (...args: any[]) => any
      ? (...args: Parameters<T[K]>) => ReturnType<T[K]>
      : T[K];
};

/**
 * Creates a performance-wrapped version of a utility class.
 *
 * @template T - Utility class type
 * @param utilityClass - The utility class to wrap
 * @param options - Default measurement options
 * @returns Performance-wrapped utility class
 *
 * @example
 * ```typescript
 * const MeasuredCryptoUtils = UtilityPerformance.wrapUtilityClass(
 *   CryptoUtils,
 *   { trackMemory: true, logThreshold: 100 }
 * );
 *
 * // All CryptoUtils methods are now performance-measured
 * const hash = MeasuredCryptoUtils.sha256('data');
 * ```
 */
export function wrapUtilityClass<T extends Record<string, any>>(
  utilityClass: T,
  options: PerformanceMeasurementOptions = {}
): PerformanceWrapper<T> {
  const wrapped = {} as PerformanceWrapper<T>;

  Object.getOwnPropertyNames(utilityClass).forEach((key) => {
    const value = utilityClass[key];

    if (typeof value === "function") {
      const isAsync = value.constructor.name === "AsyncFunction";
      const functionName = `${
        utilityClass.constructor.name || "Utility"
      }.${key}`;

      if (isAsync) {
        wrapped[key as keyof T] = UtilityPerformance.wrapAsync(
          functionName,
          value,
          options
        ) as any;
      } else {
        wrapped[key as keyof T] = UtilityPerformance.wrap(
          functionName,
          value,
          options
        ) as any;
      }
    } else {
      wrapped[key as keyof T] = value;
    }
  });

  return wrapped;
}

export default UtilityPerformance;
