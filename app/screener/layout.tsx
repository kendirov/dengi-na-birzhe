import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Скринер",
  description:
    "Интерактивное пособие для практикующих трейдеров: отбор акций, стакан, лента, плотности и риск.",
};

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
