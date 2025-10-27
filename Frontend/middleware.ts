import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Simple UX redirection: Check if token exists (client-side only)
  // This is just for UX flow, NOT for security or authorization
  const hasToken = request.cookies.get("auth-token")?.value;

  // Root path redirect to dashboard if likely authenticated
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect old dashboard routes to new structure
  if (pathname.startsWith("/dashboard/")) {
    const newPath = pathname.replace("/dashboard/", "/");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Simple UX: If accessing auth pages with token, redirect to dashboard
  if (hasToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // No authentication/authorization logic - just simple UX redirections
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
