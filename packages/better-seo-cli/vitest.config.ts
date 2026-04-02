import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      /** TUI flows are exercised manually / via binary smoke; clack prompts are costly to branch-cover. */
      exclude: [
        "src/**/*.test.ts",
        "src/cli.ts",
        "src/launch-interactive.ts",
        "src/cli-devtools.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 75,
        /** Clack/interactive paths keep branch % below 65 without full TUI harness. */
        branches: 63,
        statements: 80,
      },
    },
  },
})
