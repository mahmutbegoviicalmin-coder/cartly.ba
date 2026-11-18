// ─────────────────────────────────────────────────────────────────────────────
// One-off / repeatable import of parcels that were sent to Skytec through the
// web client or Excel upload (no order reference). Each parcel is matched to
// our order by the customer's phone number + date (+ amount as tie-breaker).
// Parcels that cannot be matched are still stored (order_number "SKY-<code>")
// so COD and return statistics stay complete.
// ─────────────────────────────────────────────────────────────────────────────
import type { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  ORDER_TABLES, STATE_LABEL, parseSkyDate, skyJson, stateFromInternal, syncCodDay, syncOrderStatus,
  type SkyNajava,
} from "@/lib/skytec";

type Sb = ReturnType<typeof getSupabaseAdmin>;
const DAY = 86400_000;

type SkyParcel = {
  sifra?: string; sifraExt?: string | null; status?: number;
  datumSlanja?: string; datumDostave?: string;
  primalacNaziv?: string; primalacTelefon?: string; primalacPttNaziv?: string; primalacPtt?: string;
  iznosOtkupnine?: number; opisPosiljke?: string; postarina?: number;
};

type OrderRow = {
  order_number: string; telefon: string | null; ime: string | null; grad: string | null;
  ukupno: number | null; created_at: string;
};

/** Last 8 digits — makes 063 123 456, +387 63 123 456 and 38763123456 equal. */
export function phoneKey(p?: string | null): string {
  const d = String(p ?? "").replace(/\D/g, "");
  return d.length >= 8 ? d.slice(-8) : d;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    for (let x = q.shift(); x !== undefined; x = q.shift()) await fn(x);
  }));
}

function ymd(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
}

export async function importHistory(sb: Sb, days = 60) {
  const to = new Date();
  const from = new Date(Date.now() - days * DAY);

  // 1. Every consolidated announcement in the window, then its parcels.
  const najave = await skyJson<SkyNajava[]>(
    `/announce/list?dateFrom=${ymd(from)}&dateTo=${ymd(to)}&limitResults=500`
  );
  const parcels: SkyParcel[] = [];
  await pool(najave.filter((n) => n.sifra), 4, async (n) => {
    const full = await skyJson<{ posiljke?: SkyParcel[] }>(`/announce/single?sifra=${n.sifra}`);
    for (const p of full.posiljke ?? []) if (p.sifra) parcels.push(p);
  });

  // 2. Skip parcels we already track.
  const known = new Set<string>();
  const knownOrders = new Set<string>();
  for (let i = 0; i < parcels.length; i += 200) {
    const chunk = parcels.slice(i, i + 200).map((p) => p.sifra!);
    const { data } = await sb.from("skytec_shipments").select("sky_sifra").in("sky_sifra", chunk);
    for (const r of (data ?? []) as { sky_sifra: string }[]) known.add(r.sky_sifra);
  }
  {
    const { data } = await sb.from("skytec_shipments").select("order_number").gte("created_at", new Date(from.getTime() - 30 * DAY).toISOString());
    for (const r of (data ?? []) as { order_number: string }[]) knownOrders.add(r.order_number);
  }
  const fresh = parcels.filter((p) => !known.has(p.sifra!));

  // 3. Candidate orders from every order table, indexed by phone.
  const since = new Date(from.getTime() - 21 * DAY).toISOString();
  const byPhone = new Map<string, OrderRow[]>();
  for (const t of ORDER_TABLES) {
    for (let page = 0; ; page++) {
      const { data, error } = await sb.from(t)
        .select("order_number, telefon, ime, grad, ukupno, created_at")
        .gte("created_at", since)
        .neq("status", "cancelled")
        .order("created_at", { ascending: true })
        .range(page * 1000, page * 1000 + 999);
      if (error || !data?.length) break;
      for (const o of data as OrderRow[]) {
        if (!o.order_number) continue;
        const k = phoneKey(o.telefon);
        if (!k) continue;
        const arr = byPhone.get(k) ?? [];
        arr.push(o);
        byPhone.set(k, arr);
      }
      if (data.length < 1000) break;
    }
  }

  // 4. Match: same phone, order placed 0–21 days before the parcel was sent,
  //    prefer equal COD amount, then the most recent order. Each order used once.
  const used = new Set<string>(knownOrders);
  let matched = 0, unmatched = 0;
  const rows: Record<string, unknown>[] = [];
  const statusUpdates: { order: string; state: ReturnType<typeof stateFromInternal> }[] = [];

  // Oldest parcels first so repeat customers map in chronological order.
  fresh.sort((a, b) => String(a.datumSlanja).localeCompare(String(b.datumSlanja)));

  for (const p of fresh) {
    const sent = parseSkyDate(p.datumSlanja);
    const sentMs = sent ? new Date(sent).getTime() : Date.now();
    const cands = (byPhone.get(phoneKey(p.primalacTelefon)) ?? []).filter((o) => {
      const t = new Date(o.created_at).getTime();
      return !used.has(o.order_number) && t <= sentMs + DAY && t >= sentMs - 21 * DAY;
    });
    const amount = Number(p.iznosOtkupnine ?? 0);
    cands.sort((a, b) => {
      const da = Math.abs(Number(a.ukupno ?? 0) - amount) < 0.01 ? 0 : 1;
      const db = Math.abs(Number(b.ukupno ?? 0) - amount) < 0.01 ? 0 : 1;
      return da - db || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    const o = cands[0];
    if (o) { used.add(o.order_number); matched++; } else unmatched++;

    const state = stateFromInternal(p.status) ?? "najava";
    const stateAt = parseSkyDate(p.datumDostave) ?? sent;
    const orderNumber = o?.order_number ?? `SKY-${p.sifra}`;
    rows.push({
      order_number: orderNumber,
      order_date: (o?.created_at ?? sent ?? new Date().toISOString()).slice(0, 10),
      product_prefix: o ? o.order_number.split("-")[0].toUpperCase() : null,
      ime: o?.ime ?? p.primalacNaziv ?? null,
      telefon: o?.telefon ?? p.primalacTelefon ?? null,
      grad: o?.grad ?? p.primalacPttNaziv ?? null,
      ptt: p.primalacPtt ?? null,
      sky_sifra: p.sifra,
      postarina: p.postarina ?? null,
      cod_amount: amount,
      state,
      state_label: STATE_LABEL[state],
      state_at: stateAt,
      created_at: sent ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (o) statusUpdates.push({ order: o.order_number, state });
  }

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await sb.from("skytec_shipments")
      .upsert(rows.slice(i, i + 200), { onConflict: "order_number", ignoreDuplicates: true });
    if (error) throw error;
  }

  // 5. Mirror the delivery result onto the orders (isporučena / vraćena / poslana).
  await pool(statusUpdates, 5, async (u) => { if (u.state) await syncOrderStatus(sb, u.order, u.state); });

  // 6. COD remittances for the whole window, then mark paid parcels.
  const codDays: string[] = [];
  for (let i = 0; i <= days; i++) codDays.push(ymd(new Date(Date.now() - i * DAY)));
  let remittances = 0;
  await pool(codDays, 5, async (d) => {
    try { remittances += (await syncCodDay(sb, d)).count; } catch { /* a missing day is not fatal */ }
  });

  return {
    announcements: najave.length,
    parcels: parcels.length,
    alreadyKnown: parcels.length - fresh.length,
    imported: rows.length,
    matched,
    unmatched,
    remittances,
  };
}
