# 🔧 **Shared Utils Action Plan**

_⚠️ Refactored to focus on transversal utilities only_

## Overview

This action plan defines the implementation of **foundational shared utilities** that provide pure, transversal helper functions across all feature modules. These utilities focus exclusively on cross-cutting concerns: base data operations, security infrastructure, and generic transformations used by all domains.

## Architecture Principles

### 🎯 **Design Goals**

- **Pure Functions**: Stateless, predictable utility functions with no side effects
- **Transversal Only**: Utilities used by ALL modules (not domain-specific)
- **Type Safety**: Perfect alignment with shared types and runtime validation
- **Security Core**: Cryptographic and RBAC utilities for global security
- **Performance**: Optimized algorithms with performance measurement
- **No Business Logic**: Data transformation and validation only

### 🏗️ **Architecture Boundaries**

**✅ Belongs in Shared Utils:**

- Base data operations used by ALL modules (arrays, objects, strings, dates)
- Security infrastructure (crypto, JWT, RBAC, audit helpers)
- Generic transformations (type guards, validation, error handling)
- Performance measurement and optimization helpers

**❌ Moved to Feature Modules:**

- Finance utilities → `src/features/finance/utils/`
- Workflow utilities → `src/features/workflow/utils/`
- Integration utilities → `src/features/integration/utils/`

---

## 📁 Refactored Utility Structure

### 🧱 **Base Infrastructure** (`/base/`)

_Pure, transversal utilities used by ALL feature modules_

| File                     | Purpose                       | Key Functions                                                            | Scope                      |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------ | -------------------------- |
| `type-guards.util.ts`    | Runtime type checking         | `isString()`, `isNumber()`, `isValidEnum()`, `hasProperty()`             | Type validation everywhere |
| `data-transform.util.ts` | Data format transformations   | `camelToSnake()`, `snakeToCamel()`, `flattenObject()`, `normalizeData()` | API data conversion        |
| `array.util.ts`          | Array manipulation utilities  | `groupBy()`, `partition()`, `chunk()`, `uniqueBy()`, `sortBy()`          | Generic data processing    |
| `object.util.ts`         | Object manipulation utilities | `deepClone()`, `deepMerge()`, `omit()`, `pick()`, `flatten()`            | Universal object ops       |
| `string.util.ts`         | String processing utilities   | `sanitize()`, `slugify()`, `truncate()`, `formatTemplate()`              | Text processing everywhere |
| `date.util.ts`           | Date and time utilities       | `formatDate()`, `parseDate()`, `isWithinRange()`, `addBusinessDays()`    | Universal date operations  |
| `validation.util.ts`     | Validation helper functions   | `isValidEmail()`, `isValidPhone()`, `isValidUrl()`, `sanitizeHtml()`     | Common input validation    |
| `error.util.ts`          | Error handling utilities      | `createApiError()`, `formatError()`, `logError()`, `handleError()`       | Standardized error mgmt    |

### � **Security Infrastructure** (`/security/`)

_Cryptographic and RBAC utilities for global security_

| File               | Purpose                  | Key Functions                                                                 | Scope                    |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------- | ------------------------ |
| `crypto.util.ts`   | Cryptographic operations | `hash()`, `encrypt()`, `decrypt()`, `generateToken()`, `verifySignature()`    | Global data security     |
| `password.util.ts` | Password utilities       | `hashPassword()`, `verifyPassword()`, `generatePassword()`, `checkStrength()` | Authentication security  |
| `jwt.util.ts`      | JWT token utilities      | `generateJWT()`, `verifyJWT()`, `decodeJWT()`, `refreshToken()`               | Token management         |
| `rbac.util.ts`     | RBAC helper functions    | `checkPermission()`, `hasRole()`, `getEffectivePermissions()`                 | Global access control    |
| `audit.util.ts`    | Audit logging utilities  | `logAction()`, `createAuditEntry()`, `formatAuditLog()`                       | Transversal audit trails |

---

## 🚫 **Utilities Moved to Feature Modules**

### � **Finance → `src/features/finance/utils/`**

- `money.util.ts`, `currency.util.ts`, `tax.util.ts`, `accounting.util.ts`, `invoice.util.ts`, `payment.util.ts`

### 🔄 **Workflow → `src/features/workflow/utils/`**

- `status.util.ts`, `approval.util.ts`, `task.util.ts`, `notification.util.ts`, `document.util.ts`, `revision.util.ts`

### 🔗 **Integration → `src/features/integration/utils/`**

- `api.util.ts`, `webhook.util.ts`, `sync.util.ts`, `mapping.util.ts`, `queue.util.ts`

---

## 🎯 **Implementation Requirements**

### **1. Type-Safe Utilities**

