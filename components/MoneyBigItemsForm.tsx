"use client";

import { useState } from "react";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { db } from "@/lib/local-db";

export function MoneyBigItemsForm({ month, onDone }: { month: string; onDone?: () => void }) {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [invest, setInvest] = useState(0);
  const [save, setSave] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (income > 0) db.addMoney({ type: "income", label: "월수입", amount: income, month });
    if (expense > 0) db.addMoney({ type: "expense", label: "월지출", amount: expense, month, expenseKind: "fixed" });
    if (invest > 0) db.addMoney({ type: "invest", label: "월투자", amount: invest, month });
    if (save > 0) db.addMoney({ type: "save", label: "월저축", amount: save, month });

    setIncome(0); setExpense(0); setInvest(0); setSave(0);
    onDone?.();
    alert("큰 항목 입력 완료!");
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>큰 항목 빠른 입력 ({month})</h3>
      <div className="grid grid-2">
        <label>월수입 <FormattedNumberInput value={income} onChange={setIncome} /></label>
        <label>월지출 <FormattedNumberInput value={expense} onChange={setExpense} /></label>
        <label>월투자 <FormattedNumberInput value={invest} onChange={setInvest} /></label>
        <label>월저축 <FormattedNumberInput value={save} onChange={setSave} /></label>
      </div>
      <button style={{ marginTop: 10 }}>한 번에 추가</button>
    </form>
  );
}
