"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { db, type DividendFrequency } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { depositMaturity, installmentSavingMaturity } from "@/lib/calculators";

export default function RetirementPage() {
  const retire = db.getRetire();
  const asset = db.getAssets();

  const [currentAge, setCurrentAge] = useState(retire.currentAge);
  const [targetRetireAge, setTargetRetireAge] = useState(retire.targetRetireAge);
  const [targetMonthlyLivingCost, setTargetMonthlyLivingCost] = useState(retire.targetMonthlyLivingCost);

  // A. 현재 자산
  const [cash, setCash] = useState(asset.cash);
  const [depositPrincipal, setDepositPrincipal] = useState(asset.depositPrincipal);
  const [depositRatePct, setDepositRatePct] = useState(asset.depositRatePct);
  const [depositTermMonths, setDepositTermMonths] = useState(asset.depositTermMonths);
  const [savingMonthlyAmount, setSavingMonthlyAmount] = useState(asset.savingMonthlyAmount);
  const [savingRatePct, setSavingRatePct] = useState(asset.savingRatePct);
  const [savingTermMonths, setSavingTermMonths] = useState(asset.savingTermMonths);
  const [stockEtf, setStockEtf] = useState(asset.stockEtf);
  const [bond, setBond] = useState(asset.bond);
  const [realEstateSelf, setRealEstateSelf] = useState(asset.realEstateSelf);
  const [realEstateRent, setRealEstateRent] = useState(asset.realEstateRent);
  const [otherAsset, setOtherAsset] = useState(asset.otherAsset);

  // B. 배당 투자
  const [dividendPrincipal, setDividendPrincipal] = useState(asset.dividendPrincipal);
  const [dividendYieldPct, setDividendYieldPct] = useState(asset.dividendYieldPct);
  const [dividendMonthlyContribution, setDividendMonthlyContribution] = useState(asset.dividendMonthlyContribution);
  const [dividendFrequency, setDividendFrequency] = useState<DividendFrequency>(asset.dividendFrequency);

  // C. 개인연금
  const [personalPensionCurrentBalance, setPersonalPensionCurrentBalance] = useState(asset.personalPensionCurrentBalance);
  const [personalPensionMonthlyContribution, setPersonalPensionMonthlyContribution] = useState(asset.personalPensionMonthlyContribution);
  const [personalPensionExpectedReturnPct, setPersonalPensionExpectedReturnPct] = useState(asset.personalPensionExpectedReturnPct);
  const [personalPensionStartAge, setPersonalPensionStartAge] = useState(asset.personalPensionStartAge);
  const [personalPensionPayoutYears, setPersonalPensionPayoutYears] = useState(asset.personalPensionPayoutYears ?? 20);

  // D. 국민연금
  const [nationalPensionCurrentBalance, setNationalPensionCurrentBalance] = useState(asset.nationalPensionCurrentBalance);
  const [nationalPensionMonthlyContribution, setNationalPensionMonthlyContribution] = useState(asset.nationalPensionMonthlyContribution);
  const [nationalPensionExpectedReturnPct, setNationalPensionExpectedReturnPct] = useState(asset.nationalPensionExpectedReturnPct);
  const [nationalPensionStartAge, setNationalPensionStartAge] = useState(asset.nationalPensionStartAge || 65);

  // 기타 월수입/지출
  const [rentIncome, setRentIncome] = useState(asset.rentIncome);
  const [retireOtherMonthly, setRetireOtherMonthly] = useState(asset.retireOtherMonthly);
  const [bankInterestPrincipal, setBankInterestPrincipal] = useState(asset.bankInterestPrincipal);
  const [bankInterestRatePct, setBankInterestRatePct] = useState(asset.bankInterestRatePct);
  const [livingExpense, setLivingExpense] = useState(asset.livingExpense);
  const [loanPayment, setLoanPayment] = useState(asset.loanPayment);
  const [insurancePayment, setInsurancePayment] = useState(asset.insurancePayment);
  const [otherExpense, setOtherExpense] = useState(asset.otherExpense);

  const calc = useMemo(() => {
    const deposit = depositMaturity(depositPrincipal, depositRatePct, depositTermMonths);
    const saving = installmentSavingMaturity(savingMonthlyAmount, savingRatePct, savingTermMonths);

    const periodsPerYear = dividendFrequency === "monthly" ? 12 : dividendFrequency === "quarterly" ? 4 : 1;
    const periodRate = (dividendYieldPct / 100) / periodsPerYear;
    const yearsToRetire = Math.max(targetRetireAge - currentAge, 0);
    const totalPeriods = yearsToRetire * periodsPerYear;

    const currentMonthlyDividend = (dividendPrincipal * (dividendYieldPct / 100)) / 12;
    let dividendBalanceAtRetire = dividendPrincipal;
    for (let i = 0; i < totalPeriods; i++) {
      dividendBalanceAtRetire += dividendBalanceAtRetire * periodRate;
      dividendBalanceAtRetire += dividendMonthlyContribution * (12 / periodsPerYear);
    }
    const retireMonthlyDividend = (dividendBalanceAtRetire * (dividendYieldPct / 100)) / 12;

    const yearsToPersonalStart = Math.max(personalPensionStartAge - currentAge, 0);
    const ppRate = (personalPensionExpectedReturnPct / 100) / 12;
    let personalFund = personalPensionCurrentBalance;
    for (let i = 0; i < yearsToPersonalStart * 12; i++) {
      personalFund = personalFund * (1 + ppRate) + personalPensionMonthlyContribution;
    }
    const personalMonthlyPayout = personalPensionPayoutYears > 0 ? personalFund / (personalPensionPayoutYears * 12) : 0;

    const yearsToNationalStart = Math.max(nationalPensionStartAge - currentAge, 0);
    const npRate = (nationalPensionExpectedReturnPct / 100) / 12;
    const contributionMonths = Math.max((Math.min(60, nationalPensionStartAge) - currentAge) * 12, 0); // 60세까지만 납부
    let nationalFund = nationalPensionCurrentBalance;
    for (let i = 0; i < yearsToNationalStart * 12; i++) {
      const add = i < contributionMonths ? nationalPensionMonthlyContribution : 0;
      nationalFund = nationalFund * (1 + npRate) + add;
    }
    const nationalMonthlyPayout = nationalFund / (25 * 12);

    const bankInterestMonthly = (bankInterestPrincipal * (bankInterestRatePct / 100)) / 12;
    const retireMonthlyIncome = bankInterestMonthly + retireMonthlyDividend + rentIncome + nationalMonthlyPayout + personalMonthlyPayout + retireOtherMonthly;

    const monthlyExpense = livingExpense + loanPayment + insurancePayment + otherExpense;
    const monthlyGap = targetMonthlyLivingCost - retireMonthlyIncome;

    const currentAsset =
      cash +
      deposit.maturity +
      saving.maturity +
      stockEtf +
      bond +
      realEstateSelf +
      realEstateRent +
      otherAsset +
      dividendPrincipal +
      personalPensionCurrentBalance +
      nationalPensionCurrentBalance;

    const targetAsset = (targetMonthlyLivingCost * 12) / 0.04;
    const achievementRate = targetAsset > 0 ? (currentAsset / targetAsset) * 100 : 0;
    const additionalMonthlyPrep = Math.max(monthlyGap, 0);

    return {
      depositMaturity: deposit.maturity,
      savingMaturity: saving.maturity,
      currentMonthlyDividend,
      dividendBalanceAtRetire,
      retireMonthlyDividend,
      personalFundAtStart: personalFund,
      personalMonthlyPayout,
      nationalFundAtStart: nationalFund,
      nationalMonthlyPayout,
      bankInterestMonthly,
      retireMonthlyIncome,
      monthlyExpense,
      monthlyGap,
      currentAsset,
      targetAsset,
      achievementRate,
      additionalMonthlyPrep,
      pensionGapYears: Math.max(nationalPensionStartAge - targetRetireAge, 0)
    };
  }, [
    depositPrincipal, depositRatePct, depositTermMonths,
    savingMonthlyAmount, savingRatePct, savingTermMonths,
    dividendPrincipal, dividendYieldPct, dividendMonthlyContribution, dividendFrequency,
    personalPensionCurrentBalance, personalPensionMonthlyContribution, personalPensionExpectedReturnPct, personalPensionStartAge, personalPensionPayoutYears,
    nationalPensionCurrentBalance, nationalPensionMonthlyContribution, nationalPensionExpectedReturnPct, nationalPensionStartAge,
    currentAge, targetRetireAge, targetMonthlyLivingCost,
    cash, stockEtf, bond, realEstateSelf, realEstateRent, otherAsset,
    rentIncome, retireOtherMonthly, bankInterestPrincipal, bankInterestRatePct,
    livingExpense, loanPayment, insurancePayment, otherExpense
  ]);

  const saveAll = () => {
    db.setRetire({ currentAge, targetRetireAge, targetMonthlyLivingCost });
    db.setAssets({
      ...asset,
      cash,
      depositPrincipal,
      depositRatePct,
      depositTermMonths,
      depositBalance: Math.round(calc.depositMaturity),
      savingMonthlyAmount,
      savingRatePct,
      savingTermMonths,
      savingBalance: Math.round(calc.savingMaturity),
      stockEtf,
      bond,
      realEstateSelf,
      realEstateRent,
      otherAsset,
      dividendPrincipal,
      dividendMonthlyContribution,
      dividendYieldPct,
      dividendFrequency,
      personalPensionCurrentBalance,
      personalPensionMonthlyContribution,
      personalPensionExpectedReturnPct,
      personalPensionStartAge,
      personalPensionPayoutYears,
      personalPensionMonthly: Math.round(calc.personalMonthlyPayout),
      nationalPensionCurrentBalance,
      nationalPensionMonthlyContribution,
      nationalPensionExpectedReturnPct,
      nationalPensionStartAge,
      nationalPensionMonthly: Math.round(calc.nationalMonthlyPayout),
      rentIncome,
      retireOtherMonthly,
      bankInterestPrincipal,
      bankInterestRatePct,
      livingExpense,
      loanPayment,
      insurancePayment,
      otherExpense
    });
  };

  return (
    <main className="container">
      <h1 className="h1">은퇴 추천 리포트</h1>
      <div style={{ marginBottom: 12 }}><Link href="/">← 홈으로</Link></div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>목표 설정</h3>
        <div className="grid grid-2">
          <label>현재 나이 <FormattedNumberInput value={currentAge} onChange={setCurrentAge} /></label>
          <label>은퇴 나이 <FormattedNumberInput value={targetRetireAge} onChange={setTargetRetireAge} /></label>
          <label>목표 은퇴 월생활비 <FormattedNumberInput value={targetMonthlyLivingCost} onChange={setTargetMonthlyLivingCost} /></label>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>A. 현재 자산</h3>
        <div className="grid grid-2">
          <label>현금 <FormattedNumberInput value={cash} onChange={setCash} /></label>
          <label>예금 원금 <FormattedNumberInput value={depositPrincipal} onChange={setDepositPrincipal} /></label>
          <label>예금 이율(연%) <FormattedNumberInput value={depositRatePct} onChange={setDepositRatePct} /></label>
          <label>예금 기간(개월) <FormattedNumberInput value={depositTermMonths} onChange={setDepositTermMonths} /></label>
          <label>적금 월납입 <FormattedNumberInput value={savingMonthlyAmount} onChange={setSavingMonthlyAmount} /></label>
          <label>적금 이율(연%) <FormattedNumberInput value={savingRatePct} onChange={setSavingRatePct} /></label>
          <label>적금 기간(개월) <FormattedNumberInput value={savingTermMonths} onChange={setSavingTermMonths} /></label>
          <label>주식/ETF <FormattedNumberInput value={stockEtf} onChange={setStockEtf} /></label>
          <label>채권 <FormattedNumberInput value={bond} onChange={setBond} /></label>
          <label>부동산(자가) <FormattedNumberInput value={realEstateSelf} onChange={setRealEstateSelf} /></label>
          <label>부동산(임대자산) <FormattedNumberInput value={realEstateRent} onChange={setRealEstateRent} /></label>
          <label>기타자산 <FormattedNumberInput value={otherAsset} onChange={setOtherAsset} /></label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>예금 만기: {Math.round(calc.depositMaturity).toLocaleString("ko-KR")}원 · 적금 만기: {Math.round(calc.savingMaturity).toLocaleString("ko-KR")}원</div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>B. 배당 투자</h3>
        <div className="grid grid-2">
          <label>현재 배당 투자금 <FormattedNumberInput value={dividendPrincipal} onChange={setDividendPrincipal} /></label>
          <label>배당률(연 %) <FormattedNumberInput value={dividendYieldPct} onChange={setDividendYieldPct} /></label>
          <label>월 추가 적립액 <FormattedNumberInput value={dividendMonthlyContribution} onChange={setDividendMonthlyContribution} /></label>
          <label>
            배당 주기
            <select value={dividendFrequency} onChange={(e) => setDividendFrequency(e.target.value as DividendFrequency)}>
              <option value="monthly">월</option>
              <option value="quarterly">분기</option>
              <option value="yearly">연</option>
            </select>
          </label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          현재 월 배당금: <b>{Math.round(calc.currentMonthlyDividend).toLocaleString("ko-KR")}원</b> ·
          은퇴 시점 배당 원금: <b>{Math.round(calc.dividendBalanceAtRetire).toLocaleString("ko-KR")}원</b> ·
          은퇴 시점 월 배당금: <b>{Math.round(calc.retireMonthlyDividend).toLocaleString("ko-KR")}원</b>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>C. 개인연금</h3>
        <div className="grid grid-2">
          <label>현재 적립금 <FormattedNumberInput value={personalPensionCurrentBalance} onChange={setPersonalPensionCurrentBalance} /></label>
          <label>은퇴까지 월 납입 <FormattedNumberInput value={personalPensionMonthlyContribution} onChange={setPersonalPensionMonthlyContribution} /></label>
          <label>기대수익률(연 %) <FormattedNumberInput value={personalPensionExpectedReturnPct} onChange={setPersonalPensionExpectedReturnPct} /></label>
          <label>개시 나이 <FormattedNumberInput value={personalPensionStartAge} onChange={setPersonalPensionStartAge} /></label>
          <label>수령 기간(년) <FormattedNumberInput value={personalPensionPayoutYears} onChange={setPersonalPensionPayoutYears} /></label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          개시 시점 예상 적립금: <b>{Math.round(calc.personalFundAtStart).toLocaleString("ko-KR")}원</b> ·
          예상 월 수령액: <b>{Math.round(calc.personalMonthlyPayout).toLocaleString("ko-KR")}원</b>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>D. 국민연금 (납부 60세까지만 반영)</h3>
        <div className="grid grid-2">
          <label>현재 적립금(추정) <FormattedNumberInput value={nationalPensionCurrentBalance} onChange={setNationalPensionCurrentBalance} /></label>
          <label>앞으로 월 납입액 <FormattedNumberInput value={nationalPensionMonthlyContribution} onChange={setNationalPensionMonthlyContribution} /></label>
          <label>개시 나이 <FormattedNumberInput value={nationalPensionStartAge} onChange={setNationalPensionStartAge} /></label>
          <label>기대수익률(연 %) <FormattedNumberInput value={nationalPensionExpectedReturnPct} onChange={setNationalPensionExpectedReturnPct} /></label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          개시 시점 예상 자금: <b>{Math.round(calc.nationalFundAtStart).toLocaleString("ko-KR")}원</b> ·
          예상 월 수령액: <b>{Math.round(calc.nationalMonthlyPayout).toLocaleString("ko-KR")}원</b>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>기타 월수입/월지출</h3>
        <div className="grid grid-2">
          <label>월 임대수익 <FormattedNumberInput value={rentIncome} onChange={setRentIncome} /></label>
          <label>은행이자 원금 <FormattedNumberInput value={bankInterestPrincipal} onChange={setBankInterestPrincipal} /></label>
          <label>은행 이자율(연 %) <FormattedNumberInput value={bankInterestRatePct} onChange={setBankInterestRatePct} /></label>
          <label>월 기타 은퇴수입 <FormattedNumberInput value={retireOtherMonthly} onChange={setRetireOtherMonthly} /></label>
          <label>월 생활비 <FormattedNumberInput value={livingExpense} onChange={setLivingExpense} /></label>
          <label>월 대출상환 <FormattedNumberInput value={loanPayment} onChange={setLoanPayment} /></label>
          <label>월 보험료 <FormattedNumberInput value={insurancePayment} onChange={setInsurancePayment} /></label>
          <label>월 기타지출 <FormattedNumberInput value={otherExpense} onChange={setOtherExpense} /></label>
        </div>
      </div>

      <button onClick={saveAll} style={{ marginBottom: 12 }}>전체 저장</button>

      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <div className="card">1. 목표 은퇴 월생활비: {targetMonthlyLivingCost.toLocaleString("ko-KR")}원</div>
        <div className="card">2. 은퇴 후 예상 월수입 합계: {Math.round(calc.retireMonthlyIncome).toLocaleString("ko-KR")}원</div>
        <div className="card">3. 월 부족분/여유분: {Math.round(calc.monthlyGap).toLocaleString("ko-KR")}원</div>
        <div className="card">4. 목표 은퇴자산 대비 달성률: {calc.achievementRate.toFixed(1)}%</div>
        <div className="card">5. 지금부터 월 추가 준비 필요액: {Math.round(calc.additionalMonthlyPrep).toLocaleString("ko-KR")}원</div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>추천</h3>
        <ul>
          <li>월 부족분 {Math.round(calc.monthlyGap).toLocaleString("ko-KR")}원 → 배당 적립 증액 + 지출 절감 + 은퇴 1년 연기 검토</li>
          <li>국민연금 개시 전 공백 {calc.pensionGapYears}년 → 브릿지 생활비 자금 별도 확보</li>
          <li>개인연금 수령기간 {personalPensionPayoutYears}년 기준. 기간을 늘리면 월수령은 줄고 안정성은 올라감</li>
        </ul>
      </div>
    </main>
  );
}
