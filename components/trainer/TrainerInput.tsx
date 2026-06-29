import { cn } from "@/lib/utils/format";
import { clampNumber, parseInputNumber } from "./sanitize";

export function TrainerTooltip({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="ml-1 inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-terminal-border text-[9px] text-terminal-muted hover:border-cyan/30 hover:text-cyan"
    >
      ?
    </span>
  );
}

export function TrainerInput({
  label,
  hint,
  tooltip,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  tone = "cyan",
}: {
  label: string;
  hint?: string;
  tooltip?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  tone?: "cyan" | "green" | "red" | "amber";
}) {
  const borderTone = {
    cyan: "focus:border-cyan/40",
    green: "focus:border-green/40",
    red: "focus:border-red/40",
    amber: "focus:border-amber/40",
  }[tone];

  const safeValue = Number.isFinite(value) ? value : min;

  return (
    <label className="block">
      <span className="mb-1 flex items-center text-[10px] uppercase tracking-wider text-terminal-muted">
        {label}
        {tooltip ? <TrainerTooltip text={tooltip} /> : null}
      </span>
      {hint ? (
        <span className="mb-1 block text-[10px] leading-snug text-terminal-muted/80">
          {hint}
        </span>
      ) : null}
      <div className="relative">
        <input
          type="number"
          value={safeValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange(parseInputNumber(e.target.value, min, max, safeValue))
          }
          className={cn(
            "w-full rounded border border-terminal-border bg-terminal-bg px-2 py-1.5 pr-8 font-mono text-sm focus:outline-none",
            borderTone,
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-terminal-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

export function TrainerToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded border px-2.5 py-1 font-mono text-[10px] transition-colors",
        active
          ? "border-cyan/40 bg-cyan/10 text-cyan"
          : "border-terminal-border text-terminal-muted hover:text-terminal-text",
      )}
    >
      {label}
    </button>
  );
}

export { clampNumber, parseInputNumber };
