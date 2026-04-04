import { expect, test } from "@playwright/test"

/**
 * Better SEO.js Demo App — Playwright E2E Tests
 * Verifies all SEO surfaces work correctly across every page type.
 */
test.describe("Better SEO.js Demo — E2E", () => {
  test.describe("Home page — seo() shorthand", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/")
    })

    test("has correct title", async ({ page }) => {
      await expect(page).toHaveTitle(/Better SEO\.js — Programmable SEO/)
    })

    test("has meta description", async ({ page }) => {
      const desc = page.locator('meta[name="description"]')
      await expect(desc).toHaveAttribute("content", /complete SEO document model/)
    })

    test("has canonical link", async ({ page }) => {
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute("href", /\/$/)
    })

    test("has complete Open Graph tags", async ({ page }) => {
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Better SEO\.js/)
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website")
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Better SEO\.js")
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US")
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.png/)
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200")
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630")
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Programmable SEO/)
    })

    test("has Twitter Card tags", async ({ page }) => {
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
      await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute("content", "@better_seo_js")
      await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute("content", "@better_seo_js")
    })
  })

  test.describe("About page — createSEO + Organization + Person schema", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/about")
    })

    test("has correct title with template", async ({ page }) => {
      await expect(page).toHaveTitle(/About — Better SEO\.js \| Better SEO\.js/)
    })

    test("has JSON-LD with Organization schema", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]')
      await expect(ld).toHaveCount(1)
      const raw = await ld.textContent()
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const org = nodes.find((n: any) => n["@type"] === "Organization")
      expect(org).toBeTruthy()
      expect(org.name).toBe("Better SEO.js")
      expect(org.url).toBeTruthy()
    })

    test("has Person schema node", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const person = nodes.find((n: any) => n["@type"] === "Person")
      expect(person).toBeTruthy()
      expect(person.name).toBe("Jane Smith")
      expect(person.jobTitle).toBe("Lead Developer")
    })
  })

  test.describe("Pricing page — Product + FAQPage schema", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/pricing")
    })

    test("has correct title", async ({ page }) => {
      await expect(page).toHaveTitle(/Pricing — Better SEO\.js/)
    })

    test("has FAQPage JSON-LD", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const faq = nodes.find((n: any) => n["@type"] === "FAQPage")
      expect(faq).toBeTruthy()
      expect(faq.mainEntity).toHaveLength(3)
      expect(faq.mainEntity[0].name).toContain("free tier")
    })
  })

  test.describe("Blog listing — generateMetadata async", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/blog")
    })

    test("has correct title", async ({ page }) => {
      await expect(page).toHaveTitle(/Blog — Better SEO\.js \| Better SEO\.js/)
    })

    test("lists blog posts", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Blog")
      await expect(page.getByRole("link", { name: /Introducing Better SEO/ })).toBeVisible()
      await expect(page.getByRole("link", { name: /Why JSON-LD/ })).toBeVisible()
    })
  })

  test.describe("Blog post — dynamic route + Article + BreadcrumbList schema", () => {
    test("has article metadata and JSON-LD", async ({ page }) => {
      await page.goto("/blog/introducing-better-seo")
      await expect(page).toHaveTitle(/Introducing Better SEO\.js \| Better SEO\.js Blog/)

      const desc = page.locator('meta[name="description"]')
      await expect(desc).toHaveAttribute("content", /launching Better SEO/)

      // Article OG type
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article")
      await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", "2026-01-15")
      await expect(page.locator('meta[property="article:author"]')).toHaveAttribute("content", "Jane Smith")

      // JSON-LD with Article + BreadcrumbList
      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const article = nodes.find((n: any) => n["@type"] === "Article")
      expect(article).toBeTruthy()
      expect(article.headline).toBe("Introducing Better SEO.js")

      const breadcrumb = nodes.find((n: any) => n["@type"] === "BreadcrumbList")
      expect(breadcrumb).toBeTruthy()
      expect(breadcrumb.itemListElement).toHaveLength(3)
    })
  })

  test.describe("Products page — SoftwareApplication + customSchema", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/products")
    })

    test("has correct title", async ({ page }) => {
      await expect(page).toHaveTitle(/Products — Better SEO\.js/)
    })

    test("has SoftwareApplication JSON-LD", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const app = nodes.find((n: any) => n["@type"] === "SoftwareApplication")
      expect(app).toBeTruthy()
      expect(app.name).toBe("Better SEO.js")
      expect(app.applicationCategory).toBe("DeveloperApplication")
    })

    test("has links to individual products", async ({ page }) => {
      await expect(page.getByRole("link", { name: "@better-seo/core" })).toBeVisible()
      await expect(page.getByRole("link", { name: "@better-seo/next" })).toBeVisible()
      await expect(page.getByRole("link", { name: "@better-seo/cli" })).toBeVisible()
    })
  })

  test.describe("Product detail — dynamic route + BreadcrumbList", () => {
    test("core product page has correct schema", async ({ page }) => {
      await page.goto("/products/core")
      await expect(page).toHaveTitle(/@better-seo\/core \| Better SEO\.js/)

      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]

      const product = nodes.find((n: any) => n["@type"] === "Product")
      expect(product).toBeTruthy()
      expect(product.name).toBe("@better-seo/core")

      const breadcrumb = nodes.find((n: any) => n["@type"] === "BreadcrumbList")
      expect(breadcrumb).toBeTruthy()
      expect(breadcrumb.itemListElement).toHaveLength(3)
      expect(breadcrumb.itemListElement[2].name).toBe("@better-seo/core")
    })
  })

  test.describe("Docs page — mergeSEO + TechArticle + hreflang", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/docs")
    })

    test("has merged title with template", async ({ page }) => {
      await expect(page).toHaveTitle(/Getting Started \| Docs/)
    })

    test("has hreflang alternates", async ({ page }) => {
      const enUs = page.locator('link[rel="alternate"][hreflang="en-US"]')
      await expect(enUs).toHaveAttribute("href", /\/docs\/en$/)

      const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
      await expect(xDefault).toHaveCount(1)
    })

    test("has TechArticle JSON-LD", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]')
      const raw = await ld.textContent()
      const parsed = JSON.parse(raw as string)
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const techArticle = nodes.find((n: any) => n["@type"] === "TechArticle")
      expect(techArticle).toBeTruthy()
      expect(techArticle.headline).toBe("Getting Started with Better SEO.js")
      expect(techArticle.keywords).toContain("SEO")
    })
  })

  test.describe("Asset pipeline", () => {
    test("OG image is served", async ({ request }) => {
      const resp = await request.get("/og.png")
      expect(resp.status()).toBe(200)
      expect(resp.headers()["content-type"]).toMatch(/png/i)
    })

    test("favicon is served", async ({ request }) => {
      const resp = await request.get("/favicon.ico")
      expect(resp.status()).toBe(200)
    })

    test("apple touch icon is served", async ({ request }) => {
      const resp = await request.get("/apple-touch-icon.png")
      expect(resp.status()).toBe(200)
    })
  })

  test.describe("Navigation works", () => {
    test("all nav links are reachable", async ({ page }) => {
      await page.goto("/")
      await expect(page.getByRole("link", { name: "Home" })).toBeVisible()
      await expect(page.getByRole("link", { name: "About" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Blog" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Docs" })).toBeVisible()
    })
  })
})
