# ✅ **Shared Validators Action Plan** (Refactored)

## Overview

This action plan defines the implementation of **transversal validators only** - validation patterns used across all domains without business-specific logic. Domain-specific validators (finance, workflow, integration) belong in their respective feature modules.

**🎯 Key Change:** Reduced from 24 validators to 8 transversal validators, following architectural principles of the shared layer.

## Architecture Principles

### 🎯 **Design Goals**

- **Transversal Only**: Authentication, RBAC, and cross-domain patterns only
- **Foundation Layer**: Base classes and utilities for feature module validators
- **Type Safety**: Perfect alignment with shared types and Prisma schema
- **RBAC Integration**: Permission-aware validation rules
- **Multi-Tenant Validation**: Tenant-scoped data integrity checks
- **Reusability**: Core validation patterns inherited by all modules

### 🏗️ **Validation Patterns**

- **Base Validator Classes**: Abstract classes with common validation patterns
- **DTO Validation**: Generic DTO validation utilities
- **Business Rule Engine**: Rule application interface (engine moved to utils)
- **Cross-Field Validation**: Complex validation across multiple fields
- **Async Validation**: Database-dependent validation utilities

---

## 📁 Transversal Validators (8 files maximum)

### 🧱 **Core Validators**

_Foundational validation patterns used across ALL domains_

| File                         | Purpose                            | Key Methods                                                    | Validation Scope                   |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| `base.validator.ts`          | Abstract base validator class      | `validate()`, `validateCreate()`, `validateUpdate()`           | Entity validation foundation       |
| `dto.validator.ts`           | Generic DTO validation utilities   | `validateDto()`, `transformDto()`, `sanitizeDto()`             | Request validation patterns        |
| `async.validator.ts`         | Database validation utilities      | `validateUnique()`, `validateExists()`, `validateForeignKey()` | DB integrity checks                |
| `business-rule.validator.ts` | Business rule validation interface | `validateRules()`, `applyRules()`, `evaluateCondition()`       | Rule application (engine in utils) |
| `cross-field.validator.ts`   | Multi-field validation patterns    | `validateRelationships()`, `checkDependencies()`               | Complex cross-field validation     |

### 🔐 **Security Validators**

_Authentication and RBAC validation (transversal)_

| File                      | Purpose                        | Key Methods                                       | Validation Scope |
| ------------------------- | ------------------------------ | ------------------------------------------------- | ---------------- |
| `auth.validator.ts`       | Authentication data validation | `validateCredentials()`, `validateLoginRequest()` | Login/auth flows |
| `role.validator.ts`       | RBAC role validation           | `validateRoleAssignment()`, `validateHierarchy()` | Role management  |
| `permission.validator.ts` | Permission validation          | `validatePermissionGrant()`, `validateScope()`    | Access control   |

---

## � **What's NOT in Shared Validators**

### **Moved to Feature Modules:**

| Category              | Files to Move                                                                                                             | Destination                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Finance**           | `money.validator.ts`, `tax.validator.ts`, `accounting.validator.ts`, `invoice.validator.ts`, `payment.validator.ts`       | `src/features/finance/validators/`     |
| **Workflow**          | `approval.validator.ts`, `status.validator.ts`, `task.validator.ts`, `document.validator.ts`, `notification.validator.ts` | `src/features/workflow/validators/`    |
| **Integration**       | `webhook.validator.ts`, `sync.validator.ts`, `api.validator.ts`, `external.validator.ts`                                  | `src/features/integration/validators/` |
| **Advanced Security** | `session.validator.ts`, `password.validator.ts`                                                                           | `src/features/identity/validators/`    |

**Reason:** These validators contain domain-specific business logic and dependencies that violate the shared layer principles.

---

## 🎯 **Implementation Requirements**

### **1. Base Validator Pattern (Simplified)**

