import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, article, faqPage, breadcrumbList } from "@better-seo/core"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

type Props = {
  params: Promise<{ slug: string }>
}

// Simulated post data — in production this would come from CMS / DB
const postDB: Record<string, { title: string; date: string; author: string; content: string }> = {
  "introducing-better-seo": {
    title: "Introducing Better SEO.js",
    date: "2026-01-15",
    author: "Jane Smith",
    content: "Today we're launching Better SEO.js — a unified SEO document model for modern apps.",
  },
  "why-jsonld-matters": {
    title: "Why JSON-LD Structured Data Matters",
    date: "2026-02-01",
    author: "Jane Smith",
    content: "JSON-LD is the only structured data format Google officially recommends.",
  },
  "open-graph-deep-dive": {
    title: "Open Graph Deep Dive: Perfect Social Previews",
    date: "2026-03-10",
    author: "John Doe",
    content:
      "Open Graph tags control how your links look when shared on Facebook, LinkedIn, and more.",
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = postDB[slug] ?? { title: slug, date: "2026-01-01", author: "Unknown", content: "" }

  const seo = createSEO(
    {
      title: `${post.title} — Blog`,
      description: post.content.slice(0, 160),
      canonical: `/blog/${slug}`,
      openGraph: {
        type: "article",
        title: post.title,
        description: post.content,
        publishedTime: post.date,
        authors: [post.author],
        images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: post.title }],
        siteName: "Better SEO.js",
      },
      twitter: {
        card: "summary_large_image",
        site: "@better_seo_js",
        creator: "@better_seo_js",
      },
      schema: [
        article({
          headline: post.title,
          datePublished: post.date,
          author: post.author,
          url: `${siteUrl}/blog/${slug}`,
          description: post.content,
        }),
        breadcrumbList({
          items: [
            { name: "Home", url: siteUrl, position: 1 },
            { name: "Blog", url: `${siteUrl}/blog`, position: 2 },
            { name: post.title, url: `${siteUrl}/blog/${slug}`, position: 3 },
          ],
        }),
      ],
    },
    { baseUrl: siteUrl, titleTemplate: "%s | Better SEO.js Blog" },
  )

  const { toNextMetadata } = await import("@better-seo/next")
  return toNextMetadata(seo)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = postDB[slug] ?? {
    title: slug,
    date: "2026-01-01",
    author: "Unknown",
    content: "Post not found.",
  }

  const seo = createSEO(
    {
      title: post.title,
      description: post.content,
      schema: [
        faqPage({
          questions: [
            {
              question: `What is "${post.title}" about?`,
              answer: post.content,
            },
          ],
        }),
      ],
    },
    { baseUrl: siteUrl },
  )

  return (
    <article>
      <header>
        <p style={{ color: "#666" }}>
          By {post.author} · {post.date}
        </p>
        <h1>{post.title}</h1>
      </header>
      <p>{post.content}</p>
      <hr style={{ margin: "2rem 0" }} />
      <p>
        ← <a href="/blog">Back to Blog</a>
      </p>
      <NextJsonLd seo={seo} />
    </article>
  )
}

export async function generateStaticParams() {
  return Object.keys(postDB).map((slug) => ({ slug }))
}
