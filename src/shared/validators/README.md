# Shared Validators Documentation

## Overview

This directory contains the complete enterprise-grade validation system for our multi-tenant, RBAC-enabled application. The validation system provides comprehensive data validation, business rule enforcement, and security validation across all feature modules with perfect integration into the RLS, audit, and security architecture.

## Architecture Principles

### 🎯 **Design Goals**

- **Type Safety**: Full TypeScript integration with runtime validation
- **Framework Integration**: Seamless Zod schema integration with custom extensions
- **Multi-Tenant Aware**: All validators support tenant-scoped validation
- **RLS Compatible**: Validation execution within RLS context boundaries
- **Audit Integration**: Comprehensive validation tracking for compliance
- **Performance Optimized**: Async validation with timing metrics and monitoring

### 🏗️ **Enterprise Patterns**

- **Layered Validation**: Synchronous → Asynchronous → Business Rules
- **Context Awareness**: Rich validation context with tenant and actor information
- **Error Standardization**: Consistent error format across all validators
- **Extensible Architecture**: Base classes for domain-specific validation extensions
- **Security First**: Authentication and authorization validation built-in

---

## 📁 Validator Files

All validator files are located in the `/shared/validators/` directory with a flat structure for easy access and maintenance.

### 🧱 **Core Foundation**

_Base validator classes and essential infrastructure_

| File                   | Purpose                         | Key Classes/Exports                                        | Usage                                    |
| ---------------------- | ------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `validation.types.ts`  | Type definitions and interfaces | `ValidationResult`, `ValidationIssue`, `ValidationContext` | Foundation types for all validators      |
| `base.validator.ts`    | Abstract base validator class   | `BaseValidator<T>`                                         | Extend for all domain validators         |
| `async.validator.ts`   | Asynchronous validation base    | `AsyncValidator<T>`                                        | Database and external service validation |
| `validation.utils.ts`  | Shared validation utilities     | Helper functions for common validations                    | Reusable validation logic                |
| `common.validators.ts` | Common validation schemas       | `UuidV7Schema`, `EmailSchema`, `PasswordSchema`            | Reusable Zod schemas                     |

#### **When to Use Core Foundation**

```typescript
// ✅ Extending base validator for domain models
class ProjectValidator extends BaseValidator<Project> {
  schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  });
}

// ✅ Async validation for uniqueness checks
class EmailUniquenessValidator extends AsyncValidator<{ email: string }> {
  async performAsyncValidation(
    data: { email: string },
    context: ValidationContext
  ) {
    // Check email uniqueness in database
    return await this.checkEmailExists(data.email, context);
  }
}

// ✅ Using validation utilities
import {
  isUUID,
  validatePasswordStrength,
} from "@/shared/validators/validation.utils";

const isValidId = isUUID(userId);
const passwordCheck = validatePasswordStrength(password);
```

### 🔍 **Request Validation**

_API request and data transfer object validation_

| File               | Purpose                | Key Classes/Exports                                 | Usage                       |
| ------------------ | ---------------------- | --------------------------------------------------- | --------------------------- |
| `dto.validator.ts` | API request validation | `DTOValidator`, `DTOSchemas`, `CommonDTOValidators` | Controller input validation |

#### **When to Use Request Validation**

```typescript
// ✅ API endpoint validation
import { DTOValidator, DTOSchemas } from "@/shared/validators";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  managerId: DTOSchemas.uuid,
  startDate: DTOSchemas.isoDate,
  budget: z.number().positive(),
});

class ProjectController {
  async createProject(req: Request, res: Response) {
    const validator = new DTOValidator(createProjectSchema);
    const result = validator.validate(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.errors });
    }

    // Process validated data
    const project = await projectService.create(result.data);
    res.json(project);
  }
}
```

### 🔐 **Security Validation**

_Authentication, authorization, and security validation_

| File                      | Purpose                   | Key Classes/Exports                                               | Usage                                 |
| ------------------------- | ------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| `auth.validator.ts`       | Authentication validation | `AuthSchemas`, `LoginCredentialsValidator`, `MFAValidator`        | Login, registration, token validation |
| `role.validator.ts`       | RBAC role validation      | `RoleSchemas`, `RoleCreationValidator`, `RoleAssignmentValidator` | Role management operations            |
| `permission.validator.ts` | Permission validation     | `PermissionSchemas`, `PermissionAssignmentValidator`              | Permission assignment and inheritance |

