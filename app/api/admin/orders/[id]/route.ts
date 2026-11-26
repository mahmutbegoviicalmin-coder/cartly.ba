import { isAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { readIp, stampIp } from "@/lib/order-ip";

const isAuthenticated = isAdmin;

/** Resolve which table to use based on ID prefix. */
function resolveTable(id: string): { table: "orders" | "cetka_orders" | "usmjerivac_orders" | "komarnik_orders" | "lezaljka_orders"; realId: string } {
  if (id.startsWith("cetka_")) return { table: "cetka_orders",      realId: id.replace("cetka_", "") };
  if (id.startsWith("usm_"))   return { table: "usmjerivac_orders", realId: id.replace("usm_", "") };
  if (id.startsWith("komr_"))  return { table: "komarnik_orders",   realId: id.replace("komr_", "") };
  if (id.startsWith("lez_"))   return { table: "lezaljka_orders",   realId: id.replace("lez_", "") };
  return { table: "orders", realId: id };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { table, realId } = resolveTable(params.id);
  const sb = getSupabaseAdmin();

  // Edit the customer's details (typo in the city, wrong phone…), status untouched.
  if (body.fields && typeof body.fields === "object") {
    const clip = (v: unknown, n = 200) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : undefined);
    const ime = clip(body.fields.ime, 120), telefon = clip(body.fields.telefon, 60);
    const adresa = clip(body.fields.adresa), grad = clip(body.fields.grad, 80);
    if ([ime, telefon, adresa, grad].some((v) => v !== undefined && v.length < 2)) {
      return NextResponse.json({ error: "Polja ne mogu biti prazna." }, { status: 400 });
    }
    const update: Record<string, string> = {};
    if (ime !== undefined) update.ime = ime;
    if (telefon !== undefined) update.telefon = telefon;
    if (grad !== undefined) update.grad = grad;
    if (adresa !== undefined) {
      // Keep the IP stamp stored at the end of the address.
      const { data: cur } = await sb.from(table).select("adresa").eq("id", realId).single();
      update.adresa = stampIp(adresa, readIp(cur?.adresa));
    }
    const { error } = await sb.from(table).update(update).eq("id", realId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { status } = body;
  const validStatuses = ["nova", "poslana", "isporučena", "vraćena"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await sb
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
