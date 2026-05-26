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
  return `MSN-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const day   = date.getDate();
  const month = BOSNIAN_MONTHS[date.getMonth()];
  const year  = date.getFullYear();
  const hh    = String(date.getHours()).padStart(2, "0");
  const mm    = String(date.getMinutes()).padStart(2, "0");
  return `${day}. ${month} ${year}. u ${hh}:${mm}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).format(date);
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " KM";
}

const PRICE_BASE = 89.90;
const DELIVERY   = 10.00;

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, kolicina = 1, externalId } = body as {
      ime: string; telefon: string; adresa: string; grad: string;
      kolicina: number; externalId?: string;
    };

    const now             = new Date();
    const orderNumber     = generateOrderNumber(now);
    const dateBosnian     = formatDateBosnian(now);
    const cijenaProizvoda = PRICE_BASE * kolicina;
    const ukupno          = cijenaProizvoda + DELIVERY;

    // 1. Save to Supabase
    const { error: dbError } = await getSupabaseAdmin().from("masina_orders").insert({
      ime, telefon, adresa, grad,
      kolicina,
      cijena_proizvoda: cijenaProizvoda,
      dostava:          DELIVERY,
      ukupno,
      status:           "nova",
      order_number:     orderNumber,
    });
    if (dbError) console.error("Supabase insert error:", dbError.message);

    // 2. Meta CAPI
    sendCAPIEvent({
      eventId:     orderNumber,
      eventName:   "Purchase",
      value:       ukupno,
      currency:    "BAM",
      contentName: "Masina za Sisanje Ovaca 1200W",
      phone:       telefon,
      ip:          getClientIP(request),
      userAgent:   getClientUA(request),
      fbc:         getFbc(request),
      fbp:         getFbp(request),
      externalId:  externalId || "",
    }).catch(console.error);

    // 3. Email
    await resend.emails.send({
      from:    "onboarding@resend.dev",
      to:      process.env.OWNER_EMAIL!,
      subject: `#NARUDZBA [MASINA] · ${ime} · ${kolicina}x · ${sarajevoTime(now)}`,
      html: `
<!DOCTYPE html>
<html lang="bs">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <tr>
      <td style="background:#FF6B00;border-radius:12px 12px 0 0;padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;">Nova narudžba</p>
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#fff;">Mašina za Šišanje Ovaca 1200W</h1>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">Profesionalni set · Kofer · Rezervni nož · Mazivo</p>
          </td>
          <td align="right" style="vertical-align:top;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.6);text-align:right;">Broj narudžbe</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#fff;text-align:right;">${orderNumber}</p>
            <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.65);text-align:right;">${dateBosnian}</p>
          </td>
        </tr></table>
      </td>
    </tr>

    <tr>
      <td style="background:#fff;padding:32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">

        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Podaci kupca</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[
            { label: "Ime i prezime", value: ime },
            { label: "Telefon",       value: telefon },
            { label: "Adresa",        value: adresa },
            { label: "Grad",          value: grad },
          ].map(r => `
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;letter-spacing:0.08em;">${r.label}</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${r.value}</p>
            </div>
          </td></tr>`).join("")}
        </table>

        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Narudžba</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#FAFAFA;">
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #F0F0F0;">Proizvod</td>
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #F0F0F0;text-align:right;">Cijena</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #F0F0F0;">${kolicina}x Mašina za šišanje ovaca 1200W (komplet set)</td>
            <td style="padding:12px 16px;font-size:14px;color:#0A0A0A;font-weight:600;text-align:right;border-bottom:1px solid #F0F0F0;">${fmt(cijenaProizvoda)}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">Dostava</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">${fmt(DELIVERY)}</td>
          </tr>
          <tr style="background:#FFF8F5;">
            <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#0A0A0A;">UKUPNO</td>
            <td style="padding:14px 16px;font-size:20px;font-weight:800;color:#FF6B00;text-align:right;">${fmt(ukupno)}</td>
          </tr>
        </table>

        <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Akcija</p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:12px;">
            <a href="tel:${telefon}" style="display:inline-block;padding:12px 22px;background:#F0F0F0;color:#0A0A0A;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
              Pozovi kupca
            </a>
          </td>
          <td>
            <a href="https://cartlyba.vercel.app/admin/dashboard" style="display:inline-block;padding:12px 22px;background:#FF6B00;color:#fff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
              Potvrdi narudžbu
            </a>
          </td>
        </tr></table>

      </td>
    </tr>

    <tr>
      <td style="background:#F9F9F9;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0A0A0A;">Cartly.ba · Mašina za šišanje ovaca</p>
        <p style="margin:0;font-size:11px;color:#aaa;">Narudžba primljena: ${dateBosnian}</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`,
    });

    return Response.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Masina order error:", error);
    return Response.json({ success: false, error: "Greška pri slanju narudžbe." }, { status: 500 });
  }
}
