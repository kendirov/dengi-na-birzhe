"use client";

import { useEffect, useState } from "react";

interface ClientTimeProps {
  iso: string;
  className?: string;
  prefix?: string;
}

/** Renders time only after mount — avoids SSR/client timezone hydration mismatch. */
export function ClientTime({ iso, className, prefix = "" }: ClientTimeProps) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(
      new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}
      {text ?? "—:—"}
    </span>
  );
}
