// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers for courier exports (X Express + Skytec Express)
//
// One place for: PTT lookup, city-name correction, the product registry, order
// fetching per product, and the two workbook builders.
// ─────────────────────────────────────────────────────────────────────────────
import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import pttData from "@/data/ptt-bih.json";
import { PRODUCTS, findProduct, type ProductDef } from "@/lib/export-products";

export { PRODUCTS, findProduct };
export type { ProductDef };

// ── PTT / city helpers ───────────────────────────────────────────────────────

/** Strip diacritics + lowercase → accent-insensitive matching. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Primary-city PTT overrides — win over ptt-bih.json (which has sub-office codes).
const CITY_PTT_OVERRIDE: Record<string, string> = {
  "sarajevo": "71000", "banja luka": "78000", "tuzla": "75000", "zenica": "72000",
  "mostar": "88000", "bijeljina": "76300", "brcko": "76100", "brcko distrikt": "76100",
  "prijedor": "79101", "trebinje": "89101", "doboj": "74000", "cazin": "77220",
  "bihac": "77000", "travnik": "72270", "visoko": "71300", "kakanj": "72240",
  "livno": "80101", "gorazde": "73000", "zvornik": "75400", "konjic": "88400",
  "bugojno": "70230", "gracanica": "75320", "lukavac": "75300", "gradacac": "76250",
  "orasje": "76270", "vitez": "72250", "srebrenica": "75430", "jajce": "70101",
  "zavidovici": "72220", "maglaj": "74250", "tesanj": "74260", "teslic": "74270",
  "derventa": "74400", "modrica": "74480", "gradiska": "78400", "prnjavor": "78430",
  "srbac": "78420", "laktasi": "78250", "mrkonjic grad": "70260", "sipovo": "70270",
  "kljuc": "79280", "sanski most": "79260", "novi grad": "79220", "kozarska dubica": "79240",
  "ljubuski": "88320", "citluk": "88260", "capljina": "88300", "siroki brijeg": "88220",
  "grude": "88340", "posusje": "88240", "stolac": "88360", "neum": "88390",
  "jablanica": "88420", "prozor": "88440", "prozor rama": "88440", "velika kladusa": "77230",
  "ilidza": "71210", "vogosca": "71320", "hadzici": "71240", "ilijas": "71380",
  "breza": "71370", "vares": "71330", "olovo": "71340", "fojnica": "71270",
  "kresevo": "71260", "kiseljak": "71250", "busovaca": "72260", "novi travnik": "72290",
  "turbe": "72270", "srebrenik": "75350", "kladanj": "75280", "kalesija": "75260",
  "lopare": "75240", "celic": "75246", "banovici": "75290", "zivinice": "75270",
  "tarcin": "71244", "pazaric": "71243",
};

const PTT_MAP = new Map<string, string>(
  (pttData as { mjesto: string; ptt: string }[]).map(({ mjesto, ptt }) => [normalize(mjesto), ptt])
);

/** Lookup order: override → ptt-bih.json → "" */
export function lookupPTT(grad: string): string {
  if (!grad) return "";
  const key = normalize(grad);
  return CITY_PTT_OVERRIDE[key] ?? PTT_MAP.get(key) ?? "";
}

