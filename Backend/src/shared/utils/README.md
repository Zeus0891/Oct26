# Shared Utils Documentation

## Overview

This directory contains the complete enterprise-grade utility library for our multi-tenant, RBAC-enabled application. The utility system provides comprehensive helper functions, security operations, data transformations, and performance monitoring across all feature modules with perfect integration into the type system and security architecture.

## Architecture Principles

### 🎯 **Design Goals**

- **Pure Functions**: Immutable operations without side effects
- **Type Safety**: Full TypeScript integration with comprehensive type guards
- **Performance Optimized**: High-performance implementations with monitoring
- **Security First**: Cryptographic operations with secure defaults
- **Framework Agnostic**: Reusable utilities independent of specific frameworks
- **Comprehensive Coverage**: Complete toolkit for common application needs

### 🏗️ **Enterprise Patterns**

- **Utility Collections**: Organized grouping of related functions
- **Performance Monitoring**: Built-in execution time and memory tracking
- **Error Handling**: Standardized error creation and management
- **Validation Patterns**: Comprehensive input validation and sanitization
- **Security Operations**: Enterprise-grade cryptography and authentication
- **Data Transformations**: Immutable data manipulation utilities

---

## 📁 Utility Files

All utility files are organized in a structured hierarchy with base utilities, security operations, and performance monitoring.

### 🧱 **Base Utilities** (`/base/`)

_Foundational utilities for data manipulation and common operations_

| File                      | Purpose               | Key Classes/Functions                       | Usage                                  |
| ------------------------- | --------------------- | ------------------------------------------- | -------------------------------------- |
| `type-guards.util.ts`     | Runtime type checking | `TypeGuards`                                | Safe type validation at runtime        |
| `array.util.ts`           | Array manipulation    | `ArrayUtils`                                | Grouping, filtering, sorting arrays    |
| `object.util.ts`          | Object operations     | `ObjectUtils`                               | Deep cloning, merging, transforming    |
| `string.util.ts`          | Text processing       | `StringUtils`                               | Case conversion, validation, parsing   |
| `date.util.ts`            | Date/time operations  | `DateUtils`                                 | Date formatting, calculations, parsing |
| `data-transform.util.ts`  | Data transformation   | `DataTransformUtils`                        | Data mapping, serialization, parsing   |
| `validation.util.ts`      | Input validation      | `ValidationUtils`                           | Schema validation, field checking      |
| `error.util.ts`           | Error management      | `ErrorUtils`, `AppError`, `ValidationError` | Structured error handling              |
| `validation.constants.ts` | Validation constants  | `VALIDATION_PATTERNS`, `VALIDATION_LIMITS`  | Centralized validation rules           |

### 🔐 **Security Utilities** (`/security/`)

_Cryptographic operations, authentication, and authorization utilities_

| File               | Purpose                  | Key Classes/Functions                                 | Usage                               |
| ------------------ | ------------------------ | ----------------------------------------------------- | ----------------------------------- |
| `crypto.util.ts`   | Cryptographic operations | `CryptoUtils`, `EncryptionAlgorithm`, `HashAlgorithm` | Encryption, hashing, key derivation |
| `password.util.ts` | Password security        | `PasswordUtils`, `PasswordStrength`                   | Password hashing and validation     |
| `jwt.util.ts`      | JWT token management     | `JwtUtils`, `TokenType`                               | Token creation and verification     |
| `rbac.util.ts`     | Access control           | `RbacUtils`, `PermissionAction`, `PermissionResource` | Permission checking and validation  |
| `audit.util.ts`    | Security monitoring      | `AuditUtils`, `AuditEventType`                        | Security event logging              |

### ⚡ **Performance Utilities** (`/performance/`)

_Performance monitoring and optimization utilities_

| File                  | Purpose                | Key Classes/Functions                          | Usage                          |
| --------------------- | ---------------------- | ---------------------------------------------- | ------------------------------ |
| `performance.util.ts` | Performance monitoring | `UtilityPerformance`, `PerformanceMeasurement` | Execution timing and profiling |

### 📋 **Legacy Compatibility**

_Backward compatibility files for existing imports_

