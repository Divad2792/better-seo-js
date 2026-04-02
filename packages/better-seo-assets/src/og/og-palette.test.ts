import { describe, expect, it } from "vitest"
import { ogPaletteFromTokens } from "./og-palette.js"

describe("ogPaletteFromTokens (A5)", () => {
  it("defaults then applies tokens", () => {
    const p = ogPaletteFromTokens({
      primary: "#ea580c",
      surface: "#1e293b",
      muted: "#cbd5e1",
    })
    expect(p.accent).toBe("#ea580c")
    expect(p.bg).toBe("#1e293b")
    expect(p.muted).toBe("#cbd5e1")
  })

  it("ignores invalid hex", () => {
    const p = ogPaletteFromTokens({ primary: "not-a-color" })
    expect(p.accent).toBe("#38bdf8")
  })
})
