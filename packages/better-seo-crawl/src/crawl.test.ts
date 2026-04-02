import { createSEO } from "@better-seo/core"
import { describe, expect, it } from "vitest"
import { defaultSitemapUrlFromSEO, renderRobotsTxt, renderSitemapXml } from "./index.js"

describe("@better-seo/crawl", () => {
  it("renderRobotsTxt emits defaults and sitemap lines", () => {
    const body = renderRobotsTxt({
      sitemap: ["https://ex.test/sitemap.xml"],
    })
    expect(body).toContain("User-agent: *")
    expect(body).toContain("Sitemap: https://ex.test/sitemap.xml")
  })

  it("renderSitemapXml escapes loc", () => {
    const xml = renderSitemapXml([{ loc: "https://ex.test/a&b", priority: 0.8 }])
    expect(xml).toContain("https://ex.test/a&amp;b")
    expect(xml).toContain("<priority>0.8</priority>")
  })

  it("defaultSitemapUrlFromSEO uses canonical origin", () => {
    const seo = createSEO({
      title: "T",
      meta: { canonical: "https://ex.test/blog/post" },
    })
    expect(defaultSitemapUrlFromSEO(seo)).toBe("https://ex.test/sitemap.xml")
  })
})
