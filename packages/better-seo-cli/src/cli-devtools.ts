/**
 * Wave 8 — snapshot / preview; Wave 10 — analyze (validate-only baseline).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { parseArgs } from "node:util"
import {
  createSEO,
  renderTags,
  validateSEO,
  type SEO,
  type SEOConfig,
  type SEOInput,
  type TagDescriptor,
} from "@better-seo/core"
import { openPathInDefaultApp } from "./open-default-app.js"

function printSnapshotHelp(): void {
  console.log(`Write renderTags JSON for an SEOInput fixture (Wave 8 / L5).

Usage:
  better-seo snapshot --input ./seo.json [--config ./cfg.json] (--out ./tags.json | --output ./tags.json)
  better-seo snapshot --input ./seo.json --out-dir ./snapshots [--snapshot-file tags.json]
  better-seo snapshot compare ./a.json ./b.json

seo.json: { "title": "…", "description": "…", ... }  (partial SEOInput)
cfg.json: optional SEOConfig (titleTemplate, baseUrl, …)
`)
}

function printPreviewHelp(): void {
  console.log(`Write a static HTML file with <head> meta + rough Google / Twitter / LinkedIn blocks (Wave 8 / L6).

Usage:
  better-seo preview --input ./seo.json [--config ./cfg.json] --out ./preview.html [--open]

--open: best-effort open in the system browser (skipped in CI or if BETTER_SEO_NO_OPEN=1).
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

function previewApproximationBlocks(seo: SEO): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
  const title = esc(seo.meta.title)
  const desc = esc(seo.meta.description ?? "")
  const url = esc(seo.meta.canonical ?? "")
  const ogT = esc(seo.openGraph?.title ?? seo.meta.title)
  const ogD = esc(seo.openGraph?.description ?? seo.meta.description ?? "")
  const ogUrl = esc(seo.openGraph?.url ?? seo.meta.canonical ?? "")
  const twCard = esc(seo.twitter?.card ?? "summary_large_image")
  const sampleHost = ogUrl || url || "https://example.com/page"
  return `
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #111; }
    h2 { font-size: 1rem; color: #555; margin-top: 2rem; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; background: #fafafa; }
    .g-title { color: #1a0dab; font-size: 1.125rem; margin: 0 0 0.25rem; }
    .g-url { color: #006621; font-size: 0.875rem; margin: 0; }
    .g-desc { color: #545454; font-size: 0.875rem; margin: 0.5rem 0 0; line-height: 1.4; }
    .tw { border: 1px solid #cfd9de; border-radius: 12px; overflow: hidden; max-width: 400px; }
    .tw-h { padding: 0.75rem; background: #fff; }
    .tw-t { font-weight: 600; margin: 0 0 0.25rem; }
    .tw-d { font-size: 0.875rem; color: #536471; margin: 0; }
    .li { font-size: 0.9rem; color: #333; }
  </style>
  <h2>Google (approximate)</h2>
  <div class="card">
    <p class="g-title">${ogT || title}</p>
    <p class="g-url">${sampleHost}</p>
    <p class="g-desc">${ogD || desc || "—"}</p>
  </div>
  <h2>Twitter / X (${twCard})</h2>
  <div class="card tw"><div class="tw-h">
    <p class="tw-t">${title}</p>
    <p class="tw-d">${desc || "—"}</p>
  </div></div>
  <h2>LinkedIn / Slack (rich unfurl)</h2>
  <div class="card li">
    <strong>${ogT || title}</strong><br />
    <span style="color:#666">${ogD || desc || "—"}</span><br />
    <small style="color:#888">${sampleHost}</small>
  </div>
`
}

export async function runSnapshot(rest: string[]): Promise<number> {
  try {
    const parsed = parseArgs({
      args: rest,
      options: {
        input: { type: "string" as const },
        config: { type: "string" as const },
        out: { type: "string" as const },
        output: { type: "string" as const },
        "out-dir": { type: "string" as const },
        "snapshot-file": { type: "string" as const, default: "tags.json" },
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
    const outDir = parsed.values["out-dir"]
    const snapName = parsed.values["snapshot-file"] ?? "tags.json"
    let outPath = parsed.values.out ?? parsed.values.output
    if (!outPath && outDir?.trim()) {
      outPath = join(outDir.trim(), snapName.trim() || "tags.json")
    }
    if (!inputPath || !outPath) {
      console.error(
        "snapshot: require --input and (--out | --output | --out-dir) (or: snapshot compare a b)",
      )
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
        open: { type: "boolean" as const, default: false },
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
    const body = previewApproximationBlocks(seo)
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    ${head}
  </head>
  <body>
    <p><em>Head tags below are emitted by <code>renderTags</code>; blocks further down approximate Google / Twitter / LinkedIn (Wave 8 / L6).</em></p>
    ${body}
  </body>
</html>
`
    await mkdir(dirname(values.out), { recursive: true })
    await writeFile(values.out, html, "utf8")
    console.log(`Wrote ${values.out}`)
    if (values.open) {
      openPathInDefaultApp(resolve(values.out))
    }
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
