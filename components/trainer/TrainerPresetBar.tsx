import { cn } from "@/lib/utils/format";

export interface PresetOption<T extends string> {
  id: T;
  label: string;
  tooltip?: string;
  tone?: "default" | "cyan" | "green" | "amber";
}

export function TrainerPresetBar<T extends string>({
  label = "Сценарий",
  options,
  active,
  onChange,
}: {
  label?: string;
  options: PresetOption<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-terminal-muted">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          title={opt.tooltip}
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded border px-3 py-1 font-mono text-[11px] transition-colors",
            active === opt.id
              ? opt.tone === "amber"
                ? "border-amber/40 bg-amber/10 text-amber"
                : opt.tone === "cyan"
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : opt.tone === "green"
                    ? "border-green/35 bg-green/10 text-green"
                    : "border-cyan/40 bg-cyan/10 text-cyan"
              : "border-terminal-border text-terminal-muted hover:text-terminal-text",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
