/**
 * Type Guards Utility
 *
 * Provides runtime type checking utilities for safe type narrowing and validation.
 * These pure functions enable type-safe operations across all feature modules.
 *
 * @module TypeGuards
 * @category Shared Utils - Base
 * @description Runtime type validation and type narrowing utilities
 * @version 1.0.0
 */

/**
 * Utility class for runtime type checking and type narrowing.
 * All methods are pure functions with no side effects.
 *
 * @example
 * ```typescript
 * import { TypeGuards } from '@/shared/utils';
 *
 * // Type narrowing
 * if (TypeGuards.isString(value)) {
 *   // value is now typed as string
 *   console.log(value.toUpperCase());
 * }
 *
 * // Array validation
 * if (TypeGuards.isArrayOf(items, TypeGuards.isNumber)) {
 *   // items is now typed as number[]
 *   const sum = items.reduce((a, b) => a + b, 0);
 * }
 * ```
 */
export class TypeGuards {
  /**
   * Checks if a value is a string.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is string
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * const value: unknown = "hello";
   * if (TypeGuards.isString(value)) {
   *   console.log(value.length); // TypeScript knows it's a string
   * }
   * ```
   */
  static isString(value: unknown): value is string {
    return typeof value === "string";
  }

  /**
   * Checks if a value is a number and not NaN.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is valid number
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * const value: unknown = 42;
   * if (TypeGuards.isNumber(value)) {
   *   console.log(value.toFixed(2)); // TypeScript knows it's a number
   * }
   * ```
   */
  static isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  /**
   * Checks if a value is a boolean.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is boolean
   * @complexity O(1)
   */
  static isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
  }

  /**
   * Checks if a value is null.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is null
   * @complexity O(1)
   */
  static isNull(value: unknown): value is null {
    return value === null;
  }

  /**
   * Checks if a value is undefined.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is undefined
   * @complexity O(1)
   */
  static isUndefined(value: unknown): value is undefined {
    return value === undefined;
  }

  /**
   * Checks if a value is null or undefined.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is nullish
   * @complexity O(1)
   */
  static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  /**
   * Checks if a value is a plain object (not array, null, or class instance).
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is plain object
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * const value: unknown = { name: "John", age: 30 };
   * if (TypeGuards.isObject(value)) {
   *   console.log(Object.keys(value)); // Safe object access
   * }
   * ```
   */
  static isObject(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  /**
   * Checks if a value is an array.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is array
   * @complexity O(1)
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a Date object and is valid.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is valid Date
   * @complexity O(1)
   */
  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Checks if a value is a function.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is function
   * @complexity O(1)
   */
  static isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  /**
   * Validates that a value is a valid enum value.
   *
   * @param enumObject - The enum object to validate against
   * @param value - Value to check
   * @returns Type predicate indicating if value is enum member
   * @complexity O(n) where n is number of enum values
   *
   * @example
   * ```typescript
   * enum Status { ACTIVE = "active", INACTIVE = "inactive" }
   *
   * const value: unknown = "active";
   * if (TypeGuards.isValidEnum(Status, value)) {
   *   // value is now typed as Status
   *   console.log(value === Status.ACTIVE); // true
   * }
   * ```
   */
  static isValidEnum<T extends Record<string, string | number>>(
    enumObject: T,
    value: unknown
  ): value is T[keyof T] {
    return Object.values(enumObject).includes(value as T[keyof T]);
  }

  /**
   * Checks if an object has a specific property.
   *
   * @param obj - Object to check
   * @param prop - Property name to check for
   * @returns Type predicate indicating if object has property
   * @complexity O(1)
   *
   * @example
   * ```typescript
   * const value: unknown = { name: "John", age: 30 };
   * if (TypeGuards.hasProperty(value, "name")) {
   *   console.log(value.name); // TypeScript knows 'name' exists
   * }
   * ```
   */
  static hasProperty<K extends string>(
    obj: unknown,
    prop: K
  ): obj is Record<K, unknown> {
    return typeof obj === "object" && obj !== null && prop in obj;
  }

  /**
   * Checks if an object has multiple properties.
   *
   * @param obj - Object to check
   * @param props - Property names to check for
   * @returns Type predicate indicating if object has all properties
   * @complexity O(n) where n is number of properties
   */
  static hasProperties<K extends string>(
    obj: unknown,
    props: readonly K[]
  ): obj is Record<K, unknown> {
    if (!this.isObject(obj)) return false;
    return props.every((prop) => prop in obj);
  }

  /**
   * Validates that an array contains only elements of a specific type.
   *
   * @param value - Value to check
   * @param guard - Type guard function for array elements
   * @returns Type predicate indicating if array contains only specified type
   * @complexity O(n) where n is array length
   *
   * @example
   * ```typescript
   * const items: unknown = [1, 2, 3];
   * if (TypeGuards.isArrayOf(items, TypeGuards.isNumber)) {
   *   // items is now typed as number[]
   *   const sum = items.reduce((a, b) => a + b, 0);
   * }
   * ```
   */
  static isArrayOf<T>(
    value: unknown,
    guard: (item: unknown) => item is T
  ): value is T[] {
    return Array.isArray(value) && value.every(guard);
  }

  /**
   * Checks if a value is an array of strings.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is string array
   * @complexity O(n) where n is array length
   */
  static isStringArray(value: unknown): value is string[] {
    return this.isArrayOf(value, this.isString);
  }

  /**
   * Checks if a value is an array of numbers.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is number array
   * @complexity O(n) where n is array length
   */
  static isNumberArray(value: unknown): value is number[] {
    return this.isArrayOf(value, this.isNumber);
  }

  /**
   * Checks if a value is a non-empty string.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is non-empty string
   * @complexity O(1)
   */
  static isNonEmptyString(value: unknown): value is string {
    return this.isString(value) && value.trim().length > 0;
  }

  /**
   * Checks if a value is a positive number.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is positive number
   * @complexity O(1)
   */
  static isPositiveNumber(value: unknown): value is number {
    return this.isNumber(value) && value > 0;
  }

  /**
   * Checks if a value is a non-negative number (>= 0).
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is non-negative number
   * @complexity O(1)
   */
  static isNonNegativeNumber(value: unknown): value is number {
    return this.isNumber(value) && value >= 0;
  }

  /**
   * Checks if a value is an integer.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is integer
   * @complexity O(1)
   */
  static isInteger(value: unknown): value is number {
    return this.isNumber(value) && Number.isInteger(value);
  }

  /**
   * Checks if a value is a valid UUID (v4 format).
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is UUID
   * @complexity O(1)
   */
  static isUUID(value: unknown): value is string {
    if (!this.isString(value)) return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Checks if a value matches a specific string literal type.
   *
   * @param value - Value to check
   * @param literals - Array of valid string literals
   * @returns Type predicate indicating if value is one of the literals
   * @complexity O(n) where n is number of literals
   *
   * @example
   * ```typescript
   * const status: unknown = "active";
   * if (TypeGuards.isStringLiteral(status, ["active", "inactive"] as const)) {
   *   // status is now typed as "active" | "inactive"
   *   console.log(status === "active");
   * }
   * ```
   */
  static isStringLiteral<T extends string>(
    value: unknown,
    literals: readonly T[]
  ): value is T {
    return (
      this.isString(value) && (literals as readonly string[]).includes(value)
    );
  }

  /**
   * Checks if a value is a promise-like object.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is promise-like
   * @complexity O(1)
   */
  static isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      typeof (value as any).then === "function"
    );
  }

  /**
   * Checks if a value is an Error object.
   *
   * @param value - Value to check
   * @returns Type predicate indicating if value is Error
   * @complexity O(1)
   */
  static isError(value: unknown): value is Error {
    return value instanceof Error;
  }

  /**
   * Validates a record where all keys are strings and all values match a type guard.
   *
   * @param value - Value to check
   * @param valueGuard - Type guard for record values
   * @returns Type predicate indicating if value is valid record
   * @complexity O(n) where n is number of record entries
   */
  static isRecord<T>(
    value: unknown,
    valueGuard: (item: unknown) => item is T
  ): value is Record<string, T> {
    if (!this.isObject(value)) return false;
    return Object.values(value).every(valueGuard);
  }
}
