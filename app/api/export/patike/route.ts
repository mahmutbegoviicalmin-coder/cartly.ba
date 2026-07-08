import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import * as XLSX from "xlsx";
import pttData from "@/data/ptt-bih.json";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const CITY_PTT_OVERRIDE: Record<string, string> = {
  "sarajevo": "71000", "banja luka": "78000", "tuzla": "75000",
  "zenica": "72000", "mostar": "88000", "bijeljina": "76300",
  "brcko": "76100", "prijedor": "79101", "trebinje": "89101",
  "doboj": "74000", "cazin": "77220", "bihac": "77000",
  "travnik": "72270", "visoko": "71300", "kakanj": "72240",
  "livno": "80101", "gorazde": "73000", "zvornik": "75400",
  "konjic": "88400", "lukavac": "75300", "ilidza": "71210",
  "vogosca": "71320", "hadzici": "71240", "ljubuski": "88320",
  "capljina": "88300", "siroki brijeg": "88220", "sanski most": "79260",
  "derventa": "74400", "gradacac": "76250", "srebrenik": "75350",
  "zivinice": "75270", "kalesija": "75260", "gradiska": "78400",
  "prnjavor": "78430", "laktasi": "78250", "modrica": "74480",
  "bugojno": "70230", "vitez": "72250", "novi travnik": "72290",
  "zavidovici": "72220", "maglaj": "74250", "tesanj": "74260",
  "cajnice": "73260", "foca": "73300", "kljuc": "79280",
  "samac": "76230", "orasje": "76270", "brcko distrikt": "76100",
  "kresevo": "71260", "kiseljak": "71250", "busovaca": "72260",
  "velika kladusa": "77230", "gracanica": "75320",
};

const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [normalize(mjesto), ptt])
);

function lookupPTT(grad: string): string {
  if (!grad) return "";
  const key = normalize(grad);
  return CITY_PTT_OVERRIDE[key] ?? PTT_MAP.get(key) ?? "";
}

const HEADERS = [
  "Ime i prezime", "Ptt broj", "Adresa", "Mesto", "Telefon",
  "Referenca", "Tezina (kg)", "Broj paketa", "Otkupnina (BAM)",
  "(Ne koristi se)", "Napomena za dostavu", "Vrijednost pošiljke (BAM)",
  "Otezana dostava", "Povrat otpremnice", "(Ne koristi se)", "(Ne koristi se)",
  "Sadržaj pošiljke", "Kontakt osoba", "Otvaranje pošiljke",
  "Obveznik plaćanja", "Način plaćanja",
];

type Velicina = { velicina: number | string; kolicina: number };

function opisPatike(velicine: Velicina[]): string {
  const active = (velicine ?? []).filter((v) => v.kolicina > 0);
  if (active.length === 1 && active[0].kolicina === 1) return `Radne Patike S3 EU${active[0].velicina}`;
  return active.map((v) => `EU${v.velicina}×${v.kolicina}`).join(", ");
}

function totalQty(velicine: Velicina[]): number {
  return Math.max(1, (velicine ?? []).reduce((s, v) => s + (v.kolicina || 0), 0));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const from = `${dateParam}T00:00:00.000Z`;
    const to   = `${dateParam}T23:59:59.999Z`;

    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, velicine, created_at")
      .like("order_number", "CRT%")
      .gte("created_at", from)
      .lte("created_at", to)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Nema patika narudžbi za ${dateParam}.` }, { status: 404 });
    }

    const dataRows = data.map((o) => {
      const velicine: Velicina[] = (o.velicine as Velicina[]) ?? [];
      const qty     = totalQty(velicine);
      const sadrzaj = opisPatike(velicine);
      const kontakt = (o.ime ?? "").split(" ")[0];
      const ptt     = lookupPTT(o.grad ?? "");

      return [
        o.ime ?? "",           // Ime i prezime
        ptt,                   // Ptt broj
        o.adresa ?? "",        // Adresa
        o.grad ?? "",          // Mesto
        o.telefon ?? "",       // Telefon
        o.order_number ?? "",  // Referenca
        qty,                   // Tezina (kg)
        qty,                   // Broj paketa
        o.ukupno ?? 0,         // Otkupnina (BAM)
        null,                  // (Ne koristi se)
        sadrzaj,               // Napomena za dostavu
        0,                     // Vrijednost pošiljke (BAM)
        0,                     // Otezana dostava
        0,                     // Povrat otpremnice
        null,                  // (Ne koristi se)
        null,                  // (Ne koristi se)
        sadrzaj,               // Sadržaj pošiljke
        kontakt,               // Kontakt osoba
        0,                     // Otvaranje pošiljke
        0,                     // Obveznik plaćanja
        0,                     // Način plaćanja (gotovinski)
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
    ws["!cols"] = [
      { wch: 28 }, { wch: 10 }, { wch: 32 }, { wch: 18 },
      { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
      { wch: 16 }, { wch: 12 }, { wch: 28 }, { wch: 20 },
      { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 },
      { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Patike_${dateParam}.xlsx"`,
        "Content-Length": String(buf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[patike export] Error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
