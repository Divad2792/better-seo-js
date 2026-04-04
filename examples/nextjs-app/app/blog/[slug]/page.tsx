import type { Metadata } from "next"
import { toNextMetadata } from "@better-seo/next"
import { article, createSEO } from "@better-seo/core"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = createSEO(
    {
      title: `Post: ${slug}`,
      description: "Async generateMetadata (FEATURES N6 / e2e).",
      canonical: `/blog/${slug}`,
      openGraph: {
        type: "article",
        // Illustrative published time for rich results testing
        publishedTime: "2025-01-15T08:00:00Z",
      },
      schema: [
        article({
          headline: `Post: ${slug}`,
          description: "Async generateMetadata (FEATURES N6 / e2e).",
          url: `${site.replace(/\/$/, "")}/blog/${slug}`,
        }),
      ],
    },
    { baseUrl: site },
  )
  return toNextMetadata(doc)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  return (
    <main>
      <h1>Blog — {slug}</h1>
      <p>Dynamic route for e2e.</p>
    </main>
  )
}
