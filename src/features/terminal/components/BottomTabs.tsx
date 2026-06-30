"use client";

import { UiIcon } from "./UiIcon";

export function BottomTabs() {
  return (
    <footer className="cscalp-bottom" data-tour-id="bottom-tabs">
      <div className="cscalp-bottom__tabs">
        <span className="cscalp-bottom__tab">Screener</span>
        <span className="cscalp-bottom__tab cscalp-bottom__tab--active">Вкладка (1)</span>
        <span className="cscalp-bottom__spacer" />
        <span className="cscalp-bottom__icon" title="Меню вкладок">
          <UiIcon variant="menu" />
        </span>
      </div>
    </footer>
  );
}
