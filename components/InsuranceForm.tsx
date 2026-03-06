"use client";

import { useState } from "react";
import { db } from "@/lib/local-db";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

export function InsuranceForm() {
  const [form, setForm] = useState({ insurer: "", productName: "", insuranceType: "INDEMNITY", purpose: "PROTECTION", endDate: "" });
  const [monthlyPremium, setMonthlyPremium] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addInsurance({
      insurer: form.insurer,
      productName: form.productName,
      insuranceType: form.insuranceType,
      purpose: form.purpose,
      monthlyPremium,
      status: "ACTIVE",
      endDate: form.endDate || null
    });
    alert("보험이 저장됐어요");
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>보험 등록</h3>
      <div className="grid grid-2">
        <input placeholder="보험사" value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} required />
        <input placeholder="상품명" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
        <FormattedNumberInput value={monthlyPremium} onChange={setMonthlyPremium} placeholder="월 보험료" />
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
      </div>
      <button style={{ marginTop: 12 }}>등록</button>
    </form>
  );
}
