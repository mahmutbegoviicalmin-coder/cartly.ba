import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAdsReport } from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

const sarajevoDay = (d = new Date()) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });

/** GET ?from=YYYY-MM-DD → Meta ad spend from that day until today (read-only). */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.META_ADS_TOKEN) return NextResponse.json({ connected: false });
  const today = sarajevoDay();
  const asked = req.nextUrl.searchParams.get("from");
  const from = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) && asked <= today
    ? asked : sarajevoDay(new Date(Date.now() - 6 * 86400_000));
  try {
    const report = await getAdsReport(from, today);
    return NextResponse.json({ connected: true, from, today, ...report });
  } catch (e) {
    return NextResponse.json({ connected: true, error: e instanceof Error ? e.message : "Greška" }, { status: 502 });
  }
}
