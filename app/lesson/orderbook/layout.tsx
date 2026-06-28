import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Стакан и лента",
  description: "Bid, Ask, спред, лента сделок и кластера — интерактивный урок.",
};

export default function OrderbookLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
