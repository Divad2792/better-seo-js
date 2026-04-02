import { mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it, vi } from "vitest"
import { imageSize } from "image-size"
import { generateOG, resolveLogoDataUrl } from "./og/generate-og.js"
import { OG_IMAGE_SIZE } from "./types.js"

describe("generateOG", () => {
  const tmpFiles: string[] = []
  afterEach(() => {
    for (const f of tmpFiles) {
      try {
        unlinkSync(f)
      } catch {
        /* ignore */
      }
    }
    tmpFiles.length = 0
  })

  it("returns a 1200×630 PNG with expected magic bytes", async () => {
    const buf = await generateOG({
      title: "Hello World",
      siteName: "Demo",
      description: "Optional subtitle for social previews.",
    })
    expect(
      buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe(true)
    const dims = imageSize(buf)
    expect(dims.width).toBe(OG_IMAGE_SIZE.width)
    expect(dims.height).toBe(OG_IMAGE_SIZE.height)
    expect(buf.byteLength).toBeGreaterThan(8000)
  })

  it("supports dark theme and custom colors", async () => {
    const buf = await generateOG({
      title: "Dark card",
      siteName: "Night",
      theme: "dark",
      colors: { primary: "#f472b6", background: "#1e1b4b" },
    })
    const dims = imageSize(buf)
    expect(dims.width).toBe(OG_IMAGE_SIZE.width)
    expect(buf.byteLength).toBeGreaterThan(4000)
  })

  it("rejects empty title", async () => {
    await expect(generateOG({ title: "   ", siteName: "X" })).rejects.toThrow(/title/)
  })

  it("rejects empty siteName", async () => {
    await expect(generateOG({ title: "T", siteName: "   " })).rejects.toThrow(/siteName/)
  })

  it("supports explicit light theme", async () => {
    const buf = await generateOG({
      title: "Light",
      siteName: "S",
      theme: "light",
    })
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
  })

  it("rejects non-js template extension", async () => {
    await expect(
      generateOG({
        title: "T",
        siteName: "S",
        template: "./custom.tsx",
      }),
    ).rejects.toThrow(/compiled \.js or \.mjs/)
  })

  it("renders with a custom .mjs template module", async () => {
    const tplPath = fileURLToPath(
      new URL("./__fixtures__/minimal-og-template.mjs", import.meta.url),
    )
    const buf = await generateOG({
      title: "Custom tmpl",
      siteName: "CI",
      template: tplPath,
    })
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
  })

  it("embeds a local PNG logo when provided", async () => {
    const dir = join(tmpdir(), `bsa-og-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    const logoPath = join(dir, "logo.png")
    const miniPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    )
    writeFileSync(logoPath, miniPng)
    tmpFiles.push(logoPath)

    const buf = await generateOG({
      title: "With logo",
      siteName: "Brand",
      logo: logoPath,
    })
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
  })
})

describe("resolveLogoDataUrl", () => {
  const tmpFiles: string[] = []
  afterEach(() => {
    vi.unstubAllGlobals()
    for (const f of tmpFiles) {
      try {
        unlinkSync(f)
      } catch {
        /* ignore */
      }
    }
    tmpFiles.length = 0
  })

  it("returns undefined for blank input", async () => {
    expect(await resolveLogoDataUrl(undefined)).toBeUndefined()
    expect(await resolveLogoDataUrl("  ")).toBeUndefined()
  })

  it("uses image/jpeg mime for .jpg paths", async () => {
    const p = join(tmpdir(), `og-logo-${Date.now()}.jpg`)
    writeFileSync(p, Buffer.from([1, 2, 3]))
    tmpFiles.push(p)
    const url = await resolveLogoDataUrl(p)
    expect(url).toMatch(/^data:image\/jpeg;base64,/)
  })

  it("uses image/webp mime for .webp paths", async () => {
    const p = join(tmpdir(), `og-logo-${Date.now()}.webp`)
    writeFileSync(p, Buffer.from([4, 5, 6]))
    tmpFiles.push(p)
    const url = await resolveLogoDataUrl(p)
    expect(url).toMatch(/^data:image\/webp;base64,/)
  })

  it("uses octet-stream for unknown logo extension", async () => {
    const p = join(tmpdir(), `og-logo-${Date.now()}.bin`)
    writeFileSync(p, Buffer.from([0, 1, 2]))
    tmpFiles.push(p)
    const url = await resolveLogoDataUrl(p)
    expect(url).toMatch(/^data:application\/octet-stream;base64,/)
  })

  it("fetches http(s) logos", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    )
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (): Promise<Response> =>
          ({
            ok: true,
            arrayBuffer: async () => new Uint8Array(png).buffer,
            headers: {
              get: (name: string) => (name.toLowerCase() === "content-type" ? "image/png" : null),
            },
          }) as Response,
      ) as typeof fetch,
    )
    const urlHttps = await resolveLogoDataUrl("https://example.com/logo.png")
    expect(urlHttps).toMatch(/^data:image\/png;base64,/)
    const urlHttp = await resolveLogoDataUrl("http://example.com/logo.png")
    expect(urlHttp).toMatch(/^data:image\/png;base64,/)
  })

  it("throws when fetch returns non-OK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (): Promise<Response> =>
          ({
            ok: false,
            status: 404,
            statusText: "Nope",
          }) as Response,
      ) as typeof fetch,
    )
    await expect(resolveLogoDataUrl("https://example.com/missing.png")).rejects.toThrow(/404/)
  })
})
