"use client";

import { useState } from "react";
import { db, type DividendFrequency, type DividendScenario } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

export function MonthlyIncomeBoard({ onSaved }: { onSaved?: () => void }) {
  const cur = db.getAssets();

  const [salary, setSalary] = useState(cur.salaryIncome);
  const [side, setSide] = useState(cur.sideIncome);
  const [rent, setRent] = useState(cur.rentIncome);
  const [dividendIncome, setDividendIncome] = useState(cur.dividendIncome);
  const [otherIncome, setOtherIncome] = useState(cur.otherIncome);

  const [dividendPrincipal, setDividendPrincipal] = useState(cur.dividendPrincipal);
  const [dividendYield, setDividendYield] = useState(cur.dividendYieldPct);
  const [dividendFrequency, setDividendFrequency] = useState<DividendFrequency>(cur.dividendFrequency);
  const [dividendScenario, setDividendScenario] = useState<DividendScenario>(cur.dividendScenario);

  const [living, setLiving] = useState(cur.livingExpense);
  const [loan, setLoan] = useState(cur.loanPayment);
  const [insurance, setInsurance] = useState(cur.insurancePayment);
  const [otherExpense, setOtherExpense] = useState(cur.otherExpense);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    db.setAssets({
      ...cur,
      salaryIncome: salary,
      sideIncome: side,
      rentIncome: rent,
      dividendIncome,
      otherIncome,
      dividendPrincipal,
      dividendYieldPct: dividendYield,
      dividendFrequency,
      dividendScenario,
      livingExpense: living,
      loanPayment: loan,
      insurancePayment: insurance,
      otherExpense
    });
    onSaved?.();
  };

  return (
    <form className="card" onSubmit={save}>
      <h3 style={{ marginTop: 0 }}>월수익 창출 보드</h3>
      <div className="grid grid-2" style={{ marginBottom: 8 }}>
        <label>월 급여 <FormattedNumberInput value={salary} onChange={setSalary} /></label>
        <label>월 부수입 <FormattedNumberInput value={side} onChange={setSide} /></label>
        <label>월 임대수입 <FormattedNumberInput value={rent} onChange={setRent} /></label>
        <label>월 배당수입(현재) <FormattedNumberInput value={dividendIncome} onChange={setDividendIncome} /></label>
        <label>월 기타수입 <FormattedNumberInput value={otherIncome} onChange={setOtherIncome} /></label>
      </div>

      <div className="soft-panel" style={{ marginBottom: 8 }}>
        <b>배당 재투자 설정</b>
        <div className="grid grid-2" style={{ marginTop: 6 }}>
          <label>배당 투자 원금 <FormattedNumberInput value={dividendPrincipal} onChange={setDividendPrincipal} /></label>
          <label>배당률(연 %) <FormattedNumberInput value={dividendYield} onChange={setDividendYield} /></label>
          <label>
            배당 주기
            <select value={dividendFrequency} onChange={(e) => setDividendFrequency(e.target.value as DividendFrequency)}>
              <option value="monthly">월배당</option>
              <option value="quarterly">분기배당</option>
              <option value="yearly">연배당</option>
            </select>
          </label>
          <label>
            시나리오
            <select value={dividendScenario} onChange={(e) => setDividendScenario(e.target.value as DividendScenario)}>
              <option value="conservative">보수</option>
              <option value="base">중립</option>
              <option value="aggressive">공격</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-2">
        <label>월 생활비 <FormattedNumberInput value={living} onChange={setLiving} /></label>
        <label>월 대출상환 <FormattedNumberInput value={loan} onChange={setLoan} /></label>
        <label>월 보험료 <FormattedNumberInput value={insurance} onChange={setInsurance} /></label>
        <label>월 기타지출 <FormattedNumberInput value={otherExpense} onChange={setOtherExpense} /></label>
      </div>

      <button style={{ marginTop: 10 }}>수익/지출 설정 저장</button>
    </form>
  );
}
