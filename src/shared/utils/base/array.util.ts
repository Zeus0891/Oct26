/**
 * Array Utility
 *
 * Provides pure array manipulation and processing utilities for all feature modules.
 * All functions are immutable and return new arrays without modifying the original.
 *
 * @module ArrayUtils
 * @category Shared Utils - Base
 * @description Array manipulation and processing utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";

/**
 * Group by result type
 */
export type GroupByResult<T, K extends keyof T> = Record<string, T[]>;

/**
 * Partition result type
 */
export type PartitionResult<T> = [T[], T[]];

/**
 * Sort direction type
 */
export type SortDirection = "asc" | "desc";

/**
 * Utility class for array operations and transformations.
 * All methods are pure functions that return new arrays without side effects.
 *
 * @example
 * ```typescript
 * import { ArrayUtils } from '@/shared/utils';
 *
 * const users = [
 *   { name: "John", age: 30, role: "admin" },
 *   { name: "Jane", age: 25, role: "user" },
 *   { name: "Bob", age: 35, role: "admin" }
 * ];
 *
 * // Group by role
 * const grouped = ArrayUtils.groupBy(users, "role");
 * // { admin: [...], user: [...] }
 *
 * // Get unique values
 * const roles = ArrayUtils.unique(users.map(u => u.role));
 * // ["admin", "user"]
 * ```
 */
export class ArrayUtils {
  /**
   * Groups array elements by a specified key or custom function.
   *
   * @param array - Array to group
   * @param keyOrFn - Property key or grouping function
   * @returns Object with grouped elements
   * @complexity O(n) where n is array length
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: "John", role: "admin" },
   *   { name: "Jane", role: "user" },
   *   { name: "Bob", role: "admin" }
   * ];
   *
   * const byRole = ArrayUtils.groupBy(users, "role");
   * const byFirstLetter = ArrayUtils.groupBy(users, u => u.name[0]);
   * ```
   */
  static groupBy<T, K extends keyof T>(
    array: T[],
    keyOrFn: K | ((item: T) => string | number | symbol)
  ): Record<string, T[]> {
    const groups: Record<string, T[]> = {};

    for (const item of array) {
      const key =
        typeof keyOrFn === "function"
          ? String(keyOrFn(item))
          : String(item[keyOrFn]);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }

    return groups;
  }

  /**
   * Partitions array into two arrays based on a predicate function.
   *
   * @param array - Array to partition
   * @param predicate - Function that determines partition
   * @returns Tuple of [matching, non-matching] arrays
   * @complexity O(n) where n is array length
   *
   * @example
   * ```typescript
   * const numbers = [1, 2, 3, 4, 5, 6];
   * const [evens, odds] = ArrayUtils.partition(numbers, n => n % 2 === 0);
   * // evens: [2, 4, 6], odds: [1, 3, 5]
   * ```
   */
  static partition<T>(
    array: T[],
    predicate: (item: T, index: number) => boolean
  ): PartitionResult<T> {
    const matching: T[] = [];
    const nonMatching: T[] = [];

    array.forEach((item, index) => {
      if (predicate(item, index)) {
        matching.push(item);
      } else {
        nonMatching.push(item);
      }
    });

    return [matching, nonMatching];
  }