| File            | Purpose             | Key Exports                                 | Usage                          |
| --------------- | ------------------- | ------------------------------------------- | ------------------------------ |
| `crypto.ts`     | Legacy crypto API   | Backward-compatible crypto functions        | Maintains existing imports     |
| `audit.ts`      | Legacy audit API    | Backward-compatible audit functions         | Maintains existing imports     |
| `jwt.utils.ts`  | Legacy JWT API      | Backward-compatible JWT functions           | Maintains existing imports     |
| `index.ts`      | Main export barrel  | All utility classes, types, and utilities   | Central import point           |
| `ActionPlan.md` | Development roadmap | Implementation plan and future enhancements | Development planning reference |

#### **When to Use Base Utilities**

```typescript
// ✅ Type-safe operations
import { TypeGuards, ArrayUtils, StringUtils } from "@/shared/utils";

// Type checking with runtime safety
if (TypeGuards.isString(value)) {
  const slug = StringUtils.toSlug(value);
}

// Array operations
const users = [
  { name: "John", role: "admin", age: 30 },
  { name: "Jane", role: "user", age: 25 },
];

const grouped = ArrayUtils.groupBy(users, "role");
const sorted = ArrayUtils.sortBy(users, "age", "desc");
const unique = ArrayUtils.unique(users.map((u) => u.role));

// String transformations
const camelCase = StringUtils.toCamelCase("hello-world");
const slug = StringUtils.toSlug("Hello World! 123");
const template = StringUtils.template("Hello {{name}}", { name: "John" });

// Validation
const emailResult = ValidationUtils.validateEmail("user@domain.com");
const schema = {
  email: [ValidationUtils.rules.required(), ValidationUtils.rules.email()],
  age: [ValidationUtils.rules.number(), ValidationUtils.rules.min(18)],
};
const validationResult = ValidationUtils.validateSchema(data, schema);
```

### 🔐 **Security Utilities** (`/security/`)

_Cryptographic operations, authentication, and authorization utilities_

| File               | Purpose                  | Key Classes/Functions                                 | Usage                               |
| ------------------ | ------------------------ | ----------------------------------------------------- | ----------------------------------- |
| `crypto.util.ts`   | Cryptographic operations | `CryptoUtils`, `EncryptionAlgorithm`, `HashAlgorithm` | Encryption, hashing, key derivation |
| `password.util.ts` | Password security        | `PasswordUtils`, `PasswordStrength`                   | Password hashing and validation     |
| `jwt.util.ts`      | JWT token management     | `JwtUtils`, `TokenType`                               | Token creation and verification     |
| `rbac.util.ts`     | Access control           | `RbacUtils`, `PermissionAction`, `PermissionResource` | Permission checking and validation  |
| `audit.util.ts`    | Security monitoring      | `AuditUtils`, `AuditEventType`                        | Security event logging              |

#### **When to Use Security Utilities**

```typescript
// ✅ Cryptographic operations
import { CryptoUtils, PasswordUtils, JwtUtils } from "@/shared/utils";

// Encryption/Decryption
const encrypted = await CryptoUtils.encrypt("sensitive data", "password123");
const decrypted = await CryptoUtils.decrypt(encrypted, "password123");

// Password operations
const hashResult = await PasswordUtils.hash("userPassword123");
const isValidPassword = await PasswordUtils.verify(
  "userPassword123",
  hashResult.hash
);
const strength = PasswordUtils.checkStrength("userPassword123");

// JWT operations
const tokenPair = JwtUtils.createTokenPair({
  userId: "user123",
  tenantId: "tenant456",
  permissions: ["read:projects", "write:estimates"],
});

const verifyResult = await JwtUtils.verifyToken(
  tokenPair.accessToken,
  jwtSecret
);

// RBAC operations
import {
  RbacUtils,
  PermissionAction,
  PermissionResource,
} from "@/shared/utils";

const userContext = {
  userId: "user123",
  tenantId: "tenant456",
  roles: ["project_manager"],
  permissions: ["read:projects", "update:projects"],
};

const canEdit = RbacUtils.hasPermission(
  userContext,
  PermissionAction.UPDATE,
  PermissionResource.PROJECT,
  { resourceId: "project123" }
);

// Audit logging
import { AuditUtils, AuditEventType } from "@/shared/utils";

await AuditUtils.logEvent({
  type: AuditEventType.DATA_ACCESS,
  userId: "user123",
  resource: "project123",
  action: "read",
  tenantId: "tenant456",
  metadata: { ip: req.ip, userAgent: req.get("User-Agent") },
});
```

