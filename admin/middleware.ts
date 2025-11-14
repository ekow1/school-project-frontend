import { NextResponse, type NextRequest } from "next/server";
import {
  buildAllowedPaths,
  isProtectedRoute,
  resolveDashboardPath,
} from "@/lib/constants/roles";

const isPathAllowed = (pathname: string, allowedPaths: string[]) =>
  allowedPaths.some((path) => {
    const normalised = path.replace(":path*", "");
    return normalised === "/"
      ? pathname === "/"
      : pathname === normalised || pathname.startsWith(`${normalised}/`);
  });

const decodeRoleFromToken = (token: string | undefined) => {
  if (!token) return undefined;

  const parts = token.split(".");
  if (parts.length < 2) return undefined;

  try {
    const normalised = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised.padEnd(normalised.length + ((4 - (normalised.length % 4)) % 4), "=");
    const decoded = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf-8");

    const payload = JSON.parse(decoded) as { role?: string };
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define login pages - these should ALWAYS be accessible without any checks
  const loginPages = ["/super-admin/login", "/station-admin/login", "/fire-personnel/login"];
  
  // CRITICAL: Always allow access to login pages FIRST, before any other checks
  if (loginPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect old /login route to fire personnel login
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/fire-personnel/login", request.url));
  }

  // Allow public routes (landing page, etc.)
  const publicRoutes = ["/"];
  if (publicRoutes.includes(pathname)) {
    // Check if user is authenticated - if yes, redirect to dashboard
    const adminToken = request.cookies.get("admin_token")?.value;
    const stationAdminToken = request.cookies.get("station_admin_token")?.value;
    const firePersonnelToken = request.cookies.get("fire_personnel_token")?.value;
    const anyAuthCookie = request.cookies.get("auth_token")?.value || 
                         request.cookies.get("token")?.value ||
                         request.cookies.get("session")?.value;
    const token = adminToken || stationAdminToken || firePersonnelToken || anyAuthCookie;
    
    if (token) {
      const cookieRole = request.cookies.get("role")?.value;
      const role = cookieRole ?? decodeRoleFromToken(token);
      const redirectTo = resolveDashboardPath(role);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    return NextResponse.next();
  }

  // Now check for authentication tokens
  // Check for multiple possible cookie names (super admin, station admin, fire personnel, etc.)
  const adminToken = request.cookies.get("admin_token")?.value;
  const stationAdminToken = request.cookies.get("station_admin_token")?.value;
  const firePersonnelToken = request.cookies.get("fire_personnel_token")?.value;
  const anyAuthCookie = request.cookies.get("auth_token")?.value || 
                       request.cookies.get("token")?.value ||
                       request.cookies.get("session")?.value;
  
  // Use whichever token is available
  const token = adminToken || stationAdminToken || firePersonnelToken || anyAuthCookie;
  const cookieRole = request.cookies.get("role")?.value;
  const role = cookieRole ?? decodeRoleFromToken(token);

  // For protected routes, check authentication
  if (isProtectedRoute(pathname)) {
    // Require token for all protected routes
    if (!token) {
      // Determine which login page to redirect to based on the route
      let loginRedirect = "/fire-personnel/login";
      if (pathname.startsWith("/dashboard/superadmin") || pathname.startsWith("/super-admin")) {
        loginRedirect = "/super-admin/login";
      } else if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
        loginRedirect = "/station-admin/login";
      }
      return NextResponse.redirect(new URL(loginRedirect, request.url));
    }
  }

  // If authenticated, check if user has access to the requested path
  if (token && role) {
    const allowedPaths = buildAllowedPaths(role);

    if (!isPathAllowed(pathname, allowedPaths)) {
      return NextResponse.redirect(
        new URL(resolveDashboardPath(role), request.url),
      );
    }
  }

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
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};

