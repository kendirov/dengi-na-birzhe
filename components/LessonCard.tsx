import Link from "next/link";
import { GlowPanel } from "@/components/GlowPanel";

interface LessonCardProps {
  step: number;
  title: string;
  description: string;
  href?: string;
  status?: "done" | "active" | "pending";
}

const statusStyles = {
  done: "border-green/30 text-green",
  active: "border-cyan/30 text-cyan",
  pending: "border-terminal-border text-terminal-muted",
};

export function LessonCard({
  step,
  title,
  description,
  href,
  status = "pending",
}: LessonCardProps) {
  const content = (
    <GlowPanel
      className={`p-5 transition-all duration-200 ${href ? "cursor-pointer hover:border-cyan/30" : ""}`}
      glow={status === "active" ? "cyan" : "none"}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded border font-mono text-sm font-bold ${statusStyles[status]}`}
        >
          {String(step).padStart(2, "0")}
        </span>
        <h3 className="font-semibold text-terminal-text">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-terminal-muted">
        {description}
      </p>
    </GlowPanel>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
