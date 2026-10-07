import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const secret = process.env.AUTH_SECRET;
  const token = await getToken({ req, secret });
  const isAuthenticated = !!token;

  // Guest-only routes: logged-in users must NOT access these pages
  const guestRoutes = ["/login", "/register", "/forget"];
  const isGuestRoute = guestRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAuthenticated && isGuestRoute) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const destination = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Protected routes: unauthenticated users must NOT access dashboard
  const isProtectedRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login/:path*",
    "/login",
    "/register/:path*",
    "/register",
    "/forget/:path*",
    "/forget",
    "/dashboard/:path*",
    "/dashboard",
  ],
};
