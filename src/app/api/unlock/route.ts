import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "";

export async function POST(request: NextRequest) {
  // If no SITE_PASSWORD is set, site is open — no gate needed
  if (!SITE_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("siteAccess", "1", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      path: "/",
    });
    return res;
  }

  const body = await request.json();
  if (body.password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("siteAccess", "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