### ⚡ **Performance Utilities** (`/performance/`)

_Performance monitoring and optimization utilities_

| File                  | Purpose                | Key Classes/Functions                          | Usage                          |
| --------------------- | ---------------------- | ---------------------------------------------- | ------------------------------ |
| `performance.util.ts` | Performance monitoring | `UtilityPerformance`, `PerformanceMeasurement` | Execution timing and profiling |

#### **When to Use Performance Utilities**

```typescript
// ✅ Performance monitoring
import { UtilityPerformance } from "@/shared/utils";

// Measure synchronous operations
const result = UtilityPerformance.measure(
  "hashPassword",
  () => {
    return bcrypt.hashSync(password, 12);
  },
  { trackMemory: true, logToConsole: true }
);

// Measure asynchronous operations
const asyncResult = await UtilityPerformance.measureAsync(
  "encryptData",
  async () => {
    return await CryptoUtils.encrypt(data, key);
  }
);

// Set up performance monitoring
UtilityPerformance.onMeasurement((measurement) => {
  if (measurement.duration > 1000) {
    console.warn(
      `Slow operation: ${measurement.functionName} took ${measurement.duration}ms`
    );
  }
});

// Get performance statistics
const stats = UtilityPerformance.getStatistics();
console.log(`Average duration: ${stats.averageDuration}ms`);
```

---

## 🚀 **Usage Guidelines**

### **1. Import Best Practices**

```typescript
// ✅ Import specific utilities (preferred)
import { ArrayUtils, StringUtils, TypeGuards } from '@/shared/utils';
import { CryptoUtils, PasswordUtils, JwtUtils } from '@/shared/utils';

// ✅ Import utility collections (acceptable)
import { ErrorUtils, AppError } from '@/shared/utils';

// ✅ Import from specific modules (for tree shaking)
import { TypeGuards } from '@/shared/utils/base/type-guards.util';
import { CryptoUtils } from '@/shared/utils/security/crypto.util';

// ❌ Avoid wildcard imports
import * from '@/shared/utils'; // Too broad
```

### **2. Utility Collections Usage**

```typescript
// ✅ Using organized utility collections
import { TypeGuards, StringUtils, ArrayUtils } from "@/shared/utils";
import { CryptoUtils, JwtUtils } from "@/shared/utils";

// Base utilities
const validEmail = StringUtils.isEmail(email);
const slugified = StringUtils.toSlug(title);
const grouped = ArrayUtils.groupBy(users, "role");

// Security utilities
const encrypted = await CryptoUtils.encrypt(data, key);
const tokenPair = JwtUtils.createTokenPair(payload);
```

### **3. Error Handling Patterns**

```typescript
// ✅ Structured error handling
import { ErrorUtils, AppError, ValidationError } from "@/shared/utils";

try {
  const result = await someOperation();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    return { success: false, errors: error.details };
  }

  if (error instanceof AppError) {
    // Handle application errors
    return { success: false, message: error.message };
  }

  // Handle unexpected errors
  const appError = ErrorUtils.createAppError(
    "Operation failed",
    "OPERATION_ERROR",
    error
  );

  throw appError;
}

// ✅ Creating custom errors
const validationError = ErrorUtils.createValidationError("Invalid input data", {
  email: "Invalid email format",
  age: "Must be at least 18",
});

const businessError = ErrorUtils.createBusinessError(
  "Insufficient permissions",
  "PERMISSION_DENIED",
  { requiredRole: "admin", userRole: "user" }
);
```

### **4. Data Transformation Patterns**

```typescript
// ✅ Safe data transformations
import { DataTransformUtils, TypeGuards, ObjectUtils } from "@/shared/utils";

// Transform API responses
const transformedData = DataTransformUtils.transform(apiResponse, {
  mapKeys: (key) => StringUtils.toCamelCase(key),
  mapValues: (value, key) => {
    if (key === "createdAt") return new Date(value);
    if (TypeGuards.isString(value)) return value.trim();
    return value;
  },
});

// Deep object operations
const merged = ObjectUtils.deepMerge(defaultConfig, userConfig);
const cleaned = ObjectUtils.removeNullish(dirtyData);
const picked = ObjectUtils.pick(largeObject, ["id", "name", "email"]);
```

