import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MonthlySummary } from "@/lib/types";

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getUserId(req: NextRequest) {
  return req.nextUrl.searchParams.get("userId") ?? "demo-user";
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);

  if (userId === "demo-user") {
    const demo: MonthlySummary = {
      income: 5000000,
      expense: 2600000,
      invest: 900000,
      save: 700000,
      insurance: 210000,
      net: 2400000
    };
    return NextResponse.json(demo);
  }

  const month = monthStart();

  const [income, expense, invest, save, insurance] = await Promise.all([
    prisma.incomeRecord.aggregate({ where: { userId, month }, _sum: { amount: true } }),
    prisma.expenseRecord.aggregate({ where: { userId, month }, _sum: { amount: true } }),
    prisma.investmentRecord.aggregate({ where: { userId, month }, _sum: { amount: true } }),
    prisma.savingRecord.aggregate({ where: { userId, month }, _sum: { amount: true } }),
    prisma.insurancePolicy.aggregate({ where: { userId, status: "ACTIVE" }, _sum: { monthlyPremium: true } })
  ]);

  const summary: MonthlySummary = {
    income: Number(income._sum.amount ?? 0),
    expense: Number(expense._sum.amount ?? 0),
    invest: Number(invest._sum.amount ?? 0),
    save: Number(save._sum.amount ?? 0),
    insurance: Number(insurance._sum.monthlyPremium ?? 0),
    net: Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0)
  };

  return NextResponse.json(summary);
}
