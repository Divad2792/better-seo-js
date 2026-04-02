import { execFile } from "node:child_process"

/** Open a file in the OS default handler (browser for `.html`). Respects CI and `BETTER_SEO_NO_OPEN`. */
export function openPathInDefaultApp(absPath: string): void {
  if (
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.BETTER_SEO_NO_OPEN === "1" ||
    process.env.BETTER_SEO_NO_OPEN === "true"
  ) {
    return
  }
  try {
    if (process.platform === "win32") {
      execFile("cmd", ["/c", "start", "", absPath], { windowsHide: true })
    } else if (process.platform === "darwin") {
      execFile("open", [absPath])
    } else {
      execFile("xdg-open", [absPath])
    }
  } catch {
    /* ignore — best-effort only */
  }
}
