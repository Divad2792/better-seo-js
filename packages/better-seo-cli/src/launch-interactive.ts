import * as clack from "@clack/prompts"
import type { IconManifestConfig } from "@better-seo/assets"
import type { OGTheme, PwaDisplay } from "@better-seo/assets"
import { executeIcons, executeOg } from "./cli-execute.js"
import { runDoctor, runInit, runMigrate } from "./cli-subcommands.js"

type FrameworkGuess = "next" | "react" | "unknown"

function guessFramework(pkg: {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}): FrameworkGuess {
  const all = { ...pkg.dependencies, ...pkg.devDependencies }
  if (all["next"]) return "next"
  if (all["react"]) return "react"
  return "unknown"
}

async function readPackageJson(): Promise<{ framework: FrameworkGuess }> {
  try {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const root = process.cwd()
    const raw = await fs.readFile(path.join(root, "package.json"), "utf8")
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return { framework: guessFramework(pkg) }
  } catch {
    return { framework: "unknown" }
  }
}

async function flowOg(): Promise<number> {
  const title = await clack.text({
    message: "Title",
    placeholder: "Cool page title",
    validate: (v) => ((v ?? "").trim() ? undefined : "Title is required"),
  })
  if (clack.isCancel(title)) {
    clack.cancel("Cancelled")
    return 1
  }
  const siteName = await clack.text({ message: "Site name (optional)", placeholder: "@better-seo" })
  if (clack.isCancel(siteName)) {
    clack.cancel("Cancelled")
    return 1
  }
  const out = await clack.text({ message: "Output path", initialValue: "og.png" })
  if (clack.isCancel(out)) {
    clack.cancel("Cancelled")
    return 1
  }
  const themePick = await clack.select<OGTheme | "default">({
    message: "Theme",
    options: [
      { value: "default", label: "Default (auto)" },
      { value: "light", label: "light" },
      { value: "dark", label: "dark" },
      { value: "auto", label: "auto" },
    ],
  })
  if (clack.isCancel(themePick)) {
    clack.cancel("Cancelled")
    return 1
  }
  const theme = themePick === "default" ? undefined : themePick

  return executeOg({
    title,
    ...(siteName.trim() ? { siteName: siteName.trim() } : {}),
    out,
    ...(theme !== undefined ? { theme } : {}),
  })
}

async function flowIcons(): Promise<number> {
  const source = await clack.text({
    message: "Source icon (SVG or PNG, 512+ recommended)",
    placeholder: "assets/icon.svg",
    validate: (v) => ((v ?? "").trim() ? undefined : "Source path is required"),
  })
  if (clack.isCancel(source)) {
    clack.cancel("Cancelled")
    return 1
  }
  const outputDir = await clack.text({ message: "Output directory", initialValue: "public" })
  if (clack.isCancel(outputDir)) {
    clack.cancel("Cancelled")
    return 1
  }
  const withManifest = await clack.confirm({ message: "Write manifest.json?", initialValue: true })
  if (clack.isCancel(withManifest)) {
    clack.cancel("Cancelled")
    return 1
  }

  let manifest: IconManifestConfig | undefined
  if (withManifest) {
    const name = await clack.text({ message: "App name (manifest)", initialValue: "My App" })
    if (clack.isCancel(name)) {
      clack.cancel("Cancelled")
      return 1
    }
    const shortName = await clack.text({
      message: "Short name (manifest)",
      initialValue: name.slice(0, 12),
    })
    if (clack.isCancel(shortName)) {
      clack.cancel("Cancelled")
      return 1
    }
    const startUrl = await clack.text({ message: "start_url", initialValue: "/" })
    if (clack.isCancel(startUrl)) {
      clack.cancel("Cancelled")
      return 1
    }
    const disp = await clack.select<PwaDisplay>({
      message: "display",
      options: [
        { value: "standalone", label: "standalone" },
        { value: "minimal-ui", label: "minimal-ui" },
        { value: "browser", label: "browser" },
      ],
    })
    if (clack.isCancel(disp)) {
      clack.cancel("Cancelled")
      return 1
    }
    const themeColor = await clack.text({
      message: "theme_color (optional)",
      placeholder: "#0f172a",
    })
    if (clack.isCancel(themeColor)) {
      clack.cancel("Cancelled")
      return 1
    }
    manifest = {
      name,
      shortName,
      startUrl,
      display: disp,
      ...(themeColor.trim() ? { themeColor: themeColor.trim() } : {}),
    }
  }

  return executeIcons({
    source,
    outputDir,
    omitManifest: !withManifest,
    ...(manifest !== undefined ? { manifest } : {}),
  })
}

