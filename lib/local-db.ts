"use client";

import { getUserId } from "@/lib/client-auth";

export type MoneyType = "income" | "expense" | "invest" | "save";
export type MoneyRow = { id: string; type: MoneyType; label: string; amount: number; createdAt: number };
export type InsuranceRow = {
  id: string;
  insurer: string;
  productName: string;
  insuranceType: string;
  purpose: string;
  monthlyPremium: number;
  status: string;
  endDate: string | null;
};
export type RetirementProfile = { currentAge: number; targetRetireAge: number; targetMonthlyLivingCost: number };

function key(name: string) {
  return `lfm:${getUserId()}:${name}`;
}

function read<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key(name));
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function write<T>(name: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(name), JSON.stringify(value));
}

export const db = {
  listMoney: () => read<MoneyRow[]>("money", []),
  addMoney: (row: Omit<MoneyRow, "id" | "createdAt">) => {
    const rows = db.listMoney();
    rows.unshift({ ...row, id: crypto.randomUUID(), createdAt: Date.now() });
    write("money", rows);
  },
  deleteMoney: (id: string) => write("money", db.listMoney().filter((r) => r.id !== id)),

  listInsurance: () => read<InsuranceRow[]>("insurance", []),
  addInsurance: (row: Omit<InsuranceRow, "id">) => {
    const rows = db.listInsurance();
    rows.unshift({ ...row, id: crypto.randomUUID() });
    write("insurance", rows);
  },
  updateInsurance: (id: string, patch: Partial<InsuranceRow>) => {
    const rows = db.listInsurance().map((r) => (r.id === id ? { ...r, ...patch } : r));
    write("insurance", rows);
  },
  deleteInsurance: (id: string) => write("insurance", db.listInsurance().filter((r) => r.id !== id)),

  getRetire: () => read<RetirementProfile>("retire", { currentAge: 35, targetRetireAge: 55, targetMonthlyLivingCost: 4000000 }),
  setRetire: (p: RetirementProfile) => write("retire", p)
};