```typescript
// Abstract base validator with core patterns only
export abstract class BaseValidator<T extends BaseEntity> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly businessRuleEngine: BusinessRuleEngine // from utils
  ) {}

  abstract schema: ZodSchema<T>;

  // Core validation method using Zod
  validate(data: unknown, ctx?: RequestContext): ValidationResult<T> {
    try {
      const result = this.schema.safeParse(data);

      if (!result.success) {
        throw new ValidationError({
          code: "SCHEMA_VALIDATION_FAILED",
          message: "Input validation failed",
          details: result.error.errors,
        });
      }

      return {
        success: true,
        data: result.data,
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [this.formatValidationError(error)],
      };
    }
  }

  // Common validation methods
  async validateCreate(
    data: CreateInput<T>,
    ctx: RequestContext
  ): Promise<ValidationResult<T>> {
    // Apply base validation + business rules
    const baseResult = this.validate(data, ctx);
    if (!baseResult.success) return baseResult;

    return await this.applyBusinessRules(baseResult.data, "CREATE", ctx);
  }

  async validateUpdate(
    id: EntityId,
    data: UpdateInput<T>,
    ctx: RequestContext
  ): Promise<ValidationResult<T>> {
    // Check if entity exists first
    const exists = await this.entityExists(id, ctx);
    if (!exists) {
      return {
        success: false,
        errors: [
          {
            field: "id",
            code: "ENTITY_NOT_FOUND",
            message: "Entity not found",
          },
        ],
      };
    }

    const baseResult = this.validate(data, ctx);
    if (!baseResult.success) return baseResult;

    return await this.applyBusinessRules(baseResult.data, "UPDATE", ctx);
  }

  // Helper methods
  protected async entityExists(
    id: EntityId,
    ctx: RequestContext
  ): Promise<boolean> {
    // Implemented by concrete validators
    return true;
  }

  protected async applyBusinessRules(
    data: T,
    action: "CREATE" | "UPDATE" | "DELETE",
    ctx: RequestContext
  ): Promise<ValidationResult<T>> {
    // Delegate to business rule engine (from utils)
    return await this.businessRuleEngine.validate(data, action, ctx);
  }

  protected formatValidationError(error: unknown): ValidationError {
    // Standardized error formatting
    return {
      field: "unknown",
      code: "VALIDATION_ERROR",
      message: String(error),
      value: undefined,
    };
  }
}
```

### **2. DTO Validation (Generic)**

```typescript
// Generic DTO validation utilities
export class DtoValidator {
  // Generic DTO validation with Zod schemas
  static validate<T>(
    schema: ZodSchema<T>,
    data: unknown,
    options?: ValidationOptions
  ): ValidationResult<T> {
    try {
      const result = schema.safeParse(data);

      if (!result.success) {
        return {
          success: false,
          errors: result.error.errors.map((err) => ({
            field: err.path.join("."),
            code: err.code,
            message: err.message,
            value: err.input,
          })),
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "unknown",
            code: "VALIDATION_FAILED",
            message: String(error),
          },
        ],
      };
    }
  }

  // Transform DTO (camelCase <-> snake_case)
  static transformDto<T extends Record<string, unknown>>(
    dto: T,
    direction: "camelToSnake" | "snakeToCamel"
  ): T {
    // Use transformation utilities from shared/utils
    return direction === "camelToSnake"
      ? DataTransformUtils.camelToSnake(dto)
      : DataTransformUtils.snakeToCamel(dto);
  }

  // Sanitize DTO (remove undefined, null, empty strings)
  static sanitizeDto<T extends Record<string, unknown>>(dto: T): Partial<T> {
    const sanitized: Partial<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== null && value !== "") {
        sanitized[key as keyof T] = value;
      }
    }

    return sanitized;
  }
}
```

### **3. Business Rule Validation**

```typescript
// Business rule engine
export class BusinessRuleEngine {
  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(
    rule: BusinessRule,
    entity: any,
    ctx: RequestContext
  ): Promise<boolean> {
    switch (rule.type) {
      case "REQUIRED_FIELD":
        return this.validateRequiredField(rule, entity);

      case "UNIQUE_CONSTRAINT":
        return await this.validateUniqueConstraint(rule, entity, ctx);

      case "RANGE_CONSTRAINT":
        return this.validateRangeConstraint(rule, entity);

      case "PERMISSION_CONSTRAINT":
        return await this.validatePermissionConstraint(rule, entity, ctx);

      case "CUSTOM_RULE":
        return await this.evaluateCustomRule(rule, entity, ctx);

      default:
        throw new UnsupportedBusinessRuleError(rule.type);
    }
  }

  private async validateUniqueConstraint(
    rule: BusinessRule,
    entity: any,
    ctx: RequestContext
  ): Promise<boolean> {
    const existingEntity = await withTenantRLS(ctx.tenantId, async (tx) => {
      return await tx[rule.table].findFirst({
        where: {
          [rule.field]: entity[rule.field],
          id: { not: entity.id }, // Exclude current entity for updates
        },
      });
    });

    return existingEntity === null;
  }

  private async validatePermissionConstraint(
    rule: BusinessRule,
    entity: any,
    ctx: RequestContext
  ): Promise<boolean> {
    // Check if user has required permission for this operation
    return await this.rbacService.hasPermission(
      ctx.actor,
      rule.requiredPermission,
      rule.resourceType,
      entity.id
    );
  }
}
```

