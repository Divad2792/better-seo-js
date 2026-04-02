import { mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { imageSize } from "image-size"
import { OG_IMAGE_SIZE } from "better-seo-assets"
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
        rmdirSync(d, { recursive: true })
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
})
