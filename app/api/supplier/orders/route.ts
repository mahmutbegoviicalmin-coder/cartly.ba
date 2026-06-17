import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SUPPLIER_PASSWORD = process.env.SUPPLIER_PASSWORD || "adnan2024";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-supplier-password");
  if (auth !== SUPPLIER_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  // Sarajevo is UTC+2 — shift range by -2h so "today local" maps correctly
  const dayStart = `${date}T00:00:00+02:00`;
  const dayEnd   = `${date}T23:59:59+02:00`;

  const PRODUCT_NAMES: Record<string, string> = {
    DWL: "DeWalt Bušilica", DWT: "DeWalt Bušilica",
    MLW: "Milwaukee Bušilica", BRS: "Milwaukee Brusilica",
    ZQS: "Zvučnik", KMR: "Kamera",
    MSS: "Mašina za šišanje",
  };

  const [resOrders, resCetka, resUsm, resKomr] = await Promise.all([
    supabase.from("orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, created_at, status")
      .gte("created_at", dayStart).lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
    supabase.from("cetka_orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, created_at, status")
      .gte("created_at", dayStart).lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
    supabase.from("usmjerivac_orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, bundle_label, created_at, status")
      .gte("created_at", dayStart).lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
    supabase.from("komarnik_orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, bundle_label, created_at, status")
      .gte("created_at", dayStart).lte("created_at", dayEnd)
      .order("created_at", { ascending: true }),
  ]);

  const toolOrders = (resOrders.data ?? [])
    .filter((o: Record<string, unknown>) => {
      const prefix = ((o.order_number as string) ?? "").slice(0, 3).toUpperCase();
      return prefix !== "CRT" && prefix !== ""; // exclude patike
    })
    .map((o: Record<string, unknown>) => ({
      ime: o.ime, telefon: o.telefon, adresa: o.adresa, grad: o.grad,
      ukupno: o.ukupno, order_number: o.order_number, created_at: o.created_at, status: o.status,
      proizvod: PRODUCT_NAMES[((o.order_number as string) ?? "").slice(0, 3).toUpperCase()] ?? "Proizvod",
    }));

  const orders = [
    ...toolOrders,
    ...(resCetka.data ?? []).map((o: Record<string, unknown>) => ({
      ime: o.ime, telefon: o.telefon, adresa: o.adresa, grad: o.grad,
      ukupno: o.ukupno, order_number: o.order_number, created_at: o.created_at, status: o.status,
      proizvod: "Čelična Četka",
    })),
    ...(resUsm.data ?? []).map((o: Record<string, unknown>) => ({
      ime: o.ime, telefon: o.telefon, adresa: o.adresa, grad: o.grad,
      ukupno: o.ukupno, order_number: o.order_number, created_at: o.created_at, status: o.status,
      proizvod: `Usmjerivač ${o.bundle_label ?? ""}`,
    })),
    ...(resKomr.data ?? []).map((o: Record<string, unknown>) => ({
      ime: o.ime, telefon: o.telefon, adresa: o.adresa, grad: o.grad,
      ukupno: o.ukupno, order_number: o.order_number, created_at: o.created_at, status: o.status,
      proizvod: `Komarnik ${o.bundle_label ?? ""}`,
    })),
  ].sort((a, b) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime());

  return NextResponse.json(orders);
}