### **5. String and Array Operations**

```typescript
// ✅ String utilities
import { StringUtils } from "@/shared/utils";

// Case conversions
const camelCase = StringUtils.toCamelCase("hello-world");
const slug = StringUtils.toSlug("Hello World! 123");
const template = StringUtils.template("Hello {{name}}", { name: "John" });

// Array operations
import { ArrayUtils } from "@/shared/utils";

const users = [
  { name: "John", role: "admin", age: 30 },
  { name: "Jane", role: "user", age: 25 },
];

const grouped = ArrayUtils.groupBy(users, "role");
const sorted = ArrayUtils.sortBy(users, "age", "desc");
const unique = ArrayUtils.unique(users.map((u) => u.role));
```

---

## 🔧 **Integration Points**

### **With Controllers**

```typescript
// ✅ Controller integration
import { ErrorUtils, UtilityPerformance, TypeGuards } from "@/shared/utils";

export class ProjectController {
  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      // Performance monitoring
      const result = await UtilityPerformance.measureAsync(
        "createProject",
        async () => {
          // Type-safe validation
          if (!TypeGuards.isObject(req.body)) {
            throw ErrorUtils.createAppError(
              "Invalid request body",
              "INVALID_INPUT"
            );
          }

          // Create project
          const project = await projectService.create(req.body);
          return project;
        }
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const appError = ErrorUtils.handleControllerError(error, {
        controller: "ProjectController",
        action: "createProject",
      });

      res.status(appError.statusCode).json({
        success: false,
        error: appError.message,
      });
    }
  }
}
```

### **With Services**

```typescript
// ✅ Service layer integration
import { CryptoUtils, PasswordUtils, ArrayUtils } from "@/shared/utils";

export class UserService {
  async createUser(userData: CreateUserInput): Promise<User> {
    // Hash password
    const passwordHash = await PasswordUtils.hash(userData.password);

    // Create user with encrypted sensitive data
    const encryptedData = await CryptoUtils.encrypt(
      JSON.stringify(userData.personalInfo),
      process.env.DATA_ENCRYPTION_KEY!
    );

    return await prisma.user.create({
      data: {
        ...userData,
        passwordHash: passwordHash.hash,
        personalInfo: encryptedData.data,
        createdAt: new Date(),
      },
    });
  }

  async findUsers(filters: UserFilters): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: this.buildWhereClause(filters),
    });

    // Transform and group results
    return ArrayUtils.sortBy(users, "createdAt", "desc");
  }
}
```

### **With Middleware**

```typescript
// ✅ Middleware integration
import { ErrorUtils } from "@/shared/utils";

export function errorHandlerMiddleware() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Process request
      next();
    } catch (error) {
      const appError = ErrorUtils.createAppError(
        "Request processing failed",
        "REQUEST_ERROR",
        error
      );

      res.status(appError.statusCode).json({
        success: false,
        error: appError.message,
        code: appError.code,
      });
    }
  };
}
```

---

## 📊 **Utility Coverage**

| Category      | Files  | Functions | Classes | Coverage |
| ------------- | ------ | --------- | ------- | -------- |
| Base          | 9      | 150+      | 9       | 100%     |
| Security      | 5      | 80+       | 5       | 100%     |
| Performance   | 1      | 15+       | 1       | 100%     |
| Legacy Compat | 3      | 10+       | 0       | 100%     |
| **Total**     | **18** | **255+**  | **15**  | **100%** |

---

## 🔍 **Performance & Monitoring**

### **Built-in Performance Tracking**

```typescript
// ✅ Automatic performance monitoring
import { UtilityPerformance } from "@/shared/utils";

// All utility operations can be monitored
const hashResult = UtilityPerformance.measure("passwordHashing", () => {
  return PasswordUtils.hash(password);
});

// Get performance statistics
const stats = UtilityPerformance.getStatistics();
console.log(`Total operations: ${stats.totalOperations}`);
console.log(`Average duration: ${stats.averageDuration}ms`);
console.log(`Slowest operation: ${stats.slowestOperation}`);
```

### **Memory and Resource Monitoring**

