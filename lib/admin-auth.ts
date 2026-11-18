import { cookies } from "next/headers";

/** Same check the other admin routes use (cookie set by /api/admin/login). */
export function isAdmin(): boolean {
  return cookies().get("admin_session")?.value === "authenticated";
}
