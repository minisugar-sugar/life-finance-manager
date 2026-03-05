import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  if (params.id.startsWith("d")) return NextResponse.json({ ok: true, demo: true });

  if (type === "income") await prisma.incomeRecord.delete({ where: { id: params.id } });
  else if (type === "expense") await prisma.expenseRecord.delete({ where: { id: params.id } });
  else if (type === "invest") await prisma.investmentRecord.delete({ where: { id: params.id } });
  else if (type === "save") await prisma.savingRecord.delete({ where: { id: params.id } });
  else return NextResponse.json({ error: "invalid type" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
