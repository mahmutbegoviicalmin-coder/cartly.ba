import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getClientIP } from "@/lib/meta-capi";
import {
  looksLikeRealAddress,
  looksLikeRealName,
  looksLikeRealPlace,
  normalizeBaPhone,
  PHONE_ERROR,
} from "@/lib/ba-phone";

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
const PHONE_LIMIT_WINDOW_MS = 2 * 60 * 60 * 1000;
const PHONE_LIMIT_MAX = 3;
const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT_MAX = 5;
const MIN_FILL_MS = 1800;

const ORDER_TABLES = [
  "orders",
  "cetka_orders",
  "usmjerivac_orders",
  "komarnik_orders",
  "lezaljka_orders",
  "masina_orders",
] as const;

const ipHits = new Map<string, number[]>();

export type GuardedCustomer = {
  ime: string;
  imeFirst: string;
  prezime: string;
  fullName: string;
  telefon: string;
  telefonNormalized: string;
  adresa: string;
  grad: string;
  postanski: string;
  ip: string;
};

export type OrderGuardOk = { ok: true; fields: GuardedCustomer };
export type OrderGuardBlocked = { ok: false; response: NextResponse };

function str(body: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function fail(error: string, status = 400): OrderGuardBlocked {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  };
}

function silentDrop(): OrderGuardBlocked {
  return {
    ok: false,
    response: NextResponse.json({
      success: true,
      orderNumber: `CRT-${Date.now().toString().slice(-8)}`,
      duplicate: true,
    }),
  };
}

function honeypotFilled(body: Record<string, unknown>): boolean {
  return [body.website, body.company, body.url, body.fax]
    .map((v) => String(v ?? "").trim())
    .some(Boolean);
}

function submittedTooFast(body: Record<string, unknown>): boolean {
  const started = Number(body.formStartedAt);
  if (!Number.isFinite(started) || started <= 0) return false;
  const elapsed = Date.now() - started;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}

function checkIpLimit(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return true;
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (recent.length >= IP_LIMIT_MAX) return false;
  recent.push(now);
  ipHits.set(ip, recent);
  return true;
}

type RecentRow = { telefon: string; order_number: string; created_at: string };

async function recentOrders(sinceIso: string): Promise<RecentRow[]> {
  const sb = getSupabaseAdmin();
  const rows: RecentRow[] = [];
  await Promise.all(
    ORDER_TABLES.map(async (table) => {
      const { data } = await sb
        .from(table)
        .select("telefon, order_number, created_at")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(400);
      if (data) rows.push(...(data as RecentRow[]));
    })
  );
  return rows;
}

export async function guardCustomerOrder(
  request: NextRequest,
  rawBody: unknown,
  options?: { requirePrezime?: boolean; requirePostal?: boolean }
): Promise<OrderGuardOk | OrderGuardBlocked> {
  const body =
    rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)
      ? (rawBody as Record<string, unknown>)
      : {};

  if (honeypotFilled(body) || submittedTooFast(body)) {
    return silentDrop();
  }

  const imeFirst = str(body, "ime", "name");
  const prezime = str(body, "prezime");
  const fullName = `${imeFirst} ${prezime}`.replace(/\s+/g, " ").trim();
  const telefon = str(body, "telefon", "phone");
  const adresa = str(body, "adresa", "address");
  const grad = str(body, "grad", "city");
  const postanski = str(body, "postanski", "postanski_broj", "postalCode", "zip");

  if (options?.requirePrezime && !prezime) {
    return fail("Nedostaju obavezna polja.");
  }
  if (!fullName || !telefon || !adresa || !grad) {
    return fail("Nedostaju obavezna polja.");
  }
  if (options?.requirePostal && !postanski) {
    return fail("Unesite poštanski broj.");
  }
  if (postanski && !/^\d{5}$/.test(postanski)) {
    return fail("Unesite ispravan poštanski broj (5 cifara).");
  }
  if (!looksLikeRealName(fullName) || (prezime && !looksLikeRealName(prezime))) {
    return fail("Unesite ime i prezime.");
  }
  if (!looksLikeRealAddress(adresa)) {
    return fail("Unesite ispravnu adresu.");
  }
  if (!looksLikeRealPlace(grad, 2)) {
    return fail("Unesite ispravan grad.");
  }

  const telefonNormalized = normalizeBaPhone(telefon);
  if (!telefonNormalized) {
    return fail(PHONE_ERROR);
  }

  const ip = getClientIP(request);
  if (!checkIpLimit(ip)) {
    return fail("Previše narudžbi s ove mreže. Pokušajte kasnije.", 429);
  }

  try {
    const since = new Date(Date.now() - PHONE_LIMIT_WINDOW_MS).toISOString();
    const samePhone = (await recentOrders(since)).filter(
      (row) => normalizeBaPhone(row.telefon) === telefonNormalized
    );

    if (samePhone.length >= PHONE_LIMIT_MAX) {
      return fail("Ovaj broj je već korišten za više narudžbi. Javit ćemo se uskoro.", 429);
    }

    const cutoff = Date.now() - DUPLICATE_WINDOW_MS;
    const duplicate = samePhone.find(
      (row) => new Date(row.created_at).getTime() >= cutoff && row.order_number
    );
    if (duplicate) {
      return {
        ok: false,
        response: NextResponse.json({
          success: true,
          orderNumber: duplicate.order_number,
          duplicate: true,
        }),
      };
    }
  } catch (err) {
    console.error("order-guard lookup error:", err);
  }

  return {
    ok: true,
    fields: {
      ime: fullName,
      imeFirst,
      prezime,
      fullName,
      telefon,
      telefonNormalized,
      adresa,
      grad,
      postanski,
      ip,
    },
  };
}
