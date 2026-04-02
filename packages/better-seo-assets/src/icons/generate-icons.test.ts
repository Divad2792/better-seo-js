import { readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { imageSize } from "image-size"
import {
  buildWebAppManifest,
  defaultWebManifestIcons,
  formatWebManifest,
  generateIcons,
} from "./generate-icons.js"

const FIXTURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#2d6cdf"/>
  <circle cx="32" cy="32" r="18" fill="#ffffff"/>
</svg>`

describe("generateIcons", () => {
  const dirs: string[] = []
  const files: string[] = []

  afterEach(async () => {
    for (const f of files) {
      try {
        await rm(f, { force: true })
      } catch {
        /* ignore */
      }
    }
    files.length = 0
    for (const d of dirs) {
      try {
        await rm(d, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    dirs.length = 0
  })

  it("writes icon matrix, favicon.ico, and optional manifest", async () => {
    const src = join(tmpdir(), `icon-src-${Date.now()}.svg`)
    files.push(src)
    await writeFile(src, FIXTURE_SVG, "utf8")

    const out = join(tmpdir(), `icon-out-${Date.now()}`)
    dirs.push(out)

    const result = await generateIcons({
      source: src,
      outputDir: out,
      manifest: {
        name: "Test App",
        shortName: "Test",
        startUrl: "/",
        display: "standalone",
        themeColor: "#2d6cdf",
      },
    })

    const names = new Set(result.map((r) => r.fileName))
    expect(names.has("icon-16.png")).toBe(true)
    expect(names.has("icon-32.png")).toBe(true)
    expect(names.has("icon-192.png")).toBe(true)
    expect(names.has("icon-512.png")).toBe(true)
    expect(names.has("apple-touch-icon.png")).toBe(true)
    expect(names.has("maskable-icon.png")).toBe(true)
    expect(names.has("favicon.ico")).toBe(true)
    expect(names.has("manifest.json")).toBe(true)

    const png512 = await readFile(join(out, "icon-512.png"))
    const png180 = await readFile(join(out, "apple-touch-icon.png"))
    expect(imageSize(png512).width).toBe(512)
    expect(imageSize(png180).width).toBe(180)

    const ico = await readFile(join(out, "favicon.ico"))
    expect(ico[0]).toBe(0)
    expect(ico[1]).toBe(0)
    expect(ico[2]).toBe(1)
    expect(ico[3]).toBe(0)

    const manifest = JSON.parse(await readFile(join(out, "manifest.json"), "utf8")) as {
      name: string
      short_name: string
      icons: { src: string }[]
    }
    expect(manifest.name).toBe("Test App")
    expect(manifest.short_name).toBe("Test")
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  it("throws when source is missing", async () => {
    await expect(
      generateIcons({ source: join(tmpdir(), "nope.svg"), outputDir: join(tmpdir(), "x") }),
    ).rejects.toThrow(/not found/)
  })

  it("re-rasterizes 16 and 32 for favicon when sizes omit them", async () => {
    const src = join(tmpdir(), `icon-src-sz-${Date.now()}.svg`)
    files.push(src)
    await writeFile(src, FIXTURE_SVG, "utf8")

    const out = join(tmpdir(), `icon-out-sz-${Date.now()}`)
    dirs.push(out)

    const result = await generateIcons({
      source: src,
      outputDir: out,
      sizes: [192, 512],
    })

    expect(new Set(result.map((r) => r.fileName)).has("favicon.ico")).toBe(true)
  })
})

describe("buildWebAppManifest", () => {
  it("matches default icon list from generator", () => {
    const m = buildWebAppManifest({
      name: "A",
      shortName: "a",
      startUrl: "/",
      display: "browser",
    })
    expect(m.icons).toEqual(defaultWebManifestIcons())
  })

  it("formats JSON with trailing newline", () => {
    const s = formatWebManifest(
      buildWebAppManifest({
        name: "A",
        shortName: "a",
        startUrl: "/",
        display: "standalone",
      }),
    )
    expect(s.endsWith("\n")).toBe(true)
    expect(JSON.parse(s).name).toBe("A")
  })
})
