"use client";

import { useState } from "react";
import { db } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

export function CurrentAssetBoard({ onSaved }: { onSaved?: () => void }) {
  const cur = db.getAssets();
  const [cash, setCash] = useState(cur.cash);
  const [deposit, setDeposit] = useState(cur.depositBalance);
  const [saving, setSaving] = useState(cur.savingBalance);
  const [stock, setStock] = useState(cur.stockEtf);
  const [bond, setBond] = useState(cur.bond);
  const [pension, setPension] = useState(cur.pension);
  const [realEstateSelf, setRealEstateSelf] = useState(cur.realEstateSelf);
  const [realEstateRent, setRealEstateRent] = useState(cur.realEstateRent);
  const [crypto, setCrypto] = useState(cur.crypto);
  const [other, setOther] = useState(cur.otherAsset);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    db.setAssets({
      ...cur,
      cash,
      depositBalance: deposit,
      savingBalance: saving,
      stockEtf: stock,
      bond,
      pension,
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
      <div className="grid grid-2">
        <label>현금 <FormattedNumberInput value={cash} onChange={setCash} /></label>
        <label>예금 잔액 <FormattedNumberInput value={deposit} onChange={setDeposit} /></label>
        <label>적금 잔액 <FormattedNumberInput value={saving} onChange={setSaving} /></label>
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
