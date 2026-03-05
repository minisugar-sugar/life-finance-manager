import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserId(req: NextRequest) {
  return req.nextUrl.searchParams.get("userId") ?? "demo-user";
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);

  if (userId === "demo-user") {
    return NextResponse.json({
      items: [
        {
          id: "seed-1",
          insurer: "샘플생명",
          productName: "실손의료비보험",
          insuranceType: "INDEMNITY",
          purpose: "PROTECTION",
          monthlyPremium: "42000",
          status: "ACTIVE",
          endDate: null
        }
      ]
    });
  }

  const items = await prisma.insurancePolicy.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json();

  const created = await prisma.insurancePolicy.create({
    data: {
      userId,
      insurer: body.insurer,
      productName: body.productName,
      insuranceType: body.insuranceType,
      purpose: body.purpose,
      monthlyPremium: body.monthlyPremium,
      coverageSummary: body.coverageSummary,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      paymentTermMonths: body.paymentTermMonths,
      renewalCycleMonths: body.renewalCycleMonths,
      surrenderValue: body.surrenderValue,
      status: body.status ?? "ACTIVE",
      memo: body.memo
    }
  });

  return NextResponse.json(created, { status: 201 });
}
