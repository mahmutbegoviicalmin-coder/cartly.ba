// ─────────────────────────────────────────────────────────────────────────────
// Skytec Express OrdersAPI client + shared logic (server-only).
//
// Docs: https://webklijent.skytecexpress.ba/api-docs/index.html
// Env:  SKYTEC_API_KEY          contract API key (header API-KEY)
//       SKYTEC_ENV              "prod" → production, anything else → test server
//       SKYTEC_WEBHOOK_SECRET   value Skytec must send in X-Webhook-Key
// ─────────────────────────────────────────────────────────────────────────────
import type { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalize, lookupPTT, type NormOrder } from "@/lib/export-shared";

type Sb = ReturnType<typeof getSupabaseAdmin>;

export const SKYTEC_BASE =
  process.env.SKYTEC_ENV === "prod"
    ? "https://api.skytecexpress.ba/orders"
    : "https://api.skytecexpress.ba/test/orders";

export const WEBHOOK_HEADER = "X-Webhook-Key";

export class SkytecError extends Error {
  constructor(message: string, public status: number, public body?: unknown) {
    super(message);
  }
}

function apiKey(): string {
  const k = process.env.SKYTEC_API_KEY;
  if (!k) throw new SkytecError("SKYTEC_API_KEY nije postavljen.", 500);
  return k;
}

