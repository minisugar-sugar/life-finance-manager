"use client";

import { useEffect, useState } from "react";
import type { MonthlySummary } from "@/lib/types";
import { db, monthKey } from "@/lib/local-db";

type DashboardSummary = MonthlySummary & { fixedExpense: number; variableExpense: number };

const initial: DashboardSummary = {
  income: 0,
  expense: 0,
  fixedExpense: 0,
  variableExpense: 0,
  invest: 0,
  save: 0,
  insurance: 0,
  net: 0
};

export function MonthlyDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(initial);

  useEffect(() => {
    const load = () => {
      const rows = db.listMoney(monthKey());
      const insurance = db.listInsurance().filter((x) => x.status === "ACTIVE").reduce((a, b) => a + Number(b.monthlyPremium), 0);
      const income = rows.filter((r) => r.type === "income").reduce((a, b) => a + b.amount, 0);
      const expenseRows = rows.filter((r) => r.type === "expense");
      const fixedExpenseLabels = new Set(["HOUSING", "INSURANCE", "LOAN_REPAYMENT", "COMMUNICATION_FEE", "MAINTENANCE_FEE", "ACADEMY_FEE"]);
      const fixedExpense = expenseRows
        .filter((r) => r.expenseKind === "fixed" || fixedExpenseLabels.has(r.label))
        .reduce((a, b) => a + b.amount, 0);
      const variableExpense = expenseRows
        .filter((r) => !(r.expenseKind === "fixed" || fixedExpenseLabels.has(r.label)))
        .reduce((a, b) => a + b.amount, 0);
      const expense = fixedExpense + variableExpense;

      const invest = rows.filter((r) => r.type === "invest").reduce((a, b) => a + b.amount, 0);
      const save = rows.filter((r) => r.type === "save").reduce((a, b) => a + b.amount, 0);
      setSummary({ income, expense, invest, save, insurance, net: income - expense, fixedExpense, variableExpense });
    };

    load();
    window.addEventListener("lfm:data-changed", load);
    return () => window.removeEventListener("lfm:data-changed", load);
  }, []);

  const cards = [
    ["월 수입", summary.income],
    ["월 지출(총)", summary.expense],
    ["월 고정지출", summary.fixedExpense],
    ["월 변동지출", summary.variableExpense],
    ["월 투자", summary.invest],
    ["월 저축", summary.save],
    ["월 보험료", summary.insurance],
    ["월 잉여자금", summary.net]
  ] as const;

  return (
    <>
      {cards.map(([label, value]) => (
        <div className="card" key={label}>
          <div className="muted">{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{new Intl.NumberFormat("ko-KR").format(value)}원</div>
        </div>
      ))}
    </>
  );
}
