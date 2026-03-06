"use client";

import { useMemo, useState } from "react";

type Frequency = "monthly" | "quarterly";

function simulateDividendReinvest(
  principal: number,
  annualYieldPct: number,
  years: number,
  frequency: Frequency
) {
  const periodsPerYear = frequency === "monthly" ? 12 : 4;
  const periodRate = annualYieldPct / 100 / periodsPerYear;
  const totalPeriods = years * periodsPerYear;

  let balance = principal;
  let totalDividend = 0;

  for (let i = 0; i < totalPeriods; i++) {
    const dividend = balance * periodRate;
    totalDividend += dividend;
    balance += dividend; // 재투자
  }

  const annualDividendNow = principal * (annualYieldPct / 100);

  return {
    annualDividendNow,
    finalBalance: balance,
    totalDividend,
    estimatedAnnualDividendAfterYears: balance * (annualYieldPct / 100)
  };
}

export default function DividendPage() {
  const [principal, setPrincipal] = useState(10000000);
  const [yieldPct, setYieldPct] = useState(5);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState<Frequency>("quarterly");

  const result = useMemo(
    () => simulateDividendReinvest(principal, yieldPct, years, frequency),
    [principal, yieldPct, years, frequency]
  );

  return (
    <main className="container">
      <h1 className="h1">배당 계산기</h1>
      <p className="muted">원금 + 배당률 + 월/분기 배당 + 기간을 넣으면 재투자 결과를 보여줘요.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-2">
          <label>
            투자금액
            <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
          </label>
          <label>
            배당률(연 %)
            <input type="number" step="0.1" value={yieldPct} onChange={(e) => setYieldPct(Number(e.target.value))} />
          </label>
          <label>
            배당 주기
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              <option value="monthly">월배당</option>
              <option value="quarterly">분기배당</option>
            </select>
          </label>
          <label>
            재투자 기간(년)
            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          지금 기준 연간 배당금
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
            {Math.round(result.annualDividendNow).toLocaleString("ko-KR")}원
          </div>
        </div>

        <div className="card">
          {years}년 재투자 후 자산
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
            {Math.round(result.finalBalance).toLocaleString("ko-KR")}원
          </div>
        </div>

        <div className="card">
          {years}년 동안 받은 총 배당금(재투자 전 합계)
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
            {Math.round(result.totalDividend).toLocaleString("ko-KR")}원
          </div>
        </div>

        <div className="card">
          {years}년 후 예상 연간 배당금
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
            {Math.round(result.estimatedAnnualDividendAfterYears).toLocaleString("ko-KR")}원
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 12 }}>
        * 단순 계산기예요. 세금, 수수료, 배당 변동, 주가 변동은 제외했어요.
      </p>
    </main>
  );
}
