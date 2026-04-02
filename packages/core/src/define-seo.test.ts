import { describe, expect, it } from "vitest"
import { defineSEO } from "./define-seo.js"

describe("defineSEO (C18)", () => {
  it("returns the same object reference", () => {
    const input = { title: "Hi", description: "There" } as const
    expect(defineSEO(input)).toBe(input)
  })
})
