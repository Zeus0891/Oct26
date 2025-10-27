/**
 * RBAC Schema Watcher
 * Watches RBAC.schema.v7.yml for changes and auto-regenerates types
 * Provides hot-reload capability for development
 */

const chokidar = require("chokidar");
const path = require("path");
const { RbacTypesGenerator, CONFIG } = require("./generate-rbac-types.js");

// =============================================================================
// WATCHER CONFIGURATION
// =============================================================================

const WATCH_CONFIG = {
  schemaPath: CONFIG.schemaPath,
  debounceMs: 500, // Wait 500ms after file change before regenerating
  ignoreInitial: false,
  persistent: true,
};

// =============================================================================
// DEBOUNCER UTILITY
// =============================================================================

class Debouncer {
  constructor(delay) {
    this.delay = delay;
    this.timeoutId = null;
  }

  debounce(fn) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      fn();
      this.timeoutId = null;
    }, this.delay);
  }
}

// =============================================================================
// SCHEMA WATCHER
// =============================================================================

class RbacSchemaWatcher {
  constructor(config) {
    this.config = config;
    this.generator = new RbacTypesGenerator(CONFIG);
    this.debouncer = new Debouncer(config.debounceMs);
    this.isGenerating = false;
  }

  async regenerateTypes() {
    if (this.isGenerating) {
      console.log("⏳ Generation already in progress, skipping...");
      return;
    }

    try {
      this.isGenerating = true;
      console.log("\n🔄 Schema change detected, regenerating types...");

      const result = await this.generator.generate();

      console.log("✅ Auto-regeneration complete!");
      console.log(
        `📊 Generated ${result.metadata.roleCount} roles and ${result.metadata.permissionCount} permissions\n`
      );
    } catch (error) {
      console.error("❌ Auto-regeneration failed:", error.message);
    } finally {
      this.isGenerating = false;
    }
  }

  start() {
    console.log("👀 Starting RBAC schema watcher...");
    console.log(`📂 Watching: ${this.config.schemaPath}`);

    // Check if schema file exists
    const fs = require("fs");
    if (!fs.existsSync(this.config.schemaPath)) {
      console.error(`❌ Schema file not found: ${this.config.schemaPath}`);
      console.log(
        "💡 Please ensure RBAC.schema.v7.yml exists in the project root"
      );
      process.exit(1);
    }

    const watcher = chokidar.watch(this.config.schemaPath, {
      ignoreInitial: this.config.ignoreInitial,
      persistent: this.config.persistent,
    });

    watcher.on("change", (filePath) => {
      console.log(`📝 File changed: ${path.basename(filePath)}`);

      this.debouncer.debounce(() => {
        this.regenerateTypes();
      });
    });

    watcher.on("add", (filePath) => {
      console.log(`📄 File added: ${path.basename(filePath)}`);
      this.regenerateTypes();
    });

    watcher.on("error", (error) => {
      console.error("👀 Watcher error:", error);
    });

    watcher.on("ready", () => {
      console.log("✅ RBAC schema watcher ready");
      console.log(
        "💡 Modify RBAC.schema.v7.yml to see auto-regeneration in action\n"
      );

      // Generate initial types if not ignoring initial
      if (!this.config.ignoreInitial) {
        this.regenerateTypes();
      }
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down RBAC schema watcher...");
      watcher.close();
      process.exit(0);
    });

    return watcher;
  }
}

// =============================================================================
// ENHANCED WATCHER WITH FILE VALIDATION
// =============================================================================

class ValidatingSchemaWatcher extends RbacSchemaWatcher {
  async validateSchemaFile() {
    const fs = require("fs");
    const yaml = require("js-yaml");

    try {
      const content = fs.readFileSync(this.config.schemaPath, "utf8");
      const schema = yaml.load(content);

      // Basic validation
      const errors = [];

      if (!schema.version) errors.push("Missing version field");
      if (!schema.roles || !Array.isArray(schema.roles))
        errors.push("Missing or invalid roles array");
      if (!schema.permissions || typeof schema.permissions !== "object")
        errors.push("Missing or invalid permissions object");

      if (errors.length > 0) {
        console.warn("⚠️  Schema validation warnings:");
        errors.forEach((error) => console.warn(`   - ${error}`));
        return false;
      }

      console.log(`✅ Schema validation passed (v${schema.version})`);
      return true;
    } catch (error) {
      console.error("❌ Schema validation failed:", error.message);
      return false;
    }
  }

  async regenerateTypes() {
    // Validate schema before regenerating
    const isValid = await this.validateSchemaFile();

    if (!isValid) {
      console.log("⏭️  Skipping regeneration due to validation errors");
      return;
    }

    await super.regenerateTypes();
  }
}

// =============================================================================
// CLI EXECUTION
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const validate = args.includes("--validate");
  const initial = !args.includes("--no-initial");

  const config = {
    ...WATCH_CONFIG,
    ignoreInitial: !initial,
  };

  try {
    const WatcherClass = validate ? ValidatingSchemaWatcher : RbacSchemaWatcher;
    const watcher = new WatcherClass(config);

    watcher.start();
  } catch (error) {
    console.error("❌ Failed to start watcher:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { RbacSchemaWatcher, ValidatingSchemaWatcher };
