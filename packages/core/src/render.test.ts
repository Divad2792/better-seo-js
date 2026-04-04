import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import { renderTags } from "./render.js"

describe("renderTags", () => {
  it("emits openGraph image meta when present", () => {
    const seo = createSEO({
      title: "T",
      openGraph: {
        images: [{ url: "https://cdn.test/og.png", width: 1200, height: 630, alt: "A" }],
      },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:image")).toBe(true)
  })

  it("emits twitter:image when core bridged OG image", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { images: [{ url: "https://cdn.test/og.png" }] },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.name === "twitter:image")).toBe(true)
  })

  it("emits robots and hreflang alternates", () => {
    const seo = createSEO({
      title: "T",
      meta: {
        robots: "noindex, nofollow",
        alternates: { languages: { en: "https://ex.test/en", de: "https://ex.test/de" } },
      },
    })
    const tags = renderTags(seo)
    expect(
      tags.some((t) => t.kind === "meta" && t.name === "robots" && t.content.includes("noindex")),
    ).toBe(true)
    const alts = tags.filter((t) => t.kind === "link" && t.hreflang)
    expect(alts).toHaveLength(2)
  })

  it("emits canonical, og title/description, and twitter fields when set", () => {
    const seo = createSEO({
      title: "T",
      description: "D",
      meta: { canonical: "https://ex.test/p" },
      openGraph: { title: "OGT", description: "OGD" },
      twitter: {
        card: "summary",
        title: "TwT",
        description: "TwD",
        image: "https://ex.test/tw.png",
      },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "link" && t.rel === "canonical")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:title")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:description")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.name === "twitter:description")).toBe(true)
  })

  it("does not emit og:image when images array is empty", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { images: [] },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:image")).toBe(false)
  })

  it("emits og:url and og:type when set", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { url: "https://ex.test/page", type: "article" },
    })
    const tags = renderTags(seo)
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.property === "og:url" && t.content === "https://ex.test/page",
      ),
    ).toBe(true)
    expect(
      tags.some((t) => t.kind === "meta" && t.property === "og:type" && t.content === "article"),
    ).toBe(true)
  })

  it("emits verification and pagination link tags", () => {
    const seo = createSEO({
      title: "T",
      meta: {
        verification: { google: "abc", other: { "custom-verify": "x" } },
        pagination: { previous: "https://ex.test/p/1", next: "https://ex.test/p/3" },
      },
    })
    const tags = renderTags(seo)
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.name === "google-site-verification" && t.content === "abc",
      ),
    ).toBe(true)
    expect(tags.some((t) => t.kind === "link" && t.rel === "prev")).toBe(true)
    expect(tags.some((t) => t.kind === "link" && t.rel === "next")).toBe(true)
  })

  it("emits og:site_name, locale, article:*, og:video, twitter:site/creator", () => {
    const seo = createSEO({
      title: "Vid",
      description: "D",
      openGraph: {
        type: "article",
        siteName: "Ex",
        locale: "en_GB",
        publishedTime: "2026-01-01T00:00:00.000Z",
        modifiedTime: "2026-01-02T00:00:00.000Z",
        expirationTime: "2027-01-01T00:00:00.000Z",
        section: "News",
        authors: ["https://ex.test/a", ""],
        tags: ["x", "y"],
        videos: [
          {
            url: "https://ex.test/v.mp4",
            secureUrl: "https://ex.test/vs.mp4",
            type: "video/mp4",
            width: 1280,
            height: 720,
          },
        ],
      },
      twitter: { site: "@ex", creator: "@me" },
    })
    const tags = renderTags(seo)
    expect(tags.filter((t) => t.kind === "meta" && t.property === "article:author")).toHaveLength(1)
    expect(
      tags.some((t) => t.kind === "meta" && t.property === "og:site_name" && t.content === "Ex"),
    ).toBe(true)
    expect(
      tags.some((t) => t.kind === "meta" && t.name === "twitter:site" && t.content === "@ex"),
    ).toBe(true)
    expect(
      tags.some(
        (t) =>
          t.kind === "meta" && t.property === "og:video" && t.content === "https://ex.test/v.mp4",
      ),
    ).toBe(true)
  })

  it("emits multiple og:image groups for multiple images", () => {
    const seo = createSEO({
      title: "T",
      openGraph: {
        images: [
          { url: "https://ex.test/a.png", width: 100, height: 100 },
          { url: "https://ex.test/b.png", width: 200, height: 200 },
        ],
      },
    })
    const ogImages = renderTags(seo).filter((t) => t.kind === "meta" && t.property === "og:image")
    expect(ogImages).toHaveLength(2)
    expect(ogImages.map((t) => (t as { kind: "meta"; content: string }).content)).toEqual([
      "https://ex.test/a.png",
      "https://ex.test/b.png",
    ])
  })

  it("runs onRenderTags plugin hook when config.plugins provided", () => {
    const customPlugin = {
      id: "custom",
      onRenderTags: (tags: readonly import("./types.js").TagDescriptor[]) => [
        ...tags,
        { kind: "meta" as const, name: "custom", content: "injected" },
      ],
    }
    const seo = createSEO({ title: "T" })
    const tags = renderTags(seo, { plugins: [customPlugin] })
    expect(
      tags.some((t) => t.kind === "meta" && t.name === "custom" && t.content === "injected"),
    ).toBe(true)
  })

  it("onRenderTags plugin can filter tags", () => {
    const filterPlugin = {
      id: "filter",
      onRenderTags: (tags: readonly import("./types.js").TagDescriptor[]) =>
        tags.filter((t) => t.kind !== "meta" || t.name !== "robots"),
    }
    const seo = createSEO({ title: "T", meta: { robots: "noindex" } })
    const tags = renderTags(seo, { plugins: [filterPlugin] })
    expect(tags.some((t) => t.kind === "meta" && t.name === "robots")).toBe(false)
  })
})
