import type { Metadata } from "next";
import { SectionPageShell } from "@/components/shell/SectionPageShell";
import { MoneyManagementClient } from "@/components/money-management/MoneyManagementClient";

export const metadata: Metadata = {
  title: "Риск4менеджмент",
  description:
    "Торговый план на день: риск, стоп, комиссия и рабочий объём по инструментам MOEX.",
};

export default function MoneyManagementPage() {
  return (
    <SectionPageShell
      title="Риск4менеджмент"
      subtitle="Сначала риск. Потом объём."
      inProgress={false}
    >
      <MoneyManagementClient />
    </SectionPageShell>
  );
}
