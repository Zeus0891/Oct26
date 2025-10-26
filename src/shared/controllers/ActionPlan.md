# 🎛️ **Shared Controllers Action Plan**

_⚠️ Refactored to focus on transversal controllers only_

## Overview

This action plan defines the implementation of **transversal shared controllers** that provide foundational HTTP endpoint patterns across all feature modules. These controllers focus exclusively on cross-cutting concerns: base patterns, authentication, system health, and generic operations like search, export, and bulk processing.

## Architecture Principles

### 🎯 **Design Goals**

- **Transversal Patterns**: Only controllers that serve ALL modules (not domain-specific)
- **Foundation Classes**: Abstract base classes for consistent HTTP patterns
- **RBAC Integration**: Permission decorators and middleware integration
- **Multi-Tenant Support**: RLS context validation for all requests
- **Consistent APIs**: Standardized request/response formats and error handling
- **Reusable Components**: Generic operations (search, export, bulk) used across domains

### 🏗️ **Architecture Boundaries**

**✅ Belongs in Shared Controllers:**

- Abstract base patterns used by ALL modules
- Authentication (cross-tenant concern)
- Generic operations (search, export, bulk)
- System-level endpoints (health, metrics)

**❌ Moved to Feature Modules:**

- Finance controllers → `src/features/finance/controllers/`
- Workflow controllers → `src/features/workflow/controllers/`
- Integration controllers → `src/features/integration/controllers/`
- RBAC management → `src/security/controllers/`

---

## 📁 Refactored Controller Structure

### 🧱 **Base Foundation** (`/base/`)

_Abstract patterns used by ALL feature modules_

| File                   | Purpose                           | Key Methods                                                         | Scope              |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------- | ------------------ |
| `base.controller.ts`   | Abstract base controller class    | `create()`, `update()`, `delete()`, `findById()`, `list()`          | Foundation pattern |
| `crud.controller.ts`   | Standard CRUD operations template | `handleCreate()`, `handleUpdate()`, `handleDelete()`, `handleGet()` | Generic CRUD       |
| `bulk.controller.ts`   | Bulk operations support           | `bulkCreate()`, `bulkUpdate()`, `bulkDelete()`, `bulkExport()`      | Multi-entity ops   |
| `search.controller.ts` | Advanced search and filtering     | `search()`, `filter()`, `sort()`, `paginate()`                      | Cross-domain query |
| `export.controller.ts` | Data export functionality         | `exportCSV()`, `exportExcel()`, `exportPDF()`                       | Reporting pattern  |

### � **Authentication** (`/security/`)

_Cross-tenant authentication (not RBAC management)_

| File                 | Purpose                  | Key Methods                                      | Scope            |
| -------------------- | ------------------------ | ------------------------------------------------ | ---------------- |
| `auth.controller.ts` | Authentication endpoints | `login()`, `logout()`, `refresh()`, `validate()` | All tenant users |

### 🏥 **System Health** (`/system/`)

_Cross-service diagnostics and monitoring_

| File                   | Purpose                      | Key Methods                                             | Scope              |
| ---------------------- | ---------------------------- | ------------------------------------------------------- | ------------------ |
| `health.controller.ts` | System health and monitoring | `getHealthStatus()`, `runHealthCheck()`, `getMetrics()` | System-wide status |

---

## 🚫 **Controllers Moved to Feature Modules**

### 💰 **Finance → `src/features/finance/controllers/`**

- `money.controller.ts`, `tax.controller.ts`, `accounting.controller.ts`, `billing.controller.ts`, `reconciliation.controller.ts`

### 🔄 **Workflow → `src/features/workflow/controllers/`**

- `approval.controller.ts`, `status.controller.ts`, `task.controller.ts`, `notification.controller.ts`, `document.controller.ts`

### 🔗 **Integration → `src/features/integration/controllers/`**

- `webhook.controller.ts`, `sync.controller.ts`, `api-key.controller.ts`

### 🔒 **Security Management → `src/security/controllers/`**

- `permission.controller.ts`, `role.controller.ts`, `session.controller.ts`, `compliance.controller.ts`

