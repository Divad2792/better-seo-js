import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { mkdir } from "node:fs/promises"
import { describe, expect, it, afterEach } from "vitest"
import { scanCodebase, formatScanResult } from "./cli-scan.js"

describe("cli-scan (Wave 10)", () => {
  const createdDirs: string[] = []

  afterEach(() => {
    for (const d of createdDirs) {
      try {
        rmSync(d, { recursive: true, force: true })
      } catch {
        // ignore
      }
    }
    createdDirs.length = 0
  })

  it("scans Next.js App Router page without metadata", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-scan-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `export default function Home() {
  return <h1>Hello</h1>
}`,
      "utf8",
    )

    const result = await scanCodebase({ cwd: dir })
    expect(result.filesScanned).toBe(1)
    expect(result.issues.length).toBe(1)
    expect(result.issues[0]?.type).toBe("missing-seo")
    expect(result.issues[0]?.framework).toBe("next-app")
  })

  it("scans Next.js App Router page with metadata", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-scan-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Home" })

export default function Home() {
  return <h1>Hello</h1>
}`,
      "utf8",
    )

    const result = await scanCodebase({ cwd: dir })
    expect(result.filesScanned).toBe(1)
    expect(result.issues.length).toBe(0)
    expect(result.filesWithSEO).toBe(1)
  })

  it("scans Next.js App Router page with generateMetadata", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-scan-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `export async function generateMetadata() {
  return { title: "Home" }
}

export default function Home() {
  return <h1>Hello</h1>
}`,
      "utf8",
    )

    const result = await scanCodebase({ cwd: dir })
    expect(result.filesScanned).toBe(1)
    expect(result.issues.length).toBe(0)
  })

  it("detects empty metadata export", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-scan-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `export const metadata = {}

export default function Home() {
  return <h1>Hello</h1>
}`,
      "utf8",
    )

    const result = await scanCodebase({ cwd: dir })
    expect(result.issues.length).toBe(1)
    expect(result.issues[0]?.type).toBe("empty-title")
  })

  it("ignores node_modules and .next directories", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-scan-"))
    createdDirs.push(dir)
    const nodeModulesDir = join(dir, "node_modules", "pkg")
    const nextDir = join(dir, ".next", "server")

    // Create directories first
    await mkdir(nodeModulesDir, { recursive: true })
    await mkdir(nextDir, { recursive: true })

    const nodeModules = join(nodeModulesDir, "page.tsx")
    const nextFile = join(nextDir, "page.tsx")

    writeFileSync(nodeModules, `export default function X() {}`, "utf8")
    writeFileSync(nextFile, `export default function X() {}`, "utf8")

    const result = await scanCodebase({ cwd: dir })
    expect(result.filesScanned).toBe(0)
  })

  it("formats scan result with issues", () => {
    const result = {
      issues: [
        {
          file: "/app/page.tsx",
          line: 1,
          column: 0,
          type: "missing-seo" as const,
          message: "Missing metadata",
          severity: "error" as const,
          framework: "next-app" as const,
        },
      ],
      filesScanned: 1,
      filesWithSEO: 0,
      filesMissingSEO: 1,
    }

    const formatted = formatScanResult(result)
    expect(formatted).toContain("Scanned 1 files")
    expect(formatted).toContain("Files missing SEO: 1")
    expect(formatted).toContain("❌")
    expect(formatted).toContain("Missing metadata")
  })

  it("formats scan result with no issues", () => {
    const result = {
      issues: [],
      filesScanned: 5,
      filesWithSEO: 5,
      filesMissingSEO: 0,
    }

    const formatted = formatScanResult(result)
    expect(formatted).toContain("✅ No SEO issues found")
  })
})
