import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
  external: ["satori", "@resvg/resvg-js", "react", "@fontsource/inter", "sharp", "to-ico"],
})
