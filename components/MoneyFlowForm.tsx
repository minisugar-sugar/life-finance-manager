"use client";

import { useState } from "react";
import { db, type ExpenseKind } from "@/lib/local-db";
import { toKo } from "@/lib/labels";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

export function MoneyFlowForm({ month, onDone }: { month: string; onDone?: () => void }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [category, setCategory] = useState("SALARY");
  const [expenseKind, setExpenseKind] = useState<ExpenseKind>("fixed");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addMoney({
      type: type as any,
      amount,
      label: memo || category,
      month,
      ...(type === "expense" ? { expenseKind } : {})
    });
    setAmount(0);
    setMemo("");
    onDone?.();
    alert("입력 완료!");
  };

  const fixedExpense = ["HOUSING", "INSURANCE", "LOAN_REPAYMENT", "COMMUNICATION_FEE", "MAINTENANCE_FEE", "ACADEMY_FEE"];
  const variableExpense = ["FOOD", "TRANSPORT", "LEISURE", "MEDICAL", "OTHER"];

  const categoryOptions =
    type === "income"
      ? ["SALARY", "SIDE", "OTHER"]
      : type === "expense"
        ? (expenseKind === "fixed" ? fixedExpense : variableExpense)
        : type === "invest"
          ? ["STOCK", "ETF", "BOND", "OTHER"]
          : ["INSTALLMENT_SAVING", "DEPOSIT", "CMA", "OTHER"];

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>돈 기록 추가 ({month})</h3>
      <div className="grid grid-2">
        <select value={type} onChange={(e) => { setType(e.target.value); setCategory("OTHER"); }}>
          <option value="income">수입</option><option value="expense">지출</option><option value="invest">투자</option><option value="save">저축</option>
        </select>

        {type === "expense" ? (
          <select value={expenseKind} onChange={(e) => setExpenseKind(e.target.value as ExpenseKind)}>
            <option value="fixed">고정지출</option>
            <option value="variable">변동지출</option>
          </select>
        ) : (
          <div />
        )}

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categoryOptions.map((c) => <option key={c} value={c}>{toKo(c)}</option>)}
        </select>
        <FormattedNumberInput value={amount} onChange={setAmount} placeholder="금액" />
        <input placeholder="메모(비워두면 선택한 항목명으로 저장)" value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>
      <button style={{ marginTop: 10 }}>추가</button>
    </form>
  );
}
