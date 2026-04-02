/**
 * Optional **@better-seo/compiler** — MDX/Markdown + frontmatter → SEOInput JSON.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseArgs } from "node:util"
import { fromMdx } from "@better-seo/compiler"

function printContentHelp(): void {
  console.log(`Content → SEO (Wave 7 / C17) via @better-seo/compiler.

Usage:
  better-seo content from-mdx --input ./page.mdx --out ./seo.json

seo.json is compatible with better-seo snapshot / preview / analyze --input.
`)
}

export async function runContent(rest: string[]): Promise<number> {
  try {
    const { positionals, values } = parseArgs({
      args: rest,
      options: {
        input: { type: "string" as const },
        out: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })
    if (values.help) {
      printContentHelp()
      return 0
    }
    if (positionals[0] !== "from-mdx") {
      console.error("Expected: better-seo content from-mdx --input <file> --out <file.json>")
      printContentHelp()
      return 1
    }
    const inputPath = values.input
    const outPath = values.out
    if (!inputPath?.trim() || !outPath?.trim()) {
      console.error("content from-mdx: require --input and --out")
      printContentHelp()
      return 1
    }
    const raw = await readFile(inputPath.trim(), "utf8")
    const seoInput = fromMdx(raw)
    await mkdir(dirname(outPath.trim()), { recursive: true })
    await writeFile(outPath.trim(), `${JSON.stringify(seoInput, null, 2)}\n`, "utf8")
    console.log(`Wrote ${outPath.trim()}`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
