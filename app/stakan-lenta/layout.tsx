import { Suspense } from "react";
import { StakanLentaRouteChrome } from "@/components/stakan-lenta/StakanLentaRouteChrome";

export default function StakanLentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <StakanLentaRouteChrome />
      </Suspense>
      {children}
    </>
  );
}
