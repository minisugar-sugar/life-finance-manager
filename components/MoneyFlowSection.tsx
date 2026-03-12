"use client";

import { useState } from "react";
import { MoneyFlowForm } from "@/components/MoneyFlowForm";
import { MoneyFlowList } from "@/components/MoneyFlowList";
import { MoneyBigItemsForm } from "@/components/MoneyBigItemsForm";
import { monthKey } from "@/lib/local-db";

function shiftMonth(base: string, delta: number) {
  const [y, m] = base.split("-").map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export function MoneyFlowSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [month, setMonth] = useState(monthKey());

  return (
    <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
      <div className="card" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <b>📅 조회 월</b>
        <button onClick={() => setMonth((v) => shiftMonth(v, -1))}>이전달</button>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button onClick={() => setMonth((v) => shiftMonth(v, 1))}>다음달</button>
      </div>
      <MoneyBigItemsForm month={month} onDone={() => setRefreshKey((v) => v + 1)} />
      <MoneyFlowForm month={month} onDone={() => setRefreshKey((v) => v + 1)} />
      <MoneyFlowList month={month} refreshKey={refreshKey} />
    </div>
  );
}
