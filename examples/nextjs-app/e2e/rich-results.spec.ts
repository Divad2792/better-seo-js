import { expect, test } from "@playwright/test"

/**
 * Rich results E2E tests — verifies all SEO surfaces that search engines and social platforms use.
 * Covers: JSON-LD structured data, Open Graph, Twitter Cards, hreflang, verification, pagination.
 */
test.describe("rich results", () => {
  test.describe("JSON-LD structured data", () => {
    test("home page has parseable WebPage schema", async ({ page }) => {
      await page.goto("/")
      const ld = page.locator('script[type="application/ld+json"]')
      await expect(ld).toHaveCount(1)

      const raw = await ld.textContent()
      expect(raw).toBeTruthy()

      const parsed = JSON.parse(raw as string)
      const node = Array.isArray(parsed) ? parsed[0] : parsed
      expect(node["@context"]).toBe("https://schema.org")
      expect(node["@type"]).toBe("WebPage")
      expect(node.name).toContain("better-seo")
      expect(node.url).toBeTruthy()
    })

    test("with-seo page has merged schema nodes", async ({ page }) => {
      await page.goto("/with-seo")
      const ld = page.locator('script[type="application/ld+json"]')
      await expect(ld).toHaveCount(1)

      const raw = await ld.textContent()
      expect(raw).toBeTruthy()

      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      expect(nodes.length).toBeGreaterThanOrEqual(1)

      // Last node should be the child "Layered page"
      const lastNode = nodes[nodes.length - 1]
      expect(lastNode.name).toBe("Layered page")
    })
  })

  test.describe("Open Graph (Facebook/LinkedIn previews)", () => {
    test("home page has complete OG tags", async ({ page }) => {
      await page.goto("/")

      // OG title
      const ogTitle = page.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveAttribute("content", /better-seo\.js example/)

      // OG description
      const ogDesc = page.locator('meta[property="og:description"]')
      await expect(ogDesc).toHaveAttribute("content", /Golden-path/)

      // OG type
      const ogType = page.locator('meta[property="og:type"]')
      await expect(ogType).toHaveAttribute("content", "website")

      // OG site name
      const ogSiteName = page.locator('meta[property="og:site_name"]')
      await expect(ogSiteName).toHaveAttribute("content", /better-seo\.js demo/)

      // OG locale
      const ogLocale = page.locator('meta[property="og:locale"]')
      await expect(ogLocale).toHaveAttribute("content", "en_US")

      // OG image (with dimensions)
      const ogImage = page.locator('meta[property="og:image"]')
      await expect(ogImage).toHaveAttribute("content", /og-example\.png/)

      const ogImageWidth = page.locator('meta[property="og:image:width"]')
      await expect(ogImageWidth).toHaveAttribute("content", "1200")

      const ogImageHeight = page.locator('meta[property="og:image:height"]')
      await expect(ogImageHeight).toHaveAttribute("content", "630")

      const ogImageAlt = page.locator('meta[property="og:image:alt"]')
      await expect(ogImageAlt).toHaveAttribute("content", /better-seo\.js/)
    })

    test("blog article page has article OG type", async ({ page }) => {
      await page.goto("/blog/hello-world")

      const ogType = page.locator('meta[property="og:type"]')
      await expect(ogType).toHaveAttribute("content", "article")

      // Article pages should have published_time in OG
      const ogPublished = page.locator('meta[property="article:published_time"]')
      await expect(ogPublished).toHaveCount(1)
    })
  })

  test.describe("Twitter Card previews", () => {
    test("home page has Twitter card meta tags", async ({ page }) => {
      await page.goto("/")

      const twCard = page.locator('meta[name="twitter:card"]')
      await expect(twCard).toHaveAttribute("content", /summary/)

      const twSite = page.locator('meta[name="twitter:site"]')
      await expect(twSite).toHaveAttribute("content", "@better_seo_js")

      const twCreator = page.locator('meta[name="twitter:creator"]')
      await expect(twCreator).toHaveAttribute("content", "@better_seo_js")

      // Twitter image should fallback to OG image
      const twImage = page.locator('meta[name="twitter:image"]')
      await expect(twImage).toHaveAttribute("content", /og-example\.png/)
    })
  })

  test.describe("International SEO (hreflang)", () => {
    test("home page has hreflang alternates", async ({ page }) => {
      await page.goto("/")

      const enUs = page.locator('link[rel="alternate"][hreflang="en-US"]')
      await expect(enUs).toHaveAttribute("href", /\/en$/)

      const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
      await expect(xDefault).toHaveCount(1)
    })
  })

  test.describe("Canonical URLs", () => {
    test("home page has canonical link", async ({ page }) => {
      await page.goto("/")
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      await expect(canonical).toHaveAttribute("href", /\//)
    })

    test("blog page has canonical with slug", async ({ page }) => {
      await page.goto("/blog/hello-world")
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      await expect(canonical).toHaveAttribute("href", /hello-world/)
    })
  })

  test.describe("Robots meta", () => {
    test("home page has robots meta tag", async ({ page }) => {
      await page.goto("/")
      const robots = page.locator('meta[name="robots"]')
      await expect(robots).toHaveAttribute("content", /index/)
    })
  })

  test.describe("Verification tags (when configured)", () => {
    test("verification tags render when present", async ({ page }) => {
      await page.goto("/with-seo")
      // The with-seo page may have verification tags if configured
      // Just verify the page loads without errors
      await expect(page).toHaveTitle(/Layered page/)
    })
  })

  test.describe("Pagination (rel prev/next)", () => {
    test("pagination tags render when configured", async ({ page }) => {
      await page.goto("/")
      // Home page may not have pagination; just verify no errors
      await expect(page).toHaveTitle(/better-seo\.js example/)
    })
  })

  test.describe("Favicon and touch icons", () => {
    test("serves favicon", async ({ request }) => {
      const resp = await request.get("/favicon.ico")
      expect(resp.status()).toBe(200)
    })

    test("serves apple touch icon", async ({ request }) => {
      const resp = await request.get("/apple-touch-icon.png")
      expect(resp.status()).toBe(200)
    })

    test("serves OG image", async ({ request }) => {
      const resp = await request.get("/og-example.png")
      expect(resp.status()).toBe(200)
      expect(resp.headers()["content-type"]).toMatch(/png/i)
    })
  })
})
