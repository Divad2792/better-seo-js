import { createSEO } from "@better-seo/core"
import { describe, expect, it } from "vitest"
import { fromMdx } from "./from-mdx.js"

describe("fromMdx (C17)", () => {
  it("uses frontmatter title and description over body", () => {
    const src = `---
title: FM Title
description: FM desc
---

# Heading

Body para.
`
    const input = fromMdx(src)
    expect(input.title).toBe("FM Title")
    expect(input.description).toBe("FM desc")
  })

  it("infers from body when frontmatter omits fields", () => {
    const src = `---
title: Only title
---

First paragraph of the post.

More here.
`
    const input = fromMdx(src)
    expect(input.title).toBe("Only title")
    expect(input.description).toContain("First paragraph")
  })

  it("merges nested seo: block", () => {
    const src = `---
title: Top
seo:
  description: Nested description
---

Hello
`
    const input = fromMdx(src)
    expect(input.title).toBe("Top")
    expect(input.description).toBe("Nested description")
  })

  it("maps openGraph from frontmatter for createSEO", () => {
    const src = `---
title: Post
openGraph:
  title: OG Title
  description: OG Desc
---

Hi
`
    const input = fromMdx(src)
    const seo = createSEO(input, { baseUrl: "https://example.com" })
    expect(seo.openGraph?.title).toBe("OG Title")
    expect(seo.openGraph?.description).toBe("OG Desc")
  })

  it("respects meta.title in yaml", () => {
    const src = `---
meta:
  title: Meta Title
---

# H1 ignored for title when meta set
`
    const input = fromMdx(src)
    expect(input.meta?.title).toBe("Meta Title")
  })

  it("maps twitter from frontmatter", () => {
    const src = `---
title: T
twitter:
  card: summary_large_image
  site: "@site"
---

Hi
`
    const input = fromMdx(src)
    expect(input.twitter?.card).toBe("summary_large_image")
    expect(input.twitter?.site).toBe("@site")
  })

  it("maps schema array from frontmatter", () => {
    const src = `---
title: T
schema:
  - "@context": "https://schema.org"
    "@type": "WebPage"
    name: Hello
---

x
`
    const input = fromMdx(src)
    expect(Array.isArray(input.schema)).toBe(true)
    expect(input.schema?.[0]?.["@type"]).toBe("WebPage")
  })

  it("strips leading import lines in body for description inference", () => {
    const src = `---
title: Doc
---

import X from "./x"

Intro text for SEO.
`
    const input = fromMdx(src)
    expect(input.description).toContain("Intro text")
  })
})
