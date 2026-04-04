import { describe, expect, it } from "vitest"
import { SEOError } from "./errors.js"
import { createSEO } from "./core.js"
import { fromNextSeo } from "./migrate.js"

describe("fromNextSeo", () => {
  it("rejects non-objects", () => {
    expect(() => fromNextSeo(null)).toThrow(SEOError)
    expect(() => fromNextSeo(null)).toThrow(/VALIDATION/)
  })

  it("requires a title from title, defaultTitle, or openGraph.title", () => {
    expect(() => fromNextSeo({ description: "only" })).toThrow(/title/)
    const input = fromNextSeo({ defaultTitle: "Home", description: "D" })
    expect(input.title).toBe("Home")
    expect(createSEO(input).meta.title).toBe("Home")
  })

  it("maps canonical, openGraph, twitter, and noindex", () => {
    const input = fromNextSeo({
      title: "Post",
      canonical: "https://ex.test/p/1",
      noindex: true,
      openGraph: {
        type: "article",
        url: "https://ex.test/p/1",
        images: [{ url: "https://ex.test/og.png", width: 1200, height: 630 }],
      },
      twitter: { card: "summary", title: "Tw", image: "https://ex.test/tw.jpg" },
    })
    const seo = createSEO(input)
    expect(seo.meta.canonical).toBe("https://ex.test/p/1")
    expect(seo.meta.robots).toContain("noindex")
    expect(seo.openGraph?.type).toBe("article")
    expect(seo.openGraph?.images?.[0]?.url).toBe("https://ex.test/og.png")
    expect(seo.twitter?.card).toBe("summary")
    expect(seo.twitter?.image).toBe("https://ex.test/tw.jpg")
  })

  it("maps twitter site/handle and openGraph site_name / locale", () => {
    const input = fromNextSeo({
      title: "P",
      openGraph: { site_name: "Legacy site", locale: "de_DE" },
      twitter: { site: "@corp", handle: "@author" },
    })
    const seo = createSEO(input)
    expect(seo.openGraph?.siteName).toBe("Legacy site")
    expect(seo.openGraph?.locale).toBe("de_DE")
    expect(seo.twitter?.site).toBe("@corp")
    expect(seo.twitter?.creator).toBe("@author")
  })

  it("rejects arrays and primitives with VALIDATION error", () => {
    expect(() => fromNextSeo([])).toThrow(SEOError)
    expect(() => fromNextSeo([])).toThrow(/VALIDATION/)
    expect(() => fromNextSeo("string")).toThrow(SEOError)
    expect(() => fromNextSeo(123)).toThrow(SEOError)
  })

  it("handles openGraph.images with mixed valid and invalid items", () => {
    const input = fromNextSeo({
      title: "Post",
      openGraph: {
        images: [
          { url: "https://ex.test/valid.png", width: 1200 },
          null,
          "string-url.png",
          { url: "" }, // invalid - empty url
          { url: "https://ex.test/valid2.png", alt: "Alt text" },
        ],
      },
    })
    const seo = createSEO(input)
    expect(seo.openGraph?.images).toHaveLength(3)
    expect(seo.openGraph?.images?.[0]?.url).toBe("https://ex.test/valid.png")
    expect(seo.openGraph?.images?.[1]?.url).toBe("string-url.png")
    expect(seo.openGraph?.images?.[2]?.alt).toBe("Alt text")
  })

  it("handles twitter with imageSrc fallback", () => {
    const input = fromNextSeo({
      title: "Post",
      twitter: { imageSrc: "https://ex.test/fallback.jpg" },
    })
    const seo = createSEO(input)
    expect(seo.twitter?.image).toBe("https://ex.test/fallback.jpg")
  })

  it("handles nofollow without noindex", () => {
    const input = fromNextSeo({
      title: "Post",
      nofollow: true,
    })
    const seo = createSEO(input)
    expect(seo.meta.robots).toBe("index, nofollow")
  })
})
