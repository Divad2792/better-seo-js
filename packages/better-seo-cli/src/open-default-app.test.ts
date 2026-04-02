import { execFile } from "node:child_process"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("node:child_process", async (importOriginal) => {
  const mod = await importOriginal<typeof import("node:child_process")>()
  return { ...mod, execFile: vi.fn() }
})

const { openPathInDefaultApp } = await import("./open-default-app.js")

describe("openPathInDefaultApp", () => {
  beforeEach(() => {
    vi.mocked(execFile).mockClear()
  })

  afterEach(() => {
    delete process.env.CI
    delete process.env.BETTER_SEO_NO_OPEN
  })

  it("does not exec when CI=true", () => {
    process.env.CI = "true"
    openPathInDefaultApp("C:\\tmp\\preview.html")
    expect(execFile).not.toHaveBeenCalled()
  })

  it("does not exec when BETTER_SEO_NO_OPEN=1", () => {
    process.env.BETTER_SEO_NO_OPEN = "1"
    openPathInDefaultApp("/tmp/preview.html")
    expect(execFile).not.toHaveBeenCalled()
  })

  it("attempts platform open when env allows", () => {
    openPathInDefaultApp("C:\\tmp\\preview.html")
    expect(execFile).toHaveBeenCalled()
    if (process.platform === "win32") {
      expect(vi.mocked(execFile).mock.calls[0][0]).toBe("cmd")
    }
  })
})
