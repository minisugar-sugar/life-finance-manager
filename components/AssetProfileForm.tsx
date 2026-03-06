"use client";

import { useState } from "react";
import { db, type AssetProfile, type DividendFrequency } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

type Field = { key: keyof AssetProfile; label: string };

const assetFields: Field[] = [
  { key: "cash", label: "현금" },
  { key: "depositBalance", label: "예금 잔액" },
  { key: "savingBalance", label: "적금 잔액" },
  { key: "stockEtf", label: "주식/ETF" },
  { key: "bond", label: "채권" },
  { key: "pension", label: "연금자산" },
  { key: "crypto", label: "코인" },
  { key: "realEstateSelf", label: "자가 부동산" },
  { key: "realEstateRent", label: "임대 부동산" },
  { key: "otherAsset", label: "기타 자산" }
];

const incomeFields: Field[] = [
  { key: "salaryIncome", label: "월 급여 수입" },
  { key: "sideIncome", label: "월 부수입" },
  { key: "dividendIncome", label: "월 배당 수입" },
  { key: "rentIncome", label: "월 임대 수입" },
  { key: "otherIncome", label: "월 기타 수입" }
];

const expenseFields: Field[] = [
  { key: "livingExpense", label: "월 생활비" },
  { key: "loanPayment", label: "월 대출상환" },
  { key: "insurancePayment", label: "월 보험료" },
  { key: "otherExpense", label: "월 기타지출" }
];

export function AssetProfileForm({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<AssetProfile>(db.getAssets());

  const setValue = (k: keyof AssetProfile, v: number) => setForm((prev) => ({ ...prev, [k]: v }));
  const setFrequency = (v: DividendFrequency) => setForm((prev) => ({ ...prev, dividendFrequency: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    db.setAssets(form);
    onSaved?.();
    alert("현재 자산/수입/지출 저장 완료!");
  };

  return (
    <form className="card" onSubmit={save} style={{ marginBottom: 12 }}>
      <h3 style={{ marginTop: 0 }}>현재 자산/수입/지출 입력</h3>

      <h4>① 현재 자산</h4>
      <div className="grid grid-2" style={{ marginBottom: 10 }}>
        {assetFields.map((f) => (
          <label key={String(f.key)}>
            {f.label}
            <FormattedNumberInput value={form[f.key] as number} onChange={(v) => setValue(f.key, v)} />
          </label>
        ))}
      </div>

      <h4>② 월 수입</h4>
      <div className="grid grid-2" style={{ marginBottom: 10 }}>
        {incomeFields.map((f) => (
          <label key={String(f.key)}>
            {f.label}
            <FormattedNumberInput value={form[f.key] as number} onChange={(v) => setValue(f.key, v)} />
          </label>
        ))}
      </div>

      <h4>③ 배당 재투자 가정 (은퇴 계산용)</h4>
      <div className="grid grid-2" style={{ marginBottom: 10 }}>
        <label>
          배당 투자 원금
          <FormattedNumberInput value={form.dividendPrincipal} onChange={(v) => setValue("dividendPrincipal", v)} />
        </label>
        <label>
          배당률(연 %)
          <FormattedNumberInput value={form.dividendYieldPct} onChange={(v) => setValue("dividendYieldPct", v)} />
        </label>
        <label>
          배당 주기
          <select value={form.dividendFrequency} onChange={(e) => setFrequency(e.target.value as DividendFrequency)}>
            <option value="monthly">월배당</option>
            <option value="quarterly">분기배당</option>
          </select>
        </label>
      </div>

      <h4>④ 월 지출</h4>
      <div className="grid grid-2">
        {expenseFields.map((f) => (
          <label key={String(f.key)}>
            {f.label}
            <FormattedNumberInput value={form[f.key] as number} onChange={(v) => setValue(f.key, v)} />
          </label>
        ))}
      </div>

      <button style={{ marginTop: 10 }}>저장</button>
    </form>
  );
}
