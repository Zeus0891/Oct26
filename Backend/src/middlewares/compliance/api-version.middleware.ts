import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

/**
 * API Version Information
 */
interface ApiVersionInfo {
  version: string;
  releaseDate: string;
  deprecated?: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  features: string[];
  breakingChanges?: string[];
  migrationGuide?: string;
}

/**
 * Version Compatibility Configuration
 */
interface VersionConfig {
  currentVersion: string;
  supportedVersions: string[];
  deprecatedVersions: string[];
  defaultVersion?: string;
  versionHeader?: string;
  pathPrefix?: boolean;
  queryParam?: string;
}

/**
 * API Version Registry
 */
const API_VERSIONS: Record<string, ApiVersionInfo> = {
  v1: {
    version: "1.0.0",
    releaseDate: "2024-01-01",
    deprecated: true,
    deprecationDate: "2024-06-01",
    sunsetDate: "2025-01-01",
    features: ["basic-crud", "authentication", "basic-rbac"],
    breakingChanges: ["removed-legacy-auth", "changed-user-schema"],
    migrationGuide: "/docs/migration/v1-to-v2",
  },
  v2: {
    version: "2.0.0",
    releaseDate: "2024-06-01",
    deprecated: false,
    features: [
      "enhanced-rbac",
      "multi-tenant",
      "advanced-security",
      "audit-logging",
    ],
    breakingChanges: ["new-authentication-flow", "updated-error-responses"],
  },
  v3: {
    version: "3.0.0",
    releaseDate: "2024-10-01",
    deprecated: false,
    features: [
      "graphql-support",
      "real-time-updates",
      "advanced-analytics",
      "ai-integration",
    ],
    breakingChanges: ["restructured-endpoints", "new-permission-system"],
  },
};

/**
 * Default version configuration
 */
const DEFAULT_CONFIG: VersionConfig = {
  currentVersion: "v2",
  supportedVersions: ["v1", "v2", "v3"],
  deprecatedVersions: ["v1"],
  defaultVersion: "v2",
  versionHeader: "x-api-version",
  pathPrefix: true,
  queryParam: "version",
};

/**
 * API Version Middleware
 *
 * Handles API versioning with backward compatibility, deprecation warnings,
 * and automatic version detection from headers, path, or query parameters.
 *
 * @param config - Version configuration options
 */
export const apiVersionMiddleware = (config: Partial<VersionConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Detect API version from multiple sources
      const detectedVersion = detectApiVersion(req, finalConfig);

      // Validate version
      const validationResult = validateVersion(detectedVersion, finalConfig);

      if (!validationResult.valid) {
        res.status(400).json({
          message: validationResult.message,
          code: "INVALID_API_VERSION",
          supportedVersions: finalConfig.supportedVersions,
          currentVersion: finalConfig.currentVersion,
          correlationId: req.correlationId,
        });
        return;
      }

      // Set version information on request
      req.apiVersion = {
        requested: detectedVersion,
        resolved: validationResult.resolvedVersion!,
        info: API_VERSIONS[validationResult.resolvedVersion!],
      };

      // Set version headers on response
      res.setHeader("X-API-Version", validationResult.resolvedVersion!);
      res.setHeader(
        "X-API-Version-Info",
        JSON.stringify(API_VERSIONS[validationResult.resolvedVersion!])
      );

      // Add deprecation warnings if applicable
      if (API_VERSIONS[validationResult.resolvedVersion!].deprecated) {
        const versionInfo = API_VERSIONS[validationResult.resolvedVersion!];

        res.setHeader(
          "Warning",
          `299 - "API version ${validationResult.resolvedVersion} is deprecated. ` +
            `Sunset date: ${versionInfo.sunsetDate || "TBD"}. ` +
            `Please migrate to version ${finalConfig.currentVersion}."`
        );

        res.setHeader("Sunset", versionInfo.sunsetDate || "");
        res.setHeader(
          "Link",
          `</docs/migration/${validationResult.resolvedVersion}-to-${finalConfig.currentVersion}>; rel="successor-version"`
        );

        console.warn(
          `[API_VERSION] Deprecated version ${
            validationResult.resolvedVersion
          } used by ${req.user?.email || "anonymous"}`
        );
      }

      // Log version usage for analytics
      console.log(
        `[API_VERSION] ${detectedVersion} -> ${validationResult.resolvedVersion} | ${req.method} ${req.path}`
      );

      next();
    } catch (error) {
      console.error("[API_VERSION] Version middleware error:", error);
      next(error);
    }
  };
};

