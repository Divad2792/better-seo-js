import { fromContent, type SEOInput } from "@better-seo/core"
import matter from "gray-matter"

export interface FromMdxOptions {
  readonly maxDescriptionLength?: number
  /** Options forwarded to **gray-matter** (delimiters, excerpt, engines, …). */
  readonly matter?: NonNullable<Parameters<typeof matter>[1]>
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x)
}

/** Merge optional top-level `seo:` block into the same namespace as root keys (child wins on conflict). */
function flattenMatterData(data: Record<string, unknown>): Record<string, unknown> {
  const nested = data.seo
  if (isRecord(nested)) {
    const rest = { ...data }
    delete rest.seo
    return { ...rest, ...nested }
  }
  return data
}

function pickMetaPartial(data: Record<string, unknown>): Record<string, string> | undefined {
  const m = data.meta
  if (!isRecord(m)) return undefined
  const meta: Record<string, string> = {}
  if (typeof m.title === "string") meta.title = m.title
  if (typeof m.description === "string") meta.description = m.description
  if (typeof m.canonical === "string") meta.canonical = m.canonical
  if (typeof m.robots === "string") meta.robots = m.robots
  return Object.keys(meta).length > 0 ? meta : undefined
}

function pickSeoFromData(data: unknown): Partial<SEOInput> {
  if (!isRecord(data)) return {}
  const flat = flattenMatterData(data)
  const out: Record<string, unknown> = {}
  if (typeof flat.title === "string") out.title = flat.title
  if (typeof flat.description === "string") out.description = flat.description
  if (typeof flat.canonical === "string") out.canonical = flat.canonical
  if (typeof flat.robots === "string") out.robots = flat.robots
  const metaPart = pickMetaPartial(flat)
  if (metaPart !== undefined) out.meta = metaPart
  if (flat.openGraph !== undefined && isRecord(flat.openGraph)) {
    out.openGraph = flat.openGraph
  }
  if (flat.twitter !== undefined && isRecord(flat.twitter)) {
    out.twitter = flat.twitter
  }
  if (Array.isArray(flat.schema)) {
    out.schema = flat.schema
  }
  return out as Partial<SEOInput>
}

function hasExplicitTitle(fm: Partial<SEOInput>): boolean {
  if (fm.title !== undefined && fm.title.trim() !== "") return true
  const t = fm.meta?.title
  return typeof t === "string" && t.trim() !== ""
}

function mergeFrontmatterWins(inferred: SEOInput, fm: Partial<SEOInput>): SEOInput {
  return {
    ...inferred,
    ...(fm.title !== undefined ? { title: fm.title } : {}),
    ...(fm.description !== undefined ? { description: fm.description } : {}),
    ...(fm.canonical !== undefined ? { canonical: fm.canonical } : {}),
    ...(fm.robots !== undefined ? { robots: fm.robots } : {}),
    ...(fm.openGraph !== undefined ? { openGraph: fm.openGraph } : {}),
    ...(fm.twitter !== undefined ? { twitter: fm.twitter } : {}),
    ...(fm.schema !== undefined ? { schema: fm.schema } : {}),
    ...(fm.meta !== undefined ? { meta: { ...inferred.meta, ...fm.meta } } : {}),
  }
}

/**
 * Wave 7 / **C17** — YAML (or JSON) frontmatter + MDX/Markdown body → partial {@link SEOInput}.
 * Uses **gray-matter** for frontmatter; body inference uses {@link fromContent} in **@better-seo/core** (no MDX compile).
 * Explicit frontmatter fields override values inferred from the body.
 */
export function fromMdx(source: string, options?: FromMdxOptions): SEOInput {
  const { data, content } = matter(source, options?.matter)
  const fromFm = pickSeoFromData(data)
  const inferTitleFromBody = !hasExplicitTitle(fromFm)
  const inferred = fromContent(content, {
    ...(options?.maxDescriptionLength !== undefined
      ? { maxDescriptionLength: options.maxDescriptionLength }
      : {}),
    inferTitleFromBody,
  })
  return mergeFrontmatterWins(inferred, fromFm)
}
