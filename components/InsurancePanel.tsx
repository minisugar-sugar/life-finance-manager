"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/client-auth";

type InsuranceItem = {
  id: string;
  insurer: string;
  productName: string;
  insuranceType: string;
  purpose: string;
  monthlyPremium: string;
  status: string;
  endDate: string | null;
};

export function InsurancePanel() {
  const [items, setItems] = useState<InsuranceItem[]>([]);
  const [editing, setEditing] = useState<InsuranceItem | null>(null);

  const load = async () => {
    const userId = getUserId();
    const r = await fetch(`/api/insurance?userId=${encodeURIComponent(userId)}`);
    const d = await r.json();
    setItems(d.items ?? []);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const remove = async (id: string) => {
    await fetch(`/api/insurance/${id}`, { method: "DELETE" });
    await load();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/insurance/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        insurer: editing.insurer,
        productName: editing.productName,
        insuranceType: editing.insuranceType,
        purpose: editing.purpose,
        monthlyPremium: Number(editing.monthlyPremium),
        status: editing.status,
        endDate: editing.endDate
      })
    });
    setEditing(null);
    await load();
  };

  const total = items.reduce((acc, i) => acc + Number(i.monthlyPremium ?? 0), 0);

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>보험 관리</h2>
        <span className="badge">월 보험료 {new Intl.NumberFormat("ko-KR").format(total)}원</span>
      </div>
      <p className="muted">보장성/저축성 구분, 만기 일정, 보험료 비중을 확인합니다.</p>

      <table className="table">
        <thead>
          <tr>
            <th>보험사</th>
            <th>상품명</th>
            <th>종류</th>
            <th>목적</th>
            <th>월 보험료</th>
            <th>상태</th>
            <th>만기일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="muted">등록된 보험이 없습니다.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.insurer}</td>
                <td>{item.productName}</td>
                <td>{item.insuranceType}</td>
                <td>{item.purpose}</td>
                <td>{new Intl.NumberFormat("ko-KR").format(Number(item.monthlyPremium))}원</td>
                <td>{item.status}</td>
                <td>{item.endDate ? new Date(item.endDate).toLocaleDateString("ko-KR") : "-"}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditing(item)}>수정</button>
                  <button onClick={() => remove(item.id)}>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editing && (
        <div className="card" style={{ marginTop: 10, border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>보험 수정</h3>
          <div className="grid grid-2">
            <input value={editing.insurer} onChange={(e) => setEditing({ ...editing, insurer: e.target.value })} />
            <input value={editing.productName} onChange={(e) => setEditing({ ...editing, productName: e.target.value })} />
            <input value={editing.monthlyPremium} onChange={(e) => setEditing({ ...editing, monthlyPremium: e.target.value })} />
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MATURED">MATURED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="PAID_UP">PAID_UP</option>
            </select>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={saveEdit}>저장</button>
            <button onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}
    </section>
  );
}