### **4. Cross-Field Validation**

```typescript
// Complex validation across multiple fields
export class CrossFieldValidator {
  @ValidateBy({
    name: "isDateRangeValid",
    validator: {
      validate(value: any, args: ValidationArguments): boolean {
        const object = args.object as any;
        const startDate = object.startDate;
        const endDate = object.endDate;

        if (!startDate || !endDate) return true; // Let individual field validation handle required checks

        return new Date(startDate) < new Date(endDate);
      },
      defaultMessage(): string {
        return "End date must be after start date";
      },
    },
  })
  static validateDateRange(target: any, propertyKey: string) {
    // Decorator for date range validation
  }

  @ValidateBy({
    name: "isBudgetConsistent",
    validator: {
      validate(value: any, args: ValidationArguments): boolean {
        const object = args.object as any;
        const totalBudget = object.totalBudget;
        const allocatedBudget =
          object.lineItems?.reduce(
            (sum: number, item: any) => sum + item.amount,
            0
          ) || 0;

        return allocatedBudget <= totalBudget;
      },
      defaultMessage(): string {
        return "Allocated budget cannot exceed total budget";
      },
    },
  })
  static validateBudgetConsistency(target: any, propertyKey: string) {
    // Decorator for budget consistency validation
  }
}
```

---

## 🔧 **Integration Points**

### **With Shared Types**

- All validators use shared type definitions for input/output
- Perfect alignment with Prisma schema enums and types
- Type-safe validation with compile-time checking
- Consistent error response formats using `ApiError`

### **With Shared Services**

- Validators integrate with service layer for database validation
- Business rule validation uses service-layer business logic
- Permission validation integrates with RBAC service
- Audit logging for validation failures and security events

### **With Controllers**

- DTO validation at controller layer before service calls
- Standardized validation error responses
- Automatic validation through middleware and decorators
- Integration with global exception filters

### **With RBAC System**

- Permission-based validation rules
- Role-aware business rule evaluation
- Assignment scope validation for resource access
- Integration with authentication context

---

## 📊 **Validator Dependencies**

| Validator               | Depends On                                  | Provides To            | Scope              |
| ----------------------- | ------------------------------------------- | ---------------------- | ------------------ |
| **BaseValidator**       | Business Rule Engine (utils), Prisma Client | All Feature Validators | Foundation pattern |
| **DtoValidator**        | Zod, Data Transform Utils                   | All Controllers        | Request validation |
| **AsyncValidator**      | Prisma Client, RLS Utils                    | All Validators         | DB validation      |
| **AuthValidator**       | BaseValidator, Auth Types                   | Authentication System  | Login validation   |
| **RoleValidator**       | BaseValidator, RBAC Types                   | RBAC System            | Role management    |
| **PermissionValidator** | BaseValidator, Security Types               | Authorization System   | Permission checks  |

---

## 🚀 **Implementation Phases**

### **Phase 1: Foundation** (Priority: Critical)

1. **BaseValidator**: Abstract base class with Zod integration
2. **DtoValidator**: Generic DTO validation utilities
3. **AsyncValidator**: Database validation utilities

### **Phase 2: Security** (Priority: High)

1. **AuthValidator**: Login and authentication validation
2. **RoleValidator**: RBAC role assignment validation
3. **PermissionValidator**: Permission grant validation

### **Phase 3: Advanced** (Priority: Medium)

1. **BusinessRuleValidator**: Rule application interface
2. **CrossFieldValidator**: Complex multi-field validation
3. **Integration**: Feature module validator examples

---

## 🎯 **Final Structure**

```
shared/validators/
├── base.validator.ts           # Abstract base class
├── dto.validator.ts            # Generic DTO validation
├── async.validator.ts          # Database validation utilities
├── business-rule.validator.ts  # Rule application interface
├── cross-field.validator.ts    # Multi-field validation
├── auth.validator.ts          # Authentication validation
├── role.validator.ts          # RBAC role validation
├── permission.validator.ts    # Permission validation
└── index.ts                   # Barrel exports
```

**Total: 8 transversal validators + 1 index = 9 files**

