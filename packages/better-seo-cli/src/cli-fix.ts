/**
 * Wave 10 — Auto-remediation for SEO issues.
 * Combines scan + add to fix missing SEO across codebase.
 * Idempotent: skips files already configured.
 */

import { relative } from "node:path"
import { scanCodebase, type ScanIssue, formatScanResult } from "./cli-scan.js"
import { addSeoToFile, type AddResult, formatAddResult } from "./cli-add.js"

export interface FixOptions {
  readonly cwd?: string
  readonly dryRun?: boolean
  readonly defaultTitle?: string
  readonly defaultDescription?: string
  readonly ignorePatterns?: RegExp[]
}

export interface FixIssue {
  readonly issue: ScanIssue
  readonly result?: AddResult
  readonly status: "fixed" | "skipped" | "failed"
  readonly message: string
}

export interface FixResult {
  readonly issues: readonly FixIssue[]
  readonly filesScanned: number
  readonly filesFixed: number
  readonly filesSkipped: number
  readonly filesFailed: number
}

function generateTitleFromPath(filePath: string): string {
  const basename = filePath.split("/").pop() ?? ""
  const name = basename
    .replace(/\.(tsx|jsx|ts|js|mdx)$/, "")
    .replace(/[-_]/g, " ")
    .replace(/page|layout/i, "")
    .trim()

  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const parts = filePath.split("/")
  const parentDir = parts[parts.length - 2]
  if (parentDir && parentDir !== "app" && parentDir !== "pages") {
    return parentDir.charAt(0).toUpperCase() + parentDir.slice(1)
  }

  return "Page"
}

async function fixIssue(issue: ScanIssue, options: FixOptions): Promise<FixIssue> {
  if (issue.type !== "missing-seo" && issue.type !== "empty-title") {
    return {
      issue,
      status: "skipped",
      message: `Issue type "${issue.type}" requires manual review`,
    }
  }

  const defaultTitle = generateTitleFromPath(issue.file)
  const title = options.defaultTitle ?? defaultTitle
  const description = options.defaultDescription

  const result = await addSeoToFile({
    filePath: issue.file,
    title,
    description,
    dryRun: options.dryRun,
    framework: issue.framework === "unknown" ? "next-app" : issue.framework,
  })

  if (result.success && result.modified) {
    return {
      issue,
      result,
      status: "fixed",
      message: result.message,
    }
  }

  if (result.success && !result.modified) {
    return {
      issue,
      result,
      status: "skipped",
      message: result.message,
    }
  }

  return {
    issue,
    result,
    status: "failed",
    message: result.message,
  }
}

export async function fixCodebase(options: FixOptions = {}): Promise<FixResult> {
  const scanResult = await scanCodebase({
    cwd: options.cwd,
    ignorePatterns: options.ignorePatterns,
  })

  const fixIssues: FixIssue[] = []
  let filesFixed = 0
  let filesSkipped = 0
  let filesFailed = 0

  for (const issue of scanResult.issues) {
    const fixResult = await fixIssue(issue, options)
    fixIssues.push(fixResult)

    if (fixResult.status === "fixed") {
      filesFixed++
    } else if (fixResult.status === "skipped") {
      filesSkipped++
    } else {
      filesFailed++
    }
  }

  return {
    issues: fixIssues,
    filesScanned: scanResult.filesScanned,
    filesFixed,
    filesSkipped,
    filesFailed,
  }
}

export function formatFixResult(result: FixResult): string {
  const lines: string[] = []

  lines.push(`\nScanned ${result.filesScanned} files`)
  lines.push(`Fixed: ${result.filesFixed}`)
  lines.push(`Skipped: ${result.filesSkipped}`)
  lines.push(`Failed: ${result.filesFailed}`)

  if (result.issues.length > 0) {
    lines.push(`\nDetails:\n`)
    for (const fixIssue of result.issues) {
      const icon = fixIssue.status === "fixed" ? "✅" : fixIssue.status === "skipped" ? "ℹ️" : "❌"
      const relPath = relative(process.cwd(), fixIssue.issue.file)
      lines.push(`${icon} ${relPath}:${fixIssue.issue.line} [${fixIssue.issue.framework}]`)
      lines.push(`   ${fixIssue.message}`)
    }
  } else {
    lines.push("\n✅ No issues to fix")
  }

  return lines.join("\n")
}

export async function runFix(rest: string[]): Promise<number> {
  try {
    const { parseArgs } = await import("node:util")
    const { values } = parseArgs({
      args: rest,
      options: {
        "dry-run": { type: "boolean" as const, default: false },
        title: { type: "string" as const },
        description: { type: "string" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })

    if (values.help) {
      printFixHelp()
      return 0
    }

    const result = await fixCodebase({
      dryRun: values["dry-run"],
      defaultTitle: values.title,
      defaultDescription: values.description,
    })

    console.log(formatFixResult(result))

    return result.filesFailed > 0 ? 1 : 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runScan(rest: string[]): Promise<number> {
  try {
    const { parseArgs } = await import("node:util")
    const { values } = parseArgs({
      args: rest,
      options: {
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: false,
    })

    if (values.help) {
      printScanHelp()
      return 0
    }

    const result = await scanCodebase()
    console.log(formatScanResult(result))

    return result.issues.length > 0 ? 1 : 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

export async function runAdd(rest: string[]): Promise<number> {
  try {
    const { parseArgs } = await import("node:util")
    const { values, positionals } = parseArgs({
      args: rest,
      options: {
        title: { type: "string" as const, short: "t" },
        description: { type: "string" as const, short: "d" },
        "dry-run": { type: "boolean" as const },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })

    if (values.help) {
      printAddHelp()
      return 0
    }

    const filePath = positionals[0]
    if (!filePath) {
      console.error("Missing file path. Example: better-seo add app/page.tsx")
      return 1
    }

    const result = await addSeoToFile({
      filePath,
      title: values.title,
      description: values.description,
      dryRun: values["dry-run"],
    })

    console.log(formatAddResult(result))
    return result.success ? 0 : 1
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

function printScanHelp(): void {
  console.log(`Scan codebase for missing SEO (Wave 10 / L3).

Usage:
  better-seo scan [options]

Options:
  --help, -h    Show help

Scans for:
  - Next.js App Router pages/layouts missing metadata export
  - Next.js Pages Router files missing SEO
  - React components missing Helmet

Exit codes:
  0  No issues found
  1  Issues found
`)
}

function printAddHelp(): void {
  console.log(`Add SEO to a specific file (Wave 10 / L3).

Usage:
  better-seo add <file> [options]

Arguments:
  <file>          Path to file (e.g., app/page.tsx)

Options:
  --title, -t     Page title (default: inferred from path)
  --description, -d  Page description (optional)
  --dry-run       Show what would be added without writing
  --help, -h      Show help

Examples:
  better-seo add app/page.tsx
  better-seo add app/about/page.tsx -t "About Us" -d "Learn about us"
  better-seo add app/page.tsx --dry-run
`)
}

function printFixHelp(): void {
  console.log(`Auto-fix SEO issues across codebase (Wave 10 / L3).

Usage:
  better-seo fix [options]

Options:
  --dry-run       Show what would be fixed without writing
  --title         Default title for pages (default: inferred from path)
  --description   Default description for all pages (optional)
  --help, -h      Show help

Exit codes:
  0  All issues fixed
  1  Some issues failed

Examples:
  better-seo fix
  better-seo fix --dry-run
  better-seo fix --title "My Site" --description "Site description"
`)
}
