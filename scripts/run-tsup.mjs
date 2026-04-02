/**
 * Run tsup from the current package directory without relying on node_modules/.bin
 * shims (Windows + spaced paths often break `tsup` / `npm exec -- tsup`).
 */
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cwd = process.cwd()

let tsupCli
try {
  tsupCli = require.resolve("tsup/dist/cli-default.js", { paths: [cwd] })
} catch {
  tsupCli = require.resolve("tsup/dist/cli-default.js", { paths: [root] })
}

const result = spawnSync(process.execPath, [tsupCli], { stdio: "inherit", cwd })
process.exit(result.status === null ? 1 : result.status)
