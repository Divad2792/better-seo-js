import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getGlobalSEOConfig, initSEO, resetSEOConfigForTests } from "./singleton.js"

describe("initSEO / getGlobalSEOConfig", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetSEOConfigForTests()
  })

  it("stores and returns global config", () => {
    const cfg = { baseUrl: "https://g.test", titleTemplate: "%s | G" }
    initSEO(cfg)
    expect(getGlobalSEOConfig()).toEqual(cfg)
  })

  it("reset clears config", () => {
    initSEO({ baseUrl: "https://x.test" })
    resetSEOConfigForTests()
    expect(getGlobalSEOConfig()).toBeUndefined()
  })

  it("warns in development mode (NODE_ENV !== production)", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    initSEO({ baseUrl: "https://dev.test" })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("initSEO() uses global state and is NOT safe"),
    )
    warnSpy.mockRestore()
    process.env.NODE_ENV = originalEnv
  })

  it("does not warn in production mode (NODE_ENV === production)", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    initSEO({ baseUrl: "https://prod.test" })
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
    process.env.NODE_ENV = originalEnv
  })

  it("handles undefined process.env gracefully", () => {
    const originalProcess = global.process
    // @ts-expect-error - testing undefined process
    global.process = undefined
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Should not throw
    initSEO({ baseUrl: "https://test.test" })
    expect(getGlobalSEOConfig()?.baseUrl).toBe("https://test.test")
    warnSpy.mockRestore()
    global.process = originalProcess
  })
})
