/**
 * Date Utility
 *
 * Provides comprehensive date manipulation and formatting utilities.
 * All functions handle timezone considerations and provide type-safe operations.
 *
 * @module DateUtils
 * @category Shared Utils - Base
 * @description Date manipulation, formatting, and timezone utilities
 * @version 1.0.0
 */

import { TypeGuards } from "./type-guards.util";

/**
 * Date format options
 */
export interface DateFormatOptions {
  /** Include time component */
  includeTime?: boolean;
  /** Include timezone */
  includeTimezone?: boolean;
  /** Use 12-hour format */
  use12Hour?: boolean;
  /** Custom locale */
  locale?: string;
  /** Custom timezone */
  timezone?: string;
}

/**
 * Duration object
 */
export interface Duration {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * Date range object
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Utility class for date operations and manipulations.
 * All methods handle edge cases and provide consistent timezone behavior.
 *
 * @example
 * ```typescript
 * import { DateUtils } from '@/shared/utils';
 *
 * // Formatting
 * const formatted = DateUtils.format(new Date(), 'YYYY-MM-DD');
 *
 * // Arithmetic
 * const tomorrow = DateUtils.addDays(new Date(), 1);
 * const diff = DateUtils.diffInDays(date1, date2);
 *
 * // Validation
 * const isValid = DateUtils.isValid("2023-12-25");
 * ```
 */
export class DateUtils {
  /**
   * Common date format patterns
   */
  static readonly FORMATS = {
    ISO_DATE: "YYYY-MM-DD",
    ISO_DATETIME: "YYYY-MM-DDTHH:mm:ss.sssZ",
    US_DATE: "MM/DD/YYYY",
    EU_DATE: "DD/MM/YYYY",
    READABLE: "MMMM D, YYYY",
    READABLE_TIME: "MMMM D, YYYY [at] h:mm A",
    TIME_24: "HH:mm:ss",
    TIME_12: "h:mm A",
  } as const;

  /**
   * Creates a new Date object from various input types.
   *
   * @param input - Date input (Date, string, number, or null for current date)
   * @returns New Date object or null if invalid
   * @complexity O(1)
   */
  static create(input?: Date | string | number | null): Date | null {
    if (input === null || input === undefined) {
      return new Date();
    }

    if (input instanceof Date) {
      return new Date(input.getTime());
    }

    if (TypeGuards.isString(input) || TypeGuards.isNumber(input)) {
      const date = new Date(input);
      return this.isValid(date) ? date : null;
    }

    return null;
  }

  /**
   * Validates if a date is valid.
   *
   * @param date - Date to validate
   * @returns True if valid date
   * @complexity O(1)
   */
  static isValid(date: Date | string | number): boolean {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Formats a date using a simple pattern system.
   *
   * @param date - Date to format
   * @param pattern - Format pattern
   * @param options - Formatting options
   * @returns Formatted date string
   * @complexity O(1)
   *
   * Pattern tokens:
   * - YYYY: 4-digit year
   * - MM: 2-digit month
   * - DD: 2-digit day
   * - HH: 2-digit hour (24h)
   * - mm: 2-digit minute
   * - ss: 2-digit second
   * - sss: 3-digit milliseconds
   *
   * @example
   * ```typescript
   * const date = new Date('2025-10-20T14:30:00');
   * DateUtils.format(date, 'YYYY-MM-DD') // → "2025-10-20"
   * DateUtils.format(date, 'MM/DD/YYYY HH:mm') // → "10/20/2025 14:30"
   * DateUtils.format(date, 'DD-MM-YYYY', { locale: 'en-GB' }) // → "20-10-2025"
   * ```
   */
  static format(
    date: Date | string | number,
    pattern: string = DateUtils.FORMATS.ISO_DATE,
    options: DateFormatOptions = {}
  ): string {
    const dateObj = this.create(date);
    if (!dateObj) return "";

    const { timezone, locale = "en-US" } = options;

    // Use Intl.DateTimeFormat for timezone support if specified
    if (timezone) {
      try {
        return new Intl.DateTimeFormat(locale, {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour:
            pattern.includes("HH") || pattern.includes("h")
              ? "2-digit"
              : undefined,
          minute: pattern.includes("mm") ? "2-digit" : undefined,
          second: pattern.includes("ss") ? "2-digit" : undefined,
          hour12: options.use12Hour,
        }).format(dateObj);
      } catch {
        // Fall through to manual formatting
      }
    }

    // Manual pattern replacement
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    const milliseconds = String(dateObj.getMilliseconds()).padStart(3, "0");

    let formatted = pattern
      .replace(/YYYY/g, String(year))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds)
      .replace(/sss/g, milliseconds);

    // Handle 12-hour format
    if (options.use12Hour && pattern.includes("h")) {
      const hour12 = dateObj.getHours() % 12 || 12;
      const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";
      formatted = formatted.replace(/h/g, String(hour12)).replace(/A/g, ampm);
    }

    return formatted;
  }

