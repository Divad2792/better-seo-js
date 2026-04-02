# better-seo.js — Monorepo packaging & maintenance

How to **build**, **version**, **publish**, and **operate** this repo. Product intent: [`internal-docs/PRD.md`](./internal-docs/PRD.md). Boundaries: [`internal-docs/ARCHITECTURE.md`](./internal-docs/ARCHITECTURE.md).

---

## 1. Tooling defaults

| Choice               | Default                           | Notes                                                                                                          |
| -------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Package manager**  | **npm** (v9+)                     | Lockfile: `package-lock.json`. Documented commands use `npm run` / `npx`.                                      |
| **Alternates**       | **pnpm** / **yarn**               | Supported if the team adds `pnpm-workspace.yaml` or Yarn Berry; keep **one** lockfile policy per repo.         |
| **Registry**         | **`https://registry.npmjs.org/`** | Scoped packages: `@better-seo/next`, … — publish with npm account + **npm automation token** (GitHub Actions). |
| **Other registries** | GitHub Packages, Verdaccio, etc.  | Set **`publishConfig.registry`** per package or **`NPM_CONFIG_REGISTRY`** in CI only when needed.              |

---

## 2. Target folder structure (monorepo)

Aligned with [`internal-docs/ARCHITECTURE.md`](./internal-docs/ARCHITECTURE.md) §3–§4 and [`internal-docs/Roadmap.md`](./internal-docs/Roadmap.md).

```txt
better-seo-js/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, typecheck, test, E2E
│       ├── commitlint.yml      # Conventional Commits on PRs
│       └── release.yml         # Changesets: version PR + npm publish
├── .changeset/
│   ├── config.json
│   └── README.md               # How contributors add a changeset
├── docs/                       # Public-facing stubs (e.g. recipes for N5/N6)
├── internal-docs/              # PRD, ARCHITECTURE, FEATURES, Roadmap
├── packages/
│   ├── core/                   # npm: @better-seo/core (zero runtime deps); P0 implementation + Vitest
│   ├── next/                   # npm: @better-seo/next
│   ├── react/                  # npm: @better-seo/react (Wave 5 — Helmet + useSEO)
│   ├── assets/                 # npm: @better-seo/assets
│   ├── better-seo-compiler/    # npm: @better-seo/compiler (fromMdx + gray-matter)
│   ├── cli/                    # npm: @better-seo/cli (bin)
│   └── crawl/                  # npm: @better-seo/crawl
├── examples/
│   ├── nextjs-app/             # Golden path + Playwright (Next)
│   ├── react-seo-vite/         # Vite + @better-seo/react + Playwright (Wave 5)
│   └── vanilla-render-tags/    # Node renderTags demo (D7)
├── scripts/                    # Optional: release/version helpers
├── CHANGELOG.md                # Human-readable history (also fed by Changesets)
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── PACKAGE.md                  # This file
├── SECURITY.md
├── package.json                # Root workspace + shared devDependencies
├── eslint.config.mjs           # Flat ESLint (shared across TS packages)
└── tsconfig.base.json          # Shared TS compiler defaults (packages extend)
```

**Naming:** core ships as **`@better-seo/core`** under the npm org **`@better-seo`** (see `README.md` and `internal-docs/ARCHITECTURE.md`).

---

## 3. Root `package.json` (sketch)

Until the repo is scaffolded, treat this as the **contract** root `package.json` should fulfill:

```json
{
  "name": "better-seo-js-monorepo",
  "private": true,
  "workspaces": ["packages/*", "examples/*"],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test:e2e": "npm run test:e2e -w examples/nextjs-app",
    "changeset": "changeset",
    "release": "node scripts/release-menu.mjs",
    "release:version": "changeset version",
    "release:publish": "npm run ci && changeset publish",
    "ci": "npm run lint && npm run typecheck && npm run test && npm run test:e2e"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0"
  }
}
```

- **`release`**: interactive **Node** menu — run CI, add changeset, version, or publish (`scripts/release-menu.mjs`).
- **`release:version`**: bumps **semver** in all changed packages and updates **`CHANGELOG.md`** from accumulated Changesets (see §5).
- **`release:publish`**: runs **`npm run ci`** (full gate + E2E + size) then **`changeset publish`** (CI uses this when publishing on `main`).

You can rename scripts (e.g. **`npm run version-packages`**) as long as **GitHub Actions** call the same names.

---

## 4. Build & local commands

