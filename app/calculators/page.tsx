"use client";

import { useMemo, useState } from "react";
import {
  compoundAmount,
  depositMaturity,
  installmentSavingMaturity,
  loanSchedule,
  type LoanMethod
} from "@/lib/calculators";
import { toCsv } from "@/lib/csv";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

const calcButtons = [
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  "0", ".", "C", "+"
] as const;

export default function CalculatorsPage() {
  const [display, setDisplay] = useState("0");

  const onCalcPress = (v: string) => {
    if (v === "C") {
      setDisplay("0");
      return;
    }
    setDisplay((prev) => (prev === "0" && /[0-9]/.test(v) ? v : prev + v));
  };

  const onCalcEqual = () => {
    try {
      // 간단 사칙연산 전용
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${display.replace(/[^0-9+\-*/.() ]/g, "")});`)();
      setDisplay(String(Number(result)));
    } catch {
      setDisplay("오류");
    }
  };

  // 예금
  const [depositPrincipal, setDepositPrincipal] = useState(10000000);
  const [depositRate, setDepositRate] = useState(3.5);
  const [depositMonths, setDepositMonths] = useState(12);

  const simple = useMemo(() => depositPrincipal * (depositRate / 100) * (depositMonths / 12), [depositPrincipal, depositRate, depositMonths]);
  const compound = useMemo(() => depositPrincipal * Math.pow(1 + depositRate / 100 / 12, depositMonths), [depositPrincipal, depositRate, depositMonths]);
  const deposit = useMemo(() => depositMaturity(depositPrincipal, depositRate, depositMonths), [depositPrincipal, depositRate, depositMonths]);

  // 적금
  const [monthlySavingAmount, setMonthlySavingAmount] = useState(500000);
  const [savingRate, setSavingRate] = useState(3.5);
  const [savingMonths, setSavingMonths] = useState(12);
  const saving = useMemo(() => installmentSavingMaturity(monthlySavingAmount, savingRate, savingMonths), [monthlySavingAmount, savingRate, savingMonths]);

  // 대출
  const [loanPrincipal, setLoanPrincipal] = useState(300000000);
  const [loanRate, setLoanRate] = useState(4.2);
  const [loanMonths, setLoanMonths] = useState(360);
  const [loanMethod, setLoanMethod] = useState<LoanMethod>("ANNUITY");
  const schedule = useMemo(() => loanSchedule(loanPrincipal, loanRate, loanMonths, loanMethod), [loanPrincipal, loanRate, loanMonths, loanMethod]);
  const schedulePreview = schedule.slice(0, 12);
  const totalInterest = schedule.reduce((acc, row) => acc + row.interestPaid, 0);

  const downloadCsv = () => {
    const csv = toCsv(schedule);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan_schedule_${loanMethod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container">
      <h1 className="h1">계산기 센터</h1>

      {/* 1) 일반 계산기 */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>일반 계산기</h3>
        <div className="calc-shell">
          <div className="calc-display">{display}</div>
          <div className="calc-grid">
            {calcButtons.map((b) => (
              <button key={b} onClick={() => onCalcPress(b)}>{b === "*" ? "×" : b}</button>
            ))}
            <button className="calc-eq" onClick={onCalcEqual}>=</button>
          </div>
        </div>
      </section>

      {/* 2) 예적금 계산기 */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>예적금 계산기</h3>

        <div className="soft-panel" style={{ marginBottom: 10 }}>
          <b>예금</b>
          <div className="grid grid-2" style={{ marginTop: 6 }}>
            <label>원금 <FormattedNumberInput value={depositPrincipal} onChange={setDepositPrincipal} /></label>
            <label>연이율(%) <input type="number" value={depositRate} onChange={(e) => setDepositRate(Number(e.target.value))} /></label>
            <label>기간(개월) <input type="number" value={depositMonths} onChange={(e) => setDepositMonths(Number(e.target.value))} /></label>
          </div>
          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="card">단리 이자: {Math.round(simple).toLocaleString("ko-KR")}원</div>
            <div className="card">복리 만기금액: {Math.round(compound).toLocaleString("ko-KR")}원</div>
            <div className="card">예금 만기(원금+이자): {Math.round(deposit.maturity).toLocaleString("ko-KR")}원</div>
          </div>
        </div>

        <div className="soft-panel">
          <b>적금</b>
          <div className="grid grid-2" style={{ marginTop: 6 }}>
            <label>월 납입액 <FormattedNumberInput value={monthlySavingAmount} onChange={setMonthlySavingAmount} /></label>
            <label>연이율(%) <input type="number" value={savingRate} onChange={(e) => setSavingRate(Number(e.target.value))} /></label>
            <label>기간(개월) <input type="number" value={savingMonths} onChange={(e) => setSavingMonths(Number(e.target.value))} /></label>
          </div>
          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="card">적금 원금 합계: {Math.round(saving.principal).toLocaleString("ko-KR")}원</div>
            <div className="card">적금 이자: {Math.round(saving.interest).toLocaleString("ko-KR")}원</div>
            <div className="card">적금 만기금액: {Math.round(saving.maturity).toLocaleString("ko-KR")}원</div>
          </div>
        </div>
      </section>

      {/* 3) 대출이자 계산기 */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>대출이자 계산기</h3>
        <div className="grid grid-2">
          <label>대출원금 <FormattedNumberInput value={loanPrincipal} onChange={setLoanPrincipal} /></label>
          <label>연이율(%) <input type="number" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} /></label>
          <label>기간(개월) <input type="number" value={loanMonths} onChange={(e) => setLoanMonths(Number(e.target.value))} /></label>
          <label>
            상환방식
            <select value={loanMethod} onChange={(e) => setLoanMethod(e.target.value as LoanMethod)}>
              <option value="ANNUITY">원리금균등상환</option>
              <option value="EQUAL_PRINCIPAL">원금균등상환</option>
              <option value="BULLET">원금만기일시상환</option>
            </select>
          </label>
        </div>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="card">총 이자: {Math.round(totalInterest).toLocaleString("ko-KR")}원</div>
          <div className="card">첫달 납입액: {Math.round(schedule[0]?.payment ?? 0).toLocaleString("ko-KR")}원</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <b>상환 스케줄 미리보기 (1~12회차)</b>
          <button onClick={downloadCsv}>전체 회차 CSV 다운로드</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>회차</th><th>납입액</th><th>원금</th><th>이자</th><th>잔액</th>
            </tr>
          </thead>
          <tbody>
            {schedulePreview.map((r) => (
              <tr key={r.month}>
                <td>{r.month}</td>
                <td>{Math.round(r.payment).toLocaleString("ko-KR")}</td>
                <td>{Math.round(r.principalPaid).toLocaleString("ko-KR")}</td>
                <td>{Math.round(r.interestPaid).toLocaleString("ko-KR")}</td>
                <td>{Math.round(r.balance).toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
