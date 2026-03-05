"use client";

import { useEffect, useState } from "react";
import { db, type InsuranceRow } from "@/lib/local-db";

export function InsurancePanel() {
  const [items, setItems] = useState<InsuranceRow[]>([]);
  const [editing, setEditing] = useState<InsuranceRow | null>(null);

  const load = () => setItems(db.listInsurance());
  useEffect(() => { load(); }, []);

  const total = items.reduce((acc, i) => acc + Number(i.monthlyPremium ?? 0), 0);

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>보험 관리</h2>
        <span className="badge">월 보험료 {new Intl.NumberFormat("ko-KR").format(total)}원</span>
      </div>
      <table className="table">
        <thead><tr><th>보험사</th><th>상품</th><th>월보험료</th><th>상태</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.insurer}</td><td>{item.productName}</td><td>{Number(item.monthlyPremium).toLocaleString("ko-KR")}원</td><td>{item.status}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(item)}>수정</button>
                <button onClick={() => { db.deleteInsurance(item.id); load(); }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="card" style={{ marginTop: 10, border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>보험 수정</h3>
          <div className="grid grid-2">
            <input value={editing.insurer} onChange={(e) => setEditing({ ...editing, insurer: e.target.value })} />
            <input value={editing.productName} onChange={(e) => setEditing({ ...editing, productName: e.target.value })} />
            <input value={editing.monthlyPremium} onChange={(e) => setEditing({ ...editing, monthlyPremium: Number(e.target.value) })} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={() => { if (editing) db.updateInsurance(editing.id, editing); setEditing(null); load(); }}>저장</button>
            <button onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}
    </section>
  );
}
