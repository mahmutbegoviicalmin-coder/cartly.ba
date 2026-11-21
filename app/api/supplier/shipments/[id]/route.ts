import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, isAdmin, isSupplier } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkAuth(req: NextRequest) {
  return isSupplier(req) || isAdmin() || checkAdminPassword(req.headers.get("x-admin-password"));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, photo_url, notes, items, delivery_cost, placeno } = body;

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (photo_url !== undefined) updates.photo_url = photo_url;
  if (notes !== undefined) updates.notes = notes;
  if (delivery_cost !== undefined) updates.delivery_cost = delivery_cost;
  if (placeno !== undefined) updates.placeno = placeno;

  if (items !== undefined) {
    const total_products = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    updates.total_products = total_products;

    await supabase.from("supplier_shipment_items").delete().eq("shipment_id", params.id);
    if (items.length > 0) {
      await supabase.from("supplier_shipment_items").insert(
        items.map((item: { product_name: string; quantity: number; unit_price: number }) => ({
          shipment_id: params.id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );
    }
  }

  const { error } = await supabase.from("supplier_shipments").update(updates).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("supplier_shipments").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
