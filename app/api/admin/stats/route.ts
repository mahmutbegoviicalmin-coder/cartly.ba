import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [allOrders, todayOrders, recentOrders, chartOrders] = await Promise.all([
    supabaseAdmin.from("orders").select("ukupno"),
    supabaseAdmin.from("orders").select("ukupno").gte("created_at", todayStart),
    supabaseAdmin.from("orders").select("id").gte("created_at", thirtyMinAgo),
    supabaseAdmin.from("orders").select("created_at, ukupno").gte("created_at", fourteenDaysAgo).order("created_at", { ascending: true }),
  ]);

  const totalCount = allOrders.data?.length ?? 0;
  const totalRevenue = allOrders.data?.reduce((sum, o) => sum + (o.ukupno ?? 0), 0) ?? 0;
  const todayRevenue = todayOrders.data?.reduce((sum, o) => sum + (o.ukupno ?? 0), 0) ?? 0;
  const avgOrder = totalCount > 0 ? totalRevenue / totalCount : 0;
  const recentCount = recentOrders.data?.length ?? 0;

  // Build 14-day chart data
  const chartMap: Record<string, { date: string; narudžbe: number; prihod: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    chartMap[key] = { date: key, narudžbe: 0, prihod: 0 };
  }
  for (const o of chartOrders.data ?? []) {
    const key = (o.created_at as string).slice(0, 10);
    if (chartMap[key]) {
      chartMap[key].narudžbe += 1;
      chartMap[key].prihod += o.ukupno ?? 0;
    }
  }

  return NextResponse.json({
    totalCount,
    totalRevenue,
    todayRevenue,
    avgOrder,
    recentCount,
    chartData: Object.values(chartMap),
  });
}