// City names typed without diacritics → proper Bosnian spelling.
const CITY_PROPER_NAME: Record<string, string> = {
  "sarajevo": "Sarajevo", "banja luka": "Banja Luka", "tuzla": "Tuzla", "zenica": "Zenica",
  "mostar": "Mostar", "bijeljina": "Bijeljina", "brcko": "Brčko", "brcko distrikt": "Brčko Distrikt",
  "prijedor": "Prijedor", "trebinje": "Trebinje", "doboj": "Doboj", "cazin": "Cazin",
  "bihac": "Bihać", "travnik": "Travnik", "visoko": "Visoko", "kakanj": "Kakanj",
  "livno": "Livno", "gorazde": "Goražde", "zvornik": "Zvornik", "konjic": "Konjic",
  "bugojno": "Bugojno", "gracanica": "Gračanica", "lukavac": "Lukavac", "gradacac": "Gradačac",
  "orasje": "Orašje", "vitez": "Vitez", "srebrenica": "Srebrenica", "jajce": "Jajce",
  "zavidovici": "Zavidovići", "maglaj": "Maglaj", "tesanj": "Tešanj", "teslic": "Teslić",
  "derventa": "Derventa", "modrica": "Modriča", "gradiska": "Gradiška", "prnjavor": "Prnjavor",
  "srbac": "Srbac", "laktasi": "Laktaši", "mrkonjic grad": "Mrkonjić Grad", "sipovo": "Šipovo",
  "kljuc": "Ključ", "sanski most": "Sanski Most", "novi grad": "Novi Grad",
  "kozarska dubica": "Kozarska Dubica", "ljubuski": "Ljubuški", "citluk": "Čitluk",
  "capljina": "Čapljina", "siroki brijeg": "Široki Brijeg", "grude": "Grude", "posusje": "Posušje",
  "stolac": "Stolac", "neum": "Neum", "jablanica": "Jablanica", "prozor": "Prozor",
  "prozor rama": "Prozor-Rama", "velika kladusa": "Velika Kladuša", "ilidza": "Ilidža",
  "vogosca": "Vogošća", "hadzici": "Hadžići", "ilijas": "Ilijaš", "breza": "Breza",
  "vares": "Vareš", "olovo": "Olovo", "fojnica": "Fojnica", "kresevo": "Kreševo",
  "kiseljak": "Kiseljak", "busovaca": "Busovača", "novi travnik": "Novi Travnik", "turbe": "Turbe",
  "srebrenik": "Srebrenik", "kladanj": "Kladanj", "kalesija": "Kalesija", "lopare": "Lopare",
  "celic": "Čelić", "banovici": "Banovići", "zivinice": "Živinice", "tarcin": "Tarčin",
  "pazaric": "Pazarić", "kotor varos": "Kotor Varoš", "tomislavgrad": "Tomislavgrad",
  "zepce": "Žepče", "foca": "Foča", "visegrad": "Višegrad", "pale": "Pale", "sokolac": "Sokolac",
};

export function correctCityName(grad: string): string {
  if (!grad) return "";
  return CITY_PROPER_NAME[normalize(grad)] ?? grad;
}

// ── Product registry ─────────────────────────────────────────────────────────
// PRODUCTS / findProduct / ProductDef live in ./export-products (dependency-free
// so the admin dashboard can import the same list) and are re-exported above.

type Source = ProductDef["source"];

// Short courier-friendly package descriptions, keyed by order_number prefix.
const PREFIX_OPIS: Record<string, string> = {
  MLW: "Milwaukee M18 Bušilica", MS3: "Milwaukee Set 3.1", DWL: "DeWalt Set", DWT: "DeWalt Set",
  S2U: "Set 2 u 1", BRS: "Brusilica", ZQS: "Zvučnik", KMR: "Kamera",
  ZRF: "Žirafa Brusilica za Zidove", APP: "AirPods Pro", HMR: "Hammer S3 Patike",
  RCH: "Richeng S3 Patike", PAT: "Richeng S3 Patike", PRS: "Prsluk za spašavanje",
};

const COLOR_LABELS: Record<string, string> = {
  "maslinasto-siva": "Tamno maslinasto siva", "siva": "Siva",
  "tamno-zelena": "Tamno Zelena", "bordo": "Bordo", "crna": "Crna",
};

// ── Normalised order shape used by both builders ─────────────────────────────

export type NormOrder = {
  ime: string;
  telefon: string;
  adresa: string;
  grad: string;
  ukupno: number;
  order_number: string;
  opis: string;   // package description
  units: number;  // physical items → weight (kg) + package count
};

type Velicina = { velicina: number | string; kolicina: number };

function totalUnits(velicine: Velicina[]): number {
  const n = (velicine ?? []).reduce((s, v) => s + (Number(v.kolicina) || 0), 0);
  return Math.max(1, n);
}

