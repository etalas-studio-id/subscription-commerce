import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow login page without authentication
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for JWT in httpOnly cookie
    const token = request.cookies.get("adminAuth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Verify JWT
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);

      // Token is valid, allow request to proceed
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      console.warn("Invalid admin token:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
