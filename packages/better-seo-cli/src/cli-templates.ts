/**
 * Wave 9 — industry presets (L9) + **`defineSEO`** (C18) snippets.
 */
import { parseArgs } from "node:util"
import { defineSEO, type SEOInput } from "@better-seo/core"
import { mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { runPreview } from "./cli-devtools.js"

export const TEMPLATE_IDS = ["blog", "docs", "saas", "ecommerce", "portfolio"] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

function isTemplateId(s: string): s is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(s)
}

const blog = defineSEO({
  title: "My blog",
  description: "Articles, notes, and updates.",
  openGraph: { type: "website", siteName: "My blog" },
})

const docs = defineSEO({
  title: "Documentation",
  description: "Product docs, guides, and API reference.",
  openGraph: { type: "website", siteName: "Docs" },
})

const saas = defineSEO({
  title: "Ship faster with Acme",
  description: "The modern platform for teams who care about SEO and speed.",
  openGraph: { type: "website", siteName: "Acme" },
  twitter: { card: "summary_large_image", site: "@acme" },
})

const ecommerce = defineSEO({
  title: "Shop / Store",
  description: "Quality products with fast checkout.",
  openGraph: { type: "website", siteName: "Our store" },
})

const portfolio = defineSEO({
  title: "Portfolio",
  description: "Selected work and contact information.",
  openGraph: { type: "website" },
})

function presetFor(id: TemplateId): SEOInput {
  switch (id) {
    case "blog":
      return blog
    case "docs":
      return docs
    case "saas":
      return saas
    case "ecommerce":
      return ecommerce
    case "portfolio":
      return portfolio
    default: {
      const _x: never = id
      return _x
    }
  }
}

export function getTemplateSEOInput(id: string): SEOInput | undefined {
  return isTemplateId(id) ? presetFor(id) : undefined
}

function printTemplateHelp(): void {
  console.log(`Industry SEO presets (Wave 9 / L9) + defineSEO (C18).

Usage:
  better-seo template list
  better-seo template print <id>    ${TEMPLATE_IDS.join(" | ")}
  better-seo template preview <id> [--out preview.html] [--open]

preview writes a head fixture HTML (same as better-seo preview).
`)
}

export async function runTemplate(rest: string[]): Promise<number> {
  try {
    const { positionals, values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const },
        open: { type: "boolean" as const, default: false },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })
    if (values.help || positionals.length === 0) {
      printTemplateHelp()
      return positionals.length === 0 ? 1 : 0
    }
    const sub = positionals[0]
    const id = positionals[1]
    if (sub === "list") {
      console.log(TEMPLATE_IDS.join("\n"))
      return 0
    }
    if (sub === "print") {
      if (!id || !isTemplateId(id)) {
        console.error(`template print: need id (${TEMPLATE_IDS.join(", ")})`)
        return 1
      }
      const preset = presetFor(id)
      console.log(
        `import { createSEO, defineSEO } from "@better-seo/core"\n\nconst base = defineSEO(${JSON.stringify(preset, null, 2)} as const)\n\nexport const seo = createSEO(base, { baseUrl: "https://example.com" })\n`,
      )
      return 0
    }
    if (sub === "preview") {
      if (!id || !isTemplateId(id)) {
        console.error(`template preview: need id (${TEMPLATE_IDS.join(", ")})`)
        return 1
      }
      const preset = presetFor(id)
      const dir = tmpdir()
      const jsonPath = join(dir, `better-seo-template-${id}-${Date.now()}.json`)
      await writeFile(jsonPath, `${JSON.stringify(preset, null, 2)}\n`, "utf8")
      const outHtml = values.out?.trim() || join(dir, `better-seo-preview-${id}-${Date.now()}.html`)
      await mkdir(dirname(outHtml), { recursive: true })
      const code = await runPreview([
        "--input",
        jsonPath,
        "--out",
        outHtml,
        ...(values.open ? ["--open"] : []),
      ])
      return code
    }
    console.error(`Unknown template subcommand "${sub}". Use list | print | preview`)
    return 1
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
