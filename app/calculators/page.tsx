"use client";

import { useMemo, useState } from "react";
import {
  compoundAmount,
  depositMaturity,
  installmentSavingMaturity,
  loanSchedule,
  retirementTargetAsset,
  simpleInterest,
  type LoanMethod
} from "@/lib/calculators";
import { toCsv } from "@/lib/csv";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import Link from "next/link";

export default function CalculatorsPage() {
  const [principal, setPrincipal] = useState(10000000);
  const [rate, setRate] = useState(3.5);
  const [months, setMonths] = useState(12);
  const [loanPrincipal, setLoanPrincipal] = useState(300000000);
  const [loanMonths, setLoanMonths] = useState(360);
  const [loanMethod, setLoanMethod] = useState<LoanMethod>("ANNUITY");

  const simple = useMemo(() => simpleInterest(principal, rate, months / 12), [principal, rate, months]);
  const compound = useMemo(() => compoundAmount(principal, rate, months / 12), [principal, rate, months]);
  const deposit = useMemo(() => depositMaturity(principal, rate, months), [principal, rate, months]);
  const saving = useMemo(() => installmentSavingMaturity(500000, rate, months), [rate, months]);
  const schedule = useMemo(() => loanSchedule(loanPrincipal, rate, loanMonths, loanMethod), [loanPrincipal, rate, loanMonths, loanMethod]);
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
  const retire = useMemo(() => retirementTargetAsset(4000000, 4), []);

  const [dividendPrincipal, setDividendPrincipal] = useState(10000000);
  const [dividendYield, setDividendYield] = useState(5);
  const [dividendYears, setDividendYears] = useState(10);
  const [dividendFrequency, setDividendFrequency] = useState<"monthly" | "quarterly" | "yearly">("quarterly");

  const [aNum, setANum] = useState(0);
  const [bNum, setBNum] = useState(0);
  const [op, setOp] = useState<"+" | "-" | "*" | "/">("+");

  const simpleCalcResult = useMemo(() => {
    if (op === "+") return aNum + bNum;
    if (op === "-") return aNum - bNum;
    if (op === "*") return aNum * bNum;
    if (bNum === 0) return 0;
    return aNum / bNum;
  }, [aNum, bNum, op]);

  const dividend = useMemo(() => {
    const periodsPerYear = dividendFrequency === "monthly" ? 12 : dividendFrequency === "quarterly" ? 4 : 1;
    const periodRate = dividendYield / 100 / periodsPerYear;
    const totalPeriods = dividendYears * periodsPerYear;
    let balance = dividendPrincipal;
    let totalDividend = 0;
    for (let i = 0; i < totalPeriods; i++) {
      const d = balance * periodRate;
      totalDividend += d;
      balance += d;
    }
    return {
      annualDividendNow: dividendPrincipal * (dividendYield / 100),
      finalBalance: balance,
      totalDividend,
      estimatedAnnualDividendAfterYears: balance * (dividendYield / 100)
    };
  }, [dividendPrincipal, dividendYield, dividendYears, dividendFrequency]);

  return (
    <main className="container">
      <h1 className="h1">금융 계산기</h1>
      <div style={{ marginBottom: 12 }}><Link href="/">← 홈으로</Link></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>일반 계산기</h3>
        <div className="grid grid-2">
          <label>숫자 A <FormattedNumberInput value={aNum} onChange={setANum} /></label>
          <label>연산자
            <select value={op} onChange={(e) => setOp(e.target.value as "+" | "-" | "*" | "/")}>
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
          </label>
          <label>숫자 B <FormattedNumberInput value={bNum} onChange={setBNum} /></label>
          <div className="card">결과: {Number.isFinite(simpleCalcResult) ? simpleCalcResult.toLocaleString("ko-KR") : "-"}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>단리/복리/예적금</h3>
        <div className="grid grid-2">
          <label>원금 <FormattedNumberInput value={principal} onChange={setPrincipal} /></label>
          <label>연이율(%) <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label>
          <label>기간(개월) <input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} /></label>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">단리 이자: {simple.toLocaleString("ko-KR")}원</div>
        <div className="card">복리 만기금액: {Math.round(compound).toLocaleString("ko-KR")}원</div>
        <div className="card">예금 만기(원금+이자): {Math.round(deposit.maturity).toLocaleString("ko-KR")}원</div>
        <div className="card">적금 만기(월 50만원): {Math.round(saving.maturity).toLocaleString("ko-KR")}원</div>
        <div className="card">은퇴 필요자산(월400만원, SWR4%): {Math.round(retire).toLocaleString("ko-KR")}원</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>대출 계산기 (3방식)</h3>
        <div className="grid grid-2">
          <label>대출원금 <FormattedNumberInput value={loanPrincipal} onChange={setLoanPrincipal} /></label>
          <label>연이율(%) <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label>
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
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ marginTop: 0 }}>상환 스케줄 미리보기 (1~12회차)</h3>
          <button onClick={downloadCsv}>전체 회차 CSV 다운로드</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>회차</th>
              <th>납입액</th>
              <th>원금</th>
              <th>이자</th>
              <th>잔액</th>
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
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>배당 계산기 (예적금과 분리)</h3>
        <div className="grid grid-2">
          <label>
            투자금액
            <FormattedNumberInput value={dividendPrincipal} onChange={setDividendPrincipal} />
          </label>
          <label>
            배당률(연 %)
            <input type="number" step="0.1" value={dividendYield} onChange={(e) => setDividendYield(Number(e.target.value))} />
          </label>
          <label>
            배당 주기
            <select value={dividendFrequency} onChange={(e) => setDividendFrequency(e.target.value as "monthly" | "quarterly" | "yearly")}>
              <option value="monthly">월배당</option>
              <option value="quarterly">분기배당</option>
              <option value="yearly">연배당</option>
            </select>
          </label>
          <label>
            재투자 기간(년)
            <input type="number" value={dividendYears} onChange={(e) => setDividendYears(Number(e.target.value))} />
          </label>
        </div>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="card">지금 기준 연간 배당금: {Math.round(dividend.annualDividendNow).toLocaleString("ko-KR")}원</div>
          <div className="card">{dividendYears}년 재투자 후 자산: {Math.round(dividend.finalBalance).toLocaleString("ko-KR")}원</div>
          <div className="card">{dividendYears}년 총 배당금 합계: {Math.round(dividend.totalDividend).toLocaleString("ko-KR")}원</div>
          <div className="card">{dividendYears}년 후 예상 연간 배당금: {Math.round(dividend.estimatedAnnualDividendAfterYears).toLocaleString("ko-KR")}원</div>
        </div>
      </div>
    </main>
  );
}
