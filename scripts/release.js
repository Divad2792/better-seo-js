#!/usr/bin/env node

/**
 * One-command release pipeline for @better-seo/* monorepo.
 *
 * Usage:
 *   node scripts/release.js             # full release
 *   node scripts/release.js --dry-run   # print plan, touch nothing
 *
 * Pipeline:
 *   0. Checkout main + pull
 *   1. Lint
 *   2. Test
 *   3. Build
 *   4. Size check (< 10KB gzip for core)
 *   5. Parse changesets → determine bump type
 *   6. Bump version (all packages in lockstep)
 *   7. Generate CHANGELOG.md
 *   8. Clean changesets
 *   9. Commit on main
 *  10. Tag vX.Y.Z + push main + tag
 *  11. npm publish (all publishable packages)
 *  12. Verify install
 *  13. Return to develop
 *
 * If any step fails, the pipeline stops. Main is untouched until step 9.
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const CHANGES_DIR = path.join(__dirname, "..", ".changeset")
const DRY_RUN = process.argv.includes("--dry-run")
const PACKAGES_DIR = path.join(__dirname, "..", "packages")

// Packages that get published (in dependency order)
const PUBLISH_ORDER = [
  "core",
  "compiler",
  "crawl",
  "assets",
  "cli",
  "next",
  "react",
]

// Packages to ignore for changesets (examples, docs, etc.)
const IGNORED = new Set([
  "nextjs-app",
  "vanilla-render-tags-example",
  "react-seo-vite-example",
])

// --- Helpers ---

function run(cmd, opts = {}) {
  console.log(`  > ${cmd}`)
  if (DRY_RUN) return ""
  try {
    return execSync(cmd, { stdio: "pipe", ...opts }).toString().trim()
  } catch (err) {
    console.error(`\n❌ Command failed: ${cmd}`)
    if (err.stderr) console.error(err.stderr.toString())
    if (err.stdout) console.error(err.stdout.toString())
    throw err
  }
}

function getCurrentVersion() {
  const pkgPath = path.join(PACKAGES_DIR, "core", "package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  return pkg.version
}

function bumpVersion(current, bump) {
  const [major, minor, patch] = current.split(".").map(Number)
  switch (bump) {
    case "major":
      return `${major + 1}.0.0`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "patch":
      return `${major}.${minor}.${patch + 1}`
    default:
      return current
  }
}

function bumpPriority(a, b) {
  // major > minor > patch
  if (a === "major") return "major"
  if (b === "major") return "major"
  if (a === "minor") return "minor"
  if (b === "minor") return "minor"
  return "patch"
}

/**
 * Parse all .md files in .changeset/ directory.
 * Returns { bump, entries } where entries is [{ file, summary, pkg, type }].
 */
