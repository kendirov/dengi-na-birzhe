/** Цвета, размеры и сетка CScalp-like терминала (учебная реконструкция). */
export const CSCALP = {
  bg: "#0a0a0f",
  panel: "#0d0d14",
  border: "#1a1a24",
  topBar: "#2d1f4e",
  topBarText: "#e8e4f0",
  symbolBar: "#121218",
  text: "#c8c8c8",
  textMuted: "#6b7280",
  textVolume: "#b8a878",
  askBg: "rgba(110, 35, 35, 0.45)",
  bidBg: "rgba(25, 85, 55, 0.45)",
  askBest: "#b71c1c",
  bidBest: "#1b5e20",
  density: "#8b7355",
  densityAlt: "#a58a5e",
  densityBg: "rgba(139, 115, 85, 0.55)",
  buyBubble: "#2e7d32",
  sellBubble: "#c62828",
  clusterBuy: "#4ade80",
  clusterSell: "#f87171",
  clusterNeutral: "#9ca3af",
  clusterPocWhite: "#ffffff",
  clusterPocRed: "#ef4444",
  clusterPocGreen: "#22c55e",
  volumeKey: "#1e3a5f",
  volumeKeyBorder: "#2563eb",
  volumeKeyActive: "#2563eb",
  volumeKeyActiveBg: "rgba(37, 99, 235, 0.35)",
  highlightGlow: "rgba(34, 211, 238, 0.55)",
  highlightRing: "#22d3ee",
  rowH: 14,
  terminalW: 984,
  terminalH: 1200,
} as const;

export const TERMINAL_GRID = {
  topMenu: 28,
  symbolHeader: 28,
  bottom: 48,
  clusters: 390,
  controlRail: 44,
  orderBook: 230,
} as const;

export const DRIVE_VOLUME_KEYS = [50, 100, 200, 400, 800] as const;
export type DriveVolumeKey = (typeof DRIVE_VOLUME_KEYS)[number];

export type HighlightZone = "stakan" | "lenta" | "klastera" | null;

export function zoneHighlightClass(
  zone: Exclude<HighlightZone, null>,
  active: HighlightZone,
): string {
  if (!active) return "";
  if (active === zone) {
    return "ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.35)] z-10";
  }
  return "opacity-35 brightness-75";
}
