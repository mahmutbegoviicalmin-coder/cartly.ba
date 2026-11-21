import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { ADNAN_PRODUCTS, ADNAN_PREFIXES, DEFAULT_POSTAGE, GIFT_COST, GIFT_PRICE } from "@/lib/adnan";

export const dynamic = "force-dynamic";

const RETURNED = new Set(["vracena", "povrat_dostavljen"]);
const r2 = (n: number) => Math.round(n * 100) / 100;

type Ship = {
  order_number: string; product_prefix: string; ime: string | null; grad: string | null;
  cod_amount: number; postarina: number | null; state: string; state_at: string | null; created_at: string;
  cod_paid_at: string | null; cod_presjek_at: string | null;
};
type Order = { order_number: string; cijena_proizvoda: number | null; dostava: number | null; ukupno: number | null; velicine: unknown };
type Payment = { id: string; paid_on: string; amount: number; note: string | null; created_at: string };

const missingTable = (e: { message?: string; code?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /adnan_payments/.test(e.message ?? ""));

/**
 * GET ?from=YYYY-MM-DD → what we owe Adnan and what we earned, from Skytec parcels
 * of his products: delivered = we owe the purchase price, returned = we lose the postage.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const from = req.nextUrl.searchParams.get("from");
  const sb = getSupabaseAdmin();

  const ships: Ship[] = [];
  for (let page = 0; page < 20; page++) {
    let q = sb.from("skytec_shipments")
      .select("order_number, product_prefix, ime, grad, cod_amount, postarina, state, state_at, created_at, cod_paid_at, cod_presjek_at")
      .in("product_prefix", ADNAN_PREFIXES).neq("state", "otkazana")
      .order("created_at", { ascending: false }).range(page * 1000, page * 1000 + 999);
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) q = q.gte("created_at", `${from}T00:00:00+01:00`);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ships.push(...((data ?? []) as Ship[]));
    if ((data ?? []).length < 1000) break;
  }

  // Gift detection: the order row says it exactly (ukupno − cijena − dostava = 5 KM);
  // parcels entered by hand in Skytec fall back to the COD amount.
  const orders = new Map<string, Order>();
  const nums = ships.map((s) => s.order_number);
  for (let i = 0; i < nums.length; i += 200) {
    const { data } = await sb.from("orders")
      .select("order_number, cijena_proizvoda, dostava, ukupno, velicine").in("order_number", nums.slice(i, i + 200));
    for (const o of (data ?? []) as Order[]) orders.set(o.order_number, o);
  }
  const hasGift = (s: Ship) => {
    const o = orders.get(s.order_number);
    if (o?.ukupno != null && o.cijena_proizvoda != null) {
      return Number(o.ukupno) - Number(o.cijena_proizvoda) - Number(o.dostava ?? 0) >= GIFT_PRICE - 0.5;
    }
    if (o && /poklon/i.test(JSON.stringify(o.velicine ?? ""))) return true;
    return Number(s.cod_amount) >= ADNAN_PRODUCTS[s.product_prefix].base + GIFT_PRICE - 0.5;
  };

  const blank = () => ({ delivered: 0, returned: 0, open: 0, revenue: 0, adnan: 0, gifts: 0, giftCost: 0, postage: 0, returnLoss: 0, profit: 0 });
  const total = blank();
  const byProduct = new Map<string, ReturnType<typeof blank> & { prefix: string; label: string; cost: number }>();
  const parcels: {
    order_number: string; prefix: string; ime: string | null; grad: string | null; state: "dostavljena" | "vracena";
    date: string | null; cod: number; adnan: number; gift: boolean; postage: number; profit: number; skytecPaid: boolean;
  }[] = [];
  let openAmount = 0, openAdnan = 0, skytecOwes = 0;

  for (const s of ships) {
    const prod = ADNAN_PRODUCTS[s.product_prefix];
    const p = byProduct.get(s.product_prefix) ?? { ...blank(), prefix: s.product_prefix, label: prod.label, cost: prod.cost };
    const postage = Number(s.postarina) > 0 ? Number(s.postarina) : DEFAULT_POSTAGE;
    const cod = Number(s.cod_amount) || 0;
    const collected = s.state === "dostavljena" || !!s.cod_presjek_at || !!s.cod_paid_at;

    if (collected && !RETURNED.has(s.state)) {
      const gift = hasGift(s);
      const giftCost = gift ? GIFT_COST : 0;
      const profit = cod - prod.cost - giftCost - postage;
      for (const t of [total, p]) {
        t.delivered++; t.revenue += cod; t.adnan += prod.cost; t.postage += postage; t.profit += profit;
        if (gift) { t.gifts++; t.giftCost += giftCost; }
      }
      if (!s.cod_paid_at) skytecOwes += cod;
      parcels.push({
        order_number: s.order_number, prefix: s.product_prefix, ime: s.ime, grad: s.grad, state: "dostavljena",
        date: s.state_at ?? s.created_at, cod, adnan: prod.cost, gift, postage, profit: r2(profit), skytecPaid: !!s.cod_paid_at,
      });
    } else if (RETURNED.has(s.state)) {
      for (const t of [total, p]) { t.returned++; t.returnLoss += postage; t.profit -= postage; }
      parcels.push({
        order_number: s.order_number, prefix: s.product_prefix, ime: s.ime, grad: s.grad, state: "vracena",
        date: s.state_at ?? s.created_at, cod, adnan: 0, gift: false, postage, profit: -postage, skytecPaid: false,
      });
    } else {
      total.open++; p.open++;
      openAmount += cod; openAdnan += prod.cost;
    }
    byProduct.set(s.product_prefix, p);
  }

  const round = <T extends Record<string, unknown>>(o: T) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "number" ? r2(v) : v])) as T;

  // Payments to Adnan (table may not exist yet).
  let payments: Payment[] = [];
  let needsMigration = false;
  const { data: pay, error: payErr } = await sb.from("adnan_payments")
    .select("id, paid_on, amount, note, created_at").order("paid_on", { ascending: false }).limit(500);
  if (payErr) needsMigration = missingTable(payErr);
  else payments = ((pay ?? []) as Payment[]).filter((x) => !from || x.paid_on >= from);
  const paid = r2(payments.reduce((a, x) => a + Number(x.amount), 0));

  parcels.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return NextResponse.json({
    from,
    firstDate: ships.length ? ships[ships.length - 1].created_at.slice(0, 10) : null,
    total: round(total),
    owedAdnan: r2(total.adnan - paid),
    paidAdnan: paid,
    open: { count: total.open, amount: r2(openAmount), adnan: r2(openAdnan) },
    skytecOwes: r2(skytecOwes),
    byProduct: ADNAN_PREFIXES.map((k) => byProduct.get(k)).filter(Boolean).map((p) => round(p!)),
    parcels,
    payments,
    needsMigration,
    settings: { products: ADNAN_PRODUCTS, giftPrice: GIFT_PRICE, giftCost: GIFT_COST, postage: DEFAULT_POSTAGE },
  });
}

/** POST { amount, paid_on?, note? } → record a payment to Adnan. */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const amount = Math.round(Number(String(body.amount ?? "").replace(",", ".")) * 100) / 100;
  if (!(amount > 0) || amount > 100000) return NextResponse.json({ error: "Unesi iznos veći od 0." }, { status: 400 });
  const paid_on = /^\d{4}-\d{2}-\d{2}$/.test(body.paid_on ?? "") ? body.paid_on : new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) || null : null;
  const { error } = await getSupabaseAdmin().from("adnan_payments").insert({ amount, paid_on, note });
  if (error) {
    return NextResponse.json(
      { error: missingTable(error) ? "Tabela za uplate još nije napravljena (pokreni SQL)." : error.message, needsMigration: missingTable(error) },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

/** DELETE ?id=… → remove a payment entered by mistake. */
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Nedostaje id." }, { status: 400 });
  const { error } = await getSupabaseAdmin().from("adnan_payments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
