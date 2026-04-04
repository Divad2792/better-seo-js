import { describe, expect, it } from "vitest"
import {
  renderAtomFeed,
  renderLlmsTxt,
  renderRssXml,
  renderSitemapIndexXml,
} from "./syndication.js"
import { renderSitemapXml, type SitemapUrlEntry } from "./index.js"

describe("syndication (Wave 12)", () => {
  it("renderRssXml includes item guid and title", () => {
    const xml = renderRssXml({
      title: "Blog",
      link: "https://ex.test/",
      description: "Hi",
      items: [{ title: "One", link: "https://ex.test/1", pubDate: "2026-01-01T00:00:00.000Z" }],
    })
    expect(xml).toContain("<title>Blog</title>")
    expect(xml).toContain("<title>One</title>")
    expect(xml).toContain('<guid isPermaLink="true">https://ex.test/1</guid>')
  })

  it("renderAtomFeed emits entry id", () => {
    const xml = renderAtomFeed({
      title: "A",
      link: "https://ex.test/",
      id: "https://ex.test/feed.atom",
      updated: "2026-01-01T00:00:00.000Z",
      entries: [
        {
          title: "E",
          link: "https://ex.test/e",
          id: "https://ex.test/e",
          updated: "2026-01-02T00:00:00.000Z",
        },
      ],
    })
    expect(xml).toContain('xmlns="http://www.w3.org/2005/Atom"')
    expect(xml).toContain("<title>E</title>")
  })

  it("renderLlmsTxt builds markdown sections", () => {
    const t = renderLlmsTxt({
      title: "Example",
      summary: "A site.",
      blocks: [{ heading: "Docs", lines: ["https://ex.test/docs"] }],
    })
    expect(t).toContain("# Example")
    expect(t).toContain("## Docs")
    expect(t).toContain("- https://ex.test/docs")
  })

  it("renderSitemapIndexXml escapes loc", () => {
    const x = renderSitemapIndexXml(["https://ex.test/a&b", "https://ex.test/c"])
    expect(x).toContain("https://ex.test/a&amp;b")
  })

  it("renderSitemapXml includes hreflang alternates (W2)", () => {
    const entries: SitemapUrlEntry[] = [
      {
        loc: "https://ex.test/page",
        alternates: [
          { hreflang: "en", href: "https://ex.test/en/page" },
          { hreflang: "de", href: "https://ex.test/de/page" },
          { hreflang: "x-default", href: "https://ex.test/page" },
        ],
      },
    ]
    const xml = renderSitemapXml(entries)
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(xml).toContain('rel="alternate" hreflang="en"')
    expect(xml).toContain('rel="alternate" hreflang="de"')
    expect(xml).toContain('rel="alternate" hreflang="x-default"')
    expect(xml).toContain("https://ex.test/en/page")
    expect(xml).toContain("https://ex.test/de/page")
  })

  it("renderSitemapXml without alternates omits alternate links", () => {
    const entries: SitemapUrlEntry[] = [{ loc: "https://ex.test/page" }]
    const xml = renderSitemapXml(entries)
    expect(xml).not.toContain("alternate")
    expect(xml).toContain("<loc>https://ex.test/page</loc>")
  })

  it("renderSitemapXml escapes hreflang hrefs", () => {
    const entries: SitemapUrlEntry[] = [
      {
        loc: "https://ex.test/page",
        alternates: [{ hreflang: "en", href: "https://ex.test/page?a=1&b=2" }],
      },
    ]
    const xml = renderSitemapXml(entries)
    expect(xml).toContain("https://ex.test/page?a=1&amp;b=2")
  })
})
