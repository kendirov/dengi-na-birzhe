import { chromium } from "playwright";

const URL = "http://localhost:3001/screener";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("table.screener-table tbody tr", { timeout: 30000 });

  const tableTop = await page.evaluate(() => {
    const t = document.querySelector("table.screener-table");
    return t?.getBoundingClientRect().top ?? 0;
  });

  // Scroll until table header should pin under nav (56px)
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.max(0, tableTop - 56 + 100));
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => {
    const thead = document.querySelector("table.screener-table thead");
    const rows = [...document.querySelectorAll("table.screener-table tbody tr")];
    const stickyTds = rows
      .map((r, i) => ({
        index: i,
        ticker: r.querySelector("td")?.textContent?.trim(),
        rowTop: r.getBoundingClientRect().top,
        rowBottom: r.getBoundingClientRect().bottom,
        tdPosition: getComputedStyle(r.querySelector("td")).position,
      }))
      .filter((r) => r.rowTop < 200 && r.rowBottom > 56);

    const stickyElements = [...document.querySelectorAll("table.screener-table *")].filter((el) => {
      const s = getComputedStyle(el);
      return s.position === "sticky";
    }).map((el) => ({
      tag: el.tagName,
      cls: el.className.toString().slice(0, 60),
      top: getComputedStyle(el).top,
      rectTop: Math.round(el.getBoundingClientRect().top),
      text: (el.textContent || "").slice(0, 20).replace(/\s+/g, " "),
    }));

    return {
      scrollY: window.scrollY,
      theadRectTop: thead ? Math.round(thead.getBoundingClientRect().top) : null,
      firstRowTop: rows[0] ? Math.round(rows[0].getBoundingClientRect().top) : null,
      firstRowTicker: rows[0]?.querySelector("td")?.textContent?.trim(),
      rowsVisibleNearHeader: stickyTds,
      stickyInTable: stickyElements,
    };
  });

  console.log(JSON.stringify(state, null, 2));

  const bug = state.rowsVisibleNearHeader.some((r) => r.index === 0 && r.rowTop > 56 && r.rowTop < 150);
  console.log("\nBUG first row stuck near header:", bug);

  await page.screenshot({ path: "scripts/sticky-pinned-header.png" });
  await browser.close();
}

main();
