"use client";

export type UiIconVariant =
  | "pin"
  | "mute"
  | "min"
  | "max"
  | "close"
  | "gear"
  | "menu"
  | "chart";

export function UiIcon({
  variant,
  className = "",
  title,
}: {
  variant: UiIconVariant;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={`cscalp-ui-icon cscalp-ui-icon--${variant}${className ? ` ${className}` : ""}`}
      title={title}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    />
  );
}
