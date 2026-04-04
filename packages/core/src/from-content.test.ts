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

  it("infers title from first line when no H1 exists", () => {
    const input = fromContent(`This is the first line with no heading.

Second paragraph here.`)
    expect(input.title).toBe("This is the first line with no heading.")
    expect(input.description).toContain("Second paragraph")
  })

  it("infers title from first non-empty line with HTML stripped", () => {
    const input = fromContent(`<strong>Bold title</strong>

Content here.`)
    expect(input.title).toBe("Bold title")
  })

  it("returns Untitled when body and frontmatter are both empty", () => {
    const input = fromContent("")
    expect(input.title).toBe("Untitled")
    expect(input.description).toBeUndefined()
  })

  it("respects maxDescriptionLength option", () => {
    const longText = `# Title\n\n${"a".repeat(500)}`
    const input = fromContent(longText, { maxDescriptionLength: 50 })
    expect(input.description).toHaveLength(50)
  })

  it("strips import lines before inference", () => {
    const input = fromContent(`import Component from "./component"
import type { Props } from "./types"

# My Post

Content here.`)
    expect(input.title).toBe("My Post")
    expect(input.description).toContain("Content here")
  })
})
