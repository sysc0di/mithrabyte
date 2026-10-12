import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Load test environment (points at mithrabyte_test) before test files import
// server libraries that read process.env at import time.
config({ path: path.join(rootDir, ".env.test"), override: true });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: [path.join(rootDir, "tests/setup.js")],
    testTimeout: 30000,
    hookTimeout: 60000,
    teardownTimeout: 30000,
    sequence: { concurrent: false, shuffle: false },
    // Test files share the same PostgreSQL database; run them sequentially
    // so test-reset cleanup cannot race across workers.
    fileParallelism: false,
  },
});