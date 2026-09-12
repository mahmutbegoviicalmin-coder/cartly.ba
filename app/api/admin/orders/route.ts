import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { readIp, stripIp } from "@/lib/order-ip";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get("page") ?? "1");
  const search   = searchParams.get("search")  ?? "";
  const status   = searchParams.get("status")  ?? "all";
  const all      = searchParams.get("all")     === "true";
  const pageSize = 20;

  const sb = getSupabaseAdmin();

  // ── Fetch from all tables in parallel ───────────────────────────────────────

  let qOrders = sb.from("orders").select("*").order("created_at", { ascending: false });
  let qCetka  = sb.from("cetka_orders").select("*").order("created_at", { ascending: false });
  let qUsm    = sb.from("usmjerivac_orders").select("*").order("created_at", { ascending: false });
  let qKomr   = sb.from("komarnik_orders").select("*").order("created_at", { ascending: false });
  let qLez    = sb.from("lezaljka_orders").select("*").order("created_at", { ascending: false });

  if (search) {
    const f = `ime.ilike.%${search}%,telefon.ilike.%${search}%,grad.ilike.%${search}%,adresa.ilike.%${search}%`;
    qOrders = qOrders.or(f);
    qCetka  = qCetka.or(f);
    qUsm    = qUsm.or(f);
    qKomr   = qKomr.or(f);
    qLez    = qLez.or(f);
  }
  if (status && status !== "all") {
    qOrders = qOrders.eq("status", status);
    qCetka  = qCetka.eq("status", status);
    qUsm    = qUsm.eq("status", status);
    qKomr   = qKomr.eq("status", status);
    qLez    = qLez.eq("status", status);
  }

  const [resOrders, resCetka, resUsm, resKomr, resLez] = await Promise.all([qOrders, qCetka, qUsm, qKomr, qLez]);

  // ── Normalise cetka rows to match the shared Order shape ────────────────────
  // Prefix cetka IDs with "cetka_" so PATCH/DELETE knows which table to use.
  type RawCetka = {
    id: string; created_at: string; order_number?: string;
    ime: string; telefon: string; adresa: string; grad: string;
    ip_address?: string;
    extra_set: boolean; broj_setova: number;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const normalisedCetka = ((resCetka.data ?? []) as RawCetka[]).map((o) => ({
    id:               `cetka_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           stripIp(o.adresa ?? ""),
    grad:             o.grad,
    ip_address:       readIp(o.adresa, o.ip_address),
    // Map to the same velicine shape the dashboard uses for display
    velicine: [{ velicina: "Čelična Četka 1+1 GRATIS", kolicina: o.broj_setova }],
    ukupno_pari:      o.broj_setova,
    cijena_proizvoda: o.cijena_proizvoda,
    dostava:          o.dostava,
    ukupno:           o.ukupno,
    status:           o.status,
  }));

  // ── Normalise usmjerivac rows ────────────────────────────────────────────────
  type RawUsm = {
    id: string; created_at: string; order_number?: string;
    ime: string; telefon: string; adresa: string; grad: string;
    ip_address?: string;
    bundle: number; bundle_label: string;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const normalisedUsm = ((resUsm.data ?? []) as RawUsm[]).map((o) => ({
    id:               `usm_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           stripIp(o.adresa ?? ""),
    grad:             o.grad,
    ip_address:       readIp(o.adresa, o.ip_address),
    velicine: [{ velicina: `Usmjerivač ${o.bundle_label}`, kolicina: o.bundle }],
    ukupno_pari:      o.bundle,
    cijena_proizvoda: o.cijena_proizvoda,
    dostava:          o.dostava,
    ukupno:           o.ukupno,
    status:           o.status,
  }));

  // ── Normalise komarnik rows ──────────────────────────────────────────────────
  type RawKomr = {
    id: string; created_at: string; order_number?: string;
    ime: string; telefon: string; adresa: string; grad: string;
    ip_address?: string;
    bundle: number; bundle_label: string;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const normalisedKomr = ((resKomr.data ?? []) as RawKomr[]).map((o) => ({
    id:               `komr_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           stripIp(o.adresa ?? ""),
    grad:             o.grad,
    ip_address:       readIp(o.adresa, o.ip_address),
    velicine: [{ velicina: `Komarnik ${o.bundle_label}`, kolicina: o.bundle }],
    ukupno_pari:      o.bundle,
    cijena_proizvoda: o.cijena_proizvoda,
    dostava:          o.dostava,
    ukupno:           o.ukupno,
    status:           o.status,
  }));

  // ── Normalise lezaljka rows ──────────────────────────────────────────────────
  type RawLez = {
    id: string; created_at: string; order_number?: string;
    ime: string; telefon: string; adresa: string; grad: string;
    ip_address?: string;
    boja: string; kolicina: number;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const COLOR_LABELS: Record<string, string> = {
    "maslinasto-siva": "Tamno maslinasto siva", "siva": "Siva", "tamno-zelena": "Tamno Zelena", "bordo": "Bordo", "crna": "Crna",
  };

  const normalisedLez = ((resLez.data ?? []) as RawLez[]).map((o) => ({
    id:               `lez_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           stripIp(o.adresa ?? ""),
    grad:             o.grad,
    ip_address:       readIp(o.adresa, o.ip_address),
    velicine: [{ velicina: `Lezaljka ${COLOR_LABELS[o.boja] ?? o.boja}`, kolicina: o.kolicina }],
    ukupno_pari:      o.kolicina,
    cijena_proizvoda: o.cijena_proizvoda,
    dostava:          o.dostava,
    ukupno:           o.ukupno,
    status:           o.status,
  }));

  // ── Merge + sort by date desc ────────────────────────────────────────────────
  const merged = [
    ...((resOrders.data ?? []) as { adresa?: string; ip_address?: string; created_at: string }[]).map((o) => ({
      ...o,
      ip_address: readIp(o.adresa, o.ip_address),
      adresa: stripIp(o.adresa ?? ""),
    })),
    ...normalisedCetka,
    ...normalisedUsm,
    ...normalisedKomr,
    ...normalisedLez,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const flagged = markDuplicates(merged);
  const total = flagged.length;

  // ── Paginate in JS (only when not fetching all) ──────────────────────────────
  const paginated = all
    ? flagged
    : flagged.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({ orders: paginated, total, page, pageSize });
}

function digitsPhone(t: unknown) {
  const d = String(t ?? "").replace(/\D/g, "");
  if (d.startsWith("387")) return "0" + d.slice(3);
  return d;
}

function fmtDupWhen(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("day")}.${g("month")}. u ${g("hour")}:${g("minute")}`;
}

function markDuplicates<T extends { id: string; created_at: string; ime?: string; telefon?: string; grad?: string; ip_address?: string }>(orders: T[]) {
  const hour = 3600_000;
  const phoneOf = (o: T) => digitsPhone(o.telefon);
  const ipOf = (o: T) => String(o.ip_address ?? "").trim();
  const personOf = (o: T) =>
    `${String(o.ime ?? "").trim().toLowerCase().replace(/\s+/g, " ")}|${String(o.grad ?? "").trim().toLowerCase()}`;

  return orders.map((o) => {
    const t = new Date(o.created_at).getTime();
    const phone = phoneOf(o);
    const ip = ipOf(o);
    const person = personOf(o);
    let phoneN = 0;
    let ipN = 0;
    let personN = 0;
    const hits = new Map<
      string,
      { id: string; ime: string; telefon: string; grad: string; created_at: string; via: Set<string> }
    >();

    const addHit = (other: T, reason: "telefon" | "osoba" | "ip") => {
      const existing = hits.get(other.id);
      if (existing) {
        existing.via.add(reason);
        return;
      }
      hits.set(other.id, {
        id: other.id,
        ime: String(other.ime ?? "—").trim() || "—",
        telefon: String(other.telefon ?? "—").trim() || "—",
        grad: String(other.grad ?? "").trim(),
        created_at: other.created_at,
        via: new Set([reason]),
      });
    };

    for (const other of orders) {
      if (other.id === o.id) continue;
      const ot = new Date(other.created_at).getTime();
      const within14d = Math.abs(t - ot) <= 14 * 24 * hour;
      const within48h = Math.abs(t - ot) <= 48 * hour;
      const samePhone = phone.length >= 8 && phoneOf(other) === phone && within14d;
      const samePerson = person.length > 5 && personOf(other) === person && within48h;
      const sameIp = ip.length > 6 && ipOf(other) === ip && within48h;
      if (samePhone) {
        phoneN++;
        addHit(other, "telefon");
      }
      if (samePerson) {
        personN++;
        addHit(other, "osoba");
      }
      if (sameIp) ipN++;
      if ((samePhone || samePerson) && sameIp) addHit(other, "ip");
    }

    const matches = [...hits.values()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map((h) => ({ ...h, via: [...h.via] }));

    const viaLabel: Record<string, string> = {
      telefon: "isti telefon",
      osoba: "isto ime i grad",
      ip: "isti IP",
    };
    const reasons = matches.map((h) => {
      const why = h.via.map((v) => viaLabel[v] ?? v).join(", ");
      const city = h.grad ? `, ${h.grad}` : "";
      return `${h.ime} je naručio ${fmtDupWhen(h.created_at)}, telefon ${h.telefon}${city} (${why})`;
    });

    return {
      ...o,
      duplicates: phoneN || personN ? { phone: phoneN, ip: ipN, person: personN, reasons, matches } : null,
    };
  });
}
