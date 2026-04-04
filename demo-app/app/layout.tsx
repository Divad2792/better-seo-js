import type { Metadata } from "next"
import { NextJsonLd } from "@better-seo/next/json-ld"
import { organization, webSite } from "@better-seo/core"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          <a href="/" style={{ marginRight: "1rem" }}>
            Home
          </a>
          <a href="/about" style={{ marginRight: "1rem" }}>
            About
          </a>
          <a href="/pricing" style={{ marginRight: "1rem" }}>
            Pricing
          </a>
          <a href="/blog" style={{ marginRight: "1rem" }}>
            Blog
          </a>
          <a href="/products" style={{ marginRight: "1rem" }}>
            Products
          </a>
          <a href="/docs" style={{ marginRight: "1rem" }}>
            Docs
          </a>
        </nav>
        <main style={{ padding: "2rem" }}>{children}</main>
        <footer style={{ padding: "2rem", borderTop: "1px solid #eee", marginTop: "4rem" }}>
          <p>Better SEO.js Demo — Full capability showcase</p>
        </footer>
      </body>
    </html>
  )
}