/** Description for a row that lives in the `orders` table. */
function ordersOpis(orderNumber: string, velicine: Velicina[]): string {
  const prefix = (orderNumber ?? "").slice(0, 3).toUpperCase();

  if (prefix === "CRT") {
    const active = (velicine ?? []).filter((v) => v.kolicina > 0);
    if (active.length === 0) return "Patike S3";
    if (active.length === 1 && active[0].kolicina === 1) return `Patike EU${active[0].velicina}`;
    return active.map((v) => `EU${v.velicina}×${v.kolicina}`).join(" ");
  }

  if (PREFIX_OPIS[prefix]) return PREFIX_OPIS[prefix];

  // Fallback: the label stored on the order line itself.
  const raw = velicine?.[0]?.velicina;
  return typeof raw === "string" && raw ? raw : "Paket";
}

// ── Order fetching ───────────────────────────────────────────────────────────

const BASE_COLS = "ime, telefon, adresa, grad, ukupno, order_number, status, created_at";

type Sb = SupabaseClient;

async function fetchFromOrders(
  sb: Sb, dayStart: string, dayEnd: string, prefixes?: string[]
): Promise<NormOrder[]> {
  let q = sb.from("orders")
    .select(`${BASE_COLS}, velicine`)
    .gte("created_at", dayStart).lte("created_at", dayEnd)
    .neq("status", "cancelled");

  if (prefixes && prefixes.length > 0) {
    q = q.or(prefixes.map((p) => `order_number.ilike.${p}-%`).join(","));
  }

  const { data, error } = await q.order("created_at", { ascending: true });
  if (error) throw error;

  return ((data ?? []) as (Record<string, unknown> & { velicine?: Velicina[] })[]).map((o) => {
    const velicine = o.velicine ?? [];
    return {
      ime: String(o.ime ?? ""),
      telefon: String(o.telefon ?? ""),
      adresa: String(o.adresa ?? ""),
      grad: String(o.grad ?? ""),
      ukupno: Number(o.ukupno ?? 0),
      order_number: String(o.order_number ?? ""),
      opis: ordersOpis(String(o.order_number ?? ""), velicine),
      units: totalUnits(velicine),
    };
  });
}

async function fetchFromAux(
  sb: Sb, source: Exclude<Source, "orders">, dayStart: string, dayEnd: string
): Promise<NormOrder[]> {
  const extraCols: Record<typeof source, string> = {
    cetka_orders: "broj_setova",
    komarnik_orders: "bundle, bundle_label",
    usmjerivac_orders: "bundle, bundle_label",
    lezaljka_orders: "boja, kolicina",
    masina_orders: "kolicina",
  };

  const { data, error } = await sb.from(source)
    .select(`${BASE_COLS}, ${extraCols[source]}`)
    .gte("created_at", dayStart).lte("created_at", dayEnd)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return ((data ?? []) as Record<string, unknown>[]).map((o) => {
    let opis = "Paket";
    let units = 1;
    if (source === "cetka_orders") {
      units = Math.max(1, Number(o.broj_setova) || 1);
      opis = "Čelična Četka 1+1";
    } else if (source === "komarnik_orders") {
      units = Math.max(1, Number(o.bundle) || 1);
      opis = `Komarnik ${String(o.bundle_label ?? "")}`.trim();
    } else if (source === "usmjerivac_orders") {
      units = Math.max(1, Number(o.bundle) || 1);
      opis = `Usmjerivač ${String(o.bundle_label ?? "")}`.trim();
    } else if (source === "lezaljka_orders") {
      units = Math.max(1, Number(o.kolicina) || 1);
      const boja = String(o.boja ?? "");
      opis = `Ležaljka ${COLOR_LABELS[boja] ?? boja} x${units}`;
    } else if (source === "masina_orders") {
      units = Math.max(1, Number(o.kolicina) || 1);
      opis = "Mašina za šišanje ovaca";
    }
    return {
      ime: String(o.ime ?? ""),
      telefon: String(o.telefon ?? ""),
      adresa: String(o.adresa ?? ""),
      grad: String(o.grad ?? ""),
      ukupno: Number(o.ukupno ?? 0),
      order_number: String(o.order_number ?? ""),
      opis,
      units,
    };
  });
}

/**
 * Fetch normalised orders for a product key (or "svi" for every product) on a
 * given YYYY-MM-DD date.
 */
