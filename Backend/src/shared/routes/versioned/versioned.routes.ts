/**
 * Versioned Routes
 *
 * API versioning and deprecation management system.
 * Provides structured approach to API evolution while maintaining
 * backward compatibility and smooth migration paths.
 *
 * @module VersionedRoutes
 * @category Shared Routes - Versioned Infrastructure
 * @description API versioning and deprecation management
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import { MiddlewareChains } from "../middleware-chain.builder";
import { AuthenticatedRequest } from "../../../middlewares/types";

/**
 * API version configuration
 */
export interface ApiVersion {
  /** Version identifier (e.g., 'v1', 'v2') */
  version: string;
  /** Human-readable version name */
  name?: string;
  /** Version description */
  description?: string;
  /** Release date */
  releaseDate?: Date;
  /** Deprecation date */
  deprecationDate?: Date;
  /** End-of-life date */
  eolDate?: Date;
  /** Version status */
  status: "beta" | "stable" | "deprecated" | "eol";
  /** Breaking changes from previous version */
  breakingChanges?: string[];
  /** Migration guide URL */
  migrationGuide?: string;
}

/**
 * Versioned route configuration
 */
export interface VersionedRouteConfig {
  /** Base API path (e.g., '/api') */
  basePath: string;
  /** Default version when none specified */
  defaultVersion: string;
  /** Available API versions */
  versions: ApiVersion[];
  /** Enable version detection from headers */
  enableHeaderVersioning?: boolean;
  /** Enable version detection from query params */
  enableQueryVersioning?: boolean;
  /** Custom version extraction function */
  customVersionExtractor?: (req: Request) => string | null;
}

/**
 * Version deprecation warning
 */
export interface DeprecationWarning {
  version: string;
  message: string;
  deprecationDate?: Date;
  eolDate?: Date;
  migrationGuide?: string;
  alternativeVersion?: string;
}

/**
 * Versioned routes factory
 *
 * Manages multiple API versions with proper deprecation warnings
 * and smooth migration paths.
 */
export class VersionedRoutes {
  private readonly router: Router;
  private readonly config: VersionedRouteConfig;
  private readonly versionRouters: Map<string, Router>;

  constructor(config: VersionedRouteConfig) {
    this.router = Router();
    this.config = config;
    this.versionRouters = new Map();
    this.setupVersioning();
  }

  /**
   * Setup API versioning infrastructure
   */
  private setupVersioning(): void {
    // Initialize routers for each version
    this.config.versions.forEach((version) => {
      this.versionRouters.set(version.version, Router());
    });

    // Setup version detection middleware
    this.router.use(this.versionDetectionMiddleware.bind(this));

    // Setup version routing
    this.config.versions.forEach((version) => {
      const versionRouter = this.versionRouters.get(version.version);
      if (versionRouter) {
        // Add deprecation middleware for deprecated versions
        if (version.status === "deprecated") {
          versionRouter.use(this.deprecationMiddleware(version));
        }

        // Add EOL middleware for end-of-life versions
        if (version.status === "eol") {
          versionRouter.use(this.eolMiddleware(version));
        }

        // Mount version router
        this.router.use(`/${version.version}`, versionRouter);
      }
    });

    // Setup version information endpoints
    this.setupVersionInfoRoutes();
  }

  /**
   * Version detection middleware
   */
  private versionDetectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let detectedVersion: string | null = null;

    // 1. Check URL path first (highest priority)
    const pathVersion = this.extractVersionFromPath(req.path);
    if (pathVersion) {
      detectedVersion = pathVersion;
    }

    // 2. Check Accept header versioning
    if (!detectedVersion && this.config.enableHeaderVersioning) {
      const headerVersion = this.extractVersionFromHeaders(req);
      if (headerVersion) {
        detectedVersion = headerVersion;
      }
    }

    // 3. Check query parameter versioning
    if (!detectedVersion && this.config.enableQueryVersioning) {
      const queryVersion =
        (req.query.version as string) || (req.query.v as string);
      if (queryVersion && this.isValidVersion(queryVersion)) {
        detectedVersion = queryVersion;
      }
    }

    // 4. Use custom version extractor if provided
    if (!detectedVersion && this.config.customVersionExtractor) {
      detectedVersion = this.config.customVersionExtractor(req);
    }

    // 5. Fall back to default version
    if (!detectedVersion) {
      detectedVersion = this.config.defaultVersion;
    }

    // Validate version exists
    if (!this.isValidVersion(detectedVersion)) {
      res.status(400).json({
        error: "UNSUPPORTED_API_VERSION",
        message: `API version '${detectedVersion}' is not supported`,
        supportedVersions: this.config.versions.map((v) => v.version),
        currentVersion: this.config.defaultVersion,
      });
      return;
    }

