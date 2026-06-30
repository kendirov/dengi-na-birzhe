"use client";

import { useRef, type RefObject } from "react";
import { BottomTabs } from "./components/BottomTabs";
import { ChartHeader } from "./components/ChartHeader";
import { ClusterPanel } from "./components/ClusterPanel";
import { InstrumentHeader } from "./components/InstrumentHeader";
import { ChartPanel } from "./components/MiniChart";
import { isChartDockForcedOpen } from "./constants/referenceLayout";
import { OrderBook } from "./components/OrderBook";
import { ReferenceOverlayLayer } from "./components/ReferenceOverlay";
import { TapePanel } from "./components/TapePanel";
import { PracticePanel } from "./components/PracticePanel";
import { ScenarioCallout } from "./components/ScenarioCallout";
import { TopBar } from "./components/TopBar";
import { TourSpotlight } from "./components/TourSpotlight";
import { WorkingVolumePanel } from "./components/WorkingVolumePanel";
import { isTourActive } from "./engine/lessonEngine";
import { useTerminalStore } from "./state/terminalStore";

export function TerminalShell({
  shellRef,
}: {
  shellRef?: RefObject<HTMLDivElement | null>;
}) {
  const { state, currentLessonStep } = useTerminalStore();
  const innerRef = useRef<HTMLDivElement>(null);
  const terminalRef = shellRef ?? innerRef;
  const tourOn = isTourActive(state) && state.lessonId;
  const chartDockVisible =
    isChartDockForcedOpen(state.mode) || state.chartOpen;

  return (
    <div className="cscalp-trainer-stage">
      <div
        className="cscalp-trainer-viewport"
        style={{ ["--cscalp-scale" as string]: String(state.scale) }}
      >
        <div className="cscalp-trainer-scale">
          <div className="cscalp-terminal-window" ref={terminalRef}>
            <ReferenceOverlayLayer />
            <div
              className={`cscalp-terminal${chartDockVisible ? "" : " cscalp-terminal--chart-collapsed"}`}
            >
              <TopBar />
              <InstrumentHeader />
              <PracticePanel />
              <div className="cscalp-terminal__main">
                <ClusterPanel />
                <TapePanel />
                <WorkingVolumePanel />
                <OrderBook />
              </div>
              <ChartHeader />
              <ChartPanel />
              <BottomTabs />
              {tourOn && (
                <TourSpotlight
                  containerRef={terminalRef}
                  targetSelector={currentLessonStep.targetSelector}
                  highlightType={currentLessonStep.highlightType}
                  calloutPosition={currentLessonStep.calloutPosition}
                  title={currentLessonStep.title}
                  shortText={currentLessonStep.shortText}
                  actionHint={currentLessonStep.actionHint}
                  hidden={state.hintsHidden}
                />
              )}
              {state.mode === "scenario" &&
                state.scenarioCallout &&
                state.scenarioShowAnnotations && (
                  <ScenarioCallout
                    containerRef={terminalRef}
                    callout={state.scenarioCallout}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
