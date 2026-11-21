import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Fast redirect only. The signed cookie is verified on the server
// (app/admin/*/page.tsx and every /api/admin route via lib/admin-auth).
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/dashboard") && !request.cookies.get("admin_session")?.value) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
