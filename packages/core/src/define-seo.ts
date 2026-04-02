import type { SEOInput } from "./types.js"

/**
 * **C18** — Preserves a typed {@link SEOInput} literal for templates / config snippets (no runtime transform).
 */
export function defineSEO<const T extends SEOInput>(input: T): T {
  return input
}
