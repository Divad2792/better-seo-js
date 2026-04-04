/**
 * Wave 11 — Splash screen image generation for PWA.
 * Generates platform-specific splash screens from a source icon + theme color.
 * Uses Sharp for resizing.
 */

import { readFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

export interface SplashOptions {
  /** Source icon (SVG or PNG). */
  readonly icon: string
  /** App name displayed on splash (reserved for future use). */
  readonly name?: string
  /** Background color (CSS color string). */
  readonly backgroundColor?: string
  /** Theme color for status bar. */
  readonly themeColor?: string
  /** Output directory for splash images. */
  readonly outputDir?: string
}

export interface SplashSize {
  readonly width: number
  readonly height: number
  readonly scale: number
  readonly idiom: string
}

/** Standard iOS splash screen sizes. */
export const SPLASH_SIZES: readonly SplashSize[] = [
  { width: 1284, height: 2778, scale: 3, idiom: "iphone" },
  { width: 1170, height: 2532, scale: 3, idiom: "iphone" },
  { width: 1125, height: 2436, scale: 3, idiom: "iphone" },
  { width: 828, height: 1792, scale: 2, idiom: "iphone" },
  { width: 1242, height: 2688, scale: 3, idiom: "iphone" },
  { width: 1536, height: 2048, scale: 2, idiom: "ipad" },
  { width: 1668, height: 2224, scale: 2, idiom: "ipad" },
  { width: 1668, height: 2388, scale: 2, idiom: "ipad" },
  { width: 2048, height: 2732, scale: 2, idiom: "ipad" },
]

/**
 * Determine if a color is "light" for contrast decisions.
 * Exported for testing and future template use.
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace("#", "")
  if (hex.length === 3) {
    const r = parseInt(hex[0]! + hex[0]!, 16)
    const g = parseInt(hex[1]! + hex[1]!, 16)
    const b = parseInt(hex[2]! + hex[2]!, 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128
  }
  return true
}

export async function generateSplash(options: SplashOptions): Promise<string[]> {
  const { icon, backgroundColor = "#ffffff", outputDir = "public" } = options

  const iconBuffer = await readFile(icon)
  const generated: string[] = []

  await mkdir(outputDir, { recursive: true })

  for (const size of SPLASH_SIZES) {
    const filename = `splash-${size.width}x${size.height}.png`
    const outputPath = join(outputDir, filename)

    // Resize icon to fit splash dimensions (centered, 20% of width)
    const iconSize = Math.floor(size.width * 0.2)
    const resizedIcon = await sharp(iconBuffer)
      .resize(iconSize, iconSize, { fit: "contain" })
      .png()
      .toBuffer()

    // Create splash image with background and centered icon
    const svg = `
      <svg width="${size.width}" height="${size.height}">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <image x="${(size.width - iconSize) / 2}" y="${(size.height - iconSize) / 2 - 50}" 
               width="${iconSize}" height="${iconSize}" 
               href="data:image/png;base64,${resizedIcon.toString("base64")}"/>
      </svg>
    `

    await sharp(Buffer.from(svg)).png().toFile(outputPath)

    generated.push(outputPath)
  }

  return generated
}