---

## 🎯 **Implementation Requirements**

### **1. Base Controller Pattern**

```typescript
// Abstract base controller with common HTTP patterns
export abstract class BaseController<T extends BaseEntity> {
  constructor(
    protected readonly service: BaseService<T>,
    protected readonly validator: BaseValidator<T>,
    protected readonly logger: Logger
  ) {}

  // Standard CRUD endpoints
  @Post()
  @UseGuards(RBACGuard)
  @Permission("CREATE", "Entity")
  async create(
    @Body() body: CreateEntityDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    const validatedData = await this.validator.validateCreate(body);
    return await this.service.create(req.context, validatedData);
  }

  @Get(":id")
  @UseGuards(RBACGuard)
  @Permission("READ", "Entity")
  async findById(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    return await this.service.findById(req.context, id);
  }

  @Put(":id")
  @UseGuards(RBACGuard)
  @Permission("UPDATE", "Entity")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateEntityDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<T>> {
    const validatedData = await this.validator.validateUpdate(body);
    return await this.service.update(req.context, id, validatedData);
  }

  @Delete(":id")
  @UseGuards(RBACGuard)
  @Permission("DELETE", "Entity")
  async delete(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<void>> {
    return await this.service.delete(req.context, id);
  }

  @Get()
  @UseGuards(RBACGuard)
  @Permission("LIST", "Entity")
  async list(
    @Query() query: ListQueryDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<T[]>> {
    const validatedQuery = await this.validator.validateQuery(query);
    return await this.service.list(req.context, validatedQuery);
  }
}
```

### **2. Permission Integration**

```typescript
// Permission checking at controller level
@Controller("api/v1/protected")
@UseGuards(AuthGuard, RBACGuard)
export class ProtectedController extends BaseController<ProtectedEntity> {
  @Post()
  @Permission("CREATE", "ProtectedEntity")
  @RequireScope(["TENANT", "PROJECT"])
  async create(
    @Body() body: CreateProtectedEntityDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<ProtectedEntity>> {
    // Permission already checked by decorator
    return await super.create(body, req);
  }

  @Get(":id/sensitive-data")
  @Permission("READ_SENSITIVE", "ProtectedEntity")
  @RequireRole(["ADMIN", "MANAGER"])
  async getSensitiveData(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<SensitiveData>> {
    // Additional permission checks for sensitive operations
    return await this.service.getSensitiveData(req.context, id);
  }
}
```

### **3. Request Validation**

```typescript
// Input validation using shared validators
@Controller("api/v1/validated")
export class ValidatedController extends BaseController<ValidatedEntity> {
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() body: CreateValidatedEntityDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<ValidatedEntity>> {
    // Validation handled by ValidationPipe and DTO decorators
    return await this.service.create(req.context, body);
  }

  @Post("bulk")
  @UsePipes(BulkValidationPipe)
  async bulkCreate(
    @Body() body: BulkCreateDto<ValidatedEntity>,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<ValidatedEntity[]>> {
    // Bulk validation with proper error handling
    return await this.service.bulkCreate(req.context, body);
  }
}
```

### **4. Error Handling**

```typescript
// Standardized error handling
@Controller("api/v1/example")
@UseFilters(GlobalExceptionFilter)
export class ExampleController extends BaseController<Example> {
  @Post()
  async create(
    @Body() body: CreateExampleDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<Example>> {
    try {
      return await this.service.create(req.context, body);
    } catch (error) {
      // Global exception filter handles standardized responses
      throw error;
    }
  }
}

// Global exception filter for consistent error responses
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request
  ): ApiErrorResponse {
    // Build standardized error response using shared types
  }
}
```

---

## 🔧 **Integration Points**

### **With Shared Services**

- All controllers consume shared service layer
- Business logic delegated to services, not controllers
- Consistent service method signatures and responses
- Proper error propagation from services to HTTP layer

### **With Shared Validators**

- Input validation using shared validator classes
- DTO validation with class-validator decorators
- Business rule validation at controller level
- Consistent validation error responses

