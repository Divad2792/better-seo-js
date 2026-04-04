import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, organization, person } from "@better-seo/core"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

export const metadata: Metadata = {}

export default function AboutPage() {
  const seo = createSEO(
    {
      title: "About — Better SEO.js",
      description: "Learn about the team behind Better SEO.js and our mission to make SEO infrastructure for modern apps.",
      canonical: "/about",
      openGraph: {
        title: "About Better SEO.js",
        description: "The team behind Better SEO.js",
        type: "website",
        siteName: "Better SEO.js",
        images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "About page OG" }],
      },
      schema: [
        organization({
          name: "Better SEO.js",
          url: siteUrl,
          logo: `${siteUrl}/og.png`,
          sameAs: [
            "https://github.com/OWNER/better-seo-js",
            "https://twitter.com/better_seo_js",
          ],
        }),
        person({
          name: "Jane Smith",
          jobTitle: "Lead Developer",
          url: `${siteUrl}/about`,
        }),
      ],
    },
    { baseUrl: siteUrl, titleTemplate: "%s | Better SEO.js" },
  )

  return (
    <div>
      <h1>About Better SEO.js</h1>
      <p>
        This page demonstrates <strong>Organization</strong> and <strong>Person</strong> JSON-LD
        structured data — visible in the page source.
      </p>
      <NextJsonLd seo={seo} />
      <h2>Why Better SEO.js?</h2>
      <p>
        Current SEO solutions for React/Next.js are either static config systems or manual
        everything. Better SEO.js provides a unified SEO document model that normalizes meta tags,
        Open Graph, Twitter Cards, and JSON-LD into a single source of truth.
      </p>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
{`import { createSEO, organization, person } from "@better-seo/core"

const seo = createSEO({
  title: "About — Better SEO.js",
  schema: [
    organization({ name: "Better SEO.js", url: "https://example.com" }),
    person({ name: "Jane Smith", jobTitle: "Lead Developer" }),
  ],
}, { baseUrl: "https://example.com" })`}
      </pre>
    </div>
  )
}
