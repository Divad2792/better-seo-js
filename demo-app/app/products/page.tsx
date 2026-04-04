import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, customSchema } from "@better-seo/core"
import { seo } from "@better-seo/next"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

export const metadata: Metadata = seo({
  title: "Products — Better SEO.js",
  description:
    "Explore the Better SEO.js ecosystem: core library, adapters, CLI tools, and optional packages.",
  canonical: "/products",
  openGraph: {
    title: "Products — Better SEO.js",
    type: "product",
    siteName: "Better SEO.js",
  },
})

const products = [
  {
    name: "@better-seo/core",
    description: "Zero-dependency SEO document model. Pure TypeScript, Edge-safe, ~5KB gzip.",
    url: `${siteUrl}/products#core`,
  },
  {
    name: "@better-seo/next",
    description: "Next.js adapter. seo() shorthand, toNextMetadata, NextJsonLd component.",
    url: `${siteUrl}/products#next`,
  },
  {
    name: "@better-seo/react",
    description: "React adapter. Helmet integration, SEOProvider, useSEO hook.",
    url: `${siteUrl}/products#react`,
  },
  {
    name: "@better-seo/cli",
    description:
      "CLI tools: og, icons, splash, scan, add, fix, snapshot, preview, analyze, doctor, init.",
    url: `${siteUrl}/products#cli`,
  },
  {
    name: "@better-seo/crawl",
    description: "Robots.txt, sitemap.xml, RSS/Atom feeds, llms.txt generators.",
    url: `${siteUrl}/products#crawl`,
  },
  {
    name: "@better-seo/assets",
    description: "OG image generation (Satori), icon pipeline, splash screens, web app manifests.",
    url: `${siteUrl}/products#assets`,
  },
]

export default function ProductsPage() {
  const seo = createSEO(
    {
      title: "Products",
      description: "The complete Better SEO.js ecosystem.",
      schema: [
        customSchema({
          "@type": "SoftwareApplication",
          name: "Better SEO.js",
          description: "Unified SEO document model for modern apps",
          url: siteUrl,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      ],
    },
    { baseUrl: siteUrl },
  )

  return (
    <div>
      <h1>Products</h1>
      <p>The complete Better SEO.js ecosystem.</p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        {products.map((p) => (
          <div
            key={p.name}
            style={{ border: "1px solid #eee", padding: "1.5rem", borderRadius: "8px" }}
          >
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>{p.name}</h2>
            <p>{p.description}</p>
          </div>
        ))}
      </div>

      <NextJsonLd seo={seo} />
    </div>
  )
}
