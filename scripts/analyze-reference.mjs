#!/usr/bin/env node
/**
 * Analyze public/reference/cscalp-reference.png (CiScalp.png).
 * - artifacts/reference-analysis.json — layout zones
 * - artifacts/reference-colors.json — sampled CSS token colors
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_PATH = path.join(ROOT, "public/reference/cscalp-reference.png");
const ANALYSIS_PATH = path.join(ROOT, "artifacts/reference-analysis.json");
const COLORS_PATH = path.join(ROOT, "artifacts/reference-colors.json");

function rgbKey(r, g, b) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function getPixel(data, width, x, y) {
  const i = (width * y + x) << 2;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Background sampling: 20th percentile luminance (ignores text/noise). */
function sampleBgRect(data, width, x, y, w, h) {
  const pixels = [];
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const p = getPixel(data, width, xx, yy);
      pixels.push({ ...p, l: lum(p.r, p.g, p.b) });
    }
  }
  pixels.sort((a, b) => a.l - b.l);
  const idx = Math.floor(pixels.length * 0.2);
  const p = pixels[Math.max(0, idx)] ?? pixels[0];
  return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x, y, w, h } };
}

/** Light text: median of pixels brighter than threshold. */
function sampleLightText(data, width, x, y, w, h, minLum = 160) {
  const bright = [];
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const p = getPixel(data, width, xx, yy);
      const l = lum(p.r, p.g, p.b);
      if (l >= minLum) bright.push(p);
    }
  }
  if (bright.length === 0) return sampleBgRect(data, width, x, y, w, h);
  bright.sort((a, b) => lum(a.r, a.g, a.b) - lum(b.r, b.g, b.b));
  const p = bright[Math.floor(bright.length / 2)];
  return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x, y, w, h } };
}

/** Muted text: pixels between lo and hi luminance. */
function sampleMutedText(data, width, x, y, w, h, lo = 90, hi = 160) {
  const mid = [];
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const p = getPixel(data, width, xx, yy);
      const l = lum(p.r, p.g, p.b);
      if (l >= lo && l <= hi) mid.push(p);
    }
  }
  if (mid.length === 0) return sampleBgRect(data, width, x, y, w, h);
  mid.sort((a, b) => lum(a.r, a.g, a.b) - lum(b.r, b.g, b.b));
  const p = mid[Math.floor(mid.length / 2)];
  return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x, y, w, h } };
}

function sampleRowLeft(data, width, y) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let x = 10; x < 200; x += 2) {
    const p = getPixel(data, width, x, y);
    r += p.r;
    g += p.g;
    b += p.b;
    n += 1;
  }
  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);
  return { r, g, b, lum: lum(r, g, b), hex: rgbKey(r, g, b) };
}

function isTopbarPurple(row) {
  return row.b > row.g + 20 && row.r >= 30 && row.r <= 40 && row.lum >= 28 && row.lum <= 35;
}

function isInstrumentBar(row) {
  return row.r >= 25 && row.r <= 35 && row.g >= 16 && row.g <= 22 && row.b >= 50 && row.b <= 70;
}

function isWorkspaceDark(row) {
  return row.lum >= 16 && row.lum <= 20 && row.r <= 20;
}

function isChartHeaderBar(row) {
  return isInstrumentBar(row) || (row.lum >= 22 && row.lum <= 28 && row.b >= row.g);
}

