/**
 * Wave 11 — CLI splash command.
 * Generates PWA splash screens from a source icon.
 */

import { parseArgs } from "node:util"
import { generateSplash, type SplashOptions } from "@better-seo/assets"

function printSplashHelp(): void {
  console.log(`Generate PWA splash screens (Wave 11 / A4).

Usage:
  better-seo splash <icon> [options]

Arguments:
  <icon>              Source icon path (SVG or PNG, 512+ recommended)

Options:
  --name              App name displayed on splash (default: "My App")
  --bg                Background color (default: "#ffffff")
  --theme             Theme color for status bar
  --out               Output directory (default: "public")
  --help, -h          Show help

Examples:
  better-seo splash assets/icon.svg --name "My App"
  better-seo splash assets/icon.png --bg "#0f172a" --name "Dark App"
`)
}

export async function runSplash(rest: string[]): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args: rest,
      options: {
        name: { type: "string" as const, default: "My App" },
        bg: { type: "string" as const, default: "#ffffff" },
        theme: { type: "string" as const },
        out: { type: "string" as const, default: "public" },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })

    if (values.help) {
      printSplashHelp()
      return 0
    }

    const icon = positionals[0]
    if (!icon) {
      console.error("Missing <icon>. Example: better-seo splash assets/icon.svg")
      return 1
    }

    const options: SplashOptions = {
      icon,
      name: values.name ?? "My App",
      backgroundColor: values.bg,
      themeColor: values.theme,
      outputDir: values.out,
    }

    const files = await generateSplash(options)
    console.log(`Generated ${files.length} splash screens:`)
    for (const f of files) {
      console.log(`  - ${f}`)
    }
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
