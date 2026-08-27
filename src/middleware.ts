import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "dexplora_super_secret_jwt_key_2026_production_change_this"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const sessionToken = request.cookies.get("dexplora_admin_session")?.value;

    let isValidSession = false;
    if (sessionToken) {
      try {
        await jwtVerify(sessionToken, JWT_SECRET_KEY);
        isValidSession = true;
      } catch (error) {
        isValidSession = false;
      }
    }

    if (!isValidSession && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isValidSession && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
