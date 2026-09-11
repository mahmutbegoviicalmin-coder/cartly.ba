import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { stripIp } from "@/lib/order-ip";
import * as XLSX from "xlsx";
import pttData from "@/data/ptt-bih.json";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const CITY_PROPER_NAME: Record<string, string> = {
  "sarajevo": "Sarajevo", "banja luka": "Banja Luka", "tuzla": "Tuzla",
  "zenica": "Zenica", "mostar": "Mostar", "bijeljina": "Bijeljina",
  "brcko": "Brčko", "brcko distrikt": "Brčko Distrikt", "prijedor": "Prijedor",
  "trebinje": "Trebinje", "doboj": "Doboj", "cazin": "Cazin", "bihac": "Bihać",
  "travnik": "Travnik", "visoko": "Visoko", "kakanj": "Kakanj", "livno": "Livno",
  "gorazde": "Goražde", "zvornik": "Zvornik", "konjic": "Konjic",
  "bugojno": "Bugojno", "gracanica": "Gračanica", "lukavac": "Lukavac",
  "gradacac": "Gradačac", "orasje": "Orašje", "vitez": "Vitez",
  "srebrenica": "Srebrenica", "jajce": "Jajce", "zavidovici": "Zavidovići",
  "maglaj": "Maglaj", "tesanj": "Tešanj", "teslic": "Teslić",
  "derventa": "Derventa", "modrica": "Modriča", "gradiska": "Gradiška",
  "prnjavor": "Prnjavor", "srbac": "Srbac", "laktasi": "Laktaši",
  "mrkonjic grad": "Mrkonjić Grad", "sipovo": "Šipovo", "kljuc": "Ključ",
  "sanski most": "Sanski Most", "novi grad": "Novi Grad",
  "kozarska dubica": "Kozarska Dubica", "ljubuski": "Ljubuški",
  "citluk": "Čitluk", "capljina": "Čapljina", "siroki brijeg": "Široki Brijeg",
  "grude": "Grude", "posusje": "Posušje", "stolac": "Stolac", "neum": "Neum",
  "jablanica": "Jablanica", "prozor": "Prozor", "velika kladusa": "Velika Kladuša",
  "ilidza": "Ilidža", "vogosca": "Vogošća", "hadzici": "Hadžići",
  "ilijas": "Ilijaš", "breza": "Breza", "vares": "Vareš", "olovo": "Olovo",
  "fojnica": "Fojnica", "kresevo": "Kreševo", "kiseljak": "Kiseljak",
  "busovaca": "Busovača", "novi travnik": "Novi Travnik", "turbe": "Turbe",
  "srebrenik": "Srebrenik", "kladanj": "Kladanj", "kalesija": "Kalesija",
  "lopare": "Lopare", "celic": "Čelić", "banovici": "Banovići",
  "zivinice": "Živinice", "tarcin": "Tarčin", "pazaric": "Pazarić",
};

function correctCityName(grad: string): string {
  if (!grad) return "";
  return CITY_PROPER_NAME[normalize(grad)] ?? grad;
}

