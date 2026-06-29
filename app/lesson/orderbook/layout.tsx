import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Стакан и лента",
  description:
    "Bid, ask, spread, лента сделок, лимитки и рыночные заявки.",
};

export default function OrderbookLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
