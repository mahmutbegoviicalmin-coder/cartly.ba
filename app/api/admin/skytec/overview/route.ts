import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type Ship = {
  order_number: string; order_date: string | null; product_prefix: string | null;
  ime: string | null; telefon: string | null; grad: string | null;
  sky_sifra: string | null; cod_amount: number; state: string; state_label: string | null;
  state_note: string | null; state_at: string | null; tracking_url: string | null;
  cod_paid_at: string | null; cod_paid_amount: number | null; cod_presjek_at: string | null; postarina: number | null; created_at: string;
};

const RETURNED = new Set(["vracena", "povrat_dostavljen"]);
const CLOSED = new Set(["dostavljena", "vracena", "povrat_dostavljen", "otkazana"]);
const DAY = 86400_000;

/** Everything the Skytec admin tab shows, computed from the last 60 days. */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  const since60 = new Date(Date.now() - 60 * DAY).toISOString();
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();

  const [shipsRes, codRes] = await Promise.all([
    sb.from("skytec_shipments").select("*").gte("created_at", since60)
      .order("created_at", { ascending: false }).limit(3000),
    sb.from("skytec_cod_payments").select("iznos, datum_dostave, status")
      .eq("status", 10).gte("datum_dostave", since30).limit(5000),
  ]);
  if (shipsRes.error) {
    return NextResponse.json(
      { error: shipsRes.error.message, needsMigration: /skytec_shipments/.test(shipsRes.error.message) },
      { status: 500 }
    );
  }

  const ships = (shipsRes.data ?? []) as Ship[];
  const sum = (xs: Ship[], f: (s: Ship) => number) => Math.round(xs.reduce((a, s) => a + f(s), 0) * 100) / 100;

  // cod_presjek_at = Skytec already booked the COD, so the parcel was delivered even if our status lags.
  const collected = (s: Ship) => s.state === "dostavljena" || !!s.cod_presjek_at;
  const onField = ships.filter((s) => !CLOSED.has(s.state) && !collected(s));
  const deliveredUnpaid = ships.filter((s) => collected(s) && !RETURNED.has(s.state) && !s.cod_paid_at && Number(s.cod_amount) > 0);
  const overdue = deliveredUnpaid.filter((s) => s.state_at && Date.now() - new Date(s.state_at).getTime() > 7 * DAY);
  const finished = ships.filter((s) => s.state === "dostavljena" || RETURNED.has(s.state));
  const returned = finished.filter((s) => RETURNED.has(s.state));
  const paid30 = Math.round(((codRes.data ?? []) as { iznos: number }[]).reduce((a, c) => a + Number(c.iznos || 0), 0) * 100) / 100;

  const byState: Record<string, number> = {};
  for (const s of ships) byState[s.state] = (byState[s.state] ?? 0) + 1;

  const prod = new Map<string, { prefix: string; sent: number; delivered: number; returned: number; open: number }>();
  for (const s of ships) {
    if (s.state === "otkazana") continue;
    const k = s.product_prefix ?? "?";
    const p = prod.get(k) ?? { prefix: k, sent: 0, delivered: 0, returned: 0, open: 0 };
    p.sent++;
    if (s.state === "dostavljena") p.delivered++;
    else if (RETURNED.has(s.state)) p.returned++;
    else p.open++;
    prod.set(k, p);
  }

  return NextResponse.json({
    kpi: {
      onFieldCount: onField.length,
      onFieldAmount: sum(onField, (s) => Number(s.cod_amount)),
      deliveredUnpaidCount: deliveredUnpaid.length,
      deliveredUnpaidAmount: sum(deliveredUnpaid, (s) => Number(s.cod_amount)),
      overdueCount: overdue.length,
      overdueAmount: sum(overdue, (s) => Number(s.cod_amount)),
      paid30,
      returnRate: finished.length ? returned.length / finished.length : null,
      returnedCount: returned.length,
      finishedCount: finished.length,
    },
    byState,
    byProduct: Array.from(prod.values()).sort((a, b) => b.sent - a.sent),
    alerts: ships.filter((s) => s.state === "odgodjena" || s.state === "sporna"),
    overdue,
    shipments: ships.slice(0, 400),
  });
}
