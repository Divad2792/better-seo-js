import type { SEOInput } from "./types.js"

export interface FromContentOptions {
  /** Truncate generated description (default 300). */
  readonly maxDescriptionLength?: number
  /**
   * When **`false`**, do not derive **title** from `# heading` or the first body line (description-only inference).
   * Use when the caller already has a title (e.g. **gray-matter** frontmatter via **`@better-seo/compiler`**).
   * @default true
   */
  readonly inferTitleFromBody?: boolean
}

function stripHtmlish(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseSimpleFrontmatter(raw: string): {
  readonly body: string
  readonly title?: string
  readonly description?: string
} {
  if (!raw.startsWith("---\n")) return { body: raw }
  const end = raw.indexOf("\n---\n", 4)
  if (end === -1) return { body: raw }
  const fmBlock = raw.slice(4, end)
  const body = raw.slice(end + 5).trim()
  let title: string | undefined
  let description: string | undefined
  for (const line of fmBlock.split("\n")) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!m) continue
    const key = m[1]!.toLowerCase()
    let val = m[2]!.trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (key === "title") title = val
    if (key === "description") description = val
  }
  return { body, title, description }
}

/**
 * Wave 7 / **C16** — derive {@link SEOInput} from a string (plain text, Markdown, or MDX-ish).
 * Does **not** compile MDX: treats `import` / JSX as text; use for metadata hints only.
 * Optional YAML frontmatter (`---` … `---`) with `title` / `description` is supported.
 */
export function fromContent(markdownOrPlain: string, options?: FromContentOptions): SEOInput {
  const maxD = options?.maxDescriptionLength ?? 300
  const inferTitle = options?.inferTitleFromBody !== false
  const normalized = markdownOrPlain.replace(/\r\n/g, "\n")
  const { body: fmBody, title: fmTitle, description: fmDesc } = parseSimpleFrontmatter(normalized)
  let body = fmBody.trim()
  if (!body && !fmTitle) {
    return { title: "Untitled" }
  }

  let title = fmTitle
  let description = fmDesc

  const importStripped = body
    .split("\n")
    .filter((line) => !/^\s*import\s+/.test(line))
    .join("\n")
    .trim()
  body = importStripped || body

  if (inferTitle) {
    const h1 = /^#\s+(.+)$/m.exec(body)
    if (!title && h1) {
      title = h1[1]!.trim()
      body = body.replace(h1[0], "").trim()
    }

    if (!title) {
      const lines = body.split("\n")
      const first = lines.find((l) => l.trim().length > 0) ?? ""
      title = stripHtmlish(first).slice(0, 200) || "Untitled"
      const idx = body.indexOf(first)
      if (idx >= 0) body = body.slice(idx + first.length).trim()
    }
  }

  if (!description) {
    const chunk = body.split(/\n\n+/).find((p) => p.trim().length > 0) ?? ""
    const plain = stripHtmlish(chunk.replace(/^#+\s+.*$/m, "").trim())
    description = plain.length > 0 ? plain.slice(0, maxD) : undefined
  }

  const out: Record<string, unknown> = {}
  if (title !== undefined) out.title = title
  if (description !== undefined) out.description = description
  if (out.title === undefined && out.description === undefined) {
    return { title: "Untitled" }
  }
  return out as SEOInput
}

/**
 * Wave 7 — convenience alias of {@link fromContent} (same zero-dep behavior).
 * For **gray-matter** frontmatter + body merging, use **`fromMdx`** from **`@better-seo/compiler`** (**C17**).
 */
export function fromMdxString(source: string, options?: FromContentOptions): SEOInput {
  return fromContent(source, options)
}
