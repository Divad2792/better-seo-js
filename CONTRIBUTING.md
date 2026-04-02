# Contributing

Thanks for helping improve **better-seo.js**. Packaging and release flow: [**PACKAGE.md**](./PACKAGE.md).

**Maintainer specs** (same repo): public guides live under **`docs/`** (and the **Nextra** site in **`apps/docs`**). **`internal-docs/`** holds **PRD**, **ARCHITECTURE**, **FEATURES**, **Roadmap**, **PROGRESS**, **USAGE**, TUI/crawl plans, and similar — open those files locally after clone.

## Prerequisites

- **Node.js 24.x LTS** — root [`package.json`](./package.json) sets `"engines": { "node": ">=24.0.0" }`. CI uses **24** (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)). Local dev should match to avoid `EBADENGINE` warnings and subtle tooling drift.
- **npm** (bundled with Node; default for this repo)

### Install Node 24 (Windows — winget)

Use the **OpenJS Node.js LTS** manifest (**24.x** as of 2026; `winget search OpenJS.NodeJS` shows **LTS** vs **Current**).

```powershell
winget install -e --id OpenJS.NodeJS.LTS
```

Do **not** use bare `OpenJS.NodeJS` for this repo: that manifest is **Current** (newer major, e.g. **25.x**) and will not match **`engines`: `>=24`**.

Close and reopen the terminal, then confirm:

```powershell
node -v   # expects v24.x.x
npm -v
```

Alternative: install [nodejs.org](https://nodejs.org/) **24 LTS**, or use **nvm-windows** / **fnm** with [`.nvmrc`](./.nvmrc) (`24`).

## Getting started

```bash
git clone https://github.com/0xMilord/better-seo-js.git
cd better-seo-js
npm ci
npm run build
npm run test
```

Keep **`size-limit`** and **`@size-limit/file`** on the **same major** (npm `peer`); mismatched versions break **`npm ci`** in GitHub Actions (**Security**, **Release**, **CI**).

### `package-lock.json` and CI

**Release** and **CI** run **`npm ci`**, which requires **`package-lock.json`** to match **every** workspace **`package.json`**. If you add or bump dependencies, run **`npm install`** at the repo root and **commit the updated lockfile** in the same PR. Otherwise Actions fails with errors like `Invalid: lock file's @types/node@…` or `picomatch@… does not satisfy`.

## Documentation site (Nextra)

- **Markdown source:** repository-root **`docs/`** (getting started, concepts, API stubs, recipes, CLI, etc.).
- **Site app:** **`apps/docs`** — Next.js + Nextra; syncs `docs/` → `content/` on **`predev`** / **`prebuild`**; **`@better-seo/next`** is used for default metadata + JSON-LD (dogfood).
- **Local preview:** after `npm run build` from the root, run `npm run dev -w better-seo-docs-site` (port **3004**) or `cd apps/docs && npm run dev`.

### USAGE ↔ public docs (contract)

When behavior or guidance changes around **`initSEO`**, **`createSEOContext`**, **`@better-seo/core/node`**, Edge / multi-tenant boundaries, **`validateSEO`**, or structured errors, update **both**:

1. **`internal-docs/USAGE.md`** (maintainer truth + error tables), and
2. **`docs/concepts/config-and-context.md`** and any affected **`docs/getting-started/`** pages.

The concept page links to **USAGE** on GitHub for readers who want the full depth; keep the story consistent so evaluators and contributors do not see conflicting advice.

## Commit messages (Conventional Commits)

PRs are checked in CI so every commit follows **[Conventional Commits](https://www.conventionalcommits.org/)**. Locally, **Husky** runs **commitlint** on `commit-msg`.

- **Guide:** [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md)
- **Interactive prompt** (type, scope, emoji via **cz-git**): `npm run commit` (prefer this over ad-hoc `git commit -m "…"`)

**Version bumps** still come from **Changesets**, not from commit types—see below.

## Formatting & git hooks

- **Prettier:** `npm run format` (write) / `npm run format:check` (CI gate via `npm run check`).
- **Pre-commit:** **lint-staged** runs **ESLint --fix** on `packages/*` and **Prettier** on staged `ts/tsx` + common config formats (see root **`package.json`** → `lint-staged`).

## Changesets (required for versioned packages)

Any change that should appear in **CHANGELOG** and trigger a **semver** bump must include a **Changeset**:

```bash
npm run changeset
```

Commit the generated `.changeset/*.md` with your PR. Maintainers merge **Version Packages** PRs and CI publishes to npm—see **PACKAGE.md §5–§7**.

## Pull requests

1. Branch from **`main`**: `feat/short-name` or `fix/short-name`
2. Keep commits focused; prefer **one logical change** per PR
3. Ensure **`npm run check`** passes before every push (build, **Prettier**, lint, types, **unit tests + coverage**). Run **`npm run ci`** when you can (adds **Playwright** on `examples/nextjs-app` and **size-limit** on core). Use **`npm run commitlint:last`** to lint the latest commit message.
4. Update **internal docs** and **`docs/`** when behavior or public API changes (see **PRD / ARCHITECTURE / FEATURES / Roadmap** and **USAGE ↔ public docs** above)

## Code style

Match existing patterns in the package you touch. The core package must stay **runtime dependency-free** unless **ARCHITECTURE** is explicitly updated.

## Questions

Open a **Discussion** or issue (non-security); for security, see [**SECURITY.md**](./SECURITY.md).
