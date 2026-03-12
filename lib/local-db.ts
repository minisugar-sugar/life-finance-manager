"use client";

import { getUserId } from "@/lib/client-auth";

export type MoneyType = "income" | "expense" | "invest" | "save";
export type ExpenseKind = "fixed" | "variable";
export type MoneyRow = { id: string; type: MoneyType; label: string; amount: number; month: string; createdAt: number; expenseKind?: ExpenseKind };
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

export type DividendFrequency = "monthly" | "quarterly" | "yearly";
export type DividendScenario = "conservative" | "base" | "aggressive";

export type AssetProfile = {
  // 현재 자산
  cash: number;
  depositBalance: number;
  savingBalance: number;

  // 예금/적금 상세 입력(자동 만기 계산용)
  depositPrincipal: number;
  depositStartDate: string;
  depositRatePct: number;
  depositTermMonths: number;

  savingMonthlyAmount: number;
  savingStartDate: string;
  savingRatePct: number;
  savingTermMonths: number;
  stockEtf: number;
  bond: number;
  pension: number;
  crypto: number;
  realEstateSelf: number;
  realEstateRent: number;
  otherAsset: number;

  // 현재 월 수입(은퇴 전)
  salaryIncome: number;
  sideIncome: number;

  // 은퇴 후 월수입 항목
  rentIncome: number;
  nationalPensionMonthly: number;
  nationalPensionStartAge: number;
  nationalPensionCurrentBalance: number;
  nationalPensionMonthlyContribution: number;
  nationalPensionExpectedReturnPct: number;

  personalPensionCurrentBalance: number;
  personalPensionMonthlyContribution: number;
  personalPensionExpectedReturnPct: number;
  personalPensionMonthly: number;
  personalPensionStartAge: number;
  personalPensionPayoutYears: number;

  // 배당 계좌 적립
  dividendPrincipal: number;
  dividendMonthlyContribution: number;

  retireOtherMonthly: number;

  // 이자/배당 기반 수입 계산
  bankInterestPrincipal: number;
  bankInterestRatePct: number;
  dividendIncome: number;
  otherIncome: number;

  // 배당 재투자 시뮬레이션 입력
  dividendYieldPct: number;
  dividendFrequency: DividendFrequency;
  dividendScenario: DividendScenario;

  // 월 지출
  livingExpense: number;
  loanPayment: number;
  insurancePayment: number;
  otherExpense: number;
};

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

const defaultAssetProfile: AssetProfile = {
  cash: 0,
  depositBalance: 0,
  savingBalance: 0,

  depositPrincipal: 0,
  depositStartDate: "",
  depositRatePct: 3,
  depositTermMonths: 12,

  savingMonthlyAmount: 0,
  savingStartDate: "",
  savingRatePct: 3,
  savingTermMonths: 12,
  stockEtf: 0,
  bond: 0,
  pension: 0,
  crypto: 0,
  realEstateSelf: 0,
  realEstateRent: 0,
  otherAsset: 0,
  salaryIncome: 0,
  sideIncome: 0,
  rentIncome: 0,
  nationalPensionMonthly: 0,
  nationalPensionStartAge: 65,
  nationalPensionCurrentBalance: 0,
  nationalPensionMonthlyContribution: 0,
  nationalPensionExpectedReturnPct: 4,
  personalPensionCurrentBalance: 0,
  personalPensionMonthlyContribution: 0,
  personalPensionExpectedReturnPct: 4,
  personalPensionMonthly: 0,
  personalPensionStartAge: 55,
  personalPensionPayoutYears: 20,
  dividendPrincipal: 0,
  dividendMonthlyContribution: 0,
  retireOtherMonthly: 0,
  bankInterestPrincipal: 0,
  bankInterestRatePct: 3,
  dividendIncome: 0,
  otherIncome: 0,
  dividendYieldPct: 4,
  dividendFrequency: "quarterly",
  dividendScenario: "base",
  livingExpense: 0,
  loanPayment: 0,
  insurancePayment: 0,
  otherExpense: 0
};

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
  setRetire: (p: RetirementProfile) => write("retire", p),

  getAssets: () => read<AssetProfile>("assets", defaultAssetProfile),
  setAssets: (p: AssetProfile) => write("assets", p)
};
