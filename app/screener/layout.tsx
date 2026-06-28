import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Скринер",
  description:
    "Интерактивный отбор акций MOEX по спреду, лоту, обороту и режиму торговли.",
};

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
