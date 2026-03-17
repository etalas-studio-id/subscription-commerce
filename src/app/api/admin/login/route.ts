import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error("Missing required environment variables for admin auth");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Verify credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ username, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Create response with httpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("adminAuth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
