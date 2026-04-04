import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import { renderTags } from "./render.js"
import { defineSEOPlugin } from "./plugins.js"

describe("extendChannels plugin hook (P3)", () => {
  it("extendChannels adds custom tags", () => {
    const customPlugin = defineSEOPlugin({
      id: "custom-channels",
      extendChannels: () => [{ kind: "meta", name: "custom-channel", content: "custom-value" }],
    })
    const seo = createSEO({ title: "Test" })
    const tags = renderTags(seo, { plugins: [customPlugin] })
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.name === "custom-channel" && t.content === "custom-value",
      ),
    ).toBe(true)
  })

  it("extendChannels runs after onRenderTags", () => {
    const orderPlugin = defineSEOPlugin({
      id: "order",
      onRenderTags: (tags) => [...tags, { kind: "meta", name: "first", content: "1" }],
      extendChannels: () => [{ kind: "meta", name: "second", content: "2" }],
    })
    const seo = createSEO({ title: "Test" })
    const tags = renderTags(seo, { plugins: [orderPlugin] })
    const firstIdx = tags.findIndex((t) => t.kind === "meta" && t.name === "first")
    const secondIdx = tags.findIndex((t) => t.kind === "meta" && t.name === "second")
    expect(firstIdx).toBeGreaterThanOrEqual(0)
    expect(secondIdx).toBeGreaterThanOrEqual(0)
    expect(secondIdx).toBeGreaterThan(firstIdx)
  })

  it("extendChannels can add multiple tags", () => {
    const multiPlugin = defineSEOPlugin({
      id: "multi",
      extendChannels: () => [
        { kind: "meta", name: "tag1", content: "val1" },
        { kind: "meta", name: "tag2", content: "val2" },
        { kind: "link", rel: "alternate", href: "https://example.com/alt" },
      ],
    })
    const seo = createSEO({ title: "Test" })
    const tags = renderTags(seo, { plugins: [multiPlugin] })
    expect(tags.some((t) => t.kind === "meta" && t.name === "tag1")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.name === "tag2")).toBe(true)
    expect(tags.some((t) => t.kind === "link" && t.rel === "alternate")).toBe(true)
  })

  it("extendChannels receives SEO context", () => {
    const contextPlugin = defineSEOPlugin({
      id: "context",
      extendChannels: (seo) => [{ kind: "meta", name: "page-title", content: seo.meta.title }],
    })
    const seo = createSEO({ title: "Context Test" })
    const tags = renderTags(seo, { plugins: [contextPlugin] })
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.name === "page-title" && t.content === "Context Test",
      ),
    ).toBe(true)
  })
})
