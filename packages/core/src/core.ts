import { SEOError } from "./errors.js"
import type { JSONLD, SEO, SEOConfig, SEOInput } from "./types.js"
import { runAfterMergePlugins, runBeforeMergePlugins } from "./plugins.js"
import { dedupeSchemaByIdAndType } from "./schema-dedupe.js"

function applyTitleTemplate(title: string, template: string | undefined): string {
  if (!template) return title
  return template.includes("%s") ? template.replace(/%s/g, title) : `${title} ${template}`.trim()
}

function resolveCanonical(
  canonical: string | undefined,
  baseUrl: string | undefined,
): string | undefined {
  if (!canonical) return undefined
  if (canonical.startsWith("http://") || canonical.startsWith("https://")) return canonical
  if (!baseUrl) return canonical
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const path = canonical.startsWith("/") ? canonical : `/${canonical}`
  return `${base}${path}`
}

function mergeSchema(parent: readonly JSONLD[], child: readonly JSONLD[]): JSONLD[] {
  return [...parent, ...child]
}

/** Normalize partial + config into a canonical `SEO` document (Wave 1 baseline). */
export function createSEO(input: SEOInput, config?: SEOConfig): SEO {
  const mergedInput = runBeforeMergePlugins(input, config)

  const rawTitle = mergedInput.meta?.title ?? mergedInput.title
  const title = typeof rawTitle === "string" ? rawTitle.trim() : ""
  if (!title) {
    throw new SEOError("VALIDATION", "title is required (set meta.title or top-level title).")
  }

  const description = mergedInput.meta?.description ?? mergedInput.description
  const canonical = resolveCanonical(
    mergedInput.meta?.canonical ?? mergedInput.canonical,
    config?.baseUrl,
  )
  const robots = mergedInput.meta?.robots ?? mergedInput.robots ?? config?.defaultRobots
  const langMap = mergedInput.meta?.alternates?.languages
  const alternates =
    langMap !== undefined && Object.keys(langMap).length > 0 ? { languages: langMap } : undefined

  const verification = mergedInput.meta?.verification
  const hasVer = Boolean(
    verification &&
    (verification.google ||
      verification.yahoo ||
      verification.yandex ||
      verification.me ||
      (verification.other !== undefined && Object.keys(verification.other).length > 0)),
  )

  const rawPag = mergedInput.meta?.pagination
  const pagination =
    rawPag?.previous !== undefined || rawPag?.next !== undefined
      ? {
          ...(rawPag.previous !== undefined ? { previous: rawPag.previous } : {}),
          ...(rawPag.next !== undefined ? { next: rawPag.next } : {}),
        }
      : undefined

  const meta: SEO["meta"] = {
    title: applyTitleTemplate(title, config?.titleTemplate),
    ...(description !== undefined ? { description } : {}),
    ...(canonical !== undefined ? { canonical } : {}),
    ...(robots !== undefined ? { robots } : {}),
    ...(alternates !== undefined ? { alternates } : {}),
    ...(hasVer ? { verification } : {}),
    ...(pagination !== undefined ? { pagination } : {}),
  }

  const mergeOg = config?.features?.openGraphMerge !== false
  const ogBase = mergedInput.openGraph ?? {}
  const ogTitle = mergeOg
    ? (mergedInput.openGraph?.title ?? meta.title)
    : mergedInput.openGraph?.title
  const ogDesc = mergeOg
    ? (mergedInput.openGraph?.description ?? meta.description)
    : mergedInput.openGraph?.description

  let openGraph: SEO["openGraph"] | undefined
  if (mergeOg) {
    openGraph = {
      ...ogBase,
      title: ogTitle ?? meta.title,
      ...(ogDesc !== undefined ? { description: ogDesc } : {}),
    }
  } else if (Object.keys(ogBase).length > 0 || ogTitle !== undefined || ogDesc !== undefined) {
    openGraph = {
      ...ogBase,
      ...(ogTitle !== undefined ? { title: ogTitle } : {}),
      ...(ogDesc !== undefined ? { description: ogDesc } : {}),
    }
  }

  const ogFirstImage = mergedInput.openGraph?.images?.[0]?.url
  const twTitle = mergedInput.twitter?.title ?? meta.title
  const twDesc = mergedInput.twitter?.description ?? meta.description
  const twImage = mergedInput.twitter?.image ?? (mergeOg ? ogFirstImage : undefined)
  const twitter: NonNullable<SEO["twitter"]> = {
    ...(mergedInput.twitter ?? {}),
    card: mergedInput.twitter?.card ?? "summary_large_image",
    title: twTitle,
    ...(twDesc !== undefined ? { description: twDesc } : {}),
    ...(twImage !== undefined ? { image: twImage } : {}),
  }

  const parentSchema: readonly JSONLD[] = []
  let childSchema = mergedInput.schema ?? []
  if (
    config?.schemaMerge &&
    typeof config.schemaMerge === "object" &&
    config.schemaMerge.dedupeByIdAndType === true
  ) {
    childSchema = dedupeSchemaByIdAndType(childSchema)
  }
  const schema = mergeSchema(parentSchema, childSchema)

  const doc: SEO = {
    meta,
    ...(openGraph !== undefined ? { openGraph } : {}),
    twitter,
    schema,
  }

  let out = runAfterMergePlugins(doc, config)
  if (config?.features?.jsonLd === false) {
    out = { ...out, schema: [] }
  }
  return out
}

