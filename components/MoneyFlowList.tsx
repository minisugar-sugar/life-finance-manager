"use client";

import { useEffect, useState } from "react";
import { db, type MoneyRow } from "@/lib/local-db";

export function MoneyFlowList({ month, refreshKey = 0 }: { month: string; refreshKey?: number }) {
  const [rows, setRows] = useState<MoneyRow[]>([]);
  const [editing, setEditing] = useState<MoneyRow | null>(null);

  const load = () => setRows(db.listMoney(month));
  useEffect(() => { load(); }, [refreshKey, month]);

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>기록 목록 ({month})</h3>
      <table className="table">
        <thead><tr><th>종류</th><th>항목</th><th>금액</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.type}</td><td>{r.label}</td><td>{r.amount.toLocaleString("ko-KR")}원</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(r)}>수정</button>
                <button onClick={() => { db.deleteMoney(r.id); load(); }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="card" style={{ marginTop: 10, border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>기록 수정</h3>
          <div className="grid grid-2">
            <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            <input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={() => { if (editing) db.updateMoney(editing.id, { label: editing.label, amount: editing.amount }); setEditing(null); load(); }}>저장</button>
            <button onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}
    </section>
  );
}
