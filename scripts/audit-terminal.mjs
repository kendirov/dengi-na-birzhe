#!/usr/bin/env node
/** Smoke audit: terminal modes load without console errors. */

import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:3000";
const ROUTES = [
  "/stakan-lenta?mode=terminal",
  "/stakan-lenta?mode=explain&lesson=anatomy&step=0",
  "/stakan-lenta?mode=practice",
  "/stakan-lenta?mode=presenter&lesson=anatomy&step=0",
  "/stakan-lenta?mode=scenario",
  "/stakan-lenta?debug=1",
  "/stakan-lenta?debug=1&reference=1",
];

async function waitForServer(url, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server down: ${url}`);
}

async function auditRoute(page, path) {
  const errors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".cscalp-terminal", { timeout: 30000 });
  await page.waitForTimeout(600);

  return { path, errors, pageErrors };
}

async function main() {
  try {
    await waitForServer(BASE, 8000);
  } catch {
    console.error(`Server not reachable at ${BASE}. Run: npm run build && npm run start`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 984, height: 1280 } });

  let failed = false;
  for (const path of ROUTES) {
    const r = await auditRoute(page, path);
    const all = [...r.errors, ...r.pageErrors];
    if (all.length) {
      failed = true;
      console.log(`FAIL ${path}`);
      all.forEach((e) => console.log(`  - ${e}`));
    } else {
      console.log(`OK   ${path}`);
    }
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
