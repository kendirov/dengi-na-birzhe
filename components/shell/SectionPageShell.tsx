import { AppShell } from "@/components/AppShell";

interface SectionPageShellProps {
  title: string;
  subtitle: string;
  inProgress?: boolean;
  children: React.ReactNode;
}

/** Unified layout for section placeholder pages (money-management, workspace, …) */
export function SectionPageShell({
  title,
  subtitle,
  inProgress = true,
  children,
}: SectionPageShellProps) {
  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        <header>
          {inProgress ? (
            <span className="mb-2 inline-block rounded border border-amber/25 bg-amber/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber/90">
              страница в работе
            </span>
          ) : null}
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-terminal-muted md:text-base">
            {subtitle}
          </p>
        </header>
        {children}
      </div>
    </AppShell>
  );
}
