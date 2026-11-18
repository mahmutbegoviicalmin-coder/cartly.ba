import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const DAY = 86400_000;
const OPEN = new Set(["najava", "preuzeto", "u_dostavi", "odgodjena", "sporna"]);
const RETURNED = new Set(["vracena", "povrat_dostavljen"]);

type Ship = {
  order_number: string; product_prefix: string | null; ime: string | null; telefon: string | null;
  grad: string | null; sky_sifra: string | null; cod_amount: number; state: string; state_at: string | null;
  created_at: string; cod_paid_at: string | null; cod_presjek_at: string | null; cod_paid_amount: number | null;
};
type Cod = {
  sifra_otkupnine: string; sifra_izvorne_posiljke: string | null; status: number | null; iznos: number | null;
  datum_slanja: string | null; datum_dostave: string | null; datum_presjeka: string | null;
  raw: { posiljalac?: string | null } | null;
};

export type CodStage = "na_terenu" | "naplaceno" | "u_isplati" | "uplaceno" | "izgubljeno";

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

/**
 * GET ?days=60 → everything about cash-on-delivery money:
 * pipeline (where every KM is), payouts grouped by day, parcels waiting for
 * money, amount mismatches, timing stats and per-product totals.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Math.min(180, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 60));
  const since = new Date(Date.now() - days * DAY).toISOString();
  const sb = getSupabaseAdmin();

  try {
    const [ships, cods] = await Promise.all([
      all<Ship>((a, b) => sb.from("skytec_shipments")
        .select("order_number, product_prefix, ime, telefon, grad, sky_sifra, cod_amount, state, state_at, created_at, cod_paid_at, cod_presjek_at, cod_paid_amount")
        .gte("created_at", since).neq("state", "otkazana").gt("cod_amount", 0)
        .order("created_at", { ascending: false }).range(a, b)),
      all<Cod>((a, b) => sb.from("skytec_cod_payments")
        .select("sifra_otkupnine, sifra_izvorne_posiljke, status, iznos, datum_slanja, datum_dostave, datum_presjeka, raw")
        .or(`datum_dostave.gte.${since},datum_presjeka.gte.${since},datum_slanja.gte.${since}`)
        .range(a, b)),
    ]);

    const codBySifra = new Map<string, Cod>();
    for (const c of cods) if (c.sifra_izvorne_posiljke) codBySifra.set(c.sifra_izvorne_posiljke, c);
    const shipBySifra = new Map<string, Ship>();
    for (const s of ships) if (s.sky_sifra) shipBySifra.set(s.sky_sifra, s);

    // ── Pipeline ────────────────────────────────────────────
    const stageOf = (s: Ship): CodStage => {
      const c = s.sky_sifra ? codBySifra.get(s.sky_sifra) : undefined;
      if (s.cod_paid_at || c?.status === 10) return "uplaceno";
      if (RETURNED.has(s.state)) return "izgubljeno";
      if (OPEN.has(s.state)) return "na_terenu";
      if (c || s.cod_presjek_at) return "u_isplati";
      return "naplaceno";
    };

    const pipeline: Record<CodStage, { count: number; amount: number }> = {
      na_terenu: { count: 0, amount: 0 }, naplaceno: { count: 0, amount: 0 },
      u_isplati: { count: 0, amount: 0 }, uplaceno: { count: 0, amount: 0 }, izgubljeno: { count: 0, amount: 0 },
    };
    const prod = new Map<string, { prefix: string; collected: number; outstanding: number; lost: number; parcels: number }>();
    const waiting: {
      order_number: string; ime: string | null; telefon: string | null; grad: string | null; product_prefix: string | null;
      amount: number; stage: CodStage; delivered_at: string | null; days: number; sky_sifra: string | null;
    }[] = [];
    const paidDelays: number[] = [];
    const mismatches: { order_number: string; ime: string | null; expected: number; paid: number; sky_sifra: string | null }[] = [];

    for (const s of ships) {
      const stage = stageOf(s);
      const amt = Number(s.cod_amount) || 0;
      pipeline[stage].count++;
      pipeline[stage].amount += amt;

      const k = s.product_prefix ?? "?";
      const p = prod.get(k) ?? { prefix: k, collected: 0, outstanding: 0, lost: 0, parcels: 0 };
      p.parcels++;
      if (stage === "uplaceno") p.collected += amt;
      else if (stage === "izgubljeno") p.lost += amt;
      else p.outstanding += amt;
      prod.set(k, p);

      if (stage === "naplaceno" || stage === "u_isplati") {
        const from = s.state_at ?? s.created_at;
        waiting.push({
          order_number: s.order_number, ime: s.ime, telefon: s.telefon, grad: s.grad, product_prefix: s.product_prefix,
          amount: amt, stage, delivered_at: s.state_at, sky_sifra: s.sky_sifra,
          days: Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / DAY)),
        });
      }

      if (stage === "uplaceno") {
        const c = s.sky_sifra ? codBySifra.get(s.sky_sifra) : undefined;
        const paidAt = s.cod_paid_at ?? c?.datum_dostave ?? null;
        if (paidAt && s.state_at) {
          const d = (new Date(paidAt).getTime() - new Date(s.state_at).getTime()) / DAY;
          if (d >= 0 && d < 60) paidDelays.push(d);
        }
        const paidAmt = Number(s.cod_paid_amount ?? c?.iznos ?? amt);
        if (Math.abs(paidAmt - amt) >= 0.01) {
          mismatches.push({ order_number: s.order_number, ime: s.ime, expected: amt, paid: paidAmt, sky_sifra: s.sky_sifra });
        }
      }
    }
    for (const v of Object.values(pipeline)) v.amount = r2(v.amount);
    waiting.sort((a, b) => b.days - a.days || b.amount - a.amount);

    // ── Payouts (money that reached you), grouped by day ────
    const payoutMap = new Map<string, {
      date: string; count: number; total: number;
      items: { sifra: string | null; amount: number; ime: string | null; order_number: string | null; product_prefix: string | null }[];
    }>();
    const sinceMs = Date.now() - days * DAY;
    let unmatchedCount = 0, unmatchedAmount = 0;
    for (const c of cods) {
      if (c.status !== 10 || !c.datum_dostave || new Date(c.datum_dostave).getTime() < sinceMs) continue;
      const d = sarajevoDay(c.datum_dostave);
      const g = payoutMap.get(d) ?? { date: d, count: 0, total: 0, items: [] };
      const s = c.sifra_izvorne_posiljke ? shipBySifra.get(c.sifra_izvorne_posiljke) : undefined;
      const amt = Number(c.iznos) || 0;
      g.count++;
      g.total += amt;
      g.items.push({
        sifra: c.sifra_izvorne_posiljke, amount: amt,
        ime: s?.ime ?? c.raw?.posiljalac ?? null,
        order_number: s && !s.order_number.startsWith("SKY-") ? s.order_number : null,
        product_prefix: s?.product_prefix ?? null,
      });
      if (!s) { unmatchedCount++; unmatchedAmount += amt; }
      payoutMap.set(d, g);
    }
    const payouts = Array.from(payoutMap.values())
      .map((g) => ({ ...g, total: r2(g.total), items: g.items.sort((a, b) => (a.ime ?? "").localeCompare(b.ime ?? "")) }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Daily series for the last 30 days (paid out per day).
    const series: { date: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = sarajevoDay(new Date(Date.now() - i * DAY).toISOString());
      series.push({ date: d, amount: payoutMap.get(d)?.total ?? 0 });
    }

    paidDelays.sort((a, b) => a - b);
    const avg = paidDelays.length ? paidDelays.reduce((a, b) => a + b, 0) / paidDelays.length : null;
    const median = paidDelays.length ? paidDelays[Math.floor(paidDelays.length / 2)] : null;

    const totalExpected = r2(ships.reduce((a, s) => a + (Number(s.cod_amount) || 0), 0));

    return NextResponse.json({
      days,
      totalExpected,
      pipeline,
      stats: {
        avgDaysToPayout: avg != null ? Math.round(avg * 10) / 10 : null,
        medianDaysToPayout: median != null ? Math.round(median * 10) / 10 : null,
        longestWait: waiting[0]?.days ?? 0,
        overdueCount: waiting.filter((w) => w.days > 7).length,
        overdueAmount: r2(waiting.filter((w) => w.days > 7).reduce((a, w) => a + w.amount, 0)),
        unmatchedCount,
        unmatchedAmount: r2(unmatchedAmount),
      },
      waiting,
      payouts,
      series,
      mismatches,
      byProduct: Array.from(prod.values())
        .map((p) => ({ ...p, collected: r2(p.collected), outstanding: r2(p.outstanding), lost: r2(p.lost) }))
        .sort((a, b) => b.collected + b.outstanding - (a.collected + a.outstanding)),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 500 });
  }
}
