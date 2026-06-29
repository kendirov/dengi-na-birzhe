"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message?: string;
}

/** Catches render errors so the page never goes fully white. */
export class ScreenerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ScreenerErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-lg border border-red/30 bg-[#0a0f14] px-4 py-6 text-center"
          style={{ backgroundColor: "#0a0f14", color: "#e2e8f0" }}
        >
          <p className="text-sm font-semibold text-red">
            {this.props.fallbackTitle ?? "Скринер временно недоступен"}
          </p>
          <p className="mt-2 text-xs text-terminal-muted">
            Обновите страницу. Если не помогло — данные MOEX загрузятся через несколько секунд.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: undefined })}
            className="mt-4 rounded border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/15"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
