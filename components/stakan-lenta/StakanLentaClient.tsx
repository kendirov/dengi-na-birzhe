"use client";

import CScalpTrainerApp from "@/src/app/App";

interface StakanLentaClientProps {
  /** Site wrapper with TopNav, title, footer — only with ?landing=1 */
  landing?: boolean;
}

export function StakanLentaClient({ landing = false }: StakanLentaClientProps) {
  return <CScalpTrainerApp landing={landing} />;
}
