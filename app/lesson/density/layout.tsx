import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Плотности",
  description: "Крупные заявки, настоящие и ложные плотности — интерактивные сценарии.",
};

export default function DensityLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
