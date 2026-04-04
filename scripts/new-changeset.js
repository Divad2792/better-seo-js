#!/usr/bin/env node

/**
 * Interactive changeset creator for @better-seo/* monorepo.
 *
 * Usage:
 *   node scripts/new-changeset.js
 *
 * Prompts for bump type, package(s), and summary.
 * Generates a properly formatted .changeset/*.md file.
 */

const fs = require("fs")
const path = require("path")
const readline = require("readline")

const CHANGES_DIR = path.join(__dirname, "..", ".changeset")
const PACKAGES_DIR = path.join(__dirname, "..", "packages")

// Discover publishable packages
function getPublishablePackages() {
  const packages = []
  const dirs = fs.readdirSync(PACKAGES_DIR)
  for (const dir of dirs) {
    const pkgPath = path.join(PACKAGES_DIR, dir, "package.json")
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
      if (!pkg.private) {
        packages.push({ name: pkg.name, dir })
      }
    }
  }
  return packages
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(q) {
  return new Promise((resolve) => rl.question(q, resolve))
}

function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

async function main() {
  const packages = getPublishablePackages()

  console.log("\n📝 New changeset\n")
  console.log("─".repeat(40))

  // 1. Pick bump type
  console.log("\nWhat changed?")
  console.log("  [1] patch  — bug fix, no API change")
  console.log("  [2] minor  — new feature, backward compatible")
  console.log("  [3] major  — breaking change")
  console.log("  [4] none   — docs / chore / test only")

  const choice = await question("\nType a number: ")
  const typeMap = { 1: "patch", 2: "minor", 3: "major", 4: "none" }
  const bumpType = typeMap[choice.trim()] || "patch"

  // 2. Pick package(s)
  if (bumpType !== "none") {
    console.log("\nWhich package(s)?")
    packages.forEach((p, i) => {
      console.log(`  [${i + 1}] ${p.name}`)
    })
    console.log(`  [a] all packages`)

    const pkgChoice = await question("\nType number(s), comma-separated, or 'a': ")

    let selectedPkgs = []
    if (pkgChoice.trim().toLowerCase() === "a") {
      selectedPkgs = packages.map((p) => p.name)
    } else {
      const indices = pkgChoice
        .split(",")
        .map((s) => parseInt(s.trim()) - 1)
        .filter((n) => !isNaN(n) && n >= 0 && n < packages.length)
      selectedPkgs = indices.map((i) => packages[i].name)
    }

    if (selectedPkgs.length === 0) {
      console.log("⚠️  No packages selected. Using core as default.")
      selectedPkgs = ["@better-seo/core"]
    }

    // 3. Summary
    const summary = await question("\nSummary: ")
    if (!summary.trim()) {
      console.log("❌ Summary is required.")
      rl.close()
      process.exit(1)
    }

    // Generate file
    const id = generateId()
    const fileName = `${id}.md`
    const filePath = path.join(CHANGES_DIR, fileName)

    if (!fs.existsSync(CHANGES_DIR)) {
      fs.mkdirSync(CHANGES_DIR, { recursive: true })
    }

    const frontmatter = selectedPkgs.map((p) => `"${p}": ${bumpType}`).join("\n")
    const content = `---\n${frontmatter}\n---\n\n${summary.trim()}\n`

    fs.writeFileSync(filePath, content)
    console.log(`\n✅ File: .changeset/${fileName}`)
    console.log(`   Type: ${bumpType}`)
    console.log(`   Packages: ${selectedPkgs.join(", ")}`)
  } else {
    // none type — still need a file for changesets to not skip the version PR
    const summary = await question("\nSummary: ")
    if (!summary.trim()) {
      console.log("⚠️  No summary. Skipping changeset creation.")
      rl.close()
      process.exit(0)
    }

    const id = generateId()
    const fileName = `${id}.md`
    const filePath = path.join(CHANGES_DIR, fileName)

    if (!fs.existsSync(CHANGES_DIR)) {
      fs.mkdirSync(CHANGES_DIR, { recursive: true })
    }

    // Write a changeset with no package bumps (none type)
    // Changesets needs at least one package — use core with patch
    const content = `---\n"@better-seo/core": patch\n---\n\n${summary.trim()}\n`

    fs.writeFileSync(filePath, content)
    console.log(`\n✅ File: .changeset/${fileName} (none — chore only)`)
  }

  rl.close()
  console.log("\nDone. Commit this file with your changes and open a PR to develop.\n")
}

main().catch((err) => {
  console.error("Error:", err.message)
  rl.close()
  process.exit(1)
})
