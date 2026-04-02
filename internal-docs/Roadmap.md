# better-seo.js — Roadmap

**Purpose:** Single **sequencing** view: **waves (phases)**, **exit criteria**, and **traceability** to every feature ID in [`FEATURES.md`](./FEATURES.md). Product intent: [`PRD.md`](./PRD.md). Boundaries and gates: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Rule:** Waves **delay** work—they **do not** cut scope. Anything in PRD / FEATURES remains planned unless explicitly moved to “Later / ongoing” below.

---

## 1. North star & global gates

| Gate               | Source                      | Requirement                                                                                                              |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Voilà**          | PRD §0                      | `seo({ title })` on **Next.js App Router** in **&lt; 60s** after install (Node reference path).                          |
| **Zero-dep core**  | ARCHITECTURE §1             | Published **`@better-seo/core`**: **`dependencies: {}`** at runtime; no required peers on core.                          |
| **One serializer** | ARCHITECTURE §7             | JSON-LD only via **`serializeJSONLD`**; adapters never hand-roll unsafe strings.                                         |
| **E2E**            | PRD §5 Wave 1, FEATURES N10 | **Playwright** on **`examples/nextjs-app`** in default CI for Next-facing changes.                                       |
| **Edge-safe**      | ARCHITECTURE §10–§13        | No **`fs` / package.json inference** in Edge bundles; **`createSEOContext` + explicit config** documented for prod/Edge. |
| **Enterprise API** | FEATURES §2                 | `createSEOContext`, explicit adapter registration, typed `.d.ts`, golden adapter tests where applicable.                 |

**Critical path (PRD §5):** **Wave 1** must be green before betting on **Wave 10** (broad `add` / `scan` / `fix`).

---

## 2. Stages overview (12 waves + ongoing)

Approximate **week labels** mirror [`PRD.md`](./PRD.md) §5; calendar is **indicative**—**dependency order** wins.

| Stage    | Wave        | Theme                            | Primary packages                                              |
| -------- | ----------- | -------------------------------- | ------------------------------------------------------------- |
| **I**    | **1**       | Core + **Next** + E2E (**gate**) | `@better-seo/core`, `@better-seo/next`, `examples/nextjs-app` |
| **II**   | **2–3**     | Assets flywheel                  | `@better-seo/assets`, `@better-seo/cli` (og, icons)           |
| **III**  | **4**       | Distribution & polish            | npm, README, examples, announcement                           |
| **IV**   | **5**       | Breadth adapters + validation    | `@better-seo/react`, core `renderTags`, `validateSEO`         |
| **V**    | **6**       | Rules / scale                    | `rules.ts`, N9, pathname recipes                              |
| **VI**   | **7**       | Content → SEO                    | C16; C17 optional package per ARCHITECTURE                    |
| **VII**  | **8**       | Trust & debug CLI                | snapshot, preview                                             |
| **VIII** | **9**       | TUI, `init`, templates, `doctor` | `@better-seo/cli`, D\* foundations                            |
| **IX**   | **10**      | Automation                       | `add`, `scan`, `fix`                                          |
| **X**    | **11**      | Design system + advanced assets  | A5, custom OG, splash depth                                   |
| **XI**   | **12**      | Crawl + migration + docs finish  | `@better-seo/crawl`, `migrate`, L7, docs                      |
| **—**    | **Ongoing** | Ecosystem                        | P4 packaged plugins, D8 playground, NX2–NX7 depth             |

---

## 3. Wave-by-wave deliverables & feature mapping

### Wave 1 — Core + Next + E2E (**SHIP OR DIE**)

**Exit (PRD):** Next App Router `metadata = seo({ title })` &lt; 60s; CI E2E; no public `any` in `.d.ts`.

