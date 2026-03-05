"use client";

import { useState } from "react";
import { db } from "@/lib/local-db";

export function RetirementQuickForm({ onSaved }: { onSaved?: () => void }) {
  const cur = db.getRetire();
  const [currentAge, setCurrentAge] = useState(cur.currentAge);
  const [targetRetireAge, setTargetRetireAge] = useState(cur.targetRetireAge);
  const [targetMonthlyLivingCost, setTargetMonthlyLivingCost] = useState(cur.targetMonthlyLivingCost);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    db.setRetire({ currentAge, targetRetireAge, targetMonthlyLivingCost });
    onSaved?.();
  };

  return (
    <form className="card" onSubmit={save} style={{ marginBottom: 12 }}>
      <h3 style={{ marginTop: 0 }}>은퇴 목표 빠른 설정</h3>
      <div className="grid grid-2">
        <label>현재 나이 <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} /></label>
        <label>은퇴 나이 <input type="number" value={targetRetireAge} onChange={(e) => setTargetRetireAge(Number(e.target.value))} /></label>
        <label>목표 월생활비 <input type="number" value={targetMonthlyLivingCost} onChange={(e) => setTargetMonthlyLivingCost(Number(e.target.value))} /></label>
      </div>
      <button style={{ marginTop: 10 }}>저장</button>
    </form>
  );
}
