/**
 * Wave 8 — snapshot / preview; Wave 10 — analyze (validate-only baseline).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseArgs } from "node:util"
import {
  createSEO,
  renderTags,
  validateSEO,
  type SEOConfig,
  type SEOInput,
  type TagDescriptor,
} from "@better-seo/core"

function printSnapshotHelp(): void {
  console.log(`Write renderTags JSON for an SEOInput fixture (Wave 8 / L5).

Usage:
  better-seo snapshot --input ./seo.json [--config ./cfg.json] --out ./tags.json
  better-seo snapshot compare ./a.json ./b.json

seo.json: { "title": "…", "description": "…", ... }  (partial SEOInput)
cfg.json: optional SEOConfig (titleTemplate, baseUrl, …)
`)
}

function printPreviewHelp(): void {
  console.log(`Write a static HTML file with <head> meta from renderTags (Wave 8 / L6).

Usage:
  better-seo preview --input ./seo.json [--config ./cfg.json] --out ./preview.html
`)
}

function printAnalyzeHelp(): void {
  console.log(`Run validateSEO on an SEOInput JSON file (Wave 10 / L4 baseline).

Usage:
  better-seo analyze --input ./seo.json [--config ./cfg.json]

Exits 1 when any issue has severity "error".
`)
}

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8")
  return JSON.parse(raw) as T
}

function metaHtml(t: TagDescriptor): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
  if (t.kind === "meta") {
    if (t.name === "title") return `<title>${esc(t.content)}</title>`
    if (t.name) return `<meta name="${esc(t.name)}" content="${esc(t.content)}" />`
    if (t.property) return `<meta property="${esc(t.property)}" content="${esc(t.content)}" />`
  }
  if (t.kind === "link") {
    const hl = t.hreflang ? ` hreflang="${esc(t.hreflang)}"` : ""
    return `<link rel="${esc(t.rel)}" href="${esc(t.href)}"${hl} />`
  }
  if (t.kind === "script-jsonld") {
    return `<script type="application/ld+json">${t.json}</script>`
  }
  return ""
}

export async function runSnapshot(rest: string[]): Promise<number> {
  try {
    const parsed = parseArgs({
      args: rest,
      options: {
        input: { type: "string" as const },
        config: { type: "string" as const },
        out: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })
    if (parsed.values.help) {
      printSnapshotHelp()
      return 0
    }
    const pos = parsed.positionals
    if (pos[0] === "compare") {
      const aPath = pos[1]
      const bPath = pos[2]
      if (!aPath || !bPath) {
        console.error("snapshot compare: need two JSON files")
        return 1
      }
      const a = await readJson<unknown[]>(aPath)
      const b = await readJson<unknown[]>(bPath)
      const sa = JSON.stringify(a)
      const sb = JSON.stringify(b)
      if (sa !== sb) {
        console.error("snapshot compare: files differ")
        return 1
      }
      console.log("snapshot compare: OK (identical)")
      return 0
    }
    const inputPath = parsed.values.input
    const outPath = parsed.values.out
    if (!inputPath || !outPath) {
      console.error("snapshot: require --input and --out (or: snapshot compare a b)")
      printSnapshotHelp()
      return 1
    }
    const input = await readJson<SEOInput>(inputPath)
    let config: SEOConfig | undefined
    if (parsed.values.config) {
      config = await readJson<SEOConfig>(parsed.values.config)
    }
    const seo = createSEO(input, config)
    const tags = renderTags(seo, config)
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, `${JSON.stringify(tags, null, 2)}\n`, "utf8")
    console.log(`Wrote ${outPath}`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runPreview(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        input: { type: "string" as const },
        config: { type: "string" as const },
        out: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printPreviewHelp()
      return 0
    }
    if (!values.input || !values.out) {
      printPreviewHelp()
      return 1
    }
    const input = await readJson<SEOInput>(values.input)
    let config: SEOConfig | undefined
    if (values.config) config = await readJson<SEOConfig>(values.config)
    const seo = createSEO(input, config)
    const tags = renderTags(seo, config)
    const head = tags.map(metaHtml).filter(Boolean).join("\n    ")
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    ${head}
  </head>
  <body>
    <p>better-seo preview (open in browser for social debuggers)</p>
  </body>
</html>
`
    await mkdir(dirname(values.out), { recursive: true })
    await writeFile(values.out, html, "utf8")
    console.log(`Wrote ${values.out}`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runAnalyze(rest: string[]): Promise<number> {
  try {
    const { values } = parseArgs({
      args: rest,
      options: {
        input: { type: "string" as const },
        config: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })
    if (values.help) {
      printAnalyzeHelp()
      return 0
    }
    if (!values.input) {
      printAnalyzeHelp()
      return 1
    }
    const input = await readJson<SEOInput>(values.input)
    let config: SEOConfig | undefined
    if (values.config) config = await readJson<SEOConfig>(values.config)
    const seo = createSEO(input, config)
    const issues = validateSEO(seo, { log: false })
    const errors = issues.filter((i) => i.severity === "error")
    if (errors.length) {
      for (const i of issues) console.error(`[${i.severity}] ${i.code} ${i.field}: ${i.message}`)
      return 1
    }
    if (issues.length) {
      for (const i of issues) console.warn(`[${i.severity}] ${i.code} ${i.field}: ${i.message}`)
    }
    console.log("analyze: OK (no validation errors)")
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
