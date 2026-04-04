# Better SEO.js — Demo App

A comprehensive Next.js demo showcasing every capability of the `@better-seo/*` ecosystem.

## Pages & What They Demonstrate

| Page               | Feature                                 | Schema Types                     |
| ------------------ | --------------------------------------- | -------------------------------- |
| `/`                | `seo()` shorthand — the 60-second voilà | —                                |
| `/about`           | `createSEO` explicit config             | Organization, Person             |
| `/pricing`         | `seo()` + FAQPage                       | Product, FAQPage                 |
| `/blog`            | `generateMetadata` async                | Article (listing)                |
| `/blog/[slug]`     | Dynamic route + async                   | Article, BreadcrumbList, FAQPage |
| `/products`        | Product catalog + customSchema          | SoftwareApplication              |
| `/products/[slug]` | Dynamic product detail                  | Product, BreadcrumbList          |
| `/docs`            | `mergeSEO` layout + page merge          | TechArticle, BreadcrumbList      |

## Features Demonstrated

- **Voilà pattern**: `export const metadata = seo({ title: "..." })`
- **Explicit createSEO**: Full control over meta, OG, Twitter, schema
- **mergeSEO / withSEO**: Layout + page composition
- **generateMetadata**: Async metadata for dynamic routes
- **JSON-LD**: Organization, Person, Product, Article, FAQPage, BreadcrumbList, TechArticle, SoftwareApplication
- **OG images**: 1200×630 PNG with width/height/alt
- **Twitter Cards**: summary_large_image with fallback to OG
- **hreflang alternates**: i18n support
- **Canonical URLs**: Resolved from baseUrl + path
- **Title templates**: `%s | Better SEO.js` pattern
- **NextJsonLd**: Safe JSON-LD embedding in App Router

## Quick Start

```bash
# From monorepo root
npm run build -w @better-seo/core
npm run build -w @better-seo/next
npm run build -w @better-seo/assets
npm run build -w @better-seo/cli

cd demo-app
npm install

# Generate assets (OG image + icons)
npm run assets

# Start dev server
npm run dev
# → http://localhost:3001
```

## Run E2E Tests

```bash
cd demo-app
npx playwright install chromium
npx playwright test
```

## CLI Commands Used

```bash
# OG image generation
npx better-seo og "Better SEO.js Demo" -o public/og.png --site-name "Better SEO" --theme dark

# Icon generation
npx better-seo icons assets/logo.svg -o public --no-manifest

# Snapshot / Preview / Analyze
npx better-seo snapshot --input seo.json --out tags.json
npx better-seo preview --input seo.json --out preview.html --open
npx better-seo analyze --input seo.json
```
