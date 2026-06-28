"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/format";

const navItems = [
  { href: "/", label: "Скринер", match: (p: string) => p === "/" || p.startsWith("/screener") },
  { href: "/lesson/setup", label: "Первое занятие", match: (p: string) => p.startsWith("/lesson/setup") },
  { href: "/lesson/orderbook", label: "Стакан и лента", match: (p: string) => p.startsWith("/lesson/orderbook") },
  { href: "/lesson/density", label: "Плотности", match: (p: string) => p.startsWith("/lesson/density") },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-cyan/10 bg-terminal-bg/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-cyan/30 bg-cyan/5 font-mono text-xs font-bold text-cyan">
            ML
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-terminal-text">
              Лаборатория рынка
            </span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-terminal-muted">
              MOEX
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-terminal">
          {navItems.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm",
                  isActive
                    ? "bg-cyan/10 text-cyan"
                    : "text-terminal-muted hover:bg-terminal-surface hover:text-terminal-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