function detectZones(data, width, height) {
  let topbarEnd = 0;
  for (let y = 0; y < 40; y += 1) {
    if (isTopbarPurple(sampleRowLeft(data, width, y))) topbarEnd = y + 1;
  }

  let instrumentEnd = topbarEnd;
  for (let y = topbarEnd; y < 80; y += 1) {
    const row = sampleRowLeft(data, width, y);
    if (isInstrumentBar(row) || isTopbarPurple(row)) instrumentEnd = y + 1;
    else if (isWorkspaceDark(row)) break;
  }
  if (instrumentEnd > topbarEnd + 20 && instrumentEnd !== 55) instrumentEnd = 55;

  let mainEnd = 878;
  for (let y = 868; y < 890; y += 1) {
    const prev = sampleRowLeft(data, width, y - 1);
    const row = sampleRowLeft(data, width, y);
    if (isChartHeaderBar(row) && prev.lum < 22) {
      mainEnd = y;
      break;
    }
  }

  let chartHeaderEnd = 907;
  for (let y = mainEnd; y < mainEnd + 35; y += 1) {
    const row = sampleRowLeft(data, width, y);
    if (isWorkspaceDark(row)) {
      chartHeaderEnd = y;
      break;
    }
  }

  const bottomY = height - 24;

  return {
    TOPBAR_Y: 0,
    TOPBAR_H: topbarEnd,
    INSTRUMENT_Y: topbarEnd,
    INSTRUMENT_H: instrumentEnd - topbarEnd,
    MAIN_Y: instrumentEnd,
    MAIN_H: mainEnd - instrumentEnd,
    CHART_HEADER_Y: mainEnd,
    CHART_HEADER_H: chartHeaderEnd - mainEnd,
    CHART_Y: chartHeaderEnd,
    CHART_H: bottomY - chartHeaderEnd,
    BOTTOM_TABS_Y: bottomY,
    BOTTOM_TABS_H: height - bottomY,
  };
}

function brightestRowBg(data, width, x, w, y0, y1, rowH, scoreFn) {
  let best = null;
  for (let y = y0; y < y1; y += 1) {
    const sample = sampleBgRect(data, width, x, y, w, rowH);
    const [r, g, b] = sample.rgb;
    const score = scoreFn(r, g, b);
    if (!best || score > best.score) {
      best = { y, score, ...sample };
    }
  }
  return best;
}

function modeColorInRect(data, width, x, y, w, h, predicate) {
  const counts = new Map();
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const p = getPixel(data, width, xx, yy);
      if (!predicate(p.r, p.g, p.b)) continue;
      const key = rgbKey(p.r, p.g, p.b);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  const hex = sorted[0][0];
  const rgb = hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
  return { hex, rgb, count: sorted[0][1], rect: { x, y, w, h } };
}

