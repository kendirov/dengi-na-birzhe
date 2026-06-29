import type { Metadata } from "next";
import { SectionPageShell } from "@/components/shell/SectionPageShell";
import {
  PlaceholderCard,
  PlaceholderCardGrid,
} from "@/components/shell/PlaceholderCard";

export const metadata: Metadata = {
  title: "Рабочее пространство",
  description:
    "Терминал, привод, стакан, лента, кластеры, график и горячие клавиши.",
};

const WORKSPACE_ZONES = [
  "Привод",
  "Стакан",
  "Лента",
  "Кластеры",
  "График",
  "Новости",
  "Риск-панель",
  "Дневник",
] as const;

export default function WorkspacePage() {
  return (
    <SectionPageShell
      title="Рабочее пространство"
      subtitle="Терминал, привод, стакан, лента, кластеры, график и горячие клавиши."
    >
      <PlaceholderCardGrid columns={4}>
        {WORKSPACE_ZONES.map((zone) => (
          <PlaceholderCard key={zone} title={zone} accent="cyan" />
        ))}
      </PlaceholderCardGrid>
    </SectionPageShell>
  );
}
