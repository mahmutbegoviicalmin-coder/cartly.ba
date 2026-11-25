import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalizeBaPhone } from "@/lib/ba-phone";
import { getClientIP } from "@/lib/meta-capi";
import { DRAFT_KEYS, DRAFT_SOURCE } from "@/lib/checkout-drafts";

export const dynamic = "force-dynamic";

const clip = (v: unknown, n = 160) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Save what a customer has typed so far (sent by components/store/CheckoutDraft).
 * Only kept once the phone number is valid: without it nobody can be called back.
 * Accepts JSON or a sendBeacon text body.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = JSON.parse(await req.text()); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const id = clip(body.id, 64);
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  const phone = normalizeBaPhone(clip(body.telefon, 60));
  if (!phone) return NextResponse.json({ ok: true, saved: false });

  const fields: Record<string, string> = {};
  for (const k of DRAFT_KEYS) { const v = clip(body[k]); if (v) fields[k] = v; }

  const { error } = await getSupabaseAdmin().from("skytec_events").upsert({
    callback_uid: `draft:${id}`,
    source: DRAFT_SOURCE,
    state: "nedovrseno",
    label: clip(body.product, 120) || null,
    status_at: new Date().toISOString(),
    raw: { ...fields, phone, page: clip(body.page, 200), ip: getClientIP(req) },
  }, { onConflict: "callback_uid" });
  if (error) {
    console.error("checkout-draft:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved: true });
}
