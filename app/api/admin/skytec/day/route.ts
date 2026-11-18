import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { fetchOrders } from "@/lib/export-shared";
import { getCities, resolvePtt } from "@/lib/skytec";

export const dynamic = "force-dynamic";

/**
 * GET ?date=YYYY-MM-DD → every order of that day (all products, same day
 * window as the Excel export) with its Skytec state, so the admin can pick
 * what to send.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });

  try {
    const sb = getSupabaseAdmin();
    const [orders, cities] = await Promise.all([fetchOrders(sb, "svi", date), getCities().catch(() => [])]);

    const numbers = orders.map((o) => o.order_number).filter(Boolean);
    const shipped = new Map<string, { sky_sifra: string | null; state: string }>();
    if (numbers.length) {
      const { data } = await sb.from("skytec_shipments")
        .select("order_number, sky_sifra, state").in("order_number", numbers);
      for (const r of (data ?? []) as { order_number: string; sky_sifra: string | null; state: string }[]) {
        shipped.set(r.order_number, r);
      }
    }

    return NextResponse.json({
      date,
      orders: orders.map((o) => {
        const s = shipped.get(o.order_number);
        const sent = Boolean(s?.sky_sifra) && s?.state !== "otkazana";
        return {
          order_number: o.order_number,
          ime: o.ime,
          grad: o.grad,
          telefon: o.telefon,
          ukupno: o.ukupno,
          opis: o.opis,
          ptt: cities.length ? resolvePtt(cities, o.grad, o.ptt) : o.ptt ?? null,
          sent,
          sky_sifra: sent ? s!.sky_sifra : null,
          state: sent ? s!.state : null,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 500 });
  }
}