export async function fetchOrders(sb: Sb, productKey: string, date: string): Promise<NormOrder[]> {
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  if (productKey === "svi") {
    const auxSources: Exclude<Source, "orders">[] = [
      "cetka_orders", "komarnik_orders", "usmjerivac_orders", "lezaljka_orders", "masina_orders",
    ];
    const results = await Promise.all([
      fetchFromOrders(sb, dayStart, dayEnd),
      ...auxSources.map((s) => fetchFromAux(sb, s, dayStart, dayEnd)),
    ]);
    return results.flat();
  }

  const product = findProduct(productKey);
  if (!product) throw new Error(`Nepoznat proizvod: ${productKey}`);

  return product.source === "orders"
    ? fetchFromOrders(sb, dayStart, dayEnd, product.prefixes)
    : fetchFromAux(sb, product.source, dayStart, dayEnd);
}

// ── Workbook builders ────────────────────────────────────────────────────────

/** X Express format — single sheet, headers matching primer.xlsx. */
export function buildXExpress(rows: NormOrder[]): Buffer {
  const HEADERS = [
    "Naziv primaoca*", "Ulica/Adresa*", "Poštanski broj*", "Mjesto/Grad*",
    "Kontakt osoba*", "Telefon*", "Broj računa/eksterna šifra", "Vrsta pošiljke*",
    "Masa pošiljke*", "Broj paketa*", "Vrijednost*", "Opis pošiljke*",
    "Hitna pošiljka do (h)", "Otkupnina iznos", "Povratnica (da/ne)",
    "Osiguranje (da/ne)", "Dozvoljeno otvaranje (da/ne)", "Dostava vikendom (da/ne)",
    "Zamjenska pošiljka (da/ne)", "Povrat ambalaže (da/ne)", "", "",
  ];

  const dataRows = rows.map((o) => [
    o.ime,
    o.adresa,
    lookupPTT(o.grad),
    correctCityName(o.grad),
    (o.ime ?? "").split(" ")[0],
    o.telefon,
    o.order_number,
    "PAKET",
    o.units,
    o.units,
    0,
    o.opis,
    "",
    o.ukupno,
    "ne", "ne", "ne", "ne", "ne", "ne", "", "PAKET",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
  ws["!cols"] = [
    { wch: 28 }, { wch: 30 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
    { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 28 },
    { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 18 },
    { wch: 18 }, { wch: 18 }, { wch: 6 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/** Skytec Express format — Pošiljke + Legenda sheets, matching Posiljke.xlsx. */
export function buildSkytec(rows: NormOrder[]): Buffer {
  const HEADERS = [
    "Ime i prezime", "Ptt broj", "Adresa", "Mesto", "Telefon", "Referenca",
    "Tezina (kg)", "Broj paketa", "Otkupnina (BAM)", "(Ne koristi se)",
    "Napomena za dostavu", "Vrijednost pošiljke (BAM)", "Otezana dostava",
    "Povrat otpremnice", "(Ne koristi se)", "(Ne koristi se)", "Sadržaj pošiljke",
    "Kontakt osoba", "Otvaranje pošiljke", "Obveznik plaćanja", "Način plaćanja",
  ];

  const dataRows = rows.map((o) => [
    o.ime,
    lookupPTT(o.grad),
    o.adresa,
    correctCityName(o.grad),
    o.telefon,
    "",
    o.units,
    o.units,
    o.ukupno,
    "",
    "",
    0,
    0,
    0,
    "",
    "",
    o.opis,
    (o.ime ?? "").split(" ")[0],
    0,
    0,
    0,
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
  ws1["!cols"] = [
    { wch: 28 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 22 },
    { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 36 }, { wch: 22 },
    { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 36 }, { wch: 16 },
    { wch: 18 }, { wch: 18 }, { wch: 16 },
  ];

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Kolona", "Povrat otpremnice", "Obveznik plaćanja", "Način plaćanja"],
    ["Vrijednosti", "0-NE", "0-Pošiljalac", "0-Gotovinski"],
    ["", "1-DA", "1-Primalac (Trenutno nije dozvoljeno)", "1-Žiralno"],
  ]);
  ws2["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 42 }, { wch: 18 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Pošiljke");
  XLSX.utils.book_append_sheet(wb, ws2, "Legenda");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
