# Next.js App Router example (golden path)

**FEATURES N10** — Playwright E2E assert real head output. From the **monorepo root**:

```bash
npm install
npm run build
npm run test:e2e -w nextjs-app
```

## Asset pipeline (Wave 4)

Before `next dev` or `next build`, **`predev` / `prebuild`** runs **`npm run assets`**, which invokes **`@better-seo/cli`** to generate **`public/og-example.png`** and icon files from **`assets/logo.svg`**. Requires **`packages/better-seo-cli`** (and dependencies) to be built first — use root **`npm run build`**, not only this folder in isolation.

**`public/`** is gitignored except **`public/.gitignore`**, so PNGs/ICO are recreated by **`assets`** every time; CI and local **`npm run build`** rely on that step.
