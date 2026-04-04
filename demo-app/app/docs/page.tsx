import type { Metadata } from "next"
import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, mergeSEO, techArticle, breadcrumbList } from "@better-seo/core"
import { withSEO } from "@better-seo/next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
const baseConfig = { baseUrl: siteUrl, titleTemplate: "%s | Docs" }

// This simulates what a docs layout would provide
const layoutSeo = createSEO(
  {
    title: "Documentation",
    description: "Official documentation for Better SEO.js",
    canonical: "/docs",
    openGraph: { siteName: "Better SEO.js Docs", type: "website" },
    meta: {
      alternates: {
        languages: {
          "en-US": `${siteUrl}/docs/en`,
          "x-default": siteUrl,
        },
      },
    },
    schema: [
      breadcrumbList({
        items: [
          { name: "Home", url: siteUrl, position: 1 },
          { name: "Docs", url: `${siteUrl}/docs`, position: 2 },
        ],
      }),
    ],
  },
  baseConfig,
)

// Page-level SEO that merges with layout
const pageInput = {
  title: "Getting Started",
  description: "Install Better SEO.js and add SEO to your Next.js app in under 60 seconds.",
  canonical: "/docs/getting-started",
  schema: [
    techArticle({
      headline: "Getting Started with Better SEO.js",
      description: "Install and configure Better SEO.js in your Next.js app.",
      url: `${siteUrl}/docs/getting-started`,
      author: "Jane Smith",
      datePublished: "2026-01-15",
      keywords: ["SEO", "Next.js", "TypeScript", "structured data"],
    }),
  ],
}

export const metadata: Metadata = withSEO(layoutSeo, pageInput, baseConfig)

export default function DocsPage() {
  const mergedSeo = mergeSEO(layoutSeo, pageInput, baseConfig)

  return (
    <div>
      <h1>Getting Started</h1>
      <p>Install Better SEO.js and add SEO to your Next.js app in under 60 seconds.</p>

      <h2>Installation</h2>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
        {`npm install @better-seo/core @better-seo/next`}
      </pre>

      <h2>Usage</h2>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
        {`import { seo } from "@better-seo/next"
export const metadata = seo({ title: "Home" })`}
      </pre>

      <h2>Features Demonstrated</h2>
      <ul>
        <li>
          <strong>mergeSEO</strong> — layout + page composition
        </li>
        <li>
          <strong>withSEO</strong> — Next.js metadata export
        </li>
        <li>
          <strong>TechArticle schema</strong> — technical documentation markup
        </li>
        <li>
          <strong>BreadcrumbList</strong> — navigation hierarchy
        </li>
        <li>
          <strong>hreflang alternates</strong> — i18n support
        </li>
      </ul>

      <NextJsonLd seo={mergedSeo} />
    </div>
  )
}
