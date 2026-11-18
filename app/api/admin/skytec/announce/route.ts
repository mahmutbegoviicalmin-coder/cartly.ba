import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { fetchOrders } from "@/lib/export-shared";
import { announce, getCities, resolvePtt, toPosiljka, SkytecError } from "@/lib/skytec";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Result = { order_number: string; ime: string; ok: boolean; sifra?: string; error?: string };

/**
 * POST { product, date, orderNumbers? }
 * Announces the day's orders to Skytec (one call per parcel, so one bad
 * address never blocks the rest). Orders already announced are skipped.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product = "svi", date, orderNumbers } = (await req.json().catch(() => ({}))) as {
    product?: string; date?: string; orderNumbers?: string[];
  };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });
  }

  try {
    const sb = getSupabaseAdmin();
    let orders = await fetchOrders(sb, product, date);
    if (orderNumbers?.length) orders = orders.filter((o) => orderNumbers.includes(o.order_number));
    if (orders.length === 0) return NextResponse.json({ results: [], sent: 0, skipped: 0, failed: 0 });

    const { data: existing } = await sb.from("skytec_shipments")
      .select("order_number").in("order_number", orders.map((o) => o.order_number))
      .not("sky_sifra", "is", null);
    const done = new Set((existing ?? []).map((r: { order_number: string }) => r.order_number));
    const todo = orders.filter((o) => !done.has(o.order_number));

    const cities = await getCities();
    const results: Result[] = [];
    const queue = [...todo];

    const worker = async () => {
      for (let o = queue.shift(); o; o = queue.shift()) {
        const ptt = resolvePtt(cities, o.grad, o.ptt);
        if (!ptt) {
          results.push({ order_number: o.order_number, ime: o.ime, ok: false, error: `Nepoznat PTT za "${o.grad}"` });
          continue;
        }
        try {
          const najava = await announce([toPosiljka(o, ptt)]);
          const p = najava.posiljke?.find((x) => x.sifraExt === o.order_number) ?? najava.posiljke?.[0];
          await sb.from("skytec_shipments").upsert({
            order_number: o.order_number,
            order_date: date,
            product_prefix: o.order_number.split("-")[0]?.toUpperCase() ?? null,
            ime: o.ime, telefon: o.telefon, grad: o.grad, ptt,
            sky_sifra: p?.sifra ?? null,
            najava_sifra: najava.sifra ?? null,
            postarina: p?.postarina ?? null,
            cod_amount: Number(o.ukupno) || 0,
            state: "najava",
            state_label: "U najavi",
            state_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "order_number" });
          results.push({ order_number: o.order_number, ime: o.ime, ok: true, sifra: p?.sifra });
        } catch (e) {
          const msg = e instanceof SkytecError ? e.message : "Greška pri slanju";
          results.push({ order_number: o.order_number, ime: o.ime, ok: false, error: msg });
        }
      }
    };
    await Promise.all(Array.from({ length: 3 }, worker));

    return NextResponse.json({
      results,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      skipped: done.size,
    });
  } catch (e) {
    const status = e instanceof SkytecError ? 502 : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status });
  }
}
