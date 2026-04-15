import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Site-wide password gate (only active when SITE_PASSWORD env var is set)
  if (process.env.SITE_PASSWORD) {
    const isStaticFile = /\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|css|js|map)$/i.test(pathname);
    const isExcluded =
      isStaticFile ||
      pathname.startsWith("/unlock") ||
      pathname.startsWith("/api/unlock") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/_next");

    if (!isExcluded) {
      const siteAccess = request.cookies.get("siteAccess")?.value;
      if (siteAccess !== "1") {
        return NextResponse.redirect(new URL("/unlock", request.url));
      }
    }
  }

  // Admin routes — existing JWT/jose logic
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("adminAuth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.warn("Invalid admin token:", error);
      return NextResponse.redirect(new URL("/admin/login?expired=1", request.url));
    }
  }

  // Account routes — NextAuth session check
  if (pathname.startsWith("/account")) {
    const token = await getToken({
      req: request,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
