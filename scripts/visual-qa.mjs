#!/usr/bin/env node
/**
 * Visual QA — Playwright screenshot of .cscalp-terminal-window (984×1200) + pixelmatch diff.
 *
 * Usage:
 *   npm run test:visual
 *   npm run test:visual:update-reference
 *
 * Requires dev server at baseUrl (starts automatically if unreachable).
 * Capture URL uses ?capture=1 — scale 1:1, no overlay, no debug chrome in shot.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "visual-qa.config.json"), "utf8"),
);

const updateReference = process.argv.includes("--update-reference");

const outputDir = path.join(root, config.outputDir);
const currentPath = path.join(outputDir, config.currentFile);
const diffPath = path.join(outputDir, config.diffFile);
const referencePath = path.join(root, config.referenceFile);
const referenceTerminalPath = path.join(root, config.referenceTerminalFile);

const { width: DESIGN_W, height: DESIGN_H } = config.designSize;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assertDimensions(png, label, filePath) {
  if (png.width !== DESIGN_W || png.height !== DESIGN_H) {
    throw new Error(
      `${label} must be ${DESIGN_W}×${DESIGN_H}, got ${png.width}×${png.height} (${path.relative(root, filePath)})`,
    );
  }
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(`Server not ready: ${url}`);
}

function startDevServer() {
  const isWin = process.platform === "win32";
  const child = spawn(isWin ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: root,
    stdio: "ignore",
    detached: true,
    shell: isWin,
  });
  child.unref();
  return child;
}

function loadPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

async function hideChrome(page) {
  const selectors = config.hideSelectors ?? [];
  if (selectors.length === 0) return;
  await page.evaluate((sels) => {
    for (const sel of sels) {
      document.querySelectorAll(sel).forEach((node) => {
        node.style.setProperty("display", "none", "important");
      });
    }
  }, selectors);
}

async function run() {
  ensureDir(outputDir);

  const baseUrl = process.env.VISUAL_BASE_URL || config.baseUrl;
  const targetUrl = `${baseUrl}${config.path}`;

  let startedDev = false;
  try {
    await waitForServer(baseUrl, 3000);
  } catch {
    console.log("Starting dev server…");
    startDevServer();
    startedDev = true;
    await waitForServer(baseUrl, 120_000);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: config.viewport,
    deviceScaleFactor: 1,
  });

  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(config.selector, { timeout: 30_000 });
  await page.waitForFunction(() => {
    const scaleEl = document.querySelector(".cscalp-trainer-scale");
    const cssScale = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--cscalp-scale") || "1",
    );
    if (Math.abs(cssScale - 1) < 0.01) return true;
    if (!scaleEl) return false;
    const t = getComputedStyle(scaleEl).transform;
    if (t === "none") return true;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const scaleX = parts[0] ?? 1;
    return Math.abs(scaleX - 1) < 0.01;
  });
  await hideChrome(page);
  await page.waitForTimeout(400);

  const locator = page.locator(config.selector);
  await locator.screenshot({ path: currentPath, animations: "disabled" });

  const current = loadPng(currentPath);
  assertDimensions(current, "current.png", currentPath);

  console.log(`Screenshot: ${path.relative(root, currentPath)} (${current.width}×${current.height})`);

  if (updateReference) {
    fs.copyFileSync(currentPath, referenceTerminalPath);
    console.log(
      `Updated approved terminal screenshot → ${path.relative(root, referenceTerminalPath)}`,
    );
    await browser.close();
    return;
  }

  if (!fs.existsSync(referencePath)) {
    console.error(`FAIL: reference missing at ${path.relative(root, referencePath)}`);
    await browser.close();
    process.exit(1);
  }

  const reference = loadPng(referencePath);
  assertDimensions(reference, "reference.png", referencePath);
  console.log(
    `Reference: ${path.relative(root, referencePath)} (${reference.width}×${reference.height})`,
  );

  const diff = new PNG({ width: DESIGN_W, height: DESIGN_H });
  const diffPixels = pixelmatch(
    current.data,
    reference.data,
    diff.data,
    DESIGN_W,
    DESIGN_H,
    {
      threshold: config.pixelmatch.threshold,
      includeAA: config.pixelmatch.includeAA,
    },
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  assertDimensions(loadPng(diffPath), "diff.png", diffPath);

  const totalPixels = DESIGN_W * DESIGN_H;
  const ratio = diffPixels / totalPixels;
  const pct = (ratio * 100).toFixed(2);

  console.log(
    `Diff: ${diffPixels} px (${pct}%) → ${path.relative(root, diffPath)} (${DESIGN_W}×${DESIGN_H})`,
  );

  if (config.pixelmatch.failOnDiff && ratio > config.pixelmatch.maxDiffRatio) {
    console.error(
      `FAIL: diff ${pct}% > max ${(config.pixelmatch.maxDiffRatio * 100).toFixed(2)}%`,
    );
    await browser.close();
    process.exit(1);
  }

  console.log(`PASS: screenshot ${DESIGN_W}×${DESIGN_H}, diff ${pct}% (failOnDiff=${config.pixelmatch.failOnDiff})`);

  await browser.close();
  if (startedDev) {
    console.log("Note: dev server was started in background; stop it manually if needed.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
