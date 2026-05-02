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

// Primary city PTT overrides — takes priority over ptt-bih.json.
// Keys are already normalized (no diacritics, lowercase) for fast lookup.
// Needed because ptt-bih.json has sub-post office codes (e.g. Mostar 88110, 88113…)
// while Skytech Express requires only the main city code.
const CITY_PTT_OVERRIDE: Record<string, string> = {
  "sarajevo": "71000",
  "banja luka": "78000",
  "tuzla": "75000",
  "zenica": "72000",
  "mostar": "88000",
  "bijeljina": "76300",
  "brcko": "76100",
  "brcko distrikt": "76100",
  "prijedor": "79101",
  "trebinje": "89101",
  "doboj": "74000",
  "cazin": "77220",
  "bihac": "77000",
  "travnik": "72270",
  "visoko": "71300",
  "kakanj": "72240",
  "livno": "80101",
  "gorazde": "73000",
  "zvornik": "75400",
  "konjic": "88400",
  "bugojno": "70230",
  "gracanica": "75320",
  "lukavac": "75300",
  "gradacac": "76250",
  "orasje": "76270",
  "vitez": "72250",
  "srebrenica": "75430",
  "jajce": "70101",
  "zavidovici": "72220",
  "maglaj": "74250",
  "tesanj": "74260",
  "teslic": "74270",
  "derventa": "74400",
  "modrica": "74480",
  "gradiska": "78400",
  "prnjavor": "78430",
  "srbac": "78420",
  "laktasi": "78250",
  "mrkonjic grad": "70260",
  "sipovo": "70270",
  "kljuc": "79280",
  "sanski most": "79260",
  "novi grad": "79220",
  "kozarska dubica": "79240",
  "ljubuski": "88320",
  "citluk": "88260",
  "capljina": "88300",
  "siroki brijeg": "88220",
  "grude": "88340",
  "posusje": "88240",
  "stolac": "88360",
  "neum": "88390",
  "jablanica": "88420",
  "prozor": "88440",
  "prozor rama": "88440",
  "velika kladusa": "77230",
  "ilidza": "71210",
  "vogosca": "71320",
  "hadzici": "71240",
  "ilijas": "71380",
  "breza": "71370",
  "vares": "71330",
  "olovo": "71340",
  "fojnica": "71270",
  "kresevo": "71260",
  "kiseljak": "71250",
  "busovaca": "72260",
  "novi travnik": "72290",
  "turbe": "72270",
  "srebrenik": "75350",
  "kladanj": "75280",
  "kalesija": "75260",
  "lopare": "75240",
  "celic": "75246",
  "banovici": "75290",
  "zivinice": "75270",
  "tarcin": "71244",
  "pazaric": "71243",
};

// Build normalized fallback lookup from ptt-bih.json
const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [
    normalize(mjesto),
    ptt,
  ])
);

// Lookup order: CITY_PTT_OVERRIDE → ptt-bih.json → ""
function lookupPTT(grad: string): string {
  if (!grad) return "";
  const key = normalize(grad);
  return CITY_PTT_OVERRIDE[key] ?? PTT_MAP.get(key) ?? "";
}

// ── Product helpers ───────────────────────────────────────────────────────────

type Velicina = { velicina: number | string; kolicina: number };

function orderPrefix(orderNumber: string): string {
  return (orderNumber ?? "").slice(0, 3).toUpperCase();
}

// Total quantity across all sizes (used for Tezina + Broj paketa for patike)
function totalQty(velicine: Velicina[]): number {
  return (velicine ?? []).reduce((sum, v) => sum + (v.kolicina || 0), 0);
}

// Short friendly name for Sadržaj pošiljke (col Q)
function sadrzaj(orderNumber: string, velicine: Velicina[]): string {
  const prefix = orderPrefix(orderNumber);

  if (prefix === "CRT") {
    const active = (velicine ?? []).filter((v) => v.kolicina > 0);
    if (active.length === 0) return "Patike";
    if (active.length === 1 && active[0].kolicina === 1) return `${active[0].velicina}br`;
    return active.map((v) => `${v.velicina}br(${v.kolicina})`).join(" ");
  }

  const MAP: Record<string, string> = {
    DWL: "Bušilica žuta",
    MLW: "Bušilica crvena",
    ZQS: "Zvučnik",
    KMR: "Kamera",
    DWT: "Brusilica",
    BRS: "Brusilica",
  };
  return MAP[prefix] ?? "Paket";
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
      const prefix  = orderPrefix(o.order_number ?? "");
      const velicine: Velicina[] = o.velicine ?? [];
      const qty     = prefix === "CRT" ? Math.max(1, totalQty(velicine)) : 1;
      const kontakt = (o.ime ?? "").split(" ")[0];
      return [
        o.ime ?? "",                   // Ime i prezime
        lookupPTT(o.grad ?? ""),       // Ptt broj
        o.adresa ?? "",                // Adresa
        o.grad ?? "",                  // Mesto
        o.telefon ?? "",               // Telefon
        o.order_number ?? "",          // Referenca
        qty,                           // Tezina (kg) — 1 kg/par for patike
        qty,                           // Broj paketa
        o.ukupno,                      // Otkupnina (BAM)
        "",                            // (Ne koristi se)
        "",                            // Napomena za dostavu — always empty
        o.ukupno,                      // Vrijednost pošiljke (BAM)
        0,                             // Otezana dostava
        0,                             // Povrat otpremnice
        "",                            // (Ne koristi se)
        "",                            // (Ne koristi se)
        sadrzaj(o.order_number ?? "", velicine), // Sadržaj pošiljke
        kontakt,                       // Kontakt osoba
        0,                             // Otvaranje pošiljke
        0,                             // Obveznik plaćanja
        0,                             // Način plaćanja
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
