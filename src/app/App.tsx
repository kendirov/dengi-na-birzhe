"use client";

import { Suspense, useRef } from "react";
import "../features/terminal/styles/terminal.css";
import { LessonOverlay } from "../features/terminal/components/LessonOverlay";
import { LessonUrlSync } from "../features/terminal/components/LessonUrlSync";
import { ReferenceDebugControls } from "../features/terminal/components/ReferenceDebugControls";
import {
  ReferenceOverlayProvider,
} from "../features/terminal/components/ReferenceOverlay";
import { TapeDebugPanel } from "../features/terminal/components/TapeDebugPanel";
import { VisualQAPanel } from "../features/terminal/components/VisualQAPanel";
import { VisualUrlSync } from "../features/terminal/components/VisualUrlSync";
import { useDebugQuery } from "../features/terminal/hooks/useDebugQuery";
import { TerminalProvider } from "../features/terminal/state/terminalStore";
import { TerminalShell } from "../features/terminal/TerminalShell";

interface TrainerAppProps {
  /** Site shell wrapper — only with /stakan-lenta?landing=1 */
  landing?: boolean;
}

function TrainerChrome({ landing }: { landing: boolean }) {
  const { debug, reference, capture } = useDebugQuery();
  const terminalRef = useRef<HTMLDivElement>(null);
  const chromeMode = landing ? "landing" : "fullscreen";

  return (
    <div
      className={`cscalp-trainer-root${
        chromeMode === "fullscreen" ? " cscalp-trainer-root--fullscreen" : " cscalp-trainer-root--landing"
      }${capture ? " cscalp-trainer-root--capture" : ""}`}
    >
      <ReferenceOverlayProvider debug={debug}>
        <Suspense fallback={null}>
          <LessonUrlSync />
          <VisualUrlSync />
        </Suspense>

        {debug && !reference && (
          <div className="cscalp-debug-stack">
            <TapeDebugPanel />
            <ReferenceDebugControls />
          </div>
        )}

        {debug && reference && (
          <div className="cscalp-debug-stack cscalp-debug-stack--qa-float">
            <ReferenceDebugControls />
          </div>
        )}

        {!reference && <LessonOverlay />}

        <div className={`cscalp-trainer-layout${reference ? " cscalp-trainer-layout--qa" : ""}`}>
          <TerminalShell shellRef={terminalRef} />
          {debug && reference && <VisualQAPanel terminalRef={terminalRef} />}
        </div>

        {landing && (
          <p className="cscalp-disclaimer">
            Учебная реконструкция CScalp · MOEX mock · без live API · не торговый терминал
          </p>
        )}
      </ReferenceOverlayProvider>
    </div>
  );
}

export default function App({ landing = false }: TrainerAppProps) {
  const chromeMode = landing ? "landing" : "fullscreen";

  return (
    <TerminalProvider chromeMode={chromeMode}>
      <Suspense fallback={null}>
        <TrainerChrome landing={landing} />
      </Suspense>
    </TerminalProvider>
  );
}