  /**
   * Parses a date string with automatic format detection.
   *
   * @param dateString - Date string to parse
   * @param formats - Optional format patterns to try
   * @returns Parsed Date object or null
   * @complexity O(n) where n is number of formats to try
   */
  static parse(dateString: string, formats?: string[]): Date | null {
    if (!TypeGuards.isString(dateString)) return null;

    // Try native parsing first
    const nativeDate = new Date(dateString);
    if (this.isValid(nativeDate)) {
      return nativeDate;
    }

    // Try common formats if provided
    if (formats) {
      for (const format of formats) {
        const parsed = this.parseWithFormat(dateString, format);
        if (parsed) return parsed;
      }
    }

    return null;
  }

  /**
   * Parses a date string using a specific format pattern.
   *
   * @param dateString - Date string to parse
   * @param format - Format pattern
   * @returns Parsed Date object or null
   * @complexity O(1)
   */
  private static parseWithFormat(
    dateString: string,
    format: string
  ): Date | null {
    // This is a simplified parser - in production, consider using a library like date-fns
    const formatRegex = format
      .replace(/YYYY/g, "(\\d{4})")
      .replace(/MM/g, "(\\d{2})")
      .replace(/DD/g, "(\\d{2})")
      .replace(/HH/g, "(\\d{2})")
      .replace(/mm/g, "(\\d{2})")
      .replace(/ss/g, "(\\d{2})");

    const match = dateString.match(new RegExp(formatRegex));
    if (!match) return null;

    const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Month is 0-indexed
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );

    return this.isValid(date) ? date : null;
  }

  /**
   * Adds days to a date.
   *
   * @param date - Base date
   * @param days - Number of days to add
   * @returns New date with days added
   * @complexity O(1)
   */
  static addDays(date: Date | string | number, days: number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj || !TypeGuards.isNumber(days)) return null;

    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Adds months to a date.
   *
   * @param date - Base date
   * @param months - Number of months to add
   * @returns New date with months added
   * @complexity O(1)
   */
  static addMonths(date: Date | string | number, months: number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj || !TypeGuards.isNumber(months)) return null;

    const result = new Date(dateObj);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Adds years to a date.
   *
   * @param date - Base date
   * @param years - Number of years to add
   * @returns New date with years added
   * @complexity O(1)
   */
  static addYears(date: Date | string | number, years: number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj || !TypeGuards.isNumber(years)) return null;

    const result = new Date(dateObj);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Adds a duration to a date.
   *
   * @param date - Base date
   * @param duration - Duration to add
   * @returns New date with duration added
   * @complexity O(1)
   */
  static add(date: Date | string | number, duration: Duration): Date | null {
    let result = this.create(date);
    if (!result) return null;

    if (duration.years) {
      const yearResult = this.addYears(result, duration.years);
      if (!yearResult) return null;
      result = yearResult;
    }
    if (duration.months) {
      const monthResult = this.addMonths(result, duration.months);
      if (!monthResult) return null;
      result = monthResult;
    }
    if (duration.days) {
      const dayResult = this.addDays(result, duration.days);
      if (!dayResult) return null;
      result = dayResult;
    }

    if (result) {
      if (duration.hours) result.setHours(result.getHours() + duration.hours);
      if (duration.minutes)
        result.setMinutes(result.getMinutes() + duration.minutes);
      if (duration.seconds)
        result.setSeconds(result.getSeconds() + duration.seconds);
      if (duration.milliseconds) {
        result.setMilliseconds(
          result.getMilliseconds() + duration.milliseconds
        );
      }
    }

    return result;
  }

