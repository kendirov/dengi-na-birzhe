import type { Metadata } from "next";
import { StakanLentaPageClient } from "@/components/stakan-lenta/StakanLentaPageClient";

export const metadata: Metadata = {
  title: "Стакан и лента",
  description:
    "Биржевой стакан, лента сделок и кластера — интерактивный учебный привод CScalp.",
};

export default function StakanLentaPage() {
  return <StakanLentaPageClient />;
}
