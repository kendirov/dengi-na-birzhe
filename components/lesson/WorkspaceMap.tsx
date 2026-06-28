"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/format";

interface WorkspaceZone {
  id: string;
  label: string;
  description: string;
  gridArea: string;
  tone: "cyan" | "green" | "amber" | "violet" | "muted";
}

const ZONES: WorkspaceZone[] = [
  {
    id: "leader",
    label: "Поводырь",
    description: "IMOEX / лидер сектора — контекст направления дня",
    gridArea: "leader",
    tone: "violet",
  },
  {
    id: "inst1",
    label: "Инструмент 1",
    description: "Основной инструмент: стакан + лента + кластеры",
    gridArea: "inst1",
    tone: "cyan",
  },
  {
    id: "inst2",
    label: "Инструмент 2",
    description: "Второй watchlist — для сравнения и переключения",
    gridArea: "inst2",
    tone: "cyan",
  },
  {
    id: "inst3",
    label: "Инструмент 3",
    description: "Резерв / альтернатива в игре",
    gridArea: "inst3",
    tone: "green",
  },
  {
    id: "inst4",
    label: "Инструмент 4",
    description: "Спредовый или техничный — по задаче дня",
    gridArea: "inst4",
    tone: "green",
  },
  {
    id: "aux",
    label: "Новости / график / привод",
    description: "Новостной фон, дневной график, окно заявок",
    gridArea: "aux",
    tone: "amber",
  },
];

const toneBorder = {
  cyan: "border-cyan/30 hover:border-cyan/50",
  green: "border-green/30 hover:border-green/50",
  amber: "border-amber/30 hover:border-amber/50",
  violet: "border-violet/30 hover:border-violet/50",
  muted: "border-terminal-border",
};

const toneActive = {
  cyan: "border-cyan bg-cyan/15 shadow-[0_0_24px_rgba(34,211,238,0.12)]",
  green: "border-green bg-green/15",
  amber: "border-amber bg-amber/15",
  violet: "border-violet bg-violet/15",
  muted: "border-terminal-border bg-terminal-surface",
};

export function WorkspaceMap() {
  const [active, setActive] = useState<string>("inst1");
  const zone = ZONES.find((z) => z.id === active)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div
        className="grid min-h-[320px] gap-2 rounded-lg border border-terminal-border bg-terminal-bg/50 p-3"
        style={{
          gridTemplateAreas: `
            "leader leader leader"
            "inst1 inst2 aux"
            "inst3 inst4 aux"
          `,
          gridTemplateColumns: "1fr 1fr 0.9fr",
          gridTemplateRows: "auto 1fr 1fr",
        }}
      >
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setActive(z.id)}
            style={{ gridArea: z.gridArea }}
            className={cn(
              "rounded-lg border p-3 text-left transition-all duration-300",
              active === z.id ? toneActive[z.tone] : toneBorder[z.tone],
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
              {z.id === "leader" ? "INDEX" : z.id === "aux" ? "AUX" : "TQBR"}
            </span>
            <p className="mt-1 text-sm font-semibold">{z.label}</p>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-cyan/15 bg-terminal-surface/60 p-4">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-cyan">Зона</p>
        <h3 className="mb-2 font-semibold">{zone.label}</h3>
        <p className="text-sm leading-relaxed text-terminal-muted">{zone.description}</p>
        <p className="mt-4 text-[11px] text-terminal-muted">
          Кликните на блок схемы — так выглядит оптимальный рабочий экран без
          лишних окон и раздражителей.
        </p>
      </div>
    </div>
  );
}
