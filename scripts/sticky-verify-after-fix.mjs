import { chromium } from "playwright";

const URL = "http://localhost:3001/screener";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("table.screener-table tbody tr");

  const tableTop = await page.evaluate(() =>
    document.querySelector("table.screener-table")?.getBoundingClientRect().top ?? 0,
  );
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, tableTop - 56 + 200));
  await page.waitForTimeout(400);

  const result = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("table.screener-table tbody tr")];
    const stickyTds = rows.some((r) =>
      [...r.querySelectorAll("td")].some((td) => getComputedStyle(td).position === "sticky"),
    );

    // Bug pattern: ticker cell visible in header band but row body scrolled away
    const detachedTickerCells = rows
      .map((r, i) => {
        const tds = [...r.querySelectorAll("td")];
        const tickerTd = tds[0];
        const secondTd = tds[1];
        if (!tickerTd || !secondTd) return null;
        const tTop = tickerTd.getBoundingClientRect().top;
        const sTop = secondTd.getBoundingClientRect().top;
        if (Math.abs(tTop - sTop) > 2 && tTop >= 56 && tTop < 130) {
          return { i, ticker: tickerTd.textContent?.trim(), tickerTop: tTop, nameTop: sTop };
        }
        return null;
      })
      .filter(Boolean);

    return {
      stickyTdsInBody: stickyTds,
      firstRowTop: rows[0]?.getBoundingClientRect().top,
      detachedTickerCells,
      theadTop: document.querySelector("thead th")?.getBoundingClientRect().top,
    };
  });

  console.log(JSON.stringify(result, null, 2));
  const pass = !result.stickyTdsInBody && result.detachedTickerCells.length === 0;
  console.log("PASS:", pass);
  await browser.close();
  process.exit(pass ? 0 : 1);
}

main();
