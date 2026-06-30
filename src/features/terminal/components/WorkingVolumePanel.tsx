"use client";

import { VOLUME_PRESETS } from "../data/mockMarket";
import { useTerminalStore } from "../state/terminalStore";
import type { DriveVolumeKey, PriceMode } from "../types";
import { UiIcon } from "./UiIcon";

const PRICE_MODES: PriceMode[] = ["D", "L", "F"];

export function WorkingVolumePanel() {
  const { state, setVolumeKey, dispatch, zoneClass } = useTerminalStore();

  return (
    <aside
      className={`cscalp-rail cscalp-zone cscalp-panel-border-r ${zoneClass("volume")}`}
      aria-label="Рабочий объём"
      data-tour-id="volume-rail"
    >
      <button type="button" className="cscalp-rail__gear" title="Настройки объёма" aria-label="Настройки">
        <UiIcon variant="gear" />
      </button>

      <div className="cscalp-rail__modes">
        {PRICE_MODES.map((mode) => {
          const active = state.priceMode === mode;
          return (
            <button
              key={mode}
              type="button"
              className={`cscalp-rail__toggle${active ? " cscalp-rail__toggle--active" : ""}`}
              onClick={() => dispatch({ type: "SET_PRICE_MODE", mode })}
              title={
                mode === "F"
                  ? "F — снять лимиты (hotkey)"
                  : mode === "D"
                    ? "D — закрыть позицию (hotkey)"
                    : "L — лимитный режим"
              }
            >
              {mode}
            </button>
          );
        })}
      </div>

      <span className="cscalp-rail__mult">x1</span>

      <div className="cscalp-rail__keys" data-tour-id="hotkeys">
        {VOLUME_PRESETS.map((v, i) => {
          const active = state.volumeKey === v;
          return (
            <button
              key={v}
              type="button"
              className={`cscalp-rail__key${active ? " cscalp-rail__key--active" : ""}`}
              onClick={() => setVolumeKey(v as DriveVolumeKey)}
              title={`Клавиша ${i + 1}`}
            >
              {v}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
