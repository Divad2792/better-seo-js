import { NextJsonLd } from "@better-seo/next/json-ld"
import { createSEO, product, faqPage } from "@better-seo/core"
import { seo } from "@better-seo/next"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

// Demonstrate seo() shorthand with full config
export const metadata: Metadata = seo({
  title: "Pricing — Better SEO.js",
  description: "Simple, transparent pricing. Start free, scale as you grow.",
  canonical: "/pricing",
  openGraph: {
    title: "Pricing — Better SEO.js",
    type: "product",
    siteName: "Better SEO.js",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Pricing" }],
  },
})

export default function PricingPage() {
  const seo = createSEO(
    {
      title: "Pricing — Better SEO.js",
      description: "Simple, transparent pricing. Start free, scale as you grow.",
      schema: [
        product({
          name: "Better SEO.js Pro",
          description: "Advanced SEO features for growing teams",
          url: `${siteUrl}/pricing`,
        }),
        faqPage({
          questions: [
            {
              question: "Is there a free tier?",
              answer: "Yes! The core library is completely free and open source under MIT license.",
            },
            {
              question: "What does the Pro plan include?",
              answer: "Pro includes hosted OG generation, team workflows, and priority support.",
            },
            {
              question: "Can I self-host?",
              answer: "Absolutely. The entire library works offline — no hosted dependency required.",
            },
          ],
        }),
      ],
    },
    { baseUrl: siteUrl, titleTemplate: "%s | Better SEO.js" },
  )

  return (
    <div>
      <h1>Pricing</h1>
      <p>Simple, transparent pricing for every team size.</p>

      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        <div style={{ border: "1px solid #eee", padding: "2rem", borderRadius: "8px" }}>
          <h2>Free</h2>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>$0/mo</p>
          <ul>
            <li>Full core library</li>
            <li>All adapters</li>
            <li>CLI tools</li>
            <li>Community support</li>
          </ul>
        </div>
        <div style={{ border: "2px solid #0070f3", padding: "2rem", borderRadius: "8px" }}>
          <h2>Pro</h2>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>$29/mo</p>
          <ul>
            <li>Everything in Free</li>
            <li>Hosted OG generation</li>
            <li>Team workflows</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>

      <h2 style={{ marginTop: "3rem" }}>Frequently Asked Questions</h2>
      <dl>
        <dt><strong>Is there a free tier?</strong></dt>
        <dd>Yes! The core library is completely free and open source under MIT license.</dd>

        <dt><strong>What does the Pro plan include?</strong></dt>
        <dd>Pro includes hosted OG generation, team workflows, and priority support.</dd>

        <dt><strong>Can I self-host?</strong></dt>
        <dd>Absolutely. The entire library works offline — no hosted dependency required.</dd>
      </dl>

      <NextJsonLd seo={seo} />
    </div>
  )
}
