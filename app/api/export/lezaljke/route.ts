import { NextResponse } from "next/server";
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
};

const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [normalize(mjesto), ptt])
);

function lookupPTT(grad: string): string {
  if (!grad) return "";
  const key = normalize(grad);
  return CITY_PTT_OVERRIDE[key] ?? PTT_MAP.get(key) ?? "";
}

const CITY_PROPER: Record<string, string> = {
  "sarajevo": "Sarajevo", "banja luka": "Banja Luka", "tuzla": "Tuzla",
  "zenica": "Zenica", "mostar": "Mostar", "bijeljina": "Bijeljina",
  "brcko": "Brčko", "ilidza": "Ilidža", "lukavac": "Lukavac",
};
function correctCity(grad: string): string {
  return CITY_PROPER[normalize(grad)] ?? grad;
}

const COLOR_LABELS: Record<string, string> = {
  "maslinasto-siva": "Tamno maslinasto siva", "siva": "Siva", "tamno-zelena": "Tamno Zelena", "bordo": "Bordo", "crna": "Crna",
};

const HEADERS = [
  "Naziv primaoca*", "Ulica/Adresa*", "Poštanski broj*", "Mjesto/Grad*",
  "Kontakt osoba*", "Telefon*", "Broj računa/eksterna šifra", "Vrsta pošiljke*",
  "Masa pošiljke*", "Broj paketa*", "Vrijednost*", "Opis pošiljke*",
  "Hitna pošiljka do (h)", "Otkupnina iznos", "Povratnica (da/ne)",
  "Osiguranje (da/ne)", "Dozvoljeno otvaranje (da/ne)", "Dostava vikendom (da/ne)",
  "Zamjenska pošiljka (da/ne)", "Povrat ambalaže (da/ne)", "", "",
];

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await getSupabaseAdmin()
      .from("lezaljka_orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, boja, kolicina, created_at")
      .neq("status", "cancelled")
      .gte("created_at", since)
      .order("ime", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Nema lezaljka narudžbi u zadnjih 24h." }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const dataRows = data.map((o, i) => {
      const boja = COLOR_LABELS[o.boja] ?? o.boja;
      const opis = `Ležaljka ${boja} x${o.kolicina}`;
      const kontakt = (o.ime ?? "").split(" ")[0];
      const sifra = o.order_number || `LEZ-${today}-${String(i + 1).padStart(4, "0")}`;
      return [
        o.ime ?? "",
        o.adresa ?? "",
        lookupPTT(o.grad ?? ""),
        correctCity(o.grad ?? ""),
        kontakt,
        o.telefon ?? "",
        sifra,
        "PAKET",
        o.kolicina ?? 1,
        o.kolicina ?? 1,
        0,
        opis,
        "",
        o.ukupno ?? 0,
        "ne", "ne", "ne", "ne", "ne", "ne", "", "PAKET",
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
    ws["!cols"] = [
      { wch: 28 }, { wch: 30 }, { wch: 14 }, { wch: 18 },
      { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 28 },
      { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
      { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
      { wch: 6  }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Lezaljke_XExpress_${date}.xlsx"`,
        "Content-Length": String(buf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[lezaljke export] Error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
