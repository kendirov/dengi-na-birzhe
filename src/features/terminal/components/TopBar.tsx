"use client";

import { useEffect, useState } from "react";
import { useDebugQuery } from "../hooks/useDebugQuery";
import { UiIcon } from "./UiIcon";

const REFERENCE_CLOCK = "10:15:23";

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

export function TopBar() {
  const { capture } = useDebugQuery();
  const [time, setTime] = useState(REFERENCE_CLOCK);

  useEffect(() => {
    if (capture) {
      setTime(REFERENCE_CLOCK);
      return;
    }
    setTime(formatClock(new Date()));
    const id = window.setInterval(() => setTime(formatClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, [capture]);

  const displayTime = capture ? REFERENCE_CLOCK : time;

  return (
    <header className="cscalp-topbar" data-tour-id="topbar">
      <div className="cscalp-topbar__left">
        <span className="cscalp-topbar__logo" aria-hidden />
        <nav className="cscalp-topbar__menu" aria-label="Меню терминала">
          {MENU.map((item) => (
            <span key={item} className="cscalp-topbar__item">
              {item}
              {item === "Сообщения" && (
                <sup className="cscalp-topbar__badge">1</sup>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className="cscalp-topbar__right">
        <UiIcon variant="pin" className="cscalp-topbar__icon" title="Поверх всех окон" />
        <span className="cscalp-topbar__time">{displayTime}</span>
        <UiIcon variant="mute" className="cscalp-topbar__icon" title="Звук" />
        <span className="cscalp-win-btn" aria-hidden>
          <UiIcon variant="min" />
        </span>
        <span className="cscalp-win-btn" aria-hidden>
          <UiIcon variant="max" />
        </span>
        <span className="cscalp-win-btn cscalp-win-btn--close" aria-hidden>
          <UiIcon variant="close" />
        </span>
      </div>
    </header>
  );
}