  /**
   * Subtracts days from a date.
   *
   * @param date - Base date
   * @param days - Number of days to subtract
   * @returns New date with days subtracted
   * @complexity O(1)
   */
  static subtractDays(date: Date | string | number, days: number): Date | null {
    return this.addDays(date, -days);
  }

  /**
   * Subtracts a duration from a date.
   *
   * @param date - Base date
   * @param duration - Duration to subtract
   * @returns New date with duration subtracted
   * @complexity O(1)
   */
  static subtract(
    date: Date | string | number,
    duration: Duration
  ): Date | null {
    const negativeDuration: Duration = {};

    if (duration.years) negativeDuration.years = -duration.years;
    if (duration.months) negativeDuration.months = -duration.months;
    if (duration.days) negativeDuration.days = -duration.days;
    if (duration.hours) negativeDuration.hours = -duration.hours;
    if (duration.minutes) negativeDuration.minutes = -duration.minutes;
    if (duration.seconds) negativeDuration.seconds = -duration.seconds;
    if (duration.milliseconds)
      negativeDuration.milliseconds = -duration.milliseconds;

    return this.add(date, negativeDuration);
  }

  /**
   * Calculates difference in milliseconds between two dates.
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in milliseconds (date1 - date2)
   * @complexity O(1)
   */
  static diffInMilliseconds(
    date1: Date | string | number,
    date2: Date | string | number
  ): number {
    const d1 = this.create(date1);
    const d2 = this.create(date2);

    if (!d1 || !d2) return 0;
    return d1.getTime() - d2.getTime();
  }

  /**
   * Calculates difference in days between two dates.
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in days
   * @complexity O(1)
   */
  static diffInDays(
    date1: Date | string | number,
    date2: Date | string | number
  ): number {
    return Math.floor(
      this.diffInMilliseconds(date1, date2) / (24 * 60 * 60 * 1000)
    );
  }

  /**
   * Calculates difference in hours between two dates.
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in hours
   * @complexity O(1)
   */
  static diffInHours(
    date1: Date | string | number,
    date2: Date | string | number
  ): number {
    return Math.floor(this.diffInMilliseconds(date1, date2) / (60 * 60 * 1000));
  }

  /**
   * Gets the start of day for a date.
   *
   * @param date - Input date
   * @returns Start of day
   * @complexity O(1)
   */
  static startOfDay(date: Date | string | number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj) return null;

    const result = new Date(dateObj);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets the end of day for a date.
   *
   * @param date - Input date
   * @returns End of day
   * @complexity O(1)
   */
  static endOfDay(date: Date | string | number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj) return null;

    const result = new Date(dateObj);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Gets the start of month for a date.
   *
   * @param date - Input date
   * @returns Start of month
   * @complexity O(1)
   */
  static startOfMonth(date: Date | string | number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj) return null;

    const result = new Date(dateObj);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets the end of month for a date.
   *
   * @param date - Input date
   * @returns End of month
   * @complexity O(1)
   */
  static endOfMonth(date: Date | string | number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj) return null;

    const result = new Date(dateObj);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Checks if a date is between two other dates.
   *
   * @param date - Date to check
   * @param start - Range start
   * @param end - Range end
   * @param inclusive - Include boundaries
   * @returns True if date is in range
   * @complexity O(1)
   */
  static isBetween(
    date: Date | string | number,
    start: Date | string | number,
    end: Date | string | number,
    inclusive = true
  ): boolean {
    const dateObj = this.create(date);
    const startObj = this.create(start);
    const endObj = this.create(end);

    if (!dateObj || !startObj || !endObj) return false;

    const dateTime = dateObj.getTime();
    const startTime = startObj.getTime();
    const endTime = endObj.getTime();

    if (inclusive) {
      return dateTime >= startTime && dateTime <= endTime;
    } else {
      return dateTime > startTime && dateTime < endTime;
    }
  }

