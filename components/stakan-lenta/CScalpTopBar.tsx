"use client";

import { useEffect, useState } from "react";
import { CSCALP } from "@/lib/stakan-lenta/cscalp-theme";

const MENU = [
  "Подключения",
  "Настройки",
  "Окна",
  "Аналитика",
  "Финрез",
  "Сделки",
  "Риск-менеджер",
  "Сообщения",
  "О проекте",
] as const;

function formatClock(d: Date): string {
  return d.toLocaleTimeString("ru-RU", { hour12: false });
}

export function CScalpTopBar() {
  const [time, setTime] = useState("09:51:18");

  useEffect(() => {
    setTime(formatClock(new Date()));
    const id = window.setInterval(() => setTime(formatClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-2 font-sans text-[10px]"
      style={{
        height: 28,
        background: CSCALP.topBar,
        color: CSCALP.topBarText,
        borderBottom: `1px solid ${CSCALP.border}`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {MENU.map((item) => (
          <span
            key={item}
            className="shrink-0 cursor-default whitespace-nowrap hover:text-white"
          >
            {item}
            {item === "Сообщения" && (
              <sup className="ml-0.5 text-[8px] text-orange-400">1</sup>
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-2 font-mono text-[11px]">
        <span>{time}</span>
        <WinBtn>—</WinBtn>
        <WinBtn>□</WinBtn>
        <WinBtn>×</WinBtn>
      </div>
    </div>
  );
}

function WinBtn({ children }: { children: string }) {
  return (
    <span
      className="flex h-4 w-4 cursor-default items-center justify-center text-[9px] opacity-70 hover:opacity-100"
      style={{ border: `1px solid rgba(255,255,255,0.2)` }}
    >
      {children}
    </span>
  );
}
