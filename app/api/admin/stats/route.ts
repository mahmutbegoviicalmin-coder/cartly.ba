import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now            = new Date();
  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const thirtyMinAgo   = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const sb = getSupabaseAdmin();

  // Fetch from all tables in parallel
  const [
    allOrders, todayOrders, recentOrders, chartOrders,
    allCetka,  todayCetka,  recentCetka,  chartCetka,
    allUsm,    todayUsm,    recentUsm,    chartUsm,
  ] = await Promise.all([
    sb.from("orders").select("ukupno, velicine, cijena_proizvoda, ukupno_pari"),
    sb.from("orders").select("ukupno").gte("created_at", todayStart),
    sb.from("orders").select("id").gte("created_at", thirtyMinAgo),
    sb.from("orders").select("created_at, ukupno").gte("created_at", fourteenDaysAgo).order("created_at", { ascending: true }),

    sb.from("cetka_orders").select("ukupno, broj_setova"),
    sb.from("cetka_orders").select("ukupno").gte("created_at", todayStart),
    sb.from("cetka_orders").select("id").gte("created_at", thirtyMinAgo),
    sb.from("cetka_orders").select("created_at, ukupno").gte("created_at", fourteenDaysAgo).order("created_at", { ascending: true }),

    sb.from("usmjerivac_orders").select("ukupno"),
    sb.from("usmjerivac_orders").select("ukupno").gte("created_at", todayStart),
    sb.from("usmjerivac_orders").select("id").gte("created_at", thirtyMinAgo),
    sb.from("usmjerivac_orders").select("created_at, ukupno").gte("created_at", fourteenDaysAgo).order("created_at", { ascending: true }),
  ]);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const allData      = allOrders.data ?? [];
  const allCetkaData = allCetka.data ?? [];
  const allUsmData   = allUsm.data   ?? [];

  const totalCount   = allData.length + allCetkaData.length + allUsmData.length;
  const totalRevenue = [
    ...allData.map((o) => o.ukupno ?? 0),
    ...allCetkaData.map((o) => o.ukupno ?? 0),
    ...allUsmData.map((o) => o.ukupno ?? 0),
  ].reduce((s, v) => s + v, 0);

  const todayData    = [...(todayOrders.data ?? []), ...(todayCetka.data ?? []), ...(todayUsm.data ?? [])];
  const todayRevenue = todayData.reduce((s, o) => s + (o.ukupno ?? 0), 0);
  const todayCount   = todayData.length;

  const avgOrder    = totalCount > 0 ? totalRevenue / totalCount : 0;
  const recentCount = (recentOrders.data?.length ?? 0) + (recentCetka.data?.length ?? 0) + (recentUsm.data?.length ?? 0);
  const usmjerivacCount = allUsmData.length;

  // ── Product breakdown ────────────────────────────────────────────────────────
  let shoeCount = 0, cameraCount = 0;
  for (const o of allData) {
    const vel = o.velicine as { velicina: number | string; kolicina: number }[] | null;
    if (typeof vel?.[0]?.velicina === "string") cameraCount++;
    else shoeCount++;
  }
  const cetkaCount = allCetkaData.length;

  // ── 14-day chart — merge both sources ───────────────────────────────────────
  const chartMap: Record<string, { date: string; narudžbe: number; prihod: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d   = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    chartMap[key] = { date: key, narudžbe: 0, prihod: 0 };
  }
  for (const o of [...(chartOrders.data ?? []), ...(chartCetka.data ?? []), ...(chartUsm.data ?? [])]) {
    const key = (o.created_at as string).slice(0, 10);
    if (chartMap[key]) {
      chartMap[key].narudžbe += 1;
      chartMap[key].prihod   += o.ukupno ?? 0;
    }
  }

  return NextResponse.json({
    totalCount,
    totalRevenue,
    todayRevenue,
    todayCount,
    avgOrder,
    recentCount,
    shoeCount,
    cameraCount,
    cetkaCount,
    usmjerivacCount,
    chartData: Object.values(chartMap),
  });
}
