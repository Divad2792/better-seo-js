# Contributing

Thanks for helping improve **better-seo.js**. Product direction and architecture live in [`internal-docs/`](./internal-docs/); packaging and release flow in [**PACKAGE.md**](./PACKAGE.md).

## Prerequisites

- **Node.js** LTS (see root `engines` in `package.json` when added)
- **npm** (default for this repo)

## Getting started

```bash
git clone https://github.com/0xMilord/better-seo-js.git
cd better-seo-js
npm ci
npm run build
npm run test
```

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
4. Update **internal docs** only when behavior or public API changes (see **PRD / ARCHITECTURE / FEATURES / Roadmap**)

## Code style

Match existing patterns in the package you touch. The core package must stay **runtime dependency-free** unless **ARCHITECTURE** is explicitly updated.

## Questions

Open a **Discussion** or issue (non-security); for security, see [**SECURITY.md**](./SECURITY.md).
