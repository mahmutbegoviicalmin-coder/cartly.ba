import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = getSupabaseAdmin()
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (search) {
    query = query.or(`ime.ilike.%${search}%,telefon.ilike.%${search}%,grad.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data, total: count ?? 0, page, pageSize });
}
