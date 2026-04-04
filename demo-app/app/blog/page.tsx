import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, article } from "@better-seo/core"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

const posts = [
  { slug: "introducing-better-seo", title: "Introducing Better SEO.js", date: "2026-01-15" },
  { slug: "why-jsonld-matters", title: "Why JSON-LD Structured Data Matters", date: "2026-02-01" },
  {
    slug: "open-graph-deep-dive",
    title: "Open Graph Deep Dive: Perfect Social Previews",
    date: "2026-03-10",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const seo = createSEO(
    {
      title: "Blog — Better SEO.js",
      description: "Articles, guides, and updates about SEO infrastructure for modern apps.",
      canonical: "/blog",
      openGraph: { type: "website", siteName: "Better SEO.js" },
    },
    { baseUrl: siteUrl, titleTemplate: "%s | Better SEO.js" },
  )

  const { toNextMetadata } = await import("@better-seo/next")
  return toNextMetadata(seo)
}

export default function BlogPage() {
  const seo = createSEO(
    {
      title: "Blog",
      description: "Latest articles from the Better SEO.js team.",
      schema: posts.map((p) =>
        article({
          headline: p.title,
          datePublished: p.date,
          url: `${siteUrl}/blog/${p.slug}`,
        }),
      ),
    },
    { baseUrl: siteUrl },
  )

  return (
    <div>
      <h1>Blog</h1>
      <p>Articles, guides, and updates.</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li key={post.slug} style={{ marginBottom: "1.5rem" }}>
            <a href={`/blog/${post.slug}`} style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
              {post.title}
            </a>
            <p style={{ color: "#666" }}>{post.date}</p>
          </li>
        ))}
      </ul>
      <NextJsonLd seo={seo} />
    </div>
  )
}