async function sky(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.auth !== false) headers.set("API-KEY", apiKey());
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(`${SKYTEC_BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown = text;
    try { body = JSON.parse(text); } catch { /* plain text */ }
    const b = body as { poruka?: string; detaljno?: string; message?: string; error?: string } | string;
    const msg = typeof b === "string"
      ? b
      : [b?.poruka ?? b?.message ?? b?.error, b?.detaljno].filter(Boolean).join(" — ");
    throw new SkytecError(msg || `Skytec HTTP ${res.status}`, res.status, body);
  }
  return res;
}

async function skyJson<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  return (await sky(path, init)).json() as Promise<T>;
}

// ── Types (subset of the OpenAPI spec we use) ────────────────────────────────

export type SkyCity = { pttBroj: string; naziv: string; opstina?: string; dsv?: boolean; ino?: boolean };

export type SkyPosiljka = {
  sifra?: string;
  sifraExt?: string;
  status?: number;
  postarina?: number;
};

export type SkyNajava = { sifra?: number; posiljke?: SkyPosiljka[] };

export type SkyStatus = { sifra?: string; sifraExt?: string; status?: number };

export type SkyTrackItem = { datum?: string; sifra?: number; naziv?: string; centar?: string };

export type SkyCod = {
  sifraExt?: string | null;
  sifraOtkupnine?: string | null;
  sifraIzvornePosiljke?: string | null;
  status?: number;
  datumSlanja?: string | null;
  datumDostave?: string | null;
  datumPresjeka?: string | null;
  iznosOtkupnine?: number | null;
  nalogSifra?: number | null;
};

export type SkyNotification = {
  callbackUID?: string;
  shipmentNumber?: string;
  referenceNumber?: string | null;
  statusDate?: string;
  statusCode?: string;
  statusDescription?: string;
  note?: string | null;
  numberOfPackages?: number;
  trackingUrl?: string;
};

// ── State model ──────────────────────────────────────────────────────────────

export type ShipState =
  | "najava" | "preuzeto" | "u_dostavi" | "odgodjena" | "sporna"
  | "dostavljena" | "vracena" | "povrat_dostavljen" | "otkazana";

export const STATE_LABEL: Record<ShipState, string> = {
  najava: "U najavi",
  preuzeto: "Preuzeto",
  u_dostavi: "U dostavi",
  odgodjena: "Odgođena",
  sporna: "Sporna",
  dostavljena: "Dostavljena",
  vracena: "Vraćena",
  povrat_dostavljen: "Povrat dostavljen",
  otkazana: "Otkazana",
};

/** Webhook event codes (different from the internal status codes!). */
const WEBHOOK_CODE: Record<string, ShipState> = {
  "1": "najava", "3": "preuzeto", "5": "sporna", "7": "odgodjena",
  "9": "vracena", "14": "u_dostavi", "10": "dostavljena", "11": "povrat_dostavljen",
};

/** Internal operational status from /shipment/status. */
const INTERNAL_CODE: Record<number, ShipState> = {
  1: "najava", 3: "u_dostavi", 7: "odgodjena", 9: "sporna",
  10: "dostavljena", 11: "vracena", 13: "vracena", [-9]: "otkazana",
};

export function stateFromWebhook(code?: string): ShipState | null {
  return code ? WEBHOOK_CODE[String(code).trim()] ?? null : null;
}
export function stateFromInternal(code?: number): ShipState | null {
  return code === undefined || code === null ? null : INTERNAL_CODE[code] ?? null;
}

export const FINAL_STATES: ShipState[] = ["dostavljena", "vracena", "povrat_dostavljen", "otkazana"];

/** Order-table status that matches a shipment state (null = leave it). */
export function orderStatusFor(state: ShipState): string | null {
  switch (state) {
    case "preuzeto":
    case "u_dostavi":
    case "odgodjena":
    case "sporna":
      return "poslana";
    case "dostavljena":
      return "isporučena";
    case "vracena":
    case "povrat_dostavljen":
      return "vraćena";
    default:
      return null;
  }
}

/** Skytec dates look like 2026-10-30T10:00:00.000+0100 → make them ISO-parsable. */
export function parseSkyDate(s?: string | null): string | null {
  if (!s) return null;
  const fixed = s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ── Reference data ───────────────────────────────────────────────────────────

let citiesCache: { at: number; list: SkyCity[] } | null = null;

export async function getCities(): Promise<SkyCity[]> {
  if (citiesCache && Date.now() - citiesCache.at < 12 * 3600_000) return citiesCache.list;
  const list = await skyJson<SkyCity[]>("/cities", { auth: false });
  citiesCache = { at: Date.now(), list };
  return list;
}

/**
 * Resolve a postal code that Skytec actually knows:
 * customer PTT → our city lookup → Skytec place name match.
 */
export function resolvePtt(cities: SkyCity[], grad: string, typedPtt?: string): string | null {
  const valid = new Set(cities.map((c) => c.pttBroj));
  if (typedPtt && valid.has(typedPtt)) return typedPtt;
  const ours = lookupPTT(grad);
  if (ours && valid.has(ours)) return ours;

  const key = normalize(grad);
  if (!key) return null;
  const hits = cities.filter((c) => normalize(c.naziv ?? "") === key);
  if (hits.length === 0) return null;
  // Prefer the main office code (…000 / …00 / lowest).
  hits.sort((a, b) => {
    const score = (p: string) => (p.endsWith("000") ? 0 : p.endsWith("00") ? 1 : 2);
    return score(a.pttBroj) - score(b.pttBroj) || a.pttBroj.localeCompare(b.pttBroj);
  });
  return hits[0].pttBroj;
}

// ── Shipments ────────────────────────────────────────────────────────────────

export function toPosiljka(o: NormOrder, ptt: string) {
  const cod = Math.round(Number(o.ukupno || 0) * 100) / 100;
  const firstName = (o.ime ?? "").trim().split(/\s+/)[0] || o.ime;
  return {
    tipWebNajave: 0,
    sifraExt: o.order_number,
    uslugaSifra: 1,
    opisPosiljke: o.opis.slice(0, 100),
    brojPaketa: Math.min(99, Math.max(1, o.units)),
    tezina: Math.max(1, o.units),
    vrednostPosiljke: 0,
    otkupnina: cod > 0,
    ...(cod > 0 ? { iznosOtkupnine: cod } : {}),
    obveznikPlacanja: 1,
    primalacNaziv: o.ime,
    primalacAdresa: o.adresa,
    primalacPtt: ptt,
    primalacTelefon: o.telefon,
    primalacKontakt: firstName,
  };
}

export async function announce(posiljke: ReturnType<typeof toPosiljka>[]): Promise<SkyNajava> {
  return skyJson<SkyNajava>("/announce/add", { method: "POST", body: JSON.stringify(posiljke) });
}

export async function getStatus(sifra: string): Promise<SkyStatus> {
  return skyJson<SkyStatus>(`/shipment/status?sifra=${encodeURIComponent(sifra)}`);
}

export async function getTrack(params: { sifra?: string; ref?: string }): Promise<SkyTrackItem[]> {
  const q = params.sifra ? `sifra=${encodeURIComponent(params.sifra)}` : `ref=${encodeURIComponent(params.ref ?? "")}`;
  return skyJson<SkyTrackItem[]>(`/shipment/track?${q}`);
}

export async function getLabels(refs: string[], format: "A4" | "A410" | "60MM"): Promise<ArrayBuffer> {
  const res = await sky("/shipment/label", {
    method: "POST",
    body: JSON.stringify({ format, referenceCodes: refs }),
  });
  return res.arrayBuffer();
}

export async function cancelShipment(reference: string) {
  return skyJson<{ success: boolean; code: string }>("/shipment/cancel", {
    method: "POST",
    body: JSON.stringify({ reference }),
  });
}

export async function getCodPayments(datum: string, tipDatuma: "ISPLATA" | "PRESJEK" = "ISPLATA"): Promise<SkyCod[]> {
  return skyJson<SkyCod[]>(`/cod-payments?datum=${datum}&tipDatuma=${tipDatuma}`);
}

export async function registerWebhook(callbackUrl: string, secret: string) {
  return skyJson<{ message?: string }>("/shipment/webhook", {
    method: "POST",
    body: JSON.stringify({
      webhookConfig: { callbackUrl, authType: "APIKEY", apiKeyName: WEBHOOK_HEADER, apiKey: secret },
      testNotification: {
        callbackUID: `test-${Date.now()}`,
        shipmentNumber: "TEST",
        referenceNumber: "TEST",
        statusCode: "1",
        statusDescription: "U NAJAVI",
        note: "Test cartly.ba",
      },
    }),
  });
}

export async function getWebhook() {
  return skyJson<{ callbackUrl?: string; authType?: string }>("/shipment/webhook");
}

// ── DB helpers ───────────────────────────────────────────────────────────────

const ORDER_TABLES = [
  "orders", "cetka_orders", "komarnik_orders", "usmjerivac_orders", "lezaljka_orders", "masina_orders",
] as const;

/** Best-effort: mirror the shipment state onto the order row (whichever table holds it). */
export async function syncOrderStatus(sb: Sb, orderNumber: string, state: ShipState) {
  const status = orderStatusFor(state);
  if (!status || !orderNumber) return;
  for (const t of ORDER_TABLES) {
    const { data, error } = await sb.from(t).update({ status }).eq("order_number", orderNumber).select("id");
    if (!error && data && data.length > 0) return;
  }
}

/** Apply a new state to a shipment row + order, and log the event. */
export async function applyState(
  sb: Sb,
  where: { sky_sifra?: string | null; order_number?: string | null },
  ev: {
    state: ShipState;
    label?: string;
    note?: string | null;
    at?: string | null;
    code?: string;
    source: "webhook" | "poll";
    callbackUid?: string;
    trackingUrl?: string;
    raw?: unknown;
  }
): Promise<{ duplicate: boolean; matched: boolean; orderNumber?: string }> {
  if (ev.callbackUid) {
    const { error } = await sb.from("skytec_events").insert({
      callback_uid: ev.callbackUid,
      source: ev.source,
      order_number: where.order_number ?? null,
      sky_sifra: where.sky_sifra ?? null,
      status_code: ev.code ?? null,
      state: ev.state,
      label: ev.label ?? null,
      note: ev.note ?? null,
      status_at: ev.at ?? null,
      raw: ev.raw ?? null,
    });
    // 23505 = unique violation → Skytec re-sent a notification we already have.
    if (error?.code === "23505") return { duplicate: true, matched: false };
  }

  let q = sb.from("skytec_shipments").select("id, order_number, state, state_at");
  if (where.sky_sifra && where.order_number) {
    q = q.or(`sky_sifra.eq.${where.sky_sifra},order_number.eq.${where.order_number}`);
  } else if (where.sky_sifra) {
    q = q.eq("sky_sifra", where.sky_sifra);
  } else if (where.order_number) {
    q = q.eq("order_number", where.order_number);
  } else {
    return { duplicate: false, matched: false };
  }
  const { data: rows } = await q.limit(1);
  const row = rows?.[0] as { id: string; order_number: string; state: string; state_at: string | null } | undefined;
  if (!row) return { duplicate: false, matched: false };

  // Ignore out-of-order notifications that are older than what we have.
  if (ev.at && row.state_at && new Date(ev.at) < new Date(row.state_at)) {
    return { duplicate: false, matched: true, orderNumber: row.order_number };
  }

  if (!ev.callbackUid) {
    // Poll result: only log when the state actually changed.
    if (row.state === ev.state) return { duplicate: false, matched: true, orderNumber: row.order_number };
    await sb.from("skytec_events").insert({
      source: ev.source, order_number: row.order_number, sky_sifra: where.sky_sifra ?? null,
      status_code: ev.code ?? null, state: ev.state, label: ev.label ?? null, note: ev.note ?? null,
      status_at: ev.at ?? null, raw: ev.raw ?? null,
    });
  }

  await sb.from("skytec_shipments").update({
    state: ev.state,
    state_label: ev.label ?? STATE_LABEL[ev.state],
    state_note: ev.note ?? null,
    state_at: ev.at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...(where.sky_sifra ? { sky_sifra: where.sky_sifra } : {}),
    ...(ev.trackingUrl ? { tracking_url: ev.trackingUrl } : {}),
  }).eq("id", row.id);

  await syncOrderStatus(sb, row.order_number, ev.state);
  return { duplicate: false, matched: true, orderNumber: row.order_number };
}

/** Pull COD remittances for one day, store them, and mark matching shipments paid. */
export async function syncCodDay(sb: Sb, datum: string): Promise<{ count: number; matched: number }> {
  const list = await getCodPayments(datum, "ISPLATA");
  let matched = 0;
  for (const c of list) {
    if (!c.sifraOtkupnine) continue;
    await sb.from("skytec_cod_payments").upsert({
      sifra_otkupnine: c.sifraOtkupnine,
      sifra_izvorne_posiljke: c.sifraIzvornePosiljke ?? null,
      sifra_ext: c.sifraExt ?? null,
      status: c.status ?? null,
      iznos: c.iznosOtkupnine ?? null,
      datum_slanja: parseSkyDate(c.datumSlanja),
      datum_dostave: parseSkyDate(c.datumDostave),
      datum_presjeka: parseSkyDate(c.datumPresjeka),
      nalog_sifra: c.nalogSifra ?? null,
      raw: c,
    });
    if (c.status === 10 && c.sifraIzvornePosiljke) {
      const { data } = await sb.from("skytec_shipments").update({
        cod_paid_at: parseSkyDate(c.datumDostave),
        cod_presjek_at: parseSkyDate(c.datumPresjeka),
        cod_paid_amount: c.iznosOtkupnine ?? null,
        updated_at: new Date().toISOString(),
      }).eq("sky_sifra", c.sifraIzvornePosiljke).select("id");
      if (data && data.length > 0) matched++;
    }
  }
  return { count: list.length, matched };
}

/** Poll /shipment/status for open shipments (fallback when a webhook was missed). */
export async function pollOpenShipments(sb: Sb, limit = 120): Promise<{ checked: number; changed: number; errors: number }> {
  const since = new Date(Date.now() - 45 * 86400_000).toISOString();
  const { data } = await sb.from("skytec_shipments")
    .select("order_number, sky_sifra, state")
    .not("sky_sifra", "is", null)
    .not("state", "in", `(${FINAL_STATES.join(",")})`)
    .gte("created_at", since)
    .order("updated_at", { ascending: true })
    .limit(limit);

  const rows = (data ?? []) as { order_number: string; sky_sifra: string; state: string }[];
  let changed = 0, errors = 0;
  const queue = [...rows];
  const worker = async () => {
    for (let r = queue.shift(); r; r = queue.shift()) {
      try {
        const s = await getStatus(r.sky_sifra);
        const state = stateFromInternal(s.status);
        if (state && state !== r.state) {
          await applyState(sb, { sky_sifra: r.sky_sifra, order_number: r.order_number }, {
            state, source: "poll", code: String(s.status), label: STATE_LABEL[state], raw: s,
          });
          changed++;
        } else {
          await sb.from("skytec_shipments").update({ updated_at: new Date().toISOString() })
            .eq("order_number", r.order_number);
        }
      } catch {
        errors++;
      }
    }
  };
  await Promise.all(Array.from({ length: 5 }, worker));
  return { checked: rows.length, changed, errors };
}

/**
 * A notification arrived for a parcel we never announced via API (e.g. it was
 * uploaded through the Excel export). If the reference is one of our order
 * numbers, create the shipment row from the order so tracking still works.
 */
export async function ensureShipmentFromOrder(sb: Sb, orderNumber: string, skySifra?: string | null): Promise<boolean> {
  for (const t of ORDER_TABLES) {
    const { data } = await sb.from(t)
      .select("order_number, created_at, ime, telefon, grad, ukupno")
      .eq("order_number", orderNumber).limit(1);
    const o = data?.[0] as
      | { order_number: string; created_at: string; ime: string; telefon: string; grad: string; ukupno: number }
      | undefined;
    if (!o) continue;
    const { error } = await sb.from("skytec_shipments").upsert({
      order_number: o.order_number,
      order_date: String(o.created_at).slice(0, 10),
      product_prefix: o.order_number.split("-")[0]?.toUpperCase() ?? null,
      ime: o.ime, telefon: o.telefon, grad: o.grad,
      cod_amount: Number(o.ukupno) || 0,
      sky_sifra: skySifra ?? null,
    }, { onConflict: "order_number", ignoreDuplicates: true });
    return !error;
  }
  return false;
}

/** E-mail the owner when a parcel needs attention (postponed / disputed / returned). */
export async function notifyOwner(subject: string, lines: string[]) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  if (!key || !to) return;
  const { Resend } = await import("resend");
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  await new Resend(key).emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${lines.map((l) => `<p style="margin:0 0 6px">${esc(l)}</p>`).join("")}</div>`,
  }).catch(console.error);
}
