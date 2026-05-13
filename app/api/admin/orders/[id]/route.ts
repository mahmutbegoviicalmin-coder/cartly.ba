import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

/** Cetka order IDs are prefixed with "cetka_" to identify the correct table. */
function resolveTable(id: string): { table: "orders" | "cetka_orders"; realId: string } {
  if (id.startsWith("cetka_")) {
    return { table: "cetka_orders", realId: id.replace("cetka_", "") };
  }
  return { table: "orders", realId: id };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await request.json();
  const validStatuses = ["nova", "potvrđena", "poslana", "isporučena"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { table, realId } = resolveTable(params.id);

  const { error } = await getSupabaseAdmin()
    .from(table)
    .update({ status })
    .eq("id", realId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table, realId } = resolveTable(params.id);

  const { error } = await getSupabaseAdmin()
    .from(table)
    .delete()
    .eq("id", realId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