#### **When to Use Security Validation**

```typescript
// ✅ Authentication validation
import { LoginCredentialsValidator, AuthSchemas } from "@/shared/validators";

const loginValidator = new LoginCredentialsValidator();
const result = await loginValidator.validateAsync(loginData, context);

// ✅ Role assignment validation
import { RoleAssignmentValidator } from "@/shared/validators";

const roleValidator = new RoleAssignmentValidator();
const assignmentResult = await roleValidator.validateRoleAssignment(
  {
    memberId: "user-123",
    roleId: "role-456",
    tenantId: context.tenantId,
  },
  context
);

// ✅ Permission validation
import { PermissionAssignmentValidator } from "@/shared/validators";

const permissionValidator = new PermissionAssignmentValidator();
const permissionResult = await permissionValidator.validatePermissionGrant(
  {
    targetId: "user-123",
    permissionId: "permission-789",
    scope: "TENANT",
  },
  context
);
```

### 💼 **Business Logic Validation**

_Complex business rules and multi-field validation_

| File                         | Purpose                           | Key Classes/Exports                                            | Usage                                    |
| ---------------------------- | --------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `business-rule.validator.ts` | Business logic enforcement        | `BusinessRuleValidator`, `BusinessRule`, `BusinessRuleContext` | Complex business rule validation         |
| `cross-field.validator.ts`   | Multi-field dependency validation | `CrossFieldValidator`, `CrossFieldRule`                        | Field relationship and dependency checks |

### 📋 **Additional Utilities**

_Supporting files and utilities_

| File            | Purpose             | Key Exports                                 | Usage                          |
| --------------- | ------------------- | ------------------------------------------- | ------------------------------ |
| `index.ts`      | Main export barrel  | All validator classes, types, and utilities | Central import point           |
| `ActionPlan.md` | Development roadmap | Implementation plan and future enhancements | Development planning reference |

#### **When to Use Business Logic Validation**

```typescript
// ✅ Business rule validation
import { BusinessRuleValidator } from "@/shared/validators";

class EstimateBusinessRuleValidator extends BusinessRuleValidator<EstimateData> {
  protected getBusinessRules(): BusinessRule[] {
    return [
      {
        id: "approval-threshold",
        name: "Approval Threshold Check",
        condition: (data, context) => data.totalAmount > 50000,
        severity: "BLOCKING",
        message: "Estimates over $50,000 require approval",
        code: "APPROVAL_REQUIRED",
      },
    ];
  }
}

// ✅ Cross-field validation
import { CrossFieldValidator } from "@/shared/validators";

class ProjectDateValidator extends CrossFieldValidator<ProjectData> {
  protected getCrossFieldRules(): CrossFieldRule[] {
    return [
      {
        fields: ["startDate", "endDate"],
        validator: (data) => new Date(data.startDate) < new Date(data.endDate),
        message: "Start date must be before end date",
      },
    ];
  }
}
```

---

## 🚀 **Usage Guidelines**

### **1. Import Best Practices**

```typescript
// ✅ Import specific validators (preferred)
import { BaseValidator, AsyncValidator } from '@/shared/validators';
import { DTOValidator, AuthSchemas } from '@/shared/validators';

// ✅ Import from main index (acceptable)
import { ValidationFactory, ValidationResult } from '@/shared/validators';

// ❌ Avoid wildcard imports
import * from '@/shared/validators'; // Too broad
```

### **2. Validation Context Usage**

```typescript
// ✅ Always provide validation context
const context: ValidationContext = {
  tenantId: req.tenant?.id,
  actorId: req.user?.id,
  entity: "Project",
  entityId: projectId,
  correlationId: req.correlationId,
  timestamp: new Date(),
};

const result = await validator.validateWithRLS(data, context);
```

### **3. Error Handling Patterns**

```typescript
// ✅ Type-safe error handling
import { ValidationResult } from "@/shared/validators";

const result = await validator.validateAsync(data, context);

if (!result.success) {
  // Handle validation errors
  const errors = result.errors.map((error) => ({
    field: error.field,
    message: error.message,
    code: error.code,
  }));

  return res.status(400).json({ errors });
}

// Proceed with validated data
const validatedData = result.data;
```

