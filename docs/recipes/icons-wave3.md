# Recipe — Icons + PWA manifest (Wave 3)

**Packages:** `better-seo-assets`, `better-seo-cli`  
**Roadmap:** Wave 3 (**A2**, **A3**, **L2**)

## CLI

From the monorepo root (after `npm install` / `npm run build`):

```bash
node packages/better-seo-cli/dist/cli.cjs icons ./path/to/logo.svg -o ./public --name "My Site"
```

Skip `manifest.json` with `--no-manifest`. Tune PWA fields with `--short-name`, `--start-url`, `--display`, `--theme-color`, and icon background with `--bg "#0f172a"`.

## Library (build script)

```ts
import { generateIcons } from "better-seo-assets"

await generateIcons({
  source: "assets/logo.svg",
  outputDir: "public",
  backgroundColor: "#ffffff",
  manifest: {
    name: "My Site",
    shortName: "Site",
    startUrl: "/",
    display: "standalone",
    themeColor: "#0f172a",
  },
})
```

Default outputs: `icon-{16,32,192,512}.png`, `apple-touch-icon.png`, `maskable-icon.png`, `favicon.ico`, and `manifest.json` when `manifest` is set.

Use **`formatWebManifest`** / **`buildWebAppManifest`** when you need JSON without writing icon files.

## Tests in this repo

- **`packages/better-seo-assets`**: `generateIcons` + manifest helpers (`vitest`).
- **`packages/better-seo-cli`**: `icons` in `runCli` + **built `dist/cli.cjs` smoke** (`vitest`).

Keep this pipeline on **Node** (Sharp + filesystem), not Edge.
