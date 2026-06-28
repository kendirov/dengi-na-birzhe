import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Первое занятие",
  description: "Настройка терминала и рабочего места для внутридневной торговли.",
};

export default function SetupLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
