/**
 * Shared Controllers Index
 *
 * Main entry point for all shared controller classes and utilities.
 * Provides a centralized export for the entire shared controller layer.
 *
 * @module SharedControllers
 * @category Shared Controllers
 * @description Main controller layer exports
 * @version 1.0.0
 */

// Base controllers
export * from "./base";

// Security controllers
export * from "./security";

// Re-export common types and interfaces
export type { ControllerConfig } from "./base";

export type { SecurityControllerConfig } from "./security";

/**
 * Controller layer configuration
 */
export interface ControllerLayerConfig {
  /** Base controller configuration */
  base?: import("./base").ControllerConfig;
  /** Security controller configuration */
  security?: import("./security").SecurityControllerConfig;
}

/**
 * Controller module metadata
 */
export const CONTROLLER_MODULE_INFO = {
  name: "SharedControllers",
  version: "1.0.0",
  description: "Shared controller layer for Express.js applications",
  controllers: {
    base: [
      "BaseController",
      "CrudController",
      "SearchController",
      "ExportController",
      "BulkController",
    ],
    security: ["AuthController"],
    system: ["HealthController"],
  },
} as const;
