import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import { fromContent, fromMdxString } from "./from-content.js"

describe("fromContent (C16)", () => {
  it("uses first # heading and first paragraph", () => {
    const input = fromContent(`# Hello\n\nFirst para here.\n\nSecond.`)
    expect(input.title).toBe("Hello")
    expect(input.description).toContain("First para")
    expect(createSEO(input).meta.title).toBe("Hello")
  })

  it("reads YAML frontmatter", () => {
    const input = fromContent(`---
title: From FM
description: Sub
---
Body ignored for desc.`)
    expect(input.title).toBe("From FM")
    expect(input.description).toBe("Sub")
  })

  it("fromMdxString strips leading import lines", () => {
    const input = fromMdxString(`import X from "./x"
# Post
Hello world`)
    expect(input.title).toBe("Post")
    expect(input.description).toContain("Hello world")
  })

  it("inferTitleFromBody false keeps first line for description", () => {
    const input = fromContent(
      `First paragraph.

Second.`,
      { inferTitleFromBody: false },
    )
    expect(input.title).toBeUndefined()
    expect(input.description).toContain("First paragraph")
  })
})