### **With RBAC System**

- Permission decorators on all protected endpoints
- Role-based method access control
- Assignment scope validation for resource access
- Integration with authentication middleware

### **With Audit System**

- Automatic audit logging for all controller actions
- HTTP request/response audit trails
- Actor attribution from request context
- Compliance logging for sensitive operations

---

## 📊 **Controller Dependencies**

| Controller           | Depends On                               | Provides To                 | Integration Points                 |
| -------------------- | ---------------------------------------- | --------------------------- | ---------------------------------- |
| **BaseController**   | Shared Services, Validators, RBAC Guards | All Feature Controllers     | Foundation pattern for all modules |
| **CrudController**   | BaseController, Prisma Client            | All CRUD operations         | Standard REST operations           |
| **BulkController**   | BaseController, Async Processing         | Large data operations       | Multi-entity processing            |
| **SearchController** | BaseController, Query Utils              | All list/filter needs       | Cross-domain search patterns       |
| **ExportController** | BaseController, File Utils               | Reporting systems           | CSV/Excel/PDF generation           |
| **AuthController**   | JWT Service, Session Management          | All authenticated endpoints | Cross-tenant authentication        |
| **HealthController** | System metrics, DB connections           | Monitoring/DevOps           | Service health diagnostics         |

---

## 🚀 **Implementation Roadmap**

**Week 1**: Foundation Layer

- Implement `BaseController` with RBAC and RLS integration
- Create `CrudController` with standardized REST patterns
- Set up global exception filters and error handling

**Week 2**: Core Operations

- Implement `SearchController` with advanced filtering
- Create `AuthController` with JWT and session management
- Add `ExportController` with CSV/Excel/PDF support

**Week 3**: Advanced Features

- Implement `BulkController` for large operations
- Create `HealthController` for system monitoring
- Add comprehensive testing and documentation

**Week 4**: Integration & Optimization

- Performance testing and optimization
- Integration with all shared components (services, validators, types)
- Complete OpenAPI documentation and developer guides

---

## 🎯 **API Standards**

### **REST Conventions**

- Resource-based URLs (`/api/v1/entities`)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent status codes and responses
- Proper use of HTTP headers

### **Request/Response Format**

```typescript
// Standardized request format
interface StandardRequest {
  headers: {
    Authorization: string;
    "Content-Type": "application/json";
    "X-Tenant-ID": string;
  };
  body: CreateEntityDto | UpdateEntityDto;
}

// Standardized response format
interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMetadata;
}
```

### **Error Response Format**

```typescript
// Consistent error responses
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}
```

---

## 🔍 **Testing Requirements**

### **Unit Tests**

- Controller method isolation testing
- Permission decorator testing
- Input validation testing
- Error handling verification

### **Integration Tests**

- End-to-end API testing
- RBAC integration testing
- Multi-tenant isolation verification
- Service integration testing

### **API Tests**

- OpenAPI specification compliance
- HTTP status code validation
- Response format verification
- Performance benchmarking

---

## 📚 **Documentation Requirements**

### **OpenAPI Specification**

- Automatic generation from controller decorators
- Complete endpoint documentation
- Request/response schema definitions
- Authentication and authorization documentation

### **API Documentation**

- Usage examples for all endpoints
- Error handling documentation
- Rate limiting information
- Authentication flow documentation

---

## 🎯 **Benefits of This Refactored Approach**

> **🏗️ Architectural Benefits:**
>
> ✅ **Proper Boundaries**: Only 7 transversal controllers in shared layer  
> ✅ **Clear Separation**: Domain controllers moved to respective feature modules  
> ✅ **Foundation Focus**: Shared controllers provide patterns, not business logic  
> ✅ **Reusable Base**: All feature controllers extend from shared foundation  
> ✅ **Consistent APIs**: Standardized HTTP patterns across all modules  
> ✅ **RBAC Integration**: Permission decorators and RLS middleware built-in

This **refactored controller architecture** maintains enterprise-grade HTTP layer capabilities while respecting proper architectural boundaries and providing a solid foundation for all feature modules.