### **4. Custom Validator Creation**

```typescript
// ✅ Domain-specific validator
class InvoiceValidator extends BaseValidator<Invoice> {
  schema = z.object({
    customerId: DTOSchemas.uuid,
    amount: z.number().positive(),
    currency: DTOSchemas.currencyCode,
    dueDate: DTOSchemas.isoDate,
    lineItems: z.array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
      })
    ),
  });

  validateForCreate(
    data: unknown,
    context?: ValidationContext
  ): ValidationResult<Invoice> {
    // Custom creation validation logic
    const baseResult = super.validateForCreate(data, context);
    if (!baseResult.success) return baseResult;

    // Additional business logic validation
    return this.validateInvoiceBusinessRules(baseResult.data, context);
  }

  private validateInvoiceBusinessRules(
    invoice: Invoice,
    context?: ValidationContext
  ): ValidationResult<Invoice> {
    const issues: ValidationIssue[] = [];

    // Custom business rule: Invoice total must match line items
    const lineItemTotal = invoice.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    if (Math.abs(invoice.amount - lineItemTotal) > 0.01) {
      issues.push({
        field: "amount",
        message: "Invoice amount must match sum of line items",
        code: "AMOUNT_MISMATCH",
        severity: "ERROR",
        context,
      });
    }

    return issues.length > 0
      ? { success: false, errors: issues, context }
      : { success: true, data: invoice, context };
  }
}
```

### **5. Async Validation with RLS**

```typescript
// ✅ RLS-aware async validation
class TenantResourceValidator extends AsyncValidator<ResourceData> {
  schema = z.object({
    name: z.string().min(1),
    ownerId: DTOSchemas.uuid,
  });

  async performAsyncValidation(
    data: ResourceData,
    context: ValidationContext
  ): Promise<ValidationResult<ResourceData>> {
    if (!context.tenantId) {
      return {
        success: false,
        errors: [
          {
            field: "tenantId",
            message: "Tenant context required",
            code: "TENANT_CONTEXT_MISSING",
            severity: "ERROR",
            context,
          },
        ],
        context,
      };
    }

    // Validate within RLS context
    return await withTenantRLS(
      context.tenantId,
      [],
      async () => {
        // Check if owner exists and belongs to tenant
        const owner = await prisma.member.findUnique({
          where: { id: data.ownerId },
        });

        if (!owner) {
          return {
            success: false,
            errors: [
              {
                field: "ownerId",
                message: "Owner not found",
                code: "INVALID_OWNER",
                severity: "ERROR",
                context,
              },
            ],
            context,
          };
        }

        return { success: true, data, context };
      },
      context.actorId
    );
  }
}
```

---

## 🔧 **Integration Points**

### **With Controllers**

```typescript
// ✅ Controller integration
export class EstimateController {
  private estimateValidator = new EstimateValidator();
  private businessRuleValidator = new EstimateBusinessRuleValidator();

  async createEstimate(req: AuthenticatedRequest, res: Response) {
    const context = this.createValidationContext(req);

    // 1. Basic structure validation
    const dtoResult = this.estimateValidator.validate(req.body, context);
    if (!dtoResult.success) {
      return res.status(400).json({ errors: dtoResult.errors });
    }

    // 2. Business rule validation
    const businessResult = await this.businessRuleValidator.validateAsync(
      dtoResult.data,
      context
    );
    if (!businessResult.success) {
      return res.status(422).json({ errors: businessResult.errors });
    }

    // 3. Process validated data
    const estimate = await estimateService.create(businessResult.data, context);
    res.status(201).json(estimate);
  }
}
```

### **With Services**

```typescript
// ✅ Service layer validation
export class EstimateService {
  private validator = new EstimateValidator();

  async create(
    data: CreateEstimateInput,
    context: RequestContext
  ): Promise<Estimate> {
    // Validate at service boundary
    const validationResult = await this.validator.validateWithRLS(data, {
      tenantId: context.tenantId,
      actorId: context.actorId,
      entity: "Estimate",
      correlationId: context.correlationId,
    });

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid estimate data",
        validationResult.errors
      );
    }

    // Proceed with database operation
    return await withTenantRLS(
      context.tenantId,
      [],
      async (tx) => {
        return await tx.estimate.create({
          data: validationResult.data,
        });
      },
      context.actorId
    );
  }
}
```

