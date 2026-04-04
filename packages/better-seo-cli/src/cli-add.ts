/**
 * Wave 10 — AST-first SEO injector for codebases.
 * Adds `seo()` imports and exports to Next.js App Router pages/layouts.
 * Zero external AST deps — uses regex patterns aligned with ARCHITECTURE §1 (zero-dep core).
 */

import { readFile, writeFile } from "node:fs/promises"
import { relative } from "node:path"

export interface AddOptions {
  readonly filePath: string
  readonly title?: string
  readonly description?: string
  readonly dryRun?: boolean
  readonly framework?: "next-app" | "next-pages" | "react"
}

export interface AddResult {
  readonly success: boolean
  readonly filePath: string
  readonly message: string
  readonly modified: boolean
}

function detectFrameworkFromPath(filePath: string): "next-app" | "next-pages" | "react" {
  const parts = filePath.split(/[\\/]/)
  const basename = parts.pop() ?? ""
  const isPageOrLayout =
    basename === "page.tsx" ||
    basename === "page.jsx" ||
    basename === "page.mdx" ||
    basename === "layout.tsx" ||
    basename === "layout.jsx" ||
    basename === "layout.mdx"

  const hasAppDir = filePath.includes("/app/") || filePath.includes("\\app\\")
  const hasPagesDir = filePath.includes("/pages/") || filePath.includes("\\pages\\")

  if (isPageOrLayout) {
    if (hasAppDir) return "next-app"
    if (hasPagesDir) return "next-pages"
    return "next-app"
  }

  if (hasPagesDir) return "next-pages"
  return "react"
}

function generateNextAppSeoSnippet(title: string, description?: string): string {
  const imports = `import { seo } from "@better-seo/next"`
  const seoCall = description
    ? `export const metadata = seo({ title: "${title}", description: "${description}" })`
    : `export const metadata = seo({ title: "${title}" })`

  return `${imports}\n${seoCall}`
}

function generateNextPagesSeoSnippet(title: string, description?: string): string {
  const imports = `import { seo } from "@better-seo/next"`
  const seoCall = description
    ? `export const metadata = seo({ title: "${title}", description: "${description}" })`
    : `export const metadata = seo({ title: "${title}" })`

  return `${imports}\n${seoCall}`
}

function generateReactSeoSnippet(title: string, description?: string): string {
  const imports = `import { createSEO } from "@better-seo/core"\nimport { BetterSEOHelmet } from "@better-seo/react"`
  const seoCall = description
    ? `const seo = createSEO({ title: "${title}", description: "${description}" })`
    : `const seo = createSEO({ title: "${title}" })`
  const helmet = `<BetterSEOHelmet seo={seo} />`

  return `${imports}\n\n${seoCall}\n\n// In component:\n${helmet}`
}

function findInsertionPoint(
  content: string,
  framework: "next-app" | "next-pages" | "react",
): {
  insertIndex: number
  hasExistingImports: boolean
} {
  if (framework === "next-app" || framework === "next-pages") {
    const importMatch = /^import\s+[^;]+;?\n/gm.exec(content)
    if (importMatch) {
      const lastImportEnd = importMatch.index + importMatch[0].length
      return { insertIndex: lastImportEnd, hasExistingImports: true }
    }
    return { insertIndex: 0, hasExistingImports: false }
  }

  if (framework === "react") {
    const importMatch = /^import\s+[^;]+;?\n/gm.exec(content)
    if (importMatch) {
      const lastImportEnd = importMatch.index + importMatch[0].length
      return { insertIndex: lastImportEnd, hasExistingImports: true }
    }
    return { insertIndex: 0, hasExistingImports: false }
  }

  return { insertIndex: 0, hasExistingImports: false }
}

function injectSeoIntoFile(
  content: string,
  options: AddOptions,
): { modified: boolean; newContent: string; message: string } {
  const framework = options.framework ?? detectFrameworkFromPath(options.filePath)
  const title = options.title ?? "Page"
  const description = options.description

  if (framework === "next-app") {
    const hasMetadata = /export\s+const\s+metadata\s*=/.test(content)
    const hasBetterSeo = /@better-seo/.test(content)

    if (hasMetadata && hasBetterSeo) {
      return {
        modified: false,
        newContent: content,
        message: "SEO already configured with @better-seo",
      }
    }

    const { insertIndex, hasExistingImports } = findInsertionPoint(content, framework)
    const snippet = generateNextAppSeoSnippet(title, description)

    let newContent: string
    if (hasExistingImports) {
      newContent =
        content.slice(0, insertIndex) + "\n" + snippet + "\n" + content.slice(insertIndex)
    } else {
      newContent = snippet + "\n\n" + content
    }

    return {
      modified: true,
      newContent,
      message: `Added @better-seo/next import and metadata export`,
    }
  }

  if (framework === "next-pages") {
    const hasBetterSeo = /@better-seo/.test(content)
    const hasNextSeo = /next-seo/.test(content)

    if (hasBetterSeo || hasNextSeo) {
      return {
        modified: false,
        newContent: content,
        message: "SEO already configured",
      }
    }

    const { insertIndex, hasExistingImports } = findInsertionPoint(content, framework)
    const snippet = generateNextPagesSeoSnippet(title, description)

    let newContent: string
    if (hasExistingImports) {
      newContent =
        content.slice(0, insertIndex) + "\n" + snippet + "\n" + content.slice(insertIndex)
    } else {
      newContent = snippet + "\n\n" + content
    }

    return {
      modified: true,
      newContent,
      message: `Added @better-seo/next import and metadata export`,
    }
  }

  if (framework === "react") {
    const hasBetterSeo = /@better-seo/.test(content)

    if (hasBetterSeo) {
      return {
        modified: false,
        newContent: content,
        message: "SEO already configured with @better-seo",
      }
    }

    const { insertIndex, hasExistingImports } = findInsertionPoint(content, framework)
    const snippet = generateReactSeoSnippet(title, description)

    let newContent: string
    if (hasExistingImports) {
      newContent =
        content.slice(0, insertIndex) + "\n" + snippet + "\n" + content.slice(insertIndex)
    } else {
      newContent = snippet + "\n\n" + content
    }

    return {
      modified: true,
      newContent,
      message: `Added @better-seo/core and @better-seo/react imports`,
    }
  }

  return {
    modified: false,
    newContent: content,
    message: "Unknown framework, no changes made",
  }
}

export async function addSeoToFile(options: AddOptions): Promise<AddResult> {
  const { filePath, dryRun = false } = options

  try {
    const content = await readFile(filePath, "utf8")
    const { modified, newContent, message } = injectSeoIntoFile(content, options)

    if (!modified) {
      return {
        success: true,
        filePath,
        message,
        modified: false,
      }
    }

    if (!dryRun) {
      await writeFile(filePath, newContent, "utf8")
    }

    return {
      success: true,
      filePath,
      message: dryRun ? `[DRY RUN] ${message}` : message,
      modified: true,
    }
  } catch (e) {
    return {
      success: false,
      filePath,
      message: e instanceof Error ? e.message : String(e),
      modified: false,
    }
  }
}

export function formatAddResult(result: AddResult): string {
  if (result.success) {
    const icon = result.modified ? "✅" : "ℹ️"
    return `${icon} ${relative(process.cwd(), result.filePath)}: ${result.message}`
  }
  return `❌ ${relative(process.cwd(), result.filePath)}: ${result.message}`
}
