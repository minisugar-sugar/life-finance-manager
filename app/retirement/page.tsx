"use client";

import { useEffect, useState } from "react";
import { RetirementQuickForm } from "@/components/RetirementQuickForm";
import { CurrentAssetBoard } from "@/components/CurrentAssetBoard";
import { MonthlyIncomeBoard } from "@/components/MonthlyIncomeBoard";
import { db } from "@/lib/local-db";

type ScenarioResult = {
  name: string;
  annualYield: number;
  projectedDividendBalanceAtRetire: number;
  projectedMonthlyDividendAtRetire: number;
};

type RetirementResponse = {
  targetRetireAge: number;
  currentAge: number;
  targetAsset: number;
  currentAsset: number;
  monthlyNeedToInvest: number;
  monthlySurplus: number;
  monthlyGap: number;
  projectedMonthlyDividendAtRetire: number;
  scenarios: ScenarioResult[];
  suggestions: string[];
};

export default function RetirementPage() {
  const [data, setData] = useState<RetirementResponse | null>(null);

  const load = () => {
    const profile = db.getRetire();
    const a = db.getAssets();

    const currentAsset =
      a.cash + a.depositBalance + a.savingBalance + a.stockEtf + a.bond + a.pension + a.crypto + a.realEstateSelf + a.realEstateRent + a.otherAsset;

    const monthlyIncome = a.salaryIncome + a.sideIncome + a.dividendIncome + a.rentIncome + a.otherIncome;
    const monthlyExpense = a.livingExpense + a.loanPayment + a.insurancePayment + a.otherExpense;
    const monthlySurplus = monthlyIncome - monthlyExpense;

    const targetAsset = Math.round((profile.targetMonthlyLivingCost * 12) / 0.04);
    const yearsLeft = Math.max(profile.targetRetireAge - profile.currentAge, 1);

    const periodsPerYear = a.dividendFrequency === "monthly" ? 12 : a.dividendFrequency === "quarterly" ? 4 : 1;
    const totalPeriods = yearsLeft * periodsPerYear;
    const baseYield = a.dividendYieldPct || 0;
    const yields = {
      conservative: Math.max(baseYield - 1.5, 0),
      base: baseYield,
      aggressive: baseYield + 1.5
    };

    const runScenario = (name: string, annualYield: number) => {
      const periodRate = annualYield / 100 / periodsPerYear;
      let balance = a.dividendPrincipal || 0;
      for (let i = 0; i < totalPeriods; i++) balance += balance * periodRate;
      return {
        name,
        annualYield,
        projectedDividendBalanceAtRetire: balance,
        projectedMonthlyDividendAtRetire: (balance * (annualYield / 100)) / 12
      };
    };

    const scenarios = [
      runScenario("보수", yields.conservative),
      runScenario("중립", yields.base),
      runScenario("공격", yields.aggressive)
    ];

    const selectedScenario = a.dividendScenario === "conservative" ? scenarios[0] : a.dividendScenario === "aggressive" ? scenarios[2] : scenarios[1];

    const monthlyNeedToInvest = Math.max(Math.round((targetAsset - currentAsset) / (yearsLeft * 12)), 0);
    const effectiveNeed = Math.max(monthlyNeedToInvest - selectedScenario.projectedMonthlyDividendAtRetire, 0);
    const monthlyGap = Math.max(effectiveNeed - Math.max(monthlySurplus, 0), 0);

    setData({
      currentAge: profile.currentAge,
      targetRetireAge: profile.targetRetireAge,
      targetAsset,
      currentAsset,
      monthlyNeedToInvest: effectiveNeed,
      monthlySurplus,
      monthlyGap,
      projectedMonthlyDividendAtRetire: selectedScenario.projectedMonthlyDividendAtRetire,
      scenarios,
      suggestions: [
        monthlyGap > 0
          ? `매달 ${Math.round(monthlyGap).toLocaleString("ko-KR")}원을 더 모아야 해요.`
          : "현재 흐름이면 목표에 가까워요.",
        "고정지출(대출/보험/통신)부터 먼저 줄여보세요.",
        `배당 재투자를 유지하면 은퇴 시 월 약 ${Math.round(selectedScenario.projectedMonthlyDividendAtRetire).toLocaleString("ko-KR")}원 배당을 기대할 수 있어요.`
      ]
    });
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("lfm:data-changed", handler);
    return () => window.removeEventListener("lfm:data-changed", handler);
  }, []);

  return (
    <main className="container">
      <h1 className="h1">은퇴 추천 리포트</h1>
      <p className="muted">복잡한 입력을 보드별로 나눴어요. 순서대로 입력하면 돼요.</p>
      <button onClick={() => window.print()} style={{ marginBottom: 10 }}>PDF 저장</button>

      <RetirementQuickForm onSaved={load} />
      <CurrentAssetBoard onSaved={load} />
      <MonthlyIncomeBoard onSaved={load} />

      {!data ? (
        <div className="card">로딩 중...</div>
      ) : (
        <>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="card">목표 은퇴자산: {data.targetAsset.toLocaleString("ko-KR")}원</div>
            <div className="card">현재 총자산: {data.currentAsset.toLocaleString("ko-KR")}원</div>
            <div className="card">매달 필요한 투자금(배당 반영): {Math.round(data.monthlyNeedToInvest).toLocaleString("ko-KR")}원</div>
            <div className="card">은퇴 시점 예상 월 배당금: {Math.round(data.projectedMonthlyDividendAtRetire).toLocaleString("ko-KR")}원</div>
            <div className="card">현재 월 잉여자금: {Math.round(data.monthlySurplus).toLocaleString("ko-KR")}원</div>
            <div className="card">월 부족분: {Math.round(data.monthlyGap).toLocaleString("ko-KR")}원</div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>배당 시나리오 비교</h3>
            <table className="table">
              <thead>
                <tr><th>시나리오</th><th>연 배당률</th><th>은퇴 시점 배당 원금</th><th>은퇴 시점 월 배당금</th></tr>
              </thead>
              <tbody>
                {data.scenarios.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>{s.annualYield.toFixed(1)}%</td>
                    <td>{Math.round(s.projectedDividendBalanceAtRetire).toLocaleString("ko-KR")}원</td>
                    <td>{Math.round(s.projectedMonthlyDividendAtRetire).toLocaleString("ko-KR")}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>행동 추천</h3>
            <ul>{data.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </>
      )}
    </main>
  );
}