/**
 * Detect API version from request
 */
function detectApiVersion(req: Request, config: VersionConfig): string {
  // 1. Check version header
  const headerVersion = req.headers[config.versionHeader!] as string;
  if (headerVersion) {
    return normalizeVersion(headerVersion);
  }

  // 2. Check path prefix (/api/v2/users)
  if (config.pathPrefix) {
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }
  }

  // 3. Check query parameter (?version=v2)
  if (config.queryParam) {
    const queryVersion = req.query[config.queryParam] as string;
    if (queryVersion) {
      return normalizeVersion(queryVersion);
    }
  }

  // 4. Check Accept header (application/vnd.api+json; version=2)
  const acceptHeader = req.headers.accept;
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version=(\d+)/);
    if (versionMatch) {
      return `v${versionMatch[1]}`;
    }
  }

  // 5. Default version
  return config.defaultVersion || config.currentVersion;
}

/**
 * Normalize version string (remove extra characters)
 */
function normalizeVersion(version: string): string {
  // Remove extra characters and ensure v prefix
  const cleaned = version.toLowerCase().replace(/[^v\d\.]/g, "");
  return cleaned.startsWith("v") ? cleaned : `v${cleaned}`;
}

/**
 * Validate API version
 */
function validateVersion(
  version: string,
  config: VersionConfig
): { valid: boolean; message?: string; resolvedVersion?: string } {
  // Check if version is supported
  if (!config.supportedVersions.includes(version)) {
    return {
      valid: false,
      message: `API version '${version}' is not supported. Supported versions: ${config.supportedVersions.join(
        ", "
      )}`,
    };
  }

  // Check if version is sunset (completely removed)
  const versionInfo = API_VERSIONS[version];
  if (versionInfo?.sunsetDate) {
    const sunsetDate = new Date(versionInfo.sunsetDate);
    if (new Date() > sunsetDate) {
      return {
        valid: false,
        message: `API version '${version}' has been sunset as of ${versionInfo.sunsetDate}. Please use version ${config.currentVersion}.`,
      };
    }
  }

  return {
    valid: true,
    resolvedVersion: version,
  };
}

// =============================================================================
// VERSION-SPECIFIC MIDDLEWARE HELPERS
// =============================================================================

/**
 * Require specific API version
 */
export const requireVersion = (requiredVersion: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.apiVersion || req.apiVersion.resolved !== requiredVersion) {
      res.status(400).json({
        message: `This endpoint requires API version ${requiredVersion}`,
        code: "VERSION_MISMATCH",
        currentVersion: req.apiVersion?.resolved,
        requiredVersion,
        correlationId: req.correlationId,
      });
      return;
    }
    next();
  };
};

/**
 * Minimum version requirement
 */
export const requireMinimumVersion = (minimumVersion: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const current = parseInt(req.apiVersion?.resolved?.replace("v", "") || "0");
    const minimum = parseInt(minimumVersion.replace("v", ""));

    if (current < minimum) {
      res.status(400).json({
        message: `This endpoint requires minimum API version ${minimumVersion}`,
        code: "VERSION_TOO_OLD",
        currentVersion: req.apiVersion?.resolved,
        minimumVersion,
        correlationId: req.correlationId,
      });
      return;
    }
    next();
  };
};

/**
 * Block deprecated versions
 */
export const blockDeprecatedVersions = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (req.apiVersion?.info.deprecated) {
      res.status(410).json({
        message: `API version ${req.apiVersion.resolved} is deprecated and blocked`,
        code: "VERSION_DEPRECATED",
        deprecationDate: req.apiVersion.info.deprecationDate,
        sunsetDate: req.apiVersion.info.sunsetDate,
        migrationGuide: req.apiVersion.info.migrationGuide,
        currentVersion: DEFAULT_CONFIG.currentVersion,
        correlationId: req.correlationId,
      });
      return;
    }
    next();
  };
};