function sampleColors(data, width, height, zones) {
  const z = zones;
  const bookX = width - 130;
  const bookW = 90;

  const topbarBg = sampleBgRect(data, width, 300, 8, 220, 10);
  const instrumentBg = sampleBgRect(data, width, 72, z.INSTRUMENT_Y + 8, 100, 10);
  const workspaceBg = sampleBgRect(data, width, 260, z.MAIN_Y + 60, 70, 50);
  const gridLine = (() => {
    const a = getPixel(data, width, 136, z.MAIN_Y + 100);
    const b = getPixel(data, width, 137, z.MAIN_Y + 100);
    const p = lum(a.r, a.g, a.b) > lum(b.r, b.g, b.b) ? a : b;
    if (Math.abs(lum(a.r, a.g, a.b) - lum(b.r, b.g, b.b)) < 2) {
      return sampleBgRect(data, width, 137, z.MAIN_Y + 100, 1, 20);
    }
    return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x: 137, y: z.MAIN_Y + 100, w: 1, h: 20 } };
  })();

  const askZoneBg = sampleBgRect(data, width, bookX, z.MAIN_Y + 50, bookW, 14);
  const askActiveRow = (() => {
    let best = askZoneBg;
    let bestScore = -1;
    for (let y = z.MAIN_Y + 40; y < z.MAIN_Y + Math.floor(z.MAIN_H * 0.45); y += 1) {
      for (let x = bookX; x < bookX + bookW; x += 1) {
        const p = getPixel(data, width, x, y);
        const score = p.r * 1.5 - p.g - p.b * 0.4;
        if (score > bestScore) {
          bestScore = score;
          best = {
            hex: rgbKey(p.r, p.g, p.b),
            rgb: [p.r, p.g, p.b],
            rect: { x, y, w: 1, h: 1 },
            y,
            score: Number(score.toFixed(2)),
          };
        }
      }
    }
    return best;
  })();

  const densityBar =
    modeColorInRect(
      data,
      width,
      720,
      z.MAIN_Y + 80,
      150,
      Math.floor(z.MAIN_H * 0.55),
      (r, g, b) => r > 100 && g > 80 && b < 100 && r > b + 25 && g > b + 10,
    ) ?? askZoneBg;

  const volumeWarning =
    modeColorInRect(
      data,
      width,
      400,
      8,
      320,
      14,
      (r, g, b) => r > 150 && g > 80 && b < 90 && r > g,
    ) ?? densityBar;
  const bidZoneBg = sampleBgRect(data, width, bookX, z.MAIN_Y + Math.floor(z.MAIN_H * 0.55), bookW, 14);
  const bidActiveRow = brightestRowBg(
    data,
    width,
    bookX,
    bookW,
    z.MAIN_Y + Math.floor(z.MAIN_H * 0.45),
    z.MAIN_Y + z.MAIN_H - 40,
    11,
    (r, g, b) => g - r,
  );

  const chartBg = sampleBgRect(data, width, 280, z.CHART_Y + 30, 100, 60);
  const chartGrid = (() => {
    const bg = chartBg.rgb;
    const bgL = lum(bg[0], bg[1], bg[2]);
    for (let y = z.CHART_Y + 20; y < z.CHART_Y + z.CHART_H - 10; y += 1) {
      for (let x = 180; x < width - 100; x += 40) {
        const p = getPixel(data, width, x, y);
        const l = lum(p.r, p.g, p.b);
        if (l > bgL + 4 && l < bgL + 20) {
          return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x, y, w: 1, h: 1 } };
        }
      }
    }
    return sampleBgRect(data, width, 200, z.CHART_Y + 65, 2, 30);
  })();

  const bottomTabsBg = sampleBgRect(data, width, 60, z.BOTTOM_TABS_Y + 4, 140, 10);

  const textPrimary = (() => {
    const white = [];
    for (let yy = 8; yy < 20; yy += 1) {
      for (let xx = 120; xx < 420; xx += 1) {
        const p = getPixel(data, width, xx, yy);
        const neutral =
          p.r > 220 && p.g > 220 && p.b > 220 && Math.abs(p.r - p.g) < 12 && Math.abs(p.g - p.b) < 12;
        if (neutral) white.push(p);
      }
    }
    if (white.length === 0) return sampleLightText(data, width, 160, 10, 280, 10, 200);
    white.sort((a, b) => lum(a.r, a.g, a.b) - lum(b.r, b.g, b.b));
    const p = white[Math.floor(white.length / 2)];
    return { hex: rgbKey(p.r, p.g, p.b), rgb: [p.r, p.g, p.b], rect: { x: 120, y: 8, w: 300, h: 12 } };
  })();
  const textMuted = sampleMutedText(data, width, 280, z.MAIN_Y + z.MAIN_H - 36, 80, 10, 70, 130);

  const greenCandle =
    modeColorInRect(data, width, 120, z.CHART_Y + 20, width - 160, z.CHART_H - 30, (r, g, b) =>
      g > r + 18 && g > 50 && lum(r, g, b) > 35,
    ) ?? chartBg;
  const redCandle =
    modeColorInRect(data, width, 120, z.CHART_Y + 20, width - 160, z.CHART_H - 30, (r, g, b) =>
      r > g + 18 && r > 50 && lum(r, g, b) > 35,
    ) ?? chartBg;

  const samples = {
    topbarBg,
    instrumentBg,
    workspaceBg,
    gridLine,
    askZoneBg,
    askActiveRow,
    bidZoneBg,
    bidActiveRow,
    densityBar,
    volumeWarning,
    chartBg,
    chartGrid,
    bottomTabsBg,
    textPrimary,
    textMuted,
    greenCandle,
    redCandle,
  };

  const tokens = {
    "--cscalp-stage-bg": "#060608",
    "--cscalp-window-bg": workspaceBg.hex,
    "--cscalp-workspace-bg": workspaceBg.hex,
    "--cscalp-topbar-bg": topbarBg.hex,
    "--cscalp-instrument-bar": instrumentBg.hex,
    "--cscalp-border": gridLine.hex,
    "--cscalp-grid-line": gridLine.hex,
    "--cscalp-tape-bg": workspaceBg.hex,
    "--cscalp-panel-muted": workspaceBg.hex,
    "--cscalp-ask-bg": askZoneBg.hex,
    "--cscalp-ask-active":
      askActiveRow.hex !== askZoneBg.hex
        ? askActiveRow.hex
        : "color-mix(in srgb, var(--cscalp-cluster-red) 42%, var(--cscalp-ask-bg))",
    "--cscalp-bid-bg": bidZoneBg.hex,
    "--cscalp-bid-active": bidActiveRow.hex,
    "--cscalp-density": densityBar.hex,
    "--cscalp-volume-warning": volumeWarning.hex,
    "--cscalp-chart-bg": chartBg.hex,
    "--cscalp-chart-grid": chartGrid.hex,
    "--cscalp-bottom-bar": bottomTabsBg.hex,
    "--cscalp-text-primary": textPrimary.hex,
    "--cscalp-text-secondary": textMuted.hex,
    "--cscalp-cluster-green": greenCandle.hex,
    "--cscalp-cluster-red": redCandle.hex,
    "--cscalp-tape-green": greenCandle.hex,
    "--cscalp-tape-red": redCandle.hex,
    "--cscalp-density-bg": "color-mix(in srgb, var(--cscalp-density) 38%, transparent)",
    "--cscalp-price-line": "color-mix(in srgb, var(--cscalp-text-primary) 20%, transparent)",
    "--cscalp-shadow-window": "color-mix(in srgb, #000000 55%, transparent)",
  };

  return { samples, tokens };
}

