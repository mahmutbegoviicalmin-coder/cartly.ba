import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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

  if (search) {
    const f = `ime.ilike.%${search}%,telefon.ilike.%${search}%,grad.ilike.%${search}%`;
    qOrders = qOrders.or(f);
    qCetka  = qCetka.or(f);
    qUsm    = qUsm.or(f);
  }
  if (status && status !== "all") {
    qOrders = qOrders.eq("status", status);
    qCetka  = qCetka.eq("status", status);
    qUsm    = qUsm.eq("status", status);
  }

  const [resOrders, resCetka, resUsm] = await Promise.all([qOrders, qCetka, qUsm]);

  // ── Normalise cetka rows to match the shared Order shape ────────────────────
  // Prefix cetka IDs with "cetka_" so PATCH/DELETE knows which table to use.
  type RawCetka = {
    id: string; created_at: string; order_number?: string;
    ime: string; telefon: string; adresa: string; grad: string;
    extra_set: boolean; broj_setova: number;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const normalisedCetka = ((resCetka.data ?? []) as RawCetka[]).map((o) => ({
    id:               `cetka_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           o.adresa,
    grad:             o.grad,
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
    bundle: number; bundle_label: string;
    cijena_proizvoda: number; dostava: number; ukupno: number; status: string;
  };

  const normalisedUsm = ((resUsm.data ?? []) as RawUsm[]).map((o) => ({
    id:               `usm_${o.id}`,
    created_at:       o.created_at,
    order_number:     o.order_number,
    ime:              o.ime,
    telefon:          o.telefon,
    adresa:           o.adresa,
    grad:             o.grad,
    velicine: [{ velicina: `Usmjerivač ${o.bundle_label}`, kolicina: o.bundle }],
    ukupno_pari:      o.bundle,
    cijena_proizvoda: o.cijena_proizvoda,
    dostava:          o.dostava,
    ukupno:           o.ukupno,
    status:           o.status,
  }));

  // ── Merge + sort by date desc ────────────────────────────────────────────────
  const merged = [
    ...(resOrders.data ?? []),
    ...normalisedCetka,
    ...normalisedUsm,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = merged.length;

  // ── Paginate in JS (only when not fetching all) ──────────────────────────────
  const paginated = all
    ? merged
    : merged.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({ orders: paginated, total, page, pageSize });
}
