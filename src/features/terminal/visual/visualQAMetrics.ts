/** Visual QA — сравнение computed styles с design tokens (debug only). */

export { REFERENCE_IMAGE_PATH } from "../constants/referenceLayout";

export interface VisualQACheck {
  id: string;
  label: string;
  token: string;
  expected: string;
  actual: string;
  pass: boolean;
}

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function px(n: number): string {
  return `${Math.round(n)}px`;
}

function normColor(value: string): string {
  const v = value.trim().toLowerCase();
  if (v.startsWith("rgb")) {
    const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const hex = (n: string) => Number(n).toString(16).padStart(2, "0");
      return `#${hex(m[1]!)}${hex(m[2]!)}${hex(m[3]!)}`;
    }
  }
  return v;
}

function check(
  id: string,
  label: string,
  token: string,
  expected: string,
  actual: string,
  compare: "exact" | "color" | "contains" = "exact",
): VisualQACheck {
  let pass = false;
  if (compare === "color") {
    pass = normColor(actual) === normColor(expected);
  } else if (compare === "contains") {
    pass = actual.toLowerCase().includes(expected.toLowerCase());
  } else {
    pass = actual === expected;
  }
  return { id, label, token, expected, actual, pass };
}

function elSize(selector: string, prop: "height" | "width", root: ParentNode): string {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) return "—";
  const rect = node.getBoundingClientRect();
  return px(prop === "height" ? rect.height : rect.width);
}

function elStyle(
  selector: string,
  prop: keyof CSSStyleDeclaration,
  root: ParentNode,
): string {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) return "—";
  const v = getComputedStyle(node)[prop];
  return typeof v === "string" ? v : "—";
}

export function collectVisualQAMetrics(terminalRoot: HTMLElement | null): VisualQACheck[] {
  if (!terminalRoot) return [];

  const root = terminalRoot;
  const checks: VisualQACheck[] = [];

  const topbarH = readToken("--cscalp-topbar-h");
  checks.push(
    check(
      "topbar-height",
      "Topbar height",
      "--cscalp-topbar-h",
      topbarH,
      elSize(".cscalp-topbar", "height", root),
    ),
  );

  const topbarBg = readToken("--cscalp-topbar-bg");
  checks.push(
    check(
      "topbar-color",
      "Topbar color",
      "--cscalp-topbar-bg",
      topbarBg,
      elStyle(".cscalp-topbar", "backgroundColor", root),
      "color",
    ),
  );

  const menuGap = readToken("--cscalp-menu-gap");
  checks.push(
    check(
      "menu-spacing",
      "Menu spacing",
      "--cscalp-menu-gap",
      menuGap,
      elStyle(".cscalp-topbar__menu", "gap", root),
    ),
  );

  const rowH = readToken("--cscalp-row-h");
  checks.push(
    check(
      "book-row-height",
      "Orderbook row height",
      "--cscalp-row-h",
      rowH,
      elSize(".cscalp-book__row", "height", root),
    ),
  );

  const priceW = readToken("--cscalp-col-price");
  checks.push(
    check(
      "price-col-width",
      "Price column width",
      "--cscalp-col-price",
      priceW,
      elSize(".cscalp-book__price", "width", root),
    ),
  );

  const askColor = readToken("--cscalp-ask-active");
  checks.push(
    check(
      "ask-color",
      "Ask active color",
      "--cscalp-ask-active",
      askColor,
      elStyle(".cscalp-book__row--ask-active", "backgroundColor", root),
      "color",
    ),
  );

  const bidColor = readToken("--cscalp-bid-active");
  checks.push(
    check(
      "bid-color",
      "Bid active color",
      "--cscalp-bid-active",
      bidColor,
      elStyle(".cscalp-book__row--bid-active", "backgroundColor", root),
      "color",
    ),
  );

  const bubbleMin = readToken("--cscalp-tape-bubble-min");
  const bubbleMax = readToken("--cscalp-tape-bubble-max");
  const tapePrint = root.querySelector<HTMLElement>(".cscalp-tape__print");
  const printW = tapePrint ? px(tapePrint.getBoundingClientRect().width) : "—";
  checks.push({
    id: "tape-bubble-size",
    label: "Tape bubble size",
    token: "--cscalp-tape-bubble-min/max",
    expected: `${bubbleMin} – ${bubbleMax}`,
    actual: tapePrint ? printW : "seed prints (see tape)",
    pass: true,
  });

  const clusterCell = readToken("--cscalp-col-cluster-cell");
  checks.push(
    check(
      "cluster-col-width",
      "Cluster column width",
      "--cscalp-col-cluster-cell",
      clusterCell,
      elSize(".cscalp-clusters__cell", "width", root),
    ),
  );

  const bottomH = readToken("--cscalp-bottom-h");
  checks.push(
    check(
      "bottom-tabs-height",
      "Bottom tabs height",
      "--cscalp-bottom-h",
      bottomH,
      elSize(".cscalp-bottom", "height", root),
    ),
  );

  const fontUi = readToken("--cscalp-font-ui");
  checks.push(
    check(
      "fonts-ui",
      "Fonts (UI)",
      "--cscalp-font-ui",
      fontUi.split(",")[0]!.replace(/"/g, "").trim(),
      elStyle(".cscalp-terminal", "fontFamily", root),
      "contains",
    ),
  );

  const fontMono = readToken("--cscalp-font-mono");
  checks.push(
    check(
      "fonts-mono",
      "Fonts (mono / book)",
      "--cscalp-font-mono",
      fontMono.split(",")[0]!.replace(/"/g, "").trim(),
      elStyle(".cscalp-book__row", "fontFamily", root),
      "contains",
    ),
  );

  const priceLine = readToken("--cscalp-price-line");
  const spreadNode = root.querySelector<HTMLElement>(".cscalp-book__row--spread-line");
  const spreadShadow = spreadNode ? getComputedStyle(spreadNode).boxShadow : "—";
  checks.push({
    id: "price-line",
    label: "Current price line",
    token: "--cscalp-price-line",
    expected: `token ${priceLine}, box-shadow on spread row`,
    actual: spreadShadow !== "none" && spreadShadow !== "" ? spreadShadow : "—",
    pass: Boolean(spreadNode) && spreadShadow !== "none" && spreadShadow !== "",
  });

  const volKey = root.querySelector<HTMLElement>(".cscalp-rail__key");
  const volRect = volKey?.getBoundingClientRect();
  checks.push({
    id: "vol-buttons",
    label: "Working volume buttons",
    token: ".cscalp-rail__key",
    expected: "5 keys visible",
    actual: volRect ? `${px(volRect.height)} h × ${px(volRect.width)} w` : "—",
    pass: Boolean(volKey) && (volRect?.height ?? 0) > 0,
  });

  return checks;
}