    // Store detected version in request
    (req as any).apiVersion = detectedVersion;
    next();
  }

  /**
   * Deprecation warning middleware
   */
  private deprecationMiddleware(version: ApiVersion) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const warning: DeprecationWarning = {
        version: version.version,
        message: `API version ${version.version} is deprecated`,
        deprecationDate: version.deprecationDate,
        eolDate: version.eolDate,
        migrationGuide: version.migrationGuide,
        alternativeVersion: this.config.defaultVersion,
      };

      // Add deprecation headers
      res.setHeader("Deprecation", "true");
      res.setHeader("API-Deprecation-Warning", warning.message);

      if (version.eolDate) {
        res.setHeader("API-EOL-Date", version.eolDate.toISOString());
      }

      if (version.migrationGuide) {
        res.setHeader("API-Migration-Guide", version.migrationGuide);
      }

      // Store warning for response inclusion
      (req as any).deprecationWarning = warning;
      next();
    };
  }

  /**
   * End-of-life middleware
   */
  private eolMiddleware(version: ApiVersion) {
    return (req: Request, res: Response, next: NextFunction): void => {
      res.status(410).json({
        error: "API_VERSION_EOL",
        message: `API version ${version.version} has reached end-of-life and is no longer supported`,
        eolDate: version.eolDate,
        migrationGuide: version.migrationGuide,
        currentVersion: this.config.defaultVersion,
        supportedVersions: this.config.versions
          .filter((v) => v.status !== "eol")
          .map((v) => v.version),
      });
    };
  }

  /**
   * Setup version information routes
   */
  private setupVersionInfoRoutes(): void {
    // API version information
    this.router.get(
      "/versions",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.versionsHandler.bind(this))
    );

    // Current version information
    this.router.get(
      "/version",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.currentVersionHandler.bind(this))
    );

    // Version compatibility matrix
    this.router.get(
      "/compatibility",
      ...MiddlewareChains.public(),
      this.handleAsyncRoute(this.compatibilityHandler.bind(this))
    );
  }

  /**
   * Extract version from URL path
   */
  private extractVersionFromPath(path: string): string | null {
    const versionMatch = path.match(/^\/?(v\d+(?:\.\d+)*)/);
    return versionMatch ? versionMatch[1] : null;
  }

  /**
   * Extract version from request headers
   */
  private extractVersionFromHeaders(req: Request): string | null {
    // Check custom API-Version header
    const apiVersionHeader = req.headers["api-version"] as string;
    if (apiVersionHeader && this.isValidVersion(apiVersionHeader)) {
      return apiVersionHeader;
    }

    // Check Accept header with vendor versioning
    const acceptHeader = req.headers.accept as string;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(
        /application\/vnd\.api\.([^;,\s]+)/
      );
      if (versionMatch && this.isValidVersion(versionMatch[1])) {
        return versionMatch[1];
      }
    }

    return null;
  }

  /**
   * Check if version is valid and supported
   */
  private isValidVersion(version: string): boolean {
    return this.config.versions.some((v) => v.version === version);
  }

  /**
   * Version information handler
   */
  private async versionsHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = {
        success: true,
        data: {
          currentVersion: this.config.defaultVersion,
          supportedVersions: this.config.versions.map((version) => ({
            version: version.version,
            name: version.name,
            description: version.description,
            status: version.status,
            releaseDate: version.releaseDate,
            deprecationDate: version.deprecationDate,
            eolDate: version.eolDate,
            migrationGuide: version.migrationGuide,
          })),
          versioningSupport: {
            urlPath: true,
            headers: this.config.enableHeaderVersioning,
            queryParams: this.config.enableQueryVersioning,
            customExtractor: !!this.config.customVersionExtractor,
          },
        },
        message: "API version information retrieved successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current version handler
   */
  private async currentVersionHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const detectedVersion =
        (req as any).apiVersion || this.config.defaultVersion;
      const versionInfo = this.config.versions.find(
        (v) => v.version === detectedVersion
      );

      const result = {
        success: true,
        data: {
          version: detectedVersion,
          info: versionInfo,
          deprecationWarning: (req as any).deprecationWarning || null,
        },
        message: "Current API version information retrieved successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Compatibility matrix handler
   */
  private async compatibilityHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const compatibility = this.config.versions.map((version) => ({
        version: version.version,
        status: version.status,
        compatibleWith: this.config.versions
          .filter((v) => v.version !== version.version && v.status !== "eol")
          .map((v) => v.version),
        breakingChanges: version.breakingChanges || [],
        migrationPath: version.migrationGuide
          ? {
              guide: version.migrationGuide,
              recommendedVersion: this.config.defaultVersion,
            }
          : null,
      }));

      const result = {
        success: true,
        data: {
          compatibility,
          recommendedVersion: this.config.defaultVersion,
          deprecatedVersions: this.config.versions
            .filter((v) => v.status === "deprecated")
            .map((v) => v.version),
          eolVersions: this.config.versions
            .filter((v) => v.status === "eol")
            .map((v) => v.version),
        },
        message: "API compatibility matrix retrieved successfully",
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register routes for a specific version
   */
  public registerVersionRoutes(
    version: string,
    routerFactory: () => Router
  ): void {
    const versionRouter = this.versionRouters.get(version);
    if (!versionRouter) {
      throw new Error(`Version ${version} is not supported`);
    }

    const routes = routerFactory();
    versionRouter.use(routes);
  }

  /**
   * Get router for a specific version
   */
  public getVersionRouter(version: string): Router | undefined {
    return this.versionRouters.get(version);
  }

  /**
   * Add new API version
   */
  public addVersion(version: ApiVersion): void {
    this.config.versions.push(version);
    this.versionRouters.set(version.version, Router());
  }

  /**
   * Deprecate a version
   */
  public deprecateVersion(
    version: string,
    deprecationDate?: Date,
    eolDate?: Date
  ): void {
    const versionIndex = this.config.versions.findIndex(
      (v) => v.version === version
    );
    if (versionIndex !== -1) {
      this.config.versions[versionIndex].status = "deprecated";
      if (deprecationDate) {
        this.config.versions[versionIndex].deprecationDate = deprecationDate;
      }
      if (eolDate) {
        this.config.versions[versionIndex].eolDate = eolDate;
      }
    }
  }

  /**
   * Async route handler wrapper
   */
  private handleAsyncRoute(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }

  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the base path
   */
  public getBasePath(): string {
    return this.config.basePath;
  }
}

/**
 * Export the versioned routes class
 */
export default VersionedRoutes;