| Deliverable                                                       | Feature IDs              |
| ----------------------------------------------------------------- | ------------------------ |
| Types `SEO`, `SEOConfig`, strict `JSONLD`                         | C1, C3, C5               |
| `createSEO` / `mergeSEO`, fallbacks, `schemaMerge`                | C2, N2                   |
| `serializeJSONLD`                                                 | C6, N4                   |
| Seven schema helpers + `CustomSchema`                             | C4                       |
| `registerAdapter`, `@better-seo/next`, `toNextMetadata`           | C9, N3, N7, NX1, NX3–NX6 |
| Voilà: `seo`, `withSEO`; **`useSEO`** stub or doc defer to Wave 5 | C14, V1, V2, V3\*        |
| `createSEOContext`, `initSEO` (Node inference documented)         | C12, C13, N8             |
| Plugin skeleton `defineSEOPlugin`, minimal `afterMerge`           | C10, P1                  |
| Optional **P5** `features` flags (minimal)                        | P5                       |
| Unit tests &gt; 90% core                                          | ARCHITECTURE §15         |
| `examples/nextjs-app` + Playwright                                | N10, D7                  |

\* **V3** full implementation may ship **Wave 5** with `@better-seo/react`; Wave 1 may export contract only.

**Stretch if capacity:** `seo.layout` / `seo.page` (V4) patterns documented or partial.

**Also in Wave 1 (docs/code):** **N5** (layout vs page merge + interaction with Next defaults) and **N6** (`generateMetadata` + async fetch recipes)—at least **stub recipes** in `docs/recipes` or `examples/nextjs-app` so FEATURES **N1–N10** are not “implied only.”

**Dev ergonomics (PRD §3.6 / ARCHITECTURE):** document **`detectFramework()` / `getDefaultAdapter()`** as **non-prod convenience**; enterprise path = explicit adapter (**N7**).

**Plugin hooks:** ship **minimal `afterMerge`** plus stub or full **`beforeMerge`** in Wave 1 if low cost (PRD **P1** lists both); otherwise **Wave 6** with rules.

**Optional build surface (ARCHITECTURE §10, §12):** plan **`@better-seo/core/node`** (inference, zero npm deps, Node builtins) and/or **`@better-seo/core/dev`** export for **`validateSEO`**—exact split decided at implementation time; track so Edge bundle never pulls `fs`.

---

### Wave 2 — OG generator (**HOOK**)

| Deliverable                                 | Feature IDs |
| ------------------------------------------- | ----------- |
| `@better-seo/assets` OG (Satori, templates) | A1          |
| CLI **`og`**                                | L2          |
| Built-in light/dark templates               | A1          |

---

### Wave 3 — Icons + manifest (**LOCK-IN**)

| Deliverable                                  | Feature IDs |
| -------------------------------------------- | ----------- |
| Icon pipeline + **`manifest.json`**          | A2, A3      |
| CLI **`icons`**                              | L2          |
| **`splash`**: ship here or deepen in Wave 11 | A4, L2      |

---

### Wave 4 — Publication & distribution

| Deliverable                                                                                                      | Feature IDs                                      |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| npm publish, dual ESM/CJS if needed                                                                              | ARCHITECTURE §16                                 |
| **Semver + `CHANGELOG.md` discipline**                                                                           | PRD §3.9 (internal design, release & migrations) |
| **`size-limit`** (or equivalent) on core in CI                                                                   | ARCHITECTURE §16, PRD §6.1                       |
| README + visual proof (OG, icons)                                                                                | PRD §4.4, D1                                     |
| **`examples/nextjs-app`** showcased                                                                              | D7                                               |
| Optional: early **D6** compare stub                                                                              | D6                                               |
| Begin **extra examples** per FEATURES **D7** (e.g. `react-app`, `blog-seo`, `ecommerce-seo`) as bandwidth allows | D7                                               |

---

### Wave 5 — More adapters + validation

| Deliverable                                                                | Feature IDs                   |
| -------------------------------------------------------------------------- | ----------------------------- |
| `toHelmetProps`, `useSEO` integration                                      | §6 `@better-seo/react`, V3    |
| `renderTags` complete                                                      | C7                            |
| `validateSEO` dev behavior                                                 | C8                            |
| Adapter **golden** tests                                                   | FEATURES §2, ARCHITECTURE §15 |
| Remaining adapters **stub** or **docs-only** as needed: Remix, Astro, Nuxt | §6                            |

---

