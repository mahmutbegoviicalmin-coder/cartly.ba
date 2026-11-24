import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { SHEET_BUCKET } from "@/lib/cod-sheet";

export const dynamic = "force-dynamic";

const DAY = 86400_000;
const OPEN = new Set(["najava", "preuzeto", "u_dostavi", "odgodjena", "sporna"]);
const RETURNED = new Set(["vracena", "povrat_dostavljen"]);

type Ship = {
  order_number: string; order_date: string | null; product_prefix: string | null; ime: string | null; telefon: string | null;
  grad: string | null; sky_sifra: string | null; cod_amount: number; state: string; state_at: string | null;
  created_at: string; cod_paid_at: string | null; cod_presjek_at: string | null; cod_paid_amount: number | null;
};
type Cod = {
  sifra_otkupnine: string; sifra_izvorne_posiljke: string | null; status: number | null; iznos: number | null;
  datum_slanja: string | null; datum_dostave: string | null; datum_presjeka: string | null;
};

/**
 * Where the cash-on-delivery money is. Skytec does not wire it to a bank
 * account: for every delivered parcel it creates a separate "OTKUPNINA"
 * shipment (code O…) addressed to the Živinice depot, where the money is
 * picked up in person. So the stages are:
 *   kod_kurira  → parcel still out for delivery
 *   ceka_obracun → delivered, Skytec hasn't created the otkupnina yet
 *   za_podizanje → otkupnina exists, money waits at Skytec to be picked up
 *   preuzeto    → picked up (marked in admin, or Skytec status 10)
 *   vraceno     → returned, no money
 */
export type CodStage = "kod_kurira" | "ceka_obracun" | "za_podizanje" | "preuzeto" | "vraceno";

const r2 = (n: number) => Math.round(n * 100) / 100;
const sarajevoDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });

