import { defineConfig } from "vitest/config"

/** Limit coverage to mapping logic; `register` / `surface` are thin wiring tested via E2E. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/to-next-metadata.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: {
        lines: 82,
        functions: 80,
        branches: 72,
        statements: 82,
      },
    },
  },
})
