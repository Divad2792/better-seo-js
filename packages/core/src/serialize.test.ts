import { describe, expect, it, vi } from "vitest"
import { serializeJSONLD } from "./serialize.js"
import { webPage } from "./schema.js"
import { SEOError } from "./errors.js"
import type { JSONLD } from "./types.js"

describe("serializeJSONLD", () => {
  it("round-trips Unicode line separator inside strings via JSON only (no manual concat)", () => {
    const u2028 = "\u2028"
    const s = serializeJSONLD(webPage({ name: `x${u2028}y`, url: "https://ex.test/p" }))
    const parsed = JSON.parse(s) as { name: string }
    expect(parsed.name).toContain(u2028)
  })

  it("stringifies a full node", () => {
    const s = serializeJSONLD(webPage({ name: "x", url: "https://ex.test" }))
    expect(s).toContain("WebPage")
    expect(s).not.toContain("</script>")
  })

  it("handles arrays", () => {
    const s = serializeJSONLD([
      webPage({ name: "a", url: "https://ex.test/a" }),
      webPage({ name: "b", url: "https://ex.test/b" }),
    ])
    const parsed = JSON.parse(s) as unknown[]
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
  })

  it("serializes </script> in string values as valid JSON (embed inside application/ld+json only)", () => {
    const raw = "</script><script>alert('XSS')</script>"
    const result = serializeJSONLD(
      webPage({
        name: "Test",
        description: raw,
        url: "https://ex.test/p",
      }),
    )
    const parsed = JSON.parse(result) as { description: string }
    expect(parsed.description).toBe(raw)
    expect(result).toContain("</script>")
  })

  describe("Security - Prototype Pollution Prevention", () => {
    it("rejects __proto__ pollution attempts (JSON.parse-shaped own key)", () => {
      const malicious = JSON.parse(
        '{"@context":"https://schema.org","@type":"Thing","__proto__":{"polluted":true}}',
      )
      expect(() => serializeJSONLD(malicious)).toThrow(SEOError)
    })

    it("rejects constructor pollution attempts (own key)", () => {
      const malicious = JSON.parse(
        '{"@context":"https://schema.org","@type":"Thing","constructor":{"prototype":{"polluted":true}}}',
      )
      expect(() => serializeJSONLD(malicious)).toThrow(SEOError)
    })

    it("rejects prototype pollution attempts (own key)", () => {
      const malicious = JSON.parse(
        '{"@context":"https://schema.org","@type":"Thing","prototype":{"polluted":true}}',
      )
      expect(() => serializeJSONLD(malicious)).toThrow(SEOError)
    })

    it("rejects nested __proto__ pollution", () => {
      const malicious = JSON.parse(
        '{"@context":"https://schema.org","@type":"Thing","author":{"__proto__":{"polluted":true}}}',
      )
      expect(() => serializeJSONLD(malicious)).toThrow(SEOError)
    })
  })

  describe("Security - @context Validation", () => {
    it("warns on non-standard @context", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      serializeJSONLD({
        "@context": "https://malicious.com",
        "@type": "Thing",
      })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Non-standard @context"))
      warn.mockRestore()
    })

    it("allows schema.org sub-contexts", () => {
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org/docs/jsonldcontext.json",
          "@type": "Thing",
        }),
      ).not.toThrow()
    })
  })

  describe("Security - @type Validation", () => {
    it("rejects @type with HTML injection", () => {
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org",
          "@type": "<script>alert('XSS')</script>",
        }),
      ).toThrow(SEOError)
    })

    it("rejects @type with quotes", () => {
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org",
          "@type": '"Malicious"Type',
        }),
      ).toThrow(SEOError)
    })

    it("rejects empty @type", () => {
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org",
          "@type": "",
        }),
      ).toThrow(SEOError)
    })
  })

  describe("Security - Null/Undefined Handling", () => {
    it("rejects null as root node", () => {
      expect(() => serializeJSONLD(null as unknown as JSONLD)).toThrow(SEOError)
    })

    it("rejects undefined as root node", () => {
      expect(() => serializeJSONLD(undefined as unknown as JSONLD)).toThrow(SEOError)
    })

    it("rejects non-object types", () => {
      expect(() => serializeJSONLD("string" as unknown as JSONLD)).toThrow(SEOError)
      expect(() => serializeJSONLD(123 as unknown as JSONLD)).toThrow(SEOError)
      expect(() => serializeJSONLD(true as unknown as JSONLD)).toThrow(SEOError)
    })
  })

  describe("Edge Cases - Coverage", () => {
    it("rejects @type with angle brackets", () => {
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org",
          "@type": "<div>Bad</div>",
        }),
      ).toThrow(SEOError)
      expect(() =>
        serializeJSONLD({
          "@context": "https://schema.org",
          "@type": "Type>",
        }),
      ).toThrow(SEOError)
    })

    it("rejects nested null values in objects", () => {
      // Should not throw for null values, only null root nodes
      const result = serializeJSONLD({
        "@context": "https://schema.org",
        "@type": "Thing",
        name: null as unknown as string,
      })
      expect(result).toContain("null")
    })

    it("validates deeply nested objects", () => {
      // Create object with __proto__ as own property using Object.defineProperty
      const deep = {
        "@context": "https://schema.org" as const,
        "@type": "Thing",
        author: {
          "@type": "Person",
          name: "Alice",
        },
      } as unknown as JSONLD
      // Add __proto__ as own property to nested object
      Object.defineProperty(deep.author, "__proto__", {
        value: { polluted: true },
        enumerable: true,
        configurable: true,
        writable: true,
      })
      expect(() => serializeJSONLD(deep)).toThrow(SEOError)
      expect(() => serializeJSONLD(deep)).toThrow(/__proto__/)
    })

    it("handles empty arrays", () => {
      const result = serializeJSONLD([])
      expect(result).toBe("[]")
    })

    it("handles arrays with mixed valid nodes", () => {
      const result = serializeJSONLD([
        { "@context": "https://schema.org", "@type": "Thing", name: "A" },
        { "@context": "https://schema.org", "@type": "Thing", name: "B" },
      ])
      const parsed = JSON.parse(result) as Array<{ "@type": string; name: string }>
      expect(parsed).toHaveLength(2)
      expect(parsed[0]!.name).toBe("A")
      expect(parsed[1]!.name).toBe("B")
    })
  })
})
