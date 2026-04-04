import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it, afterEach } from "vitest"
import { addSeoToFile, formatAddResult } from "./cli-add.js"

describe("cli-add (Wave 10)", () => {
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

  it("adds SEO to Next.js App Router page", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-add-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await import("node:fs/promises").then(({ mkdir }) => mkdir(appDir, { recursive: true }))
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `export default function Home() {
  return <h1>Hello</h1>
}`,
      "utf8",
    )

    const result = await addSeoToFile({
      filePath: pagePath,
      title: "Home Page",
      description: "Welcome home",
    })

    if (!result.success) {
      console.error("Add failed:", result.message, "for path:", pagePath)
    }
    expect(result.success).toBe(true)
    expect(result.modified).toBe(true)

    const content = readFileSync(pagePath, "utf8")
    expect(content).toContain('import { seo } from "@better-seo/next"')
    expect(content).toContain(
      'export const metadata = seo({ title: "Home Page", description: "Welcome home" })',
    )
  })

  it("adds SEO with only title", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-add-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await import("node:fs/promises").then(({ mkdir }) => mkdir(appDir, { recursive: true }))
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(pagePath, `export default function X() {}`, "utf8")

    const result = await addSeoToFile({
      filePath: pagePath,
      title: "Test",
    })

    expect(result.success).toBe(true)
    const content = readFileSync(pagePath, "utf8")
    expect(content).toContain('seo({ title: "Test" })')
  })

  it("skips file that already has @better-seo", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-add-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await import("node:fs/promises").then(({ mkdir }) => mkdir(appDir, { recursive: true }))
    const pagePath = join(appDir, "page.tsx")
    writeFileSync(
      pagePath,
      `import { seo } from "@better-seo/next"
export const metadata = seo({ title: "Existing" })
export default function X() {}`,
      "utf8",
    )

    const result = await addSeoToFile({
      filePath: pagePath,
      title: "New",
    })

    expect(result.success).toBe(true)
    expect(result.modified).toBe(false)
    expect(result.message).toContain("already configured")
  })

  it("dry run does not write to file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-add-"))
    createdDirs.push(dir)
    const appDir = join(dir, "app")
    await import("node:fs/promises").then(({ mkdir }) => mkdir(appDir, { recursive: true }))
    const pagePath = join(appDir, "page.tsx")
    const original = `export default function X() {}`
    writeFileSync(pagePath, original, "utf8")

    const result = await addSeoToFile({
      filePath: pagePath,
      title: "Test",
      dryRun: true,
    })

    expect(result.success).toBe(true)
    expect(result.modified).toBe(true)

    const content = readFileSync(pagePath, "utf8")
    expect(content).toBe(original)
  })

  it("adds SEO to React component with Helmet pattern", async () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-add-"))
    createdDirs.push(dir)
    const componentPath = join(dir, "Component.tsx")
    writeFileSync(
      componentPath,
      `export function Component() {
  return <div>Hello</div>
}`,
      "utf8",
    )

    const result = await addSeoToFile({
      filePath: componentPath,
      title: "Component",
      framework: "react",
    })

    expect(result.success).toBe(true)
    const content = readFileSync(componentPath, "utf8")
    expect(content).toContain('import { createSEO } from "@better-seo/core"')
    expect(content).toContain('import { BetterSEOHelmet } from "@better-seo/react"')
  })

  it("formats add result for modified file", () => {
    const result = {
      success: true,
      filePath: "/app/page.tsx",
      message: "Added SEO",
      modified: true,
    }

    const formatted = formatAddResult(result)
    expect(formatted).toContain("✅")
    expect(formatted).toContain("page.tsx")
    expect(formatted).toContain("Added SEO")
  })

  it("formats add result for skipped file", () => {
    const result = {
      success: true,
      filePath: "/app/page.tsx",
      message: "Already configured",
      modified: false,
    }

    const formatted = formatAddResult(result)
    expect(formatted).toContain("ℹ️")
    expect(formatted).toContain("Already configured")
  })

  it("formats add result for failed file", () => {
    const result = {
      success: false,
      filePath: "/app/page.tsx",
      message: "File not found",
      modified: false,
    }

    const formatted = formatAddResult(result)
    expect(formatted).toContain("❌")
    expect(formatted).toContain("File not found")
  })
})