```typescript
// Type-safe utility functions with proper generics
export class TypeGuards {
  static isString(value: unknown): value is string {
    return typeof value === "string";
  }

  static isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  static isValidEnum<T extends Record<string, string | number>>(
    enumObject: T,
    value: unknown
  ): value is T[keyof T] {
    return Object.values(enumObject).includes(value as T[keyof T]);
  }

  static hasProperty<K extends string>(
    obj: unknown,
    prop: K
  ): obj is Record<K, unknown> {
    return typeof obj === "object" && obj !== null && prop in obj;
  }

  static isArrayOf<T>(
    value: unknown,
    guard: (item: unknown) => item is T
  ): value is T[] {
    return Array.isArray(value) && value.every(guard);
  }
}
```

### **2. Financial Calculations**

```typescript
// Precise financial calculations with currency support
export class MoneyUtils {
  private static readonly PRECISION = 4; // 4 decimal places for calculations
  private static readonly DISPLAY_PRECISION = 2; // 2 decimal places for display

  static add(a: Money, b: Money): Money {
    this.validateSameCurrency(a, b);

    return {
      amount: this.roundToPrecision(a.amount + b.amount),
      currency: a.currency,
    };
  }

  static multiply(money: Money, multiplier: number): Money {
    return {
      amount: this.roundToPrecision(money.amount * multiplier),
      currency: money.currency,
    };
  }

  static format(money: Money, locale = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currency,
      minimumFractionDigits: this.DISPLAY_PRECISION,
      maximumFractionDigits: this.DISPLAY_PRECISION,
    }).format(money.amount);
  }

  private static roundToPrecision(amount: number): number {
    const factor = Math.pow(10, this.PRECISION);
    return Math.round(amount * factor) / factor;
  }

  private static validateSameCurrency(a: Money, b: Money): void {
    if (a.currency !== b.currency) {
      throw new CurrencyMismatchError(
        `Cannot perform operation on different currencies: ${a.currency} and ${b.currency}`
      );
    }
  }
}
```

### **3. Security Utilities**

```typescript
// Security-focused utilities with proper error handling
export class CryptoUtils {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;
  private static readonly TAG_LENGTH = 16;

  static async hash(
    data: string,
    salt?: string
  ): Promise<{ hash: string; salt: string }> {
    const actualSalt = salt || (await this.generateSalt());
    const hash = await argon2.hash(data, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      salt: Buffer.from(actualSalt, "hex"),
    });

    return { hash, salt: actualSalt };
  }

  static async encrypt(plaintext: string, key: string): Promise<EncryptedData> {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipher(this.ALGORITHM, key);
    cipher.setAAD(iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  static async verifySignature(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(data);
      return verifier.verify(publicKey, signature, "base64");
    } catch (error) {
      return false;
    }
  }

  private static async generateSalt(): Promise<string> {
    return crypto.randomBytes(this.SALT_LENGTH).toString("hex");
  }
}
```

### **4. Data Transformation**

```typescript
// Data transformation utilities with type preservation
export class DataTransformUtils {
  static camelToSnake<T extends Record<string, unknown>>(
    obj: T
  ): SnakeCaseKeys<T> {
    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      result[snakeKey] = this.isObject(value)
        ? this.camelToSnake(value)
        : value;
    }

    return result;
  }

  static snakeToCamel<T extends Record<string, unknown>>(
    obj: T
  ): CamelCaseKeys<T> {
    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      result[camelKey] = this.isObject(value)
        ? this.snakeToCamel(value)
        : value;
    }

    return result;
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(this.deepClone) as T;

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  static groupBy<T, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
```

---

## 🔧 **Integration Points**

### **With Shared Types**

- All utilities use shared type definitions for input/output
- Type-safe operations with compile-time checking
- Perfect alignment with Prisma schema types
- Consistent error handling using shared error types

### **With Shared Services**

- Utilities provide helper functions for service layer operations
- Performance-optimized algorithms for service layer consumption
- Standardized data transformations for service interfaces
- Error handling utilities for service layer error management

### **With Shared Validators**

- Validation utilities support validator layer operations
- Type guards assist in runtime validation
- Data sanitization utilities for input validation
- Business rule evaluation utilities

### **With RBAC System**

- Security utilities integrate with RBAC permissions
- Cryptographic utilities support authentication flows
- Session utilities manage RBAC context
- Audit utilities log RBAC-related activities

---

## 📊 **Utility Dependencies**

