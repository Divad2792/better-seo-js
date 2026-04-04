/**
 * Wave 10 — AST-first SEO scanner for codebases.
 * Detects pages/components missing SEO metadata (Next.js App Router, Pages Router, React).
 * Zero external AST deps — uses regex patterns aligned with ARCHITECTURE §1 (zero-dep core).
 */

import { readFile, readdir } from "node:fs/promises"
import { extname, join } from "node:path"

export interface ScanIssue {
  readonly file: string
  readonly line: number
  readonly column: number
  readonly type: "missing-seo" | "missing-export" | "empty-title" | "no-metadata"
  readonly message: string
  readonly severity: "error" | "warning"
  readonly framework: "next-app" | "next-pages" | "react" | "unknown"
}

export interface ScanResult {
  readonly issues: readonly ScanIssue[]
  readonly filesScanned: number
  readonly filesWithSEO: number
  readonly filesMissingSEO: number
}

const NEXT_APP_ROUTER_EXPORT_PATTERNS = [
  /export\s+const\s+metadata\s*=/,
  /export\s+async\s+function\s+generateMetadata\s*\(/,
  /export\s+const\s+generateMetadata\s*=/,
]

const NEXT_PAGES_ROUTER_PATTERNS = [
  /import\s+{\s*NextSeo\s*}\s+from\s+["']next-seo["']/,
  /import\s+{\s*DefaultSeo\s*}\s+from\s+["']next-seo["']/,
  /<NextSeo\s/,
  /import\s+{\s*seo\s*}\s+from\s+["']@better-seo["']/,
]

const REACT_HELMET_PATTERNS = [
  /import\s+{\s*Helmet\s*}\s+from\s+["']react-helmet["']/,
  /import\s+{\s*HelmetProvider\s*}\s+from\s+["']react-helmet-async["']/,
  /<Helmet\s/,
  /import\s+{\s*BetterSEOHelmet\s*}\s+from\s+["']@better-seo["']/,
]

const BETTER_SEO_PATTERNS = [
  /import\s+{\s*seo\s*}\s+from\s+["']@better-seo\/next["']/,
  /import\s+{\s*createSEO\s*}\s+from\s+["']@better-seo\/core["']/,
  /seo\s*\(\s*\{/,
  /createSEO\s*\(/,
]

function isNextAppRouterFile(content: string): boolean {
  return NEXT_APP_ROUTER_EXPORT_PATTERNS.some((p) => p.test(content))
}

function isNextPagesRouterFile(content: string): boolean {
  return NEXT_PAGES_ROUTER_PATTERNS.some((p) => p.test(content))
}

function isReactFile(content: string): boolean {
  return REACT_HELMET_PATTERNS.some((p) => p.test(content))
}

function hasBetterSEO(content: string): boolean {
  return BETTER_SEO_PATTERNS.some((p) => p.test(content))
}

function findLineAndColumn(content: string, index: number): { line: number; column: number } {
  const lines = content.slice(0, index).split("\n")
  const line = lines.length
  const column = lines[lines.length - 1]?.length ?? 0
  return { line, column }
}

function detectFramework(
  filePath: string,
  content: string,
): "next-app" | "next-pages" | "react" | "unknown" {
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
    if (isNextAppRouterFile(content)) return "next-app"
    if (hasBetterSEO(content)) return "next-app"
    if (hasAppDir) return "next-app"
    if (hasPagesDir) return "next-pages"
    return "next-app"
  }

  if (isNextPagesRouterFile(content)) return "next-pages"
  if (isReactFile(content)) return "react"
  if (hasBetterSEO(content)) return "next-app"

  return "unknown"
}

function scanFile(filePath: string, content: string): ScanIssue[] {
  const issues: ScanIssue[] = []
  const framework = detectFramework(filePath, content)
  const parts = filePath.split(/[\\/]/)
  const basename = parts.pop() ?? ""
  const isPageOrLayout =
    basename === "page.tsx" ||
    basename === "page.jsx" ||
    basename === "page.mdx" ||
    basename === "layout.tsx" ||
    basename === "layout.jsx" ||
    basename === "layout.mdx"

  if (!isPageOrLayout && framework === "unknown") {
    return []
  }

  if (framework === "next-app" || (isPageOrLayout && framework === "unknown")) {
    const hasMetadata = NEXT_APP_ROUTER_EXPORT_PATTERNS.some((p) => p.test(content))
    const hasBetterSeo = hasBetterSEO(content)

    if (!hasMetadata && !hasBetterSeo) {
      const pos = findLineAndColumn(content, 0)
      issues.push({
        file: filePath,
        line: pos.line,
        column: pos.column,
        type: "missing-seo",
        message:
          "Next.js App Router page/layout missing `export const metadata = seo({...})` or `generateMetadata`",
        severity: "error",
        framework: "next-app",
      })
    } else if (hasMetadata) {
      const emptyTitle = /export\s+const\s+metadata\s*=\s*\{\s*\}/.test(content)
      if (emptyTitle) {
        const match = /export\s+const\s+metadata\s*=\s*\{\s*\}/.exec(content)
        const pos = match ? findLineAndColumn(content, match.index) : findLineAndColumn(content, 0)
        issues.push({
          file: filePath,
          line: pos.line,
          column: pos.column,
          type: "empty-title",
          message: "metadata export is empty or missing title",
          severity: "error",
          framework: "next-app",
        })
      }
    }
  }

  if (framework === "next-pages") {
    const hasBetterSeo = hasBetterSEO(content)
    const hasNextSeo = /next-seo/.test(content)

    if (!hasBetterSeo && !hasNextSeo) {
      const pos = findLineAndColumn(content, 0)
      issues.push({
        file: filePath,
        line: pos.line,
        column: pos.column,
        type: "missing-seo",
        message: "Next.js Pages Router file missing SEO (consider @better-seo/next or next-seo)",
        severity: "warning",
        framework: "next-pages",
      })
    }
  }

  if (framework === "react") {
    const hasBetterSeo = hasBetterSEO(content)
    const hasHelmet = /<Helmet\s/.test(content)

    if (!hasBetterSeo && !hasHelmet) {
      const pos = findLineAndColumn(content, 0)
      issues.push({
        file: filePath,
        line: pos.line,
        column: pos.column,
        type: "missing-seo",
        message: "React component missing Helmet or @better-seo/react",
        severity: "warning",
        framework: "react",
      })
    }
  }

  return issues
}

async function walkDir(
  dir: string,
  options: { ignorePatterns?: RegExp[]; maxDepth?: number } = {},
): Promise<string[]> {
  const files: string[] = []
  const ignorePatterns = options.ignorePatterns ?? [
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.turbo/,
  ]
  const maxDepth = options.maxDepth ?? 10

  async function walk(currentDir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return

    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (ignorePatterns.some((p) => p.test(fullPath))) {
        continue
      }

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (ext === ".tsx" || ext === ".jsx" || ext === ".ts" || ext === ".js" || ext === ".mdx") {
          files.push(fullPath)
        }
      }
    }
  }

  await walk(dir, 0)
  return files
}

export interface ScanOptions {
  readonly cwd?: string
  readonly ignorePatterns?: RegExp[]
  readonly maxDepth?: number
}

export async function scanCodebase(options: ScanOptions = {}): Promise<ScanResult> {
  const cwd = options.cwd ?? process.cwd()
  const files = await walkDir(cwd, {
    ignorePatterns: options.ignorePatterns,
    maxDepth: options.maxDepth,
  })

  const allIssues: ScanIssue[] = []
  let filesWithSEO = 0
  let filesMissingSEO = 0

  for (const file of files) {
    try {
      const content = await readFile(file, "utf8")
      const issues = scanFile(file, content)

      if (issues.length > 0) {
        filesMissingSEO++
        allIssues.push(...issues)
      } else {
        const parts = file.split(/[\\/]/)
        const basename = parts.pop() ?? ""
        const isPageOrLayout =
          basename === "page.tsx" ||
          basename === "page.jsx" ||
          basename === "layout.tsx" ||
          basename === "layout.jsx"
        if (isPageOrLayout) {
          filesWithSEO++
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return {
    issues: allIssues,
    filesScanned: files.length,
    filesWithSEO,
    filesMissingSEO,
  }
}

export function formatScanResult(result: ScanResult): string {
  const lines: string[] = []
  lines.push(`\nScanned ${result.filesScanned} files`)
  lines.push(`Files with SEO: ${result.filesWithSEO}`)
  lines.push(`Files missing SEO: ${result.filesMissingSEO}`)

  if (result.issues.length > 0) {
    lines.push(`\nFound ${result.issues.length} issue(s):\n`)
    for (const issue of result.issues) {
      const severity = issue.severity === "error" ? "❌" : "⚠️"
      lines.push(`${severity} ${issue.file}:${issue.line}:${issue.column} [${issue.framework}]`)
      lines.push(`   ${issue.message}`)
    }
  } else {
    lines.push("\n✅ No SEO issues found")
  }

  return lines.join("\n")
}