---

## 📚 **Feature Module Integration**

### **Example: Finance Module Validators**

```typescript
// src/features/finance/validators/invoice.validator.ts
export class InvoiceValidator extends BaseValidator<Invoice> {
  schema = z.object({
    // Invoice-specific schema
    number: z.string().min(1),
    amount: z.number().positive(),
    currency: z.nativeEnum(CurrencyCode),
    // ... other invoice fields
  });

  async validateInvoiceBusinessRules(
    invoice: Invoice,
    ctx: RequestContext
  ): Promise<ValidationResult<Invoice>> {
    // Finance-specific business rules
    // Uses shared BaseValidator foundation
    return await this.applyBusinessRules(invoice, "CREATE", ctx);
  }
}
```

---

## ✅ **Benefits of This Approach**

| Benefit                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| **🎯 Focused Scope**    | Only 8 transversal validators instead of 24 |
| **🧱 Clear Separation** | Shared foundation vs domain-specific logic  |
| **📈 Maintainability**  | Each module owns its validation rules       |
| **🔄 Reusability**      | BaseValidator pattern used everywhere       |
| **⚡ Performance**      | Lighter shared layer, faster builds         |
| **🧠 Clarity**          | Clear architectural boundaries              |

---

## 🎯 **Validation Standards**

### **Error Response Format**

```typescript
// Standardized validation error response
interface ValidationErrorResponse {
  success: false;
  error: {
    code: "VALIDATION_FAILED";
    message: string;
    details: ValidationError[];
  };
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, unknown>;
}
```

### **Business Rule Definition**

```typescript
// Business rule configuration
interface BusinessRule {
  id: string;
  name: string;
  type: BusinessRuleType;
  field: string;
  table?: string;
  condition: RuleCondition;
  errorCode: string;
  errorMessage: string;
  severity: "ERROR" | "WARNING" | "INFO";
  isActive: boolean;
  tenantId?: TenantId;
}

enum BusinessRuleType {
  REQUIRED_FIELD = "REQUIRED_FIELD",
  UNIQUE_CONSTRAINT = "UNIQUE_CONSTRAINT",
  RANGE_CONSTRAINT = "RANGE_CONSTRAINT",
  PERMISSION_CONSTRAINT = "PERMISSION_CONSTRAINT",
  CUSTOM_RULE = "CUSTOM_RULE",
}
```

### **Validation Pipeline**

```typescript
// Validation execution order
const validationPipeline = [
  "syntaxValidation", // Basic type and format validation
  "semanticValidation", // Business rule validation
  "securityValidation", // Permission and security validation
  "integrityValidation", // Data integrity and consistency
  "businessValidation", // Custom business logic validation
];
```

---

## 🔍 **Testing Requirements**

### **Unit Tests**

- Individual validator method testing
- Business rule evaluation testing
- DTO validation testing
- Error message validation

### **Integration Tests**

- End-to-end validation pipeline testing
- Database validation testing
- Permission validation testing
- Cross-field validation testing

### **Performance Tests**

- Validation performance benchmarks
- Complex rule evaluation optimization
- Database query optimization for async validation
- Memory usage validation for large datasets

---

## � **Implementation Roadmap**

**Week 1**: Core Foundation

- Implement BaseValidator with business rule integration
- Create DtoValidator with Zod integration
- Set up AsyncValidator with RLS support

**Week 2**: Security & Authorization

- Implement AuthValidator with JWT/session validation
- Create RoleValidator with RBAC integration
- Implement PermissionValidator with dynamic checks

**Week 3**: Advanced Features

- Add BusinessRuleValidator with rule engine
- Implement CrossFieldValidator for complex scenarios
- Create comprehensive testing suite

**Week 4**: Integration & Optimization

- Performance testing and optimization
- Integration with all shared components
- Documentation and developer guides

---

> **🎯 Architectural Benefits of This Refactored Approach:**
>
> ✅ **Proper Separation**: Transversal validators in shared, domain validators in features  
> ✅ **Reduced Complexity**: 8 focused files vs 24 over-engineered ones  
> ✅ **Clear Boundaries**: Shared layer focuses only on cross-cutting concerns  
> ✅ **Maintainable**: Each validator has single responsibility  
> ✅ **Scalable**: Feature modules handle their own domain validation

This **refactored validator architecture** maintains enterprise-grade validation capabilities while respecting proper architectural boundaries and avoiding over-engineering.
