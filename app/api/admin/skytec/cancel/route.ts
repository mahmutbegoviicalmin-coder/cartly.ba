import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { cancelShipment, SkytecError } from "@/lib/skytec";

export const dynamic = "force-dynamic";

/** POST { order } → cancel at Skytec (only possible while still "U najavi"). */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { order } = (await req.json().catch(() => ({}))) as { order?: string };
  if (!order) return NextResponse.json({ error: "Nedostaje narudžba." }, { status: 400 });
  try {
    await cancelShipment(order);
    await getSupabaseAdmin().from("skytec_shipments").update({
      state: "otkazana", state_label: "Otkazana", state_at: new Date().toISOString(),
      sky_sifra: null, updated_at: new Date().toISOString(),
    }).eq("order_number", order);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof SkytecError && e.status === 422
      ? "Pošiljka je već preuzeta — više se ne može otkazati."
      : e instanceof Error ? e.message : "Greška";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
