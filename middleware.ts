import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/resume", "/quiz", "/cover-letter"];
  const authRoutes = ["/auth", "/login", "/signup"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    console.log("🚫 Redirecting unauthenticated user to auth page");
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (user && isAuthRoute) {
    console.log("✅ Redirecting authenticated user to dashboard");
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // For public resume sharing, allow access without authentication
  if (
    request.nextUrl.pathname.startsWith("/resume/") &&
    request.nextUrl.pathname.split("/").length === 3
  ) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
