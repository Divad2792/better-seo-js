# TUI + crawl/sitemap infra — audit & implementation plan

**Purpose:** Single reference for adding a **sleek interactive CLI (TUI)** on top of the existing `@better-seo/cli`, and for **shipping sitemap / robots** in a way that matches the SEO document model.  
**Audience:** maintainers implementing PRD “operations layer” (CLI, doctor, init, crawl) without violating ARCHITECTURE boundaries.

**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) §3, §14 · [`FEATURES.md`](./FEATURES.md) L\*, W\* · [`PRD.md`](./PRD.md) §3.x crawl/syndication · [`PACKAGE.md`](../PACKAGE.md) release layout

---

## 1. Current infrastructure audit (as of this doc)

### 1.1 `@better-seo/core`

| Area              | Status                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| **SEO model**     | `createSEO`, `mergeSEO`, canonical `SEO`, JSON-LD via `serializeJSONLD`                 |
| **Meta / robots** | `meta.robots`, `defaultRobots`; rendered in tags + Next adapter                         |
| **TUI / CLI**     | **Out of scope** — zero runtime `dependencies`; must stay free of interactive libraries |

**Constraint:** Any “walkthrough when user installs core” must mean **documentation + optional `@better-seo/cli`**, not code inside core. Core install alone cannot spawn a TUI without breaking the product promise (Edge-safe, zero-dep).

### 1.2 `@better-seo/cli` (`packages/better-seo-cli`)

| Command                      | Behavior                                                   | Interactive?  |
| ---------------------------- | ---------------------------------------------------------- | ------------- |
| `og`                         | Flags + positionals → `@better-seo/assets` `generateOG`    | No            |
| `icons`                      | Flags + positionals → `generateIcons`                      | No            |
| `doctor`                     | Basic env check (`--json`)                                 | No            |
| `init`                       | Prints install lines + snippet (`--framework next\|react`) | No            |
| `migrate`                    | `from-next-seo` hint text                                  | No            |
| _(default, no args)_         | TTY + not CI → **Clack launcher**; else help, exit `1`     | **Yes (TTY)** |
| `crawl` `robots` / `sitemap` | Writes files via **`@better-seo/crawl`** `render*`         | No            |

**Gap (remaining):** Launcher could grow richer **project detection** / **doctor** depth; **sitemap index** and **hreflang** remain library roadmap items.

### 1.3 `@better-seo/crawl` (`packages/better-seo-crawl`)

| Export                                    | Role                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `renderRobotsTxt(opts)`                   | UTF-8 **robots.txt** body from rules + optional `Sitemap:` lines + optional `Host:`                |
| `renderSitemapXml(entries)`               | Single **urlset** document (`loc`, optional `lastmod`, `changefreq`, `priority`) with XML escaping |
| `defaultSitemapUrlFromSEO(seo, baseUrl?)` | Heuristic `https://<origin>/sitemap.xml` from absolute canonical or `baseUrl`                      |

**Tests:** [`packages/better-seo-crawl/src/crawl.test.ts`](../packages/better-seo-crawl/src/crawl.test.ts)

**Gaps (not implemented yet):**

- **Sitemap index** (`sitemapindex`) for large sites / split maps
- **hreflang** `<xhtml:link>` inside url entries (spec extension)
- **RSS/Atom**, **llms.txt** (PRD later waves)
- **Discovered URLs** from filesystem or build manifest (framework-specific)
- **CLI subcommand** `better-seo crawl robots|sitemap` writing files — **done** in `@better-seo/cli`
- **Official Next.js / Vite recipes** for `app/robots.ts`, `app/sitemap.ts`, or static `public/`

**Dependency:** package depends on **`@better-seo/core`** for the `SEO` type on `defaultSitemapUrlFromSEO` only — pure builders otherwise.

### 1.4 Adapters (`@better-seo/next`, `@better-seo/react`)

| Area      | Sitemap / robots                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| **Next**  | `Metadata` maps `robots`; sitemap **not** auto-generated from `SEO` (by design: URLs are app routing concern) |
| **React** | Helmet props; same story                                                                                      |

**Principle (PRD / ARCHITECTURE):** Crawl artifacts **derive** from the same **`baseUrl` / canonical** story as metadata so they do not drift. The **source of truth** for “which URLs exist” remains the **app’s routes or a supplied URL list**, not a hidden crawler inside core.

---

## 2. How we provide sitemap / robots to the user (target model)

**Library surface (already / planned):**

1. **Programmatic (Node / build):**  
   `import { renderRobotsTxt, renderSitemapXml, defaultSitemapUrlFromSEO } from "@better-seo/crawl"`  
   Pass entries from: file glob of routes, CMS export, Next `getStaticPaths` output, etc.

2. **Next.js App Router (recipe):**
   - `app/robots.ts` → `renderRobotsTxt({ sitemap: `${baseUrl}/sitemap.xml` })`
   - `app/sitemap.ts` (or static generation step) → build `SitemapUrlEntry[]` and return `renderSitemapXml` or use Next’s native `MetadataRoute.Sitemap` **fed from** the same entries your app uses for pages

3. **Static / CI:**  
   Script: `node scripts/write-crawl.mjs` writes `public/robots.txt` and `public/sitemap.xml` at build time.

4. **Future CLI:**  
   `better-seo crawl robots --out public/robots.txt --sitemap https://...`  
   `better-seo crawl sitemap --out public/sitemap.xml --from routes.json`

**What we do _not_ do in v1:** Run a headless browser crawler in core or default CLI; that belongs in optional tooling with clear security and rate-limit docs.

---

## 3. TUI / interactive-by-default design

### 3.1 Product rule

