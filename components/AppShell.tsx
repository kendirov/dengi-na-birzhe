import { TopNav } from "@/components/TopNav";

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
            : "mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 lg:px-8"
        }
      >
        {children}
      </main>
      <footer className="border-t border-cyan/10 py-4">
        <div className="mx-auto max-w-[1600px] space-y-2 px-4 text-xs text-terminal-muted lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Market Lab · Лаборатория рынка</span>
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
