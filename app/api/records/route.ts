import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserId(req: NextRequest) {
  return req.nextUrl.searchParams.get("userId") ?? "demo-user";
}

function currentMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (userId === "demo-user") {
    return NextResponse.json({
      items: [
        { id: "d1", type: "income", label: "월급", amount: 5000000 },
        { id: "d2", type: "expense", label: "월세", amount: 900000 },
        { id: "d3", type: "save", label: "적금", amount: 700000 }
      ]
    });
  }

  const month = currentMonth();
  const [income, expense, invest, save] = await Promise.all([
    prisma.incomeRecord.findMany({ where: { userId, month } }),
    prisma.expenseRecord.findMany({ where: { userId, month } }),
    prisma.investmentRecord.findMany({ where: { userId, month } }),
    prisma.savingRecord.findMany({ where: { userId, month } })
  ]);

  const items = [
    ...income.map((x) => ({ id: x.id, type: "income", label: x.category, amount: Number(x.amount) })),
    ...expense.map((x) => ({ id: x.id, type: "expense", label: x.subCategory, amount: Number(x.amount) })),
    ...invest.map((x) => ({ id: x.id, type: "invest", label: x.type, amount: Number(x.amount) })),
    ...save.map((x) => ({ id: x.id, type: "save", label: x.type, amount: Number(x.amount) }))
  ];

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json();
  const month = currentMonth();

  if (body.type === "income") {
    const row = await prisma.incomeRecord.create({
      data: { userId, month, category: body.category ?? "SALARY", amount: Number(body.amount), memo: body.memo }
    });
    return NextResponse.json(row, { status: 201 });
  }

  if (body.type === "expense") {
    const row = await prisma.expenseRecord.create({
      data: {
        userId,
        month,
        category: body.category ?? "FIXED",
        subCategory: body.subCategory ?? "OTHER",
        amount: Number(body.amount),
        memo: body.memo
      }
    });
    return NextResponse.json(row, { status: 201 });
  }

  if (body.type === "invest") {
    const row = await prisma.investmentRecord.create({
      data: { userId, month, type: body.investType ?? "ETF", amount: Number(body.amount), memo: body.memo }
    });
    return NextResponse.json(row, { status: 201 });
  }

  const row = await prisma.savingRecord.create({
    data: { userId, month, type: body.saveType ?? "INSTALLMENT_SAVING", amount: Number(body.amount), memo: body.memo }
  });
  return NextResponse.json(row, { status: 201 });
}
