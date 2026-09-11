import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";

const UNIT_PRICE = 59.90;
const DELIVERY   = 0;
const ALLOWED_SIZES = new Set([41, 42, 43, 44, 45, 46, 47]);
const CONTENT_NAME = "Aeox Plus S3 Radne Patike";
const CONTENT_IDS  = ["radne-patike-aeox"];

type SizeLine = { velicina: number; kolicina: number };

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `AEX-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}. u ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

function fmtKM(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

function parseLines(body: Record<string, unknown>): SizeLine[] {
  const raw = body.velicine;
  if (Array.isArray(raw) && raw.length > 0) {
    return (raw as { velicina?: unknown; kolicina?: unknown }[])
      .map((v) => ({
        velicina: Number(v.velicina),
        kolicina: Math.max(1, Math.min(5, Number(v.kolicina) || 1)),
      }))
      .filter((v) => ALLOWED_SIZES.has(v.velicina));
  }
  const size = Number(body.velicina);
  const qty  = Math.max(1, Math.min(5, Number(body.kolicina) || 1));
  return ALLOWED_SIZES.has(size) ? [{ velicina: size, kolicina: qty }] : [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, externalId } = body as {
      ime?: string; telefon?: string; adresa?: string; grad?: string; externalId?: string;
    };

    if (!ime || !telefon || !adresa || !grad) {
      return NextResponse.json({ success: false, error: "Nedostaju obavezna polja." }, { status: 400 });
    }

    const lines = parseLines(body);
    if (lines.length === 0) {
      return NextResponse.json({ success: false, error: "Odaberite veličinu (41-47)." }, { status: 400 });
    }

    const qty = lines.reduce((s, l) => s + l.kolicina, 0);
    const cijena_proizvoda = qty * UNIT_PRICE;
    const ukupno = cijena_proizvoda + DELIVERY;
    const now = new Date();
    const orderNumber = generateOrderNumber(now);
    const sizeLabel = lines.map((l) => `EU${l.velicina}x${l.kolicina}`).join(" ");

    const { error: dbError } = await getSupabaseAdmin()
      .from("orders")
      .insert({
        ime,
        telefon,
        adresa,
        grad,
        velicine: lines.map((l) => ({
          velicina: `Aeox Plus S3 - br. ${l.velicina}`,
          kolicina: l.kolicina,
        })),
        ukupno_pari: qty,
        cijena_proizvoda,
        dostava: DELIVERY,
        ukupno,
        status: "nova",
        order_number: orderNumber,
      });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json({ success: false, error: `DB greška: ${dbError.message}` }, { status: 500 });
    }

    sendCAPIEvent({
      eventId:     orderNumber,
      eventName:   "Purchase",
      value:       ukupno,
      currency:    "BAM",
      contentName: CONTENT_NAME,
      contentIds:  CONTENT_IDS,
      numItems:    qty,
      phone:       telefon,
      ip:          getClientIP(request),
      userAgent:   getClientUA(request),
      fbc:         getFbc(request),
      fbp:         getFbp(request),
      externalId:  typeof externalId === "string" ? externalId : "",
    }).catch(console.error);

    try {
      const ownerEmail = process.env.OWNER_EMAIL;
      if (!ownerEmail) {
        console.error("[aeox-order] OWNER_EMAIL missing - Resend skipped");
      } else {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const sent = await resend.emails.send({
          from: "Cartly.ba <onboarding@resend.dev>",
          to: ownerEmail,
          subject: `#NARUDZBA [AEOX PLUS S3] - ${ime} - ${sizeLabel} - ${sarajevoTime(now)}`,
          html: `
            <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #F0F0F0;">
              <div style="background: #111; padding: 32px 40px;">
                <h1 style="color:#fff; margin:0; font-size:22px; font-weight:800; letter-spacing:-0.02em;">Nova narudžba</h1>
                <p style="color:rgba(255,255,255,0.6); margin:6px 0 0; font-size:13px;">${orderNumber} &nbsp;·&nbsp; ${formatDateBosnian(now)}</p>
              </div>
              <div style="padding: 32px 40px;">
                <h2 style="font-size:13px; font-weight:600; color:#999; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Podaci kupca</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  ${[["Ime i prezime", ime], ["Telefon", telefon], ["Adresa", adresa], ["Grad", grad]].map(([lbl, val]) => `
                  <tr><td style="padding-bottom:8px;">
                    <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
                      <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;">${lbl}</p>
                      <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${val}</p>
                    </div>
                  </td></tr>`).join("")}
                </table>
                <h2 style="font-size:13px; font-weight:600; color:#999; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 16px;">Narudžba</h2>
                <table style="width:100%; border-collapse:collapse;">
                  <tr><td style="padding:7px 0; color:#888; font-size:14px; width:140px;">Proizvod</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${CONTENT_NAME}</td></tr>
                  <tr><td style="padding:7px 0; color:#888; font-size:14px;">Brojevi</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${sizeLabel}</td></tr>
                  <tr><td style="padding:7px 0; color:#888; font-size:14px;">Količina</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${qty}×</td></tr>
                  <tr><td style="padding:7px 0; color:#888; font-size:14px;">Cijena</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${fmtKM(cijena_proizvoda)}</td></tr>
                  <tr><td style="padding:7px 0; color:#888; font-size:14px;">Dostava</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#16A34A;">Besplatno</td></tr>
                  <tr style="border-top:2px solid #F0F0F0;">
                    <td style="padding:14px 0 0; color:#0A0A0A; font-size:15px; font-weight:700;">Ukupno</td>
                    <td style="padding:14px 0 0; color:#111; font-size:20px; font-weight:800;">${fmtKM(ukupno)}</td>
                  </tr>
                </table>
              </div>
              <div style="background:#F9F9F9; padding:20px 40px; border-top:1px solid #F0F0F0;">
                <p style="font-size:12px; color:#aaa; margin:0;">Plaćanje pouzećem · Euro Express · 1-3 radna dana</p>
              </div>
            </div>
          `,
        });
        if (sent.error) console.error("[aeox-order] Resend error:", sent.error);
      }
    } catch (emailErr) {
      console.error("[aeox-order] Email send error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Aeox order route error:", err);
    return NextResponse.json({ success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." }, { status: 500 });
  }
}
