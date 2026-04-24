import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const BOSNIAN_MONTHS = [
  "januar", "februar", "mart", "april", "maj", "juni",
  "juli", "august", "septembar", "oktobar", "novembar", "decembar",
];

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `CRT-${y}${m}${d}-${rand}`;
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
    timeZone:  "Europe/Sarajevo",
    hour:      "2-digit",
    minute:    "2-digit",
    hour12:    false,
  }).format(date);
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, velicine } = body;

    const now = new Date();
    const orderNumber = generateOrderNumber(now);
    const dateBosnian = formatDateBosnian(now);

    const selectedSizes = (velicine as { velicina: number; kolicina: number }[]).filter(
      (v) => v.kolicina > 0
    );
    const ukupnoPari = selectedSizes.reduce((sum, v) => sum + v.kolicina, 0);
    const cijenaProizvoda = ukupnoPari * 59.9;
    const dostava = 10.0;
    const ukupno = cijenaProizvoda + dostava;

    // Build size rows for email
    const sizeRows = selectedSizes
      .map(
        (v) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #F5F5F5;font-size:14px;color:#0A0A0A;">EU ${v.velicina}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #F5F5F5;font-size:14px;color:#0A0A0A;">${v.kolicina} par${v.kolicina > 1 ? "a" : ""}</td>
        </tr>`
      )
      .join("");

    // 1. Save to Supabase
    const { error: dbError } = await getSupabaseAdmin().from("orders").insert({
      ime,
      telefon,
      adresa,
      grad,
      velicine: selectedSizes,
      ukupno_pari: ukupnoPari,
      cijena_proizvoda: cijenaProizvoda,
      dostava,
      ukupno,
      status: "nova",
      order_number: orderNumber,
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError.message);
    }

    // 2. Send email via Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.OWNER_EMAIL!,
      subject: `#NARUDZBA [PATIKE S3] - ${ime} - ${selectedSizes.map(v => `EU${v.velicina}×${v.kolicina}`).join(" ")} - ${sarajevoTime(now)}`,
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
      <td style="background:#FF6B00;border-radius:12px 12px 0 0;padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;">Nova narudžba</p>
              <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">Radne Patike S3</h1>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">Tactical Black</p>
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

        <!-- Section 1: Podaci kupca -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Podaci kupca</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Ime i prezime</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${ime}</p></td>
                <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
              </tr></table>
            </div>
          </td></tr>
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Telefon</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${telefon}</p></td>
                <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
              </tr></table>
            </div>
          </td></tr>
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Adresa</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${adresa}</p></td>
                <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
              </tr></table>
            </div>
          </td></tr>
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Grad</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${grad}</p></td>
                <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
              </tr></table>
            </div>
          </td></tr>
        </table>

        <!-- Section 2: Naručene veličine -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Naručene veličine</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#FAFAFA;">
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #F0F0F0;">Veličina</td>
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #F0F0F0;">Količina</td>
          </tr>
          ${sizeRows}
        </table>

        <!-- Section 3: Financijski pregled -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Financijski pregled</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <tr style="background:#FAFAFA;">
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">Cijena po paru</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">59,90 KM</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">Dostava</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">10,00 KM</td>
          </tr>
          <tr style="background:#FFF8F5;">
            <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#0A0A0A;">UKUPNO</td>
            <td style="padding:14px 16px;font-size:20px;font-weight:800;color:#FF6B00;text-align:right;">${fmt(ukupno)}</td>
          </tr>
        </table>

        <!-- Section 4: Akcija buttons -->
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Akcija</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="tel:${telefon}"
                style="display:inline-block;padding:12px 22px;background:#F0F0F0;color:#0A0A0A;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
                📞 Pozovi kupca
              </a>
            </td>
            <td>
              <a href="https://cartlyba.vercel.app/admin/dashboard"
                style="display:inline-block;padding:12px 22px;background:#FF6B00;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
                ✅ Potvrdi narudžbu
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- EMAIL FOOTER -->
    <tr>
      <td style="background:#F9F9F9;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0A0A0A;">Cartly.ba &bull; cartlyba.vercel.app</p>
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

    return Response.json({ success: true });
  } catch (error) {
    console.error("Order error:", error);
    return Response.json({ success: false, error: "Greška pri slanju narudžbe." }, { status: 500 });
  }
}
