import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import * as XLSX from "xlsx";
import pttData from "@/data/ptt-bih.json";

// ── PTT lookup (same as Pošta export) ─────────────────────────────────────────
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const CITY_PTT_OVERRIDE: Record<string, string> = {
  "sarajevo": "71000", "banja luka": "78000", "tuzla": "75000",
  "zenica": "72000", "mostar": "88000", "bijeljina": "76300",
  "brcko": "76100", "brcko distrikt": "76100", "prijedor": "79101",
  "trebinje": "89101", "doboj": "74000", "cazin": "77220",
  "bihac": "77000", "travnik": "72270", "visoko": "71300",
  "kakanj": "72240", "livno": "80101", "gorazde": "73000",
  "zvornik": "75400", "konjic": "88400", "bugojno": "70230",
  "gracanica": "75320", "lukavac": "75300", "gradacac": "76250",
  "orasje": "76270", "vitez": "72250", "srebrenica": "75430",
  "jajce": "70101", "zavidovici": "72220", "maglaj": "74250",
  "tesanj": "74260", "teslic": "74270", "derventa": "74400",
  "modrica": "74480", "gradiska": "78400", "prnjavor": "78430",
  "srbac": "78420", "laktasi": "78250", "ljubuski": "88320",
  "citluk": "88260", "capljina": "88300", "siroki brijeg": "88220",
  "grude": "88340", "posusje": "88240", "stolac": "88360",
  "neum": "88390", "jablanica": "88420", "prozor": "88440",
  "velika kladusa": "77230", "ilidza": "71210", "vogosca": "71320",
  "hadzici": "71240", "ilijas": "71380", "breza": "71370",
  "vares": "71330", "olovo": "71340", "fojnica": "71270",
  "kresevo": "71260", "kiseljak": "71250", "busovaca": "72260",
  "novi travnik": "72290", "srebrenik": "75350", "kladanj": "75280",
  "kalesija": "75260", "zivinice": "75270",
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
  "brcko": "Brčko", "prijedor": "Prijedor", "trebinje": "Trebinje",
  "doboj": "Doboj", "cazin": "Cazin", "bihac": "Bihać",
  "travnik": "Travnik", "visoko": "Visoko", "kakanj": "Kakanj",
  "livno": "Livno", "gorazde": "Goražde", "zvornik": "Zvornik",
  "konjic": "Konjic", "bugojno": "Bugojno", "lukavac": "Lukavac",
  "ilidza": "Ilidža", "vogosca": "Vogošća", "hadzici": "Hadžići",
  "ljubuski": "Ljubuški", "capljina": "Čapljina", "siroki brijeg": "Široki Brijeg",
  "velika kladusa": "Velika Kladuša", "zivinice": "Živinice",
};
function correctCity(grad: string): string {
  return CITY_PROPER[normalize(grad)] ?? grad;
}

// ── Product description ────────────────────────────────────────────────────────
type Velicina = { velicina: number | string; kolicina: number };

function opisPosiljke(orderNumber: string, velicine: Velicina[]): string {
  const prefix = (orderNumber ?? "").slice(0, 3).toUpperCase();
  const MAP: Record<string, string> = {
    DWL: "Bušilica žuta", MLW: "Bušilica crvena", ZQS: "Zvučnik",
    KMR: "Kamera", DWT: "Brusilica", BRS: "Brusilica",
    CCT: "Čelična Četka 1+1", KMN: "Komarnik", USM: "Usmjerivač",
    CRT: "Radne Patike S3",
  };
  if (prefix === "CRT") {
    const active = (velicine ?? []).filter((v) => v.kolicina > 0);
    if (active.length === 1 && active[0].kolicina === 1) return `Patike EU${active[0].velicina}`;
    return active.map((v) => `EU${v.velicina}×${v.kolicina}`).join(" ");
  }
  return MAP[prefix] ?? "Paket";
}

function totalQty(velicine: Velicina[]): number {
  return (velicine ?? []).reduce((sum, v) => sum + (v.kolicina || 0), 0);
}