| Command                        | Purpose                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `npm install`                  | Install all workspaces                                                                |
| `npm run build`                | Build every package that defines `build`                                              |
| `npm run typecheck`            | TypeScript across workspaces                                                          |
| `npm run test`                 | Unit tests (Vitest, no coverage report)                                               |
| `npm run test:coverage`        | Vitest with **v8** coverage + thresholds (`packages/core`, `to-next-metadata.ts`)     |
| `npm run test:e2e`             | Playwright on `examples/nextjs-app`                                                   |
| `npm run lint`                 | ESLint in workspaces + `next lint` in the example                                     |
| `npm run format`               | Prettier `--write` (whole repo)                                                       |
| `npm run format:check`         | Prettier `--check` (runs inside **`npm run check`**)                                  |
| `npm run check`                | **Default gate:** build + **format:check** + lint + typecheck + **test:coverage**     |
| `npm run ci`                   | **`check` + E2E** + core **`size-limit`**                                             |
| `npm run commit`               | Interactive Conventional Commit (cz-git); Husky still validates plain `git commit`    |
| `npm run commitlint:last`      | Lint the latest commit (`--last`)                                                     |
| `npm run commitlint:since-tag` | Lint commits since the last git tag (fails if there is no tag yet)                    |
| `npm run changeset`            | Interactive: add a **`.changeset/*.md`** (semver + summary) for release               |
| `npm run release`              | Interactive menu: **CI**, **changeset**, **version**, **publish**, or guided chain    |
| `npm run release:version`      | Apply changesets → bump **`package.json`** + **CHANGELOG(s)** (no npm publish)        |
| `npm run release:publish`      | **`npm run ci`** then **`changeset publish`** (all publishable workspaces)            |
| `npm run publish`              | **Alias of `release:publish`** — same command **`release.yml`** uses after versioning |

**Per-package** (`packages/core`, etc.): each has its own **`package.json`** with **`exports`**, **`types`**, **`files`** (publish allowlist), and **`build`** producing `dist/` (or publish `src/` only if policy allows—prefer `dist` for clear API surfaces).

---

## 5. Semver & changelog (Changesets)

