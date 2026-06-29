import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { GlowPanel } from "@/components/GlowPanel";

const pages = [
  { href: "/screener", label: "Скринер", public: true },
  { href: "/lab/instrument-cycle", label: "Фазы инструмента", public: false },
  { href: "/lesson/setup", label: "Первое занятие", public: true },
  { href: "/lesson/orderbook", label: "Стакан и лента", public: true },
  { href: "/lesson/density", label: "Плотности", public: true },
  { href: "/lab", label: "Lab (dev)", public: false },
];

const components = [
  "AppShell",
  "TopNav",
  "HeroTerminal",
  "DataBadge",
  "MetricCard",
  "ScreenerTable",
  "InstrumentInspector",
  "LessonCard",
  "GlowPanel",
  "SectionHeader",
  "CTAButton",
  "ScreenerClient",
  "DataStatusStrip",
];

const dataFiles = [
  "lib/data/types.ts",
  "lib/data/config.ts",
  "lib/data/provider.ts",
  "lib/data/mock-instruments.ts",
  "lib/data/moex-adapter.ts",
  "lib/data/enrich.ts",
  ".env.example → MARKET_DATA_MODE",
];

export default function LabPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <SectionHeader
          badge="DEV"
          title="Lab — внутренняя карта проекта"
          subtitle="Скрытая страница, не отображается в публичной навигации"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <GlowPanel className="p-6">
            <h3 className="mb-4 font-mono text-sm uppercase text-cyan">
              Pages
            </h3>
            <ul className="space-y-2">
              {pages.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="font-mono text-sm text-terminal-text hover:text-cyan"
                  >
                    {p.href}
                  </Link>
                  <span className="ml-2 text-xs text-terminal-muted">
                    {p.public ? "public" : "hidden"}
                  </span>
                </li>
              ))}
            </ul>
          </GlowPanel>

          <GlowPanel className="p-6">
            <h3 className="mb-4 font-mono text-sm uppercase text-violet">
              Components
            </h3>
            <ul className="space-y-1">
              {components.map((c) => (
                <li key={c} className="font-mono text-sm text-terminal-muted">
                  {c}
                </li>
              ))}
            </ul>
          </GlowPanel>

          <GlowPanel className="p-6">
            <h3 className="mb-4 font-mono text-sm uppercase text-amber">
              Data layer
            </h3>
            <ul className="space-y-1">
              {dataFiles.map((f) => (
                <li key={f} className="font-mono text-sm text-terminal-muted">
                  {f}
                </li>
              ))}
            </ul>
          </GlowPanel>
        </div>
      </div>
    </AppShell>
  );
}