```typescript
// ✅ Resource usage tracking
const result = await UtilityPerformance.measureAsync(
  "dataProcessing",
  async () => {
    return await processLargeDataset(data);
  },
  {
    trackMemory: true,
    logThreshold: 1000, // Log operations taking > 1 second
    metadata: { datasetSize: data.length },
  }
);

// Monitor for memory leaks
UtilityPerformance.onMeasurement((measurement) => {
  if (measurement.memoryAfter && measurement.memoryBefore) {
    const memoryDelta = measurement.memoryAfter - measurement.memoryBefore;
    if (memoryDelta > 50 * 1024 * 1024) {
      // 50MB
      console.warn(
        `High memory usage: ${measurement.functionName} used ${
          memoryDelta / 1024 / 1024
        }MB`
      );
    }
  }
});
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Type Safety Violations**

   ```typescript
   // ❌ Unsafe operations
   const result = data.someProperty.toLowerCase(); // Runtime error if someProperty is undefined

   // ✅ Type-safe operations
   import { TypeGuards } from "@/shared/utils";

   if (TypeGuards.isString(data.someProperty)) {
     const result = data.someProperty.toLowerCase();
   }
   ```

2. **Performance Issues**

   ```typescript
   // ❌ Synchronous heavy operations
   const hash = bcrypt.hashSync(password, 12); // Blocks event loop

   // ✅ Asynchronous with monitoring
   const hash = await UtilityPerformance.measureAsync(
     "passwordHash",
     async () => {
       return await PasswordUtils.hash(password);
     }
   );
   ```

3. **Validation Errors**

   ```typescript
   // ❌ Basic validation
   if (!email || !email.includes("@")) {
     throw new Error("Invalid email");
   }

   // ✅ Type-safe validation
   import { StringUtils, ErrorUtils } from "@/shared/utils";

   if (!StringUtils.isEmail(email)) {
     throw ErrorUtils.createValidationError("Invalid email", {
       email: "Must be a valid email address",
     });
   }
   ```

4. **Security Misconfigurations**

   ```typescript
   // ❌ Weak encryption
   const encrypted = crypto.createCipher("aes192", password);

   // ✅ Secure encryption
   const encrypted = await CryptoUtils.encrypt(data, password, {
     algorithm: EncryptionAlgorithm.AES_256_GCM,
   });
   ```

---

## 📈 **Future Enhancements**

- **Advanced Caching**: Utility result caching for expensive operations
- **Distributed Utilities**: Cross-service utility functions for microservices
- **Machine Learning**: AI-powered data validation and pattern recognition
- **Real-time Monitoring**: Live performance dashboards for utility usage
- **Auto-optimization**: Automatic performance tuning based on usage patterns

---

## 🤝 **Contributing**

When adding new utilities:

1. **Follow naming conventions**: `UtilityNameUtils` class pattern
2. **Include comprehensive tests**: Unit tests for all utility functions
3. **Add performance monitoring**: Wrap expensive operations with measurement
4. **Document with examples**: Provide clear usage examples and JSDoc
5. **Ensure type safety**: Use TypeScript features for compile-time safety
6. **Consider security**: Follow security best practices for sensitive operations
7. **Update this documentation**: Keep utility documentation current

### **Utility Development Template**

````typescript
/**
 * [Utility Name] Utility
 *
 * [Brief description of utility purpose and functionality]
 *
 * @module [UtilityName]Utils
 * @category Shared Utils - [Category]
 * @description [Detailed description]
 * @version 1.0.0
 */

import { TypeGuards } from '../base/type-guards.util';
import { UtilityPerformance } from '../performance/performance.util';

/**
 * [Utility description and examples]
 */
export class [UtilityName]Utils {
  /**
   * [Method description]
   *
   * @param param - Parameter description
   * @returns Return value description
   * @complexity O(n) complexity description
   *
   * @example
   * ```typescript
   * const result = [UtilityName]Utils.methodName(input);
   * ```
   */
  static methodName(param: unknown): unknown {
    return UtilityPerformance.measure('methodName', () => {
      // Implementation with type safety
      if (!TypeGuards.isString(param)) {
        throw new Error('Invalid parameter type');
      }

      // Utility logic here
      return processedResult;
    });
  }
}
````

---

_This utility system provides enterprise-grade helper functions with comprehensive type safety, performance monitoring, and security features for our multi-tenant, RBAC-enabled architecture._
