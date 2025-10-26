/**
 * Data Transform Utility
 *
 * Provides pure data transformation functions for converting between different
 * data formats, case styles, and object structures. All functions are immutable
 * and side-effect-free.
 *
 * @module DataTransformUtils
 * @category Shared Utils - Base
 * @description Data format transformations and conversions
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";

/**
 * Type utility for converting object keys to snake_case
 */
export type SnakeCaseKeys<T> = {
  [K in keyof T as K extends string ? SnakeCase<K> : K]: T[K] extends Record<
    string,
    any
  >
    ? SnakeCaseKeys<T[K]>
    : T[K];
};

/**
 * Type utility for converting object keys to camelCase
 */
export type CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] extends Record<
    string,
    any
  >
    ? CamelCaseKeys<T[K]>
    : T[K];
};

/**
 * Convert string to snake_case
 */
type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCase<U>}`
  : S;

/**
 * Convert string to camelCase
 */
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
    : S;

/**
 * Utility class for data format transformations and object manipulations.
 * All methods are pure functions that return new data structures without
 * modifying the original input.
 *
 * @example
 * ```typescript
 * import { DataTransformUtils } from '@/shared/utils';
 *
 * // Case conversion
 * const snakeData = DataTransformUtils.camelToSnake({
 *   firstName: "John",
 *   lastName: "Doe"
 * });
 * // Result: { first_name: "John", last_name: "Doe" }
 *
 * // Deep cloning
 * const original = { user: { name: "John", roles: ["admin"] } };
 * const clone = DataTransformUtils.deepClone(original);
 * ```
 */
export class DataTransformUtils {
  /**
   * Converts object keys from camelCase to snake_case recursively.
   *
   * @param obj - Object with camelCase keys
   * @returns New object with snake_case keys
   * @complexity O(n) where n is total number of properties
   *
   * @example
   * ```typescript
   * const input = {
   *   firstName: "John",
   *   userProfile: {
   *     emailAddress: "john@example.com",
   *     isActive: true
   *   }
   * };
   *
   * const result = DataTransformUtils.camelToSnake(input);
   * // {
   * //   first_name: "John",
   * //   user_profile: {
   * //     email_address: "john@example.com",
   * //     is_active: true
   * //   }
   * // }
   * ```
   */
  static camelToSnake<T extends Record<string, unknown>>(
    obj: T
  ): SnakeCaseKeys<T> {
    if (!TypeGuards.isObject(obj)) {
      return obj as SnakeCaseKeys<T>;
    }

    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );

      if (TypeGuards.isObject(value)) {
        result[snakeKey] = this.camelToSnake(value);
      } else if (TypeGuards.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          TypeGuards.isObject(item) ? this.camelToSnake(item) : item
        );
      } else {
        result[snakeKey] = value;
      }
    }

    return result as SnakeCaseKeys<T>;
  }

  /**
   * Converts object keys from snake_case to camelCase recursively.
   *
   * @param obj - Object with snake_case keys
   * @returns New object with camelCase keys
   * @complexity O(n) where n is total number of properties
   *
   * @example
   * ```typescript
   * const input = {
   *   first_name: "John",
   *   user_profile: {
   *     email_address: "john@example.com",
   *     is_active: true
   *   }
   * };
   *
   * const result = DataTransformUtils.snakeToCamel(input);
   * // {
   * //   firstName: "John",
   * //   userProfile: {
   * //     emailAddress: "john@example.com",
   * //     isActive: true
   * //   }
   * // }
   * ```
   */
  static snakeToCamel<T extends Record<string, unknown>>(
    obj: T
  ): CamelCaseKeys<T> {
    if (!TypeGuards.isObject(obj)) {
      return obj as CamelCaseKeys<T>;
    }

    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      if (TypeGuards.isObject(value)) {
        result[camelKey] = this.snakeToCamel(value);
      } else if (TypeGuards.isArray(value)) {
        result[camelKey] = value.map((item) =>
          TypeGuards.isObject(item) ? this.snakeToCamel(item) : item
        );
      } else {
        result[camelKey] = value;
      }
    }

    return result as CamelCaseKeys<T>;
  }

  /**
   * Creates a deep clone of any serializable data structure.
   * Handles nested objects, arrays, dates, and primitive values.
   *
   * @param obj - Object to clone
   * @returns Deep clone of the object
   * @complexity O(n) where n is total number of properties
   *
   * @example
   * ```typescript
   * const original = {
   *   user: { name: "John", roles: ["admin"] },
   *   createdAt: new Date(),
   *   settings: { theme: "dark" }
   * };
   *
   * const clone = DataTransformUtils.deepClone(original);
   * clone.user.name = "Jane"; // original.user.name remains "John"
   * ```
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as T;
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as T;
    }

    if (obj instanceof Map) {
      const cloned = new Map();
      for (const [key, value] of obj.entries()) {
        cloned.set(this.deepClone(key), this.deepClone(value));
      }
      return cloned as T;
    }

    if (obj instanceof Set) {
      const cloned = new Set();
      for (const value of obj.values()) {
        cloned.add(this.deepClone(value));
      }
      return cloned as T;
    }

    // Handle plain objects
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Flattens a nested object structure into a flat object with dot-notation keys.
   *
   * @param obj - Object to flatten
   * @param prefix - Key prefix for nested properties
   * @returns Flattened object with dot-notation keys
   * @complexity O(n) where n is total number of properties
   *
   * @example
   * ```typescript
   * const nested = {
   *   user: {
   *     profile: {
   *       name: "John",
   *       age: 30
   *     },
   *     roles: ["admin", "user"]
   *   }
   * };
   *
   * const flat = DataTransformUtils.flattenObject(nested);
   * // {
   * //   "user.profile.name": "John",
   * //   "user.profile.age": 30,
   * //   "user.roles.0": "admin",
   * //   "user.roles.1": "user"
   * // }
   * ```
   */
  static flattenObject(
    obj: Record<string, unknown>,
    prefix: string = ""
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (TypeGuards.isObject(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else if (TypeGuards.isArray(value)) {
        value.forEach((item, index) => {
          const arrayKey = `${newKey}.${index}`;
          if (TypeGuards.isObject(item)) {
            Object.assign(result, this.flattenObject(item, arrayKey));
          } else {
            result[arrayKey] = item;
          }
        });
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  /**
   * Converts a flat object with dot-notation keys back to a nested structure.
   *
   * @param flatObj - Flat object with dot-notation keys
   * @returns Nested object structure
   * @complexity O(n) where n is number of keys
   */
  static unflattenObject(
    flatObj: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(flatObj)) {
      const keys = key.split(".");
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];
        const nextKey = keys[i + 1];

        if (!(currentKey in current)) {
          // Check if next key is a number (array index)
          current[currentKey] = /^\d+$/.test(nextKey) ? [] : {};
        }

        current = current[currentKey] as Record<string, unknown>;
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
    }

    return result;
  }

  /**
   * Normalizes data by removing null/undefined values and empty objects/arrays.
   *
   * @param data - Data to normalize
   * @param options - Normalization options
   * @returns Normalized data structure
   * @complexity O(n) where n is total number of properties
   */
  static normalizeData<T>(
    data: T,
    options: {
      removeNulls?: boolean;
      removeUndefined?: boolean;
      removeEmpty?: boolean;
      trimStrings?: boolean;
    } = {}
  ): T {
    const {
      removeNulls = true,
      removeUndefined = true,
      removeEmpty = true,
      trimStrings = true,
    } = options;

    if (data === null && removeNulls) return undefined as T;
    if (data === undefined && removeUndefined) return undefined as T;

    if (TypeGuards.isString(data)) {
      return trimStrings ? (data.trim() as T) : data;
    }

    if (TypeGuards.isArray(data)) {
      const normalized = data
        .map((item) => this.normalizeData(item, options))
        .filter((item) => {
          if (removeNulls && item === null) return false;
          if (removeUndefined && item === undefined) return false;
          if (removeEmpty && TypeGuards.isArray(item) && item.length === 0)
            return false;
          if (
            removeEmpty &&
            TypeGuards.isObject(item) &&
            Object.keys(item).length === 0
          )
            return false;
          return true;
        });

      return normalized as T;
    }

    if (TypeGuards.isObject(data)) {
      const normalized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        const normalizedValue = this.normalizeData(value, options);

        // Skip null/undefined values if configured
        if (removeNulls && normalizedValue === null) continue;
        if (removeUndefined && normalizedValue === undefined) continue;

        // Skip empty objects/arrays if configured
        if (removeEmpty) {
          if (
            TypeGuards.isArray(normalizedValue) &&
            normalizedValue.length === 0
          )
            continue;
          if (
            TypeGuards.isObject(normalizedValue) &&
            Object.keys(normalizedValue).length === 0
          )
            continue;
        }

        normalized[key] = normalizedValue;
      }

      return normalized as T;
    }

    return data;
  }

  /**
   * Merges multiple objects into a single object, with later objects overriding earlier ones.
   *
   * @param target - Target object to merge into
   * @param sources - Source objects to merge from
   * @returns Merged object
   * @complexity O(n) where n is total number of properties across all objects
   */
  static merge<T extends Record<string, unknown>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    const result = this.deepClone(target) as Record<string, unknown>;

    for (const source of sources) {
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) {
          if (TypeGuards.isObject(value) && TypeGuards.isObject(result[key])) {
            result[key] = this.merge(
              result[key] as Record<string, unknown>,
              value
            );
          } else {
            result[key] = this.deepClone(value);
          }
        }
      }
    }

    return result as T;
  }

  /**
   * Converts data between different serialization formats.
   *
   * @param data - Data to convert
   * @param fromFormat - Source format
   * @param toFormat - Target format
   * @returns Converted data
   * @complexity O(n) for JSON operations
   */
  static convertFormat(
    data: unknown,
    fromFormat: "json" | "object" | "string",
    toFormat: "json" | "object" | "string"
  ): unknown {
    if (fromFormat === toFormat) return data;

    let intermediate: unknown = data;

    // Convert from source format to object
    if (fromFormat === "json" && TypeGuards.isString(data)) {
      intermediate = JSON.parse(data);
    } else if (fromFormat === "string") {
      try {
        intermediate = JSON.parse(data as string);
      } catch {
        intermediate = data;
      }
    }

    // Convert from object to target format
    if (toFormat === "json") {
      return JSON.stringify(intermediate, null, 2);
    } else if (toFormat === "string") {
      return TypeGuards.isString(intermediate)
        ? intermediate
        : JSON.stringify(intermediate);
    }

    return intermediate;
  }

  /**
   * Removes specified keys from an object (immutable).
   *
   * @param obj - Source object
   * @param keysToOmit - Keys to remove
   * @returns New object without specified keys
   * @complexity O(n) where n is number of object properties
   */
  static omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keysToOmit: K[]
  ): Omit<T, K> {
    const result = {} as Omit<T, K>;
    const omitSet = new Set(keysToOmit);

    for (const [key, value] of Object.entries(obj)) {
      if (!omitSet.has(key as K)) {
        (result as any)[key] = value;
      }
    }

    return result;
  }

  /**
   * Picks specified keys from an object (immutable).
   *
   * @param obj - Source object
   * @param keysToPick - Keys to include
   * @returns New object with only specified keys
   * @complexity O(k) where k is number of keys to pick
   */
  static pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keysToPick: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;

    for (const key of keysToPick) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }

    return result;
  }
}
