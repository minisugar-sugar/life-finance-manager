"use client";

import { useMemo, useState } from "react";
import { db } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { depositMaturity, installmentSavingMaturity } from "@/lib/calculators";

export function CurrentAssetBoard({ onSaved }: { onSaved?: () => void }) {
  const cur = db.getAssets();
  const [cash, setCash] = useState(cur.cash);

  const [depositPrincipal, setDepositPrincipal] = useState(cur.depositPrincipal ?? 0);
  const [depositStartDate, setDepositStartDate] = useState(cur.depositStartDate ?? "");
  const [depositRatePct, setDepositRatePct] = useState(cur.depositRatePct ?? 3);
  const [depositTermMonths, setDepositTermMonths] = useState(cur.depositTermMonths ?? 12);

  const [savingMonthlyAmount, setSavingMonthlyAmount] = useState(cur.savingMonthlyAmount ?? 0);
  const [savingStartDate, setSavingStartDate] = useState(cur.savingStartDate ?? "");
  const [savingRatePct, setSavingRatePct] = useState(cur.savingRatePct ?? 3);
  const [savingTermMonths, setSavingTermMonths] = useState(cur.savingTermMonths ?? 12);

  const [stock, setStock] = useState(cur.stockEtf);
  const [bond, setBond] = useState(cur.bond);
  const [pension, setPension] = useState(cur.pension);

  const [dividendPrincipal, setDividendPrincipal] = useState(cur.dividendPrincipal ?? 0);
  const [dividendMonthlyContribution, setDividendMonthlyContribution] = useState(cur.dividendMonthlyContribution ?? 0);

  const [nationalPensionCurrentBalance, setNationalPensionCurrentBalance] = useState(cur.nationalPensionCurrentBalance ?? 0);
  const [nationalPensionMonthlyContribution, setNationalPensionMonthlyContribution] = useState(cur.nationalPensionMonthlyContribution ?? 0);
  const [personalPensionCurrentBalance, setPersonalPensionCurrentBalance] = useState(cur.personalPensionCurrentBalance ?? 0);
  const [personalPensionMonthlyContribution, setPersonalPensionMonthlyContribution] = useState(cur.personalPensionMonthlyContribution ?? 0);
  const [realEstateSelf, setRealEstateSelf] = useState(cur.realEstateSelf);
  const [realEstateRent, setRealEstateRent] = useState(cur.realEstateRent);
  const [crypto, setCrypto] = useState(cur.crypto);
  const [other, setOther] = useState(cur.otherAsset);

  const depositCalc = useMemo(
    () => depositMaturity(depositPrincipal, depositRatePct, depositTermMonths),
    [depositPrincipal, depositRatePct, depositTermMonths]
  );

  const savingCalc = useMemo(
    () => installmentSavingMaturity(savingMonthlyAmount, savingRatePct, savingTermMonths),
    [savingMonthlyAmount, savingRatePct, savingTermMonths]
  );

  const save = (e: React.FormEvent) => {
    e.preventDefault();

    db.setAssets({
      ...cur,
      cash,

      depositBalance: Math.round(depositCalc.maturity),
      savingBalance: Math.round(savingCalc.maturity),

      depositPrincipal,
      depositStartDate,
      depositRatePct,
      depositTermMonths,

      savingMonthlyAmount,
      savingStartDate,
      savingRatePct,
      savingTermMonths,

      stockEtf: stock,
      bond,
      pension,

      dividendPrincipal,
      dividendMonthlyContribution,
      nationalPensionCurrentBalance,
      nationalPensionMonthlyContribution,
      personalPensionCurrentBalance,
      personalPensionMonthlyContribution,
      realEstateSelf,
      realEstateRent,
      crypto,
      otherAsset: other
    });
    onSaved?.();
  };

  return (
    <form className="card" onSubmit={save}>
      <h3 style={{ marginTop: 0 }}>현재 자산 보드</h3>

      <div className="soft-panel" style={{ marginBottom: 8 }}>
        <b>예금 자동 계산</b>
        <div className="grid grid-2" style={{ marginTop: 6 }}>
          <label>예금 원금 <FormattedNumberInput value={depositPrincipal} onChange={setDepositPrincipal} /></label>
          <label>예금 시작일 <input type="date" value={depositStartDate} onChange={(e) => setDepositStartDate(e.target.value)} /></label>
          <label>예금 연이율(%) <FormattedNumberInput value={depositRatePct} onChange={setDepositRatePct} /></label>
          <label>예금 기간(개월) <FormattedNumberInput value={depositTermMonths} onChange={setDepositTermMonths} /></label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          예금 만기 예상금액: <b>{Math.round(depositCalc.maturity).toLocaleString("ko-KR")}원</b>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 8 }}>
        <b>적금 자동 계산</b>
        <div className="grid grid-2" style={{ marginTop: 6 }}>
          <label>월 적금 납입액 <FormattedNumberInput value={savingMonthlyAmount} onChange={setSavingMonthlyAmount} /></label>
          <label>적금 시작일 <input type="date" value={savingStartDate} onChange={(e) => setSavingStartDate(e.target.value)} /></label>
          <label>적금 연이율(%) <FormattedNumberInput value={savingRatePct} onChange={setSavingRatePct} /></label>
          <label>적금 기간(개월) <FormattedNumberInput value={savingTermMonths} onChange={setSavingTermMonths} /></label>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          적금 만기 예상금액: <b>{Math.round(savingCalc.maturity).toLocaleString("ko-KR")}원</b>
        </div>
      </div>

      <div className="soft-panel" style={{ marginBottom: 8 }}>
        <b>연금/배당 적립 자산</b>
        <div className="grid grid-2" style={{ marginTop: 6 }}>
          <label>현재 배당 투자금 <FormattedNumberInput value={dividendPrincipal} onChange={setDividendPrincipal} /></label>
          <label>배당 월 추가적립액 <FormattedNumberInput value={dividendMonthlyContribution} onChange={setDividendMonthlyContribution} /></label>
          <label>국민연금 현재 적립금 <FormattedNumberInput value={nationalPensionCurrentBalance} onChange={setNationalPensionCurrentBalance} /></label>
          <label>국민연금 월 납입액 <FormattedNumberInput value={nationalPensionMonthlyContribution} onChange={setNationalPensionMonthlyContribution} /></label>
          <label>개인연금 현재 적립금 <FormattedNumberInput value={personalPensionCurrentBalance} onChange={setPersonalPensionCurrentBalance} /></label>
          <label>개인연금 월 납입액 <FormattedNumberInput value={personalPensionMonthlyContribution} onChange={setPersonalPensionMonthlyContribution} /></label>
        </div>
      </div>

      <div className="grid grid-2">
        <label>현금 <FormattedNumberInput value={cash} onChange={setCash} /></label>
        <label>주식/ETF <FormattedNumberInput value={stock} onChange={setStock} /></label>
        <label>채권 <FormattedNumberInput value={bond} onChange={setBond} /></label>
        <label>연금자산 <FormattedNumberInput value={pension} onChange={setPension} /></label>
        <label>자가 부동산 <FormattedNumberInput value={realEstateSelf} onChange={setRealEstateSelf} /></label>
        <label>임대 부동산 <FormattedNumberInput value={realEstateRent} onChange={setRealEstateRent} /></label>
        <label>코인 <FormattedNumberInput value={crypto} onChange={setCrypto} /></label>
        <label>기타 자산 <FormattedNumberInput value={other} onChange={setOther} /></label>
      </div>
      <button style={{ marginTop: 10 }}>자산 저장</button>
    </form>
  );
}
