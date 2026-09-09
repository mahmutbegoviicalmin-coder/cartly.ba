import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("ime, grad, created_at")
      .like("order_number", "MTP-%")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("recent orders:", error.message);
      return NextResponse.json({ orders: [] });
    }

    const orders = (data ?? [])
      .map((row) => {
        const firstName = String(row.ime ?? "").trim().split(/\s+/)[0] ?? "";
        const city = String(row.grad ?? "").trim();
        return {
          firstName,
          city,
          createdAt: String(row.created_at ?? ""),
        };
      })
      .filter((o) => o.firstName.length >= 2 && o.city.length >= 2);

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
