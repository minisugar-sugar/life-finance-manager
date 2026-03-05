"use client";

import { useState } from "react";
import { MoneyFlowForm } from "@/components/MoneyFlowForm";
import { MoneyFlowList } from "@/components/MoneyFlowList";

export function MoneyFlowSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
      <MoneyFlowForm onDone={() => setRefreshKey((v) => v + 1)} />
      <MoneyFlowList refreshKey={refreshKey} />
    </div>
  );
}
