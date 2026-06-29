#!/usr/bin/env node
/**
 * Starts `next dev` with a clean .next when CSS cache is broken.
 * Broken state: HTML references app/layout.css but the file is missing —
 * page renders as unstyled plain text.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const NEXT_DIR = ".next";
const DEV_CSS = path.join(NEXT_DIR, "static/css/app/layout.css");
const DEV_CSS_DIR = path.join(NEXT_DIR, "static/css/app");

function isBrokenCssCache() {
  if (!fs.existsSync(NEXT_DIR)) return false;

  if (fs.existsSync(DEV_CSS_DIR) && !fs.existsSync(DEV_CSS)) {
    return true;
  }

  // Partial wipe: .next exists but no CSS at all (common after build + stale dev).
  const cssRoot = path.join(NEXT_DIR, "static/css");
  if (fs.existsSync(NEXT_DIR) && fs.existsSync(cssRoot)) {
    const entries = fs.readdirSync(cssRoot);
    const hasAnyCss =
      entries.some((e) => e.endsWith(".css")) ||
      (fs.existsSync(DEV_CSS_DIR) &&
        fs.readdirSync(DEV_CSS_DIR).some((e) => e.endsWith(".css")));
    if (!hasAnyCss && fs.existsSync(path.join(NEXT_DIR, "BUILD_ID"))) {
      return true;
    }
  }

  return false;
}

if (isBrokenCssCache()) {
  console.log("[dev] Clearing broken .next cache (CSS was missing)…");
  fs.rmSync(NEXT_DIR, { recursive: true, force: true });
}

const port = process.env.PORT ?? "3000";
const child = spawn("npx", ["next", "dev", "-p", port], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
