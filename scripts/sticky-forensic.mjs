import { chromium } from "playwright";

const URL = "http://localhost:3001/screener";

function stickyInfo(el) {
  const s = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    class: el.className?.slice?.(0, 80) || "",
    text: (el.textContent || "").slice(0, 40).replace(/\s+/g, " "),
    position: s.position,
    top: s.top,
    left: s.left,
    zIndex: s.zIndex,
    transform: s.transform,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("table.screener-table tbody tr", { timeout: 30000 });

  const before = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("table.screener-table tbody tr")];
    const first = rows[0];
    const tenth = rows[9];
    const rect = (el) => el?.getBoundingClientRect();
    return {
      firstTicker: first?.querySelector("td")?.textContent?.trim(),
      tenthTicker: tenth?.querySelector("td")?.textContent?.trim(),
      firstTop: rect(first)?.top,
      tenthTop: rect(tenth)?.top,
      rowCount: rows.length,
    };
  });

  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("table.screener-table tbody tr")];
    const first = rows[0];
    const visible = rows.slice(0, 15).map((r) => ({
      ticker: r.querySelector("td")?.textContent?.trim(),
      top: r.getBoundingClientRect().top,
    }));
    const stickyEls = [...document.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el);
      return s.position === "sticky" || s.position === "fixed";
    }).map((el) => ({
      tag: el.tagName.toLowerCase(),
      class: (el.className || "").toString().slice(0, 100),
      text: (el.textContent || "").slice(0, 30).replace(/\s+/g, " "),
      position: getComputedStyle(el).position,
      top: getComputedStyle(el).top,
      zIndex: getComputedStyle(el).zIndex,
      rectTop: el.getBoundingClientRect().top,
    }));
    return {
      firstTopAfter: first?.getBoundingClientRect().top,
      firstTickerAfter: first?.querySelector("td")?.textContent?.trim(),
      visibleRowsTop: visible,
      stickyEls,
    };
  });

  const firstStillVisible = after.firstTopAfter > 50 && after.firstTopAfter < 200;
  console.log(JSON.stringify({ before, after, firstRowStillNearTop: firstStillVisible }, null, 2));

  await page.screenshot({ path: "scripts/sticky-after-scroll.png", fullPage: false });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
