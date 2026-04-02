function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function rfc822(d: Date): string {
  return d.toUTCString()
}

export interface RssItem {
  readonly title: string
  readonly link: string
  readonly description?: string
  readonly pubDate?: string | Date
}

export interface RssChannelOptions {
  readonly title: string
  readonly link: string
  readonly description?: string
  readonly language?: string
  readonly items: readonly RssItem[]
}

/** RSS 2.0 feed (UTF-8). Wave 12 / W*. */
export function renderRssXml(channel: RssChannelOptions): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escXml(channel.title)}</title>`,
    `    <link>${escXml(channel.link)}</link>`,
  ]
  if (channel.description) {
    lines.push(`    <description>${escXml(channel.description)}</description>`)
  }
  if (channel.language?.trim()) {
    lines.push(`    <language>${escXml(channel.language.trim())}</language>`)
  }
  lines.push(
    `    <atom:link href="${escXml(channel.link)}" rel="self" type="application/rss+xml"/>`,
  )
  for (const item of channel.items) {
    lines.push("    <item>")
    lines.push(`      <title>${escXml(item.title)}</title>`)
    lines.push(`      <link>${escXml(item.link)}</link>`)
    if (item.description) {
      lines.push(`      <description>${escXml(item.description)}</description>`)
    }
    if (item.pubDate !== undefined) {
      const d = typeof item.pubDate === "string" ? new Date(item.pubDate) : item.pubDate
      lines.push(`      <pubDate>${escXml(rfc822(d))}</pubDate>`)
    }
    lines.push(`      <guid isPermaLink="true">${escXml(item.link)}</guid>`)
    lines.push("    </item>")
  }
  lines.push("  </channel>", "</rss>")
  return `${lines.join("\n")}\n`
}

export interface AtomEntry {
  readonly title: string
  readonly link: string
  readonly id: string
  readonly updated: string | Date
  readonly summary?: string
}

export interface AtomFeedOptions {
  readonly title: string
  readonly link: string
  readonly id: string
  readonly updated: string | Date
  readonly entries: readonly AtomEntry[]
}

function iso(d: string | Date): string {
  const x = typeof d === "string" ? new Date(d) : d
  return x.toISOString()
}

/** Atom 1.0 feed. Wave 12. */
export function renderAtomFeed(feed: AtomFeedOptions): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escXml(feed.title)}</title>`,
    `  <link href="${escXml(feed.link)}" rel="alternate"/>`,
    `  <id>${escXml(feed.id)}</id>`,
    `  <updated>${escXml(iso(feed.updated))}</updated>`,
  ]
  for (const e of feed.entries) {
    lines.push("  <entry>")
    lines.push(`    <title>${escXml(e.title)}</title>`)
    lines.push(`    <link href="${escXml(e.link)}" rel="alternate"/>`)
    lines.push(`    <id>${escXml(e.id)}</id>`)
    lines.push(`    <updated>${escXml(iso(e.updated))}</updated>`)
    if (e.summary) lines.push(`    <summary>${escXml(e.summary)}</summary>`)
    lines.push("  </entry>")
  }
  lines.push("</feed>")
  return `${lines.join("\n")}\n`
}

export interface LlmsBlock {
  readonly heading?: string
  readonly lines: readonly string[]
}

/** Plain **`llms.txt`** body (no leading BOM). Wave 12. */
export function renderLlmsTxt(opts: {
  readonly title: string
  readonly summary?: string
  readonly blocks?: readonly LlmsBlock[]
}): string {
  const parts: string[] = [`# ${opts.title.trim()}`]
  if (opts.summary?.trim()) {
    parts.push("", `> ${opts.summary.trim()}`)
  }
  if (opts.blocks?.length) {
    for (const b of opts.blocks) {
      parts.push("")
      if (b.heading?.trim()) parts.push(`## ${b.heading.trim()}`)
      for (const line of b.lines) {
        const t = line.trim()
        if (t) parts.push(t.startsWith("-") ? t : `- ${t}`)
      }
    }
  }
  return `${parts.join("\n").trim()}\n`
}

/** Sitemap index for multiple urlset documents. */
export function renderSitemapIndexXml(sitemapUrls: readonly string[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const u of sitemapUrls) {
    const t = u.trim()
    if (!t) continue
    lines.push("  <sitemap>")
    lines.push(`    <loc>${escXml(t)}</loc>`)
    lines.push("  </sitemap>")
  }
  lines.push("</sitemapindex>")
  return `${lines.join("\n")}\n`
}
