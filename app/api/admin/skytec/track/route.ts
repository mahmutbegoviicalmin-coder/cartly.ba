import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { getTrack } from "@/lib/skytec";

export const dynamic = "force-dynamic";

/** GET ?order=MKK-123 → Skytec event history + our stored events. */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = req.nextUrl.searchParams.get("order") ?? "";
  if (!order) return NextResponse.json({ error: "Nedostaje narudžba." }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data: ship } = await sb.from("skytec_shipments").select("sky_sifra").eq("order_number", order).limit(1);
  const sifra = (ship?.[0] as { sky_sifra?: string } | undefined)?.sky_sifra;

  const [track, events] = await Promise.all([
    getTrack(sifra ? { sifra } : { ref: order }).catch(() => []),
    sb.from("skytec_events").select("created_at, state, label, note, status_at, source")
      .eq("order_number", order).order("created_at", { ascending: false }).limit(50),
  ]);
  return NextResponse.json({ track, events: events.data ?? [] });
}
