import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { normalizeBaPhone } from "@/lib/ba-phone";
import { ORDER_TABLES } from "@/lib/skytec";
import { DRAFT_SOURCE, REJECT_SOURCE } from "@/lib/checkout-drafts";

export const dynamic = "force-dynamic";

type Ev = { id: number | string; source: string; label: string | null; status_at: string | null; created_at: string; raw: Record<string, string> | null; note: string | null };

/**
 * GET ?days=7 → unfinished checkouts and refused submissions whose phone has
 * no order since. POST {id, done:true} → mark one as handled (hidden).
 */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Math.min(60, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 7));
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.from("skytec_events")
    .select("id, source, label, status_at, created_at, raw, note")
    .in("source", [DRAFT_SOURCE, REJECT_SOURCE]).gte("created_at", since)
    .order("status_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Orders placed since (any table): a phone that ordered is no longer "unfinished".
  const ordered = new Map<string, string>();
  await Promise.all(ORDER_TABLES.map(async (t) => {
    const { data: rows } = await sb.from(t).select("telefon, created_at, order_number").gte("created_at", since);
    for (const r of rows ?? []) {
      const p = normalizeBaPhone(String(r.telefon ?? ""));
      if (p && (!ordered.has(p) || ordered.get(p)! < r.created_at)) ordered.set(p, r.created_at);
    }
  }));

  const seen = new Set<string>();
  const items = ((data ?? []) as Ev[]).flatMap((e) => {
    const raw = e.raw ?? {};
    const phone = normalizeBaPhone(raw.phone ?? raw.telefon ?? "") ?? "";
    const at = e.status_at ?? e.created_at;
    if (e.note === "rijeseno") return [];
    // Ordered after this attempt → done. Keep only the newest entry per phone.
    if (phone && ordered.has(phone) && ordered.get(phone)! >= at) return [];
    const key = phone || String(e.id);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      id: e.id,
      kind: e.source === REJECT_SOURCE ? "odbijeno" : "nedovrseno",
      reason: e.source === REJECT_SOURCE ? e.label : null,
      product: e.source === DRAFT_SOURCE ? e.label : null,
      at,
      ime: [raw.ime, raw.prezime].filter(Boolean).join(" ") || null,
      telefon: raw.telefon ?? raw.phone ?? null,
      phone: phone || null,
      adresa: raw.adresa ?? null, grad: raw.grad ?? null, postanski: raw.postanski ?? null,
      page: raw.page ?? raw.route ?? null,
    }];
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (id == null) return NextResponse.json({ error: "id" }, { status: 400 });
  const { error } = await getSupabaseAdmin().from("skytec_events").update({ note: "rijeseno" })
    .eq("id", id).in("source", [DRAFT_SOURCE, REJECT_SOURCE]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
