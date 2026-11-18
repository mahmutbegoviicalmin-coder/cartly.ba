import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { importHistory } from "@/lib/skytec-import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST { days? } → pull parcels sent via Skytec web/Excel and match them to orders by phone. */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { days } = (await req.json().catch(() => ({}))) as { days?: number };
  try {
    return NextResponse.json(await importHistory(getSupabaseAdmin(), Math.min(90, Math.max(1, Number(days) || 60))));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 500 });
  }
}
