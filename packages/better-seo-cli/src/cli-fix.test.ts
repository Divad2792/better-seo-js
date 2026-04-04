import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { mkdir } from "node:fs/promises"
import { describe, expect, it, afterEach } from "vitest"
import { fixCodebase, formatFixResult } from "./cli-fix.js"

describe("cli-fix (Wave 10)", () => {
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

  it("fixes missing SEO in codebase", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
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

    const result = await fixCodebase({ cwd: dir })

    expect(result.filesScanned).toBe(1)
    expect(result.filesFixed).toBe(1)
    expect(result.filesFailed).toBe(0)

    const content = readFileSync(pagePath, "utf8")
    expect(content).toContain("@better-seo/next")
  })

  it("dry run does not write changes", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    const original = `export default function Home() {
  return <h1>Hello</h1>
}`
    writeFileSync(pagePath, original, "utf8")

    const result = await fixCodebase({ cwd: dir, dryRun: true })

    expect(result.filesFixed).toBe(1)
    const content = readFileSync(pagePath, "utf8")
    expect(content).toBe(original)
  })

  it("skips files already configured", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `import { seo } from "@better-seo/next"
export const metadata = seo({ title: "Home" })
export default function X() {}`,
      "utf8",
    )

    const result = await fixCodebase({ cwd: dir })

    // File already has SEO, so no issues are found
    expect(result.filesScanned).toBe(1)
    expect(result.filesFixed).toBe(0)
    expect(result.filesFailed).toBe(0)
    expect(result.issues.length).toBe(0)
  })

  it("uses custom default title when provided", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(pagePath, `export default function X() {}`, "utf8")

    const result = await fixCodebase({
      cwd: dir,
      defaultTitle: "Custom Title",
    })

    expect(result.filesFixed).toBe(1)
    const content = readFileSync(pagePath, "utf8")
    expect(content).toContain('title: "Custom Title"')
  })

  it("uses custom default description when provided", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await mkdir(appDir, { recursive: true })
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(pagePath, `export default function X() {}`, "utf8")

    const result = await fixCodebase({
      cwd: dir,
      defaultDescription: "Custom description",
    })

    expect(result.filesFixed).toBe(1)
    const content = readFileSync(pagePath, "utf8")
    expect(content).toContain('description: "Custom description"')
  })

  it("fixes multiple files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-fix-"))
    createdDirs.push(dir)

    const appDir = join(dir, "app")
    const aboutDir = join(dir, "about")
    const page1 = join(appDir, "page.tsx")
    const page2 = join(aboutDir, "page.tsx")

    await mkdir(appDir, { recursive: true })
    await mkdir(aboutDir, { recursive: true })
    writeFileSync(page1, `export default function Home() {}`, "utf8")
    writeFileSync(page2, `export default function About() {}`, "utf8")

    const result = await fixCodebase({ cwd: dir })

    expect(result.filesScanned).toBeGreaterThanOrEqual(2)
    expect(result.filesFixed).toBeGreaterThanOrEqual(1)
  })

  it("formats fix result summary", () => {
    const result = {
      issues: [
        {
          issue: {
            file: "/app/page.tsx",
            line: 1,
            column: 0,
            type: "missing-seo" as const,
            message: "Missing SEO",
            severity: "error" as const,
            framework: "next-app" as const,
          },
          status: "fixed" as const,
          message: "Added SEO",
        },
      ],
      filesScanned: 5,
      filesFixed: 1,
      filesSkipped: 3,
      filesFailed: 1,
    }

    const formatted = formatFixResult(result)
    expect(formatted).toContain("Scanned 5 files")
    expect(formatted).toContain("Fixed: 1")
    expect(formatted).toContain("Skipped: 3")
    expect(formatted).toContain("Failed: 1")
    expect(formatted).toContain("✅")
  })

  it("formats fix result with no issues", () => {
    const result = {
      issues: [],
      filesScanned: 10,
      filesFixed: 0,
      filesSkipped: 0,
      filesFailed: 0,
    }

    const formatted = formatFixResult(result)
    expect(formatted).toContain("✅ No issues to fix")
  })
})
