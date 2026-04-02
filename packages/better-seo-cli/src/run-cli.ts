import { writeFile } from "node:fs/promises"
import { parseArgs } from "node:util"
import { generateIcons, generateOG } from "better-seo-assets"
import type { IconManifestConfig, OGTheme, PwaDisplay } from "better-seo-assets"

function printGlobalHelp(): void {
  console.log(`better-seo — CLI for better-seo.js (optional packages)

Usage:
  better-seo og <title> [options]
  better-seo icons <source> [options]

Run better-seo og --help or better-seo icons --help for command options.
`)
}

function printOgHelp(): void {
  console.log(`Generate an Open Graph PNG (Wave 2).

Usage:
  better-seo og <title> [options]

Options:
  --out, -o          Output PNG path (default: og.png)
  --site-name        Site label in card header (default: "better-seo.js")
  --description, -d  Subtitle text
  --theme            light | dark | auto (default: light; auto → light in Node)
  --logo             Local file path or https URL for the logo image
  --help, -h         Show help

Examples:
  npx better-seo-cli og "Hello World"
  npx better-seo-cli og "Ship faster" -o ./public/og.png --site-name "Acme"
  npx better-seo og "Hello World"
`)
}

function printIconsHelp(): void {
  console.log(`Generate favicons, PWA icons, and optional manifest.json (Wave 3).

Usage:
  better-seo icons <source.{svg,png,...}> [options]

Options:
  --output, -o       Output directory (default: public)
  --bg               Background for transparency (CSS color, default: #ffffff)
  --name             Web app name for manifest (default: App)
  --short-name       manifest short_name (default: same as --name)
  --start-url        manifest start_url (default: /)
  --display          standalone | minimal-ui | browser (default: standalone)
  --theme-color      Optional manifest theme_color
  --no-manifest      Do not write manifest.json
  --help, -h         Show help

Examples:
  npx better-seo icons ./logo.svg -o ./public
  npx better-seo icons ./assets/mark.svg --name "Acme" --theme-color "#0f172a"
`)
}

function parseTheme(s: string | undefined): OGTheme | undefined {
  if (s === undefined) return undefined
  if (s === "light" || s === "dark" || s === "auto") return s
  throw new Error(`Invalid --theme "${s}". Use light, dark, or auto.`)
}

function parseDisplay(s: string | undefined): PwaDisplay {
  if (s === undefined) return "standalone"
  if (s === "standalone" || s === "minimal-ui" || s === "browser") return s
  throw new Error(`Invalid --display "${s}". Use standalone, minimal-ui, or browser.`)
}

const ogCommandOptions = {
  out: { type: "string" as const, short: "o", default: "og.png" },
  "site-name": { type: "string" as const, default: "better-seo.js" },
  description: { type: "string" as const, short: "d" },
  theme: { type: "string" as const },
  logo: { type: "string" as const },
  help: { type: "boolean" as const, short: "h", default: false },
}

const iconsCommandOptions = {
  output: { type: "string" as const, short: "o", default: "public" },
  bg: { type: "string" as const },
  name: { type: "string" as const, default: "App" },
  "short-name": { type: "string" as const },
  "start-url": { type: "string" as const, default: "/" },
  display: { type: "string" as const },
  "theme-color": { type: "string" as const },
  "no-manifest": { type: "boolean" as const, default: false },
  help: { type: "boolean" as const, short: "h", default: false },
}

async function runOg(rest: string[]): Promise<number> {
  let values: {
    out?: string
    "site-name"?: string
    description?: string
    theme?: string
    logo?: string
    help?: boolean
  }
  let positionals: string[]

  try {
    const parsed = parseArgs({
      args: rest,
      options: ogCommandOptions,
      allowPositionals: true,
    })
    values = parsed.values
    positionals = parsed.positionals
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  if (values.help === true) {
    printOgHelp()
    return 0
  }

  const title = positionals[0]
  if (!title) {
    console.error('Missing <title>. Example: better-seo og "Hello World"')
    return 1
  }

  let theme: OGTheme | undefined
  try {
    theme = parseTheme(values.theme)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  const out = values.out ?? "og.png"
  const siteName = values["site-name"] ?? "better-seo.js"

  try {
    const started = performance.now()
    const png = await generateOG({
      title,
      siteName,
      ...(values.description !== undefined ? { description: values.description } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(values.logo !== undefined ? { logo: values.logo } : {}),
    })
    await writeFile(out, png)
    const ms = Math.round(performance.now() - started)
    console.log(`Wrote ${out} (${png.byteLength} bytes) in ${ms}ms`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runIcons(rest: string[]): Promise<number> {
  let values: {
    output?: string
    bg?: string
    name?: string
    "short-name"?: string
    "start-url"?: string
    display?: string
    "theme-color"?: string
    "no-manifest"?: boolean
    help?: boolean
  }
  let positionals: string[]

  try {
    const parsed = parseArgs({
      args: rest,
      options: iconsCommandOptions,
      allowPositionals: true,
    })
    values = parsed.values
    positionals = parsed.positionals
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  if (values.help === true) {
    printIconsHelp()
    return 0
  }

  const source = positionals[0]
  if (!source) {
    console.error("Missing <source>. Example: better-seo icons ./logo.svg -o ./public")
    return 1
  }

  let display: PwaDisplay
  try {
    display = parseDisplay(values.display)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  const outputDir = values.output ?? "public"
  const name = values.name ?? "App"
  const shortName = values["short-name"] ?? name
  const startUrl = values["start-url"] ?? "/"

  const manifestBase: IconManifestConfig = {
    name,
    shortName,
    startUrl,
    display,
    ...(values["theme-color"] !== undefined ? { themeColor: values["theme-color"] } : {}),
    ...(values.bg !== undefined ? { backgroundColor: values.bg } : {}),
  }

  try {
    const started = performance.now()
    const written = await generateIcons({
      source,
      outputDir,
      ...(values.bg !== undefined ? { backgroundColor: values.bg } : {}),
      ...(values["no-manifest"] === true ? {} : { manifest: manifestBase }),
    })
    const ms = Math.round(performance.now() - started)
    for (const f of written) {
      console.log(`Wrote ${outputDir}/${f.fileName} (${f.bytesWritten} bytes)`)
    }
    console.log(`Done in ${ms}ms`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

/**
 * Main entry for tests and the `better-seo` bin. Returns process exit code.
 */
export async function runCli(argv: readonly string[]): Promise<number> {
  const program = argv[2]

  if (program === undefined) {
    printGlobalHelp()
    return 1
  }

  if (program === "-h" || program === "--help") {
    printGlobalHelp()
    return 0
  }

  if (program === "og") {
    return runOg(argv.slice(3))
  }

  if (program === "icons") {
    return runIcons(argv.slice(3))
  }

  console.error(`Unknown command "${program}". Run better-seo --help.`)
  return 1
}
