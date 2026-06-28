import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CTAButton } from "@/components/CTAButton";
import { TerminalPanel } from "@/components/ui/TerminalPanel";

export interface LessonNav {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}

interface LessonShellProps {
  badge: string;
  title: string;
  subtitle: string;
  lessonIndex: number;
  totalLessons?: number;
  nav: LessonNav;
  children: React.ReactNode;
}

export function LessonShell({
  badge,
  title,
  subtitle,
  lessonIndex,
  totalLessons = 3,
  nav,
  children,
}: LessonShellProps) {
  return (
    <AppShell>
      <div className="space-y-10 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-terminal-muted">
              <span className="text-cyan">{badge}</span>
              <span>·</span>
              <span>
                Слайд-урок {lessonIndex}/{totalLessons}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-lg text-terminal-muted">{subtitle}</p>
          </div>
          <LessonNavBar nav={nav} />
        </div>

        <TerminalPanel title="Урок" status="Интерактив">
          <div className="space-y-12 p-4 md:p-6 lg:p-8">{children}</div>
        </TerminalPanel>

        <div className="flex flex-wrap justify-center gap-4 border-t border-terminal-border pt-8">
          <CTAButton href="/" variant="secondary">
            ← Скринер
          </CTAButton>
          {nav.next && (
            <CTAButton href={nav.next.href}>{nav.next.label} →</CTAButton>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function LessonNavBar({ nav }: { nav: LessonNav }) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/"
        className="rounded-lg border border-terminal-border px-3 py-2 text-xs text-terminal-muted transition-colors hover:border-cyan/30 hover:text-cyan"
      >
        Скринер
      </Link>
      {nav.next && (
        <Link
          href={nav.next.href}
          className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan"
        >
          {nav.next.label} →
        </Link>
      )}
    </nav>
  );
}
