// Shared formatting for the Skytec / Otkupnine admin tabs. Written by hand
// because browsers ship no bs-BA locale.
import { PRODUCTS } from "@/lib/export-products";

export const PREFIX_LABEL: Record<string, string> = {};
for (const p of PRODUCTS) for (const pre of p.prefixes ?? []) PREFIX_LABEL[pre] = p.label;
export const productOf = (prefix: string | null) => (prefix ? PREFIX_LABEL[prefix] ?? prefix : "Bez narudžbe");

/** 1234.5 → "1.234,50 KM" (written by hand: browsers lack a bs-BA locale). */
export function km(n: number) {
  const [int, dec] = (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec} KM`;
}

export const DAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
export const MONTHS = ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"];

export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return `${n} ${one}`;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}
export const paket = (n: number) => plural(n, "paket", "paketa", "paketa");
export const narudzba = (n: number) => plural(n, "narudžba", "narudžbe", "narudžbi");

export function when(iso: string | null) {
  if (!iso) return "—";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Sarajevo",
    }).formatToParts(new Date(iso)).map((x) => [x.type, x.value])
  );
  return `${p.day}.${p.month}. u ${p.hour}:${p.minute}`;
}

export const todayStr = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });

export function shiftDay(d: string, by: number) {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + by);
  return t.toISOString().slice(0, 10);
}

export function prettyDay(d: string) {
  if (d === todayStr()) return "Danas";
  if (d === shiftDay(todayStr(), -1)) return "Jučer";
  const t = new Date(`${d}T12:00:00Z`);
  return `${DAYS[t.getUTCDay()]}, ${t.getUTCDate()}. ${MONTHS[t.getUTCMonth()]}`;
}

export async function downloadBlob(res: Response | Blob, name: string) {
  const blob = res instanceof Blob ? res : await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Auto-sync with Skytec ────────────────────────────────────────────────────
// Our tables only mirror Skytec, so before showing money numbers we pull fresh
// statuses + COD remittances. Throttled so switching tabs doesn't hammer the API.
const SYNC_KEY = "skx-last-sync";
const SYNC_EVERY = 5 * 60_000;
let inflight: Promise<boolean> | null = null;

export function lastSyncAt(): number | null {
  try { const v = Number(localStorage.getItem(SYNC_KEY)); return v > 0 ? v : null; } catch { return null; }
}

/** Sync if the last one is older than 5 min (or `force`). Resolves true when a sync ran OK. */
export function syncSkytec(force = false): Promise<boolean> {
  const last = lastSyncAt();
  if (!force && last && Date.now() - last < SYNC_EVERY) return Promise.resolve(false);
  if (inflight) return inflight;
  inflight = fetch("/api/admin/skytec/sync", { method: "POST" })
    .then((r) => {
      if (r.ok) { try { localStorage.setItem(SYNC_KEY, String(Date.now())); } catch {} }
      return r.ok;
    })
    .catch(() => false)
    .finally(() => { inflight = null; });
  return inflight;
}

export function agoText(ts: number | null) {
  if (!ts) return "još nije osvježeno";
  const m = Math.floor((Date.now() - ts) / 60_000);
  if (m < 1) return "osvježeno upravo";
  if (m < 60) return `osvježeno prije ${m} min`;
  return `osvježeno ${when(new Date(ts).toISOString())}`;
}
