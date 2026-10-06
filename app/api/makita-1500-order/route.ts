import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";
import { guardCustomerOrder } from "@/lib/order-guard";
import { stampIp } from "@/lib/order-ip";

const UNIT_PRICE = 57.9;
const GIFT_PRICE = 5;
const DELIVERY   = 0;
const PRODUCT    = "Makita Brusilica 1500W";
const CONTENT_ID = "makita-brusilica-1500w";
const ACCENT     = "#00838F";

function generateOrderNumber(date: Date): string {
  const y    = date.getFullYear();
  const m    = String(date.getMonth() + 1).padStart(2, "0");
  const d    = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `MKK-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo", day: "numeric", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}. ${months[Number(get("month")) - 1]} ${get("year")}. u ${get("hour")}:${get("minute")}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function esc(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c
  ));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guarded = await guardCustomerOrder(request, body, { requirePrezime: true, requirePostal: true });
    if (!guarded.ok) return guarded.response;
    const { ime, imeFirst, prezime, telefon, adresa, grad, postanski } = guarded.fields;
    const { poklon, externalId, sourceUrl } = body as {
      poklon?: boolean; externalId?: string; sourceUrl?: string;
    };

    const gift             = poklon === true;
    const cijena_proizvoda = UNIT_PRICE + (gift ? GIFT_PRICE : 0);
    const ukupno           = cijena_proizvoda + DELIVERY;
    const now              = new Date();
    const orderNumber      = generateOrderNumber(now);
    const label            = gift ? `${PRODUCT} + Poklon iznenađenja` : PRODUCT;

    const { error: dbError } = await getSupabaseAdmin()
      .from("orders")
      .insert({
        ime,
        telefon,
        adresa: stampIp(`${adresa}, ${postanski}`, guarded.fields.ip),
        grad,
        velicine:        [{ velicina: label, kolicina: 1 }],
        ukupno_pari:     1,
        cijena_proizvoda,
        dostava:         DELIVERY,
        ukupno,
        status:          "nova",
        order_number:    orderNumber,
      });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { success: false, error: "Greška pri spremanju narudžbe. Pokušajte ponovo." },
        { status: 500 }
      );
    }

    // ── Meta CAPI (deduplicated with the browser Purchase via orderNumber) ──
    sendCAPIEvent({
      eventId:     orderNumber,
      eventName:   "Purchase",
      value:       ukupno,
      currency:    "BAM",
      contentName: label,
      contentIds:  gift ? [CONTENT_ID, `${CONTENT_ID}-poklon`] : [CONTENT_ID],
      numItems:    gift ? 2 : 1,
      phone:       telefon,
      firstName:   imeFirst,
      lastName:    prezime,
      city:        grad,
      country:     "ba",
      sourceUrl:   typeof sourceUrl === "string" ? sourceUrl.slice(0, 500) : undefined,
      ip:          getClientIP(request),
      userAgent:   getClientUA(request),
      fbc:         getFbc(request),
      fbp:         getFbp(request),
      externalId:  typeof externalId === "string" ? externalId : "",
    }).catch(console.error);

    // ── Owner email ──
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: mailError } = await resend.emails.send({
        from:    "Cartly.ba <onboarding@resend.dev>",
        to:      process.env.OWNER_EMAIL!,
        subject: `#NARUDZBA [MAKITA 1500W${gift ? " + POKLON" : ""}] - ${ime} - ${fmtKM(ukupno)} - ${sarajevoTime(now)}`,
        html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #F0F0F0;">
  <div style="background:${ACCENT};padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Nova narudžba${gift ? " 🎁" : ""}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${orderNumber} · ${formatDateBosnian(now)}</p>
  </div>
  <div style="padding:32px 40px;">
    ${gift ? `<div style="background:#E6F4F5;border:1.5px solid ${ACCENT};border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:15px;font-weight:800;color:${ACCENT};">🎁 KUPAC JE ODABRAO POKLON IZNENAĐENJA (+${fmtKM(GIFT_PRICE)})</p>
      <p style="margin:4px 0 0;font-size:13px;color:#0A0A0A;">Ubaciti poklon u paket.</p>
    </div>` : ""}
    <h2 style="font-size:13px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Podaci kupca</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["Ime i prezime", esc(ime)],
        ["Telefon", esc(telefon)],
        ["Adresa", esc(adresa)],
        ["Grad", esc(grad)],
        ["Poštanski broj", esc(postanski)],
      ].map(([lbl, val]) => `
      <tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;letter-spacing:0.08em;">${lbl}</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;">${val}</p>
        </div>
      </td></tr>`).join("")}
    </table>
    <h2 style="font-size:13px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">Narudžba</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:7px 0;color:#888;font-size:14px;width:160px;">Proizvod</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">${PRODUCT}</td></tr>
      <tr><td style="padding:7px 0;color:#888;font-size:14px;">Cijena</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">${fmtKM(UNIT_PRICE)}</td></tr>
      ${gift ? `<tr><td style="padding:7px 0;color:#888;font-size:14px;">🎁 Poklon iznenađenja</td><td style="padding:7px 0;font-weight:700;font-size:14px;color:${ACCENT};">DA · +${fmtKM(GIFT_PRICE)}</td></tr>` : ""}
      <tr><td style="padding:7px 0;color:#888;font-size:14px;">Dostava</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">Besplatna</td></tr>
      <tr style="border-top:2px solid #F0F0F0;">
        <td style="padding:14px 0 0;color:#0A0A0A;font-size:15px;font-weight:700;">Ukupno (pouzeće)</td>
        <td style="padding:14px 0 0;color:${ACCENT};font-size:20px;font-weight:800;">${fmtKM(ukupno)}</td>
      </tr>
    </table>
  </div>
  <div style="background:#F9F9F9;padding:20px 40px;border-top:1px solid #F0F0F0;">
    <p style="font-size:12px;color:#aaa;margin:0;">Plaćanje pouzećem · Besplatna dostava · 1 do 3 radna dana</p>
  </div>
</div>`,
      });
      if (mailError) console.error("Resend error:", mailError);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Makita 1500W order route error:", err);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
