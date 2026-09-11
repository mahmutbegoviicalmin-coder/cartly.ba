import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { stripIp } from "@/lib/order-ip";
import * as XLSX from "xlsx";
import pttData from "@/data/ptt-bih.json";

export const dynamic = "force-dynamic";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const CITY_PROPER_NAME: Record<string, string> = {
  sarajevo: "Sarajevo", "banja luka": "Banja Luka", tuzla: "Tuzla",
  zenica: "Zenica", mostar: "Mostar", bijeljina: "Bijeljina",
  brcko: "Brčko", "brcko distrikt": "Brčko Distrikt", prijedor: "Prijedor",
  trebinje: "Trebinje", doboj: "Doboj", cazin: "Cazin", bihac: "Bihać",
  travnik: "Travnik", visoko: "Visoko", kakanj: "Kakanj", livno: "Livno",
  gorazde: "Goražde", zvornik: "Zvornik", konjic: "Konjic",
  bugojno: "Bugojno", gracanica: "Gračanica", lukavac: "Lukavac",
  gradacac: "Gradačac", orasje: "Orašje", vitez: "Vitez",
  "mrkonjic grad": "Mrkonjić Grad", "sanski most": "Sanski Most",
  ljubuski: "Ljubuški", capljina: "Čapljina", "siroki brijeg": "Široki Brijeg",
  "velika kladusa": "Velika Kladuša", ilidza: "Ilidža", vogosca: "Vogošća",
  hadzici: "Hadžići", zivinice: "Živinice", "novi travnik": "Novi Travnik",
};

const CITY_PTT_OVERRIDE: Record<string, string> = {
  sarajevo: "71000", "banja luka": "78000", tuzla: "75000",
  zenica: "72000", mostar: "88000", bijeljina: "76300",
  brcko: "76100", "brcko distrikt": "76100", prijedor: "79101",
  trebinje: "89101", doboj: "74000", cazin: "77220", bihac: "77000",
  travnik: "72270", visoko: "71300", kakanj: "72240", livno: "80101",
  gorazde: "73000", zvornik: "75400", konjic: "88400", bugojno: "70230",
  gracanica: "75320", lukavac: "75300", gradacac: "76250",
  orasje: "76270", vitez: "72250", "mrkonjic grad": "70260",
  "sanski most": "79260", ljubuski: "88320", capljina: "88300",
  "siroki brijeg": "88220", "velika kladusa": "77230", ilidza: "71210",
  vogosca: "71320", hadzici: "71240", zivinice: "75270",
  "novi travnik": "72290", tesanj: "74260", maglaj: "74250",
  zavidovici: "72220", derventa: "74400", modrica: "74480",
  gradiska: "78400", prnjavor: "78430", laktasi: "78250",
};

const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [
    normalize(mjesto),
    ptt,
  ])
);

function lookupPTT(grad: string): string {
  if (!grad) return "";
  const key = normalize(grad);
  return CITY_PTT_OVERRIDE[key] ?? PTT_MAP.get(key) ?? "";
}

function correctCityName(grad: string): string {
  if (!grad) return "";
  return CITY_PROPER_NAME[normalize(grad)] ?? grad;
}

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

type Velicina = { velicina: number | string; kolicina: number };

function totalQty(velicine: Velicina[]): number {
  return Math.max(1, (velicine ?? []).reduce((s, v) => s + (v.kolicina || 0), 0));
}

function opisHammer(velicine: Velicina[]): string {
  const active = (velicine ?? []).filter((v) => v.kolicina > 0);
  if (active.length === 0) return "Hammer S3 Patike";
  if (active.length === 1 && active[0].kolicina === 1) {
    const raw = String(active[0].velicina);
    const m = raw.match(/(\d{2})/);
    return m ? `Hammer S3 EU${m[1]}` : "Hammer S3 Patike";
  }
  return active
    .map((v) => {
      const m = String(v.velicina).match(/(\d{2})/);
      return m ? `EU${m[1]}×${v.kolicina}` : `${v.velicina}×${v.kolicina}`;
    })
    .join(" ");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const dayStart = `${dateParam}T00:00:00.000Z`;
    const dayEnd = `${dateParam}T23:59:59.999Z`;

    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("ime, telefon, adresa, grad, ukupno, order_number, velicine, created_at")
      .like("order_number", "HMR%")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[hammer-skytec export] Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `Nema Hammer narudžbi za ${dateParam}.` },
        { status: 404 }
      );
    }

    const dataRows = data.map((o) => {
      const velicine: Velicina[] = (o.velicine as Velicina[]) ?? [];
      const qty = totalQty(velicine);
      const sadrzaj = opisHammer(velicine);
      const kontakt = (o.ime ?? "").split(" ")[0];

      return [
        o.ime ?? "",
        lookupPTT(o.grad ?? ""),
        stripIp(o.adresa ?? ""),
        correctCityName(o.grad ?? ""),
        o.telefon ?? "",
        "",
        qty,
        qty,
        o.ukupno ?? 0,
        "",
        "",
        o.ukupno ?? 0,
        0,
        0,
        "",
        "",
        sadrzaj,
        kontakt,
        0,
        0,
        0,
      ];
    });

    const ws1 = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
    ws1["!cols"] = [
      { wch: 28 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 24 }, { wch: 22 },
      { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 16 },
      { wch: 18 }, { wch: 18 }, { wch: 16 },
    ];

    const sheet2Data = [
      ["Kolona", "Povrat otpremnice", "Obveznik plaćanja", "Način plaćanja"],
      ["Vrijednosti", "0-NE", "0-Pošiljalac", "0-Gotovinski"],
      ["", "1-DA", "1-Primalac (Trenutno nije dozvoljeno)", "1-Žiralno"],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 42 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Sheet1");
    XLSX.utils.book_append_sheet(wb, ws2, "Sheet2");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Hammer_Skytec_${dateParam}.xlsx"`,
        "Content-Length": String(buf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[hammer-skytec export] Error:", err);
    return NextResponse.json(
      { error: "Greška pri generisanju fajla." },
      { status: 500 }
    );
  }
}