| Utility             | Depends On                | Provides To            | Integration Points              |
| ------------------- | ------------------------- | ---------------------- | ------------------------------- |
| **TypeGuards**      | Shared Types              | All Runtime Validation | Type safety everywhere          |
| **DataTransform**   | Object Utils              | All API Layers         | Request/response transformation |
| **ArrayUtils**      | Base Types                | All Data Processing    | Collection operations           |
| **ObjectUtils**     | Type Guards               | All Object Operations  | Data manipulation               |
| **StringUtils**     | Validation Utils          | All Text Processing    | Sanitization and formatting     |
| **DateUtils**       | Base Types                | All Time Operations    | Date formatting and parsing     |
| **ValidationUtils** | Type Guards, String Utils | All Input Validation   | Common validation patterns      |
| **ErrorUtils**      | Shared Types              | All Error Handling     | Standardized error creation     |
| **CryptoUtils**     | Node Crypto               | Security Services      | Data encryption/hashing         |
| **PasswordUtils**   | Crypto Utils              | Authentication         | Password security               |
| **JWTUtils**        | Crypto Utils              | Auth Services          | Token management                |
| **RBACUtils**       | Permission Types          | Auth Middleware        | Access control helpers          |
| **AuditUtils**      | Audit Types               | Audit Services         | Audit entry formatting          |

---

## 🚀 **Implementation Roadmap**

**Week 1**: Core Foundation

- Implement `type-guards.util.ts`, `data-transform.util.ts`, `array.util.ts`
- Create `object.util.ts` with deep operations and performance optimization
- Set up `error.util.ts` with standardized error creation patterns

**Week 2**: Data & Validation Infrastructure

- Implement `string.util.ts` with sanitization and formatting
- Create `date.util.ts` with comprehensive time operations
- Add `validation.util.ts` with common validation patterns

**Week 3**: Security Core

- Implement `crypto.util.ts` with encryption and hashing
- Create `password.util.ts` and `jwt.util.ts` for authentication
- Add `rbac.util.ts` and `audit.util.ts` for access control

**Week 4**: Integration & Performance

- Complete integration with all shared components
- Add performance measurement utilities
- Comprehensive testing and optimization

---

## 🎯 **Utility Standards**

### **Function Signatures**

```typescript
// Standardized utility function patterns
type UtilityFunction<T, R> = (input: T, options?: UtilityOptions) => R;
type AsyncUtilityFunction<T, R> = (
  input: T,
  options?: UtilityOptions
) => Promise<R>;

interface UtilityOptions {
  tenantId?: TenantId;
  actorId?: ActorId;
  context?: Record<string, unknown>;
  validateInput?: boolean;
  throwOnError?: boolean;
}
```

### **Error Handling**

```typescript
// Standardized utility error handling
export class UtilityError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "UtilityError";
  }
}

// Utility-specific error types
export class ValidationUtilityError extends UtilityError {}
export class CryptoUtilityError extends UtilityError {}
export class DataTransformUtilityError extends UtilityError {}
```

### **Performance Standards**

```typescript
// Performance monitoring for utilities
export class UtilityPerformance {
  static measure<T>(
    operation: string,
    fn: () => T,
    options?: { logThreshold?: number }
  ): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (options?.logThreshold && duration > options.logThreshold) {
      console.warn(`Utility operation '${operation}' took ${duration}ms`);
    }

    return result;
  }

  static async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: { logThreshold?: number }
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (options?.logThreshold && duration > options.logThreshold) {
      console.warn(`Async utility operation '${operation}' took ${duration}ms`);
    }

    return result;
  }
}
```

---

## 🔍 **Testing Requirements**

### **Unit Tests**

- Pure function testing with predictable inputs/outputs
- Edge case testing for all utility functions
- Performance benchmarking for critical utilities
- Type safety validation through compilation

### **Property Tests**

- Property-based testing for mathematical utilities
- Fuzz testing for string and data transformation utilities
- Invariant testing for cryptographic utilities
- Round-trip testing for serialization utilities

### **Integration Tests**

- Cross-utility integration testing
- Performance testing under load
- Memory usage validation
- Thread safety testing for concurrent operations

---

## 📚 **Utility Documentation**

### **Function Documentation**

- JSDoc comments for all public functions
- Usage examples and common patterns
- Performance characteristics and complexity
- Type information and constraints

### **Cookbook**

- Common utility combinations and patterns
- Performance optimization guides
- Security best practices
- Error handling patterns

---

## 🎯 **Benefits of This Refactored Approach**

> **🏗️ Architectural Benefits:**
>
> ✅ **Proper Boundaries**: Only 13 transversal utilities in shared layer  
> ✅ **Pure Functions**: No side effects, predictable outputs, easy testing  
> ✅ **Foundation Focus**: Utilities provide data operations, not business logic  
> ✅ **Security Core**: Centralized cryptographic and RBAC utilities  
> ✅ **Performance**: Optimized algorithms with measurement capabilities  
> ✅ **Type Safety**: Runtime validation and compile-time type checking

This **refactored utility architecture** maintains enterprise-grade functionality while respecting proper architectural boundaries and providing pure, reusable functions for all feature modules.