We use **[Changesets](https://github.com/changesets/changesets)** so version bumps stay **reviewable** and **`CHANGELOG.md`** stays **derived** from the same source as npm versions.

**Config:** [`.changeset/config.json`](./.changeset/config.json) — `access: public`, `baseBranch: main`, **`ignore`**: **`nextjs-app`**, **`vanilla-render-tags-example`**, **`react-seo-vite-example`** (examples are never versioned). GitHub [**`release.yml`**](.github/workflows/release.yml) runs **`release:version`** / **`release:publish`** via [changesets/action](https://github.com/changesets/action); **`workflow_dispatch`** allows manual runs.

**Internal workspace dependencies:** publishable packages and examples depend on **`@better-seo/*`** with the **same semver** as the workspace (e.g. **`"0.0.1"`**), not **`file:../…`**, so Changesets + `@manypkg` checks pass and `npm` still links to the local workspace copy.

### First-time npm publish

Packages must not be **`"private": true"`** if you want **`changeset publish`** to ship them. Publishable workspaces are **`@better-seo/core`**, **`@better-seo/next`**, **`@better-seo/assets`**, **`@better-seo/cli`** once you control the org on npm. Keep **`examples/nextjs-app`** private.

### Contributor flow

1. After a meaningful change, run:  
   `npm run changeset`  
   (or `npx changeset`)
2. Choose **semver bump** (patch / minor / major) per affected package and write a **summary** (becomes changelog entry).
3. Commit the generated file under **`.changeset/*.md`** with the feature/PR.

### Maintainer release flow (automated in CI — §7)

1. **Merge PRs** to `main` (each may include changesets).
2. **`release.yml`** opens a **“Version Packages”** PR when there are pending changesets: it runs **`changeset version`**, which:
   - bumps **`version`** in each affected `packages/*/package.json`,
   - updates **`CHANGELOG.md`** (per package or aggregated, per `.changeset/config.json`),
   - deletes consumed changeset files.
3. **Merge** the Version PR → workflow runs **`npm run release:publish`** → full **`ci`** then **`changeset publish`** → **npm publish** for non-private packages (needs **`NPM_TOKEN`**).

### Interactive menu (`npm run release`)

Same actions as above, from one terminal prompt: run **`npm run release`** and choose **1–5**. Option **5** runs **add changeset → version** and prints exact **git** commands for the version commit.

### Custom `npm run` + changelog

If you replace the default with a **custom script** (e.g. `scripts/release.mjs`):

- It must still **write semver** to each workspace **`package.json`** and append to **`CHANGELOG.md`** in a deterministic way, **or** emit Changeset-compatible data.
- **Recommendation:** keep **Changesets as source of truth** and only wrap it:

```txt
"release:version": "node scripts/custom-pre-version.js && changeset version && node scripts/custom-post-version.js"
```

Avoid duplicating semver in two systems without automation tests.

### Strict semver

Per **PRD**: breaking changes require **`CHANGELOG.md`** entries and, when possible, **`npx better-seo migrate`** (CLI). Version PRs are the right place to enforce that note in the changelog.

---

## 6. Publishing & registries

### npm (default)

1. **Create the npm organization `better-seo`** (the **`@better-seo`** scope). Scoped packages **cannot** be published until this org exists **and** your npm user (or CI token) is a **member with publish** rights. Create it at **[npm — Add Organization](https://www.npmjs.com/org/create)** (choose a unique org name; if `better-seo` is taken, you must either use that org as a member or **rename every package** in this repo to a scope you control—a large change).
2. **Token:** GitHub **Actions** need **`NPM_TOKEN`** (granular **publish** token, **not** your password), also set as **`NODE_AUTH_TOKEN`** for `setup-node`. The token’s npm user must belong to **`@better-seo`** with permission to publish packages.
3. **Provenance:** Do **not** set **`publishConfig.provenance`** in leaf packages—local **`changeset publish`** then fails with _Automatic provenance generation not supported for provider: null_ because only **GitHub Actions** (OIDC + **`id-token: write`**) can attach provenance. This repo enables it in **[`release.yml`](.github/workflows/release.yml)** via **`npm config set provenance true`** before publish.

### Publish troubleshooting

| Symptom                                                            | Likely cause                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`404 Not Found` — `Scope not found` on `PUT …/@better-seo/...`** | The **`@better-seo`** org **does not exist** on npm, or your account/token **is not a publisher** on that org. Create/join the org (see §6 above), then retry. This is **not** fixed by code changes in the repo.                                                    |
| **`403 Forbidden` / `/-/npm/v1/user`**                             | **`NPM_TOKEN`** missing, expired, wrong registry, or token lacks **publish** for **`@better-seo/*`**. Use a [granular access token](https://docs.npmjs.com/about-access-tokens) with publish to the scope; ensure **2FA** mode allows automation tokens if required. |
| **`Automatic provenance … provider: null`**                        | Publishing **locally** with **`publishConfig.provenance: true`**—remove it (as in this repo) and rely on **CI**, or run **`npm config set provenance false`** before a local publish.                                                                                |
| **`Package "…" must depend on the current version … vs file:…`**   | Internal deps must use the **workspace version** (e.g. **`0.0.1`**) instead of **`file:`** paths.                                                                                                                                                                    |
| **`npm info @better-seo/…` → 404**                                 | Expected **before** the first successful publish; Changesets only warns. After the org exists and packages are published once, these resolve.                                                                                                                        |

### Other registries

- Add **`publishConfig`** in the leaf `package.json`:

```json
"publishConfig": {
  "registry": "https://npm.pkg.github.com",
  "access": "public"
}
```

- Or set **`NPM_CONFIG_REGISTRY`** in the **release** workflow only for those jobs.

---

## 7. GitHub Actions

### CI (`.github/workflows/ci.yml`)

Triggers: **pull_request** and **push** to `main`.

- Checkout, **`npm ci`**
- **`npm run check`:** build, **Prettier**, ESLint, typecheck, **Vitest coverage** (see workspaces).
- Upload **lcov** artifacts (`packages/*/coverage/lcov.info`) for debugging regressions.
- Install **Playwright** browsers, **`npm run test:e2e`**, then **`npm run size`** (core bundle budget).

### Commitlint (`.github/workflows/commitlint.yml`)

Triggers: **pull_request** to `main` (full history via `fetch-depth: 0`).

- **`npx commitlint`** from base SHA to head SHA so every commit in the PR satisfies Conventional Commits
- Local parity: **`npm install`** enables **Husky** `commit-msg`; contributors can use **`npm run commit`** (cz-git). See [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md).

### Release (`.github/workflows/release.yml`)

Pattern: **official [Changesets + GitHub](https://github.com/changesets/action)** flow.

1. **On push to `main`:**
   - If there are **new `.changeset/*.md` files**, the action creates or updates a PR **`chore: version packages`** (title configurable) that runs **`changeset version`**.
   - That PR updates versions + changelogs; **merge it** when ready (this is the “**merge version branch with main**” step).

2. **After that PR is merged** (or on direct push to `main` if versions changed and no pending changesets):
   - Second job runs **`npm run build`** and **`changeset publish`** (need **`NPM_TOKEN`** and `NODE_AUTH_TOKEN` for npm).

**Secrets required**

| Secret         | Use                                                                 |
| -------------- | ------------------------------------------------------------------- |
| `NPM_TOKEN`    | Publish to npm                                                      |
| `GITHUB_TOKEN` | Provided by Actions; used by `changesets/action` to open Version PR |

**Optional:** **`workflow_dispatch`** to manually trigger publish after you merge the Version PR.

---

## 8. Serious-project file checklist

| File                                           | Purpose                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [**LICENSE**](./LICENSE)                       | **MIT** per PRD §11.2                                                 |
| [**SECURITY.md**](./SECURITY.md)               | Vulnerability reporting                                               |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md)       | PRs, changesets, branch naming                                        |
| [**CODE_OF_CONDUCT.md**](./CODE_OF_CONDUCT.md) | Community expectations                                                |
| [**CHANGELOG.md**](./CHANGELOG.md)             | Keep a Changelog style; maintained by Changesets                      |
| [**README.md**](./README.md)                   | Quick start, links to docs (root hero—add when implementation exists) |
| **`.github/PULL_REQUEST_TEMPLATE.md`**         | Remind: “Have you run `npm run changeset`?”                           |
| **`.github/ISSUE_TEMPLATE/*.yml`**             | Bug + feature request forms                                           |
| **`.github/COMMIT_CONVENTION.md`**             | Conventional Commits + `npm run commit`                               |
| **`commitlint.config.mjs`**                    | commitlint rules + cz-git `prompt`                                    |
| **`.husky/commit-msg`**                        | commitlint on every local commit                                      |
| **`.husky/pre-commit`**                        | **lint-staged** (ESLint + Prettier on staged files)                   |
| **`.prettierrc.json`** / **`.prettierignore`** | Repo-wide formatting; **`format:check`** in **`npm run check`**       |
| **`dependabot.yml`**                           | Dependency update PRs (npm + Actions)                                 |

Internal specs stay in **`internal-docs/`**; public contributor path starts at **README** + **CONTRIBUTING** + **PACKAGE**.

---

## 9. Branching & merges

| Branch                               | Role                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| **`main`**                           | Always releasable; **CI green**; version + publish workflows run from here          |
| **Feature branches**                 | `feat/…`, `fix/…` → PR → squash/merge to `main`                                     |
| **Changesets “Version Packages” PR** | Created by bot/action; **merge to `main`** to record release; then publish job runs |

**Rule:** do not publish from feature branches; only from **`main`** after Version PR is merged (or a tightly scoped **`release/*`** policy if you add it later).

---

## 10. Security & supply chain

- **Dependencies:** core package **`dependencies: {}`**; scan **devDependencies** in CI (`npm audit` or **OSV**).
- **Publishing:** **2FA** on npm org; **only** automation tokens in GitHub Secrets.
- **Provenance & signing:** enable when npm/org supports your workflow.

---

## 11. Links

- [Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [GitHub Action — changesets/action](https://github.com/changesets/action)

---

## 12. Current repo state

- **P0 / Wave 1 scaffold is present:** **`@better-seo/core`**, **`@better-seo/next`**, **`examples/nextjs-app`** + Playwright — see [`internal-docs/Roadmap.md`](./internal-docs/Roadmap.md) §11. Publishable workspaces are aligned at **`0.0.1`** for the first release; **`examples/nextjs-app`** and **`examples/vanilla-render-tags-example`** stay **`private: true`** (not published).
- **Wave 4 (distribution / polish):** root **README** documents OG + icon “before/after”; **`docs/compare/next-seo-vs-better-seo.md`** (**D6** stub); extra **D7** example **`examples/vanilla-render-tags`**; golden Next app wires **`@better-seo/cli`**-generated **`public/`** assets + E2E checks. **`size-limit`** still gates core in **`npm run ci`** (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
- Replace **`OWNER`** in **SECURITY.md** / **CONTRIBUTING.md** clone URLs with your GitHub org or username after the remote exists.