### Wave 6 — Rules / SEO middleware scale

| Deliverable                                                                 | Feature IDs |
| --------------------------------------------------------------------------- | ----------- |
| `applyRules`, `SEORule`, glob (zero-dep strategy per ARCHITECTURE §11)      | C11, N9     |
| `seo.route` / explicit `routeContext` (V5); document `seo.auto` (V6) limits | V5, V6      |
| **`onRenderTags`** (P2) if vanilla path ready                               | P2          |
| Voilà **`seo.layout` / `seo.page`** (V4) if not Wave 1                      | V4          |

---

### Wave 7 — Content compiler

| Deliverable                                                                                                                          | Feature IDs       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| **`fromContent`** (string; stays in core)                                                                                            | C16               |
| **`fromMDX`**: implement per **ARCHITECTURE** as **`@better-seo/compiler`** (or peers sub path)—**not** silently adding deps to core | C17               |
| Description / OG title helpers                                                                                                       | PRD §3.9 compiler |

---

### Wave 8 — Snapshots + preview

| Deliverable                                                                                                    | Feature IDs  |
| -------------------------------------------------------------------------------------------------------------- | ------------ |
| CLI **`snapshot`**, **`--compare`**, **`--output`** (custom dir)                                               | L5, PRD §4.3 |
| CLI **`preview`**, **`--open`**; previews for **Google / Twitter / LinkedIn / Slack** (PRD §3.9 — SEO Preview) | L6           |

---

### Wave 9 — CLI TUI + `init` + templates + **`doctor`**

| Deliverable                                                                                              | Feature IDs |
| -------------------------------------------------------------------------------------------------------- | ----------- |
| `init` wizard, **`--no-interactive`**, **framework auto-detect + override** (PRD §3.9 §12)               | L1          |
| Templates blog, docs, saas, ecommerce, portfolio (**PRD §2.5** industry presets) + **`defineSEO`** (C18) | L9, C18     |
| **`template switch`**, **`template preview`**                                                            | L10, L11    |
| **`doctor`** (CI health)                                                                                 | L8          |
| TUI components                                                                                           | PRD §3.9    |
| **D1–D5** expansion (getting-started, concepts, api, recipes, cli)                                       | D1–D5       |

---

### Wave 10 — `add` / `scan` / `fix`

| Deliverable                                                            | Feature IDs |
| ---------------------------------------------------------------------- | ----------- |
| **`add`**, **`scan`**, **`fix`**, safety flags, idempotency, AST-first | L3          |
| **`analyze`** solid exit codes                                         | L4          |

---

### Wave 11 — Design system + asset depth

| Deliverable                      | Feature IDs |
| -------------------------------- | ----------- |
| Tailwind / design tokens → OG    | A5          |
| User OG templates                | A1          |
| Splash / asset matrix completion | A4          |

---

### Wave 12 — Crawl + migration + docs polish

| Deliverable                                                                 | Feature IDs               |
| --------------------------------------------------------------------------- | ------------------------- |
| **`@better-seo/crawl`**: robots, sitemap, RSS/Atom, optional `llms.txt`     | W1–W4                     |
| **`fromNextSeo`**, **`npx better-seo migrate`**                             | C15, L7                   |
| Docs: API, schema ref, **Next-first** + per-adapter recipes; **D6** compare | D3, D4, D6                |
| Pages Router depth **NX2**, i18n **NX7** as prioritized                     | NX2, NX7                  |
| **TechArticle** helper or doc via `CustomSchema`                            | FEATURES drift / PRD §2.5 |

---

### Ongoing (not wave-blocking)

| Area                                       | Feature IDs                 |
| ------------------------------------------ | --------------------------- |
| Packaged plugins **`better-seo-plugin-*`** | P4                          |
| **`extendChannels` (P3)**                  | When channel API stabilizes |
| **D8** Playground                          | Nice-to-have                |
| KPIs & adoption (PRD §6)                   | Continuous                  |

---

## 4. Full traceability — feature ID → wave(s)

Quick lookup: every **FEATURES** ID appears at least once.

