import { createRequire } from "node:module"
import { access } from "node:fs/promises"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

const require = createRequire(import.meta.url)
const toIco: (input: Buffer | readonly Buffer[]) => Promise<Buffer> = require("to-ico")

const DEFAULT_SIZES = [16, 32, 192, 512] as const

export type PwaDisplay = "standalone" | "minimal-ui" | "browser"

export interface IconManifestConfig {
  readonly name: string
  readonly shortName: string
  readonly startUrl: string
  readonly display: PwaDisplay
  readonly themeColor?: string
  readonly backgroundColor?: string
}

export interface IconGeneratorConfig {
  readonly source: string
  readonly outputDir: string
  /** Square PNG sizes (default 16, 32, 192, 512 → `icon-{n}.png`). */
  readonly sizes?: readonly number[]
  /** Background for transparent regions (CSS color, default `#ffffff`). */
  readonly backgroundColor?: string
  /** When set, writes `manifest.json` alongside icons. */
  readonly manifest?: IconManifestConfig
}

export interface WrittenIconAsset {
  readonly fileName: string
  readonly bytesWritten: number
}

export interface WebManifestIcon {
  readonly src: string
  readonly sizes: string
  readonly type: "image/png"
  readonly purpose?: "any" | "maskable" | "monochrome"
}

export interface WebAppManifest {
  readonly name: string
  readonly short_name: string
  readonly start_url: string
  readonly display: PwaDisplay
  readonly icons: readonly WebManifestIcon[]
  readonly theme_color?: string
  readonly background_color?: string
}

function sharpSource(source: string): sharp.Sharp {
  return source.toLowerCase().endsWith(".svg") ? sharp(source, { density: 300 }) : sharp(source)
}

async function rasterSquarePng(source: string, size: number, background: string): Promise<Buffer> {
  return sharpSource(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .flatten({ background })
    .png()
    .toBuffer()
}

async function rasterMaskablePng(source: string, background: string): Promise<Buffer> {
  const canvas = 512
  const inner = Math.round(canvas * 0.72)
  const innerBuf = await sharpSource(source)
    .resize(inner, inner, { fit: "cover", position: "centre" })
    .flatten({ background })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background,
    },
  })
    .composite([{ input: innerBuf, gravity: "centre" }])
    .png()
    .toBuffer()
}

/** Icons referenced by {@link buildWebAppManifest} for the default generator file names. */
export function defaultWebManifestIcons(): readonly WebManifestIcon[] {
  return [
    { src: "icon-16.png", sizes: "16x16", type: "image/png", purpose: "any" },
    { src: "icon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
    { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    { src: "maskable-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ]
}

export function buildWebAppManifest(
  config: IconManifestConfig,
  icons: readonly WebManifestIcon[] = defaultWebManifestIcons(),
): WebAppManifest {
  const bg = config.backgroundColor
  return {
    name: config.name,
    short_name: config.shortName,
    start_url: config.startUrl,
    display: config.display,
    icons,
    ...(config.themeColor !== undefined ? { theme_color: config.themeColor } : {}),
    ...(bg !== undefined ? { background_color: bg } : {}),
  }
}

export function formatWebManifest(manifest: WebAppManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

/**
 * Writes favicon / PWA icon files and optional `manifest.json` (PRD §3.7 Wave 3).
 */
export async function generateIcons(
  config: IconGeneratorConfig,
): Promise<readonly WrittenIconAsset[]> {
  await access(config.source).catch(() => {
    throw new Error(`Icon source not found: ${config.source}`)
  })

  const background = config.backgroundColor ?? "#ffffff"
  const sizes = config.sizes ?? DEFAULT_SIZES
  await mkdir(config.outputDir, { recursive: true })

  const written: WrittenIconAsset[] = []
  const bySize = new Map<number, Buffer>()

  for (const size of sizes) {
    const buf = await rasterSquarePng(config.source, size, background)
    bySize.set(size, buf)
    const fileName = `icon-${size}.png`
    await writeFile(join(config.outputDir, fileName), buf)
    written.push({ fileName, bytesWritten: buf.byteLength })
  }

  const appleBuf = await rasterSquarePng(config.source, 180, background)
  const appleName = "apple-touch-icon.png"
  await writeFile(join(config.outputDir, appleName), appleBuf)
  written.push({ fileName: appleName, bytesWritten: appleBuf.byteLength })

  const maskableBuf = await rasterMaskablePng(config.source, background)
  const maskName = "maskable-icon.png"
  await writeFile(join(config.outputDir, maskName), maskableBuf)
  written.push({ fileName: maskName, bytesWritten: maskableBuf.byteLength })

  const buf16 = bySize.get(16) ?? (await rasterSquarePng(config.source, 16, background))
  const buf32 = bySize.get(32) ?? (await rasterSquarePng(config.source, 32, background))
  const icoBuf = await toIco([buf16, buf32])
  const icoName = "favicon.ico"
  await writeFile(join(config.outputDir, icoName), icoBuf)
  written.push({ fileName: icoName, bytesWritten: icoBuf.byteLength })

  if (config.manifest !== undefined) {
    const manifestBody = formatWebManifest(buildWebAppManifest(config.manifest))
    const manifestName = "manifest.json"
    await writeFile(join(config.outputDir, manifestName), manifestBody, "utf8")
    written.push({ fileName: manifestName, bytesWritten: Buffer.byteLength(manifestBody, "utf8") })
  }

  return written
}
