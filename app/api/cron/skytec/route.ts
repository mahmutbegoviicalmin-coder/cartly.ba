import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { runSkytecSync } from "@/lib/skytec-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily Vercel cron (see vercel.json). Vercel sends Authorization: Bearer $CRON_SECRET. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SKYTEC_API_KEY) return NextResponse.json({ skipped: "SKYTEC_API_KEY not set" });
  try {
    return NextResponse.json(await runSkytecSync(getSupabaseAdmin(), 3));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
