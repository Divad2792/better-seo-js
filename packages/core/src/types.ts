/** Strict JSON-LD values (no `any` on public surface). */
export type JSONLDValue =
  | string
  | number
  | boolean
  | null
  | JSONLDValue[]
  | { readonly [k: string]: JSONLDValue }

/**
 * JSON-LD node. Helpers must ensure `@context` and `@type` before serialization when required by consumers.
 */
export type JSONLD = {
  readonly "@context"?: string | Record<string, unknown>
  readonly "@type": string
  readonly "@id"?: string
} & { readonly [k: string]: JSONLDValue | Record<string, unknown> | undefined }

export interface SEOPlugin {
  readonly id: string
  readonly beforeMerge?: (draft: SEOInput, ctx: { readonly config?: SEOConfig }) => SEOInput
  readonly afterMerge?: (seo: SEO, ctx: { readonly config?: SEOConfig }) => SEO
  /**
   * Runs after built-in `renderTags` output; only invoked when `renderTags(seo, config)` is called with `config` (plugins come from `config.plugins`).
   */
  readonly onRenderTags?: (
    tags: readonly TagDescriptor[],
    ctx: { readonly seo: SEO; readonly config?: SEOConfig },
  ) => readonly TagDescriptor[]
  /**
   * Extend channels with custom meta namespaces (P3).
   * Returns additional TagDescriptor[] that get appended to the output.
   * Use case: Add custom meta tags for new preview surfaces without breaking types.
   */
  readonly extendChannels?: (
    seo: SEO,
    ctx: { readonly config?: SEOConfig },
  ) => readonly TagDescriptor[]
}

/**
 * Search-console verification tokens (aligned with Next.js `Metadata.verification`).
 * Renders `<meta name="…" content="…">` via {@link renderTags}.
 */
export interface SEOVerification {
  readonly google?: string
  readonly yahoo?: string
  readonly yandex?: string
  readonly me?: string
  readonly other?: Readonly<Record<string, string>>
}

/** Pagination `rel="prev"` / `rel="next"` (aligned with Next.js `Metadata.pagination`). */
export interface SEOPagination {
  readonly previous?: string
  readonly next?: string
}

export interface SEOConfig {
  readonly titleTemplate?: string
  readonly baseUrl?: string
  readonly defaultRobots?: string
  readonly schemaMerge?: "concat" | { readonly dedupeByIdAndType?: boolean }
  readonly features?: Partial<{
    readonly jsonLd: boolean
    readonly openGraphMerge: boolean
  }>
  /** Hooks run in order; prefer `createSEOContext` for request-scoped registration (future hardening). */
  readonly plugins?: readonly SEOPlugin[]
  /**
   * Route → partial input via {@link applyRules} / {@link createSEOForRoute} / {@link seoRoute} (Wave 6 / N9).
   * Ignored by plain `createSEO` — use route-aware APIs when you need rules applied.
   */
  readonly rules?: readonly SEORule[]
  /** Validation options for dev-only checks (PRD §3.5). */
  readonly requireDescription?: boolean
  readonly titleMaxLength?: number
  readonly descriptionMaxLength?: number
}

/** hreflang → absolute or path URL (adapter maps to framework expectations). */
export interface SEOAlternates {
  readonly languages?: Readonly<Record<string, string>>
}

export interface SEOMeta {
  readonly title: string
  readonly description?: string
  readonly canonical?: string
  readonly robots?: string
  readonly alternates?: SEOAlternates
  readonly verification?: SEOVerification
  readonly pagination?: SEOPagination
}

export interface SEOImage {
  readonly url: string
  readonly width?: number
  readonly height?: number
  readonly alt?: string
}

/** Open Graph `og:video` group — used when `openGraph.type` is `video.*` or for rich previews. */
export interface SEOOpenGraphVideo {
  readonly url: string
  readonly secureUrl?: string
  readonly type?: string
  readonly width?: number
  readonly height?: number
}

export interface SEO {
  readonly meta: SEOMeta
  readonly openGraph?: {
    readonly title?: string
    readonly description?: string
    readonly url?: string
    readonly type?: string
    /** `og:site_name` — brand shown in Facebook / LinkedIn / Slack previews. */
    readonly siteName?: string
    /** `og:locale` — e.g. `en_US`. */
    readonly locale?: string
    /** `article:published_time` (ISO-8601). */
    readonly publishedTime?: string
    /** `article:modified_time` */
    readonly modifiedTime?: string
    /** `article:expiration_time` */
    readonly expirationTime?: string
    /** `article:author` (repeat per entry). */
    readonly authors?: readonly string[]
    /** `article:section` */
    readonly section?: string
    /** `article:tag` (repeat per entry). */
    readonly tags?: readonly string[]
    readonly images?: readonly SEOImage[]
    readonly videos?: readonly SEOOpenGraphVideo[]
  }
  readonly twitter?: {
    readonly card?: "summary" | "summary_large_image"
    /** `twitter:site` — @handle or numeric string per Twitter Card spec. */
    readonly site?: string
    /** `twitter:creator` */
    readonly creator?: string
    readonly title?: string
    readonly description?: string
    readonly image?: string
  }
  readonly schema: readonly JSONLD[]
}

export type SEOAdapter<TOutput = unknown> = {
  readonly id: string
  toFramework(seo: SEO): TOutput
}

/** Loosely-accepted shape for `createSEO` / voilà entrypoints. */
export type SEOInput = Omit<Partial<SEO>, "meta" | "schema" | "openGraph" | "twitter"> & {
  readonly meta?: Partial<SEOMeta>
  readonly title?: string
  readonly description?: string
  readonly canonical?: string
  readonly robots?: string
  readonly openGraph?: SEO["openGraph"]
  readonly twitter?: SEO["twitter"]
  readonly schema?: readonly JSONLD[]
}

/** Rule output merges into `Partial<SEOInput>` before `createSEO`. */
export interface SEORule {
  readonly match: string
  readonly priority?: number
  readonly seo: Partial<SEOInput>
}

export type TagDescriptor =
  | {
      readonly kind: "meta"
      readonly name?: string
      readonly property?: string
      readonly content: string
    }
  | {
      readonly kind: "link"
      readonly rel: string
      readonly href: string
      readonly hreflang?: string
    }
  | { readonly kind: "script-jsonld"; readonly json: string }