| IDs             | Wave(s)                                                      |
| --------------- | ------------------------------------------------------------ |
| **N1–N10**      | 1 (N1–N8, N10), 6 (N9), 12 (NX2/NX7 tie-in)                  |
| **C1–C18**      | 1 (C1–C6, C9–C14), 5 (C7,C8), 7 (C16–C17), 9 (C18), 12 (C15) |
| **V1–V6**       | 1 (V1,V2), 5–6 (V3–V6)                                       |
| **P1–P5**       | 1 (P1,P5), 6 (P2), ongoing (P3,P4)                           |
| **NX1–NX7**     | 1 (NX1,NX3–NX6), 12 (NX2,NX7)                                |
| **§6 adapters** | 5 (primary), 12 (depth)                                      |
| **A1–A5**       | 2 (A1), 3 (A2–A4), 11 (A5 + templates)                       |
| **L1–L11**      | 2–3 (L2), 8 (L5–L6), 9 (L1,L8–L11), 10 (L3–L4), 12 (L7)      |
| **W1–W4**       | 12                                                           |
| **D1–D8**       | 4 (D6 optional), 9 (D1–D5), 12 (D3–D4,D6), ongoing (D8)      |

---

## 5. Architecture checklist (per release, especially Wave 1 + 5 + 12)

Use before tagging **stable**:

- [ ] Core **`package.json`** has no runtime **`dependencies`** (ARCHITECTURE §1).
- [ ] Edge entry: no **`fs`** / **`package.json`** read (ARCHITECTURE §10).
- [ ] **`serializeJSONLD`** used for all JSON-LD output paths (ARCHITECTURE §7).
- [ ] **Adapter contract:** **`registerAdapter` / `getAdapter`** behave per **ARCHITECTURE §8** (names may vary).
- [ ] **`renderTags`** returns stable **TagDescriptor[]** for snapshots / vanilla (ARCHITECTURE §8).
- [ ] **Runtime matrix** documented for **Workers** / browser (ARCHITECTURE §13).
- [ ] **Adapter tests:** goldens for `SEO` → Next `Metadata` (ARCHITECTURE §15).
- [ ] **E2E** green on **`examples/nextjs-app`** (PRD Wave 1).
- [ ] **Unit:** **serializeJSONLD** safety cases (`</script>`, U+2028/U+2029) where applicable (FEATURES §2, ARCHITECTURE §7).
- [ ] **Bundle** within PRD budget (~**5KB gzip** core, ARCHITECTURE §16).

---

## 6. Product & docs alignment (PRD §2.6, §8.6)

| PRD layer               | Roadmap home                      | Feature IDs |
| ----------------------- | --------------------------------- | ----------- |
| 60s funnel              | Wave **1** + docs **Wave 4/9**    | D1          |
| Core concepts & recipes | Wave **9–12**                     | D2, D4      |
| CLI as distribution     | Waves **2–3**, **8–10**           | L\*         |
| Comparison pages        | Wave **4** stub → **12** complete | D6          |

---

## 7. Later extensions (PRD §10)

CMS connectors, analytics bridges, advanced dedupe graph, internal linking advisor, per-locale OG — **after** Wave 12 unless reprioritized in PRD.

---

## 8. Success metrics (PRD §6) — measurement home

Roadmap waves deliver **features**; PRD **§6** defines **how we know it’s working.** Track continuously from first public publish (Wave **4** onward):

| Bucket        | Examples (PRD §6.1–§6.2)                                                                                                                                            | Owner           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Technical** | Core **&lt; ~5KB gzip**, **&gt;90%** core coverage, **no public `any`**, CLI startup **&lt;500ms**, OG gen **&lt;2s**, **E2E** in CI, time-to-first-SEO **&lt;60s** | Engineering     |
| **Adoption**  | npm weekly downloads, stars, public adopters, CLI usage (`add`, `scan`/`fix`)                                                                                       | GTM / community |

These are **not** a separate wave; they gate **quality** on every release.

---

## 9. Four-way alignment (audit summary)