- **Interactive default:** When the user runs `better-seo` **with no subcommand** and **stdout is a TTY** (and not `CI=true`), launch the **launcher TUI** (pick: Quick start, OG, Icons, Crawl stubs, Doctor, Init, Exit).
- **Non-interactive / CI:** Preserve current behavior: require explicit subcommand **or** set `BETTER_SEO_CI=1` / `--no-interactive` / `-y` global flag → print help or run single-shot flags only.
- **Backward compatibility:** `better-seo og ...` and `better-seo icons ...` unchanged.

### 3.2 Stack options (recommendation)

| Option                                                       | Pros                                              | Cons                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [**@clack/prompts**](https://github.com/bombshell-dev/clack) | Small, “sleek” spinners/steps, great DX, no React | Not a full dashboard TUI                                                                            |
| **ink** + **ink-select-input**                               | Rich React-based TUI                              | Heavier bundle; React already in `@better-seo/assets` for OG JSX, but adding to CLI pulls more deps |
| **@inquirer/prompts**                                        | Mature                                            | Slightly heavier UI than clack                                                                      |

**Recommendation:** Start with **`@clack/prompts`** (+ optional `picocolors` for accents) inside `@better-seo/cli` only. Revisit **ink** if you need live layouts / multi-panel dashboards later.

### 3.3 Wizard flows (MVP → full)

**MVP (phase A)**

1. **Welcome** → detect framework from `package.json` (optional `next`, `react`, `vite` heuristics).
2. **Install reminder** → print `npm i @better-seo/core @better-seo/next` (or react) if deps missing.
3. **Actions menu:** Generate OG image · Generate icons · Show init snippet · Run doctor · (disabled) Sitemap — “see docs”.
4. **OG / Icons** → reuse existing `runOg` / `runIcons` by collecting answers via `text` / `select` / `confirm` then call the same functions (refactor shared “core logic” vs “argv parsing”).

**Phase B**

- **Crawl submenu:** “Generate robots.txt” / “Generate sitemap.xml” — optional dependency on `@better-seo/crawl` (add as **optional** or **peer** on CLI if you want to avoid forcing crawl install for asset-only users; otherwise add `@better-seo/crawl` as direct dep of CLI).
- **Write files** to `public/` with confirm path.

**Phase C (PRD alignment)**

- **`doctor`**: structured checks (versions, peer deps, adapter registered).
- **`migrate`**: interactive Q&A + optional codemod hooks.
- **Telemetry off by default**, documented env flags.

### 3.4 Code structure (integration into existing CLI)

```
packages/better-seo-cli/src/
  cli.ts                 # unchanged thin entry
  run-cli.ts             # router: TTY + no args → runLauncher(); else existing
  launch-interactive.ts  # NEW: clack steps, calls into runOg/runIcons/...
  doctor.ts / init.ts    # optional: split from run-cli if file grows
```

**Refactor requirement:** Extract **`runOg` / `runIcons`** argument building from pure argv → allow **programmatic options objects** invoked by both `parseArgs` path and TUI path (avoid duplicating validation).

**Tests:**

- Unit: launcher with **mocked** `process.stdout.isTTY` and mocked clack.
- Keep existing Vitest for argv paths.
- Smoke: `better-seo` in non-TTY still prints help.

---

## 4. `@better-seo/crawl` roadmap (aligned with user delivery)

| Priority | Task                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| P0       | Docs: `docs/recipes/sitemap-robots-next.md` — **robots.ts** + **sitemap** using `render*` + shared `baseUrl` |
| P1       | CLI: `better-seo crawl robots` / `sitemap` (file output) OR document-only until CLI ship                     |
| P2       | Optional helpers: `entriesFromSEOList(seoPages[])` if product wants canonical merge                          |
| P3       | Sitemap index, hreflang, RSS (FEATURES W\*)                                                                  |

---

## 5. Changesets / publishing

- TUI deps bump **`@better-seo/cli`** (patch/minor).
- If CLI gains optional `@better-seo/crawl` dependency, declare version in workspace and changeset both packages when APIs change.
- **Never** add TUI deps to `@better-seo/core`.

---

## 6. Security & audit notes

- **to-ico** transitive audit issues remain in `@better-seo/assets`; TUI does not fix that — track replacement separately.
- Interactive CLI must **not** execute arbitrary shell from user input; only validated paths and npm **display** strings.

---

## 7. Checklist (implementation order)

- [x] Refactor `runOg` / `runIcons` to accept option structs + shared validation → `cli-execute.ts` (`executeOg` / `executeIcons`)
- [x] Add `@clack/prompts` (or chosen stack) to `@better-seo/cli`
- [x] Implement `launch-interactive.ts` + TTY gate in `runCli`
- [x] Global `--no-interactive` / `-y` / `--yes` + env `CI`, `BETTER_SEO_CI`, `BETTER_SEO_NO_TUI`
- [x] Update `packages/better-seo-cli/README.md` + root README (CLI callout)
- [x] Add recipe doc: `docs/recipes/sitemap-robots-next.md`
- [x] Wire CLI `crawl` subcommands to `@better-seo/crawl`
- [x] Vitest: TTY launcher (mocked Clack), crawl writes, built `dist/cli.cjs` crawl smoke

---

## 8. Summary

| Question                    | Answer                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sleek TUI “by default”?** | Yes, but **only in `@better-seo/cli`**, when no subcommand + TTY; core stays zero-dep.                                                       |
| **Sitemap today?**          | **`@better-seo/crawl`** exposes **string builders**; users wire them in **routes or build scripts**; no magic crawl in core.                 |
| **What’s missing?**         | Sitemap **index**, **hreflang**, RSS / **llms.txt** (later waves); deeper `doctor` checks. TUI + crawl CLI **shipped** in `@better-seo/cli`. |

This file should be updated when the first TUI PR lands (checklist ticks + actual command names).