  /**
   * Splits array into chunks of specified size.
   *
   * @param array - Array to chunk
   * @param size - Chunk size (must be positive)
   * @returns Array of chunks
   * @complexity O(n) where n is array length
   *
   * @example
   * ```typescript
   * const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
   * const chunks = ArrayUtils.chunk(numbers, 3);
   * // [[1, 2, 3], [4, 5, 6], [7, 8]]
   * ```
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error("Chunk size must be positive");
    }

    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * Returns unique elements from array, optionally using a key function.
   *
   * @param array - Array to get unique elements from
   * @param keyFn - Optional function to determine uniqueness
   * @returns Array with unique elements
   * @complexity O(n) where n is array length
   *
   * @example
   * ```typescript
   * const numbers = [1, 2, 2, 3, 3, 4];
   * const unique = ArrayUtils.unique(numbers);
   * // [1, 2, 3, 4]
   *
   * const users = [{id: 1, name: "John"}, {id: 1, name: "Jane"}];
   * const uniqueUsers = ArrayUtils.unique(users, u => u.id);
   * // [{id: 1, name: "John"}]
   * ```
   */
  static unique<T>(
    array: T[],
    keyFn?: (item: T) => string | number | symbol
  ): T[] {
    if (!keyFn) {
      return [...new Set(array)];
    }

    const seen = new Set<string | number | symbol>();
    const result: T[] = [];

    for (const item of array) {
      const key = keyFn(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Sorts array by a key or custom comparison function.
   *
   * @param array - Array to sort
   * @param keyOrCompareFn - Sort key or compare function
   * @param direction - Sort direction
   * @returns New sorted array
   * @complexity O(n log n) where n is array length
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: "John", age: 30 },
   *   { name: "Jane", age: 25 },
   *   { name: "Bob", age: 35 }
   * ];
   *
   * const byAge = ArrayUtils.sortBy(users, "age");
   * const byName = ArrayUtils.sortBy(users, "name", "desc");
   * const custom = ArrayUtils.sortBy(users, (a, b) => a.age - b.age);
   * ```
   */
  static sortBy<T, K extends keyof T>(
    array: T[],
    keyOrCompareFn: K | ((a: T, b: T) => number),
    direction: SortDirection = "asc"
  ): T[] {
    const sorted = [...array];

    if (typeof keyOrCompareFn === "function") {
      return sorted.sort(keyOrCompareFn);
    }

    return sorted.sort((a, b) => {
      const aVal = a[keyOrCompareFn];
      const bVal = b[keyOrCompareFn];

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Finds intersection of multiple arrays.
   *
   * @param arrays - Arrays to intersect
   * @param keyFn - Optional function to determine equality
   * @returns Array of common elements
   * @complexity O(n * m) where n is total elements and m is number of arrays
   *
   * @example
   * ```typescript
   * const arr1 = [1, 2, 3, 4];
   * const arr2 = [3, 4, 5, 6];
   * const arr3 = [4, 5, 6, 7];
   *
   * const intersection = ArrayUtils.intersection([arr1, arr2, arr3]);
   * // [4]
   * ```
   */
  static intersection<T>(
    arrays: T[][],
    keyFn?: (item: T) => string | number | symbol
  ): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];

    const [first, ...rest] = arrays;

    return first.filter((item) => {
      const key = keyFn ? keyFn(item) : item;
      return rest.every((arr) => {
        if (keyFn) {
          return arr.some((arrItem) => keyFn(arrItem) === key);
        }
        return arr.includes(item);
      });
    });
  }

  /**
   * Finds union of multiple arrays (all unique elements).
   *
   * @param arrays - Arrays to union
   * @param keyFn - Optional function to determine uniqueness
   * @returns Array of all unique elements
   * @complexity O(n) where n is total elements across all arrays
   */
  static union<T>(
    arrays: T[][],
    keyFn?: (item: T) => string | number | symbol
  ): T[] {
    const combined = arrays.flat();
    return this.unique(combined, keyFn);
  }

  /**
   * Finds difference between first array and all other arrays.
   *
   * @param arrays - Arrays to difference (first array minus others)
   * @param keyFn - Optional function to determine equality
   * @returns Array of elements in first array but not in others
   * @complexity O(n * m) where n is first array length and m is other arrays
   */
  static difference<T>(
    arrays: T[][],
    keyFn?: (item: T) => string | number | symbol
  ): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];

    const [first, ...rest] = arrays;
    const otherItems = rest.flat();

    return first.filter((item) => {
      const key = keyFn ? keyFn(item) : item;
      if (keyFn) {
        return !otherItems.some((otherItem) => keyFn(otherItem) === key);
      }
      return !otherItems.includes(item);
    });
  }

  /**
   * Flattens nested arrays to a specified depth.
   *
   * @param array - Array to flatten
   * @param depth - Maximum depth to flatten (default: 1)
   * @returns Flattened array
   * @complexity O(n) where n is total elements
   */
  static flatten<T>(array: unknown[], depth: number = 1): T[] {
    if (depth <= 0) return array as T[];

    const result: unknown[] = [];

    for (const item of array) {
      if (TypeGuards.isArray(item) && depth > 0) {
        result.push(...this.flatten(item, depth - 1));
      } else {
        result.push(item);
      }
    }

    return result as T[];
  }

  /**
   * Shuffles array elements randomly (Fisher-Yates algorithm).
   *
   * @param array - Array to shuffle
   * @returns New shuffled array
   * @complexity O(n) where n is array length
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Takes a random sample of elements from array.
   *
   * @param array - Array to sample from
   * @param count - Number of elements to sample
   * @returns Array of sampled elements
   * @complexity O(n) where n is sample count
   */
  static sample<T>(array: T[], count: number): T[] {
    if (count >= array.length) return this.shuffle(array);
    if (count <= 0) return [];

    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }

  /**
   * Rotates array elements by specified positions.
   *
   * @param array - Array to rotate
   * @param positions - Number of positions to rotate (positive = right, negative = left)
   * @returns New rotated array
   * @complexity O(n) where n is array length
   */
  static rotate<T>(array: T[], positions: number): T[] {
    if (array.length === 0) return [];

    const len = array.length;
    const normalizedPositions = ((positions % len) + len) % len;

    return [
      ...array.slice(-normalizedPositions),
      ...array.slice(0, -normalizedPositions),
    ];
  }

  /**
   * Splits array into multiple arrays based on separator predicate.
   *
   * @param array - Array to split
   * @param separatorPredicate - Function that identifies separators
   * @returns Array of sub-arrays
   * @complexity O(n) where n is array length
   */
  static split<T>(
    array: T[],
    separatorPredicate: (item: T, index: number) => boolean
  ): T[][] {
    const result: T[][] = [];
    let current: T[] = [];

    array.forEach((item, index) => {
      if (separatorPredicate(item, index)) {
        if (current.length > 0) {
          result.push(current);
          current = [];
        }
      } else {
        current.push(item);
      }
    });

    if (current.length > 0) {
      result.push(current);
    }

    return result;
  }

  /**
   * Finds the mode (most frequent element) in an array.
   *
   * @param array - Array to analyze
   * @param keyFn - Optional function to extract comparison key
   * @returns Most frequent element(s)
   * @complexity O(n) where n is array length
   */
  static mode<T>(
    array: T[],
    keyFn?: (item: T) => string | number | symbol
  ): T[] {
    if (array.length === 0) return [];

    const frequency = new Map<
      string | number | symbol,
      { count: number; items: T[] }
    >();

    // Count frequencies
    for (const item of array) {
      const key = keyFn ? keyFn(item) : item;
      const current = frequency.get(key as string | number | symbol) || {
        count: 0,
        items: [],
      };
      current.count++;
      if (
        !current.items.some((existingItem) =>
          keyFn ? keyFn(existingItem) === key : existingItem === item
        )
      ) {
        current.items.push(item);
      }
      frequency.set(key as string | number | symbol, current);
    }

    // Find maximum frequency
    const maxCount = Math.max(
      ...Array.from(frequency.values()).map((f) => f.count)
    );

    // Return all items with maximum frequency
    return Array.from(frequency.values())
      .filter((f) => f.count === maxCount)
      .flatMap((f) => f.items);
  }

  /**
   * Zips multiple arrays together into an array of tuples.
   *
   * @param arrays - Arrays to zip
   * @returns Array of tuples
   * @complexity O(n) where n is length of shortest array
   */
  static zip<T extends readonly unknown[][]>(
    ...arrays: T
  ): Array<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }> {
    if (arrays.length === 0) return [];

    const minLength = Math.min(...arrays.map((arr) => arr.length));
    const result: any[] = [];

    for (let i = 0; i < minLength; i++) {
      result.push(arrays.map((arr) => arr[i]));
    }

    return result;
  }

  /**
   * Checks if arrays are equal (shallow comparison).
   *
   * @param arr1 - First array
   * @param arr2 - Second array
   * @param compareFn - Optional custom comparison function
   * @returns True if arrays are equal
   * @complexity O(n) where n is array length
   */
  static isEqual<T>(
    arr1: T[],
    arr2: T[],
    compareFn?: (a: T, b: T) => boolean
  ): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (compareFn) {
        if (!compareFn(arr1[i], arr2[i])) return false;
      } else {
        if (arr1[i] !== arr2[i]) return false;
      }
    }

    return true;
  }

  /**
   * Removes elements at specified indices.
   *
   * @param array - Source array
   * @param indices - Indices to remove
   * @returns New array without specified elements
   * @complexity O(n) where n is array length
   */
  static removeAt<T>(array: T[], ...indices: number[]): T[] {
    const indexSet = new Set(indices);
    return array.filter((_, index) => !indexSet.has(index));
  }

  /**
   * Inserts elements at specified index.
   *
   * @param array - Source array
   * @param index - Index to insert at
   * @param elements - Elements to insert
   * @returns New array with inserted elements
   * @complexity O(n) where n is array length
   */
  static insertAt<T>(array: T[], index: number, ...elements: T[]): T[] {
    const result = [...array];
    result.splice(index, 0, ...elements);
    return result;
  }
}
