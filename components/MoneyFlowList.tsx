"use client";

import { useEffect, useState } from "react";
import { db, type MoneyRow } from "@/lib/local-db";

export function MoneyFlowList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<MoneyRow[]>([]);

  const load = () => setRows(db.listMoney());
  useEffect(() => { load(); }, [refreshKey]);

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>이번 달 기록</h3>
      <table className="table">
        <thead><tr><th>종류</th><th>항목</th><th>금액</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.type}</td><td>{r.label}</td><td>{r.amount.toLocaleString("ko-KR")}원</td>
              <td><button onClick={() => { db.deleteMoney(r.id); load(); }}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
