import type { SEO } from "@better-seo/core"

export interface RobotsTxtRule {
  readonly userAgent: string
  readonly allow?: readonly string[]
  readonly disallow?: readonly string[]
}

export interface RobotsTxtOptions {
  readonly rules?: readonly RobotsTxtRule[]
  readonly sitemap?: string | readonly string[]
  readonly host?: string
}

/** Plain **robots.txt** body (UTF-8). */
export function renderRobotsTxt(opts: RobotsTxtOptions = {}): string {
  const rules = opts.rules?.length ? opts.rules : [{ userAgent: "*", allow: ["/"] }]
  const lines: string[] = []
  for (const r of rules) {
    lines.push(`User-agent: ${r.userAgent}`)
    if (r.allow?.length) for (const p of r.allow) lines.push(`Allow: ${p}`)
    if (r.disallow?.length) for (const p of r.disallow) lines.push(`Disallow: ${p}`)
    lines.push("")
  }
  if (opts.host?.trim()) {
    lines.push(`Host: ${opts.host.trim()}`)
    lines.push("")
  }
  if (opts.sitemap !== undefined) {
    const list = typeof opts.sitemap === "string" ? [opts.sitemap] : opts.sitemap
    for (const u of list) {
      const t = u.trim()
      if (t) lines.push(`Sitemap: ${t}`)
    }
    lines.push("")
  }
  return `${lines.join("\n").trimEnd()}\n`
}

export interface SitemapUrlEntry {
  readonly loc: string
  readonly lastmod?: string
  readonly changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  readonly priority?: number
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Single **urlset** sitemap document. */
export function renderSitemapXml(entries: readonly SitemapUrlEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const e of entries) {
    lines.push("  <url>")
    lines.push(`    <loc>${escXml(e.loc)}</loc>`)
    if (e.lastmod) lines.push(`    <lastmod>${escXml(e.lastmod)}</lastmod>`)
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`)
    if (e.priority !== undefined) {
      lines.push(`    <priority>${String(Math.min(1, Math.max(0, e.priority)))}</priority>`)
    }
    lines.push("  </url>")
  }
  lines.push("</urlset>")
  return `${lines.join("\n")}\n`
}

export type {
  AtomEntry,
  AtomFeedOptions,
  LlmsBlock,
  RssChannelOptions,
  RssItem,
} from "./syndication.js"
export {
  renderAtomFeed,
  renderLlmsTxt,
  renderRssXml,
  renderSitemapIndexXml,
} from "./syndication.js"

/** Default **Sitemap:** URL from **`SEO.meta.canonical`** origin + **`/sitemap.xml`** when resolvable. */
export function defaultSitemapUrlFromSEO(seo: SEO, baseUrl?: string): string | undefined {
  const c = seo.meta.canonical
  const b = baseUrl?.replace(/\/$/, "")
  if (c?.startsWith("http://") || c?.startsWith("https://")) {
    try {
      return `${new URL(c).origin}/sitemap.xml`
    } catch {
      return undefined
    }
  }
  if (b) return `${b}/sitemap.xml`
  return undefined
}