/** Child wins for scalars; schemas concatenate (baseline). */
function mergeLanguageAlternates(
  parent?: Readonly<Record<string, string>>,
  child?: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> | undefined {
  const merged = { ...parent, ...child }
  return Object.keys(merged).length > 0 ? merged : undefined
}

/** Merge parent `SEO` with child input (featured as `withSEO` in docs / Next package). */
export function withSEO(parent: SEO, child: SEOInput, config?: SEOConfig): SEO {
  return mergeSEO(parent, child, config)
}

function mergeVerification(
  parent?: SEO["meta"]["verification"],
  child?: SEO["meta"]["verification"],
): SEO["meta"]["verification"] | undefined {
  if (!parent && !child) return undefined
  const o = {
    ...parent,
    ...child,
    other:
      parent?.other || child?.other
        ? { ...(parent?.other ?? {}), ...(child?.other ?? {}) }
        : undefined,
  }
  const has =
    o.google || o.yahoo || o.yandex || o.me || (o.other && Object.keys(o.other).length > 0)
  return has ? o : undefined
}

function mergePagination(
  parent?: SEO["meta"]["pagination"],
  child?: SEO["meta"]["pagination"],
): SEO["meta"]["pagination"] | undefined {
  if (!parent && !child) return undefined
  const out = {
    ...parent,
    ...child,
  }
  if (out.previous === undefined && out.next === undefined) return undefined
  return out
}

export function mergeSEO(parent: SEO, child: SEOInput, config?: SEOConfig): SEO {
  const pMeta = parent.meta
  const cMeta = child.meta ?? {}
  const { alternates: pAlt, verification: pVer, pagination: pPag, ...pRest } = pMeta
  const { alternates: cAlt, verification: cVer, pagination: cPag, ...cRest } = cMeta
  const mergedLang = mergeLanguageAlternates(pAlt?.languages, cAlt?.languages)
  const mergedAlternates = mergedLang !== undefined ? { languages: mergedLang } : undefined
  const mergedVer = mergeVerification(pVer, cVer)
  const mergedPag = mergePagination(pPag, cPag)
  const mergedChild: SEOInput = {
    ...child,
    meta: {
      ...pRest,
      ...cRest,
      title: cRest.title ?? child.title ?? pMeta.title,
      description: cRest.description ?? child.description ?? pMeta.description,
      canonical: cRest.canonical ?? child.canonical ?? pMeta.canonical,
      robots: cRest.robots ?? child.robots ?? pMeta.robots,
      ...(mergedAlternates !== undefined ? { alternates: mergedAlternates } : {}),
      ...(mergedVer !== undefined ? { verification: mergedVer } : {}),
      ...(mergedPag !== undefined ? { pagination: mergedPag } : {}),
    },
    openGraph: { ...(parent.openGraph ?? {}), ...child.openGraph },
    twitter: { ...(parent.twitter ?? {}), ...child.twitter },
    schema: [...parent.schema, ...(child.schema ?? [])],
  }
  return createSEO(mergedChild, config)
}