  /**
   * Checks if two dates are on the same day.
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day
   * @complexity O(1)
   */
  static isSameDay(
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean {
    const d1 = this.create(date1);
    const d2 = this.create(date2);

    if (!d1 || !d2) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /**
   * Checks if a date is today.
   *
   * @param date - Date to check
   * @returns True if today
   * @complexity O(1)
   */
  static isToday(date: Date | string | number): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Checks if a date is in the past.
   *
   * @param date - Date to check
   * @returns True if in the past
   * @complexity O(1)
   */
  static isPast(date: Date | string | number): boolean {
    const dateObj = this.create(date);
    return dateObj ? dateObj.getTime() < Date.now() : false;
  }

  /**
   * Checks if a date is in the future.
   *
   * @param date - Date to check
   * @returns True if in the future
   * @complexity O(1)
   */
  static isFuture(date: Date | string | number): boolean {
    const dateObj = this.create(date);
    return dateObj ? dateObj.getTime() > Date.now() : false;
  }

  /**
   * Gets the age in years from a birth date.
   *
   * @param birthDate - Birth date
   * @param referenceDate - Reference date (default: now)
   * @returns Age in years
   * @complexity O(1)
   */
  static getAge(
    birthDate: Date | string | number,
    referenceDate?: Date | string | number
  ): number {
    const birth = this.create(birthDate);
    const reference = this.create(referenceDate) || new Date();

    if (!birth) return 0;

    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && reference.getDate() < birth.getDate())
    ) {
      age--;
    }

    return Math.max(0, age);
  }

  /**
   * Formats a duration as human-readable text.
   *
   * @param milliseconds - Duration in milliseconds
   * @param precision - Number of units to include
   * @returns Human-readable duration
   * @complexity O(1)
   */
  static formatDuration(milliseconds: number, precision = 2): string {
    if (!TypeGuards.isNumber(milliseconds) || milliseconds < 0) return "0 ms";

    const units = [
      { name: "year", ms: 365 * 24 * 60 * 60 * 1000 },
      { name: "month", ms: 30 * 24 * 60 * 60 * 1000 },
      { name: "day", ms: 24 * 60 * 60 * 1000 },
      { name: "hour", ms: 60 * 60 * 1000 },
      { name: "minute", ms: 60 * 1000 },
      { name: "second", ms: 1000 },
      { name: "millisecond", ms: 1 },
    ];

    const parts: string[] = [];
    let remaining = milliseconds;

    for (const unit of units) {
      if (remaining >= unit.ms && parts.length < precision) {
        const count = Math.floor(remaining / unit.ms);
        parts.push(`${count} ${unit.name}${count !== 1 ? "s" : ""}`);
        remaining %= unit.ms;
      }
    }

    return parts.length > 0 ? parts.join(", ") : "0 ms";
  }

  /**
   * Gets the timezone offset in minutes.
   *
   * @param date - Date to get offset for
   * @returns Timezone offset in minutes
   * @complexity O(1)
   */
  static getTimezoneOffset(date?: Date | string | number): number {
    const dateObj = this.create(date) || new Date();
    return dateObj.getTimezoneOffset();
  }

  /**
   * Converts date to UTC.
   *
   * @param date - Date to convert
   * @returns UTC date
   * @complexity O(1)
   */
  static toUTC(date: Date | string | number): Date | null {
    const dateObj = this.create(date);
    if (!dateObj) return null;

    return new Date(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate(),
      dateObj.getUTCHours(),
      dateObj.getUTCMinutes(),
      dateObj.getUTCSeconds(),
      dateObj.getUTCMilliseconds()
    );
  }
}
