import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    "run-cli": "src/run-cli.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: ["@better-seo/assets", "@clack/prompts", "@better-seo/crawl"],
})
