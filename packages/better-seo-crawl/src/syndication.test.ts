import { describe, expect, it } from "vitest"
import {
  renderAtomFeed,
  renderLlmsTxt,
  renderRssXml,
  renderSitemapIndexXml,
} from "./syndication.js"

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
})
