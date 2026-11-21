import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Admin session = signed, expiring cookie: "<expiresAtMs>.<hmac>".
 * The HMAC key is ADMIN_SESSION_SECRET (or ADMIN_PASSWORD), so a cookie can't be
 * forged without the server secret, and changing the password logs everyone out.
 * (Before this the cookie was the constant "authenticated", which anyone could set.)
 */
export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_DAYS = 7;

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(`admin:${payload}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function createAdminToken(now = Date.now()): string {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const exp = String(now + ADMIN_SESSION_DAYS * 86400_000);
  return `${exp}.${sign(exp, key)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  const key = secret();
  if (!key || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  if (!/^\d{10,16}$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(token.slice(dot + 1), sign(exp, key));
}

/** Constant-time password check for the login form. */
export function checkAdminPassword(input: unknown): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && typeof input === "string" && safeEqual(input, pw);
}

/** For route handlers and server components. */
export function isAdmin(): boolean {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
}

/**
 * Supplier portal sends its password in a header.
 * TODO: set SUPPLIER_PASSWORD in Vercel; the fallback is the old hard-coded one so the portal keeps working.
 */
export function isSupplier(req: NextRequest | Request): boolean {
  const pw = process.env.SUPPLIER_PASSWORD || "adnan2024";
  const got = req.headers.get("x-supplier-password");
  return !!pw && !!got && safeEqual(got, pw);
}
