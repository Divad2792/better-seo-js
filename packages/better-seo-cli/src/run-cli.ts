import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseArgs } from "node:util"
import type { IconManifestConfig, OGTheme, PwaDisplay } from "@better-seo/assets"
import {
  renderAtomFeed,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRssXml,
  renderSitemapIndexXml,
  renderSitemapXml,
  type AtomEntry,
  type RssItem,
} from "@better-seo/crawl"
import { runAnalyze, runPreview, runSnapshot } from "./cli-devtools.js"
import { executeIcons, executeOg, parseDisplayString, parseThemeString } from "./cli-execute.js"
import { runDoctor, runInit, runMigrate } from "./cli-subcommands.js"
import { runInteractiveLauncher, shouldOfferTui } from "./launch-interactive.js"

function printGlobalHelp(): void {
  console.log(`better-seo — CLI for @better-seo (optional packages)

Interactive: run better-seo with no subcommand in a TTY (not in CI) for a guided menu.

Non-interactive: subcommands and flags. Use --no-interactive / -y before the subcommand, or set CI=true.

Commands:
  og <title>              Generate a 1200×630 Open Graph PNG
  icons <file>            Generate favicon / PWA icons (+ optional manifest.json)
  crawl robots|sitemap|rss|atom|llms|sitemap-index   Crawl / syndication helpers (@better-seo/crawl)
  snapshot                Tag snapshot + compare (Wave 8)
  preview                 HTML head preview (Wave 8)
  analyze                 validateSEO gate (Wave 10)
  doctor                  Environment + package.json adapter hints (--json)
  init                    Print install + starter snippet (--framework next|react)
  migrate                 Migration hints (e.g. from-next-seo)

Usage:
  better-seo
  better-seo og <title> [options]
  better-seo icons <source.{svg,png,...}> [options]
  better-seo crawl robots [--out path] [--sitemap url]...
  better-seo crawl sitemap [--out path] --loc url [--loc url]...
  better-seo doctor [--json]
  better-seo init [--framework next|react]
  better-seo migrate from-next-seo

Run:  better-seo og --help    or    better-seo icons --help
`)
}

function printOgHelp(): void {
  console.log(`Generate an Open Graph PNG (Wave 2).

Usage:
  better-seo og <title> [options]

Options:
  --out, -o          Output PNG path (default: og.png)
  --site-name        Site label in card header (default: "@better-seo")
  --description, -d  Subtitle text
  --theme            light | dark | auto (default: light; auto → light in Node)
  --logo             Local file path or https URL for the logo image
  --template         Path to compiled .js/.mjs Satori component (see @better-seo/assets OG docs)
  --help, -h         Show help

Examples:
  npx @better-seo/cli og "Hello World"
  npx @better-seo/cli og "Ship faster" -o ./public/og.png --site-name "Acme"
  npx @better-seo/cli og "Hi" --template ./my-og.mjs
  npx better-seo og "Hello World"
`)
}

