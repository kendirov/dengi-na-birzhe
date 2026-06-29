import { TopNav } from "@/components/TopNav";
import { CONTENT_MAX_WIDTH } from "@/lib/constants/brand";

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function AppShell({ children, fullWidth }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main
        className={
          fullWidth
            ? "flex-1"
            : "mx-auto w-full flex-1 px-4 py-8 lg:px-6"
        }
        style={fullWidth ? undefined : { maxWidth: CONTENT_MAX_WIDTH }}
      >
        {children}
      </main>
      <footer className="border-t border-cyan/10 py-4">
        <div
          className="mx-auto space-y-2 px-4 text-xs text-terminal-muted lg:px-6"
          style={{ maxWidth: CONTENT_MAX_WIDTH }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Деньги на бирже · учебное пособие</span>
            <span className="font-mono">Обучение · не инвестрекомендация</span>
          </div>
          <p className="max-w-3xl leading-relaxed opacity-80">
            Учебный проект для отбора инструментов по параметрам терминала.
            Данные на демо-стенде могут быть mock. Не является офертой и не
            обещает доходность.
          </p>
        </div>
      </footer>
    </div>
  );
}
