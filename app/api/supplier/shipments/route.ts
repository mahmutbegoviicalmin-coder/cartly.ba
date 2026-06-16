import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SUPPLIER_PASSWORD = process.env.SUPPLIER_PASSWORD || "adnan2024";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("x-supplier-password");
  const adminAuth = req.headers.get("x-admin-password");
  return auth === SUPPLIER_PASSWORD || adminAuth === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("supplier_shipments")
    .select(`*, supplier_shipment_items(*)`)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, supplier_name, status, notes, items, delivery_cost } = body;

  // Calculate total_products from items
  const total_products = (items || []).reduce(
    (sum: number, item: { quantity: number; unit_price: number }) =>
      sum + item.quantity * item.unit_price,
    0
  );

  const insertData: Record<string, unknown> = {
    date, supplier_name: supplier_name || "Adnan",
    status: status || "pripremljeno", notes, total_products,
  };
  if (delivery_cost !== undefined) insertData.delivery_cost = delivery_cost;

  const { data: shipment, error } = await supabase
    .from("supplier_shipments")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items && items.length > 0) {
    const itemsToInsert = items.map((item: { product_name: string; quantity: number; unit_price: number }) => ({
      shipment_id: shipment.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));
    const { error: itemsError } = await supabase.from("supplier_shipment_items").insert(itemsToInsert);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ id: shipment.id });
}
