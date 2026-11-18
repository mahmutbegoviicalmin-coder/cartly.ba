import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { runSkytecSync } from "@/lib/skytec-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Manual "Sinhronizuj" button: COD remittances for the last 7 days + status poll. */
export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await runSkytecSync(getSupabaseAdmin(), 7));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 500 });
  }
}
