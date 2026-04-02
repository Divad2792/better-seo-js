import { readFile } from "node:fs/promises"
import path from "node:path"
import { parseArgs } from "node:util"
import { getTemplateSEOInput } from "./cli-templates.js"

function printDoctorHelp(): void {
  console.log(`Usage: better-seo doctor [--json] [--help]

Checks Node and reads package.json for @better-seo/* adapters.`)
}

function printInitHelp(): void {
  console.log(`Usage: better-seo init [--framework next|react] [--preset blog|docs|saas|ecommerce|portfolio] [--help]

--framework: optional; defaults from package.json (next if "next" dep, else react if "react", else next).
--preset: append a defineSEO() snippet for an industry baseline (Wave 9 / L9).
`)
}

async function detectFrameworkFromPackageJson(): Promise<"next" | "react"> {
  try {
    const raw = await readFile(path.join(process.cwd(), "package.json"), "utf8")
    const pkg = JSON.parse(raw) as {
      dependencies?: Readonly<Record<string, string>>
      devDependencies?: Readonly<Record<string, string>>
    }
    const all = { ...pkg.dependencies, ...pkg.devDependencies }
    if (all["next"]) return "next"
    if (all["react"]) return "react"
  } catch {
    /* ignore */
  }
  return "next"
}

function printMigrateHelp(): void {
  console.log(`Usage: better-seo migrate from-next-seo [--help]

Use @better-seo/core: fromNextSeo() then createSEO(). For Next metadata use @better-seo/next toNextMetadata().
`)
}

export async function runDoctor(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        json: { type: "boolean" as const, default: false },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printDoctorHelp()
      return 0
    }
    const node = process.version
    const issues: string[] = []
    if (!node.startsWith("v")) issues.push("unexpected Node version string")

    let hasCore: boolean | undefined
    let hasNext: boolean | undefined
    let hasReact: boolean | undefined
    let hasCli: boolean | undefined
    let hasCompiler: boolean | undefined
    try {
      const raw = await readFile(path.join(process.cwd(), "package.json"), "utf8")
      const pkg = JSON.parse(raw) as {
        dependencies?: Readonly<Record<string, string>>
        devDependencies?: Readonly<Record<string, string>>
      }
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      hasCore = "@better-seo/core" in deps
      hasNext = "@better-seo/next" in deps
      hasReact = "@better-seo/react" in deps
      hasCli = "@better-seo/cli" in deps
      hasCompiler = "@better-seo/compiler" in deps
      if (!hasCore)
        issues.push("package.json: @better-seo/core not listed in dependencies/devDependencies")
    } catch {
      issues.push("package.json: not found or unreadable in cwd")
    }

    const out = {
      ok: issues.length === 0,
      node,
      issues,
      packages: { hasCore, hasNext, hasReact, hasCli, hasCompiler },
    }
    if (values.json) console.log(JSON.stringify(out, null, 2))
    else {
      console.log(`Node ${node}`)
      if (hasCore !== undefined) {
        console.log(
          `adapters: core=${hasCore} next=${Boolean(hasNext)} react=${Boolean(hasReact)} cli=${Boolean(hasCli)} compiler=${Boolean(hasCompiler)}`,
        )
      }
      if (issues.length) for (const i of issues) console.warn(i)
      else console.log("doctor: baseline OK.")
    }
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runInit(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        framework: { type: "string" as const },
        preset: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printInitHelp()
      return 0
    }
    let fw = values.framework
    if (fw !== undefined && fw !== "next" && fw !== "react") {
      console.error(`Invalid --framework "${fw}". Use next or react.`)
      return 1
    }
    if (fw === undefined) {
      fw = await detectFrameworkFromPackageJson()
    }

    let presetSeo: ReturnType<typeof getTemplateSEOInput> | undefined
    if (values.preset !== undefined) {
      presetSeo = getTemplateSEOInput(values.preset)
      if (presetSeo === undefined) {
        console.error(
          `Invalid --preset "${values.preset}". Use blog, docs, saas, ecommerce, or portfolio.`,
        )
        return 1
      }
    }

    if (fw === "next") {
      console.log(`npm install @better-seo/core @better-seo/next

Example (App Router):
import { seo } from "@better-seo/next"
export const metadata = seo({ title: "Home" })
`)
    } else {
      console.log(`npm install @better-seo/core @better-seo/react react-helmet-async

Wrap the app with HelmetProvider, then use <BetterSEOHelmet seo={createSEO({ title: "Home" })} />.
`)
    }

    if (presetSeo !== undefined && values.preset !== undefined) {
      console.log(
        `\nIndustry preset "${values.preset}" (defineSEO / Wave 9):\nimport { createSEO, defineSEO } from "@better-seo/core"\n\nconst base = defineSEO(${JSON.stringify(presetSeo, null, 2)} as const)\n\nexport const seo = createSEO(base, { baseUrl: "https://example.com" })\n`,
      )
    }
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runMigrate(rest: string[]): Promise<number> {
  try {
    const { positionals, values } = parseArgs({
      args: rest,
      options: { help: { type: "boolean" as const, short: "h", default: false } },
      allowPositionals: true,
    })
    if (values.help) {
      printMigrateHelp()
      return 0
    }
    if (positionals[0] !== "from-next-seo") {
      console.error("Expected: better-seo migrate from-next-seo")
      return 1
    }
    console.log(`import { createSEO, fromNextSeo } from "@better-seo/core"
const seo = createSEO(fromNextSeo({ /* next-seo props */ }), { baseUrl: "https://example.com" })
// App Router: import { toNextMetadata } from "@better-seo/next"
`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