// ── Route ──────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const dayStart = `${dateParam}T00:00:00.000Z`;
    const dayEnd   = `${dateParam}T23:59:59.999Z`;

    const sb = getSupabaseAdmin();
    const [
      { data: rawOrders },
      { data: rawCetka  },
      { data: rawKomr   },
      { data: rawUsm    },
    ] = await Promise.all([
      sb.from("orders").select("ime, telefon, adresa, grad, ukupno, order_number, velicine")
        .gte("created_at", dayStart).lte("created_at", dayEnd)
        .neq("status", "cancelled").order("created_at", { ascending: true }),
      sb.from("cetka_orders").select("ime, telefon, adresa, grad, ukupno, order_number, broj_setova")
        .gte("created_at", dayStart).lte("created_at", dayEnd)
        .neq("status", "cancelled").order("created_at", { ascending: true }),
      sb.from("komarnik_orders").select("ime, telefon, adresa, grad, ukupno, order_number, bundle_label")
        .gte("created_at", dayStart).lte("created_at", dayEnd)
        .neq("status", "cancelled").order("created_at", { ascending: true }),
      sb.from("usmjerivac_orders").select("ime, telefon, adresa, grad, ukupno, order_number, bundle_label")
        .gte("created_at", dayStart).lte("created_at", dayEnd)
        .neq("status", "cancelled").order("created_at", { ascending: true }),
    ]);

    const normCetka = ((rawCetka ?? []) as {
      ime: string; telefon: string; adresa: string; grad: string;
      ukupno: number; order_number: string; broj_setova: number;
    }[]).map((o) => ({
      ...o,
      velicine: [{ velicina: "Čelična Četka 1+1 GRATIS", kolicina: o.broj_setova }] as Velicina[],
    }));

    const normKomr = ((rawKomr ?? []) as {
      ime: string; telefon: string; adresa: string; grad: string;
      ukupno: number; order_number: string; bundle_label: string;
    }[]).map((o) => ({
      ...o,
      velicine: [{ velicina: `Komarnik ${o.bundle_label}`, kolicina: 1 }] as Velicina[],
    }));

    const normUsm = ((rawUsm ?? []) as {
      ime: string; telefon: string; adresa: string; grad: string;
      ukupno: number; order_number: string; bundle_label: string;
    }[]).map((o) => ({
      ...o,
      velicine: [{ velicina: `Usmjerivač ${o.bundle_label}`, kolicina: 1 }] as Velicina[],
    }));

    const orders = [...(rawOrders ?? []), ...normCetka, ...normKomr, ...normUsm];

    if (orders.length === 0) {
      return NextResponse.json({ error: `Nema narudžbi za ${dateParam}.` }, { status: 404 });
    }

    // ── Headers (exact match to primer.xlsx) ──────────────────────────────────
    const HEADERS = [
      "Naziv primaoca*",
      "Ulica/Adresa*",
      "Poštanski broj*",
      "Mjesto/Grad*",
      "Kontakt osoba*",
      "Telefon*",
      "Broj računa/eksterna šifra",
      "Vrsta pošiljke*",
      "Masa pošiljke*",
      "Broj paketa*",
      "Vrijednost*",
      "Opis pošiljke*",
      "Hitna pošiljka do (h)",
      "Otkupnina iznos",
      "Povratnica (da/ne)",
      "Osiguranje (da/ne)",
      "Dozvoljeno otvaranje (da/ne)",
      "Dostava vikendom (da/ne)",
      "Zamjenska pošiljka (da/ne)",
      "Povrat ambalaže (da/ne)",
      "",
      "",
    ];

    const dataRows = orders.map((o) => {
      const velicine: Velicina[] = (o as { velicine?: Velicina[] }).velicine ?? [];
      const prefix = ((o as { order_number?: string }).order_number ?? "").slice(0, 3).toUpperCase();
      const qty    = prefix === "CRT" ? Math.max(1, totalQty(velicine)) : 1;
      const kontakt = ((o as { ime: string }).ime ?? "").split(" ")[0];

      return [
        (o as { ime: string }).ime ?? "",                              // Naziv primaoca
        (o as { adresa: string }).adresa ?? "",                        // Ulica/Adresa
        lookupPTT((o as { grad: string }).grad ?? ""),                 // Poštanski broj
        correctCity((o as { grad: string }).grad ?? ""),               // Mjesto/Grad
        kontakt,                                                       // Kontakt osoba
        (o as { telefon: string }).telefon ?? "",                      // Telefon
        (o as { order_number?: string }).order_number ?? "",           // Broj računa / sifraExt — obavezno polje
        "PAKET",                                                       // Vrsta pošiljke
        qty,                                                           // Masa pošiljke (kg)
        qty,                                                           // Broj paketa
        0,                                                             // Vrijednost
        opisPosiljke((o as { order_number?: string }).order_number ?? "", velicine), // Opis
        "",                                                            // Hitna pošiljka
        (o as { ukupno: number }).ukupno,                              // Otkupnina iznos (COD)
        "ne",                                                          // Povratnica
        "ne",                                                          // Osiguranje
        "ne",                                                          // Dozvoljeno otvaranje
        "ne",                                                          // Dostava vikendom
        "ne",                                                          // Zamjenska pošiljka
        "ne",                                                          // Povrat ambalaže
        "",
        "PAKET",
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

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="XExpress_${dateParam}.xlsx"`,
        "Content-Length":      String(buf.length),
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[xexpress export] Error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
