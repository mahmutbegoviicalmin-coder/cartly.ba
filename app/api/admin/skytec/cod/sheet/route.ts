import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-auth";
import { readCodSheet, SHEET_BUCKET } from "@/lib/cod-sheet";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_PHOTOS = 4;

type Ship = {
  order_number: string; sky_sifra: string | null; ime: string | null; product_prefix: string | null;
  cod_amount: number; cod_paid_at: string | null; cod_presjek_at: string | null; state: string;
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const day = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
/** Parcel number from what was read: "11335224", "A004672195", or the otkupnina "O11335224". */
const parcelCode = (posiljka: string, otkupnina: string) => {
  const p = posiljka.replace(/\s/g, "").toUpperCase();
  if (p) return p;
  const o = otkupnina.replace(/\s/g, "").toUpperCase();
  return o.startsWith("O") ? o.slice(1) : o;
};

/**
 * POST multipart "photos" (JPEG, already downsized in the browser) → store the
 * photos, read the specification with Claude, compare with what we expect.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Za čitanje slike treba ANTHROPIC_API_KEY u Vercelu." }, { status: 503 });
  }
  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("photos") ?? []).filter((f): f is File => f instanceof File).slice(0, MAX_PHOTOS);
  if (!files.length) return NextResponse.json({ error: "Dodaj bar jednu sliku specifikacije." }, { status: 400 });

  const sb = getSupabaseAdmin();

  // 1. Keep the photos (private bucket; shown later through signed URLs).
  await sb.storage.createBucket(SHEET_BUCKET, { public: false }).catch(() => null);
  const images: { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }[] = [];
  const photos: string[] = [];
  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer());
    const mediaType = (["image/png", "image/webp"].includes(f.type) ? f.type : "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
    const path = `${day(new Date().toISOString())}/${randomUUID()}.${mediaType.split("/")[1]}`;
    const { error } = await sb.storage.from(SHEET_BUCKET).upload(path, buf, { contentType: mediaType });
    if (!error) photos.push(path);
    images.push({ data: buf.toString("base64"), mediaType });
  }

  // 2. Read the sheet.
  let sheet;
  try {
    sheet = await readCodSheet(images);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška pri čitanju slike.", photos }, { status: 502 });
  }

  // 3. Compare with the system.
  const read = sheet.pages.flatMap((p) => p.rows).map((r) => ({ ...r, code: parcelCode(r.posiljka, r.otkupnina) }))
    .filter((r) => r.code);
  const unique = new Map<string, (typeof read)[number]>();
  for (const r of read) if (!unique.has(r.code)) unique.set(r.code, r);
  const codes = Array.from(unique.keys());

  const ships: Ship[] = [];
  for (let i = 0; i < codes.length; i += 200) {
    const { data } = await sb.from("skytec_shipments")
      .select("order_number, sky_sifra, ime, product_prefix, cod_amount, cod_paid_at, cod_presjek_at, state")
      .in("sky_sifra", codes.slice(i, i + 200));
    ships.push(...((data ?? []) as Ship[]));
  }
  const bySifra = new Map(ships.map((s) => [s.sky_sifra!, s]));

  const rows = codes.map((code) => {
    const r = unique.get(code)!;
    const s = bySifra.get(code);
    const status = !s ? "nepoznato"
      : s.cod_paid_at ? "vec_preuzeto"
      : Math.abs(Number(s.cod_amount) - r.iznos) >= 0.01 ? "drugi_iznos"
      : "ok";
    return {
      code, otkupnina: r.otkupnina, eksterni: r.eksterni, posiljalac: r.posiljalac, iznos: r2(r.iznos),
      status, order_number: s?.order_number ?? null, ime: s?.ime ?? null,
      expected: s ? r2(Number(s.cod_amount)) : null,
      picked_at: s?.cod_paid_at ? day(s.cod_paid_at) : null,
    };
  });

  // Money Skytec already settled (otkupnina exists) that is not on this sheet.
  const since = new Date(Date.now() - 60 * 86400_000).toISOString();
  const { data: cods } = await sb.from("skytec_cod_payments")
    .select("sifra_otkupnine, sifra_izvorne_posiljke, iznos, status").neq("status", 10).gte("created_at", since);
  const pending = ((cods ?? []) as { sifra_otkupnine: string; sifra_izvorne_posiljke: string | null; iznos: number | null }[])
    .filter((c) => c.sifra_izvorne_posiljke && !unique.has(c.sifra_izvorne_posiljke));
  const pendingShips = new Map<string, Ship>();
  const pendingCodes = pending.map((c) => c.sifra_izvorne_posiljke!);
  for (let i = 0; i < pendingCodes.length; i += 200) {
    const { data } = await sb.from("skytec_shipments")
      .select("order_number, sky_sifra, ime, product_prefix, cod_amount, cod_paid_at, cod_presjek_at, state")
      .in("sky_sifra", pendingCodes.slice(i, i + 200));
    for (const s of (data ?? []) as Ship[]) pendingShips.set(s.sky_sifra!, s);
  }
  const notOnSheet = pending
    .map((c) => ({ c, s: pendingShips.get(c.sifra_izvorne_posiljke!) }))
    .filter(({ s }) => s && !s.cod_paid_at)
    .map(({ c, s }) => ({ code: c.sifra_izvorne_posiljke!, otkupnina: c.sifra_otkupnine, ime: s!.ime, order_number: s!.order_number, iznos: r2(Number(c.iznos ?? s!.cod_amount)) }));

  const printedCount = sheet.pages.reduce((a, p) => a + (p.broj_otkupnina ?? 0), 0);
  const printedAmount = r2(sheet.pages.reduce((a, p) => a + (p.iznos_otkupnina ?? 0), 0));
  const readAmount = r2(rows.reduce((a, r) => a + r.iznos, 0));

  return NextResponse.json({
    photos,
    dates: Array.from(new Set(sheet.pages.map((p) => p.datum).filter(Boolean))),
    rows,
    notOnSheet,
    totals: {
      printedCount: printedCount || null,
      printedAmount: printedAmount || null,
      readCount: rows.length,
      readAmount,
      // If these differ, a row was misread or a page is missing: check the photo.
      complete: !printedAmount || Math.abs(printedAmount - readAmount) < 0.01,
      toMark: rows.filter((r) => r.status === "ok" || r.status === "drugi_iznos").length,
    },
  });
}
