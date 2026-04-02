import type { OgCardPalette } from "./templates/og-card.js"

/** Design token keys → OG card palette (Wave 11 / A5 baseline; use with custom `--template`). */
export type OgDesignTokens = {
  /** Primary / brand (maps to `accent`). */
  readonly primary?: string
  /** Page / card background. */
  readonly surface?: string
  /** Secondary text. */
  readonly muted?: string
  /** Explicit accent override. */
  readonly accent?: string
  /** Main text on surface (optional; defaults light-on-dark). */
  readonly onSurface?: string
}

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function assertHex(label: string, v: string | undefined, fallback: string): string {
  if (!v?.trim()) return fallback
  const s = v.trim()
  if (!HEX.test(s)) return fallback
  return s
}

/**
 * Map Tailwind / CSS-variable hex tokens to {@link OgCardPalette} for `generateOG` templates.
 */
export function ogPaletteFromTokens(tokens: OgDesignTokens): OgCardPalette {
  const surface = assertHex("surface", tokens.surface, "#0f172a")
  const fg = assertHex("onSurface", tokens.onSurface, "#f8fafc")
  const muted = assertHex("muted", tokens.muted, "#94a3b8")
  const accent = assertHex("accent", tokens.accent ?? tokens.primary, "#38bdf8")
  return { bg: surface, fg, muted, accent }
}
