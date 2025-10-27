/**
 * Object Utility
 *
 * Provides pure object manipulation utilities for all feature modules.
 * All functions are immutable and return new objects without modifying the original.
 *
 * @module ObjectUtils
 * @category Shared Utils - Base
 * @description Object manipulation and processing utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";
import { DataTransformUtils } from "./data-transform.util";

/**
 * Path type for nested object access
 */
export type ObjectPath = string | (string | number)[];

/**
 * Utility class for object operations and manipulations.
 * All methods are pure functions that return new objects without side effects.
 *
 * @example
 * ```typescript
 * import { ObjectUtils } from '@/shared/utils';
 *
 * const user = {
 *   profile: { name: "John", settings: { theme: "dark" } },
 *   roles: ["admin", "user"]
 * };
 *
 * // Deep access
 * const theme = ObjectUtils.get(user, "profile.settings.theme");
 *
 * // Deep merge
 * const updated = ObjectUtils.deepMerge(user, {
 *   profile: { settings: { notifications: true } }
 * });
 * ```
 */
export class ObjectUtils {
  /**
   * Deep clones an object using structured cloning when available.
   * Falls back to custom deep clone implementation for unsupported environments.
   *
   * @param obj - Object to clone
   * @returns Deep clone of the object
   * @complexity O(n) where n is total number of properties
   *
   * @example
   * ```typescript
   * const original = { user: { name: "John" }, tags: ["admin"] };
   * const clone = ObjectUtils.deepClone(original);
   * clone.user.name = "Jane"; // original remains unchanged
   * ```
   */
  static deepClone<T>(obj: T): T {
    // Use structured cloning if available (Node 17+, modern browsers)
    if (typeof structuredClone !== "undefined") {
      try {
        return structuredClone(obj);
      } catch {
        // Fall back to custom implementation for non-cloneable objects
      }
    }

    return DataTransformUtils.deepClone(obj);
  }

  /**
   * Deep merges multiple objects, with later objects overriding earlier ones.
   * Arrays are replaced, not merged.
   *
   * @param target - Target object to merge into
   * @param sources - Source objects to merge from
   * @returns New merged object
   * @complexity O(n) where n is total number of properties across all objects
   *
   * @example
   * ```typescript
   * const base = { a: 1, nested: { x: 10, y: 20 } };
   * const override = { b: 2, nested: { y: 30, z: 40 } };
   *
   * const result = ObjectUtils.deepMerge(base, override);
   * // { a: 1, b: 2, nested: { x: 10, y: 30, z: 40 } }
   * ```
   */
  static deepMerge<T extends Record<string, unknown>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    const result = this.deepClone(target) as Record<string, unknown>;

    for (const source of sources) {
      this.mergeInto(result, source);
    }

