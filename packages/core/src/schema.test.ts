import { describe, expect, it } from "vitest"
import { serializeJSONLD } from "./serialize.js"
import {
  article,
  breadcrumbList,
  customSchema,
  faqPage,
  organization,
  person,
  product,
  techArticle,
  webPage,
} from "./schema.js"

describe("schema helpers", () => {
  it("breadcrumbList emits ListItem graph", () => {
    const j = breadcrumbList({
      items: [
        { name: "Home", url: "https://s.test/" },
        { name: "Cat", url: "https://s.test/c" },
      ],
    })
    const raw = serializeJSONLD(j)
    expect(raw).toContain("BreadcrumbList")
    expect(raw).toContain("ListItem")
  })

  it("FAQPage shapes mainEntity", () => {
    const j = faqPage({ questions: [{ question: "Q?", answer: "A." }] })
    expect(serializeJSONLD(j)).toContain("FAQPage")
  })

  it("Organization and Product include @type", () => {
    expect(serializeJSONLD(organization({ name: "Acme" }))).toContain("Organization")
    expect(serializeJSONLD(product({ name: "SKU", url: "https://s.test/p/1" }))).toContain(
      "Product",
    )
  })

  it("Article helper serializes", () => {
    const node = article({
      headline: "H",
      url: "https://s.test/a",
      datePublished: "2024-01-01",
    })
    expect(serializeJSONLD(node)).toContain("Article")
  })

  it("TechArticle helper serializes", () => {
    expect(
      serializeJSONLD(
        techArticle({ headline: "How-to", url: "https://s.test/docs/1", description: "Steps" }),
      ),
    ).toContain("TechArticle")
  })

  it("Person helper serializes", () => {
    expect(serializeJSONLD(person({ name: "Ada", url: "https://s.test/ada" }))).toContain("Person")
  })

  it("webPage helper with optional description", () => {
    const node = webPage({ name: "Home", url: "https://s.test/", description: "Welcome" })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("WebPage")
    expect(raw).toContain("Welcome")
  })

  it("article helper with all optional fields", () => {
    const node = article({
      headline: "Headline",
      description: "Desc",
      datePublished: "2024-01-01",
      url: "https://s.test/a",
    })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("Article")
    expect(raw).toContain("Desc")
    expect(raw).toContain("2024-01-01")
  })

  it("organization helper with optional url and logo", () => {
    const node = organization({ name: "Acme", url: "https://acme.test", logo: "/logo.png" })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("Organization")
    expect(raw).toContain("https://acme.test")
    expect(raw).toContain("/logo.png")
  })

  it("person helper without optional url", () => {
    const node = person({ name: "Bob" })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("Person")
    expect(raw).not.toContain("url")
  })

  it("product helper with all optional fields", () => {
    const node = product({
      name: "Widget",
      description: "A widget",
      sku: "WGT-001",
      image: "https://s.test/widget.jpg",
      url: "https://s.test/p/1",
    })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("Product")
    expect(raw).toContain("WGT-001")
    expect(raw).toContain("A widget")
  })

  it("breadcrumbList with single item", () => {
    const node = breadcrumbList({ items: [{ name: "Home", url: "https://s.test/" }] })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("ListItem")
    expect(raw).toContain('"position":1')
  })

  it("faqPage with multiple questions", () => {
    const node = faqPage({
      questions: [
        { question: "Q1?", answer: "A1." },
        { question: "Q2?", answer: "A2." },
      ],
    })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("FAQPage")
    expect(raw).toContain("Q1?")
    expect(raw).toContain("Q2?")
  })

  it("techArticle with all optional fields", () => {
    const node = techArticle({
      headline: "Guide",
      description: "Steps",
      datePublished: "2024-06-01",
      url: "https://s.test/docs",
    })
    const raw = serializeJSONLD(node)
    expect(raw).toContain("TechArticle")
    expect(raw).toContain("Steps")
    expect(raw).toContain("2024-06-01")
  })

  it("customSchema passes through node unchanged", () => {
    const custom = { "@context": "https://schema.org", "@type": "Dataset", name: "Data" }
    const node = customSchema(custom)
    expect(node).toEqual(custom)
  })
})
