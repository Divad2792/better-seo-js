import { seo } from "@better-seo/next"

export const metadata = seo({
  title: "Better SEO.js — Programmable SEO for Modern Apps",
  description: "The complete SEO document model for Next.js. Meta tags, Open Graph, Twitter Cards, JSON-LD structured data — one unified API.",
  canonical: "/",
  openGraph: {
    type: "website",
    siteName: "Better SEO.js",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Better SEO.js — Programmable SEO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@better_seo_js",
    creator: "@better_seo_js",
  },
})

export default function HomePage() {
  return (
    <div>
      <h1>Better SEO.js</h1>
      <p>The quickest way from <code>npm install</code> to working SEO.</p>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px" }}>
{`import { seo } from "@better-seo/next"
export const metadata = seo({ title: "Home" })`}
      </pre>
      <h2>What this demo showcases</h2>
      <ul>
        <li><strong>Home page</strong> — <code>seo()</code> shorthand with full OG + Twitter</li>
        <li><strong>About</strong> — <code>createSEO</code> + Organization + Person schema</li>
        <li><strong>Pricing</strong> — <code>seo()</code> + Product + Offer schema</li>
        <li><strong>Blog</strong> — <code>generateMetadata</code> async + Article schema</li>
        <li><strong>Products</strong> — <code>createSEO</code> + SoftwareApplication schema</li>
        <li><strong>Docs</strong> — <code>mergeSEO</code> layout + page composition</li>
        <li><strong>Blog post</strong> — Dynamic route with slug + FAQPage schema</li>
        <li><strong>Product detail</strong> — Dynamic route + BreadcrumbList schema</li>
      </ul>
    </div>
  )
}
