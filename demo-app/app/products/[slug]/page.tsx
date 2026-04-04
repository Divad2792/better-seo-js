import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, product, breadcrumbList } from "@better-seo/core"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

type Props = {
  params: Promise<{ slug: string }>
}

const productDB: Record<string, { name: string; description: string; price: string }> = {
  core: {
    name: "@better-seo/core",
    description: "The zero-dependency SEO document model. Pure TypeScript, Edge-safe, ~5KB gzip. The foundation of everything.",
    price: "Free",
  },
  next: {
    name: "@better-seo/next",
    description: "Next.js adapter with seo() shorthand, toNextMetadata, and NextJsonLd component.",
    price: "Free",
  },
  cli: {
    name: "@better-seo/cli",
    description: "CLI toolkit: generate OG images, icons, splash screens, scan/fix codebases, and more.",
    price: "Free",
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = productDB[slug] ?? { name: slug, description: "Product detail", price: "Free" }

  const seo = createSEO(
    {
      title: `${p.name} — Products`,
      description: p.description,
      canonical: `/products/${slug}`,
      openGraph: {
        type: "product",
        title: p.name,
        description: p.description,
        siteName: "Better SEO.js",
      },
      schema: [
        product({
          name: p.name,
          description: p.description,
          url: `${siteUrl}/products/${slug}`,
        }),
        breadcrumbList({
          items: [
            { name: "Home", url: siteUrl, position: 1 },
            { name: "Products", url: `${siteUrl}/products`, position: 2 },
            { name: p.name, url: `${siteUrl}/products/${slug}`, position: 3 },
          ],
        }),
      ],
    },
    { baseUrl: siteUrl, titleTemplate: "%s | Better SEO.js" },
  )

  const { toNextMetadata } = await import("@better-seo/next")
  return toNextMetadata(seo)
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const p = productDB[slug] ?? { name: slug, description: "Product detail.", price: "Free" }

  const seo = createSEO(
    {
      title: p.name,
      description: p.description,
      schema: [
        product({
          name: p.name,
          description: p.description,
          url: `${siteUrl}/products/${slug}`,
        }),
      ],
    },
    { baseUrl: siteUrl },
  )

  return (
    <div>
      <h1>{p.name}</h1>
      <p>{p.description}</p>
      <p><strong>Price:</strong> {p.price}</p>
      <p>
        ← <a href="/products">Back to Products</a>
      </p>
      <NextJsonLd seo={seo} />
    </div>
  )
}

export async function generateStaticParams() {
  return Object.keys(productDB).map((slug) => ({ slug }))
}
