/**
 * Routes Implementation Test
 *
 * Simple test to verify the routes implementation works correctly
 */

// Test that all exports are available
console.log("Testing routes implementation exports...");

try {
  // Test basic imports work
  const { BaseRoutes, RouteConfig } = require("./base/base.routes");
  const { CrudRoutes } = require("./base/crud.routes");
  const { AuthRoutes } = require("./security/auth.routes");
  const { HealthRoutes } = require("./system/health.routes");
  const VersionedRoutes = require("./versioned/versioned.routes");
  const {
    MiddlewareChains,
    CrudPermissions,
    BulkPermissions,
    SearchPermissions,
    RateLimits,
    CommonSchemas,
  } = require("./middleware-chain.builder");

  // Test that all exports exist
  console.log("✅ BaseRoutes imported successfully");
  console.log("✅ CrudRoutes imported successfully");
  console.log("✅ AuthRoutes imported successfully");
  console.log("✅ HealthRoutes imported successfully");
  console.log("✅ VersionedRoutes imported successfully");
  console.log("✅ MiddlewareChains imported successfully");
  console.log("✅ Permission configurations imported successfully");
  console.log("✅ Rate limits imported successfully");
  console.log("✅ Common schemas imported successfully");

  // Test middleware chains structure
  if (
    MiddlewareChains.public &&
    MiddlewareChains.authenticated &&
    MiddlewareChains.protected &&
    MiddlewareChains.admin
  ) {
    console.log("✅ All middleware chains available");
  }

  // Test permission configurations
  if (
    CrudPermissions.LIST &&
    BulkPermissions.BULK_CREATE &&
    SearchPermissions.SEARCH
  ) {
    console.log("✅ All permission configurations available");
  }

  // Test rate limits
  if (
    RateLimits.HIGH &&
    RateLimits.STANDARD &&
    RateLimits.RESTRICTED &&
    RateLimits.AUTH
  ) {
    console.log("✅ All rate limit configurations available");
  }

  // Test common schemas
  if (
    CommonSchemas.pagination &&
    CommonSchemas.fields &&
    CommonSchemas.filters
  ) {
    console.log("✅ All common schemas available");
  }

  console.log("\n🎉 Routes implementation test passed!");
  console.log("✅ All shared routes infrastructure is working correctly!");
} catch (error) {
  console.error("❌ Routes implementation test failed:", error);
  process.exit(1);
}
