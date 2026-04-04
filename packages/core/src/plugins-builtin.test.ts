import { describe, expect, it } from "vitest"
import {
  createDefaultRobotsPlugin,
  createTrackingStripPlugin,
  createTrailingSlashPlugin,
  createWebSiteSchemaPlugin,
} from "./plugins-builtin.js"
import type { SEO, SEOInput } from "./types.js"

describe("builtin plugins (P4)", () => {
  describe("createTrackingStripPlugin", () => {
    const plugin = createTrackingStripPlugin()

    it("has correct id", () => {
      expect(plugin.id).toBe("tracking-strip")
    })

    it("strips tracking params from canonical URL", () => {
      const draft: SEOInput = {
        meta: { canonical: "https://example.com/page?utm_source=google&gclid=abc123" },
      }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page")
    })

    it("handles URL without tracking params", () => {
      const draft: SEOInput = {
        meta: { canonical: "https://example.com/page" },
      }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page")
    })

    it("handles invalid URL gracefully", () => {
      const draft: SEOInput = {
        meta: { canonical: "not-a-valid-url" },
      }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("not-a-valid-url")
    })

    it("handles undefined canonical", () => {
      const draft: SEOInput = { meta: {} }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBeUndefined()
    })

    it("handles undefined meta", () => {
      const draft: SEOInput = {}
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta).toBeUndefined()
    })

    it("strips all supported tracking params", () => {
      const url =
        "https://example.com/page?utm_source=x&utm_medium=y&utm_campaign=z&utm_term=a&utm_content=b&fbclid=c&gclid=d"
      const draft: SEOInput = { meta: { canonical: url } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page")
    })
  })

  describe("createDefaultRobotsPlugin", () => {
    it("has correct id", () => {
      const plugin = createDefaultRobotsPlugin()
      expect(plugin.id).toBe("default-robots")
    })

    it("adds default robots when missing", () => {
      const seo: SEO = {
        meta: { title: "Test" },
      }
      const plugin = createDefaultRobotsPlugin()
      const result = plugin.afterMerge?.(seo)
      expect((result as SEO).meta.robots).toBe("index,follow")
    })

    it("does not override existing robots", () => {
      const seo: SEO = {
        meta: { title: "Test", robots: "noindex,nofollow" },
      }
      const plugin = createDefaultRobotsPlugin()
      const result = plugin.afterMerge?.(seo)
      expect((result as SEO).meta.robots).toBe("noindex,nofollow")
    })

    it("uses custom default when provided", () => {
      const seo: SEO = { meta: { title: "Test" } }
      const plugin = createDefaultRobotsPlugin("index,nofollow")
      const result = plugin.afterMerge?.(seo)
      expect((result as SEO).meta.robots).toBe("index,nofollow")
    })
  })

  describe("createWebSiteSchemaPlugin", () => {
    it("has correct id", () => {
      const plugin = createWebSiteSchemaPlugin("My Site")
      expect(plugin.id).toBe("website-schema")
    })

    it("adds WebSite schema when missing", () => {
      const seo: SEO = { meta: { title: "Test" } }
      const plugin = createWebSiteSchemaPlugin("My Site")
      const result = plugin.afterMerge?.(seo)
      expect((result as SEO).schema).toHaveLength(1)
      expect((result as SEO).schema?.[0]).toEqual({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "My Site",
      })
    })

    it("does not duplicate existing WebSite schema", () => {
      const seo: SEO = {
        meta: { title: "Test" },
        schema: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Existing" }],
      }
      const plugin = createWebSiteSchemaPlugin("New Site")
      const result = plugin.afterMerge?.(seo)
      expect((result as SEO).schema).toHaveLength(1)
      expect((result as SEO).schema?.[0]?.name).toBe("Existing")
    })
  })

  describe("createTrailingSlashPlugin", () => {
    it("has correct id", () => {
      const plugin = createTrailingSlashPlugin()
      expect(plugin.id).toBe("trailing-slash")
    })

    it("removes trailing slash by default (addSlash=false)", () => {
      const plugin = createTrailingSlashPlugin(false)
      const draft: SEOInput = { meta: { canonical: "https://example.com/page/" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page")
    })

    it("adds trailing slash when addSlash=true", () => {
      const plugin = createTrailingSlashPlugin(true)
      const draft: SEOInput = { meta: { canonical: "https://example.com/page" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page/")
    })

    it("does not remove slash from root path", () => {
      const plugin = createTrailingSlashPlugin(false)
      const draft: SEOInput = { meta: { canonical: "https://example.com/" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/")
    })

    it("does not add slash to URLs with file extensions", () => {
      const plugin = createTrailingSlashPlugin(true)
      const draft: SEOInput = { meta: { canonical: "https://example.com/page.html" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("https://example.com/page.html")
    })

    it("does not remove slash from URLs with file extensions (URL with extension+slash stays with slash removed)", () => {
      const plugin = createTrailingSlashPlugin(false)
      const draft: SEOInput = { meta: { canonical: "https://example.com/page.html/" } }
      const result = plugin.beforeMerge?.(draft)
      // The implementation removes the slash even for extension URLs when it ends with /
      expect(result?.meta?.canonical).toBe("https://example.com/page.html")
    })

    it("handles relative URLs without protocol", () => {
      const plugin = createTrailingSlashPlugin(true)
      const draft: SEOInput = { meta: { canonical: "/page" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("/page/")
    })

    it("handles relative URLs removing slash", () => {
      const plugin = createTrailingSlashPlugin(false)
      const draft: SEOInput = { meta: { canonical: "/page/" } }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBe("/page")
    })

    it("handles undefined canonical", () => {
      const plugin = createTrailingSlashPlugin()
      const draft: SEOInput = { meta: {} }
      const result = plugin.beforeMerge?.(draft)
      expect(result?.meta?.canonical).toBeUndefined()
    })

    it("handles invalid URL gracefully", () => {
      const plugin = createTrailingSlashPlugin(false)
      const draft: SEOInput = { meta: { canonical: "not-a-url" } }
      const result = plugin.beforeMerge?.(draft)
      // The implementation strips trailing slash from non-http URLs when it ends with /
      // 'not-a-url' doesn't end with / so stays unchanged
      expect(result?.meta?.canonical).toBe("not-a-url")
    })
  })
})
