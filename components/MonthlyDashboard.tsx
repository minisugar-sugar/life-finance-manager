"use client";

import { useEffect, useState } from "react";
import type { MonthlySummary } from "@/lib/types";

const initial: MonthlySummary = { income: 0, expense: 0, invest: 0, save: 0, insurance: 0, net: 0 };

export function MonthlyDashboard() {
  const [summary, setSummary] = useState<MonthlySummary>(initial);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch(() => setSummary(initial));
  }, []);

  const cards = [
    ["월 수입", summary.income],
    ["월 지출", summary.expense],
    ["월 투자", summary.invest],
    ["월 저축", summary.save],
    ["월 보험료", summary.insurance],
    ["월 잉여자금", summary.net]
  ] as const;

  return (
    <>
      {cards.map(([label, value]) => (
        <div className="card" key={label}>
          <div className="muted">{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
            {new Intl.NumberFormat("ko-KR").format(value)}원
          </div>
        </div>
      ))}
    </>
  );
}