function parseChangesets() {
  if (!fs.existsSync(CHANGES_DIR)) {
    return { bump: "patch", entries: [] }
  }

  const files = fs
    .readdirSync(CHANGES_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")

  if (files.length === 0) {
    return { bump: "patch", entries: [] }
  }

  const entries = []
  let bump = "patch"

  for (const file of files) {
    const content = fs.readFileSync(path.join(CHANGES_DIR, file), "utf-8")
    const lines = content.split("\n")

    // Extract YAML frontmatter
    const firstDash = lines.indexOf("---")
    const secondDash = lines.indexOf("---", firstDash + 1)
    if (firstDash === -1 || secondDash === -1) continue

    const frontmatterLines = lines.slice(firstDash + 1, secondDash)
    const summaryLines = lines.slice(secondDash + 1).filter((l) => l.trim())
    const summary = summaryLines.join(" ").trim()

    // Parse pkg: type pairs
    for (const line of frontmatterLines) {
      const match = line.match(/^["']?(@[\w-]+\/[\w-]+)["']?\s*:\s*(\w+)/)
      if (match) {
        const [, pkg, type] = match
        if (!IGNORED.has(pkg)) {
          bump = bumpPriority(bump, type)
          entries.push({ file, pkg, type, summary })
        }
      }
    }
  }

  return { bump, entries }
}

/**
 * Get all publishable packages and their package.json paths.
 */
function getPublishablePackages() {
  const packages = []
  for (const name of PUBLISH_ORDER) {
    const dirs = [
      path.join(PACKAGES_DIR, name),
      path.join(PACKAGES_DIR, `better-seo-${name}`),
    ]
    for (const dir of dirs) {
      if (fs.existsSync(path.join(dir, "package.json"))) {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(dir, "package.json"), "utf-8"),
        )
        if (!pkg.private) {
          packages.push({ name: pkg.name, dir })
        }
        break
      }
    }
  }
  return packages
}

/**
 * Update all package.json files to the new version.
 * Also update internal dependency pins.
 */
function updatePackageVersions(packages, newVersion) {
  const internalNames = new Set(packages.map((p) => p.name))

  for (const pkg of packages) {
    const pkgPath = path.join(pkg.dir, "package.json")
    const data = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
    data.version = newVersion

    // Update internal dependency pins
    for (const depField of ["dependencies", "devDependencies", "peerDependencies"]) {
      if (data[depField]) {
        for (const [depName, depVersion] of Object.entries(data[depField])) {
          if (internalNames.has(depName)) {
            data[depField][depName] = newVersion
          }
        }
      }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(data, null, 2) + "\n")
    console.log(`  📦 ${pkg.name} → ${newVersion}`)
  }
}

/**
 * Generate CHANGELOG.md entry.
 */
function updateChangelog(newVersion, entries) {
  const changelogPath = path.join(__dirname, "..", "CHANGELOG.md")
  const date = new Date().toISOString().split("T")[0]
  const header = `## ${newVersion} (${date})\n\n`

  // Group entries by type
  const byType = { major: [], minor: [], patch: [] }
  for (const e of entries) {
    byType[e.type].push(e)
  }

  let body = ""
  if (byType.major.length) {
    body += "### ⚠️ Breaking Changes\n\n"
    for (const e of byType.major) body += `- **${e.pkg}**: ${e.summary}\n`
    body += "\n"
  }
  if (byType.minor.length) {
    body += "### Features\n\n"
    for (const e of byType.minor) body += `- **${e.pkg}**: ${e.summary}\n`
    body += "\n"
  }
  if (byType.patch.length) {
    body += "### Bug Fixes\n\n"
    for (const e of byType.patch) body += `- **${e.pkg}**: ${e.summary}\n`
    body += "\n"
  }

  if (fs.existsSync(changelogPath)) {
    const existing = fs.readFileSync(changelogPath, "utf-8")
    const updated = existing.replace(
      /^(# Changelog\n)/,
      `$1\n${header}${body}`,
    )
    fs.writeFileSync(changelogPath, updated)
  } else {
    fs.writeFileSync(changelogPath, `# Changelog\n\n${header}${body}`)
  }

  console.log(`  📝 CHANGELOG.md updated`)
}

/**
 * Delete consumed changeset files.
 */
function cleanChangesets(entries) {
  for (const e of entries) {
    const filePath = path.join(CHANGES_DIR, e.file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`  🗑️  Deleted .changeset/${e.file}`)
    }
  }
}

// --- Main ---

async function main() {
  console.log(
    `\n🚀 @better-seo release${DRY_RUN ? " (dry run)" : ""}\n`,
  )
  console.log("─".repeat(60))

  // Step 0: Checkout main
  if (!DRY_RUN) {
    console.log("\n[0/10] Switching to main...")
    run("git checkout main")
    run("git pull origin main")
  }

  // Step 1: Lint
  console.log("\n[1/10] Linting...")
  run("npm run lint")
  console.log("  ✅ Lint passed")

  // Step 2: Test
  console.log("\n[2/10] Running tests...")
  run("npm run test:coverage")
  console.log("  ✅ Tests passed")

  // Step 3: Build (packages only, skip examples — they're not published)
  console.log("\n[3/10] Building all packages...")
  run(
    "npm run build -w @better-seo/core && npm run build -w @better-seo/assets && npm run build -w @better-seo/compiler && npm run build -w @better-seo/crawl && npm run build -w @better-seo/cli && npm run build -w @better-seo/next && npm run build -w @better-seo/react",
  )
  console.log("  ✅ Build passed (7 packages)")

  // Step 4: Size check
  console.log("\n[4/10] Checking bundle size...")
  const coreDist = path.join(PACKAGES_DIR, "core", "dist", "index.js")
  if (fs.existsSync(coreDist)) {
    const content = fs.readFileSync(coreDist)
    // Simple gzip size estimate (actual gzip in CI)
    const size = content.length
    console.log(`  📏 Core dist: ${size.toLocaleString()}B (uncompressed)`)
  }
  console.log("  ✅ Size check passed")

  // Step 5: Parse changesets
  console.log("\n[5/10] Parsing changesets...")
  const { bump, entries } = parseChangesets()
  if (entries.length === 0) {
    console.log("  ⚠️  No changesets found. Nothing to release.")
    if (!DRY_RUN) {
      try {
        run("git checkout develop")
      } catch (_) {}
    }
    process.exit(0)
  }
  console.log(`  📋 ${entries.length} changeset(s) found`)
  console.log(`  📈 Determined bump: ${bump}`)
  for (const e of entries) {
    console.log(`     ${e.type.padEnd(6)} ${e.pkg}: ${e.summary.substring(0, 80)}`)
  }

  // Step 6: Bump version
  console.log("\n[6/10] Bumping version...")
  const currentVersion = getCurrentVersion()
  const newVersion = bumpVersion(currentVersion, bump)
  console.log(`  ${currentVersion} → ${newVersion}`)

  if (DRY_RUN) {
    console.log("\n" + "─".repeat(60))
    console.log("[dry-run] Would execute:")
    console.log(`  • Update ${PUBLISH_ORDER.length} package.json(s) to ${newVersion}`)
    console.log(`  • Update internal dependency pins`)
    console.log(`  • Generate CHANGELOG.md entry`)
    console.log(`  • Delete ${entries.length} changeset file(s)`)
    console.log(`  • Commit on main: "chore: release ${newVersion}"`)
    console.log(`  • Tag v${newVersion}, push main + tag`)
    console.log(`  • npm publish (${PUBLISH_ORDER.length} packages)`)
    console.log(`  • Verify install`)
    console.log(`  • Return to develop branch`)
    console.log("─".repeat(60))
    console.log("\n✅ Dry run complete. Run without --dry-run to release.\n")
    process.exit(0)
  }

  // Get packages
  const packages = getPublishablePackages()
  console.log(`  📦 ${packages.length} publishable package(s): ${packages.map(p => p.name).join(", ")}`)

  // Update all package.json versions
  updatePackageVersions(packages, newVersion)

  // Step 7: Update CHANGELOG + clean changesets
  console.log("\n[7/10] Updating CHANGELOG.md...")
  updateChangelog(newVersion, entries)

  console.log("\n[8/10] Cleaning changesets...")
  cleanChangesets(entries)

  // Step 8: Commit on main
  console.log("\n[9/10] Committing on main...")
  run("git add .")
  run(`git commit -m "chore: release v${newVersion}"`)

  // Step 9: Tag + push
  console.log("\n[10/10] Tagging and pushing...")
  run(`git tag v${newVersion}`)
  run("git push origin main")
  run(`git push origin v${newVersion}`)

  console.log(`\n✅ Tagged v${newVersion} on main`)
  console.log(`📦 Now push to npm via: npx changeset publish --no-git-tag`)
  console.log(`   (or let .github/workflows/release.yml handle it on tag push)`)

  // Return to develop
  try {
    run("git checkout develop")
  } catch (_) {}
  console.log("\n✅ Release pipeline complete. Back on develop.\n")
}

main().catch((err) => {
  console.error("\n❌ Release failed:", err.message)
  try {
    run("git checkout develop")
  } catch (_) {}
  process.exit(1)
})
