#!/usr/bin/env node

/**
 * RBAC Schema Watcher
 * Watches RBAC.schema.v7.yml for changes and regenerates types
 *
 * Usage: npm run watch:rbac
 */

const chokidar = require("chokidar");
const path = require("path");
const { generateRbacTypes } = require("./generate-rbac-types.js");

// Files to watch
const SCHEMA_FILES = [
  path.join(__dirname, "../RBAC.schema.v7.yml"),
  path.join(__dirname, "../../Backend/RBAC.schema.v7.yml"),
];

console.log("🔍 Starting RBAC schema watcher...");
console.log("📁 Watching files:", SCHEMA_FILES);

// Initialize watcher
const watcher = chokidar.watch(SCHEMA_FILES, {
  persistent: true,
  ignoreInitial: false, // Generate on startup
});

// Handle file changes
watcher
  .on("ready", () => {
    console.log("✅ Watcher ready. Generating initial types...");
    generateRbacTypes();
  })
  .on("change", (filePath) => {
    console.log(`🔄 Schema changed: ${path.basename(filePath)}`);
    console.log("🔄 Regenerating RBAC types...");
    generateRbacTypes();
  })
  .on("error", (error) => {
    console.error("❌ Watcher error:", error);
  });

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down RBAC watcher...");
  watcher.close();
  process.exit(0);
});