### **With Middleware**

```typescript
// ✅ Validation middleware
export function validateRequest<T>(validator: BaseValidator<T>) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const context: ValidationContext = {
      tenantId: req.tenant?.id,
      actorId: req.user?.id,
      correlationId: req.correlationId,
      timestamp: new Date(),
    };

    const result = validator.validate(req.body, context);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.errors,
        context: result.context,
      });
    }

    // Attach validated data to request
    req.validatedData = result.data;
    next();
  };
}

// Usage in routes
router.post(
  "/estimates",
  validateRequest(new EstimateValidator()),
  estimateController.createEstimate
);
```

---

## 📊 **Validator Coverage**

| Category           | Files  | Classes/Exports | Coverage |
| ------------------ | ------ | --------------- | -------- |
| Core Foundation    | 5      | 15+             | 100%     |
| Request Validation | 1      | 10+             | 100%     |
| Security           | 3      | 20+             | 100%     |
| Business Logic     | 2      | 15+             | 100%     |
| **Total**          | **11** | **60+**         | **100%** |

---

## 🔍 **Performance & Monitoring**

### **Validation Metrics**

```typescript
// ✅ Performance monitoring
import { AsyncValidationResult } from "@/shared/validators";

class ValidationMetrics {
  static logValidationPerformance(result: AsyncValidationResult<any>) {
    console.log(`Validation completed in ${result.durationMs}ms`, {
      success: result.success,
      async: result.async,
      errorCount: result.success ? 0 : result.errors.length,
    });
  }
}

// Usage in validators
const result = await validator.validateAsync(data, context);
ValidationMetrics.logValidationPerformance(result);
```

### **Error Tracking**

```typescript
// ✅ Centralized error tracking
import { ValidationFailure, ValidationContext } from "@/shared/validators";

export class ValidationErrorTracker {
  static trackValidationFailure(
    result: ValidationFailure,
    context: ValidationContext
  ) {
    const errorReport = {
      timestamp: new Date(),
      tenantId: context.tenantId,
      entity: context.entity,
      errorCount: result.errors.length,
      errorCodes: result.errors.map((e) => e.code),
      correlationId: context.correlationId,
    };

    // Send to monitoring system
    logger.warn("Validation failed", errorReport);
  }
}
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Validation Context Missing**

   ```typescript
   // ❌ Missing context
   const result = validator.validate(data);

   // ✅ With proper context
   const context = { tenantId: req.tenant.id, actorId: req.user.id };
   const result = validator.validate(data, context);
   ```

2. **Async Validation Timing**

   ```typescript
   // ❌ Not awaiting async validation
   const result = validator.validateAsync(data, context);

   // ✅ Properly awaited
   const result = await validator.validateAsync(data, context);
   ```

3. **RLS Context Issues**

   ```typescript
   // ❌ Missing tenant ID for RLS
   const result = await validator.validateWithRLS(data, {});

   // ✅ Complete RLS context
   const result = await validator.validateWithRLS(data, {
     tenantId: context.tenantId,
     actorId: context.actorId,
   });
   ```

---

## 📈 **Future Enhancements**

- **Validation Caching**: Cache validation results for repeated operations
- **Schema Evolution**: Automatic schema migration and validation updates
- **Multi-Language Support**: i18n integration for validation messages
- **Real-time Validation**: WebSocket-based validation for forms
- **Performance Analytics**: Advanced validation performance monitoring

---

## 🤝 **Contributing**

When adding new validators:

1. **Extend appropriate base class**: `BaseValidator` for sync, `AsyncValidator` for async
2. **Follow naming conventions**: `EntityValidator`, `EntityBusinessRuleValidator`
3. **Include JSDoc comments**: Document purpose, validation rules, and examples
4. **Add comprehensive tests**: Unit tests for all validation scenarios
5. **Update this documentation**: Keep validator documentation current
6. **Consider performance**: Optimize for validation speed and memory usage

---

_This validation system provides enterprise-grade data validation with comprehensive business rule enforcement, security validation, and seamless integration with our multi-tenant, RBAC-enabled architecture._
