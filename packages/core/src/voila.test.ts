import { describe, expect, it } from "vitest"
import { SEOError } from "./errors.js"
import { registerAdapter } from "./adapters/registry.js"
import { seoForFramework, seoRoute, useSEO } from "./voila.js"

describe("seoForFramework", () => {
  it("throws ADAPTER_NOT_FOUND when adapter missing", () => {
    expect(() => seoForFramework("nonexistent", { title: "t" })).toThrow(SEOError)
    expect(() => seoForFramework("nonexistent", { title: "t" })).toThrow(/ADAPTER_NOT_FOUND/)
  })

  it("uses registered adapter", () => {
    registerAdapter({
      id: "test-adapter",
      toFramework: () => ({ ok: true }),
    })
    const out = seoForFramework<{ ok: boolean }>("test-adapter", { title: "Hi" })
    expect(out).toEqual({ ok: true })
  })
})

describe("useSEO", () => {
  it("throws USE_SEO_NOT_AVAILABLE", () => {
    expect(() => useSEO()).toThrow(SEOError)
    expect(() => useSEO()).toThrow(/USE_SEO_NOT_AVAILABLE/)
  })
})

describe("seoRoute", () => {
  it("applies config.rules then page input", () => {
    const cfg = {
      baseUrl: "https://app.test",
      titleTemplate: "%s | App",
      rules: [{ match: "/docs/*", seo: { description: "Docs section" } }],
    } as const
    const doc = seoRoute("/docs/api", { title: "API" }, cfg)
    expect(doc.meta.title).toBe("API | App")
    expect(doc.meta.description).toBe("Docs section")
  })

  it("works without rules in config", () => {
    const cfg = {
      baseUrl: "https://app.test",
      titleTemplate: "%s | App",
    } as const
    const doc = seoRoute("/page", { title: "Page" }, cfg)
    expect(doc.meta.title).toBe("Page | App")
  })

  it("passes config to createSEO for fallbacks", () => {
    const cfg = {
      baseUrl: "https://app.test",
      titleTemplate: "%s | App",
      rules: [],
    } as const
    const doc = seoRoute("/page", { title: "Page" }, cfg)
    expect(doc.meta.title).toBe("Page | App")
    expect(doc.meta.description).toBeUndefined()
  })
})

describe("voila.ts edge cases", () => {
  it("seoForFramework error message includes adapter id", () => {
    try {
      seoForFramework("missing-adapter", { title: "t" })
      expect.fail("Should have thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(SEOError)
      expect((e as SEOError).message).toContain("missing-adapter")
    }
  })

  it("useSEO error code is USE_SEO_NOT_AVAILABLE", () => {
    try {
      useSEO()
      expect.fail("Should have thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(SEOError)
      expect((e as SEOError).code).toBe("USE_SEO_NOT_AVAILABLE")
    }
  })
})
