"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/insurance")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="muted">등록된 보험이 없습니다.</td>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
