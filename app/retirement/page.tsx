"use client";

import { useEffect, useState } from "react";
import { RetirementQuickForm } from "@/components/RetirementQuickForm";
import { db } from "@/lib/local-db";

type RetirementResponse = {
  targetRetireAge: number;
  currentAge: number;
  monthlyGap: number;
  monthlyNeed: number;
  monthlySurplus: number;
  suggestions: string[];
};

export default function RetirementPage() {
  const [data, setData] = useState<RetirementResponse | null>(null);

  const load = () => {
    const profile = db.getRetire();
    const rows = db.listMoney();
    const income = rows.filter((r) => r.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = rows.filter((r) => r.type === "expense").reduce((a, b) => a + b.amount, 0);
    const investSave = rows.filter((r) => r.type === "invest" || r.type === "save").reduce((a, b) => a + b.amount, 0);

    const monthlyNeed = Math.round(profile.targetMonthlyLivingCost * 0.25);
    const monthlySurplus = income - expense;
    const monthlyGap = Math.max(monthlyNeed - investSave, 0);
    const suggestions = [
      `월 ${Math.round(monthlyGap).toLocaleString("ko-KR")}원 추가 확보를 목표로 하세요.`,
      "지출 상위 항목부터 10% 줄이는 방법을 먼저 시도하세요.",
      "투자·저축은 월급날 자동이체로 먼저 빼두세요."
    ];

    setData({ currentAge: profile.currentAge, targetRetireAge: profile.targetRetireAge, monthlyGap, monthlyNeed, monthlySurplus, suggestions });
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="container">
      <h1 className="h1">은퇴 추천 리포트</h1>
      <p className="muted">입력한 값으로 간단하게 계산해 보여줘요 (GitHub Pages용).</p>
      <RetirementQuickForm onSaved={load} />
      {!data ? <div className="card">로딩 중...</div> : (
        <>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="card">현재 나이: {data.currentAge}세</div>
            <div className="card">목표 은퇴 나이: {data.targetRetireAge}세</div>
            <div className="card">필요 월 준비금: {Math.round(data.monthlyNeed).toLocaleString("ko-KR")}원</div>
            <div className="card">현재 월 잉여: {Math.round(data.monthlySurplus).toLocaleString("ko-KR")}원</div>
            <div className="card">월 부족분: {Math.round(data.monthlyGap).toLocaleString("ko-KR")}원</div>
          </div>
          <div className="card"><h3 style={{ marginTop: 0 }}>행동 추천</h3><ul>{data.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </>
      )}
    </main>
  );
}
