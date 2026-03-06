"use client";

import { useEffect, useMemo, useState } from "react";
import { db, type MoneyRow } from "@/lib/local-db";
import { toKo } from "@/lib/labels";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";

const typeOrder: MoneyRow["type"][] = ["income", "expense", "invest", "save"];

export function MoneyFlowList({ month, refreshKey = 0 }: { month: string; refreshKey?: number }) {
  const [rows, setRows] = useState<MoneyRow[]>([]);
  const [editing, setEditing] = useState<MoneyRow | null>(null);

  const load = () => setRows(db.listMoney(month));
  useEffect(() => {
    load();
  }, [refreshKey, month]);

  const grouped = useMemo(() => {
    const map = new Map<MoneyRow["type"], MoneyRow[]>();
    for (const t of typeOrder) map.set(t, []);
    for (const r of rows) map.get(r.type)?.push(r);
    return map;
  }, [rows]);

  const renderTable = (list: MoneyRow[]) => (
    <table className="table">
      <thead>
        <tr>
          <th>항목</th>
          <th>금액</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {list.map((r) => (
          <tr key={r.id}>
            <td>{toKo(r.label)}</td>
            <td>{r.amount.toLocaleString("ko-KR")}원</td>
            <td style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setEditing(r)}>수정</button>
              <button
                onClick={() => {
                  db.deleteMoney(r.id);
                  load();
                }}
              >
                삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>기록 목록 ({month})</h3>

      {typeOrder.map((type) => {
        const list = grouped.get(type) ?? [];
        if (list.length === 0) return null;
        const subtotal = list.reduce((a, b) => a + b.amount, 0);

        if (type !== "expense") {
          return (
            <div key={type} style={{ marginBottom: 14 }}>
              <h4 style={{ marginBottom: 8 }}>
                {toKo(type)} 묶음 · 합계 {subtotal.toLocaleString("ko-KR")}원
              </h4>
              {renderTable(list)}
            </div>
          );
        }

        const fixedExpenseLabels = new Set(["HOUSING", "INSURANCE", "LOAN_REPAYMENT", "COMMUNICATION_FEE", "MAINTENANCE_FEE", "ACADEMY_FEE"]);
        const fixed = list.filter((x) => x.expenseKind === "fixed" || fixedExpenseLabels.has(x.label));
        const variable = list.filter((x) => !(x.expenseKind === "fixed" || fixedExpenseLabels.has(x.label)));
        const fixedSum = fixed.reduce((a, b) => a + b.amount, 0);
        const variableSum = variable.reduce((a, b) => a + b.amount, 0);

        return (
          <div key={type} style={{ marginBottom: 14 }}>
            <h4 style={{ marginBottom: 8 }}>지출 묶음 · 합계 {subtotal.toLocaleString("ko-KR")}원</h4>

            <h5 style={{ marginBottom: 6 }}>{toKo("fixed")} · {fixedSum.toLocaleString("ko-KR")}원</h5>
            {fixed.length > 0 ? renderTable(fixed) : <div className="muted">고정지출 기록 없음</div>}

            <h5 style={{ margin: "12px 0 6px" }}>{toKo("variable")} · {variableSum.toLocaleString("ko-KR")}원</h5>
            {variable.length > 0 ? renderTable(variable) : <div className="muted">변동지출 기록 없음</div>}
          </div>
        );
      })}

      {editing && (
        <div className="card" style={{ marginTop: 10, border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>기록 수정</h3>
          <div className="grid grid-2">
            <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            <FormattedNumberInput value={editing.amount} onChange={(v) => setEditing({ ...editing, amount: v })} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                if (editing) db.updateMoney(editing.id, { label: editing.label, amount: editing.amount });
                setEditing(null);
                load();
              }}
            >
              저장
            </button>
            <button onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}
    </section>
  );
}