const CITY_PTT_OVERRIDE: Record<string, string> = {
  "sarajevo": "71000", "banja luka": "78000", "tuzla": "75000",
  "zenica": "72000", "mostar": "88000", "bijeljina": "76300",
  "brcko": "76100", "brcko distrikt": "76100", "prijedor": "79101",
  "trebinje": "89101", "doboj": "74000", "cazin": "77220", "bihac": "77000",
  "travnik": "72270", "visoko": "71300", "kakanj": "72240", "livno": "80101",
  "gorazde": "73000", "zvornik": "75400", "konjic": "88400", "bugojno": "70230",
  "gracanica": "75320", "lukavac": "75300", "gradacac": "76250",
  "orasje": "76270", "vitez": "72250", "srebrenica": "75430", "jajce": "70101",
  "zavidovici": "72220", "maglaj": "74250", "tesanj": "74260", "teslic": "74270",
  "derventa": "74400", "modrica": "74480", "gradiska": "78400",
  "prnjavor": "78430", "srbac": "78420", "laktasi": "78250",
  "mrkonjic grad": "70260", "sipovo": "70270", "kljuc": "79280",
  "sanski most": "79260", "novi grad": "79220", "kozarska dubica": "79240",
  "ljubuski": "88320", "citluk": "88260", "capljina": "88300",
  "siroki brijeg": "88220", "grude": "88340", "posusje": "88240",
  "stolac": "88360", "neum": "88390", "jablanica": "88420", "prozor": "88440",
  "velika kladusa": "77230", "ilidza": "71210", "vogosca": "71320",
  "hadzici": "71240", "ilijas": "71380", "breza": "71370", "vares": "71330",
  "olovo": "71340", "fojnica": "71270", "kresevo": "71260", "kiseljak": "71250",
  "busovaca": "72260", "novi travnik": "72290", "turbe": "72270",
  "srebrenik": "75350", "kladanj": "75280", "kalesija": "75260",
  "lopare": "75240", "celic": "75246", "banovici": "75290",
  "zivinice": "75270", "tarcin": "71244", "pazaric": "71243",
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
  "Ime i prezime", "Ptt broj", "Adresa", "Mesto", "Telefon", "Referenca",
  "Tezina (kg)", "Broj paketa", "Otkupnina (BAM)", "(Ne koristi se)",
  "Napomena za dostavu", "Vrijednost pošiljke (BAM)", "Otezana dostava",
  "Povrat otpremnice", "(Ne koristi se)", "(Ne koristi se)", "Sadržaj pošiljke",
  "Kontakt osoba", "Otvaranje pošiljke", "Obveznik plaćanja", "Način plaćanja",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const dayStart = `${dateParam}T00:00:00.000Z`;
    const dayEnd   = `${dateParam}T23:59:59.999Z`;

    const { data: orders, error } = await getSupabaseAdmin()
      .from("usmjerivac_orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, bundle_label")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: `Nema narudžbi usmjerivača za ${dateParam}.` }, { status: 404 });
    }

    type UsmRow = { ime: string; telefon: string; adresa: string; grad: string; ukupno: number; order_number: string; bundle_label: string };

    const dataRows = (orders as UsmRow[]).map((o) => [
      o.ime ?? "",
      lookupPTT(o.grad ?? ""),
      stripIp(o.adresa ?? ""),
      correctCityName(o.grad ?? ""),
      o.telefon ?? "",
      "",
      1,
      1,
      o.ukupno,
      "",
      "",
      0,
      0,
      0,
      "",
      "",
      `Usmjerivač ${o.bundle_label ?? ""}`.trim(),
      (o.ime ?? "").split(" ")[0],
      0,
      0,
      0,
    ]);

    const sheet1Data = [HEADERS, ...dataRows];
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    ws1["!cols"] = [
      { wch: 28 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 22 },
      { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 36 }, { wch: 22 },
      { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 36 }, { wch: 16 },
      { wch: 18 }, { wch: 18 }, { wch: 16 },
    ];

    const sheet2Data = [
      ["Kolona",      "Povrat otpremnice", "Obveznik plaćanja",                     "Način plaćanja"],
      ["Vrijednosti", "0-NE",              "0-Pošiljalac",                           "0-Gotovinski"],
      ["",            "1-DA",              "1-Primalac (Trenutno nije dozvoljeno)",  "1-Žiralno"],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 42 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Pošiljke");
    XLSX.utils.book_append_sheet(wb, ws2, "Legenda");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Usmjerivaci_Posta_${dateParam}.xlsx"`,
        "Content-Length":      String(buf.length),
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[usmjerivaci export] Error:", err);
    return NextResponse.json({ error: "Greška pri generisanju fajla." }, { status: 500 });
  }
}
