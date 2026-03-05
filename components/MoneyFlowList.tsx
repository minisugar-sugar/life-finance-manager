"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/client-auth";

type Row = { id: string; type: string; label: string; amount: number };

export function MoneyFlowList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const userId = getUserId();
    fetch(`/api/records?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((d) => setRows(d.items ?? []));
  }, [refreshKey]);

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>이번 달 기록</h3>
      <table className="table">
        <thead>
          <tr><th>종류</th><th>항목</th><th>금액</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}><td>{r.type}</td><td>{r.label}</td><td>{r.amount.toLocaleString("ko-KR")}원</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
