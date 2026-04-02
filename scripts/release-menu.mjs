#!/usr/bin/env node
/**
 * Interactive release helper: CI, changeset, version, publish — one entrypoint.
 * See PACKAGE.md §5 and npm run release.
 */
import { spawnSync } from "node:child_process"
import * as readline from "node:readline/promises"
import process from "node:process"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function runNpm(script) {
  const r = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

function runNpx(args) {
  const r = spawnSync("npx", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

async function menu() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  better-seo.js — release (Changesets + npm)                      ║
╚══════════════════════════════════════════════════════════════════╝

  Typical flow:
    ① Add changeset(s) on a branch → merge PR to main with docs commit.
    ② CI opens “Version Packages” PR, or you run (3) locally and push.
    ③ After versions are on main with no pending .changeset/*.md → publish.

  Pick an action:
`)

  const choice = await rl.question(`  1  Full CI (check + e2e + size) — same as npm run ci
  2  Add changeset (pick packages + patch/minor/major) — npm run changeset
  3  Version packages (bump package.json + CHANGELOGs) — npm run release:version
  4  Publish to npm (runs CI first, then changeset publish) — npm run release:publish
  5  Guided: 2 → 3 (then you commit & push; publish via CI or run 4)
  0  Exit

  Enter 1–5 or 0: `)

  const n = choice.trim()
  switch (n) {
    case "1":
      runNpm("ci")
      break
    case "2":
      runNpm("changeset")
      break
    case "3":
      runNpm("release:version")
      console.log("\nNext: git add . && git commit (conventional) && git push")
      break
    case "4":
      runNpm("release:publish")
      break
    case "5":
      runNpm("changeset")
      runNpm("release:version")
      console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  Next steps                                                       ║
╚══════════════════════════════════════════════════════════════════╝
  git status
  git add package.json package-lock.json packages/**/package.json .changeset CHANGELOG.md '**/CHANGELOG.md'
  npm run commit   # or: git commit -m "chore: version packages"
  git push origin main

  Publishing:
  • With GitHub: merge to main; .github/workflows/release.yml runs publish when ready.
  • Local: npm run release → 4 (needs npm login + packages not private).
`)
      break
    case "0":
      break
    default:
      console.error("Unknown choice:", n)
      process.exit(1)
  }
  rl.close()
}

menu().catch((e) => {
  console.error(e)
  process.exit(1)
})
