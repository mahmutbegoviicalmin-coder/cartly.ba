import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_DAYS, checkAdminPassword, createAdminToken } from "@/lib/admin-auth";

// Simple brake on password guessing (per server instance).
const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60_000;
const MAX_FAILS = 10;

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_FAILS) {
    return NextResponse.json({ success: false, error: "Previše pokušaja. Pokušajte za 15 minuta." }, { status: 429 });
  }

  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!checkAdminPassword(password)) {
    attempts.set(ip, [...recent, now]);
    return NextResponse.json({ success: false, error: "Pogrešna lozinka." }, { status: 401 });
  }
  attempts.delete(ip);

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_DAYS,
    path: "/",
  });

  return response;
}
