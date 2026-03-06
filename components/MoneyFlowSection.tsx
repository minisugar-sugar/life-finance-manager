"use client";

import { useState } from "react";
import { MoneyFlowForm } from "@/components/MoneyFlowForm";
import { MoneyFlowList } from "@/components/MoneyFlowList";
import { monthKey } from "@/lib/local-db";

export function MoneyFlowSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [month, setMonth] = useState(monthKey());

  return (
    <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
      <div className="card" style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <b>조회 월</b>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <MoneyFlowForm month={month} onDone={() => setRefreshKey((v) => v + 1)} />
      <MoneyFlowList month={month} refreshKey={refreshKey} />
    </div>
  );
}