async function flowCrawlStubs(): Promise<number> {
  clack.note(
    [
      "Crawl / syndication helpers: @better-seo/crawl. Examples:",
      "",
      "  better-seo crawl robots --out public/robots.txt --sitemap https://example.com/sitemap.xml",
      "  better-seo crawl sitemap --out public/sitemap.xml --loc https://example.com/",
      "  better-seo crawl rss --out public/rss.xml --title Site --link https://example.com/",
      "  better-seo crawl atom --out public/atom.xml --title Site --link … --id … --updated …",
      "  better-seo crawl llms --out public/llms.txt --title Site",
      "  better-seo crawl sitemap-index --out public/sitemap-index.xml --sitemap https://…/a.xml",
      "",
      "Trust / debug: better-seo snapshot, preview, analyze (see docs/commands.md).",
      "See docs/recipes/sitemap-robots-next.md for App Router recipes.",
    ].join("\n"),
    "Robots, sitemap & feeds",
  )
  return 0
}

export function shouldOfferTui(forceNonInteractive: boolean): boolean {
  if (forceNonInteractive) return false
  if (process.env.CI === "true" || process.env.CI === "1") return false
  if (process.env.BETTER_SEO_CI === "1" || process.env.BETTER_SEO_CI === "true") return false
  if (process.env.BETTER_SEO_NO_TUI === "1" || process.env.BETTER_SEO_NO_TUI === "true")
    return false
  return Boolean(process.stdout.isTTY && process.stdin.isTTY)
}

/** Interactive launcher when stdin/stdout are TTY (Per PRD operations layer). */
export async function runInteractiveLauncher(): Promise<number> {
  const { framework } = await readPackageJson()
  const fwLabel =
    framework === "next"
      ? "Next.js detected"
      : framework === "react"
        ? "React detected"
        : "Framework not detected"

  clack.intro("better-seo")

  clack.note(
    [
      fwLabel,
      "",
      "Tip: run `better-seo doctor --json` for CI checks, or `better-seo --no-interactive` to skip this menu.",
    ].join("\n"),
    "Welcome",
  )

  const action = await clack.select<
    "og" | "icons" | "crawl" | "doctor" | "init" | "migrate" | "exit"
  >({
    message: "What do you want to do?",
    options: [
      { value: "og", label: "Generate OG image (1200×630)", hint: "Wave L2" },
      { value: "icons", label: "Generate favicon + PWA icons", hint: "Wave L3" },
      { value: "crawl", label: "Robots / sitemap (commands + docs)", hint: "Wave 12 + CLI" },
      { value: "doctor", label: "Run environment doctor", hint: "Wave 9 · L8" },
      { value: "init", label: "Show install & snippet", hint: "Wave 9" },
      { value: "migrate", label: "Migration hints (next-seo)", hint: "Wave 12 · L7" },
      { value: "exit", label: "Exit" },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel("Cancelled")
    return 1
  }

  let code: number
  switch (action) {
    case "og":
      code = await flowOg()
      break
    case "icons":
      code = await flowIcons()
      break
    case "crawl":
      code = await flowCrawlStubs()
      break
    case "doctor":
      code = await runDoctor([])
      break
    case "init": {
      const fw = await clack.select<"next" | "react">({
        message: "Which adapter?",
        options: [
          { value: "next", label: "Next.js (@better-seo/next)" },
          { value: "react", label: "React (@better-seo/react)" },
        ],
      })
      if (clack.isCancel(fw)) {
        clack.cancel("Cancelled")
        code = 1
        break
      }
      code = await runInit([`--framework=${fw}`])
      break
    }
    case "migrate":
      code = await runMigrate(["from-next-seo"])
      break
    case "exit":
      code = 0
      break
    default:
      code = 0
  }

  if (code === 0 && action !== "exit") {
    clack.outro("Done.")
  } else if (action === "exit") {
    clack.outro("Goodbye.")
  }

  return code
}
