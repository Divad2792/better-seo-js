import { mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { imageSize } from "image-size"
import { OG_IMAGE_SIZE } from "@better-seo/assets"
import { runCli } from "./run-cli.js"

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#111"/></svg>`

describe("runCli", () => {
  const created: string[] = []
  const createdDirs: string[] = []
  afterEach(() => {
    for (const p of created) {
      try {
        unlinkSync(p)
      } catch {
        /* ignore */
      }
    }
    created.length = 0
    for (const d of createdDirs) {
      try {
        rmSync(d, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    createdDirs.length = 0
  })

  it("og: writes PNG and exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    try {
      const out = join(tmpdir(), `cli-og-${Date.now()}.png`)
      created.push(out)
      const code = await runCli([
        "node",
        "cli",
        "og",
        "Hello CLI",
        "--out",
        out,
        "--site-name",
        "Test",
      ])
      expect(code).toBe(0)
      const buf = readFileSync(out)
      expect(buf[0]).toBe(0x89)
      expect(buf[1]).toBe(0x50)
      expect(buf[2]).toBe(0x4e)
      expect(buf[3]).toBe(0x47)
      expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
    } finally {
      log.mockRestore()
    }
  })

  it("og: requires title", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "og"])).toBe(1)
    err.mockRestore()
  })

  it("rejects unknown command", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "nope"])).toBe(1)
    err.mockRestore()
  })

  it("accepts global --help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("accepts og --help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "og", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("rejects invalid --theme", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "og", "T", "--theme", "bogus"])).toBe(1)
    err.mockRestore()
  })

  it("supports og --theme dark", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    try {
      const out = join(tmpdir(), `cli-og-dark-${Date.now()}.png`)
      created.push(out)
      expect(
        await runCli(["node", "cli", "og", "Dark mode", "--out", out, "--theme", "dark"]),
      ).toBe(0)
    } finally {
      log.mockRestore()
    }
  })

  it("icons: writes assets and exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const src = join(tmpdir(), `cli-icons-src-${Date.now()}.svg`)
    const outDir = join(tmpdir(), `cli-icons-out-${Date.now()}`)
    created.push(src)
    createdDirs.push(outDir)
    writeFileSync(src, SAMPLE_SVG, "utf8")
    mkdirSync(outDir, { recursive: true })
    try {
      expect(
        await runCli([
          "node",
          "cli",
          "icons",
          src,
          "--output",
          outDir,
          "--no-manifest",
          "--name",
          "X",
        ]),
      ).toBe(0)
      const ico = readFileSync(join(outDir, "favicon.ico"))
      expect(ico[2]).toBe(1)
      expect(ico[3]).toBe(0)
    } finally {
      log.mockRestore()
    }
  })

  it("icons: requires source", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "icons"])).toBe(1)
    err.mockRestore()
  })

  it("icons: rejects invalid --display", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const src = join(tmpdir(), `cli-icons-bad-${Date.now()}.svg`)
    created.push(src)
    writeFileSync(src, SAMPLE_SVG, "utf8")
    expect(await runCli(["node", "cli", "icons", src, "--display", "nope"])).toBe(1)
    err.mockRestore()
  })

  it("accepts icons --help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "icons", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("doctor exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "doctor"])).toBe(0)
    log.mockRestore()
  })

  it("doctor --json prints JSON", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    await runCli(["node", "cli", "doctor", "--json"])
    expect(log.mock.calls[0]?.[0]).toMatch(/"ok"\s*:\s*true/)
    log.mockRestore()
  })

  it("init prints next snippet by default", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    await runCli(["node", "cli", "init"])
    const out = log.mock.calls.map((c) => String(c[0])).join("\n")
    expect(out).toContain("@better-seo/next")
    log.mockRestore()
  })

  it("migrate from-next-seo exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "migrate", "from-next-seo"])).toBe(0)
    expect(log.mock.calls.join()).toContain("fromNextSeo")
    log.mockRestore()
  })

  it("init --help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "init", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("init rejects invalid framework", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "init", "--framework", "nuxt"])).toBe(1)
    err.mockRestore()
  })

  it("migrate without subcommand fails", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "migrate"])).toBe(1)
    err.mockRestore()
  })

  it("migrate --help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "migrate", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("crawl robots writes robots.txt", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `robots-${Date.now()}.txt`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "robots",
        "--out",
        out,
        "--sitemap",
        "https://example.com/sitemap.xml",
        "--host",
        "example.com",
      ]),
    ).toBe(0)
    const text = readFileSync(out, "utf8")
    expect(text).toContain("User-agent:")
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml")
    expect(text).toContain("Host: example.com")
    log.mockRestore()
  })

  it("crawl sitemap writes sitemap.xml", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `sitemap-${Date.now()}.xml`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "sitemap",
        "--out",
        out,
        "--loc",
        "https://example.com/",
        "--loc",
        "https://example.com/about",
      ]),
    ).toBe(0)
    const xml = readFileSync(out, "utf8")
    expect(xml).toContain("<urlset")
    expect(xml).toContain("https://example.com/</loc>")
    expect(xml).toContain("https://example.com/about</loc>")
    log.mockRestore()
  })

  it("crawl sitemap requires --loc", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const out = join(tmpdir(), `sitemap-bad-${Date.now()}.xml`)
    created.push(out)
    expect(await runCli(["node", "cli", "crawl", "sitemap", "--out", out])).toBe(1)
    err.mockRestore()
  })

  it("crawl without subcommand fails", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "crawl"])).toBe(1)
    log.mockRestore()
    err.mockRestore()
  })

  it("crawl rss writes feed xml", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `rss-${Date.now()}.xml`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "rss",
        "--out",
        out,
        "--title",
        "Blog",
        "--link",
        "https://example.com/",
        "--description",
        "Posts",
      ]),
    ).toBe(0)
    const xml = readFileSync(out, "utf8")
    expect(xml).toContain("<rss")
    expect(xml).toContain("<title>Blog</title>")
    log.mockRestore()
  })

  it("crawl atom writes feed xml", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `atom-${Date.now()}.xml`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "atom",
        "--out",
        out,
        "--title",
        "Blog",
        "--link",
        "https://example.com/",
        "--id",
        "https://example.com/atom.xml",
        "--updated",
        "2026-01-01T00:00:00Z",
      ]),
    ).toBe(0)
    const xml = readFileSync(out, "utf8")
    expect(xml).toContain('xmlns="http://www.w3.org/2005/Atom"')
    expect(xml).toContain("<title>Blog</title>")
    log.mockRestore()
  })

  it("crawl llms writes llms.txt", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `llms-${Date.now()}.txt`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "llms",
        "--out",
        out,
        "--title",
        "Example docs",
        "--summary",
        "API reference",
        "--url",
        "https://example.com/docs",
      ]),
    ).toBe(0)
    const txt = readFileSync(out, "utf8")
    expect(txt).toContain("Example docs")
    expect(txt).toContain("https://example.com/docs")
    log.mockRestore()
  })

  it("crawl sitemap-index writes index xml", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `smidx-${Date.now()}.xml`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "crawl",
        "sitemap-index",
        "--out",
        out,
        "--sitemap",
        "https://example.com/sitemap-1.xml",
        "--sitemap",
        "https://example.com/sitemap-2.xml",
      ]),
    ).toBe(0)
    const xml = readFileSync(out, "utf8")
    expect(xml).toContain("sitemapindex")
    expect(xml).toContain("sitemap-1.xml")
    log.mockRestore()
  })

  it("snapshot writes tags json", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const input = join(tmpdir(), `snap-in-${Date.now()}.json`)
    const out = join(tmpdir(), `snap-out-${Date.now()}.json`)
    created.push(input, out)
    writeFileSync(input, JSON.stringify({ title: "Hi", description: "There" }, null, 2), "utf8")
    expect(await runCli(["node", "cli", "snapshot", "--input", input, "--out", out])).toBe(0)
    const j = JSON.parse(readFileSync(out, "utf8")) as unknown[]
    expect(Array.isArray(j)).toBe(true)
    expect(JSON.stringify(j)).toContain("Hi")
    log.mockRestore()
  })

  it("snapshot writes tags.json under --out-dir", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const input = join(tmpdir(), `snap-in-dir-${Date.now()}.json`)
    const outDir = join(tmpdir(), `snap-dir-${Date.now()}`)
    created.push(input)
    createdDirs.push(outDir)
    writeFileSync(input, JSON.stringify({ title: "Hi", description: "There" }, null, 2), "utf8")
    expect(await runCli(["node", "cli", "snapshot", "--input", input, "--out-dir", outDir])).toBe(0)
    const tagsPath = join(outDir, "tags.json")
    expect(readFileSync(tagsPath, "utf8")).toContain("Hi")
    log.mockRestore()
  })

  it("snapshot compare identical exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const a = join(tmpdir(), `cmp-a-${Date.now()}.json`)
    const b = join(tmpdir(), `cmp-b-${Date.now()}.json`)
    created.push(a, b)
    const body = JSON.stringify([{ kind: "meta", name: "description", content: "x" }], null, 2)
    writeFileSync(a, `${body}\n`, "utf8")
    writeFileSync(b, `${body}\n`, "utf8")
    expect(await runCli(["node", "cli", "snapshot", "compare", a, b])).toBe(0)
    log.mockRestore()
  })

  it("snapshot compare differ exits 1", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const a = join(tmpdir(), `cmp2-a-${Date.now()}.json`)
    const b = join(tmpdir(), `cmp2-b-${Date.now()}.json`)
    created.push(a, b)
    writeFileSync(a, JSON.stringify([1]), "utf8")
    writeFileSync(b, JSON.stringify([2]), "utf8")
    expect(await runCli(["node", "cli", "snapshot", "compare", a, b])).toBe(1)
    err.mockRestore()
  })

  it("preview writes html with head tags", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const input = join(tmpdir(), `prev-in-${Date.now()}.json`)
    const out = join(tmpdir(), `prev-out-${Date.now()}.html`)
    created.push(input, out)
    writeFileSync(input, JSON.stringify({ title: "Preview title", description: "Desc" }), "utf8")
    expect(await runCli(["node", "cli", "preview", "--input", input, "--out", out])).toBe(0)
    const html = readFileSync(out, "utf8")
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("Preview title")
    expect(html).toContain("Google")
    log.mockRestore()
  })

  it("preview --open respects BETTER_SEO_NO_OPEN", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const input = join(tmpdir(), `prev-open-in-${Date.now()}.json`)
    const out = join(tmpdir(), `prev-open-${Date.now()}.html`)
    created.push(input, out)
    writeFileSync(input, JSON.stringify({ title: "T", description: "D" }), "utf8")
    process.env.BETTER_SEO_NO_OPEN = "1"
    expect(await runCli(["node", "cli", "preview", "--input", input, "--out", out, "--open"])).toBe(
      0,
    )
    delete process.env.BETTER_SEO_NO_OPEN
    log.mockRestore()
  })

  it("template list exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "template", "list"])).toBe(0)
    expect(log.mock.calls.map((c) => String(c[0])).join("\n")).toContain("blog")
    log.mockRestore()
  })

  it("template print blog mentions defineSEO", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    await runCli(["node", "cli", "template", "print", "blog"])
    const out = log.mock.calls.map((c) => String(c[0])).join("\n")
    expect(out).toContain("defineSEO")
    expect(out).toContain("My blog")
    log.mockRestore()
  })

  it("template preview writes html via --out", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const html = join(tmpdir(), `tpl-prev-${Date.now()}.html`)
    created.push(html)
    expect(await runCli(["node", "cli", "template", "preview", "saas", "--out", html])).toBe(0)
    expect(readFileSync(html, "utf8")).toContain("<!DOCTYPE")
    log.mockRestore()
  })

  it("template print without id exits 1", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "template", "print"])).toBe(1)
    err.mockRestore()
  })

  it("template unknown subcommand exits 1", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "template", "nope"])).toBe(1)
    err.mockRestore()
  })

  it("content --help exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "content", "--help"])).toBe(0)
    log.mockRestore()
  })

  it("content without from-mdx exits 1", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "content", "nope"])).toBe(1)
    err.mockRestore()
  })

  it("content from-mdx requires --input and --out", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "content", "from-mdx", "--input", "x"])).toBe(1)
    err.mockRestore()
  })

  it("content from-mdx exits 1 when input is missing", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const out = join(tmpdir(), `mdx-miss-${Date.now()}.json`)
    created.push(out)
    expect(
      await runCli([
        "node",
        "cli",
        "content",
        "from-mdx",
        "--input",
        join(tmpdir(), `nope-${Date.now()}.mdx`),
        "--out",
        out,
      ]),
    ).toBe(1)
    err.mockRestore()
  })

  it("template preview requires id", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "template", "preview"])).toBe(1)
    err.mockRestore()
  })

  it("content from-mdx writes seo json", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const md = join(tmpdir(), `cmdx-${Date.now()}.md`)
    const out = join(tmpdir(), `cmdx-out-${Date.now()}.json`)
    created.push(md, out)
    writeFileSync(
      md,
      `---
title: From MD
description: Hello
---

Body`,
      "utf8",
    )
    expect(await runCli(["node", "cli", "content", "from-mdx", "--input", md, "--out", out])).toBe(
      0,
    )
    const j = JSON.parse(readFileSync(out, "utf8")) as { title?: string }
    expect(j.title).toBe("From MD")
    log.mockRestore()
  })

  it("analyze exits 0 for valid input", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const input = join(tmpdir(), `an-in-${Date.now()}.json`)
    created.push(input)
    writeFileSync(
      input,
      JSON.stringify({ title: "Valid", description: "Enough text here for checks." }),
      "utf8",
    )
    expect(await runCli(["node", "cli", "analyze", "--input", input])).toBe(0)
    log.mockRestore()
  })

  it("analyze exits 1 when title empty", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const input = join(tmpdir(), `an-bad-${Date.now()}.json`)
    created.push(input)
    writeFileSync(input, JSON.stringify({ title: "", description: "x" }), "utf8")
    expect(await runCli(["node", "cli", "analyze", "--input", input])).toBe(1)
    err.mockRestore()
  })
})
