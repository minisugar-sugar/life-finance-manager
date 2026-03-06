"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { db, monthKey, type MoneyRow } from "@/lib/local-db";

const COLORS = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export function FlowCharts() {
  const [rows, setRows] = useState<MoneyRow[]>([]);
  useEffect(() => {
    const load = () => setRows(db.listMoney(monthKey()));
    load();
    window.addEventListener("lfm:data-changed", load);
    return () => window.removeEventListener("lfm:data-changed", load);
  }, []);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.type, (map.get(r.type) ?? 0) + r.amount);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  return (
    <div className="grid grid-2" style={{ marginBottom: 16 }}>
      <div className="card" style={{ height: 320 }}>
        <h3 style={{ marginTop: 0 }}>돈 사용 비율</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={byType} dataKey="value" nameKey="name" outerRadius={90} label>{byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
            <Tooltip formatter={(v: number) => `${v.toLocaleString("ko-KR")}원`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{ height: 320 }}>
        <h3 style={{ marginTop: 0 }}>종류별 금액</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={byType}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v: number) => `${v.toLocaleString("ko-KR")}원`} /><Bar dataKey="value" fill="#4f46e5" /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
