/**
 * Ongoing — Packaged plugins (P4).
 * Example plugins demonstrating the plugin system.
 */

import type { SEO, SEOInput, SEOPlugin } from "@better-seo/core"

/**
 * Plugin that strips tracking parameters from URLs.
 * Use case: Clean URLs before merging SEO config.
 */
export function createTrackingStripPlugin(): SEOPlugin {
  return {
    id: "tracking-strip",
    beforeMerge: (draft: SEOInput) => {
      const cleanUrl = (url?: string) => {
        if (!url) return url
        try {
          const u = new URL(url)
          u.searchParams.delete("utm_source")
          u.searchParams.delete("utm_medium")
          u.searchParams.delete("utm_campaign")
          u.searchParams.delete("utm_term")
          u.searchParams.delete("utm_content")
          u.searchParams.delete("fbclid")
          u.searchParams.delete("gclid")
          return u.toString()
        } catch {
          return url
        }
      }

      return {
        ...draft,
        meta: draft.meta
          ? {
              ...draft.meta,
              canonical: cleanUrl(draft.meta.canonical),
            }
          : undefined,
      }
    },
  }
}

/**
 * Plugin that enforces a default robots directive.
 * Use case: Ensure all pages have consistent robots directives.
 */
export function createDefaultRobotsPlugin(defaultRobots = "index,follow"): SEOPlugin {
  return {
    id: "default-robots",
    afterMerge: (seo: SEO) => {
      if (!seo.meta.robots) {
        return {
          ...seo,
          meta: {
            ...seo.meta,
            robots: defaultRobots,
          },
        }
      }
      return seo
    },
  }
}

/**
 * Plugin that injects a default WebSite schema.
 * Use case: Ensure every page has a WebSite schema with the site name.
 */
export function createWebSiteSchemaPlugin(siteName: string): SEOPlugin {
  return {
    id: "website-schema",
    afterMerge: (seo: SEO) => {
      const hasWebSite = seo.schema?.some((s) => s["@type"] === "WebSite")
      if (!hasWebSite) {
        return {
          ...seo,
          schema: [
            ...(seo.schema ?? []),
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
            },
          ],
        }
      }
      return seo
    },
  }
}

/**
 * Plugin that normalizes trailing slashes in canonical URLs.
 * Use case: Ensure consistent URL format across the site.
 */
export function createTrailingSlashPlugin(addSlash = false): SEOPlugin {
  return {
    id: "trailing-slash",
    beforeMerge: (draft: SEOInput) => {
      const normalizeUrl = (url?: string) => {
        if (!url) return url
        if (url.startsWith("http")) {
          try {
            const u = new URL(url)
            const path = u.pathname
            const hasSlash = path.endsWith("/")
            if (addSlash && !hasSlash && !path.includes(".")) {
              u.pathname = path + "/"
            } else if (!addSlash && hasSlash && path !== "/") {
              u.pathname = path.slice(0, -1)
            }
            return u.toString()
          } catch {
            return url
          }
        }
        if (addSlash && !url.endsWith("/") && !url.includes(".")) {
          return url + "/"
        }
        if (!addSlash && url.endsWith("/") && url !== "/") {
          return url.slice(0, -1)
        }
        return url
      }

      return {
        ...draft,
        meta: draft.meta
          ? {
              ...draft.meta,
              canonical: normalizeUrl(draft.meta.canonical),
            }
          : undefined,
      }
    },
  }
}