/**
 * Version-aware response formatter
 */
export const versionedResponse = (
  data: any,
  req: AuthenticatedRequest,
  res: Response
): void => {
  const version = req.apiVersion?.resolved || DEFAULT_CONFIG.defaultVersion;

  // Apply version-specific response transformations
  const transformedData = transformResponseForVersion(data, version!);

  // Add version metadata
  const response = {
    data: transformedData,
    meta: {
      version: version,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    },
  };

  res.json(response);
};

/**
 * Transform response data based on API version
 */
function transformResponseForVersion(data: any, version: string): any {
  switch (version) {
    case "v1":
      return transformToV1Format(data);
    case "v2":
      return transformToV2Format(data);
    case "v3":
      return transformToV3Format(data);
    default:
      return data;
  }
}

/**
 * Transform data to v1 format (legacy compatibility)
 */
function transformToV1Format(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      // V1 used camelCase for dates
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Remove v2+ fields
      metadata: undefined,
      auditTrail: undefined,
    }));
  }

  return {
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    metadata: undefined,
    auditTrail: undefined,
  };
}

/**
 * Transform data to v2 format (current standard)
 */
function transformToV2Format(data: any): any {
  return data; // v2 is the current standard format
}

/**
 * Transform data to v3 format (enhanced with metadata)
 */
function transformToV3Format(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      _metadata: {
        version: "v3",
        enhanced: true,
        capabilities: ["real-time", "analytics", "ai"],
      },
    }));
  }

  return {
    ...data,
    _metadata: {
      version: "v3",
      enhanced: true,
      capabilities: ["real-time", "analytics", "ai"],
    },
  };
}

// =============================================================================
// VERSION INFORMATION ENDPOINTS
// =============================================================================

/**
 * Get API version information
 */
export const getApiVersionInfo = (req: Request, res: Response): void => {
  res.json({
    current: DEFAULT_CONFIG.currentVersion,
    supported: DEFAULT_CONFIG.supportedVersions,
    deprecated: DEFAULT_CONFIG.deprecatedVersions,
    versions: API_VERSIONS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get version-specific documentation
 */
export const getVersionDocumentation = (req: Request, res: Response): void => {
  const version = req.params.version;
  const versionInfo = API_VERSIONS[version];

  if (!versionInfo) {
    res.status(404).json({
      message: `Documentation for version ${version} not found`,
      availableVersions: Object.keys(API_VERSIONS),
    });
    return;
  }

  res.json({
    version: versionInfo,
    documentation: {
      features: versionInfo.features,
      breakingChanges: versionInfo.breakingChanges,
      migrationGuide: versionInfo.migrationGuide,
    },
    endpoints: getVersionEndpoints(version),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get endpoints available for specific version
 */
function getVersionEndpoints(version: string): string[] {
  // This would typically be generated from route definitions
  const baseEndpoints = ["/users", "/projects", "/auth", "/tenants"];

  switch (version) {
    case "v1":
      return baseEndpoints;
    case "v2":
      return [...baseEndpoints, "/analytics", "/audit", "/webhooks"];
    case "v3":
      return [
        ...baseEndpoints,
        "/analytics",
        "/audit",
        "/webhooks",
        "/ai",
        "/real-time",
      ];
    default:
      return baseEndpoints;
  }
}

// =============================================================================
// PRE-CONFIGURED VERSION MIDDLEWARES
// =============================================================================

/**
 * Standard API versioning with deprecation warnings
 */
export const standardVersioning = apiVersionMiddleware({
  currentVersion: "v2",
  supportedVersions: ["v1", "v2", "v3"],
  deprecatedVersions: ["v1"],
});

/**
 * Strict versioning (blocks deprecated versions)
 */
export const strictVersioning = [
  apiVersionMiddleware(),
  blockDeprecatedVersions(),
];

/**
 * Header-only versioning (no path prefix support)
 */
export const headerVersioning = apiVersionMiddleware({
  pathPrefix: false,
  queryParam: undefined,
});

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      apiVersion?: {
        requested: string;
        resolved: string;
        info: ApiVersionInfo;
      };
    }
  }
}

export default apiVersionMiddleware;
