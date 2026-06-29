import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Плотности и айсберги",
  description:
    "Крупные заявки, удержание уровня, скрытый объём и реакция цены.",
};

export default function DensityLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