async function all<T>(q: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; page < 20; page++) {
    const { data, error } = await q(page * 1000, page * 1000 + 999);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

/** GET ?days=60 → every COD parcel with its stage, plus pickups grouped by day. */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Math.min(365, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 60));
  const since = new Date(Date.now() - days * DAY).toISOString();
  const sb = getSupabaseAdmin();

  try {
    const ships = await all<Ship>((a, b) => sb.from("skytec_shipments")
      .select("order_number, order_date, product_prefix, ime, telefon, grad, sky_sifra, cod_amount, state, state_at, created_at, cod_paid_at, cod_presjek_at, cod_paid_amount")
      .gte("created_at", since).neq("state", "otkazana").gt("cod_amount", 0)
      .order("created_at", { ascending: false }).range(a, b));

    const sifre = ships.map((s) => s.sky_sifra).filter((s): s is string => !!s);
    const cods: Cod[] = [];
    for (let i = 0; i < sifre.length; i += 300) {
      const { data, error } = await sb.from("skytec_cod_payments")
        .select("sifra_otkupnine, sifra_izvorne_posiljke, status, iznos, datum_slanja, datum_dostave, datum_presjeka")
        .in("sifra_izvorne_posiljke", sifre.slice(i, i + 300));
      if (error) throw error;
      cods.push(...((data ?? []) as Cod[]));
    }
    // Pickup records: what was actually handed over at the depot (entered when marking).
    const { data: evs } = await sb.from("skytec_events")
      .select("status_at, raw").eq("source", "cod_pickup").gte("status_at", since);
    const receivedByDay = new Map<string, number>();
    const photosByDay = new Map<string, string[]>();
    for (const e of (evs ?? []) as { status_at: string; raw: { received?: number; photos?: string[] } | null }[]) {
      const d = sarajevoDay(e.status_at);
      if (e.raw?.photos?.length) photosByDay.set(d, [...(photosByDay.get(d) ?? []), ...e.raw.photos]);
      if (typeof e.raw?.received !== "number") continue;
      receivedByDay.set(d, (receivedByDay.get(d) ?? 0) + e.raw.received);
    }
    // Signed links (1 h) to the photographed Skytec sheets of each pickup.
    const photoUrls = new Map<string, string[]>();
    for (const [d, paths] of Array.from(photosByDay)) {
      const { data } = await sb.storage.from(SHEET_BUCKET).createSignedUrls(paths, 3600);
      photoUrls.set(d, (data ?? []).map((x) => x.signedUrl).filter(Boolean) as string[]);
    }

    const codBySifra = new Map<string, Cod>();
    for (const c of cods) if (c.sifra_izvorne_posiljke) codBySifra.set(c.sifra_izvorne_posiljke, c);

    const pipeline: Record<CodStage, { count: number; amount: number }> = {
      kod_kurira: { count: 0, amount: 0 }, ceka_obracun: { count: 0, amount: 0 },
      za_podizanje: { count: 0, amount: 0 }, preuzeto: { count: 0, amount: 0 }, vraceno: { count: 0, amount: 0 },
    };
    const pickupMap = new Map<string, { date: string; count: number; total: number }>();
    const now = Date.now();

    const parcels = ships.map((s) => {
      const c = s.sky_sifra ? codBySifra.get(s.sky_sifra) : undefined;
      const pickedAt = s.cod_paid_at ?? (c?.status === 10 ? c.datum_dostave : null);
      const stage: CodStage = pickedAt ? "preuzeto"
        : c || s.cod_presjek_at ? "za_podizanje"
        : RETURNED.has(s.state) ? "vraceno"
        : OPEN.has(s.state) ? "kod_kurira"
        : "ceka_obracun";
      const amount = Number(s.cod_amount) || 0;
      pipeline[stage].count++;
      pipeline[stage].amount += amount;

      const paid = pickedAt ? Number(s.cod_paid_amount ?? c?.iznos ?? amount) : null;
      if (pickedAt) {
        const d = sarajevoDay(pickedAt);
        const g = pickupMap.get(d) ?? { date: d, count: 0, total: 0 };
        g.count++;
        g.total += paid ?? amount;
        pickupMap.set(d, g);
      }
      const deliveredAt = stage === "kod_kurira" || stage === "vraceno" ? null : s.state_at ?? c?.datum_slanja ?? null;
      return {
        order_number: s.order_number,
        linked: !s.order_number.startsWith("SKY-"),
        order_date: s.order_date ?? s.created_at.slice(0, 10),
        ime: s.ime, telefon: s.telefon, grad: s.grad, product_prefix: s.product_prefix,
        sky_sifra: s.sky_sifra, cod_sifra: c?.sifra_otkupnine ?? null,
        amount, paid, stage,
        delivered_at: deliveredAt,
        picked_at: pickedAt ? sarajevoDay(pickedAt) : null,
        // manual = we marked it in admin; Skytec-confirmed ones can't be unmarked here
        picked_by_skytec: c?.status === 10,
        waiting_days: stage === "za_podizanje" || stage === "ceka_obracun"
          ? Math.max(0, Math.floor((now - new Date(deliveredAt ?? s.created_at).getTime()) / DAY))
          : null,
      };
    });
    for (const v of Object.values(pipeline)) v.amount = r2(v.amount);

    const pickups = Array.from(pickupMap.values())
      .map((g) => ({ ...g, total: r2(g.total), received: receivedByDay.has(g.date) ? r2(receivedByDay.get(g.date)!) : null, photos: photoUrls.get(g.date) ?? [] }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const mismatches = parcels
      .filter((p) => p.paid != null && Math.abs(p.paid - p.amount) >= 0.01)
      .map((p) => ({ order_number: p.order_number, ime: p.ime, expected: p.amount, paid: p.paid as number }));

    // Things that need a look: Skytec forgot the otkupnina, or money sits at the depot too long.
    const alerts = {
      noOtkupnina: parcels.filter((p) => p.stage === "ceka_obracun" && (p.waiting_days ?? 0) > 3).map((p) => p.order_number),
      longAtDepot: parcels.filter((p) => p.stage === "za_podizanje" && (p.waiting_days ?? 0) > 7).map((p) => p.order_number),
    };

    return NextResponse.json({
      days,
      alerts,
      totalExpected: r2(ships.reduce((a, s) => a + (Number(s.cod_amount) || 0), 0)),
      pipeline,
      parcels,
      pickups,
      mismatches,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 500 });
  }
}

/**
 * POST { orders: string[], date?: "YYYY-MM-DD", received?: number } → mark otkupnine as picked up
 *   at the depot; `received` is the cash actually handed over (kept in skytec_events, source cod_pickup).
 * POST { orders: string[], undo: true }           → unmark (mistake).
 * Uses cod_paid_at / cod_paid_amount, which the rest of the admin already reads
 * as "the money is with us".
 */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const orders = Array.isArray(body.orders) ? body.orders.filter((o: unknown): o is string => typeof o === "string").slice(0, 500) : [];
  if (!orders.length) return NextResponse.json({ error: "Nije odabrana nijedna otkupnina." }, { status: 400 });
  const sb = getSupabaseAdmin();

  if (body.undo) {
    // Take only these otkupnine out of their pickup records. The rest of the same
    // pickup keeps its received amount (minus the undone ones' value, since that
    // cash was counted in it), so the day still compares correctly.
    const { data: amts } = await sb.from("skytec_shipments")
      .select("order_number, cod_paid_amount, cod_amount").in("order_number", orders);
    const amountOf = new Map(((amts ?? []) as { order_number: string; cod_paid_amount: number | null; cod_amount: number }[])
      .map((r) => [r.order_number, Number(r.cod_paid_amount ?? r.cod_amount) || 0]));
    const undo = new Set(orders);
    // Few rows (one per pickup), so filter in code rather than with a jsonb query.
    const { data: evs } = await sb.from("skytec_events").select("id, raw").eq("source", "cod_pickup")
      .gte("status_at", new Date(Date.now() - 365 * DAY).toISOString());
    type PickupRaw = { orders?: string[]; expected?: number; received?: number | null };
    for (const e of (evs ?? []) as { id: number; raw: PickupRaw | null }[]) {
      const before = e.raw?.orders ?? [];
      const removed = before.filter((o) => undo.has(o));
      if (!removed.length) continue;
      const keep = before.filter((o) => !undo.has(o));
      if (!keep.length) { await sb.from("skytec_events").delete().eq("id", e.id); continue; }
      const minus = removed.reduce((a, o) => a + (amountOf.get(o) ?? 0), 0);
      const expected = r2((e.raw?.expected ?? 0) - minus);
      const received = e.raw?.received == null ? null : r2(Math.max(0, e.raw.received - minus));
      await sb.from("skytec_events").update({
        raw: { ...e.raw, orders: keep, expected, received },
        note: received != null && Math.abs(received - expected) >= 0.01
          ? `Dobijeno ${received.toFixed(2)} KM, očekivano ${expected.toFixed(2)} KM` : null,
      }).eq("id", e.id);
    }
    const { data, error } = await sb.from("skytec_shipments")
      .update({ cod_paid_at: null, cod_paid_amount: null, updated_at: new Date().toISOString() })
      .in("order_number", orders).select("order_number");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  if (date && date > sarajevoDay(new Date().toISOString())) {
    return NextResponse.json({ error: "Datum preuzimanja ne može biti u budućnosti." }, { status: 400 });
  }
  // Noon Sarajevo time, so the day never shifts across time zones.
  const pickedAt = date ? new Date(`${date}T12:00:00+01:00`).toISOString() : new Date().toISOString();

  const { data: rows, error } = await sb.from("skytec_shipments")
    .select("order_number, cod_amount").in("order_number", orders).is("cod_paid_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let updated = 0, expected = 0;
  const done: string[] = [];
  for (const r of (rows ?? []) as { order_number: string; cod_amount: number }[]) {
    const { error: e } = await sb.from("skytec_shipments")
      .update({ cod_paid_at: pickedAt, cod_paid_amount: r.cod_amount, updated_at: new Date().toISOString() })
      .eq("order_number", r.order_number).is("cod_paid_at", null);
    if (!e) { updated++; expected += Number(r.cod_amount) || 0; done.push(r.order_number); }
  }
  const received = typeof body.received === "number" && Number.isFinite(body.received) && body.received >= 0
    ? r2(body.received) : null;
  if (done.length) {
    await sb.from("skytec_events").insert({
      source: "cod_pickup",
      state: "preuzeto",
      label: "Otkupnine preuzete u magacinu",
      note: received != null && Math.abs(received - expected) >= 0.01
        ? `Dobijeno ${received.toFixed(2)} KM, očekivano ${r2(expected).toFixed(2)} KM` : null,
      status_at: pickedAt,
      raw: {
        orders: done, expected: r2(expected), received,
        // Paths in the cod-sheets bucket: the Skytec specification this pickup was checked against.
        photos: Array.isArray(body.photos) ? body.photos.filter((p: unknown): p is string => typeof p === "string").slice(0, 8) : [],
      },
    });
  }
  return NextResponse.json({ updated, expected: r2(expected), received });
}
