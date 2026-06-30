"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SectionPageShell } from "@/components/shell/SectionPageShell";
import { StakanLentaClient } from "./StakanLentaClient";

function StakanLentaPageInner() {
  const landing = useSearchParams().get("landing") === "1";

  if (landing) {
    return (
      <SectionPageShell
        title="Стакан и лента"
        subtitle="Интерактивный учебный привод CScalp: стакан, лента, кластера, сценарии."
        inProgress={false}
      >
        <StakanLentaClient landing />
      </SectionPageShell>
    );
  }

  return <StakanLentaClient />;
}

export function StakanLentaPageClient() {
  return (
    <Suspense fallback={null}>
      <StakanLentaPageInner />
    </Suspense>
  );
}