function printIconsHelp(): void {
  console.log(`Generate favicon and PWA icon files, and optional manifest.json (Wave 3).

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

function printCrawlHelp(): void {
  console.log(`Crawl helpers (@better-seo/crawl) — write strings to disk.

Usage:
  better-seo crawl robots [options]
  better-seo crawl sitemap [options]
  better-seo crawl rss [options]
  better-seo crawl atom [options]
  better-seo crawl llms [options]
  better-seo crawl sitemap-index [options]

robots options:
  --out, -o           Output path (default: public/robots.txt)
  --sitemap           Sitemap URL (repeatable)
  --host              Optional Host: line
  --help, -h

sitemap options:
  --out, -o           Output path (default: public/sitemap.xml)
  --loc               Page URL (repeatable, required)
  --help, -h

rss options:
  --out, -o           (default: public/rss.xml)
  --title, --link     Channel (required)
  --description       Optional channel description
  --language          e.g. en-us
  --items             Path to JSON { "items": [ { title, link, description?, pubDate? } ] }
  --help, -h

atom options:
  --out, -o           (default: public/atom.xml)
  --title, --link, --id, --updated   Feed metadata (required)
  --entries           Path to JSON { "entries": [ { title, link, id, updated, summary? } ] }
  --help, -h

llms options:
  --out, -o           (default: public/llms.txt)
  --title             H1 (required)
  --summary           Optional blockquote
  --url               Repeatable → bullet list under “Optional”
  --help, -h

sitemap-index options:
  --out, -o           (default: public/sitemap-index.xml)
  --sitemap           Child sitemap URL (repeatable, required)
  --help, -h

Examples:
  better-seo crawl robots -o public/robots.txt --sitemap https://example.com/sitemap.xml
  better-seo crawl sitemap --loc https://example.com/ --loc https://example.com/about
  better-seo crawl llms --title "Example" --url https://example.com/docs
`)
}

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8")
  return JSON.parse(raw) as T
}

const ogCommandOptions = {
  out: { type: "string" as const, short: "o", default: "og.png" },
  "site-name": { type: "string" as const, default: "@better-seo" },
  description: { type: "string" as const, short: "d" },
  theme: { type: "string" as const },
  logo: { type: "string" as const },
  template: { type: "string" as const },
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

function asStringArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v : [v]
}

function peelLeadingGlobalFlags(argv: readonly string[]): {
  forceNonInteractive: boolean
  rest: string[]
} {
  let forceNonInteractive = false
  const rest: string[] = []
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!
    if (a === "--no-interactive" || a === "-y" || a === "--yes") {
      forceNonInteractive = true
      continue
    }
    rest.push(a)
  }
  return { forceNonInteractive, rest }
}

async function runOg(rest: string[]): Promise<number> {
  let positionals: string[]
  let values: {
    out?: string
    "site-name"?: string
    description?: string
    theme?: string
    logo?: string
    template?: string
    help?: boolean
  }
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
    theme = parseThemeString(values.theme)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  return executeOg({
    title,
    out: values.out,
    siteName: values["site-name"],
    description: values.description,
    theme,
    logo: values.logo,
    template: values.template,
  })
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
    display = parseDisplayString(values.display)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

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

  return executeIcons({
    source,
    outputDir: values.output,
    backgroundColor: values.bg,
    omitManifest: values["no-manifest"] === true,
    ...(values["no-manifest"] !== true ? { manifest: manifestBase } : {}),
  })
}

async function runCrawlRobots(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/robots.txt" },
        sitemap: { type: "string" as const, multiple: true },
        host: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    const out = values.out ?? "public/robots.txt"
    const maps = asStringArray(values.sitemap)
    const body = renderRobotsTxt({
      ...(maps?.length ? { sitemap: maps.filter((u) => u.trim()) } : {}),
      ...(values.host?.trim() ? { host: values.host.trim() } : {}),
    })
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, body, "utf8")
    console.log(`Wrote ${out} (${body.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawlSitemap(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/sitemap.xml" },
        loc: { type: "string" as const, multiple: true },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    const list = asStringArray(values.loc) ?? []
    const trimmed = list.map((u) => u.trim()).filter(Boolean)
    if (!trimmed.length) {
      console.error(
        "Missing --loc (repeat per URL). Example: better-seo crawl sitemap --loc https://example.com/",
      )
      return 1
    }
    const out = values.out ?? "public/sitemap.xml"
    const xml = renderSitemapXml(trimmed.map((loc) => ({ loc })))
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, xml, "utf8")
    console.log(`Wrote ${out} (${xml.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawlRss(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/rss.xml" },
        title: { type: "string" as const },
        link: { type: "string" as const },
        description: { type: "string" as const },
        language: { type: "string" as const },
        items: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    if (!values.title?.trim() || !values.link?.trim()) {
      console.error("crawl rss: --title and --link are required")
      return 1
    }
    let items: readonly RssItem[] = []
    if (values.items?.trim()) {
      const j = await readJson<{ items?: RssItem[] }>(values.items.trim())
      items = j.items ?? []
    }
    const xml = renderRssXml({
      title: values.title.trim(),
      link: values.link.trim(),
      ...(values.description?.trim() ? { description: values.description.trim() } : {}),
      ...(values.language?.trim() ? { language: values.language.trim() } : {}),
      items,
    })
    const out = values.out ?? "public/rss.xml"
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, xml, "utf8")
    console.log(`Wrote ${out} (${xml.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawlAtom(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/atom.xml" },
        title: { type: "string" as const },
        link: { type: "string" as const },
        id: { type: "string" as const },
        updated: { type: "string" as const },
        entries: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    if (
      !values.title?.trim() ||
      !values.link?.trim() ||
      !values.id?.trim() ||
      !values.updated?.trim()
    ) {
      console.error("crawl atom: --title, --link, --id, --updated are required")
      return 1
    }
    let entries: readonly AtomEntry[] = []
    if (values.entries?.trim()) {
      const j = await readJson<{ entries?: AtomEntry[] }>(values.entries.trim())
      entries = j.entries ?? []
    }
    const xml = renderAtomFeed({
      title: values.title.trim(),
      link: values.link.trim(),
      id: values.id.trim(),
      updated: values.updated.trim(),
      entries,
    })
    const out = values.out ?? "public/atom.xml"
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, xml, "utf8")
    console.log(`Wrote ${out} (${xml.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawlLlms(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/llms.txt" },
        title: { type: "string" as const },
        summary: { type: "string" as const },
        url: { type: "string" as const, multiple: true },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    if (!values.title?.trim()) {
      console.error("crawl llms: --title is required")
      return 1
    }
    const urls = (Array.isArray(values.url) ? values.url : values.url ? [values.url] : [])
      .map((u) => u.trim())
      .filter(Boolean)
    const txt = renderLlmsTxt({
      title: values.title.trim(),
      ...(values.summary?.trim() ? { summary: values.summary.trim() } : {}),
      ...(urls.length ? { blocks: [{ heading: "Optional", lines: urls }] } : { blocks: undefined }),
    })
    const out = values.out ?? "public/llms.txt"
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, txt, "utf8")
    console.log(`Wrote ${out} (${txt.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawlSitemapIndex(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const, short: "o", default: "public/sitemap-index.xml" },
        sitemap: { type: "string" as const, multiple: true },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printCrawlHelp()
      return 0
    }
    const list = asStringArray(values.sitemap) ?? []
    const trimmed = list.map((u) => u.trim()).filter(Boolean)
    if (!trimmed.length) {
      console.error("crawl sitemap-index: need at least one --sitemap URL")
      return 1
    }
    const xml = renderSitemapIndexXml(trimmed)
    const out = values.out ?? "public/sitemap-index.xml"
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, xml, "utf8")
    console.log(`Wrote ${out} (${xml.length} chars)`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

async function runCrawl(rest: string[]): Promise<number> {
  const sub = rest[0]
  const tail = rest.slice(1)
  if (sub === undefined || sub === "-h" || sub === "--help") {
    printCrawlHelp()
    return sub === undefined ? 1 : 0
  }
  if (sub === "robots") return runCrawlRobots(tail)
  if (sub === "sitemap") return runCrawlSitemap(tail)
  if (sub === "rss") return runCrawlRss(tail)
  if (sub === "atom") return runCrawlAtom(tail)
  if (sub === "llms") return runCrawlLlms(tail)
  if (sub === "sitemap-index") return runCrawlSitemapIndex(tail)
  console.error(
    `Unknown crawl subcommand "${sub}". Use: robots | sitemap | rss | atom | llms | sitemap-index`,
  )
  return 1
}

/** Re-export for programmatic use / tests. */
export { runDoctor, runInit, runMigrate }

function printUnknown(program: string): void {
  console.error(
    `Unknown command "${program}". Expected: og | icons | crawl | snapshot | preview | analyze | doctor | init | migrate  (better-seo --help)`,
  )
}

/**
 * Main entry for tests and the `better-seo` bin. Returns process exit code.
 */
export async function runCli(argv: readonly string[]): Promise<number> {
  const { forceNonInteractive, rest } = peelLeadingGlobalFlags(argv)
  const program = rest[0]

  if (program === undefined) {
    if (shouldOfferTui(forceNonInteractive)) {
      return runInteractiveLauncher()
    }
    printGlobalHelp()
    return 1
  }

  if (program === "-h" || program === "--help") {
    printGlobalHelp()
    return 0
  }

  if (program === "og") {
    return runOg(rest.slice(1))
  }

  if (program === "icons") {
    return runIcons(rest.slice(1))
  }

  if (program === "crawl") {
    return runCrawl(rest.slice(1))
  }

  if (program === "snapshot") {
    return runSnapshot(rest.slice(1))
  }

  if (program === "preview") {
    return runPreview(rest.slice(1))
  }

  if (program === "analyze") {
    return runAnalyze(rest.slice(1))
  }

  if (program === "doctor") {
    return runDoctor(rest.slice(1))
  }

  if (program === "init") {
    return runInit(rest.slice(1))
  }

  if (program === "migrate") {
    return runMigrate(rest.slice(1))
  }

  printUnknown(program)
  return 1
}
