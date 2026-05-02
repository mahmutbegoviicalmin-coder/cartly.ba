import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import * as XLSX from "xlsx";
import pttData from "@/data/ptt-bih.json";

// ── PTT Lookup ────────────────────────────────────────────────────────────────

// Strip diacritics and lowercase — enables accent-insensitive matching
// "Ljubuski" === "Ljubuški", "Brcko" === "Brčko", etc.
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Build normalized lookup map
const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [
    normalize(mjesto),
    ptt,
  ])
);

// Brčko Distrikt aliases → 76100 (all normalize to "brcko" or "brcko distrikt")
for (const alias of ["Brčko distrikt", "Brcko distrikt", "Brčko Distrikt", "Brcko", "Brčko"]) {
  PTT_MAP.set(normalize(alias), "76100");
}

function lookupPTT(grad: string): string {
  if (!grad) return "";
  return PTT_MAP.get(normalize(grad)) ?? "";
}

// ── Product content ───────────────────────────────────────────────────────────

type Velicina = { velicina: number | string; kolicina: number };

// Returns the human-readable content string for Napomena/Sadržaj columns
function productContent(orderNumber: string, velicine: Velicina[]): string {
  const prefix = (orderNumber ?? "").slice(0, 3).toUpperCase();

  if (prefix === "CRT") {
    // Patike: list sizes with quantities, e.g. "Radne Patike S3 - vel. 42(1), 43(2)"
    const sizes = (velicine ?? [])
      .filter((v) => v.kolicina > 0)
      .map((v) => `${v.velicina}(${v.kolicina})`)
      .join(", ");
    return sizes ? `Radne Patike S3 - vel. ${sizes}` : "Radne Patike S3";
  }

  const MAP: Record<string, string> = {
    DWL: "Kamera V380 Pro",
    KMR: "Kamera V380 Pro",
    MLW: "Milwaukee Bušilica M18",
    ZQS: "Bluetooth Zvučnik",
    DWT: "DeWalt Brusilica",
    BRS: "Brusilica",
  };
  return MAP[prefix] ?? "Proizvod";
}

export async function GET(request: NextRequest) {
  try {
    // ── Date param ────────────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const dayStart = `${dateParam}T00:00:00.000Z`;
    const dayEnd   = `${dateParam}T23:59:59.999Z`;

    // ── Fetch orders ──────────────────────────────────────────────────────────
    const { data: orders, error } = await getSupabaseAdmin()
      .from("orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, velicine")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[posta export] Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: `Nema narudžbi za ${dateParam}.` }, { status: 404 });
    }

    // ── Sheet 1 — Pošiljke ────────────────────────────────────────────────────
    const HEADERS = [
      "Ime i prezime",
      "Ptt broj",
      "Adresa",
      "Mesto",
      "Telefon",
      "Referenca",
      "Tezina (kg)",
      "Broj paketa",
      "Otkupnina (BAM)",
      "(Ne koristi se)",
      "Napomena za dostavu",
      "Vrijednost pošiljke (BAM)",
      "Otezana dostava",
      "Povrat otpremnice",
      "(Ne koristi se)",
      "(Ne koristi se)",
      "Sadržaj pošiljke",
      "Kontakt osoba",
      "Otvaranje pošiljke",
      "Obveznik plaćanja",
      "Način plaćanja",
    ];

    const dataRows = orders.map((o) => {
      const content = productContent(o.order_number ?? "", o.velicine ?? []);
      const kontakt = (o.ime ?? "").split(" ")[0];
      return [
        o.ime ?? "",                   // Ime i prezime
        lookupPTT(o.grad ?? ""),       // Ptt broj
        o.adresa ?? "",                // Adresa
        o.grad ?? "",                  // Mesto
        o.telefon ?? "",               // Telefon
        o.order_number ?? "",          // Referenca
        1,                             // Tezina (kg)
        1,                             // Broj paketa
        o.ukupno,                      // Otkupnina (BAM)
        "",                            // (Ne koristi se)
        content,                       // Napomena za dostavu
        o.ukupno,                      // Vrijednost pošiljke (BAM)
        0,                             // Otezana dostava
        0,                             // Povrat otpremnice
        "",                            // (Ne koristi se)
        "",                            // (Ne koristi se)
        content,                       // Sadržaj pošiljke
        kontakt,                       // Kontakt osoba
        0,                             // Otvaranje pošiljke
        0,                             // Obveznik plaćanja
        1,                             // Način plaćanja
      ];
    });

    const sheet1Data = [HEADERS, ...dataRows];
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

    ws1["!cols"] = [
      { wch: 28 }, // Ime i prezime
      { wch: 12 }, // Ptt broj
      { wch: 30 }, // Adresa
      { wch: 18 }, // Mesto
      { wch: 16 }, // Telefon
      { wch: 22 }, // Referenca
      { wch: 12 }, // Tezina
      { wch: 12 }, // Broj paketa
      { wch: 16 }, // Otkupnina
      { wch: 14 }, // Ne koristi se
      { wch: 36 }, // Napomena (wider for size strings)
      { wch: 22 }, // Vrijednost
      { wch: 16 }, // Otezana dostava
      { wch: 18 }, // Povrat otpremnice
      { wch: 14 }, // Ne koristi se
      { wch: 14 }, // Ne koristi se
      { wch: 36 }, // Sadržaj (wider for size strings)
      { wch: 16 }, // Kontakt osoba
      { wch: 18 }, // Otvaranje
      { wch: 18 }, // Obveznik
      { wch: 16 }, // Način plaćanja
    ];

    // ── Sheet 2 — Legenda ─────────────────────────────────────────────────────
    const sheet2Data = [
      ["Kolona",      "Povrat otpremnice",  "Obveznik plaćanja",                      "Način plaćanja"],
      ["Vrijednosti", "0-NE",               "0-Pošiljalac",                            "0-Gotovinski"],
      ["",            "1-DA",               "1-Primalac (Trenutno nije dozvoljeno)",   "1-Žiralno"],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 42 }, { wch: 18 }];

    // ── Workbook ──────────────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Pošiljke");
    XLSX.utils.book_append_sheet(wb, ws2, "Legenda");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Posiljke_${dateParam}.xlsx"`,
        "Content-Length":      String(buf.length),
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[posta export] Unexpected error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