    return result as T;
  }

  /**
   * Helper method for deep merge operation
   */
  private static mergeInto(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): void {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;

      if (TypeGuards.isObject(value) && TypeGuards.isObject(target[key])) {
        this.mergeInto(target[key] as Record<string, unknown>, value);
      } else {
        target[key] = this.deepClone(value);
      }
    }
  }

  /**
   * Gets a nested property value using dot notation or path array.
   *
   * @param obj - Object to get value from
   * @param path - Property path (dot notation or array)
   * @param defaultValue - Value to return if path doesn't exist
   * @returns Property value or default
   * @complexity O(d) where d is path depth
   *
   * @example
   * ```typescript
   * const obj = { user: { profile: { name: "John" } } };
   *
   * const name1 = ObjectUtils.get(obj, "user.profile.name");
   * const name2 = ObjectUtils.get(obj, ["user", "profile", "name"]);
   * const age = ObjectUtils.get(obj, "user.profile.age", 0);
   * ```
   */
  static get<T = unknown>(
    obj: Record<string, unknown>,
    path: ObjectPath,
    defaultValue?: T
  ): T | undefined {
    const keys = this.parsePath(path);
    let current: unknown = obj;

    for (const key of keys) {
      if (!TypeGuards.isObject(current) && !TypeGuards.isArray(current)) {
        return defaultValue;
      }

      current = (current as any)[key];
      if (current === undefined || current === null) {
        return defaultValue;
      }
    }

    return current as T;
  }

  /**
   * Sets a nested property value using dot notation or path array.
   * Returns a new object with the property set.
   *
   * @param obj - Object to set value in
   * @param path - Property path (dot notation or array)
   * @param value - Value to set
   * @returns New object with property set
   * @complexity O(n + d) where n is object size and d is path depth
   *
   * @example
   * ```typescript
   * const obj = { user: { profile: { name: "John" } } };
   *
   * const updated = ObjectUtils.set(obj, "user.profile.age", 30);
   * // { user: { profile: { name: "John", age: 30 } } }
   * ```
   */
  static set<T extends Record<string, unknown>>(
    obj: T,
    path: ObjectPath,
    value: unknown
  ): T {
    const keys = this.parsePath(path);
    const result = this.deepClone(obj) as Record<string, unknown>;
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];

      if (
        !TypeGuards.isObject(current[key]) &&
        !TypeGuards.isArray(current[key])
      ) {
        // Create object or array based on next key type
        current[key] =
          typeof nextKey === "number" || /^\d+$/.test(String(nextKey))
            ? []
            : {};
      }

      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return result as T;
  }

  /**
   * Checks if an object has a nested property using dot notation or path array.
   *
   * @param obj - Object to check
   * @param path - Property path (dot notation or array)
   * @returns True if property exists
   * @complexity O(d) where d is path depth
   */
  static has(obj: Record<string, unknown>, path: ObjectPath): boolean {
    const keys = this.parsePath(path);
    let current: unknown = obj;

    for (const key of keys) {
      if (!TypeGuards.isObject(current) && !TypeGuards.isArray(current)) {
        return false;
      }

      if (!(key in (current as any))) {
        return false;
      }

      current = (current as any)[key];
    }

    return true;
  }

  /**
   * Deletes a nested property using dot notation or path array.
   * Returns a new object with the property removed.
   *
   * @param obj - Object to delete property from
   * @param path - Property path (dot notation or array)
   * @returns New object with property removed
   * @complexity O(n + d) where n is object size and d is path depth
   */
  static unset<T extends Record<string, unknown>>(obj: T, path: ObjectPath): T {
    const keys = this.parsePath(path);
    const result = this.deepClone(obj) as Record<string, unknown>;
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (
        !TypeGuards.isObject(current[key]) &&
        !TypeGuards.isArray(current[key])
      ) {
        return result as T; // Path doesn't exist
      }

      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (TypeGuards.isArray(current)) {
      (current as unknown[]).splice(Number(lastKey), 1);
    } else {
      delete current[lastKey];
    }

    return result as T;
  }

  /**
   * Creates an object with only the specified keys (immutable pick).
   *
   * @param obj - Source object
   * @param keys - Keys to pick
   * @returns New object with only specified keys
   * @complexity O(k) where k is number of keys to pick
   */
  static pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;

    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }

    return result;
  }

  /**
   * Creates an object without the specified keys (immutable omit).
   *
   * @param obj - Source object
   * @param keys - Keys to omit
   * @returns New object without specified keys
   * @complexity O(n) where n is number of object properties
   */
  static omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const keySet = new Set(keys);
    const result = {} as Omit<T, K>;

    for (const [key, value] of Object.entries(obj)) {
      if (!keySet.has(key as K)) {
        (result as any)[key] = value;
      }
    }

    return result;
  }

  /**
   * Maps over object values while preserving keys.
   *
   * @param obj - Source object
   * @param mapper - Function to transform values
   * @returns New object with transformed values
   * @complexity O(n) where n is number of object properties
   */
  static mapValues<T extends Record<string, unknown>, R>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T, obj: T) => R
  ): Record<keyof T, R> {
    const result = {} as Record<keyof T, R>;

    for (const [key, value] of Object.entries(obj)) {
      result[key as keyof T] = mapper(value as T[keyof T], key as keyof T, obj);
    }

    return result;
  }

  /**
   * Maps over object keys while preserving values.
   *
   * @param obj - Source object
   * @param mapper - Function to transform keys
   * @returns New object with transformed keys
   * @complexity O(n) where n is number of object properties
   */
  static mapKeys<T extends Record<string, unknown>>(
    obj: T,
    mapper: (key: keyof T, value: T[keyof T], obj: T) => string
  ): Record<string, T[keyof T]> {
    const result: Record<string, T[keyof T]> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = mapper(key as keyof T, value as T[keyof T], obj);
      result[newKey] = value as T[keyof T];
    }

    return result;
  }

  /**
   * Filters object properties based on predicate function.
   *
   * @param obj - Source object
   * @param predicate - Function to test each property
   * @returns New object with filtered properties
   * @complexity O(n) where n is number of object properties
   */
  static filter<T extends Record<string, unknown>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T, obj: T) => boolean
  ): Partial<T> {
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value as T[keyof T], key as keyof T, obj)) {
        result[key as keyof T] = value as T[keyof T];
      }
    }

    return result;
  }

  /**
   * Inverts an object (swaps keys and values).
   *
   * @param obj - Object to invert
   * @returns Inverted object
   * @complexity O(n) where n is number of object properties
   */
  static invert<T extends Record<string, string | number>>(
    obj: T
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      result[String(value)] = key;
    }

    return result;
  }

  /**
   * Compares two objects for deep equality.
   *
   * @param obj1 - First object
   * @param obj2 - Second object
   * @returns True if objects are deeply equal
   * @complexity O(n) where n is total number of properties
   */
  static isEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (obj1 === null || obj2 === null) return false;
    if (obj1 === undefined || obj2 === undefined) return false;

    // Handle different types
    if (typeof obj1 !== typeof obj2) return false;

    // Handle dates
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }

    // Handle arrays
    if (TypeGuards.isArray(obj1) && TypeGuards.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.isEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    // Handle objects
    if (TypeGuards.isObject(obj1) && TypeGuards.isObject(obj2)) {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      for (const key of keys1) {
        if (!(key in obj2)) return false;
        if (!this.isEqual(obj1[key], obj2[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Gets all nested paths in an object.
   *
   * @param obj - Object to get paths from
   * @param prefix - Path prefix for nested objects
   * @returns Array of all paths
   * @complexity O(n) where n is total number of properties
   */
  static getPaths(obj: Record<string, unknown>, prefix: string = ""): string[] {
    const paths: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);

      if (TypeGuards.isObject(value)) {
        paths.push(...this.getPaths(value, currentPath));
      }
    }

    return paths;
  }

  /**
   * Transforms an object by applying functions to specific paths.
   *
   * @param obj - Source object
   * @param transforms - Map of path to transform function
   * @returns New object with transforms applied
   * @complexity O(n + t) where n is object size and t is number of transforms
   */
  static transform<T extends Record<string, unknown>>(
    obj: T,
    transforms: Record<
      string,
      (value: unknown, path: string, obj: T) => unknown
    >
  ): T {
    let result = this.deepClone(obj);

    for (const [path, transformer] of Object.entries(transforms)) {
      if (this.has(result, path)) {
        const currentValue = this.get(result, path);
        const newValue = transformer(currentValue, path, obj);
        result = this.set(result, path, newValue);
      }
    }

    return result;
  }

  /**
   * Parses a property path into an array of keys.
   *
   * @param path - Path string or array
   * @returns Array of path keys
   */
  private static parsePath(path: ObjectPath): (string | number)[] {
    if (TypeGuards.isArray(path)) {
      return path;
    }

    if (TypeGuards.isString(path)) {
      // Handle array indices in dot notation (e.g., "users.0.name")
      return path.split(".").map((key) => {
        // Convert numeric strings to numbers for array access
        const numKey = Number(key);
        return !isNaN(numKey) && String(numKey) === key ? numKey : key;
      });
    }

    return [String(path)];
  }

  /**
   * Freezes an object recursively (deep freeze).
   *
   * @param obj - Object to freeze
   * @returns Frozen object
   * @complexity O(n) where n is total number of properties
   */
  static deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    // Freeze the object itself
    Object.freeze(obj);

    // Recursively freeze all properties
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = (obj as any)[prop];
      if (value !== null && typeof value === "object") {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Creates a proxy that makes an object immutable.
   *
   * @param obj - Object to make immutable
   * @returns Immutable proxy of the object
   * @complexity O(1) proxy creation, O(n) for operations
   */
  static createImmutable<T extends Record<string, unknown>>(obj: T): T {
    return new Proxy(obj, {
      set() {
        throw new Error("Cannot modify immutable object");
      },
      deleteProperty() {
        throw new Error("Cannot delete properties from immutable object");
      },
      defineProperty() {
        throw new Error("Cannot define properties on immutable object");
      },
    });
  }
}
