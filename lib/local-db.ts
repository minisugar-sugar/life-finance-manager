"use client";

import { getUserId } from "@/lib/client-auth";

export type MoneyType = "income" | "expense" | "invest" | "save";
export type MoneyRow = { id: string; type: MoneyType; label: string; amount: number; month: string; createdAt: number };
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

export function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
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
  window.dispatchEvent(new Event("lfm:data-changed"));
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const db = {
  listMoney: (month?: string) => {
    const rows = read<MoneyRow[]>("money", []);
    if (!month) return rows;
    return rows.filter((r) => (r.month ?? monthKey()) === month);
  },
  addMoney: (row: Omit<MoneyRow, "id" | "createdAt">) => {
    const rows = db.listMoney();
    rows.unshift({ ...row, id: makeId(), createdAt: Date.now() });
    write("money", rows);
  },
  updateMoney: (id: string, patch: Partial<MoneyRow>) => {
    const rows = db.listMoney().map((r) => (r.id === id ? { ...r, ...patch } : r));
    write("money", rows);
  },
  deleteMoney: (id: string) => write("money", db.listMoney().filter((r) => r.id !== id)),

  listInsurance: () => read<InsuranceRow[]>("insurance", []),
  addInsurance: (row: Omit<InsuranceRow, "id">) => {
    const rows = db.listInsurance();
    rows.unshift({ ...row, id: makeId() });
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
