"use client";

import { useState } from "react";
import { getUserId } from "@/lib/client-auth";

export function MoneyFlowForm({ onDone }: { onDone?: () => void }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [category, setCategory] = useState("SALARY");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId();
    const payload: Record<string, unknown> = { type, amount, memo };

    if (type === "income") payload.category = category;
    if (type === "expense") {
      payload.category = "FIXED";
      payload.subCategory = category;
    }
    if (type === "invest") payload.investType = category;
    if (type === "save") payload.saveType = category;

    await fetch(`/api/records?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setAmount(0);
    setMemo("");
    onDone?.();
  };

  const categoryOptions =
    type === "income"
      ? ["SALARY", "SIDE", "OTHER"]
      : type === "expense"
        ? ["HOUSING", "FOOD", "TRANSPORT", "COMMUNICATION", "UTILITIES", "MEDICAL", "LEISURE", "OTHER"]
        : type === "invest"
          ? ["STOCK", "ETF", "BOND", "FUND", "CRYPTO", "OTHER"]
          : ["INSTALLMENT_SAVING", "DEPOSIT", "CMA", "CASH", "OTHER"];

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>이번 달 돈 기록 추가</h3>
      <div className="grid grid-2">
        <select value={type} onChange={(e) => { setType(e.target.value); setCategory("OTHER"); }}>
          <option value="income">수입</option>
          <option value="expense">지출</option>
          <option value="invest">투자</option>
          <option value="save">저축</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="금액" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
        <input placeholder="메모(예: 월급, 월세)" value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>
      <button style={{ marginTop: 10 }}>추가</button>
    </form>
  );
}