| Source                                                                                                                                                                      | In Roadmap?    | Notes                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`FEATURES.md`](./FEATURES.md)** — all IDs **N\***, **C\***, **V\***, **P\***, **NX\***, **A\***, **L\***, **W\***, **D\***, §6 adapters                                  | **Yes**        | **§3–§4** + **§4 traceability**. **N5/N6** now explicit in Wave **1**; **D7** expanded in Wave **4**.                                                                               |
| **[`PRD.md`](./PRD.md)** — Voilà §0, goals §2, arch §3, API §4, waves §5, metrics §6, GTM §8, risks §9, later §10                                                           | **Yes**        | Waves mirror **PRD §5**; **§6 metrics → §8**; **§7 later = PRD §10**. Non-code items (positioning, competitive table) stay in PRD only—by design.                                   |
| **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — zero-dep, serializer, adapter contract, **getAdapter**, TagDescriptor, node/dev entry, runtime matrix, Workers, testing, build | **Yes**        | **§1 gates**, **§5 checklist** updated for **§7–§8, §13**; optional **`@better-seo/core/node`** / **`dev`** called out in Wave **1**.                                               |
| **Residual naming / spec tension**                                                                                                                                          | **Documented** | **`TechArticle`** (PRD §2.5 vs 7 helpers) → **Wave 12** in **§3**; **import paths** for **`fromMDX`** (PRD example vs **C17** package) → follow **ARCHITECTURE** at implement time. |

**Conclusion:** All **cataloged features** and **architectural constraints** are **represented** on the roadmap; **product narrative-only** sections remain in PRD. The four docs are **aligned** when this file’s **§3–§4** and **§9** stay updated alongside PRD/FEATURES/ARCHITECTURE changes.

---

## 10. Document index

| Doc                                    | Role                                                |
| -------------------------------------- | --------------------------------------------------- |
| [`PRD.md`](./PRD.md)                   | Why, scope, waves detail, CLI list, API examples    |
| [`FEATURES.md`](./FEATURES.md)         | Feature IDs, enterprise bar, anti-patterns          |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Packages, runtime matrix, serializer, testing       |
| [`PROGRESS.md`](./PROGRESS.md)         | **Done / partial / not started** by wave + evidence |
| [`USAGE.md`](./USAGE.md)               | Install, App Router patterns, **`SEOError` codes**  |
| **Roadmap.md** (this file)             | **When** + **ID traceability** + **alignment §9**   |

---

## 11. Monorepo baseline (P0 / Wave 1 scaffold)

The repository implements the **Wave 1 skeleton** so work stays traceable to [**FEATURES**](./FEATURES.md) **N1–N10**, [**ARCHITECTURE**](./ARCHITECTURE.md) **§3–§4**, and **§3 Wave 1** above:

| Path                      | Role                                                                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`packages/core`**       | npm **`@better-seo/core`**: zero runtime `dependencies`, **§4** module layout (`types`, `core`, `serialize`, `registry`, `plugins`, `context`, `voila`, …), **Vitest** + **size-limit**.                                                                 |
| **`packages/next`**       | **`@better-seo/next`**: `seo()`, `prepareNextSeo`, `toNextMetadata`, **`registerAdapter("next")`**; JSON-LD UI via **`@better-seo/next/json-ld`** (`NextJsonLd`) so App Router metadata stays serializable (no `undefined` fields in static `Metadata`). |
| **`examples/nextjs-app`** | Golden App Router app + **Playwright** (**N10**).                                                                                                                                                                                                        |
| **`docs/recipes/`**       | **N5** / **N6** recipes (`n5-layout-page-merge.md`, `n6-generate-metadata-async.md`) + index.                                                                                                                                                            |
| **Root tooling**          | **Prettier** (`format` / `format:check`), **lint-staged** + **Husky** `pre-commit`, **Vitest coverage** thresholds on `packages/core` + `to-next-metadata.ts`, **GitHub** issue forms (`.github/ISSUE_TEMPLATE/`).                                       |

**Commands:** root **`npm run check`** = build + **`format:check`** + lint + typecheck + **`test:coverage`** (with **lcov** under each package’s `coverage/`); **`npm run ci`** adds E2E + core **size-limit** (see root **`package.json`**).
