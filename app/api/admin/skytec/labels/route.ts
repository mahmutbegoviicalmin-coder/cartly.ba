import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { findProduct } from "@/lib/export-shared";
import { getLabels, SkytecError } from "@/lib/skytec";

export const dynamic = "force-dynamic";

/** GET ?date=YYYY-MM-DD&product=key&format=A4|A410|60MM → PDF with every announced parcel of that day. */
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const date = sp.get("date") ?? "";
  const product = sp.get("product") ?? "svi";
  const fmt = sp.get("format");
  const format = fmt === "A410" || fmt === "60MM" ? fmt : "A4";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });

  try {
    let q = getSupabaseAdmin().from("skytec_shipments")
      .select("sky_sifra, product_prefix")
      .eq("order_date", date)
      .not("sky_sifra", "is", null)
      .neq("state", "otkazana");
    const p = product !== "svi" ? findProduct(product) : undefined;
    if (p?.prefixes) q = q.in("product_prefix", p.prefixes);

    const { data, error } = await q.order("created_at", { ascending: true });
    if (error) throw error;
    const codes = (data ?? []).map((r: { sky_sifra: string }) => r.sky_sifra);
    if (codes.length === 0) {
      return NextResponse.json({ error: "Nema poslanih pošiljki za taj dan." }, { status: 404 });
    }

    const pdf = await getLabels(codes, format);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Skytec_naljepnice_${date}.pdf"`,
      },
    });
  } catch (e) {
    const status = e instanceof SkytecError ? 502 : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status });
  }
}
