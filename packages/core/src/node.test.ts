import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getGlobalSEOConfig,
  inferSEOConfigFromEnvAndPackageJson,
  initSEOFromPackageJson,
  readPackageJsonForSEO,
  resetSEOConfigForTests,
} from "./node.js"

describe("@better-seo/core/node inference", () => {
  afterEach(() => {
    resetSEOConfigForTests()
    vi.unstubAllEnvs()
  })

  it("readPackageJsonForSEO reads name and homepage", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "my-app",
        homepage: "https://ex.test/docs",
        description: "App",
      }),
    )
    expect(readPackageJsonForSEO(dir)).toEqual({
      name: "my-app",
      homepage: "https://ex.test/docs",
      description: "App",
    })
  })

  it("inferSEOConfigFromEnvAndPackageJson prefers env over package homepage", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "x", homepage: "https://pkg.test" }),
    )
    vi.stubEnv("SITE_URL", "https://env.test")
    expect(inferSEOConfigFromEnvAndPackageJson(dir)).toEqual({
      baseUrl: "https://env.test",
      titleTemplate: "%s | x",
    })
  })

  it("inferSEOConfigFromEnvAndPackageJson derives baseUrl from homepage when no env", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "y", homepage: "https://origin.test/path" }),
    )
    expect(inferSEOConfigFromEnvAndPackageJson(dir).baseUrl).toBe("https://origin.test")
  })

  it("throws when package.json is not found", () => {
    expect(() => readPackageJsonForSEO("/nonexistent-path-xyz")).toThrow(/package.json not found/)
  })

  it("handles invalid homepage URL gracefully", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "z", homepage: "not-a-valid-url" }),
    )
    const config = inferSEOConfigFromEnvAndPackageJson(dir)
    expect(config.baseUrl).toBeUndefined()
    expect(config.titleTemplate).toBe("%s | z")
  })

  it("initSEOFromPackageJson stores config globally", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "test-app", homepage: "https://test.test" }),
    )
    initSEOFromPackageJson(dir)
    const config = getGlobalSEOConfig()
    expect(config?.baseUrl).toBe("https://test.test")
    expect(config?.titleTemplate).toBe("%s | test-app")
  })

  it("prefers NEXT_PUBLIC_SITE_URL over other env vars", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "x", homepage: "https://pkg.test" }),
    )
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://public.test")
    vi.stubEnv("SITE_URL", "https://site.test")
    expect(inferSEOConfigFromEnvAndPackageJson(dir).baseUrl).toBe("https://public.test")
  })

  it("uses VERCEL_URL when no other URL env is set", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x" }))
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app")
    expect(inferSEOConfigFromEnvAndPackageJson(dir).baseUrl).toBe("https://my-app.vercel.app")
  })
})