function colSignature(data, width, x, y0, y1) {
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y1; y += 2) {
    const p = getPixel(data, width, x, y);
    sum += lum(p.r, p.g, p.b);
    n += 1;
  }
  return sum / n;
}

function findVerticalEdges(data, width, y0, y1, xMin = 50, xMax = null) {
  const max = xMax ?? width - 10;
  const edges = [];
  let prev = colSignature(data, width, xMin, y0, y1);
  for (let x = xMin + 1; x < max; x += 1) {
    const cur = colSignature(data, width, x, y0, y1);
    const delta = Math.abs(cur - prev);
    if (delta > 12) edges.push({ x, delta: Number(delta.toFixed(2)) });
    prev = cur;
  }
  return edges.sort((a, b) => b.delta - a.delta).slice(0, 20);
}

function main() {
  if (!fs.existsSync(REF_PATH)) {
    console.error(`Missing reference: ${REF_PATH}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(REF_PATH);
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;

  const zones = detectZones(data, width, height);
  const { samples, tokens } = sampleColors(data, width, height, zones);

  const verticalEdgesMain = findVerticalEdges(
    data,
    width,
    zones.MAIN_Y + 20,
    zones.MAIN_Y + zones.MAIN_H - 60,
  );

  const analysis = {
    generatedAt: new Date().toISOString(),
    source: "public/reference/cscalp-reference.png",
    size: { width, height },
    zones,
    verticalEdgesMain,
    sanity: {
      zonesSum:
        zones.TOPBAR_H +
        zones.INSTRUMENT_H +
        zones.MAIN_H +
        zones.CHART_HEADER_H +
        zones.CHART_H +
        zones.BOTTOM_TABS_H,
      expectedHeight: height,
    },
  };

  const colorsReport = {
    generatedAt: new Date().toISOString(),
    source: "public/reference/cscalp-reference.png",
    size: { width, height },
    zones,
    samples,
    tokens,
  };

  fs.mkdirSync(path.dirname(ANALYSIS_PATH), { recursive: true });
  fs.writeFileSync(ANALYSIS_PATH, `${JSON.stringify(analysis, null, 2)}\n`, "utf8");
  fs.writeFileSync(COLORS_PATH, `${JSON.stringify(colorsReport, null, 2)}\n`, "utf8");

  console.log(`Reference: ${width}×${height}`);
  console.log(`Layout: ${ANALYSIS_PATH}`);
  console.log(`Colors: ${COLORS_PATH}`);
  console.log("\nCSS tokens:");
  for (const [k, v] of Object.entries(tokens)) {
    console.log(`  ${k}: ${v}`);
  }
}

main();
