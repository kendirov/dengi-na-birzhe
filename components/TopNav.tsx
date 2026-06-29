"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/format";
import { COURSE_URL, BRAND_TAGLINE, CONTENT_MAX_WIDTH } from "@/lib/constants/brand";

const navItems = [
  {
    href: "/screener",
    label: "Скринер",
    match: (p: string) => p === "/" || p.startsWith("/screener"),
  },
  {
    href: "/money-management",
    label: "Рискменеджмент",
    match: (p: string) => p.startsWith("/money-management"),
  },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-cyan/10 bg-terminal-bg/95 backdrop-blur-lg">
      <div
        className="mx-auto flex h-14 items-center justify-between gap-4 px-4 lg:px-6"
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        <a
          href={COURSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded border border-cyan/25 bg-cyan/5 font-mono text-sm text-cyan">
            ₽
          </div>
          <div className="hidden sm:block">
            <div className="text-[20px] font-semibold leading-tight tracking-tight">
              <span className="text-terminal-text">Деньги </span>
              <span className="text-green">на бирже</span>
            </div>
            <span className="block text-[10px] leading-tight text-terminal-muted">
              {BRAND_TAGLINE}
            </span>
          </div>
        </a>

        <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-terminal">
          {navItems.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-3 lg:text-sm",
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
