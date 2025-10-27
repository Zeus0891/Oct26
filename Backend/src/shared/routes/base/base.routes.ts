/**
 * Base Routes Class
 *
 * Abstract foundation for all route implementations in the application.
 * Provides standardized patterns for CRUD operations, middleware chains,
 * validation, and error handling.
 *
 * @module BaseRoutes
 * @category Shared Routes - Base Infrastructure
 * @description Abstract base routing class with common patterns
 * @version 1.0.0
 */

import {
  Router,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import {
  MiddlewareChains,
  CrudPermissions,
  RateLimits,
  CommonSchemas,
} from "../middleware-chain.builder";
import { BaseController } from "../../controllers/base/base.controller";
import { BaseEntity } from "../../services/base/context.service";
import { AuthenticatedRequest } from "../../../middlewares/types";

/**
 * Route configuration interface
 */
export interface RouteConfig {
  /** Base path for the route group */
  basePath: string;
  /** Resource name for permissions */
  resourceName: string;
  /** Custom middleware chains */
  middlewareOverrides?: {
    [operation: string]: RequestHandler[];
  };
  /** Rate limit overrides */
  rateLimitOverrides?: {
    [operation: string]: any;
  };
  /** Validation schema overrides */
  validationOverrides?: {
    [operation: string]: any;
  };
  /** Enable/disable specific operations */
  enabledOperations?: {
    list?: boolean;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

/**
 * Abstract base routes class
 *
 * Provides standardized CRUD route patterns that can be extended
 * by specific resource implementations.
 */
export abstract class BaseRoutes<T extends BaseEntity> {
  protected readonly router: Router;
  protected readonly config: RouteConfig;
  protected readonly controller: BaseController<T>;

  constructor(controller: BaseController<T>, config: RouteConfig) {
    this.router = Router();
    this.controller = controller;
    this.config = config;

    // Setup standard routes
    this.setupStandardRoutes();

    // Allow subclasses to add custom routes
    this.setupCustomRoutes();
  }

  /**
   * Setup standard CRUD routes
   */
  private setupStandardRoutes(): void {
    const { resourceName, enabledOperations = {} } = this.config;

    // Default to enabling all operations unless explicitly disabled
    const operations = {
      list: true,
      create: true,
      read: true,
      update: true,
      delete: true,
      ...enabledOperations,
    };

    // LIST - GET /
    if (operations.list) {
      this.router.get(
        "/",
        ...this.getMiddlewareChain("list"),
        this.handleAsyncRoute(this.listHandler.bind(this))
      );
    }

    // CREATE - POST /
    if (operations.create) {
      this.router.post(
        "/",
        ...this.getMiddlewareChain("create"),
        this.handleAsyncRoute(this.createHandler.bind(this))
      );
    }

    // READ - GET /:id
    if (operations.read) {
      this.router.get(
        "/:id",
        ...this.getMiddlewareChain("read"),
        this.handleAsyncRoute(this.readHandler.bind(this))
      );
    }

    // UPDATE - PUT /:id
    if (operations.update) {
      this.router.put(
        "/:id",
        ...this.getMiddlewareChain("update"),
        this.handleAsyncRoute(this.updateHandler.bind(this))
      );
    }

    // DELETE - DELETE /:id
    if (operations.delete) {
      this.router.delete(
        "/:id",
        ...this.getMiddlewareChain("delete"),
        this.handleAsyncRoute(this.deleteHandler.bind(this))
      );
    }
  }

  /**
   * Get middleware chain for a specific operation
   */
  protected getMiddlewareChain(operation: string): RequestHandler[] {
    const { resourceName, middlewareOverrides } = this.config;

    // Check for override first
    if (middlewareOverrides?.[operation]) {
      return middlewareOverrides[operation];
    }

    // Use standard middleware chains based on operation
    switch (operation) {
      case "list":
        return MiddlewareChains.crud.list(resourceName);
      case "create":
        return MiddlewareChains.crud.create(resourceName);
      case "read":
        return MiddlewareChains.crud.read(resourceName);
      case "update":
        return MiddlewareChains.crud.update(resourceName);
      case "delete":
        return MiddlewareChains.crud.delete(resourceName);
      default:
        return MiddlewareChains.authenticated();
    }
  }

  /**
   * Async route handler wrapper
   */
  protected handleAsyncRoute(
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req as AuthenticatedRequest, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Add a custom route with standardized middleware pattern
   */
  protected addRoute(
    method: "get" | "post" | "put" | "delete" | "patch",
    path: string,
    operation: string,
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void,
    customMiddleware?: RequestHandler[]
  ): void {
    const middleware = customMiddleware || this.getMiddlewareChain(operation);

    this.router[method](path, ...middleware, this.handleAsyncRoute(handler));
  }

  /**
   * Add a public route (no authentication required)
   */
  protected addPublicRoute(
    method: "get" | "post" | "put" | "delete" | "patch",
    path: string,
    handler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): void {
    this.router[method](
      path,
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(handler as any)
    );
  }

  /**
   * Add an admin-only route
   */
  protected addAdminRoute(
    method: "get" | "post" | "put" | "delete" | "patch",
    path: string,
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): void {
    this.router[method](
      path,
      ...MiddlewareChains.admin(),
      this.handleAsyncRoute(handler)
    );
  }

  /**
   * Add a bulk operation route
   */
  protected addBulkRoute(
    method: "post" | "put" | "delete",
    path: string,
    operation: "create" | "update" | "delete",
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): void {
    const { resourceName } = this.config;

    this.router[method](
      path,
      ...MiddlewareChains.bulk[operation](resourceName),
      this.handleAsyncRoute(handler)
    );
  }

  /**
   * Add a search route
   */
  protected addSearchRoute(
    path: string,
    searchType: "basic" | "advanced" | "export",
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): void {
    const { resourceName } = this.config;

    this.router.get(
      path,
      ...MiddlewareChains.search[searchType](resourceName),
      this.handleAsyncRoute(handler)
    );

    // Also support POST for complex search queries
    this.router.post(
      path,
      ...MiddlewareChains.search[searchType](resourceName),
      this.handleAsyncRoute(handler)
    );
  }

  /**
   * Get validation schema for an operation
   * Override in subclasses to provide custom validation
   */
  protected getValidationSchema(operation: string): any {
    const { validationOverrides } = this.config;

    if (validationOverrides?.[operation]) {
      return validationOverrides[operation];
    }

    // Return common schemas based on operation
    switch (operation) {
      case "read":
      case "update":
      case "delete":
        return CommonSchemas.uuidParams;
      case "list":
        return CommonSchemas.paginationQuery;
      case "search":
        return CommonSchemas.searchQuery;
      case "bulk":
        return CommonSchemas.bulkBody;
      default:
        return {};
    }
  }

  /**
   * Get rate limit configuration for an operation
   * Override in subclasses to provide custom rate limits
   */
  protected getRateLimitConfig(operation: string): any {
    const { rateLimitOverrides } = this.config;

    if (rateLimitOverrides?.[operation]) {
      return rateLimitOverrides[operation];
    }

    // Return standard rate limits
    switch (operation) {
      case "create":
        return RateLimits.create;
      case "update":
        return RateLimits.update;
      case "delete":
        return RateLimits.delete;
      case "bulk":
        return RateLimits.bulk;
      case "search":
        return RateLimits.search;
      case "export":
        return RateLimits.export;
      default:
        return RateLimits.authenticated;
    }
  }

  /**
   * Default CRUD handlers - can be overridden by subclasses
   */
  protected async listHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // This is a placeholder - subclasses should override or implement actual controller integration
    res.status(501).json({
      error: "Not implemented",
      message: `List handler for ${this.config.resourceName} not implemented`,
      operation: "LIST",
    });
  }

  protected async createHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.status(501).json({
      error: "Not implemented",
      message: `Create handler for ${this.config.resourceName} not implemented`,
      operation: "CREATE",
    });
  }

  protected async readHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.status(501).json({
      error: "Not implemented",
      message: `Read handler for ${this.config.resourceName} not implemented`,
      operation: "READ",
    });
  }

  protected async updateHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.status(501).json({
      error: "Not implemented",
      message: `Update handler for ${this.config.resourceName} not implemented`,
      operation: "UPDATE",
    });
  }

  protected async deleteHandler(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.status(501).json({
      error: "Not implemented",
      message: `Delete handler for ${this.config.resourceName} not implemented`,
      operation: "DELETE",
    });
  }

  /**
   * Abstract method for setting up custom routes
   * Must be implemented by subclasses
   */
  protected abstract setupCustomRoutes(): void;

  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the base path for this route group
   */
  public getBasePath(): string {
    return this.config.basePath;
  }

  /**
   * Get the resource name
   */
  public getResourceName(): string {
    return this.config.resourceName;
  }
}

/**
 * Export the base routes class and related interfaces
 */
export { BaseRoutes as default };
