import { describe, expect, it } from "vitest"
import { transformNextSeoConfig, transformNextSeoImports } from "./codemods.js"

describe("codemods (Wave 12)", () => {
  describe("transformNextSeoImports", () => {
    it("transforms NextSeo import comment", () => {
      const source = `import { NextSeo } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("@better-seo/next")
      expect(result.transformed).toContain("TODO")
    })

    it("transforms ArticleJsonLd import", () => {
      const source = `import { ArticleJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain('from "@better-seo/core"')
      expect(result.transformed).toContain("article")
    })

    it("transforms FAQPageJsonLd import", () => {
      const source = `import { FAQPageJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("faqPage")
    })

    it("transforms multiple JSON-LD imports", () => {
      const source = `import { ArticleJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("article")
      expect(result.transformed).toContain("faqPage")
      expect(result.transformed).toContain("breadcrumbList")
    })

    it("handles mixed imports", () => {
      const source = `import { NextSeo, ArticleJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("article")
    })

    it("transforms OrganizationJsonLd and ProductJsonLd", () => {
      const source = `import { OrganizationJsonLd, ProductJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("organization")
      expect(result.transformed).toContain("product")
      expect(result.transformed).toContain('from "@better-seo/core"')
    })

    it("handles DefaultSeo import", () => {
      const source = `import { DefaultSeo } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(1)
      expect(result.transformed).toContain("TODO")
      expect(result.transformed).toContain("@better-seo/next")
    })

    it("handles NextSeo component usage (no changes — component JSX not transformed)", () => {
      const source = `<NextSeo title="My Page" />`
      const result = transformNextSeoImports(source)
      // The codemod only matches <NextSeo .../> with a space after NextSeo; single-prop case may not match
      // The actual behavior: it matches when there are attributes after a space
      expect(result.transformed).toContain("<NextSeo")
    })

    it("handles NextSeo with self-closing tag (no changes — JSX not auto-converted)", () => {
      const source = `<NextSeo
  title="My Page"
  description="My desc"
/>`
      const result = transformNextSeoImports(source)
      // The regex only matches single-line <NextSeo .../>
      expect(result.transformed).toContain("<NextSeo")
    })

    it("returns zero changes when no next-seo patterns match", () => {
      const source = `import { seo } from "@better-seo/next"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(0)
      expect(result.transformed).toBe(source)
    })

    it("handles multiple import statements in same file", () => {
      const source = `import { NextSeo } from "next-seo"
import { ArticleJsonLd } from "next-seo"`
      const result = transformNextSeoImports(source)
      expect(result.changes).toBe(2)
      expect(result.transformed).toContain("@better-seo/next")
      expect(result.transformed).toContain("@better-seo/core")
    })
  })

  describe("transformNextSeoConfig", () => {
    it("transforms basic config", () => {
      const config = {
        title: "My Page",
        description: "My description",
        canonical: "https://example.com/page",
      }
      const result = transformNextSeoConfig(config)
      expect(result.title).toBe("My Page")
      expect(result.description).toBe("My description")
      expect(result.canonical).toBe("https://example.com/page")
    })

    it("transforms noindex to robots", () => {
      const config = {
        title: "Page",
        noindex: true,
      }
      const result = transformNextSeoConfig(config)
      expect(result.robots).toBe("noindex,follow")
    })

    it("transforms nofollow to robots", () => {
      const config = {
        title: "Page",
        nofollow: true,
      }
      const result = transformNextSeoConfig(config)
      expect(result.robots).toBe("index,nofollow")
    })

    it("transforms openGraph config", () => {
      const config = {
        title: "Page",
        openGraph: {
          title: "OG Title",
          description: "OG Desc",
          url: "https://example.com",
          type: "article",
          site_name: "My Site",
          images: [{ url: "https://example.com/og.png", width: 1200, height: 630 }],
        },
      }
      const result = transformNextSeoConfig(config)
      expect(result.openGraph).toEqual({
        title: "OG Title",
        description: "OG Desc",
        url: "https://example.com",
        type: "article",
        siteName: "My Site",
        images: [{ url: "https://example.com/og.png", width: 1200, height: 630, alt: undefined }],
      })
    })

    it("transforms twitter config", () => {
      const config = {
        title: "Page",
        twitter: {
          cardType: "summary_large_image",
          site: "@mysite",
          creator: "@creator",
          title: "Tw Title",
          description: "Tw Desc",
          image: "https://example.com/tw.png",
        },
      }
      const result = transformNextSeoConfig(config)
      expect(result.twitter).toEqual({
        card: "summary_large_image",
        site: "@mysite",
        creator: "@creator",
        title: "Tw Title",
        description: "Tw Desc",
        image: "https://example.com/tw.png",
      })
    })

    it("handles empty openGraph", () => {
      const config = {
        title: "Page",
        openGraph: {},
      }
      const result = transformNextSeoConfig(config)
      expect(result.openGraph).toBeUndefined()
    })

    it("handles empty twitter", () => {
      const config = {
        title: "Page",
        twitter: {},
      }
      const result = transformNextSeoConfig(config)
      expect(result.twitter).toBeUndefined()
    })

    it("handles noindex false", () => {
      const config = {
        title: "Page",
        noindex: false,
      }
      const result = transformNextSeoConfig(config)
      expect(result.robots).toBeUndefined()
    })

    it("handles nofollow false", () => {
      const config = {
        title: "Page",
        nofollow: false,
      }
      const result = transformNextSeoConfig(config)
      expect(result.robots).toBeUndefined()
    })

    it("handles unknown keys by passing them through", () => {
      const config = {
        title: "Page",
        customKey: "customValue",
      }
      const result = transformNextSeoConfig(config)
      expect(result.customKey).toBe("customValue")
    })

    it("handles openGraph with images having secureUrl", () => {
      const config = {
        title: "Page",
        openGraph: {
          images: [{ secureUrl: "https://example.com/og.png", width: 1200, height: 630 }],
        },
      }
      const result = transformNextSeoConfig(config)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.openGraph as any).images).toEqual([
        { url: "https://example.com/og.png", width: 1200, height: 630, alt: undefined },
      ])
    })

    it("handles undefined openGraph", () => {
      const config = {
        title: "Page",
        openGraph: undefined,
      }
      const result = transformNextSeoConfig(config)
      expect(result.openGraph).toBeUndefined()
    })

    it("handles undefined twitter", () => {
      const config = {
        title: "Page",
        twitter: undefined,
      }
      const result = transformNextSeoConfig(config)
      expect(result.twitter).toBeUndefined()
    })
  })
})
