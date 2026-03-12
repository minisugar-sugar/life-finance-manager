"use client";

import { useEffect, useState } from "react";
import { RetirementQuickForm } from "@/components/RetirementQuickForm";
import { CurrentAssetBoard } from "@/components/CurrentAssetBoard";
import { MonthlyIncomeBoard } from "@/components/MonthlyIncomeBoard";
import { db } from "@/lib/local-db";
import Link from "next/link";

type ScenarioResult = {
  name: string;
  annualYield: number;
  projectedDividendBalanceAtRetire: number;
  projectedMonthlyDividendAtRetire: number;
};

type RetirementResponse = {
  targetAsset: number;
  currentAsset: number;
  monthlyNeedToInvest: number;
  monthlySurplus: number;
  monthlyGap: number;
  projectedMonthlyDividendAtRetire: number;
  projectedNationalPensionMonthly: number;
  projectedRetireMonthlyIncome: number;
  scenarios: ScenarioResult[];
  suggestions: string[];
};

export default function RetirementPage() {
  const [data, setData] = useState<RetirementResponse | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = () => {
    const profile = db.getRetire();
    const a = db.getAssets();

    const currentAsset =
      a.cash + a.depositBalance + a.savingBalance + a.stockEtf + a.bond + a.pension + a.crypto + a.realEstateSelf + a.realEstateRent + a.otherAsset;

    const monthlyIncomeBeforeRetire = a.salaryIncome + a.sideIncome + a.dividendIncome + a.rentIncome + a.otherIncome;
    const monthlyExpense = a.livingExpense + a.loanPayment + a.insurancePayment + a.otherExpense;
    const monthlySurplus = monthlyIncomeBeforeRetire - monthlyExpense;

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
      const monthlyContribution = a.dividendMonthlyContribution || 0;
      for (let i = 0; i < totalPeriods; i++) {
        balance += balance * periodRate;
        balance += monthlyContribution * (12 / periodsPerYear);
      }
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

    const bankInterestMonthly = ((a.bankInterestPrincipal || 0) * ((a.bankInterestRatePct || 0) / 100)) / 12;

    // 국민연금 예상수령액 계산: 현재 적립금 + 월 납입액을 시작나이까지 복리 운용한 뒤 월수령으로 환산
    const yearsToNationalPension = Math.max((a.nationalPensionStartAge || 65) - profile.currentAge, 0);
    const npMonths = yearsToNationalPension * 12;
    const npMonthlyRate = ((a.nationalPensionExpectedReturnPct || 4) / 100) / 12;
    let nationalFund = a.nationalPensionCurrentBalance || 0;
    for (let i = 0; i < npMonths; i++) {
      nationalFund = nationalFund * (1 + npMonthlyRate) + (a.nationalPensionMonthlyContribution || 0);
    }
    const projectedNationalPensionMonthly = (nationalFund * 0.04) / 12; // 4% 인출률 단순환산

    const nationalPensionMonthlyAtRetire =
      profile.targetRetireAge >= (a.nationalPensionStartAge || 65)
        ? Math.max(projectedNationalPensionMonthly, a.nationalPensionMonthly || 0)
        : 0;

    const yearsToPersonalPension = Math.max((a.personalPensionStartAge || 55) - profile.currentAge, 0);
    const ppMonths = yearsToPersonalPension * 12;
    const ppMonthlyRate = ((a.personalPensionExpectedReturnPct || 4) / 100) / 12;
    let personalFund = a.personalPensionCurrentBalance || 0;
    for (let i = 0; i < ppMonths; i++) {
      personalFund = personalFund * (1 + ppMonthlyRate) + (a.personalPensionMonthlyContribution || 0);
    }
    const projectedPersonalPensionMonthly = (personalFund * 0.04) / 12;

    const personalPensionMonthlyAtRetire =
      profile.targetRetireAge >= (a.personalPensionStartAge || 55)
        ? Math.max(projectedPersonalPensionMonthly, a.personalPensionMonthly || 0)
        : 0;

    const retireMonthlyIncome =
      bankInterestMonthly +
      selectedScenario.projectedMonthlyDividendAtRetire +
      (a.rentIncome || 0) +
      nationalPensionMonthlyAtRetire +
      personalPensionMonthlyAtRetire +
      (a.retireOtherMonthly || 0);

    const monthlyNeedToInvest = Math.max(Math.round((targetAsset - currentAsset) / (yearsLeft * 12)), 0);
    const effectiveNeed = Math.max(monthlyNeedToInvest - retireMonthlyIncome, 0);
    const monthlyGap = Math.max(effectiveNeed - Math.max(monthlySurplus, 0), 0);

    setData({
      targetAsset,
      currentAsset,
      monthlyNeedToInvest: effectiveNeed,
      monthlySurplus,
      monthlyGap,
      projectedMonthlyDividendAtRetire: selectedScenario.projectedMonthlyDividendAtRetire,
      projectedNationalPensionMonthly,
      projectedRetireMonthlyIncome: retireMonthlyIncome,
      scenarios,
      suggestions: [
        monthlyGap > 0
          ? `매달 ${Math.round(monthlyGap).toLocaleString("ko-KR")}원을 더 모아야 해요.`
          : "현재 흐름이면 목표에 가까워요.",
        "고정지출(대출/보험/통신)부터 먼저 줄여보세요.",
        `이자+배당+임대+연금을 합치면 은퇴 시 월 약 ${Math.round(retireMonthlyIncome).toLocaleString("ko-KR")}원 수입을 기대할 수 있어요.`
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
      <h1 className="h1">은퇴 추천 리포트 (초간단 모드)</h1>
      <div style={{ marginBottom: 12 }}><Link href="/">← 홈으로</Link></div>
      <p className="muted">3단계로만 입력해요. 필요한 것만 먼저 보고, 자세한 내용은 접어서 볼 수 있어요.</p>
      <button onClick={() => window.print()} style={{ marginBottom: 10 }}>PDF 저장</button>

      <div className="card" style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setStep(1)} style={{ fontWeight: step === 1 ? 700 : 400 }}>1) 은퇴 목표</button>
        <button onClick={() => setStep(2)} style={{ fontWeight: step === 2 ? 700 : 400 }}>2) 현재 자산</button>
        <button onClick={() => setStep(3)} style={{ fontWeight: step === 3 ? 700 : 400 }}>3) 월수익/지출</button>
      </div>

      {step === 1 && <RetirementQuickForm onSaved={load} />}
      {step === 2 && <CurrentAssetBoard onSaved={load} />}
      {step === 3 && <MonthlyIncomeBoard onSaved={load} />}

      {!data ? (
        <div className="card">로딩 중...</div>
      ) : (
        <>
          <div className="grid grid-2" style={{ marginBottom: 12 }}>
            <div className="card">목표 은퇴자산: {data.targetAsset.toLocaleString("ko-KR")}원</div>
            <div className="card">현재 총자산: {data.currentAsset.toLocaleString("ko-KR")}원</div>
            <div className="card">은퇴 후 예상 월수입(전체): {Math.round(data.projectedRetireMonthlyIncome).toLocaleString("ko-KR")}원</div>
            <div className="card">월 부족분: {Math.round(data.monthlyGap).toLocaleString("ko-KR")}원</div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>이번 달 액션 3개</h3>
            <ul>{data.suggestions.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>

          <div className="card">
            <button onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? "고급 정보 닫기" : "고급 정보 열기"}
            </button>

            {showAdvanced && (
              <>
                <div className="grid grid-2" style={{ marginTop: 10 }}>
                  <div className="card">매달 필요한 투자금(배당 반영): {Math.round(data.monthlyNeedToInvest).toLocaleString("ko-KR")}원</div>
                  <div className="card">현재 월 잉여자금: {Math.round(data.monthlySurplus).toLocaleString("ko-KR")}원</div>
                  <div className="card">은퇴 시점 예상 월 배당금: {Math.round(data.projectedMonthlyDividendAtRetire).toLocaleString("ko-KR")}원</div>
                  <div className="card">국민연금 시작 시 예상 월수령액: {Math.round(data.projectedNationalPensionMonthly).toLocaleString("ko-KR")}원</div>
                </div>

                <h3 style={{ marginTop: 12 }}>배당 시나리오 비교</h3>
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
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
