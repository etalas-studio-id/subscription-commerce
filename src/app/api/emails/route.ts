import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
  });
  return NextResponse.json(logs);
}
