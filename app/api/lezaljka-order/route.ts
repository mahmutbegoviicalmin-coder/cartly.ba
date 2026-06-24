import { NextRequest } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";

const BOSNIAN_MONTHS = [
  "januar", "februar", "mart", "april", "maj", "juni",
  "juli", "august", "septembar", "oktobar", "novembar", "decembar",
];

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `LEZ-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const day = date.getDate();
  const month = BOSNIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${day}. ${month} ${year}. u ${hh}:${mm}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " KM";
}

const COLOR_LABELS: Record<string, string> = {
  "tamno-zelena": "Tamno Zelena",
  "bordo": "Bordo",
  "crna": "Crna",
};

const COLOR_HEX: Record<string, string> = {
  "tamno-zelena": "#1B4332",
  "bordo": "#7B1D2A",
  "crna": "#1A1A1A",
};

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, postanski_broj, boja, kolicina, externalId } = body;

    const now = new Date();
    const orderNumber = generateOrderNumber(now);
    const dateBosnian = formatDateBosnian(now);

    const PRICE = 69.9;
    const DELIVERY = 10.0;
    const cijenaProizvoda = PRICE * kolicina;
    const ukupno = cijenaProizvoda + DELIVERY;
    const colorLabel = COLOR_LABELS[boja] ?? boja;
    const colorHex = COLOR_HEX[boja] ?? "#000";
    const fullAdresa = postanski_broj ? `${adresa}, ${postanski_broj} ${grad}` : `${adresa}, ${grad}`;

    // 1. Save to Supabase
    const { error: dbError } = await getSupabaseAdmin().from("lezaljka_orders").insert({
      ime,
      telefon,
      adresa: fullAdresa,
      grad,
      boja,
      kolicina,
      cijena_proizvoda: cijenaProizvoda,
      dostava: DELIVERY,
      ukupno,
      status: "nova",
      order_number: orderNumber,
    });

    if (dbError) {
      console.error("Supabase lezaljka insert error:", dbError.message);
    }

    // 2. Meta CAPI
    sendCAPIEvent({
      eventId: orderNumber,
      eventName: "Purchase",
      value: ukupno,
      currency: "BAM",
      contentName: "Premium Lezaljka",
      phone: telefon,
      ip: getClientIP(request),
      userAgent: getClientUA(request),
      fbc: getFbc(request),
      fbp: getFbp(request),
      externalId: externalId || "",
    }).catch(console.error);

    // 3. Send email via Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.OWNER_EMAIL!,
      subject: `#NARUDZBA [LEZALJKA] - ${ime} - ${colorLabel} ×${kolicina} - ${sarajevoTime(now)}`,
      html: `
<!DOCTYPE html>
<html lang="bs">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%);border-radius:12px 12px 0 0;padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;">Nova narudžba</p>
              <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">Premium Lezaljka</h1>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">Boja: ${colorLabel}</p>
            </td>
            <td align="right" style="vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.6);text-align:right;">Broj narudžbe</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;text-align:right;letter-spacing:0.02em;">${orderNumber}</p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.65);text-align:right;">${dateBosnian}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="background:#ffffff;padding:32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">

        <!-- Boja swatch -->
        <div style="display:inline-flex;align-items:center;gap:10px;background:#F7F7F7;border-radius:10px;padding:10px 16px;margin-bottom:24px;">
          <div style="width:22px;height:22px;border-radius:6px;background:${colorHex};border:1px solid rgba(0,0,0,0.15);flex-shrink:0;"></div>
          <span style="font-size:14px;font-weight:700;color:#0A0A0A;">${colorLabel} · ${kolicina} kom</span>
        </div>

        <!-- Podaci kupca -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#2D6A4F;text-transform:uppercase;letter-spacing:0.1em;">Podaci kupca</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[["Ime i prezime", ime], ["Telefon", telefon], ["Adresa", fullAdresa], ["Grad", grad]].map(([label, val]) => `
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${val}</p>
            </div>
          </td></tr>`).join("")}
        </table>

        <!-- Financijski pregled -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#2D6A4F;text-transform:uppercase;letter-spacing:0.1em;">Financijski pregled</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#FAFAFA;">
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">${kolicina}× Premium Lezaljka (${colorLabel})</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">${fmt(cijenaProizvoda)}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">Dostava</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">10,00 KM</td>
          </tr>
          <tr style="background:#F0FAF4;">
            <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#0A0A0A;">UKUPNO</td>
            <td style="padding:14px 16px;font-size:20px;font-weight:800;color:#1B4332;text-align:right;">${fmt(ukupno)}</td>
          </tr>
        </table>

        <!-- Akcija -->
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="tel:${telefon}" style="display:inline-block;padding:12px 22px;background:#F0F0F0;color:#0A0A0A;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">📞 Pozovi kupca</a>
            </td>
            <td>
              <a href="https://cartlyba.vercel.app/admin/dashboard" style="display:inline-block;padding:12px 22px;background:#1B4332;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">✅ Potvrdi narudžbu</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#F9F9F9;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0A0A0A;">Cartly.ba</p>
        <p style="margin:0;font-size:11px;color:#aaa;">Narudžba primljena: ${dateBosnian}</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>

</body>
</html>
      `,
    });

    return Response.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Lezaljka order error:", error);
    return Response.json({ success: false, error: "Greška pri slanju narudžbe." }, { status: 500 });
  }
}
