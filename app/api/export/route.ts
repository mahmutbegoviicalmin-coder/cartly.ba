import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  fetchOrders, findProduct, buildXExpress, buildSkytec,
} from "@/lib/export-shared";

// GET /api/export?courier=xexpress|skytec&product=<key>|svi&date=YYYY-MM-DD
//
// Generic courier export — replaces the per-product export routes.
// `courier`  → xexpress (X Express) | skytec (Skytec Express)
// `product`  → a product key from PRODUCTS, or "svi" for every product
// `date`     → shipment day, defaults to today
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courier = searchParams.get("courier") ?? "xexpress";
    const product = searchParams.get("product") ?? "svi";
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (courier !== "xexpress" && courier !== "skytec") {
      return NextResponse.json({ error: "Nepoznata pošta (courier)." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Neispravan datum. Koristite YYYY-MM-DD." }, { status: 400 });
    }
    if (product !== "svi" && !findProduct(product)) {
      return NextResponse.json({ error: `Nepoznat proizvod: ${product}` }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const rows = await fetchOrders(sb, product, date);

    if (rows.length === 0) {
      const name = product === "svi" ? "narudžbi" : (findProduct(product)?.label ?? "narudžbi");
      return NextResponse.json({ error: `Nema ${name} za ${date}.` }, { status: 404 });
    }

    const buf = courier === "xexpress" ? buildXExpress(rows) : buildSkytec(rows);

    const courierTag = courier === "xexpress" ? "XExpress" : "Skytec";
    const productTag = product === "svi" ? "Svi" : product;
    const filename = `${courierTag}_${productTag}_${date}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export] Error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
