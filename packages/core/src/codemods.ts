/**
 * Wave 12 — Migration codemods for next-seo → @better-seo.
 * Transforms common next-seo patterns to @better-seo equivalents.
 * Zero external AST deps — uses regex patterns aligned with ARCHITECTURE §1.
 */

export interface CodemodResult {
  readonly transformed: string
  readonly changes: number
}

/**
 * Transform next-seo imports to @better-seo equivalents.
 * Handles: NextSeo, DefaultSeo, ArticleJsonLd, FAQPageJsonLd, etc.
 */
export function transformNextSeoImports(source: string): CodemodResult {
  let transformed = source
  let changes = 0

  // Transform NextSeo import
  const nextSeoImport = /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']next-seo["']/g
  let match: RegExpExecArray | null
  while ((match = nextSeoImport.exec(source)) !== null) {
    const imports = match[1]!
    const newImports = transformImportList(imports)
    if (newImports !== imports) {
      transformed = transformed.replace(match[0], newImports)
      changes++
    }
  }

  // Transform NextSeo component usage
  const nextSeoComponent = /<NextSeo\s+([^>]*)\/?>/g
  while ((match = nextSeoComponent.exec(transformed)) !== null) {
    const props = match[1]!
    const newProps = transformNextSeoProps(props)
    if (newProps !== props) {
      transformed = transformed.replace(match[0], `/* TODO: Convert to seo() metadata */`)
      changes++
    }
  }

  return { transformed, changes }
}

function transformImportList(imports: string): string {
  const items = imports.split(",").map((s) => s.trim())
  const newItems: string[] = []

  for (const item of items) {
    if (item === "NextSeo" || item === "DefaultSeo") {
      // These become seo() calls in @better-seo
      newItems.push(`// TODO: Replace ${item} with seo() from @better-seo/next`)
    } else if (item === "ArticleJsonLd") {
      newItems.push("article")
    } else if (item === "FAQPageJsonLd") {
      newItems.push("faqPage")
    } else if (item === "BreadcrumbJsonLd") {
      newItems.push("breadcrumbList")
    } else if (item === "OrganizationJsonLd") {
      newItems.push("organization")
    } else if (item === "ProductJsonLd") {
      newItems.push("product")
    } else {
      newItems.push(item)
    }
  }

  const hasBetterSeo = newItems.some((i) =>
    ["article", "faqPage", "breadcrumbList", "organization", "product"].includes(i),
  )

  if (hasBetterSeo) {
    return `import { ${newItems.filter((i) => !i.startsWith("//")).join(", ")} } from "@better-seo/core"`
  }

  return `import { ${newItems.join(", ")} } from "@better-seo/next"`
}

function transformNextSeoProps(props: string): string {
  let result = props

  // Transform title prop
  result = result.replace(/title=\{["']([^"']+)["']\}/g, `title: "$1"`)

  // Transform description prop
  result = result.replace(/description=\{["']([^"']+)["']\}/g, `description: "$1"`)

  // Transform canonical prop
  result = result.replace(/canonical=\{["']([^"']+)["']\}/g, `canonical: "$1"`)

  return result
}

/**
 * Transform next-seo config object to @better-seo SEOInput.
 */
export function transformNextSeoConfig(config: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(config)) {
    switch (key) {
      case "title":
      case "description":
      case "canonical":
        result[key] = value
        break
      case "openGraph":
        result.openGraph = transformOpenGraph(value as Record<string, unknown>)
        break
      case "twitter":
        result.twitter = transformTwitter(value as Record<string, unknown>)
        break
      case "noindex":
        result.robots = value === true ? "noindex,follow" : undefined
        break
      case "nofollow":
        result.robots = value === true ? "index,nofollow" : undefined
        break
      default:
        result[key] = value
    }
  }

  return result
}

function transformOpenGraph(og?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!og) return undefined

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(og)) {
    switch (key) {
      case "title":
      case "description":
      case "url":
      case "type":
      case "site_name":
      case "locale":
        result[key === "site_name" ? "siteName" : key] = value
        break
      case "images":
        result.images = Array.isArray(value)
          ? value.map((img: Record<string, unknown>) => ({
              url: img.url ?? img.secureUrl,
              width: img.width,
              height: img.height,
              alt: img.alt,
            }))
          : value
        break
      default:
        result[key] = value
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

function transformTwitter(tw?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!tw) return undefined

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(tw)) {
    switch (key) {
      case "cardType":
        result.card = value
        break
      case "site":
      case "creator":
      case "title":
      case "description":
      case "image":
        result[key] = value
        break
      default:
        result[key] = value
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}
